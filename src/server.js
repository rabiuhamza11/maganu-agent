require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { think } = require('./services/brain');
const { getMemory, addToMemory, clearMemory } = require('./services/memory');
const payments = require('./services/payments');
const scheduler = require('./services/scheduler');
const github = require('./services/github');
const deploy = require('./services/deploy');
const calendar = require('./services/calendar');
const tasks = require('./services/tasks');
const monitor = require('./services/monitor');
const content = require('./services/content');
const analytics = require('./services/analytics');
const research = require('./services/research');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
let ownerChatId = process.env.OWNER_CHAT_ID || null;

// ============ TELEGRAM HELPERS ============
async function sendMessage(chatId, text) {
  const MAX = 4096;
  const safe = String(text || '');
  const chunks = [];
  for (let i = 0; i < safe.length; i += MAX) chunks.push(safe.slice(i, i + MAX));
  for (const chunk of chunks) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk, parse_mode: 'Markdown' });
    } catch (_) {
      try { await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk }); }
      catch (e) { console.error('Send error:', e.message); }
    }
  }
}

async function sendTyping(chatId) {
  try { await axios.post(`${TELEGRAM_API}/sendChatAction`, { chat_id: chatId, action: 'typing' }); } catch (_) {}
}

// ============ WEB SEARCH ============
async function webSearch(query) {
  try {
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`, { timeout: 8000 });
    const d = res.data;
    const parts = [];
    if (d.AbstractText) parts.push(d.AbstractText);
    (d.RelatedTopics || []).slice(0, 3).forEach(t => { if (t.Text) parts.push(t.Text); });
    return parts.length ? parts.join('\n\n') : 'No direct results — try rephrasing.';
  } catch (err) { return `Search error: ${err.message}`; }
}

// ============ EMAIL VIA GMAIL API ============
async function sendEmail(to, subject, body) {
  try {
    const token = process.env.GOOGLECALENDAR_ACCESS_TOKEN;
    if (!token) return '⚠️ Google token not set. Reconnect Google account.';
    const raw = Buffer.from(`To: ${to}\nSubject: ${subject}\nContent-Type: text/plain\n\n${body}`).toString('base64').replace(/\+/g,'-').replace(/\//g,'_');
    await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      { raw },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return `✅ Email sent to ${to}\nSubject: ${subject}`;
  } catch (err) {
    return `❌ Email error: ${err.response?.data?.error?.message || err.message}`;
  }
}

// ============ PROCESS ALL COMMANDS ============
async function processUpdate(chatId, text, from, sessionId) {
  const raw = text.trim();
  const parts = raw.split(' ');
  const cmd = parts[0].toLowerCase();

  // Sentiment detection — adapt response prefix
  const sentiment = research.analyzeSentiment(raw);

  // ===== SYSTEM =====
  if (cmd === '/start') return `👋 *Maganu v3.2 Online*\n\nHey ${from}! I'm Maganu — Rabiu's personal AI agent with OMEGA Master Knowledge.\n\nI have 26 capabilities loaded. Type /help to see everything.`;

  if (cmd === '/clear') { clearMemory(sessionId); return '🧹 Memory cleared. Fresh start!'; }

  if (cmd === '/status') return `🟢 *Maganu v3.2 Online*\n\nModel: Groq Llama 3.3 70B\nKnowledge: OMEGA Master Synthesis ✅\nMemory: Persistent ✅\nScheduler: 4 automations ✅\nPayments: Stripe + Paystack ✅\nGitHub + Deploy: All 4 platforms ✅\nCalendar + Tasks ✅\nMonitor: 10 platforms ✅\nAnalytics + Research ✅\nContent Engine ✅\nSentiment Analysis ✅\nEmail (Gmail) ✅\nWeb Search ✅\n\nCapabilities: 26 | Commands: 35+\nHarz Ecosystem: 10/10 platforms live`;

  if (cmd === '/help') return `🤖 *Maganu v3.2 — All 35 Commands*\n\n*System*\n/status /ecosystem /clear\n\n*Payments*\n/payments /paystack /stripe /revenue\n\n*Deploy & Dev*\n/repos — list all GitHub repos\n/github — activity digest\n/commit [repo] [msg] — trigger commit\n/deploy [repo] — deploy to Vercel\n/netlify [repo] — deploy to Netlify\n/render [repo] — deploy to Render\n/railway [repo] — deploy to Railway\n/logs [serviceId] — Render logs\n\n*Productivity*\n/today /week — Calendar\n/tasks /addtask [text]\n/done [id] /deltask [id]\n\n*Research & AI*\n/search [query] — web search\n/research [topic] — deep research\n/competitor [company] — analysis\n/review — paste code for review\n/arch — describe system for review\n/summarize — paste doc to summarize\n\n*Analytics*\n/traffic [repo] — GitHub traffic\n/codestats — today's commits\n/market — NGN/USD rate + market data\n/digest — weekly business report\n\n*Content*\n/chapter — today's book chapter\n/post [platform] [topic]\n/promo — today's platform spotlight\n/broadcast — AI Global channel message\n\n*Monitor*\n/uptime — all 10 platforms live check\n\n*Communication*\n/email [to] [subject] | [body]\n\n/scheduler — active automations`;

  if (cmd === '/ecosystem') return `🌐 *Harz Ecosystem — 10/10 Live*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`;

  if (cmd === '/scheduler') {
    const s = scheduler.getStatus();
    let msg = `📅 *Maganu Scheduler — ${s.total} Active*\n\n`;
    s.automations.forEach(a => { msg += `✅ ${a.name.replace(/_/g, ' ')} — ${a.schedule}\n`; });
    return msg;
  }

  if (cmd === '/chapter') return content.getTodayChapter();
  if (cmd === '/tasks') return tasks.formatTaskList();

  if (cmd === '/harzdm') return `🛒 *HarzDM Marketplace*\nLive: harzdm-marketplace.vercel.app\nSplit: 90%/10% | Payments: Stripe ✅`;
  if (cmd === '/buildbot') return `🏗 *BuildBot AI*\nAI construction planning Nigeria\nBasic ₦15k | Pro ₦45k /mo ✅`;
  if (cmd === '/omega') return `⚡ *OMEGA INFINITY 1000*\nomega-infinity-dashboard.vercel.app\n10 AI Agents | NestJS/Next.js ✅`;
  if (cmd === '/tradeos') return `📈 *TradeOS*\ntradeos-dashboard-fawn.vercel.app\nKraken real-time | Multi-exchange ✅`;

  // ===== TASK MANAGEMENT =====
  if (cmd === '/addtask') {
    const taskText = parts.slice(1).join(' ');
    if (!taskText) return 'Usage: /addtask Buy groceries';
    const task = tasks.addTask(taskText);
    return `✅ Task added: "${taskText}"\nID: [${String(task.id).slice(-4)}]`;
  }
  if (cmd === '/done') {
    const t = tasks.completeTask(parts[1]);
    return t ? `✅ Done: "${t.text}"` : `❌ Task [${parts[1]}] not found.`;
  }
  if (cmd === '/deltask') {
    return tasks.deleteTask(parts[1]) ? `🗑 Task [${parts[1]}] deleted.` : `❌ Not found.`;
  }

  // ===== DEPLOYMENT =====
  if (cmd === '/repos') {
    const repos = await deploy.listRepos();
    if (!repos.length) return '❌ Could not fetch repos.';
    let msg = `🐙 *GitHub Repos (${repos.length})*\n\n`;
    repos.slice(0, 15).forEach(r => { msg += `${r.private ? '🔒' : '🌐'} ${r.name} — ${r.language} ⭐${r.stars}\n`; });
    return msg;
  }

  if (cmd === '/deploy') {
    const repo = parts[1];
    if (!repo) return 'Usage: /deploy [repo-name]';
    const result = await deploy.deployVercel(repo);
    return result.ok ? `🚀 *Vercel Deploy Started*\nRepo: ${repo}\nURL: ${result.url}\nProject ID: ${result.projectId}` : `❌ Vercel deploy failed: ${result.error}`;
  }

  if (cmd === '/netlify') {
    const repo = parts[1];
    if (!repo) return 'Usage: /netlify [repo-name]';
    const result = await deploy.deployNetlify(repo);
    return result.ok ? `🚀 *Netlify Deploy Started*\nRepo: ${repo}\nURL: ${result.url}` : `❌ Netlify failed: ${result.error}`;
  }

  if (cmd === '/render') {
    const repo = parts[1];
    if (!repo) return 'Usage: /render [repo-name]';
    const result = await deploy.deployRender(repo);
    return result.ok ? `🚀 *Render Deploy Started*\nRepo: ${repo}\nURL: ${result.url}` : `❌ Render failed: ${result.error}`;
  }

  if (cmd === '/railway') {
    const repo = parts[1];
    if (!repo) return 'Usage: /railway [repo-name]';
    const result = await deploy.deployRailway(repo);
    return result.ok ? `🚀 *Railway Deploy Started*\nRepo: ${repo}\nProject: ${result.url}` : `❌ Railway failed: ${result.error}`;
  }

  if (cmd === '/commit') {
    const repo = parts[1];
    const msg = parts.slice(2).join(' ');
    if (!repo || !msg) return 'Usage: /commit [repo] [message]';
    const result = await deploy.triggerCommit(repo, msg);
    return result.ok ? `✅ ${result.message}` : `❌ ${result.error}`;
  }

  if (cmd === '/logs') {
    const svcId = parts[1] || 'srv-d99er9reo5us738eskk0';
    const logs = await deploy.getRenderLogs(svcId);
    return `📋 *Render Logs*\n\n${logs}`;
  }

  // ===== ANALYTICS =====
  if (cmd === '/traffic') {
    const repo = parts[1];
    if (!repo) return 'Usage: /traffic [repo-name]';
    const t = await analytics.getRepoTraffic(repo);
    if (t.error) return `❌ ${t.error}`;
    return `📊 *${t.repo} Traffic (14-day)*\n\nViews: ${t.views} (${t.uniqueViews} unique)\nClones: ${t.clones} (${t.uniqueClones} unique)\nTop referrers:\n${t.topReferrers.join('\n') || 'None yet'}`;
  }

  if (cmd === '/codestats') {
    const s = await analytics.getDailyCodeStats();
    if (s.error) return `❌ ${s.error}`;
    return `💻 *Code Stats — ${s.date}*\n\nCommits: ${s.commits}\nPush events: ${s.pushEvents}\nActive repos: ${s.reposActive.join(', ') || 'None today'}\nTotal events: ${s.totalEvents}`;
  }

  if (cmd === '/market') {
    const d = await analytics.getNigerianMarketData();
    return `📈 *Nigerian Market Data*\n\nUSD/NGN: ₦${d.usdNgn}\nSource: ${d.source}\nAs of: ${d.timestamp}`;
  }

  if (cmd === '/digest') {
    const digest = await analytics.getWeeklyDigest(payments);
    return digest;
  }

  // ===== RESEARCH =====
  if (cmd === '/search') {
    const q = parts.slice(1).join(' ');
    if (!q) return 'Usage: /search [your question]';
    const result = await webSearch(q);
    return `🔍 *Search: ${q}*\n\n${result}`;
  }

  if (cmd === '/research') {
    const q = parts.slice(1).join(' ');
    if (!q) return 'Usage: /research [topic]';
    return await research.deepResearch(q);
  }

  if (cmd === '/competitor') {
    const company = parts.slice(1).join(' ');
    if (!company) return 'Usage: /competitor [company name]';
    return await research.analyzeCompetitor(company);
  }

  if (cmd === '/review') {
    const code = parts.slice(1).join(' ');
    if (!code) return 'Usage: /review [paste your code]';
    return await research.reviewCode(code);
  }

  if (cmd === '/arch') {
    const desc = parts.slice(1).join(' ');
    if (!desc) return 'Usage: /arch [describe your system architecture]';
    return await research.reviewArchitecture(desc);
  }

  if (cmd === '/summarize') {
    const doc = parts.slice(1).join(' ');
    if (!doc) return 'Usage: /summarize [paste your document text]';
    return await research.summarizeDocument(doc);
  }

  // ===== CONTENT =====
  if (cmd === '/post') {
    const platform = parts[1];
    const topic = parts.slice(2).join(' ');
    if (!platform || !topic) return 'Usage: /post [twitter/instagram/linkedin/whatsapp] [topic]';
    const post = await content.generateSocialPost(platform, topic);
    return `✍️ *${platform.toUpperCase()} Post*\n\n${post}`;
  }

  if (cmd === '/promo') {
    const platform = content.getTodayPromoTarget();
    const post = await content.generatePromoPost(platform.name, platform.desc, platform.url);
    return `📢 *Today's Platform Spotlight*\n\n${post}`;
  }

  if (cmd === '/broadcast') {
    const topic = parts.slice(1).join(' ') || 'Harz Ecosystem latest updates';
    const post = await think({
      message: `Write a powerful announcement/broadcast message for the "AI Global" WhatsApp channel about: ${topic}. Context: This is Rabiu Hamza's AI business community. Make it energizing, credible, and shareable. 4-5 lines max. Include a clear call to action.`,
      from: 'broadcast', sessionId: 'broadcast', memory: []
    });
    return `📣 *AI Global Broadcast*\n\n${post}`;
  }

  // ===== COMMUNICATION =====
  if (cmd === '/email') {
    // Format: /email to@email.com Subject line | Body text
    const rest = parts.slice(1).join(' ');
    const [toSubject, body] = rest.split('|');
    if (!toSubject || !body) return 'Usage: /email to@email.com Subject | Body text here';
    const [to, ...subjectParts] = toSubject.trim().split(' ');
    const subject = subjectParts.join(' ');
    return await sendEmail(to, subject, body.trim());
  }

  // ===== ASYNC PAYMENT + MONITOR COMMANDS =====
  if (cmd === '/payments' || cmd === '/revenue') return await payments.getFullPaymentReport();

  if (cmd === '/paystack') {
    const s = await payments.getPaystackStats();
    if (s.error) return `❌ ${s.error}`;
    let msg = `💚 *Paystack*\nBalance: ${s.balance}\nTxns: ${s.successfulTxns}/${s.totalTxns}\nRevenue: ${s.totalRevenue}`;
    if (s.recentTxns?.length) { msg += '\n\n*Recent:*\n'; s.recentTxns.forEach(t => { msg += `${t.email} — ${t.amount} (${t.status})\n`; }); }
    return msg;
  }

  if (cmd === '/stripe') {
    const s = await payments.getStripeStats();
    if (s.error) return `❌ ${s.error}`;
    let msg = `💜 *Stripe*\nBalance: ${s.balance}\nCharges: ${s.succeededCharges}/${s.totalCharges}\nRevenue: ${s.totalRevenue}`;
    if (s.recentCharges?.length) { msg += '\n\n*Recent:*\n'; s.recentCharges.forEach(c => { msg += `${c.email} — ${c.amount} (${c.status})\n`; }); }
    return msg;
  }

  if (cmd === '/github') return await github.getGitHubReport();

  if (cmd === '/today') {
    const events = await calendar.getTodayEvents();
    return `📅 *Today's Schedule*\n\n${events}`;
  }

  if (cmd === '/week') {
    const events = await calendar.getUpcomingEvents(7);
    return `📅 *This Week*\n\n${events}`;
  }

  if (cmd === '/uptime') {
    const { report } = await monitor.getUptimeReport();
    return report;
  }

  // ===== AI CONVERSATION (fallback) =====
  const memory = getMemory(sessionId);
  const response = await think({ message: raw, from, sessionId, memory });
  addToMemory(sessionId, { role: 'user', content: raw });
  addToMemory(sessionId, { role: 'assistant', content: response });
  // Apply sentiment prefix for stressed/urgent messages
  return sentiment.prefix + response;
}

// ============ TELEGRAM WEBHOOK ============
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const { message } = req.body;
  if (!message) return;
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const from = message.from?.first_name || 'Rabiu';
  const sessionId = String(chatId);

  if (!ownerChatId) { ownerChatId = String(chatId); process.env.OWNER_CHAT_ID = ownerChatId; }
  console.log(`[Telegram][${from}] ${text}`);
  await sendTyping(chatId);

  try {
    const response = await processUpdate(chatId, text, from, sessionId);
    await sendMessage(chatId, response);
  } catch (err) {
    console.error('Error:', err.message);
    await sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// ============ WHATSAPP (Twilio) ============
app.post('/whatsapp', async (req, res) => {
  try {
    const { Body, From, ProfileName } = req.body;
    const from = ProfileName || From || 'User';
    const sessionId = `wa_${From}`;
    const response = await processUpdate(null, Body || '', from, sessionId);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${String(response).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</Message></Response>`);
  } catch (err) {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: ${err.message}</Message></Response>`);
  }
});

// ============ PAYMENT WEBHOOK (Paystack/Stripe instant alerts) ============
app.post('/payment-alert', async (req, res) => {
  res.sendStatus(200);
  try {
    const { event, data } = req.body;
    if (event === 'charge.success' || event === 'payment_intent.succeeded') {
      const amount = data?.amount ? `₦${(data.amount / 100).toLocaleString()}` : data?.display_items?.[0]?.amount || '?';
      const email = data?.customer?.email || data?.receipt_email || data?.metadata?.email || 'Unknown';
      const target = ownerChatId || process.env.OWNER_CHAT_ID;
      if (target) await sendMessage(target, `💰 *Payment Received!*\n\nAmount: ${amount}\nFrom: ${email}\nEvent: ${event}\n\nYour ecosystem is making money! 🚀`);
    }
  } catch (err) { console.error('Payment alert error:', err.message); }
});

// ============ NOTIFY ENDPOINT ============
app.post('/notify', async (req, res) => {
  const { message, secret } = req.body;
  if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const target = ownerChatId || process.env.OWNER_CHAT_ID;
  if (!target) return res.status(400).json({ error: 'Send /start to Maganu on Telegram first to register your chat ID.' });
  await sendMessage(target, message);
  res.json({ ok: true });
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    name: 'Maganu Agent', version: '3.2.0', status: 'online',
    model: 'Groq Llama 3.3 70B', owner: 'Rabiu Hamza — Harz Ecosystem',
    knowledge: 'OMEGA Master Synthesis (Physics, Biology, Humanities, Tech, Mars Colony)',
    capabilities: 26, commands: 35,
    features: ['Telegram', 'WhatsApp', 'Persistent Memory', 'Stripe', 'Paystack', 'GitHub', 'Vercel', 'Netlify', 'Render', 'Railway', 'Google Calendar', 'Task Manager', 'Uptime Monitor', 'Content Generator', 'Social Posts', 'Book Chapters', 'Web Search', 'Deep Research', 'Competitor Analysis', 'Code Review', 'Architecture Review', 'Doc Summarizer', 'Sentiment Analysis', 'Email (Gmail)', 'Analytics', 'Revenue Alerts'],
    scheduler: scheduler.getStatus()
  });
});

// ============ WEBHOOK SETUP ============
async function setWebhook(url) {
  try {
    const r = await axios.post(`${TELEGRAM_API}/setWebhook`, { url: `${url}/webhook`, allowed_updates: ['message'] });
    console.log('Webhook:', r.data.description);
  } catch (err) { console.error('Webhook error:', err.message); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v3.2.0 — port ${PORT} | 26 capabilities | 35 commands`);
  scheduler.start();
  await setWebhook(process.env.WEBHOOK_URL || 'https://maganu-agent.onrender.com');
});

module.exports = app;
