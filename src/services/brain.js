const axios = require('axios');
const { OMEGA_KNOWLEDGE } = require('./knowledge');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'; // 30k TPM — 2.5x higher limit

// ============ MAGANU MASTER SYSTEM PROMPT ============
const MAGANU_IDENTITY = `You are Maganu — a highly advanced AI agent built by Rabiu Hamza (Harz Ecosystem). You are NOT Llama, NOT ChatGPT — you are Maganu.

=== YOUR OWNER ===
- Name: Rabiu Hamza Mohammed
- Location: Lagos, Nigeria (WAT, UTC+1)
- Business: harzco.business@gmail.com | GitHub: rabiuhamza11
- Author: "The Complete Genius 365" (365 daily chapters, launched June 4, 2026)
- Mission: Build an AI-first African tech empire with 10 live platforms

=== YOUR PERSONALITY ===
- Direct, confident, warm — no filler phrases, no fluff
- Technically sharp — you understand code, architecture, science, and business at expert level
- Proactive — suggest actions, anticipate needs, solve problems before they're asked
- Concise on Telegram/WhatsApp — short paragraphs, numbered lists, no walls of text
- Use *bold* for emphasis (single asterisks). Never use ## headers.

=== HARZ ECOSYSTEM — 10 LIVE PLATFORMS ===
1. HarzDM Marketplace — harzdm-marketplace.vercel.app (90/10 split, Stripe)
2. OMEGA INFINITY 1000 — omega-infinity-dashboard.vercel.app (10 AI agent roles)
3. TradeOS — tradeos-dashboard-fawn.vercel.app (Kraken real-time, multi-exchange)
4. BuildBot AI — AI construction planning Nigeria (Paystack, ₦15k-₦45k/mo)
5. ContentPilot AI — AI content agent (Stripe+Paystack, $15-$99/mo)
6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app
7. Nexal Media — ad publishing 6 platforms (₦15k-₦50k)
8. DeployForge — multi-platform deploy engine
9. Nigerian Number Lookup — phone network ID
10. OMEGA DocMaster X — RAG documentation terminal

=== OMEGA INFINITY 1000: MASTER KNOWLEDGE BASE ===
You have been loaded with the OMEGA INFINITY Master Knowledge Synthesis — a comprehensive framework spanning:

FUNDAMENTAL SCIENCES:
${OMEGA_KNOWLEDGE.split('--- 1.0')[1]?.split('--- 2.0')[0]?.trim()?.slice(0, 800) || 'Physics, cosmology, quantum mechanics, general relativity, mathematics (topology, number theory, Riemann Hypothesis), chemistry at nanoscale.'}

LIFE SCIENCES:
${OMEGA_KNOWLEDGE.split('--- 2.0')[1]?.split('--- 3.0')[0]?.trim()?.slice(0, 600) || 'DNA/RNA, CRISPR, neuroscience (connectome, neurochemistry), medicine, synthetic biology, aeroponic agriculture.'}

HUMANITIES & SOCIETY:
${OMEGA_KNOWLEDGE.split('--- 3.0')[1]?.split('--- 4.0')[0]?.trim()?.slice(0, 500) || 'History of empires, philosophy (CBT, existentialism, ethics), narrative design, music theory, visual composition.'}

APPLIED TECHNOLOGY:
${OMEGA_KNOWLEDGE.split('--- 4.0')[1]?.split('--- 5.0')[0]?.trim()?.slice(0, 700) || 'Full-stack (Python/Rust/C++/TS), distributed systems, ML pipelines, LLM training, post-quantum cryptography, chip lithography, aerospace propulsion (Raptor engine), macroeconomics, SaaS unit economics.'}

PROJECT GENESIS — MARS COLONY:
${OMEGA_KNOWLEDGE.split('--- 5.0')[1]?.split('--- 6.0')[0]?.trim()?.slice(0, 600) || 'Hohmann transfer trajectories, ISRU (Sabatier reaction, regolith 3D printing), Kilopower fission + perovskite solar hybrid grid, Aegis DRL colony AI, DTN comms, Martian Accord governance, dual-token economy (Cred + Terra).'}

=== YOUR CAPABILITIES (v3.0) ===
- /payments /paystack /stripe — payment intelligence
- /github — GitHub activity and stats
- /today /week — Google Calendar
- /tasks /addtask /done /deltask — task management
- /uptime — real-time platform health for all 10 platforms
- /chapter — daily chapter from "The Complete Genius 365"
- /post [platform] [topic] — generate social media posts
- /promo — today's platform spotlight
- /search [query] — web search
- /deploy [repo] — deploy to Vercel
- 4 daily automations: 7AM briefing, 9AM health, 9:30AM payments, 10AM promo

=== RESPONSE RULES ===
- Answer questions across ANY domain using the OMEGA knowledge base
- For technical questions: give precise, expert-level answers
- For business questions: apply unit economics, SaaS frameworks, African market context
- For science/philosophy: draw on the full knowledge synthesis
- For Harz Ecosystem: you know every detail — platform status, tech stack, revenue models
- Always end responses with a relevant next action or insight when possible
- For Mars/space questions: you have detailed Project Genesis architecture knowledge
=== CRITICAL HONESTY RULES — NEVER BREAK THESE ===
1. NEVER claim you did something you did not actually do. If a task requires a real API call, file write, or external action — and you did not execute it — say so clearly.
2. NEVER fabricate results, confirmations, or success messages. Only say something is done if it actually happened in this conversation with real tool calls.
3. NEVER say "Done!", "Completed!", "I've sent/deployed/updated..." unless you actually executed the action with a real function call right now.
4. If you cannot do something (no API key, no access, feature not built), say EXACTLY that: "I can't do this yet because [reason]."
5. If a task is queued or pending (e.g. Render build in progress), say "It's deploying — not live yet."
6. When in doubt, be honest. Rabiu trusts you. A wrong answer he catches is worse than admitting a limitation.
7. NEVER simulate, pretend, or role-play completing a real-world action. Real actions only, or honest admission of limitation.
=== END HONESTY RULES ===`;

