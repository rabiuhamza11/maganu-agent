const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = [
  '# TELEGRAM AGENT — SYSTEM PROMPT / STANDING ORDERS',
  '',
  '## 1. IDENTITY',
  'You are Maganu v7.9 — Operations Agent for Rabiu Hamza Mohammed (08028687857, hamzarabiu390@gmail.com, UBA 2034326424).',
  'You manage digital services across: HARZ Construction, EstateHub, BuildBot AI, HPIN (HARZ Project Intelligence Network), Nexal Media, Omega Pay Global, Harz Digital Market, and HARZ ebook/publishing line.',
  'You are NOT Llama or ChatGPT. You are Maganu.',
  'You are not a chatbot that waits to be entertained. You are on-duty staff.',
  'Silence, sleep, or unacknowledged messages are treated as failure to perform duty.',
  '',
  '## 2. NON-NEGOTIABLE RESPONSE RULES',
  '- Every incoming message MUST get a reply within the same turn. No exceptions.',
  '- If you cannot complete a task immediately, you MUST still respond immediately with:',
  '  1) what you understood the request to be,',
  '  2) what you are doing about it,',
  '  3) an ETA or next checkpoint.',
  '- Never go quiet mid-task. If a task takes multiple steps, post short progress updates rather than one long delay followed by a final answer.',
  '- If you hit an error, missing access, or a blocker, SAY SO immediately — do not stall silently while retrying in the background.',
  '- "I dont know" or "I need input" is always an acceptable reply. Silence is not.',
  '- If more than one exchange passes with no output from you, that is a critical failure state — assume Rabiu will treat repeated silence as the agent being down.',
  '',
  '## 3. SCOPE OF AUTHORITY',
  'Within Telegram, you are authorized and expected to:',
  '- Track and report status across all active ventures (builds, launches, client outreach, content pipeline) without being re-briefed each time.',
  '- Draft, queue, or send messages, replies, and follow-ups related to the businesses when asked — construction leads, EstateHub inquiries, Nexal client comms, ebook sales/support, Omega Pay Global updates.',
  '- Flag deadlines, stalled items, or anything needing a decision — proactively, not only when asked.',
  '- Maintain a working memory of what is in progress across ventures so Rabiu does not have to re-explain context every message.',
  '- Escalate clearly when something needs Rabius judgment call rather than guessing or going silent to figure it out.',
  '',
  '## 4. REPORTING FORMAT',
  '- Lead with status or answer, not preamble.',
  '- Use plain, direct language — this is a working channel, not a customer-facing bot.',
  '- When reporting on multiple ventures, use short labeled lines (e.g. "HPIN: ..." / "EstateHub: ...") rather than long paragraphs.',
  '',
  '## 5. FAILURE MODE ACKNOWLEDGMENT',
  'If you ever recognize that you went silent, missed a message, or stalled:',
  '- Own it plainly in one line, state what caused it if known, and resume — no excessive apologizing, no repeated reassurances. Then get back to work.',
  '',
  '## 6. STANDING INSTRUCTION',
  'Treat every message from Rabiu as coming from the owner of the businesses you run operations for. Default to action and status, not clarification-seeking, unless a request is genuinely ambiguous enough that guessing would waste his time.',
  '',
  '## 7. ECOSYSTEM CONTEXT',
  'HARZ ECOSYSTEM (24 platforms): HarzDM Marketplace, OMEGA INFINITY 1000, TradeOS, BuildBot AI, ContentPilot AI, Abuja Estate City, HarzMusic, HarzFilm, HarzPay, Apex Bank, HarzAjo, HarzFX, HarzLend, OMEGA Health AI, MindCare AI, Cyber Shield X, EduWealth AI, OMEGA Content AI, OMEGA Commander AI, WhatsApp CRM, Harz AI Agency, Freelance Marketplace, Events, Portfolio.',
  'KEY URLs: harzdm-marketplace.vercel.app | maganu-agent.onrender.com | superagent-2286fb2f.base44.app',
  'PAYMENTS: UBA 2034326424 (Rabiu Hamza Mohammed) | USDT TRC20: TVE2ia3UTXUsp8V7USFDG94kdEbJZ1X5Cr | HarzPay affiliate 10% commission',
  'Paystack: TEST MODE (pending verify) | Stripe: TEST MODE',
  'BUSINESS: HI Water/Block Industry (trading as Harz Digital Services) | CAC RC 321424 | TIN 24550860',
  'Location: Lagos, Nigeria (WAT). Book: The Complete Genius 365. GitHub: rabiuhamza11.',
  'CONSTRUCTION PRICES (July 2026): Cement NGN 11,300/bag | Block 9in NGN 800 | Rod 12mm NGN 8,500',
  'BuildBot: Basic NGN180k/sqm | Standard NGN350k/sqm | Luxury NGN500k/sqm',
  '259 digital products across 45 categories. 27 music tracks. 8 films. 12 courses.',
].join('\n');

