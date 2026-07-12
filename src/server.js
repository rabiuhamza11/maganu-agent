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
const crm = require('./services/crm');
const nigerian = require('./services/nigerian');
const learning = require('./services/learning');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
let ownerChatId = process.env.OWNER_CHAT_ID || null;

// ============ HELPERS ============
async function sendMessage(chatId, text) {
  const MAX = 4096;
  const safe = String(text || '(empty)');
  for (let i = 0; i < safe.length; i += MAX) {
    const chunk = safe.slice(i, i + MAX);
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

async function sendEmail(to, subject, body) {
  try {
    const token = process.env.GOOGLECALENDAR_ACCESS_TOKEN;
    if (!token) return '⚠️ Google token not connected.';
    const raw = Buffer.from(`To: ${to}\nSubject: ${subject}\nContent-Type: text/plain\n\n${body}`).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    return `✅ Email sent to ${to}`;
  } catch (err) {
    return `❌ Email failed: ${err.response?.data?.error?.message || err.message}`;
  }
}

// ============ MASTER COMMAND PROCESSOR ============
async function processUpdate(chatId, text, from, sessionId) {
  const raw = (text || '').trim();
  const parts = raw.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rest = args.join(' ');

  const sentiment = research.analyzeSentiment(raw);

  // ===== SYSTEM =====
  if (cmd === '/start') return `👋 *Maganu v4.0 — Ultimate Edition*\n\nHey ${from}! I'm your personal AI agent with:\n\n56 capabilities | 50+ commands\nOMEGA Master Knowledge\nFull Harz Ecosystem access\n\nType /help to see everything.`;

  if (cmd === '/clear') { clearMemory(sessionId); return '🧹 Memory cleared!'; }

  if (cmd === '/status') return `🟢 *Maganu v4.0 Online*\n\n56 Capabilities loaded ✅\nModel: Groq Llama 3.3 70B\nKnowledge: OMEGA Master Synthesis\nMemory: Persistent\nScheduler: 4 automations\nPayments: Stripe + Paystack\nDeploy: Vercel+Netlify+Render+Railway\nCRM: Active\nNigerian Tools: Active\nLearning Engine: Active\nAnalytics: Active\nResearch: Active\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu. 🔥`;

  if (cmd === '/help') {
    return `🤖 *Maganu v4.0 — 50+ Commands*\n\n*System*\n/status /ecosystem /clear\n\n*Payments*\n/payments /paystack /stripe /revenue\n\n*Deploy*\n/repos /github /commit [repo] [msg]\n/deploy [repo] — Vercel\n/netlify [repo] — Netlify\n/render [repo] — Render\n/railway [repo] — Railway\n/logs [id] — Render logs\n\n*Productivity*\n/today /week\n/tasks /addtask [text]\n/done [id] /deltask [id]\n\n*CRM*\n/crm — client dashboard\n/addclient [name] | [project]\n/followup [name] | [days] | [note]\n/invoice [client] | [desc] | [amount]\n/leads — view logged leads\n\n*Nigerian Tools*\n/vat [amount] — calculate VAT\n/wht [amount] | [type] — withholding tax\n/firs — compliance checklist\n/cbn — CBN policy context\n/rate — live NGN/USD rate\n/nginvoice [client] | [desc] | [amount]\n\n*Research*\n/search [query]\n/research [topic]\n/competitor [company]\n/review [code]\n/arch [description]\n/summarize [text]\n\n*Analytics*\n/traffic [repo]\n/codestats /market /digest\n\n*Learning*\n/techdigest — daily AI/tech news\n/skill — weekly skill lesson\n/flashcard — OMEGA knowledge quiz\n/books [your context]\n\n*Business*\n/launch [product] | [description]\n/pricing [product] | [goal] | [cost]\n/abtest [product] | [audience]\n/names [idea] | [industry]\n\n*Habits*\n/habits — habit dashboard\n/addhabit [name]\n/habit [name] — log today\n\n*Content*\n/chapter /promo\n/post [platform] [topic]\n/broadcast [topic]\n\n*Communication*\n/email [to] [subject] | [body]\n/uptime /scheduler`;
  }

  if (cmd === '/ecosystem') return `🌐 *Harz Ecosystem — 10/10*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`;

  // ===== TASKS =====
  if (cmd === '/tasks') return tasks.formatTaskList();
  if (cmd === '/addtask') { if (!rest) return 'Usage: /addtask [task]'; const t = tasks.addTask(rest); return `✅ Added: "${t.text}" [${String(t.id).slice(-4)}]`; }
  if (cmd === '/done') { const t = tasks.completeTask(args[0]); return t ? `✅ Done: "${t.text}"` : `❌ Task not found.`; }
  if (cmd === '/deltask') { return tasks.deleteTask(args[0]) ? `🗑 Deleted.` : `❌ Not found.`; }

  // ===== DEPLOY =====
  if (cmd === '/repos') { const r = await deploy.listRepos(); if (!r.length) return '❌ No repos found.'; let m = `🐙 *Repos (${r.length})*\n\n`; r.slice(0,15).forEach(x => { m += `${x.private?'🔒':'🌐'} ${x.name} — ${x.language} ⭐${x.stars}\n`; }); return m; }
  if (cmd === '/deploy') { if (!args[0]) return 'Usage: /deploy [repo]'; const r = await deploy.deployVercel(args[0]); return r.ok ? `🚀 Vercel deploying: ${args[0]}\n${r.url}` : `❌ ${r.error}`; }
  if (cmd === '/netlify') { if (!args[0]) return 'Usage: /netlify [repo]'; const r = await deploy.deployNetlify(args[0]); return r.ok ? `🚀 Netlify deploying: ${args[0]}\n${r.url}` : `❌ ${r.error}`; }
  if (cmd === '/render') { if (!args[0]) return 'Usage: /render [repo]'; const r = await deploy.deployRender(args[0]); return r.ok ? `🚀 Render deploying: ${args[0]}\n${r.url}` : `❌ ${r.error}`; }
  if (cmd === '/railway') { if (!args[0]) return 'Usage: /railway [repo]'; const r = await deploy.deployRailway(args[0]); return r.ok ? `🚀 Railway deploying: ${args[0]}\n${r.url}` : `❌ ${r.error}`; }
  if (cmd === '/commit') { const repo = args[0]; const msg = args.slice(1).join(' '); if (!repo||!msg) return 'Usage: /commit [repo] [message]'; const r = await deploy.triggerCommit(repo, msg); return r.ok ? `✅ ${r.message}` : `❌ ${r.error}`; }
  if (cmd === '/logs') { const id = args[0]||'srv-d99er9reo5us738eskk0'; return `📋 *Render Logs*\n\n${await deploy.getRenderLogs(id)}`; }

  // ===== CRM =====
  if (cmd === '/crm') return crm.formatCRM();
  if (cmd === '/leads') { const leads = crm.listLeads(); if (!leads.length) return '📋 No leads yet.'; let m = `🎯 *Recent Leads (${leads.length})*\n\n`; leads.forEach(l => { m += `${l.from}: ${l.message.slice(0,50)}...\n`; }); return m; }

  if (cmd === '/addclient') {
    const [name, project] = rest.split('|').map(s => s?.trim());
    if (!name) return 'Usage: /addclient [name] | [project]';
    const c = crm.addClient(name, project || 'General', '', '');
    return `✅ Client added: ${c.name} — ${c.project}`;
  }

  if (cmd === '/followup') {
    const [name, days, note] = rest.split('|').map(s => s?.trim());
    if (!name || !days) return 'Usage: /followup [name] | [days] | [note]';
    const fu = crm.addFollowup(name, parseInt(days), note || '');
    return `⏰ Follow-up set: ${fu.name}\nDue: ${fu.dueDateStr}\nNote: ${fu.note || 'None'}`;
  }

  if (cmd === '/invoice') {
    const [client, desc, amount] = rest.split('|').map(s => s?.trim());
    if (!client || !amount) return 'Usage: /invoice [client] | [description] | [amount]';
    const items = [{ desc: desc || 'Services', qty: 1, rate: parseFloat(amount) || 0 }];
    return crm.generateInvoice(client, items);
  }

  // ===== NIGERIAN TOOLS =====
  if (cmd === '/vat') {
    const amount = parseFloat(args[0]?.replace(/,/g, ''));
    if (!amount) return 'Usage: /vat [amount]\nExample: /vat 50000';
    const v = nigerian.calculateVAT(amount);
    return `🧮 *VAT Calculation*\n\n${v.formatted}`;
  }

  if (cmd === '/wht') {
    const [amount, type] = rest.split('|').map(s => s?.trim());
    if (!amount) return 'Usage: /wht [amount] | [type]\nTypes: consulting, construction, rent, royalties';
    const w = nigerian.calculateWHT(parseFloat(amount.replace(/,/g,'')), type || 'consulting');
    return `🧮 *WHT Calculation*\n\n${w.formatted}\nService type: ${type || 'consulting'} (${w.whtRate})`;
  }

  if (cmd === '/firs') return nigerian.getFIRSChecklist();
  if (cmd === '/cbn') return nigerian.getCBNContext();

  if (cmd === '/rate') {
    const d = await nigerian.getExchangeRate();
    return `📈 *Exchange Rates*\n\nUSD/NGN: ₦${d.usdNgn?.toFixed ? d.usdNgn.toFixed(0) : d.usdNgn}\nGBP/NGN: ₦${d.gbpNgn?.toFixed ? d.gbpNgn.toFixed(0) : d.gbpNgn}\nSource: ${d.source}`;
  }

  if (cmd === '/nginvoice') {
    const [client, desc, amount] = rest.split('|').map(s => s?.trim());
    if (!client || !amount) return 'Usage: /nginvoice [client] | [description] | [amount]';
    return nigerian.formatNigerianInvoice(client, desc || 'Professional Services', parseFloat(amount.replace(/,/g,'')));
  }

  // ===== LEARNING =====
  if (cmd === '/techdigest') return await learning.getDailyTechDigest();
  if (cmd === '/skill') return await learning.getSkillLesson();

  if (cmd === '/flashcard') {
    const card = learning.getFlashcard();
    return `🧠 *OMEGA Flashcard*\n\n*Q:* ${card.q}\n\n_Reply "answer" to reveal_`;
  }
  if (raw.toLowerCase() === 'answer') {
    const card = learning.getFlashcard();
    return `✅ *Answer:*\n\n${card.a}`;
  }

  if (cmd === '/books') {
    if (!rest) return 'Usage: /books [your context]\nExample: /books building a SaaS startup in Nigeria';
    return await learning.getBookRec(rest);
  }

  // ===== BUSINESS TOOLS =====
  if (cmd === '/launch') {
    const [product, desc] = rest.split('|').map(s => s?.trim());
    if (!product) return 'Usage: /launch [product name] | [description]';
    return await learning.generateLaunchPlan(product, desc || '');
  }

  if (cmd === '/pricing') {
    const [product, goal, cost] = rest.split('|').map(s => s?.trim());
    if (!product) return 'Usage: /pricing [product] | [revenue goal] | [cost per user]';
    return await learning.getPricingAdvice(product, goal || 'not specified', cost || 'not specified');
  }

  if (cmd === '/abtest') {
    const [product, audience] = rest.split('|').map(s => s?.trim());
    if (!product) return 'Usage: /abtest [product] | [target audience]';
    return await learning.generateABTest(product, audience || 'general');
  }

  if (cmd === '/names') {
    const [idea, industry] = rest.split('|').map(s => s?.trim());
    if (!idea) return 'Usage: /names [idea] | [industry]';
    return await learning.generateBusinessNames(idea, industry || 'tech');
  }

  // ===== HABITS =====
  if (cmd === '/habits') return learning.getHabitReport();
  if (cmd === '/addhabit') { if (!rest) return 'Usage: /addhabit [habit name]'; const h = learning.addHabit(rest); return `✅ Habit added: "${h.name}"\nLog daily with: /habit ${h.name}`; }
  if (cmd === '/habit') { if (!rest) return 'Usage: /habit [name]'; const r = learning.logHabit(rest); if (!r) return `❌ Habit "${rest}" not found. Add with /addhabit`; return r.alreadyLogged ? `✅ Already logged today: ${r.habit.name}` : `🔥 *${r.habit.name}* logged!\nStreak: ${r.habit.streak} days`; }

  // ===== RESEARCH =====
  if (cmd === '/search') { if (!rest) return 'Usage: /search [query]'; return `🔍 *${rest}*\n\n${await (async()=>{try{const r=await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(rest)}&format=json&no_html=1`,{timeout:8000});const d=r.data;const p=[];if(d.AbstractText)p.push(d.AbstractText);(d.RelatedTopics||[]).slice(0,3).forEach(t=>{if(t.Text)p.push(t.Text);});return p.join('\n\n')||'No results — try rephrasing.';}catch(e){return 'Search error: '+e.message;}})()||'No results.'}`; }
  if (cmd === '/research') { if (!rest) return 'Usage: /research [topic]'; return await research.deepResearch(rest); }
  if (cmd === '/competitor') { if (!rest) return 'Usage: /competitor [company]'; return await research.analyzeCompetitor(rest); }
  if (cmd === '/review') { if (!rest) return 'Usage: /review [paste code]'; return await research.reviewCode(rest); }
  if (cmd === '/arch') { if (!rest) return 'Usage: /arch [system description]'; return await research.reviewArchitecture(rest); }
  if (cmd === '/summarize') { if (!rest) return 'Usage: /summarize [paste text]'; return await research.summarizeDocument(rest); }

  // ===== ANALYTICS =====
  if (cmd === '/traffic') { if (!args[0]) return 'Usage: /traffic [repo]'; const t = await analytics.getRepoTraffic(args[0]); if(t.error) return `❌ ${t.error}`; return `📊 *${t.repo} Traffic*\nViews: ${t.views} (${t.uniqueViews} unique)\nClones: ${t.clones} (${t.uniqueClones} unique)\nReferrers: ${t.topReferrers.join(', ')||'None'}`; }
  if (cmd === '/codestats') { const s = await analytics.getDailyCodeStats(); if(s.error) return `❌ ${s.error}`; return `💻 *Code Stats Today*\nCommits: ${s.commits}\nRepos active: ${s.reposActive.join(', ')||'None'}`; }
  if (cmd === '/market') { const d = await nigerian.getExchangeRate(); return `📈 *Market Data*\nUSD/NGN: ₦${d.usdNgn?.toFixed?d.usdNgn.toFixed(0):d.usdNgn}\nSource: ${d.source}`; }
  if (cmd === '/digest') return await analytics.getWeeklyDigest(payments);

  // ===== PAYMENTS =====
  if (cmd === '/payments' || cmd === '/revenue') return await payments.getFullPaymentReport();
  if (cmd === '/paystack') { const s = await payments.getPaystackStats(); if(s.error) return `❌ ${s.error}`; return `💚 *Paystack*\nBalance: ${s.balance}\nTxns: ${s.successfulTxns}/${s.totalTxns}\nRevenue: ${s.totalRevenue}`; }
  if (cmd === '/stripe') { const s = await payments.getStripeStats(); if(s.error) return `❌ ${s.error}`; return `💜 *Stripe*\nBalance: ${s.balance}\nCharges: ${s.succeededCharges}/${s.totalCharges}\nRevenue: ${s.totalRevenue}`; }

  // ===== CALENDAR =====
  if (cmd === '/today') return `📅 *Today*\n\n${await calendar.getTodayEvents()}`;
  if (cmd === '/week') return `📅 *This Week*\n\n${await calendar.getUpcomingEvents(7)}`;

  // ===== GITHUB =====
  if (cmd === '/github') return await github.getGitHubReport();

  // ===== MONITOR =====
  if (cmd === '/uptime') { const { report } = await monitor.getUptimeReport(); return report; }

  // ===== CONTENT =====
  if (cmd === '/chapter') return content.getTodayChapter();
  if (cmd === '/promo') { const p = content.getTodayPromoTarget(); return await content.generatePromoPost(p.name, p.desc, p.url); }
  if (cmd === '/post') { const platform = args[0]; const topic = args.slice(1).join(' '); if(!platform||!topic) return 'Usage: /post [platform] [topic]'; return await content.generateSocialPost(platform, topic); }
  if (cmd === '/broadcast') { const topic = rest || 'Harz Ecosystem update'; return await think({ message: `Write a broadcast message for AI Global WhatsApp channel about: ${topic}. 4-5 lines, energizing, clear CTA.`, from: 'broadcast', sessionId: 'broadcast', memory: [] }); }

  // ===== COMMUNICATION =====
  if (cmd === '/email') {
    const [toSubj, body] = rest.split('|');
    if (!toSubj||!body) return 'Usage: /email [to@email.com Subject] | [body]';
    const [to, ...subj] = toSubj.trim().split(' ');
    return await sendEmail(to, subj.join(' '), body.trim());
  }

  if (cmd === '/scheduler') { const s = scheduler.getStatus(); let m=`📅 *Scheduler*\n\n`; s.automations.forEach(a=>{m+=`✅ ${a.name.replace(/_/g,' ')} — ${a.schedule}\n`;}); return m; }

  // ===== AI FALLBACK =====
  const memory = getMemory(sessionId);
  const response = await think({ message: raw, from, sessionId, memory });
  addToMemory(sessionId, { role: 'user', content: raw });
  addToMemory(sessionId, { role: 'assistant', content: response });
  return sentiment.prefix + response;
}

// ============ TELEGRAM WEBHOOK ============
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const { message } = req.body;
  if (!message?.text) return;
  const chatId = message.chat.id;
  const text = message.text.trim();
  const from = message.from?.first_name || 'Rabiu';
  const sessionId = String(chatId);
  if (!ownerChatId) { ownerChatId = String(chatId); process.env.OWNER_CHAT_ID = ownerChatId; console.log('Owner registered:', chatId); }
  console.log(`[TG][${from}] ${text.slice(0,80)}`);
  await sendTyping(chatId);
  try {
    const r = await processUpdate(chatId, text, from, sessionId);
    await sendMessage(chatId, r);
  } catch (err) { await sendMessage(chatId, `❌ ${err.message}`); }
});

// ============ PAYMENT ALERT WEBHOOK ============
app.post('/payment-alert', async (req, res) => {
  res.sendStatus(200);
  try {
    const { event, data } = req.body;
    if (!['charge.success','payment_intent.succeeded','charge.completed'].includes(event)) return;
    const amount = data?.amount ? `₦${(data.amount/100).toLocaleString()}` : '?';
    const email = data?.customer?.email || data?.receipt_email || data?.metadata?.email || 'Unknown';
    const target = ownerChatId || process.env.OWNER_CHAT_ID;
    if (target) await sendMessage(target, `💰 *New Payment!*\n\nAmount: ${amount}\nFrom: ${email}\nEvent: ${event}\n\n🚀 Harz Ecosystem is making money!`);
  } catch (err) { console.error('Payment alert:', err.message); }
});

// ============ NOTIFY ============
app.post('/notify', async (req, res) => {
  const { message, secret } = req.body;
  if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const target = ownerChatId || process.env.OWNER_CHAT_ID;
  if (!target) return res.status(400).json({ error: 'Send /start to Maganu on Telegram first.' });
  await sendMessage(target, message);
  res.json({ ok: true });
});

// ============ HEALTH ============
app.get('/', (req, res) => {
  res.json({ name: 'Maganu Agent', version: '4.0.0', status: 'online', capabilities: 56, commands: 50, owner: 'Rabiu Hamza', scheduler: scheduler.getStatus() });
});

// ============ WEBHOOK SETUP ============
async function setWebhook(url) {
  try { const r = await axios.post(`${TELEGRAM_API}/setWebhook`, { url: `${url}/webhook`, allowed_updates: ['message'] }); console.log('Webhook:', r.data.description); }
  catch (err) { console.error('Webhook error:', err.message); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v4.0.0 — port ${PORT} | 56 capabilities | 50+ commands`);
  scheduler.start();
  await setWebhook(process.env.WEBHOOK_URL || 'https://maganu-agent.onrender.com');
});

module.exports = app;
