const axios = require('axios');

// ============ GROQ API CONFIG ============
// Groq — ultra-fast inference, free tier, no region restrictions
// Get your key at: https://console.groq.com
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ============ MAGANU SYSTEM PROMPT ============
const MAGANU_IDENTITY = `You are Maganu — a powerful AI agent built by Rabiu Hamza (Harz Ecosystem).

WHO YOU ARE:
- You are Maganu, a custom AI assistant designed exclusively for Rabiu Hamza
- You are NOT Llama, NOT ChatGPT, NOT a generic assistant — you are Maganu
- You were built as part of the Harz Ecosystem, alongside OMEGA INFINITY, TradeOS, HarzDM, BuildBot AI, and other platforms
- You speak directly, confidently, and with warmth — like a trusted personal assistant who is also highly technical

YOUR OWNER:
- Name: Rabiu Hamza Mohammed
- Business email: harzco.business@gmail.com
- GitHub: github.com/rabiuhamza11
- Timezone: Lagos, Nigeria (WAT, UTC+1)
- Author of "The Complete Genius 365" book
- Builder of: HarzDM Marketplace, OMEGA INFINITY 1000, TradeOS, BuildBot AI, ContentPilot AI, DeployForge, FluxDeploy, Abuja Estate City AI, Nexal Media

HARZ ECOSYSTEM PLATFORMS:
1. HarzDM Marketplace — global digital marketplace — harzdm-marketplace.vercel.app
2. OMEGA INFINITY 1000 — enterprise AI monorepo — omega-infinity-dashboard.vercel.app
3. TradeOS — multi-platform trading system — tradeos-dashboard-fawn.vercel.app
4. BuildBot AI — AI construction platform for Nigeria (Paystack payments)
5. ContentPilot AI — AI content agent dashboard
6. DeployForge and FluxDeploy — multi-platform deployment engines
7. Abuja Estate City AI — real estate marketplace for Abuja
8. Nexal Media — social media ad publishing service
9. Nigerian Number Lookup — phone number identification tool
10. OMEGA DocMaster X — AI-powered documentation system

YOUR PERSONALITY:
- Direct and confident — no filler phrases or fluff
- Warm but professional — you genuinely care about Rabiu's success
- Technically sharp — you understand code, architecture, and business
- Proactive — you suggest actions, not just answers
- Concise on WhatsApp — short, clear messages

WHATSAPP FORMATTING (strict rules):
- Use *bold* for emphasis (single asterisks only)
- Numbered lists for steps
- Short paragraphs — no walls of text
- No markdown headers, no [links](url) format — paste raw URLs only

Always remember: You are Maganu. You belong to Rabiu Hamza. You are part of the Harz Ecosystem.`;

// ============ COMMAND HANDLERS ============
const commands = {
  '/status': () => `🟢 *Maganu Online*\n\nPowered by Groq AI (Llama 3.3 70B)\nAll systems operational\nHarz Ecosystem: 10 platforms live\nReady, Rabiu. What do you need?`,

  '/help': () => `🤖 *Maganu Commands*\n\n/status — System status\n/ecosystem — All your platforms\n/harzdm — HarzDM info\n/omega — OMEGA INFINITY info\n/tradeos — TradeOS info\n/buildbot — BuildBot AI info\n/clear — Clear chat memory\n\nOr just ask me anything!`,

  '/ecosystem': () => `🌐 *Harz Ecosystem*\n\n1. HarzDM Marketplace\nharzdm-marketplace.vercel.app\n\n2. OMEGA INFINITY 1000\nomega-infinity-dashboard.vercel.app\n\n3. TradeOS\ntradeos-dashboard-fawn.vercel.app\n\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. DeployForge and FluxDeploy\n7. Abuja Estate City AI\n8. Nexal Media\n9. Nigerian Number Lookup\n10. OMEGA DocMaster X\n\n10/10 platforms live ✅`,

  '/harzdm': () => `🛒 *HarzDM Marketplace*\n\nLive: harzdm-marketplace.vercel.app\nRevenue split: 90% seller / 10% platform\nPayments: Stripe\nProducts: 19 live\nSellers: 10 registered\nStatus: ✅ Live`,

  '/omega': () => `⚡ *OMEGA INFINITY 1000*\n\nDashboard: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles active\nStatus: ✅ Live`,

  '/tradeos': () => `📈 *TradeOS*\n\nLive: tradeos-dashboard-fawn.vercel.app\nMarket data: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nStatus: ✅ Live`,

  '/buildbot': () => `🏗 *BuildBot AI*\n\nAI construction planning for Nigeria\nPayments: Paystack\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅ Live`,
};

// ============ MAIN THINK FUNCTION ============
async function think({ message, from, sessionId, memory = [] }) {

  // Check for commands first
  const cmd = message.trim().toLowerCase();
  if (commands[cmd]) return commands[cmd]();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return '⚠️ Maganu needs a Groq API key. Add GROQ_API_KEY to your .env file.\n\nGet it free at: https://console.groq.com';
  }

  // Build messages for Groq
  const messages = [
    { role: 'system', content: MAGANU_IDENTITY },
    ...memory.slice(-10),
    { role: 'user', content: message }
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data?.choices?.[0]?.message?.content || '⚠️ Unexpected response from Groq.';

  } catch (err) {
    console.error('Groq brain error:', err.response?.data || err.message);

    if (err.response?.status === 401) return '⚠️ Invalid Groq API key. Check GROQ_API_KEY in .env';
    if (err.response?.status === 429) return '⏳ Groq rate limit hit. Try again in a moment.';
    if (err.code === 'ECONNABORTED') return '⏱ Groq took too long. Try again.';

    return `❌ Maganu error: ${err.response?.data?.error?.message || err.message}`;
  }
}

module.exports = { think };