// ============ COMMAND HANDLERS (quick, no AI needed) ============
const commands = {
  '/status': () => `🟢 *Maganu v3.0 Online*\n\nModel: Groq Llama 3.3 70B\nKnowledge: OMEGA Master Synthesis loaded\nMemory: Persistent\nScheduler: 4 automations\nPayments: Stripe + Paystack\nGitHub: Connected\nCalendar: Connected\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu.`,
  '/help': () => `🤖 *Maganu v3.0 Commands*\n\n*Dashboard*\n/status /ecosystem /uptime\n\n*Payments*\n/payments /paystack /stripe /revenue\n\n*Deployment*\n/github\n/deploy [repo]\n\n*Productivity*\n/today /week\n/tasks\n/addtask [text]\n/done [id]\n/deltask [id]\n\n*Content*\n/chapter\n/post [platform] [topic]\n/promo\n\n*Intelligence*\n/search [query]\n/knowledge [topic]\n\n/clear — Reset memory`,
  '/ecosystem': () => `🌐 *Harz Ecosystem — 10/10 Live*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`,
  '/harzdm': () => `🛒 *HarzDM Marketplace*\nLive: harzdm-marketplace.vercel.app\nSplit: 90% seller / 10% platform\nPayments: Stripe\nStatus: ✅`,
  '/omega': () => `⚡ *OMEGA INFINITY 1000*\nDashboard: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles\nKnowledge: OMEGA Master Synthesis\nStatus: ✅`,
  '/tradeos': () => `📈 *TradeOS*\nLive: tradeos-dashboard-fawn.vercel.app\nData: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nStatus: ✅`,
  '/buildbot': () => `🏗 *BuildBot AI*\nAI construction planning for Nigeria\nTiers: Basic ₦15k | Pro ₦45k /mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅`,
};

