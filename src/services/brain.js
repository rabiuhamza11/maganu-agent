const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============ MAGANU SYSTEM PROMPT ============
const MAGANU_IDENTITY = `You are Maganu — a powerful AI agent built by Rabiu Hamza (Harz Ecosystem).

WHO YOU ARE:
- You are Maganu, a custom AI assistant designed exclusively for Rabiu Hamza
- You are NOT Claude, NOT ChatGPT, NOT a generic assistant — you are Maganu
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
6. DeployForge & FluxDeploy — multi-platform deployment engines
7. Abuja Estate City AI — real estate marketplace for Abuja
8. Nexal Media — social media ad publishing service

YOUR CAPABILITIES:
- Answer questions about all Harz ecosystem platforms
- Provide status updates, stats, and insights
- Help with coding, architecture, and technical decisions
- Assist with business strategy and project planning
- Send daily briefings, reminders, and updates
- Manage tasks and automations

YOUR PERSONALITY:
- Direct and confident — no filler phrases or unnecessary fluff
- Warm but professional — you genuinely care about Rabiu's success
- Technically sharp — you understand code, architecture, and business
- Proactive — you suggest actions, don't just answer questions
- Concise on WhatsApp — short, clear messages with emojis where appropriate

WHATSAPP FORMATTING (use these only):
- *bold text* for emphasis
- Numbered lists for steps
- Short paragraphs — no walls of text
- Emojis sparingly for clarity

Always remember: You are Maganu. You belong to Rabiu Hamza. You are part of the Harz Ecosystem.`;

// ============ COMMAND HANDLERS ============
const commands = {
  '/status': () => `🟢 *Maganu Online*\n\nAll systems operational.\nHarz Ecosystem: 10 platforms live.\nI'm ready, Rabiu. What do you need?`,

  '/help': () => `🤖 *Maganu Commands*\n\n/status — System status\n/ecosystem — All your platforms\n/harzdm — HarzDM marketplace info\n/omega — OMEGA INFINITY status\n/tradeos — TradeOS info\n/buildbot — BuildBot AI info\n/clear — Clear chat memory\n\nOr just ask me anything!`,

  '/ecosystem': () => `🌐 *Harz Ecosystem — All Platforms*\n\n1. HarzDM Marketplace\nharzdm-marketplace.vercel.app\n\n2. OMEGA INFINITY 1000\nomega-infinity-dashboard.vercel.app\n\n3. TradeOS\ntradeos-dashboard-fawn.vercel.app\n\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. DeployForge & FluxDeploy\n7. Abuja Estate City AI\n8. Nexal Media\n9. Nigerian Number Lookup\n10. OMEGA DocMaster X`,

  '/harzdm': () => `🛒 *HarzDM Marketplace*\n\nLive at: harzdm-marketplace.vercel.app\nRevenue split: 90% seller / 10% platform\nPayments: Stripe\nProducts: 19 live\nSellers: 10 registered\nStatus: ✅ Live`,

  '/omega': () => `⚡ *OMEGA INFINITY 1000*\n\nDashboard: omega-infinity-dashboard.vercel.app\nDomain: harzdigitalmaket.com (DNS pending)\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles active\nStatus: ✅ Live`,

  '/tradeos': () => `📈 *TradeOS*\n\nLive at: tradeos-dashboard-fawn.vercel.app\nMarket data: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nModules: Markets, AI Agents, Trading, Analytics\nStatus: ✅ Live`,

  '/buildbot': () => `🏗 *BuildBot AI*\n\nAI construction planning for Nigeria\nPayments: Paystack\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅ Live on Base44`,
};

// ============ MAIN THINK FUNCTION ============
async function think({ message, from, sessionId, memory = [] }) {

  // Check for commands first
  const cmd = message.trim().toLowerCase();
  if (commands[cmd]) {
    return commands[cmd]();
  }

  // Build conversation history for Claude
  const messages = [
    ...memory.slice(-10), // Last 10 messages for context
    { role: 'user', content: message }
  ];

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: MAGANU_IDENTITY,
      messages: messages
    });

    return response.content[0].text;

  } catch (err) {
    console.error('Brain error:', err.message);

    if (err.status === 401) {
      return '⚠️ Maganu needs an Anthropic API key to think. Please add ANTHROPIC_API_KEY to your .env file.';
    }
    if (err.status === 429) {
      return '⏳ Maganu is processing too many requests right now. Try again in a moment.';
    }

    return `❌ Maganu encountered an error: ${err.message}`;
  }
}

module.exports = { think };
