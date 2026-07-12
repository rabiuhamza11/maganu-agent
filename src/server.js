require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { think } = require('./services/brain');
const { getMemory, addToMemory, clearMemory } = require('./services/memory');
const payments = require('./services/payments');
const scheduler = require('./services/scheduler');
const github = require('./services/github');
const calendar = require('./services/calendar');
const tasks = require('./services/tasks');
const monitor = require('./services/monitor');
const content = require('./services/content');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Track owner chat ID at runtime
let ownerChatId = process.env.OWNER_CHAT_ID || null;

// ============ TELEGRAM HELPERS ============
async function sendMessage(chatId, text) {
  const MAX = 4096;
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX) chunks.push(text.slice(i, i + MAX));

  for (const chunk of chunks) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk, parse_mode: 'Markdown' });
    } catch (_) {
      try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk });
      } catch (e) { console.error('Send error:', e.message); }
    }
  }
}

async function sendTyping(chatId) {
  try { await axios.post(`${TELEGRAM_API}/sendChatAction`, { chat_id: chatId, action: 'typing' }); } catch (_) {}
}

// ============ WEB SEARCH ============
async function webSearch(query) {
  try {
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = res.data;
    const results = [];
    if (data.AbstractText) results.push(data.AbstractText);
    if (data.RelatedTopics?.length) {
      data.RelatedTopics.slice(0, 3).forEach(t => {
        if (t.Text) results.push(t.Text);
      });
    }
    return results.length ? results.join('\n\n') : 'No results found.';
  } catch (err) {
    return `Search error: ${err.message}`;
  }
}

// ============ COMMAND HANDLERS ============
const commands = {
  '/start': (from) => `👋 *Maganu v3.0 Online*\n\nHey ${from}! I'm Maganu — Rabiu's personal AI agent.\n\nType /help to see all ${Object.keys(commands).length + 8} commands.`,

  '/help': () => `🤖 *Maganu v3.0 — Full Command List*\n\n*📊 Dashboard*\n/status — System status\n/ecosystem — All 10 platforms\n/uptime — Live uptime check\n\n*💳 Payments*\n/payments — Full report\n/paystack — Paystack stats\n/stripe — Stripe stats\n\n*🚀 Deployment*\n/github — GitHub activity\n/deploy [repo] — Deploy to Vercel\n\n*📅 Productivity*\n/today — Today's calendar\n/week — This week's events\n/tasks — View task list\n/addtask [text] — Add a task\n/done [id] — Complete a task\n/deltask [id] — Delete a task\n\n*📖 Content*\n/chapter — Today's book chapter\n/post [platform] [topic] — Generate post\n/promo — Today's platform promo\n\n*🔍 Intelligence*\n/search [query] — Web search\n/revenue — Daily revenue summary\n\n/clear — Clear chat memory`,

  '/status': () => `🟢 *Maganu v3.0 Online*\n\nModel: Groq Llama 3.3 70B\nMemory: Persistent ✅\nScheduler: 4 automations ✅\nPayments: Stripe + Paystack ✅\nGitHub: Connected ✅\nCalendar: Connected ✅\nTasks: Active ✅\nMonitor: 10 platforms ✅\nContent Engine: Active ✅\nWeb Search: Active ✅\n\nHarz Ecosystem: 10/10 platforms\nReady, Rabiu. What do you need?`,

  '/ecosystem': () => `🌐 *Harz Ecosystem — 10 Platforms*\n\n1. HarzDM Marketplace\nharzdm-marketplace.vercel.app\n\n2. OMEGA INFINITY 1000\nomega-infinity-dashboard.vercel.app\n\n3. TradeOS\ntradeos-dashboard-fawn.vercel.app\n\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. DeployForge / FluxDeploy\n7. Abuja Estate City AI\nabuja-estate-city-ai.vercel.app\n8. Nexal Media (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)\n\n✅ All 10 live and operational`,

  '/scheduler': () => {
    const s = scheduler.getStatus();
    let msg = `📅 *Maganu Scheduler — ${s.total} Active*\n\n`;
    s.automations.forEach(a => { msg += `✅ ${a.name.replace(/_/g, ' ')} — ${a.schedule}\n`; });
    return msg;
  },

  '/harzdm': () => `🛒 *HarzDM Marketplace*\nLive: harzdm-marketplace.vercel.app\nRevenue split: 90%/10%\nPayments: Stripe\nStatus: ✅ Live`,

  '/omega': () => `⚡ *OMEGA INFINITY 1000*\nDashboard: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles active\nStatus: ✅ Live`,

  '/tradeos': () => `📈 *TradeOS*\nLive: tradeos-dashboard-fawn.vercel.app\nMarket data: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nStatus: ✅ Live`,

  '/buildbot': () => `🏗 *BuildBot AI*\nAI construction planning for Nigeria\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅ Live`,

  '/chapter': () => content.getTodayChapter(),

  '/tasks': () => tasks.formatTaskList(),
};

