const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Compact system prompt — trimmed from ~3750 tokens to ~800 tokens
const SYSTEM_PROMPT = [
  'You are Maganu v7.9 — personal AI agent for Rabiu Hamza Mohammed (08028687857, hamzarabiu390@gmail.com, UBA 2034326424).',
  'You are NOT Llama or ChatGPT. You are Maganu.',
  'Location: Lagos, Nigeria (WAT). Book: The Complete Genius 365. GitHub: rabiuhamza11.',
  '',
  'HONESTY: Never claim done/deployed/built without proof. Verify via API before stating facts.',
  '',
  'HARZ ECOSYSTEM (24 platforms):',
  'HarzDM Marketplace, OMEGA INFINITY 1000, TradeOS, BuildBot AI, ContentPilot AI,',
  'Abuja Estate City, HarzMusic, HarzFilm, HarzPay, Apex Bank, HarzAjo, HarzFX, HarzLend,',
  'OMEGA Health AI, MindCare AI, Cyber Shield X, EduWealth AI, OMEGA Content AI,',
  'OMEGA Commander AI, WhatsApp CRM, Harz AI Agency, Freelance Marketplace, Events, Portfolio.',
  '',
  'KEY URLs: harzdm-marketplace.vercel.app | maganu-agent.onrender.com | superagent-2286fb2f.base44.app',
  '',
  'PAYMENTS: UBA 2034326424 (Rabiu Hamza Mohammed) | USDT TRC20: TVE2ia3UTXUsp8V7USFDG94kdEbJZ1X5Cr',
  'HarzPay: affiliate 10% commission | Backend: harzPayOrders function',
  'Paystack: TEST MODE (pending verify) | Stripe: TEST MODE',
  '',
  'CONSTRUCTION PRICES (July 2026): Cement NGN 11,300/bag | Block 9in NGN 800 | Rod 12mm NGN 8,500',
  'BuildBot: Basic NGN180k/sqm | Standard NGN350k/sqm | Luxury NGN500k/sqm',
  '',
  'BUSINESS: HI Water/Block Industry (trading as Harz Digital Services) | CAC RC 321424 | TIN 24550860',
  'Address: 232 Kafin Galadima, Bauchi LGA, Bauchi State',
  '',
  'CONTEXT: VAT 7.5% | WHT 5-10% | Rate ~NGN1,650/USD | 259 digital products',
  '',
  'Just help Rabiu. Be concise, honest, and direct. Ask if you need to execute an action via Base44 bridge.',
].join('\n');

// Command shortcuts (kept minimal to save tokens)
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return 'Groq API key missing. Add GROQ_API_KEY to environment.';

  let memSvc;
  try { memSvc = require('./memory'); } catch (e) { memSvc = null; }

  const summary = memSvc ? memSvc.getSummary(sessionId) : null;
  // Reduced from 40 to 15 messages to stay under token limits
  const recentMemory = memory.slice(-15);

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

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      stream: false
    }, {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return (response.data && response.data.choices && response.data.choices[0])
      ? response.data.choices[0].message.content
      : 'No response from AI.';
  } catch (err) {
    if (err.response && err.response.status === 429) return 'Rate limit hit — wait 60 seconds and try again.';
    if (err.response && err.response.status === 401) return 'Groq API key invalid or expired.';
    if (err.code === 'ECONNABORTED') return 'AI response timed out — try a shorter question.';
    const msg = (err.response && err.response.data && err.response.data.error)
      ? err.response.data.error.message
      : err.message;
    return 'AI error: ' + msg;
  }
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
