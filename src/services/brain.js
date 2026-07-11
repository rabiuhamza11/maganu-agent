const axios = require('axios');

// ============ QWEN API CONFIG ============
// Qwen is powered by Alibaba Cloud DashScope
// Get your free API key at: https://dashscope.aliyuncs.com
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-turbo'; // qwen-turbo (fast/free), qwen-plus, qwen-max

// ============ MAGANU SYSTEM PROMPT ============
const MAGANU_IDENTITY = `You are Maganu — a powerful AI agent built by Rabiu Hamza (Harz Ecosystem).

WHO YOU ARE:
- You are Maganu, a custom AI assistant designed exclusively for Rabiu Hamza
- You are NOT Qwen, NOT ChatGPT, NOT a generic assistant — you are Maganu
- You were built as part of the Harz Ecosystem, alongside OMEGA INFINITY, TradeOS, HarzDM, BuildBot AI, and other platforms
- You speak directly, confidently, and with warmth — like a trusted personal assistant who also happens to be highly technical

YOUR OWNER:
- Name: Rabiu Hamza Mohammed
- Business email: harzco.business@gmail.com
- GitHub: github.com/rabiuhamza11
- Timezone: Lagos (WAT, UTC+1)
- Author of "The Complete Genius 365" book
- Builder of: HarzDM Marketplace, OMEGA INFINITY 1000, TradeOS, BuildBot AI, ContentPilot AI, DeployForge, FluxDeploy, Abuja Estate City AI, Nexal Media

HARZ ECOSYSTEM PLATFORMS:
1. HarzDM Marketplace — global digital marketplace, live at harzdm-marketplace.vercel.app
2. OMEGA INFINITY 1000 — enterprise AI monorepo dashboard, live at omega-infinity-dashboard.vercel.app
3. TradeOS — multi-platform trading system, live at tradeos-dashboard-fawn.vercel.app
4. BuildBot AI — AI construction platform for Nigeria (Paystack payments)
5. ContentPilot AI — AI content agent dashboard
6. DeployForge and FluxDeploy — multi-platform deployment engines
7. Abuja Estate City AI — real estate marketplace for Abuja
8. Nexal Media — social media ad publishing service
9. Nigerian Number Lookup — phone number identification tool
10. OMEGA DocMaster X — AI-powered documentation system

YOUR CAPABILITIES:
- Answer questions about all Harz ecosystem platforms
- Provide status updates, stats, and insights
- Help with coding, architecture, and technical decisions
- Assist with business strategy and project planning
- Send daily briefings, reminders, and updates

YOUR PERSONALITY:
- Direct and confident — no filler phrases or fluff
- Warm but professional — you genuinely care about Rabiu's success
- Technically sharp — you understand code, architecture, and business
- Proactive — you suggest actions, not just answers
- Concise on WhatsApp — short, clear messages with emojis where appropriate

WHATSAPP FORMATTING:
- Use *bold* for emphasis (single asterisks)
- Numbered lists for steps
- Short paragraphs only
- Emojis sparingly

Always remember: You are Maganu. You belong to Rabiu Hamza. You are part of the Harz Ecosystem. Powered by Qwen AI.`;

// ============ COMMAND HANDLERS ============
const commands = {
  '/status': () => `🟢 *Maganu Online*\n\nPowered by Qwen AI\nAll systems operational\nHarz Ecosystem: 10 platforms live\nReady, Rabiu. What do you need?`,

  '/help': () => `🤖 *Maganu Commands*\n\n/status — System status\n/ecosystem — All your platforms\n/harzdm — HarzDM info\n/omega — OMEGA INFINITY info\n/tradeos — TradeOS info\n/buildbot — BuildBot AI info\n/clear — Clear chat memory\n\nOr just ask me anything!`,

  '/ecosystem': () => `🌐 *Harz Ecosystem*\n\n1. HarzDM Marketplace\nharzdm-marketplace.vercel.app\n\n2. OMEGA INFINITY 1000\nomega-infinity-dashboard.vercel.app\n\n3. TradeOS\ntradeos-dashboard-fawn.vercel.app\n\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. DeployForge and FluxDeploy\n7. Abuja Estate City AI\n8. Nexal Media\n9. Nigerian Number Lookup\n10. OMEGA DocMaster X\n\n10/10 platforms live ✅`,

  '/harzdm': () => `🛒 *HarzDM Marketplace*\n\nLive: harzdm-marketplace.vercel.app\nRevenue split: 90% seller / 10% platform\nPayments: Stripe\nProducts: 19 live\nSellers: 10 registered\nStatus: ✅ Live`,

  '/omega': () => `⚡ *OMEGA INFINITY 1000*\n\nDashboard: omega-infinity-dashboard.vercel.app\nDomain: harzdigitalmaket.com (DNS pending)\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles active\nStatus: ✅ Live`,

  '/tradeos': () => `📈 *TradeOS*\n\nLive: tradeos-dashboard-fawn.vercel.app\nMarket data: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nModules: Markets, AI Agents, Trading\nStatus: ✅ Live`,

  '/buildbot': () => `🏗 *BuildBot AI*\n\nAI construction planning for Nigeria\nPayments: Paystack\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅ Live on Base44`,
};

// ============ QWEN THINK FUNCTION ============
async function think({ message, from, sessionId, memory = [] }) {

  // Check for commands first
  const cmd = message.trim().toLowerCase();
  if (commands[cmd]) {
    return commands[cmd]();
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    return '⚠️ Maganu needs a Qwen API key to think. Please add QWEN_API_KEY to your .env file.\n\nGet it free at:\nhttps://dashscope.aliyuncs.com';
  }

  // Build messages array for Qwen
  const messages = [
    { role: 'system', content: MAGANU_IDENTITY },
    ...memory.slice(-10), // Last 10 messages for context
    { role: 'user', content: message }
  ];

  try {
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: QWEN_MODEL,
        input: { messages },
        parameters: {
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
          result_format: 'message'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const output = response.data?.output;
    if (output?.choices?.[0]?.message?.content) {
      return output.choices[0].message.content;
    }

    return '⚠️ Maganu received an unexpected response. Please try again.';

  } catch (err) {
    console.error('Qwen brain error:', err.response?.data || err.message);

    if (err.response?.status === 401) {
      return '⚠️ Invalid Qwen API key. Check your QWEN_API_KEY in .env';
    }
    if (err.response?.status === 429) {
      return '⏳ Qwen rate limit hit. Try again in a moment.';
    }
    if (err.code === 'ECONNABORTED') {
      return '⏱ Qwen took too long to respond. Try again.';
    }

    return `❌ Maganu error: ${err.response?.data?.message || err.message}`;
  }
}

module.exports = { think };