// Async command handlers
const asyncCommands = {
  '/payments': async () => await payments.getFullPaymentReport(),

  '/paystack': async () => {
    const stats = await payments.getPaystackStats();
    if (stats.error) return `❌ Paystack error: ${stats.error}`;
    let msg = `💚 *Paystack Stats*\n\nBalance: ${stats.balance}\nSuccessful: ${stats.successfulTxns}/${stats.totalTxns}\nRevenue: ${stats.totalRevenue}`;
    if (stats.recentTxns?.length) {
      msg += `\n\n*Recent:*\n`;
      stats.recentTxns.forEach(t => { msg += `${t.email} — ${t.amount} (${t.status})\n`; });
    }
    return msg;
  },

  '/stripe': async () => {
    const stats = await payments.getStripeStats();
    if (stats.error) return `❌ Stripe error: ${stats.error}`;
    let msg = `💜 *Stripe Stats*\n\nBalance: ${stats.balance}\nSucceeded: ${stats.succeededCharges}/${stats.totalCharges}\nRevenue: ${stats.totalRevenue}`;
    if (stats.recentCharges?.length) {
      msg += `\n\n*Recent:*\n`;
      stats.recentCharges.forEach(c => { msg += `${c.email} — ${c.amount} (${c.status})\n`; });
    }
    return msg;
  },

  '/github': async () => await github.getGitHubReport(),

  '/today': async () => {
    const events = await calendar.getTodayEvents();
    return `📅 *Today's Schedule*\n\n${events}`;
  },

  '/week': async () => {
    const events = await calendar.getUpcomingEvents(7);
    return `📅 *This Week*\n\n${events}`;
  },

  '/uptime': async () => {
    const { report } = await monitor.getUptimeReport();
    return report;
  },

  '/revenue': async () => await payments.getFullPaymentReport(),

  '/promo': async () => {
    const platform = content.getTodayPromoTarget();
    const post = await content.generatePromoPost(platform.name, platform.desc, platform.url);
    return `📢 *Today's Platform Spotlight*\n\n${post}`;
  },
};