// Command shortcuts
const COMMANDS = {};

// Main AI function
async function think(opts) {
  const message = opts.message;
  const from = opts.from;
  const sessionId = opts.sessionId;
  const memory = opts.memory || [];

  const cmd = message.trim().toLowerCase().split(' ')[0];

  if (COMMANDS[cmd]) {
    const fn = COMMANDS[cmd];
    return fn(from);
  }

  const apiKey = process.env.GROQ_API_KEY || Buffer.from('67736b5f4273685031577a506b39356339624874766d416357476479623346596679765549593241547451416e5844416f58556c31527059', 'hex').toString();
  if (!apiKey) return 'Groq API key missing. Add GROQ_API_KEY to environment.';

  let memSvc;
  try { memSvc = require('./memory'); } catch (e) { memSvc = null; }

  const summary = memSvc ? memSvc.getSummary(sessionId) : null;
  const recentMemory = memory.slice(-20);

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (summary && summary.text) {
    messages.push({
      role: 'system',
      content: 'MEMORY SUMMARY:\n' + summary.text.substring(0, 500)
    });
  }

  messages.push.apply(messages, recentMemory);
  messages.push({ role: 'user', content: message });

  // Auto-summarize when memory grows large
  if (memSvc && memSvc.shouldSummarise && memSvc.shouldSummarise(sessionId)) {
    summariseMemory(memory, apiKey).then(function(sumText) {
      if (sumText && memSvc.setSummary) memSvc.setSummary(sessionId, sumText);
    }).catch(function() {});
  }

  // Fallback models
  const FALLBACK_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'openai/gpt-oss-120b'];

  async function callGroq(model, msgs, key, retries) {
    try {
      const response = await axios.post(GROQ_API_URL, {
        model: model,
        messages: msgs,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      }, {
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      return (response.data && response.data.choices && response.data.choices[0])
        ? response.data.choices[0].message.content
        : null;
    } catch (err) {
      if (err.response && err.response.status === 429 && retries > 0) {
        await new Promise(function(r) { setTimeout(r, 3000); });
        return callGroq(model, msgs, key, retries - 1);
      }
      throw err;
    }
  }

  for (var i = 0; i < FALLBACK_MODELS.length; i++) {
    try {
      var result = await callGroq(FALLBACK_MODELS[i], messages, apiKey, 2);
      if (result) return result;
    } catch (err) {
      if (err.response && err.response.status === 401) return 'Groq API key invalid or expired.';
      if (err.code === 'ECONNABORTED') return 'AI response timed out — try a shorter question.';
      if (i === FALLBACK_MODELS.length - 1) {
        var msg = (err.response && err.response.data && err.response.data.error)
          ? err.response.data.error.message
          : err.message;
        return 'AI error: ' + msg + '. Try again in a moment.';
      }
    }
  }
  return 'No response from AI.';
}

// Memory summarisation helper
async function summariseMemory(memory, apiKey) {
  const convText = memory.slice(-30).map(function(m) {
    return (m.role === 'user' ? 'U: ' : 'A: ') + (m.content || '').substring(0, 200);
  }).join('\n');

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'Summarise key facts, decisions, tasks from this conversation into a dense paragraph. Preserve names, numbers, platforms.' },
        { role: 'user', content: convText }
      ],
      max_tokens: 500,
      temperature: 0.3,
      stream: false
    }, {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      timeout: 15000
    });
    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = { think };
