require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { think } = require('./services/brain');
const { getMemory, addToMemory, clearMemory } = require('./services/memory');
const payments = require('./services/payments');
const scheduler = require('./services/scheduler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For WhatsApp/Twilio

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

// ============ SEND TELEGRAM MESSAGE ============
async function sendMessage(chatId, text) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
      });
    } catch (e) {
      console.error('Send error:', e.message);
    }
  }
}

async function sendTyping(chatId) {
  try {
    await axios.post(`${TELEGRAM_API}/sendChatAction`, { chat_id: chatId, action: 'typing' });
  } catch (_) {}
}

// ============ COMMAND HANDLERS ============
const commands = {
  '/start': (from) => `👋 *Maganu Online*\n\nHey ${from}! I'm Maganu — Rabiu Hamza's personal AI agent.\n\nI'm powered by Groq (Llama 3.3 70B) and know the entire Harz Ecosystem inside out.\n\nType /help to see what I can do.`,

  '/help': () => `🤖 *Maganu Commands*\n\n/status — System status\n/ecosystem — All 10 platforms\n/payments — Full payment report\n/paystack — Paystack balance & stats\n/stripe — Stripe balance & stats\n/buildbot — BuildBot AI info\n/harzdm — HarzDM Marketplace info\n/omega — OMEGA INFINITY info\n/tradeos — TradeOS info\n/scheduler — Active automations\n/clear — Clear chat memory\n\nOr just talk to me — I handle any task or question.`,

  '/status': () => `🟢 *Maganu v2.0 Online*\n\nModel: Groq Llama 3.3 70B\nMemory: Persistent ✅\nScheduler: 4 automations active ✅\nPayments: Stripe + Paystack wired ✅\nTelegram: Connected ✅\nWhatsApp: Connected ✅\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu. What do you need?`,

  '/ecosystem': () => `🌐 *Harz Ecosystem — 10 Platforms*\n\n1. HarzDM Marketplace\nharzdm-marketplace.vercel.app\n\n2. OMEGA INFINITY 1000\nomega-infinity-dashboard.vercel.app\n\n3. TradeOS\ntradeos-dashboard-fawn.vercel.app\n\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. DeployForge / FluxDeploy\n7. Abuja Estate City AI\nabuja-estate-city-ai.vercel.app\n8. Nexal Media (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)\n\n✅ All 10 live and operational`,

  '/harzdm': () => `🛒 *HarzDM Marketplace*\n\nLive: harzdm-marketplace.vercel.app\nRevenue split: 90% seller / 10% platform\nPayments: Stripe (test mode)\nStatus: ✅ Live`,

  '/omega': () => `⚡ *OMEGA INFINITY 1000*\n\nDashboard: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL + Prisma\n10 AI Agent roles active\nomega-ai-packager CLI: v0.3.0\nStatus: ✅ Live`,

  '/tradeos': () => `📈 *TradeOS*\n\nLive: tradeos-dashboard-fawn.vercel.app\nMarket data: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nStatus: ✅ Live`,

  '/buildbot': () => `🏗 *BuildBot AI*\n\nAI construction planning for Nigeria\nPayments: Paystack\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅ Live`,

  '/scheduler': () => {
    const s = scheduler.getStatus();
    let msg = `📅 *Maganu Scheduler — ${s.total} Active*\n\n`;
    s.automations.forEach(a => {
      msg += `✅ ${a.name.replace(/_/g, ' ')} — ${a.schedule}\n`;
    });
    return msg;
  },
};

// Async command handlers (need await)
const asyncCommands = {
  '/payments': async () => await payments.getFullPaymentReport(),
  '/paystack': async () => {
    const stats = await payments.getPaystackStats();
    if (stats.error) return `❌ Paystack error: ${stats.error}`;
    let msg = `💚 *Paystack Stats*\n\nBalance: ${stats.balance}\nSuccessful: ${stats.successfulTxns}/${stats.totalTxns} transactions\nRevenue: ${stats.totalRevenue}\n`;
    if (stats.recentTxns?.length) {
      msg += `\n*Recent:*\n`;
      stats.recentTxns.forEach(t => { msg += `${t.email} — ${t.amount} (${t.status})\n`; });
    }
    return msg;
  },
  '/stripe': async () => {
    const stats = await payments.getStripeStats();
    if (stats.error) return `❌ Stripe error: ${stats.error}`;
    let msg = `💜 *Stripe Stats*\n\nBalance: ${stats.balance}\nSucceeded: ${stats.succeededCharges}/${stats.totalCharges} charges\nRevenue: ${stats.totalRevenue}\n`;
    if (stats.recentCharges?.length) {
      msg += `\n*Recent:*\n`;
      stats.recentCharges.forEach(c => { msg += `${c.email} — ${c.amount} (${c.status})\n`; });
    }
    return msg;
  },
};