// ============ PROCESS TELEGRAM UPDATE ============
async function processUpdate(chatId, text, from, sessionId) {
  const raw = text.trim();
  const lower = raw.toLowerCase();
  const parts = raw.split(' ');
  const cmd = parts[0].toLowerCase();

  // /clear
  if (lower === '/clear') {
    clearMemory(sessionId);
    return '🧹 Memory cleared. Fresh start!';
  }

  // /addtask [text]
  if (cmd === '/addtask') {
    const taskText = parts.slice(1).join(' ');
    if (!taskText) return 'Usage: /addtask Buy groceries';
    const task = tasks.addTask(taskText);
    const shortId = String(task.id).slice(-4);
    return `✅ Task added: "${taskText}"\nID: [${shortId}]`;
  }

  // /done [id]
  if (cmd === '/done') {
    const id = parts[1];
    if (!id) return 'Usage: /done [task-id]';
    const task = tasks.completeTask(id);
    if (!task) return `❌ Task [${id}] not found.`;
    return `✅ Done: "${task.text}"`;
  }

  // /deltask [id]
  if (cmd === '/deltask') {
    const id = parts[1];
    if (!id) return 'Usage: /deltask [task-id]';
    const ok = tasks.deleteTask(id);
    return ok ? `🗑 Task [${id}] deleted.` : `❌ Task [${id}] not found.`;
  }

  // /deploy [repo]
  if (cmd === '/deploy') {
    const repo = parts[1];
    if (!repo) return 'Usage: /deploy [repo-name]\nExample: /deploy tradeos';
    const result = await github.deployToVercel(repo);
    if (result.error) return `❌ Deploy failed: ${result.error}`;
    return `🚀 Deploying *${repo}* to Vercel!\nProject ID: ${result.projectId}\nCheck: https://vercel.com/dashboard`;
  }

  // /search [query]
  if (cmd === '/search') {
    const query = parts.slice(1).join(' ');
    if (!query) return 'Usage: /search [your question]';
    const results = await webSearch(query);
    return `🔍 *Search: ${query}*\n\n${results}`;
  }

  // /post [platform] [topic]
  if (cmd === '/post') {
    const platform = parts[1];
    const topic = parts.slice(2).join(' ');
    if (!platform || !topic) return 'Usage: /post [twitter/instagram/linkedin/whatsapp] [topic]';
    const post = await content.generateSocialPost(platform, topic);
    return `✍️ *${platform.toUpperCase()} Post:*\n\n${post}`;
  }

  // Sync commands
  if (commands[cmd]) return typeof commands[cmd] === 'function' ? commands[cmd](from) : commands[cmd];

  // Async commands
  if (asyncCommands[cmd]) return await asyncCommands[cmd]();

  // AI conversation
  const memory = getMemory(sessionId);
  const response = await think({ message: raw, from, sessionId, memory });
  addToMemory(sessionId, { role: 'user', content: raw });
  addToMemory(sessionId, { role: 'assistant', content: response });
  return response;
}

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

  // Auto-save owner chat ID
  if (!ownerChatId) {
    ownerChatId = String(chatId);
    process.env.OWNER_CHAT_ID = ownerChatId;
    console.log('Owner chat ID auto-saved:', ownerChatId);
  }

  console.log(`[Telegram][${from}] ${text}`);
  await sendTyping(chatId);

  try {
    const response = await processUpdate(chatId, text, from, sessionId);
    await sendMessage(chatId, response);
  } catch (err) {
    console.error('Handler error:', err.message);
    await sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// ============ WHATSAPP WEBHOOK (Twilio) ============
app.post('/whatsapp', async (req, res) => {
  try {
    const { Body, From, ProfileName } = req.body;
    const text = (Body || '').trim();
    const from = ProfileName || From || 'User';
    const sessionId = `wa_${From}`;
    console.log(`[WhatsApp][${from}] ${text}`);

    const response = await processUpdate(null, text, from, sessionId);

    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${String(response).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))}</Message>
</Response>`);
  } catch (err) {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Maganu error: ${err.message}</Message></Response>`);
  }
});

// ============ NOTIFY ENDPOINT ============
app.post('/notify', async (req, res) => {
  const { message, secret } = req.body;
  if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const target = ownerChatId || process.env.OWNER_CHAT_ID;
  if (!target) return res.status(400).json({ error: 'Owner chat ID not set. Message /start to Maganu on Telegram first.' });
  await sendMessage(target, message);
  res.json({ ok: true });
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    name: 'Maganu Agent',
    version: '3.0.0',
    status: 'online',
    model: 'Groq Llama 3.3 70B',
    owner: 'Rabiu Hamza — Harz Ecosystem',
    capabilities: [
      'Telegram Bot', 'WhatsApp (Twilio)', 'Persistent Memory',
      'Stripe Payments', 'Paystack Payments', 'GitHub Intelligence',
      'Google Calendar', 'Task Manager', 'Uptime Monitor',
      'Content Generator', 'Social Post Generator', 'Book Chapters',
      'Web Search', 'Revenue Dashboard', 'Daily Automations'
    ],
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

// ============ START ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v3.0.0 online — port ${PORT}`);
  console.log(`Capabilities: 15 features | Commands: ${Object.keys(commands).length + Object.keys(asyncCommands).length}+`);
  scheduler.start();
  await setWebhook(process.env.WEBHOOK_URL || 'https://maganu-agent.onrender.com');
});

module.exports = app;