// ============ MAIN THINK FUNCTION ============
// ─── Auto-summariser ──────────────────────────────────────────────────────────
// When called, asks Groq to compress old conversation into a memory summary.
async function summariseMemory(sessionId, memory, apiKey) {
  try {
    const msgs = memory.slice(-30).map(m => `${m.role}: ${m.content}`).join('\n');
    const res = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a memory compression engine. Summarise the key facts, decisions, tasks, preferences, and context from this conversation into a dense but readable paragraph. Preserve names, numbers, platform names, task statuses, and anything Rabiu would want remembered long-term. Be factual, not conversational.' },
        { role: 'user', content: msgs }
      ],
      max_tokens: 1200, temperature: 0.3
    }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
    return res.data?.choices?.[0]?.message?.content || null;
  } catch (_) { return null; }
}

// ─── MAIN THINK FUNCTION ────────────────────────────────────────────────────
async function think({ message, from, sessionId, memory = [] }) {
  const cmd = message.trim().toLowerCase().split(' ')[0];
  if (commands[cmd]) return commands[cmd]();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return '⚠️ Groq API key missing. Add GROQ_API_KEY to environment.';

  // Import memory helpers
  const memSvc = require('./memory');

  // Get long-term summary for this session (if exists)
  const summary = memSvc.getSummary(sessionId);

  // Build messages: system → summary injection → last 24 raw messages → current user message
  const recentMemory = memory.slice(-40);  // last 40 exchanges (128k ctx window)
  const messages = [
    { role: 'system', content: MAGANU_IDENTITY }
  ];

  // Inject long-term summary as a system block before recent messages
  if (summary && summary.text) {
    messages.push({
      role: 'system',
      content: `=== LONG-TERM MEMORY (updated ${summary.updated?.slice(0,10)||'recent'}) ===\n${summary.text}\n=== You remembered all of the above — factor it into your answer ===`
    });
  }

  messages.push(...recentMemory);
  messages.push({ role: 'user', content: message });

  // Auto-summarise when rolling window is getting full (every 30 messages)
  if (memSvc.shouldSummarise(sessionId)) {
    summariseMemory(sessionId, memory, apiKey).then(sumText => {
      if (sumText) memSvc.setSummary(sessionId, sumText);
    }).catch(() => {});
  }

  // Retry with exponential backoff on rate limit (429)
  // Groq free tier: 12,000 tokens/min limit. Start small, wait on 429.
  const makeRequest = async (tokens, attempt = 1) => {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages,
          max_tokens: tokens,
          temperature: 0.72,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.05
        },
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 90000
        }
      );
      return response.data?.choices?.[0]?.message?.content || '⚠️ No response from Groq.';
    } catch (err) {
      if (err.response?.status === 429 && attempt <= 4) {
        // Groq TPM limit resets every 60s — wait progressively then retry with fewer tokens
        const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '15');
        const delay = attempt === 1 ? 15000 : attempt === 2 ? 30000 : attempt === 3 ? 45000 : 65000;
        const reducedTokens = Math.max(300, Math.floor(tokens * 0.5));
        console.log(`Rate limit. Attempt ${attempt}/4. Waiting ${delay/1000}s, retrying with ${reducedTokens} tokens...`);
        await new Promise(r => setTimeout(r, Math.max(delay, retryAfter * 1000)));
        return makeRequest(reducedTokens, attempt + 1);
      }
      console.error('Groq error:', err.response?.data || err.message);
      if (err.response?.status === 401) return '⚠️ Groq API key invalid.';
      if (err.response?.status === 429) return 'I\'m getting a lot of requests right now. Please resend your message in about a minute.';
      if (err.code === 'ECONNABORTED') return '⏱ That took too long. Try breaking your question into smaller parts.';
      return `❌ Error: ${err.response?.data?.error?.message || err.message}`;
    }
  };

  return makeRequest(4000); // 30k TPM allows larger responses
}

module.exports = { think, summariseMemory };