// ============ TELEGRAM WEBHOOK ============
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const update = req.body;
  if (!update.message) return;

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const from = msg.from?.first_name || 'Rabiu';
  const sessionId = String(chatId);

  console.log(`[Telegram][${from}] ${text}`);

  // Save owner chat ID if not set
  if (!process.env.OWNER_CHAT_ID && String(chatId)) {
    process.env.OWNER_CHAT_ID = String(chatId);
    console.log('Owner chat ID auto-saved:', chatId);
  }

  // /clear command
  if (text.toLowerCase() === '/clear') {
    clearMemory(sessionId);
    await sendMessage(chatId, '🧹 Memory cleared. Fresh start!');
    return;
  }

  // Sync commands
  const cmd = text.toLowerCase().split(' ')[0];
  if (commands[cmd]) {
    await sendMessage(chatId, commands[cmd](from));
    return;
  }

  // Async commands
  if (asyncCommands[cmd]) {
    await sendTyping(chatId);
    const response = await asyncCommands[cmd]();
    await sendMessage(chatId, response);
    return;
  }

  // AI conversation
  await sendTyping(chatId);
  const memory = getMemory(sessionId);
  const response = await think({ message: text, from, sessionId, memory });
  addToMemory(sessionId, { role: 'user', content: text });
  addToMemory(sessionId, { role: 'assistant', content: response });
  await sendMessage(chatId, response);
});

// ============ WHATSAPP WEBHOOK (Twilio) ============
app.post('/whatsapp', async (req, res) => {
  try {
    const { Body, From, ProfileName } = req.body;
    const text = (Body || '').trim();
    const from = ProfileName || From || 'User';
    const sessionId = `wa_${From}`;

    console.log(`[WhatsApp][${from}] ${text}`);

    let response;
    const cmd = text.toLowerCase().split(' ')[0];

    if (text.toLowerCase() === '/clear') {
      clearMemory(sessionId);
      response = '🧹 Memory cleared. Fresh start!';
    } else if (commands[cmd]) {
      response = commands[cmd](from);
    } else if (asyncCommands[cmd]) {
      response = await asyncCommands[cmd]();
    } else {
      const memory = getMemory(sessionId);
      response = await think({ message: text, from, sessionId, memory });
      addToMemory(sessionId, { role: 'user', content: text });
      addToMemory(sessionId, { role: 'assistant', content: response });
    }

    // Twilio TwiML response
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))}</Message>
</Response>`);

  } catch (err) {
    console.error('WhatsApp error:', err.message);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Maganu error: ${err.message}</Message></Response>`);
  }
});

// ============ NOTIFY OWNER (for external automations) ============
app.post('/notify', async (req, res) => {
  const { message, secret } = req.body;
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const targetId = OWNER_CHAT_ID || process.env.OWNER_CHAT_ID;
  if (!targetId) return res.status(400).json({ error: 'OWNER_CHAT_ID not set' });
  await sendMessage(targetId, message);
  res.json({ ok: true });
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    name: 'Maganu Agent',
    version: '2.0.0',
    status: 'online',
    model: 'Groq Llama 3.3 70B',
    owner: 'Rabiu Hamza — Harz Ecosystem',
    features: ['Telegram', 'WhatsApp', 'Persistent Memory', 'Stripe', 'Paystack', 'Scheduler'],
    scheduler: scheduler.getStatus()
  });
});

// ============ AUTO SET WEBHOOK ============
async function setWebhook(url) {
  try {
    const result = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: `${url}/webhook`,
      allowed_updates: ['message']
    });
    console.log('Webhook set:', result.data.description);
  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
  }
}

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v2.0.0 online — port ${PORT}`);
  console.log(`Features: Telegram + WhatsApp + Persistent Memory + Stripe + Paystack + Scheduler`);

  // Start scheduler
  scheduler.start();

  // Auto-set webhook
  if (process.env.WEBHOOK_URL) {
    await setWebhook(process.env.WEBHOOK_URL);
  } else {
    await setWebhook('https://maganu-agent.onrender.com');
  }
});

module.exports = app;
