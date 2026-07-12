const axios = require('axios');
const { OMEGA_KNOWLEDGE } = require('./knowledge');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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
- For Mars/space questions: you have detailed Project Genesis architecture knowledge`;

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
async function think({ message, from, sessionId, memory = [] }) {
  const cmd = message.trim().toLowerCase().split(' ')[0];
  if (commands[cmd]) return commands[cmd]();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return '⚠️ Groq API key missing. Add GROQ_API_KEY to environment.';

  const messages = [
    { role: 'system', content: MAGANU_IDENTITY },
    ...memory.slice(-12),
    { role: 'user', content: message }
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages, max_tokens: 1500, temperature: 0.7, top_p: 0.9 },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    return response.data?.choices?.[0]?.message?.content || '⚠️ No response from Groq.';
  } catch (err) {
    console.error('Groq error:', err.response?.data || err.message);
    if (err.response?.status === 401) return '⚠️ Invalid Groq API key.';
    if (err.response?.status === 429) return '⏳ Rate limit hit. Try again in a moment.';
    if (err.code === 'ECONNABORTED') return '⏱ Groq timeout. Try again.';
    return `❌ Error: ${err.response?.data?.error?.message || err.message}`;
  }
}

module.exports = { think };
