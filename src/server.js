require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { think } = require('./services/brain');
const { getMemory, addToMemory, clearMemory, getSummary, setSummary, shouldSummarise, CONTEXT_WINDOW } = require('./services/memory');
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
const intelligence = require('./services/intelligence');
const writer = require('./services/writer');
const memExt = require('./services/memory_extended');
const devtools = require('./services/devtools');
const financial = require('./services/financial');
const builder = require('./services/builder-commands');
const banking = require('./services/banking');
const bankManager = require("./services/bank-manager");
const bankOps = require("./services/bank-ops");
const security = require('./services/security');
const aiCreative = require('./services/ai-creative');
const bizOps = require('./services/business');
const analyticsSvc = require('./services/analytics');
const blockchainSvc = require('./services/blockchain');
const backupSvc = require('./services/backup');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(function(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
let ownerChatId = process.env.OWNER_CHAT_ID || null;

async function sendMessage(chatId, text) {
  const MAX = 4096;
  const safe = String(text || '(empty)');
  for (let i = 0; i < safe.length; i += MAX) {
    const chunk = safe.slice(i, i + MAX);
    try { await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk, parse_mode: 'Markdown' }); }
    catch (_) { try { await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk }); } catch (e) { console.error('Send:', e.message); } }
  }
}

async function sendTyping(chatId) {
  try { await axios.post(`${TELEGRAM_API}/sendChatAction`, { chat_id: chatId, action: 'typing' }); } catch (_) {}
}

async function sendEmail(to, subject, body) {
  try {
    const token = process.env.GOOGLECALENDAR_ACCESS_TOKEN;
    if (!token) return '⚠️ Google token not connected.';
    const raw = Buffer.from(`To: ${to}\nSubject: ${subject}\nContent-Type: text/plain\n\n${body}`).toString('base64').replace(/\+/g,'-').replace(/\//g,'_');
    await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    return `✅ Email sent to ${to}`;
  } catch (err) { return `❌ Email failed: ${err.response?.data?.error?.message || err.message}`; }
}

// ============ MASTER COMMAND PROCESSOR ============
async function processUpdate(chatId, text, from, sessionId) {
  const raw = (text || '').trim();
  const parts = raw.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rest = args.join(' ');
  const [a1, a2, a3, a4] = rest.split('|').map(s => s?.trim());

  const sentiment = research.analyzeSentiment(raw);

  // ===== SYSTEM =====
  if (cmd === '/start') return `\U0001f44b *Maganu v7.3 — Financial Edition*\n\nHey ${from}!\n\n500+ capabilities | 275+ commands\n\u26a0\ufe0f Financial Transactions: ENABLED\n\U0001f4b3 Payment Gateways: Paystack + Stripe + Flutterwave\n\U0001f4b8 Transfers, Refunds, Payment Links\nOMEGA Master Knowledge loaded\nFull Harz Ecosystem control\n\nType /help for all commands or /gateway for payment status.`;

  if (cmd === '/clear') { clearMemory(sessionId); return '🧹 Memory cleared! (conversation history + long-term summary reset)'; }
  if (cmd === '/memory') {
    const mem = getMemory(sessionId);
    const sum = getSummary(sessionId);
    let msg = `🧠 *Maganu Memory Status*\n\nSession: ${sessionId}\nMessages stored: ${mem.length} (last ${CONTEXT_WINDOW} sent to AI)\n`;
    if (sum) msg += `Long-term summary: ✅ (${sum.updated?.slice(0,10)||'recent'})\n\nSummary:\n${sum.text?.slice(0,400)}...`;
    else msg += 'Long-term summary: None yet (auto-generates after 30 messages)';
    return msg;
  }

  if (cmd === '/status') return `\U0001f7e2 *Maganu v7.3 Online*\n\n500+ capabilities | 275+ commands\nModel: Groq llama-4-scout (30k TPM)\nKnowledge: OMEGA Master Synthesis\nMemory: Persistent\nScheduler: 4 automations\n\U0001f4b3 Payments: Stripe + Paystack + Flutterwave\n\U0001f4b8 Financial: Transfers, Refunds, Payment Links\n\U0001f577\ufe0f Deploy: Vercel+Netlify+Render+Railway\nCRM + Nigerian Tools\nLearning + Habits\nIntelligence: Crypto, Domains, SSL\nWriter: Proposals, SOPs, Scripts, Ads\nStrategy: Market sizing, Pivots, Exit\nSecurity: Password, Audit\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu. \U0001f525`;

  if (cmd === '/help') return `🤖 *Maganu v7.3 — 170+ Commands*

*System*
/status /ecosystem /dashboard /clear

*Platforms*
/harzdm /buildbot /contentpilot /nexal
/omega /tradeos /maganu /hostmaster /oracle

*Deploy & GitHub*
/repos /deploy [repo] /netlify [repo]
/render [repo] /railway [repo]
/commit [repo] [msg] /newrepo [name]
/pushfile [repo] [file] [content]
/redeploy /logs

*Payments*
/payments /paystack /stripe /revenue\n*Financial*\n/pay [email] [amt] [cur] | [desc]\n/transfer [amt] | [recipient] | [reason]\n/recipient [name] | [acct] | [bank]\n/verify [acct] | [bank]\n/banks /refund [ref] | [amt]\n/txn [ref] /finalize [code] | [otp]\n/flw [amt] | [email] | [name] | [phone]\n/gateway
*Bank Manager*
/mdashboard /mstmt [days] /mtransfers
/mrisk /msettlements /mcustomers
/mrecipients /mreport [weekly|monthly]
*Universal Banks*
/bankinfo [name|code|ussd] /banklist
/ussd [bank] /swift [bank]
/quicksend [amt]|[acct]|[bank]|[reason]
/bulksend /bankcompare /banksintl
/iban /transferstatus /acchistory /bankstats
/mwallet
/mrr [customers] | [price]
/roi [invest] [returns]
/forecast [mrr] [growth%] [months]

*Finance & Math*
/vat [amount] /wht [amount] | [type]
/convert [amt] [from] [to]
/margin [cost] [price]
/break [fixed] [var] [price]
/compound [principal] [rate] [years]
/calc [expression]

*Nigerian Tools*
/firs /cbn /rate /nginvoice
/cac /naira [USD amount]
/nigeriannews

*Research & Intel*
/search [query] /news [topic]
/research [topic] /crypto
/domain [name] /ssl [domain]
/trending /funding /producthunt
/competitor [company]

*Content & Writer*
/thread [topic] /linkedin [topic]|[audience]
/ad [platform]|[product]|[audience]
/youtube [title]|[niche]
/podcast [topic]|[audience]
/newsletter [platform]|[highlights]
/calendar30 [platform]|[topic]
/drip [product]|[audience]
/broadcast /wamsg [msg] /caption [platform]|[topic]
/post [platform] [topic] /promo /chapter

*Business Docs*
/proposal [client]|[project]|[budget]
/sop [process]|[steps]
/jd [role]|[company]|[reqs]
/press [headline]|[product]|[detail]
/contract [text] /invoice [client]|[desc]|[amt]
/template invoice|proposal|nda
/pitch [product]|[audience]|[problem]

*Strategy*
/pivot [idea]|[problem]
/tam [idea]|[geography]
/features [product]|[backlog]
/exit [platform]|[metrics]
/launch [product]|[desc]
/pricing [product]|[goal]|[cost]
/names [idea]|[industry]
/abtest [product]|[audience]

*Planning*
/sprint [project]|[goal]|[days]
/milestone [project]|[ms]|[deadline]
/standup [project]|[yesterday]|[today]|[blockers]
/goals /goal [title]|[date]|[desc]
/progress [goal]|[pct]|[note]
/tasks /addtask [task] /done [id] /deltask [id]
/delegate [task]|[who]|[date]
/delegations /weeklyreview

*Mindset*
/quote /affirmation /challenge
/morning /focus [priority]
/energy [1-10] /energyreport
/gratitude [1]|[2]|[3]
/habits /addhabit [name] /habit [name]

*Dev Tools*
/api [GET/POST] [url] /json [text]
/sql [desc]|[db] /regex [desc]
/error [stacktrace] /data [paste]
/review [code] /arch [desc]
/secaudit [codebase] /password [pw]

*Knowledge*
/know [topic] /omega1000 [topic]
/summarize [text] /books [context]
/flashcard /skill /techdigest

*Analytics*
/traffic [repo] /codestats
/github /uptime /market
/digest

*Calendar*
/today /week

*CRM*
/crm /addclient [name]|[project]
/followup [name]|[days]|[note]
/leads /network /connect [name]|[role]

*Comms*
/email [to subject]|[body]
/scheduler

*Security*
/password [pw] /secaudit [codebase]

Or just chat naturally — I understand plain language.`;


  if (cmd === '/ecosystem') return `🌐 *Harz Ecosystem — 10/10*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`;

  // ===== TASKS =====
  if (cmd === '/tasks') return tasks.formatTaskList();
  if (cmd === '/addtask') { if (!rest) return 'Usage: /addtask [task]'; const t = tasks.addTask(rest); return `✅ Added: "${t.text}" [${String(t.id).slice(-4)}]`; }
  if (cmd === '/done') { const t = tasks.completeTask(args[0]); return t ? `✅ Done: "${t.text}"` : `❌ Task not found.`; }
  if (cmd === '/deltask') { return tasks.deleteTask(args[0]) ? `🗑 Deleted.` : `❌ Not found.`; }

  // ===== DEPLOY =====
  if (cmd === '/repos' || cmd === '/git') {
    const github = require('./services/github');
    if (!rest && cmd === '/git') return await github.getGitHubReport();
    if (cmd === '/repos') return await github.getGitHubReport();
    // /git [subcommand] [arg1] | [arg2] | [arg3]
    const parts = rest ? rest.split('|').map(s => s.trim()) : [];
    const sub = parts[0] || '';
    const subArgs = parts.slice(1);
    return await github.handleGitHubCommand(sub, subArgs);
  }
  if (cmd === '/git-create') {
    const github = require('./services/github');
    if (!a1) return '❌ Usage: /git-create [repo-name] | [description]';
    const parts = rest.split('|').map(s=>s.trim());
    const r = await github.createRepo(parts[0], parts[1] || '', false);
    if (r.error) return `❌ Failed: ${r.error}`;
    return `✅ *Repo Created!*\n\n${r.name}\n${r.url}`;
  }
  if (cmd === '/git-release') {
    const github = require('./services/github');
    const parts = (rest||'').split('|').map(s=>s.trim());
    if (!parts[0] || !parts[1]) return '❌ Usage: /git-release [repo] | [tag] | [title]';
    const r = await github.createRelease(parts[0], parts[1], parts[2] || parts[1]);
    if (r.error) return `❌ Failed: ${r.error}`;
    return `✅ Release *${r.tag}* live!\n${r.url}`;
  }
  if (cmd === '/git-list') {
    const github = require('./services/github');
    const repos = await github.listRepos();
    if (repos.error) return `❌ ${repos.error}`;
    return `🐙 *Repos (${repos.length}):*\n\n` + repos.slice(0,15).map((r,i)=>`${i+1}. ${r.name} — ${r.language||'N/A'}`).join('\n');
  }
  if (cmd === '/deploy') { if (!args[0]) return 'Usage: /deploy [repo]'; const r = await deploy.deployVercel(args[0]); return r.ok?`🚀 Vercel: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/netlify') { if (!args[0]) return 'Usage: /netlify [repo]'; const r = await deploy.deployNetlify(args[0]); return r.ok?`🚀 Netlify: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/render') { if (!args[0]) return 'Usage: /render [repo]'; const r = await deploy.deployRender(args[0]); return r.ok?`🚀 Render: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/railway') { if (!args[0]) return 'Usage: /railway [repo]'; const r = await deploy.deployRailway(args[0]); return r.ok?`🚀 Railway: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/commit') { const repo=args[0]; const msg=args.slice(1).join(' '); if(!repo||!msg) return 'Usage: /commit [repo] [message]'; const r=await deploy.triggerCommit(repo,msg); return r.ok?`✅ ${r.message}`:`❌ ${r.error}`; }
  if (cmd === '/logs') { const id=args[0]||'srv-d99er9reo5us738eskk0'; return `📋 *Render Logs*\n\n${await deploy.getRenderLogs(id)}`; }
  if (cmd === '/newrepo') { const name=args[0]; const desc=args.slice(1).join(' '); if(!name) return 'Usage: /newrepo [name] [description]'; const r=await deploy.createRepo(name,desc); return r.ok?`🐙 Repo created!\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/redeploy') { const id=args[0]||'srv-d99er9reo5us738eskk0'; const r=await deploy.redeploy(id); return r.ok?`🔄 Redeploy triggered!\nDeploy ID: ${r.deployId}`:`❌ ${r.error}`; }
  if (cmd === '/pushfile') { const repo=args[0]; const file=args[1]; const content=args.slice(2).join(' '); if(!repo||!file||!content) return 'Usage: /pushfile [repo] [filepath] [content]'; const r=await deploy.createOrUpdateFile(repo,file,content,`Update ${file} via Maganu`); return r.ok?`✅ ${r.message}`:`❌ ${r.error}`; }

  // ===== CRM =====
  if (cmd === '/crm') return crm.formatCRM();
  if (cmd === '/leads') { const leads=crm.listLeads(); if(!leads.length) return '📋 No leads yet.'; let m=`🎯 *Leads (${leads.length})*\n\n`; leads.forEach(l=>{m+=`${l.from}: ${l.message.slice(0,50)}\n`;}); return m; }
  if (cmd === '/addclient') { if(!a1) return 'Usage: /addclient [name] | [project]'; const c=crm.addClient(a1,a2||'General'); return `✅ Client: ${c.name} — ${c.project}`; }
  if (cmd === '/followup') { if(!a1||!a2) return 'Usage: /followup [name] | [days] | [note]'; const fu=crm.addFollowup(a1,parseInt(a2),a3); return `⏰ Follow-up: ${fu.name} — due ${fu.dueDateStr}`; }
  if (cmd === '/invoice') { if(!a1||!a3) return 'Usage: /invoice [client] | [desc] | [amount]'; return crm.generateInvoice(a1,[{desc:a2||'Services',qty:1,rate:parseFloat(a3)||0}]); }

  // ===== NIGERIAN TOOLS =====
  if (cmd === '/vat') { const amt=parseFloat(args[0]?.replace(/,/g,'')); if(!amt) return 'Usage: /vat [amount]'; const v=nigerian.calculateVAT(amt); return `🧮 *VAT*\n\n${v.formatted}`; }
  if (cmd === '/wht') { if(!a1) return 'Usage: /wht [amount] | [type]'; const w=nigerian.calculateWHT(parseFloat(a1.replace(/,/g,'')),a2||'consulting'); return `🧮 *WHT*\n\n${w.formatted}`; }
  if (cmd === '/firs') return nigerian.getFIRSChecklist();
  if (cmd === '/cbn') return nigerian.getCBNContext();
  if (cmd === '/rate') { const d=await nigerian.getExchangeRate(); return `📈 *Rates*\nUSD/NGN: ₦${Math.round(d.usdNgn)}\nGBP/NGN: ₦${Math.round(d.gbpNgn)}\nSource: ${d.source}`; }
  if (cmd === '/nginvoice') { if(!a1||!a3) return 'Usage: /nginvoice [client] | [desc] | [amount]'; return nigerian.formatNigerianInvoice(a1,a2||'Services',parseFloat(a3.replace(/,/g,''))); }

  // ===== INTELLIGENCE =====
  if (cmd === '/crypto') { const coins=args.length?args.map(c=>c.toLowerCase()):['bitcoin','ethereum','binancecoin','solana']; return await intelligence.getCryptoPrices(coins); }
  if (cmd === '/domain') { if(!args[0]) return 'Usage: /domain [name]\nExample: /domain harzdm'; return await intelligence.formatDomainCheck(args[0]); }
  if (cmd === '/ssl') { if(!args[0]) return 'Usage: /ssl [domain]'; return await intelligence.checkSSL(args[0]); }
  if (cmd === '/trending') return await intelligence.getGitHubTrending();
  if (cmd === '/funding') return await intelligence.getFundingNews();
  if (cmd === '/producthunt') return await intelligence.getProductHuntDaily();

  // ===== RESEARCH =====
  if (cmd === '/search') { if(!rest) return 'Usage: /search [query]'; try{const r=await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(rest)}&format=json&no_html=1`,{timeout:8000});const d=r.data;const p=[];if(d.AbstractText)p.push(d.AbstractText);(d.RelatedTopics||[]).slice(0,3).forEach(t=>{if(t.Text)p.push(t.Text);});return `🔍 *${rest}*\n\n${p.join('\n\n')||'No results found.'}`;}catch(e){return `🔍 ${rest}\n\nSearch error: ${e.message}`;} }
  if (cmd === '/research') { if(!rest) return 'Usage: /research [topic]'; return await research.deepResearch(rest); }
  if (cmd === '/competitor') { if(!rest) return 'Usage: /competitor [company]'; return await research.analyzeCompetitor(rest); }
  if (cmd === '/review') { if(!rest) return 'Usage: /review [paste code]'; return await research.reviewCode(rest); }
  if (cmd === '/arch') { if(!rest) return 'Usage: /arch [system description]'; return await research.reviewArchitecture(rest); }
  if (cmd === '/summarize') { if(!rest) return 'Usage: /summarize [paste text]'; return await research.summarizeDocument(rest); }

  // ===== ANALYTICS =====
  if (cmd === '/traffic') { if(!args[0]) return 'Usage: /traffic [repo]'; const t=await analytics.getRepoTraffic(args[0]); if(t.error) return `❌ ${t.error}`; return `📊 *${t.repo}*\nViews: ${t.views} (${t.uniqueViews} unique)\nClones: ${t.clones}`; }
  if (cmd === '/codestats') { const s=await analytics.getDailyCodeStats(); if(s.error) return `❌ ${s.error}`; return `💻 *Code Today*\nCommits: ${s.commits}\nRepos: ${s.reposActive.join(', ')||'None'}`; }
  if (cmd === '/market') { const d=await nigerian.getExchangeRate(); return `📈 USD/NGN: ₦${Math.round(d.usdNgn)} (${d.source})`; }
  if (cmd === '/digest') return await analytics.getWeeklyDigest(payments);

  // ===== BUSINESS DOCS (WRITER) =====
  if (cmd === '/proposal') { if(!a1) return 'Usage: /proposal [client] | [project] | [budget]'; return await writer.generateProposal(a1,a2||'Not specified',a3); }
  if (cmd === '/sop') { if(!a1) return 'Usage: /sop [process name] | [steps]'; return await writer.generateSOP(a1,a2); }
  if (cmd === '/jd') { if(!a1) return 'Usage: /jd [role] | [company] | [requirements]'; return await writer.generateJobDescription(a1,a2,a3); }
  if (cmd === '/press') { if(!a1) return 'Usage: /press [headline] | [product] | [detail]'; return await writer.generatePressRelease(a1,a2,a3); }
  if (cmd === '/contract') { if(!rest) return 'Usage: /contract [paste contract text]'; return await writer.analyzeContract(rest); }

  // ===== OUTREACH & CONTENT =====
  if (cmd === '/drip') { if(!a1) return 'Usage: /drip [product] | [audience]'; return await writer.generateEmailDrip(a1,a2); }
  if (cmd === '/outreach') { if(!a1) return 'Usage: /outreach [role] | [company] | [product] | [value]'; return await writer.generateColdOutreach(a1,a2,a3,a4); }
  if (cmd === '/calendar30') { if(!a1) return 'Usage: /calendar30 [platform] | [topic]'; return await writer.generate30DayCalendar(a1,a2); }
  if (cmd === '/newsletter') { if(!a1) return 'Usage: /newsletter [platform] | [highlights]'; return await writer.generateNewsletter(a1,a2); }
  if (cmd === '/thread') { if(!rest) return 'Usage: /thread [topic]'; return await writer.generateThread(rest); }
  if (cmd === '/linkedin') { if(!a1) return 'Usage: /linkedin [topic] | [audience]'; return await writer.generateLinkedInArticle(a1,a2); }
  if (cmd === '/ad') { if(!a1||!a2) return 'Usage: /ad [platform] | [product] | [audience] | [goal]'; return await writer.generateAdCopy(a1,a2,a3,a4); }
  if (cmd === '/podcast') { if(!a1) return 'Usage: /podcast [topic] | [audience]'; return await writer.generatePodcastScript(a1,a2); }
  if (cmd === '/youtube') { if(!a1) return 'Usage: /youtube [title] | [niche]'; return await writer.generateYouTubeScript(a1,a2); }

  // ===== STRATEGY =====
  if (cmd === '/pivot') { if(!a1) return 'Usage: /pivot [idea] | [problem]'; return await writer.getPivotAdvice(a1,a2); }
  if (cmd === '/tam') { if(!a1) return 'Usage: /tam [business idea] | [geography]'; return await writer.getMarketSizing(a1,a2); }
  if (cmd === '/features') { if(!a1) return 'Usage: /features [product] | [paste backlog]'; return await writer.prioritizeFeatures(a1,a2); }
  if (cmd === '/exit') { if(!a1) return 'Usage: /exit [platform name] | [current metrics]'; return await writer.getExitStrategy(a1,a2); }

  // ===== BUSINESS BUILDER =====
  if (cmd === '/launch') { if(!a1) return 'Usage: /launch [product] | [description]'; return await learning.generateLaunchPlan(a1,a2); }
  if (cmd === '/pricing') { if(!a1) return 'Usage: /pricing [product] | [revenue goal] | [cost per user]'; return await learning.getPricingAdvice(a1,a2,a3); }
  if (cmd === '/abtest') { if(!a1) return 'Usage: /abtest [product] | [audience]'; return await learning.generateABTest(a1,a2); }
  if (cmd === '/names') { if(!a1) return 'Usage: /names [idea] | [industry]'; return await learning.generateBusinessNames(a1,a2); }

  // ===== SECURITY =====
  if (cmd === '/password') { if(!args[0]) return 'Usage: /password [password to check]'; return writer.analyzePasswordStrength(rest); }
  if (cmd === '/secaudit') { if(!rest) return 'Usage: /secaudit [describe your codebase]'; return await writer.getSecurityAudit(rest); }

  // ===== LEARNING =====
  if (cmd === '/techdigest') return await learning.getDailyTechDigest();
  if (cmd === '/skill') return await learning.getSkillLesson();
  if (cmd === '/flashcard') { const card=learning.getFlashcard(); return `🧠 *Flashcard*\n\n*Q:* ${card.q}\n\nReply "answer" to reveal`; }
  if (raw.toLowerCase() === 'answer') { const card=learning.getFlashcard(); return `✅ *Answer:*\n\n${card.a}`; }
  if (cmd === '/books') { if(!rest) return 'Usage: /books [your context]'; return await learning.getBookRec(rest); }

  // ===== HABITS =====
  if (cmd === '/habits') return learning.getHabitReport();
  if (cmd === '/addhabit') { if(!rest) return 'Usage: /addhabit [habit name]'; const h=learning.addHabit(rest); return `✅ Habit: "${h.name}" — log daily with /habit ${h.name}`; }
  if (cmd === '/habit') { if(!rest) return 'Usage: /habit [name]'; const r=learning.logHabit(rest); if(!r) return `❌ Not found. Add with /addhabit`; return r.alreadyLogged?`✅ Already logged: ${r.habit.name}`:`🔥 *${r.habit.name}* — ${r.habit.streak} day streak!`; }

  // ===== PAYMENTS =====
  if (cmd === '/payments' || cmd === '/revenue') return await payments.getFullPaymentReport();

  // ===== FINANCIAL TRANSACTIONS (v7.1) =====
  if (cmd === '/gateway') return financial.handleGatewayStatus();
  if (cmd === '/pay') {
    const payArgs = rest.split('|').map(s => s?.trim());
    const [email, amountStr, currency = 'NGN'] = payArgs[0]?.split(' ') || [];
    return financial.handlePay([email, amountStr, currency, payArgs[1] || '']);
  }
  if (cmd === '/transfer') {
    const transferArgs = rest.split('|').map(s => s?.trim());
    return financial.handleTransfer([transferArgs[0], transferArgs[1], transferArgs[2] || '']);
  }
  if (cmd === '/recipient') {
    const recipientArgs = rest.split('|').map(s => s?.trim());
    return financial.handleRecipient(recipientArgs);
  }
  if (cmd === '/banks') return financial.handleBanks();
  if (cmd === '/verify') {
    const verifyArgs = rest.split('|').map(s => s?.trim());
    return financial.handleVerify(verifyArgs);
  }
  if (cmd === '/refund') {
    const refundArgs = rest.split('|').map(s => s?.trim());
    return financial.handleRefund(refundArgs);
  }
  if (cmd === '/txn') return financial.handleTransaction(args);
  if (cmd === '/finalize') {
    const finArgs = rest.split('|').map(s => s?.trim());
    return financial.handleFinalize(finArgs);
  }
  if (cmd === '/quickpay') {
    const qpArgs = rest.split('|').map(s => s?.trim());
    return financial.handleQuickPay(qpArgs);
  }

  // ===== BUILDER & DEPLOYMENT (v7.1) =====
  if (cmd === '/build' || cmd === '/scaffold') {
    const buildArgs = rest.split('|').map(s => s?.trim());
    const [template, ...nameParts] = (buildArgs[0] || '').split(' ');
    const desc = buildArgs[1] || '';
    return cmd === '/scaffold' 
      ? builder.handleScaffold([template, ...nameParts])
      : builder.handleBuild([template, ...nameParts, desc ? '|' + desc : '']);
  }
  if (cmd === '/create') {
    const createArgs = rest.split('|').map(s => s?.trim());
    return builder.handleCreate(createArgs);
  }
  if (cmd === '/generate' || cmd === '/gen') {
    const genArgs = rest.split('|').map(s => s?.trim());
    return builder.handleGenerate(genArgs);
  }
  if (cmd === '/deployall') return builder.handleDeployAll(args);
  if (cmd === '/env') {
    const envArgs = rest.split('|').map(s => s?.trim());
    return builder.handleEnv(envArgs);
  }
  if (cmd === '/services') return builder.handleServices();
  if (cmd === '/projectstatus' || cmd === '/pstatus') return builder.handleProjectStatus(args);
  if (cmd === '/pushfiles' || cmd === '/pushmulti') {
    const pfArgs = rest.split('|').map(s => s?.trim());
    return builder.handlePushFiles(pfArgs);
  }
  if (cmd === '/templates') return builder.handleTemplates();


  // ===== BANKING (Apex Bank + OmegaPayGlobal) =====
  if (cmd === '/bank' || cmd === '/apexbank') return banking.handleBankDashboard();
  if (cmd === '/accounts') return banking.handleAccounts();
  if (cmd === '/balance') return banking.handleBalance(args);
  if (cmd === '/txns' || cmd === '/transactions') return banking.handleTransactions(args);
  if (cmd === '/cards') return banking.handleCards();
  if (cmd === '/loans') return banking.handleLoans();
  if (cmd === '/beneficiaries' || cmd === '/benef') return banking.handleBeneficiaries();
  if (cmd === '/goals' || cmd === '/savings') return banking.handleGoals();
  if (cmd === '/bills') return banking.handleBills();
  if (cmd === '/paybill') return banking.handlePayBill(args);
  if (cmd === '/convert') return banking.handleConvert(args);
  if (cmd === '/loancalc') return banking.handleLoanCalc(args);
  // ===== BANK MANAGER OPERATIONS (v7.2) =====
  if (cmd === "/mdashboard" || cmd === "/manager") return await bankManager.managerDashboard();
  if (cmd === "/mstmt" || cmd === "/statement") { if(!args[0]) return "Usage: /mstmt [days]\nExample: /mstmt 30 — last 30 days statement"; return await bankManager.accountStatement(args[0]); }
  if (cmd === "/mtransfers" || cmd === "/mpending") return await bankManager.pendingTransfers();
  if (cmd === "/mrisk" || cmd === "/fraud") return await bankManager.riskMonitor();
  if (cmd === "/msettlements" || cmd === "/msett") return await bankManager.settlementSchedule();
  if (cmd === "/mcustomers" || cmd === "/customers") return await bankManager.customerDirectory();
  if (cmd === "/mrecipients" || cmd === "/allrecipients") return await bankManager.recipientDirectory();
  if (cmd === "/mreport") { return await bankManager.fullReport(args[0] || "weekly"); }
  if (cmd === "/mwallet") return await bankManager.walletCheck();
  // ===== UNIVERSAL BANK OPERATIONS (v7.3) — Manage ANY bank =====
  if (cmd === "/bankinfo" || cmd === "/banklookup") return await bankOps.bankLookup(args);
  if (cmd === "/banklist" || cmd === "/allbanks") return await bankOps.bankList();
  if (cmd === "/ussd" || cmd === "/bankussd") return await bankOps.ussdLookup(args);
  if (cmd === "/quicksend" || cmd === "/quicktransfer") return await bankOps.quickSend(args);
  if (cmd === "/bulksend" || cmd === "/bulktransfer") return await bankOps.bulkSend(args);
  if (cmd === "/banksintl" || cmd === "/intlbanks") return await bankOps.internationalBanks(args);
  if (cmd === "/bankcompare" || cmd === "/comparebanks") return await bankOps.bankCompare(args);
  if (cmd === "/swift" || cmd === "/swiftcode") return await bankOps.swiftLookup(args);
  if (cmd === "/iban") return bankOps.validateIBAN(args);
  if (cmd === "/transferstatus" || cmd === "/tstatus") return await bankOps.transferStatus(args);
  if (cmd === "/acchistory" || cmd === "/acchist") return await bankOps.accountHistory(args);
  if (cmd === "/bankstats" || cmd === "/bankdb") return await bankOps.bankStats();


  // ===== SECURITY (v7.1) =====
  if (cmd === '/security' || cmd === '/audit') return security.handleSecurityAudit();
  if (cmd === '/secstatus') return security.handleSecurityStatus();
  if (cmd === '/secrets' || cmd === '/secretscan') return security.handleSecretScan();
  if (cmd === '/headers') return security.handleHeadersCheck();
  if (cmd === '/reposec') return security.handleRepoSecurity();


  // ===== AI CREATIVE (v7.1) =====
  if (cmd === '/image' || cmd === '/generate') return aiCreative.handleGenerateImage(args);
  if (cmd === '/ecoimage') return aiCreative.handleEcoImage(args);
  if (cmd === '/translate') return aiCreative.handleTranslate(args);
  if (cmd === '/languages') return aiCreative.handleLanguages();

  // ===== BUSINESS (v7.1) =====
  if (cmd === '/sendemail') return bizOps.handleSendEmail(args);
  if (cmd === '/emailtemplate') return bizOps.handleEmailTemplate(args);
  if (cmd === '/pdf' || cmd === '/document') return bizOps.handleGenerateDoc(args);
  if (cmd === '/invoice') return bizOps.handleInvoice(args);
  if (cmd === '/tax') return bizOps.handleTax(args);

  // ===== ANALYTICS (v7.1) =====
  if (cmd === '/forecast') return analyticsSvc.handleForecast(args);
  if (cmd === '/cashflow') return analyticsSvc.handleCashFlow();
  if (cmd === '/churn') return analyticsSvc.handleChurnAnalysis();
  if (cmd === '/scrape') return analyticsSvc.handleScrape(args);
  if (cmd === '/marketintel' || cmd === '/intel') return analyticsSvc.handleMarketIntel(args);
  if (cmd === '/review') return analyticsSvc.handleCodeReview(args);
  if (cmd === '/reviewall') return analyticsSvc.handleReviewAll();

  // ===== BLOCKCHAIN (v7.1) =====
  if (cmd === '/auditcontract') return blockchainSvc.handleAuditContract(args);
  if (cmd === '/gas') return blockchainSvc.handleGasEstimate(args);

  // ===== BACKUP (v7.1) =====
  if (cmd === '/backup') return backupSvc.handleBackup();
  if (cmd === '/restore') return backupSvc.handleRestore(args);
  if (cmd === '/backupstatus') return backupSvc.handleBackupStatus();

  if (cmd === '/flw') {
    const flwArgs = rest.split('|').map(s => s?.trim());
    return financial.handleFlutterwave(flwArgs);
  }

  if (cmd === '/paystack') {
    const s = await payments.getPaystackStats();
    if (s.error) return '❌ Paystack Error: ' + s.error;
    const modeIcon = s.mode === 'LIVE' ? '🟢' : '🟡';
    let msg = '*💳 Paystack Dashboard*\n';
    msg += 'Mode: ' + modeIcon + ' ' + s.mode + '\n';
    msg += 'Balance: *' + s.balance + '*\n';
    msg += 'Customers: ' + s.customers + '\n';
    msg += 'Txns: ' + s.totalTxns + ' attempts | ' + s.totalSuccess + ' succeeded\n';
    msg += 'Revenue: *' + s.totalRevenue + '*\n';
    msg += 'Total attempted: ₦' + (s.totalAmt||0).toLocaleString('en-NG',{maximumFractionDigits:0}) + '\n';
    msg += 'Conversion: *' + (s.totalTxns ? ((s.totalSuccess/s.totalTxns)*100).toFixed(1) : '0') + '%*\n\n';
    msg += '*Platform Breakdown:*\n';
    const sorted = Object.entries(s.byPlatform || {}).sort(function(a,b){return b[1].amount-a[1].amount;});
    sorted.forEach(function(e){ msg += e[0] + ': ' + e[1].count + ' attempts | ₦' + e[1].amount.toLocaleString('en-NG',{maximumFractionDigits:0}) + '\n'; });
    msg += '\n*Recent (last 5):*\n';
    (s.recent||[]).forEach(function(t){ const i=t.status==='success'?'✅':t.status==='abandoned'?'⏸️':'❌'; msg += i + ' ' + t.platform + ' ₦' + t.amount.toLocaleString() + ' — ' + t.email + '\n'; });
    msg += '\nhttps://superagent-2286fb2f.base44.app/functions/paystackDashboard';
    return msg;
  }
  if (cmd === '/stripe') { const s=await payments.getStripeStats(); if(s.error) return `❌ ${s.error}`; return `💜 *Stripe*\nBalance: ${s.balance}\n${s.succeededCharges}/${s.totalCharges} charges\nRevenue: ${s.totalRevenue}`; }

  // ===== CALENDAR =====
  if (cmd === '/today') return `📅 *Today*\n\n${await calendar.getTodayEvents()}`;
  if (cmd === '/week') return `📅 *This Week*\n\n${await calendar.getUpcomingEvents(7)}`;

  // ===== GITHUB =====
  if (cmd === '/github') return await github.getGitHubReport();

  // ===== MONITOR =====
  if (cmd === '/uptime') { const { report }=await monitor.getUptimeReport(); return report; }

  // ===== CONTENT =====
  if (cmd === '/chapter') return content.getTodayChapter();
  if (cmd === '/promo') { const p=content.getTodayPromoTarget(); return await content.generatePromoPost(p.name,p.desc,p.url); }
  if (cmd === '/post') { const plat=args[0]; const topic=args.slice(1).join(' '); if(!plat||!topic) return 'Usage: /post [platform] [topic]'; return await content.generateSocialPost(plat,topic); }
  if (cmd === '/broadcast') { return await think({message:`Write a broadcast for AI Global WhatsApp channel about: ${rest||'Harz Ecosystem update'}. 4-5 lines, energizing, with CTA.`,from:'broadcast',sessionId:'broadcast',memory:[]}); }

  // ===== COMMS =====
  if (cmd === '/email') { const [toSubj,body]=rest.split('|'); if(!toSubj||!body) return 'Usage: /email [to@email.com Subject] | [body]'; const [to,...subj]=toSubj.trim().split(' '); return await sendEmail(to,subj.join(' '),body.trim()); }
  if (cmd === '/scheduler') { const s=scheduler.getStatus(); let m=`📅 *Scheduler*\n\n`; s.automations.forEach(a=>{m+=`✅ ${a.name.replace(/_/g,' ')} — ${a.schedule}\n`;}); return m; }

  // ===== GOALS & DECISIONS =====
  if (cmd === '/goals') return memExt.listGoals();
  if (cmd === '/goal') { if(!a1) return 'Usage: /goal [title] | [deadline] | [description]'; const g=memExt.addGoal(a1,a2,a3); return `✅ Goal added: "${g.title}"\nDeadline: ${g.deadline}\nTrack with: /goals`; }
  if (cmd === '/progress') { if(!a1) return 'Usage: /progress [goal-name] | [0-100] | [note]'; const g=memExt.updateGoalProgress(a1,a2,a3); return g?`📊 *${g.title}*\nProgress: ${g.progress}%`:`❌ Goal not found.`; }
  if (cmd === '/decide') { if(!a1) return 'Usage: /decide [decision] | [reasoning] | [alternatives]'; memExt.logDecision(a1,a2,a3); return `📋 Decision logged: "${a1}"`; }
  if (cmd === '/decisions') return memExt.listDecisions();
  if (cmd === '/focus') { if(!rest) return 'Usage: /focus [your #1 priority today]'; return await memExt.setIntention(rest); }
  if (cmd === '/intention') return memExt.getTodayIntention();
  if (cmd === '/weeklyreview') return await memExt.generateWeeklyReview();
  if (cmd === '/morning') return await memExt.getMorningQuestions();
  
  // ===== ENERGY & WELLBEING =====
  if (cmd === '/energy') { if(!args[0]) return 'Usage: /energy [1-10] [optional note]'; const e=memExt.logEnergy(args[0],args.slice(1).join(' ')); return `⚡ Energy ${e.level}/10 logged${e.note?': '+e.note:''}`; }
  if (cmd === '/energyreport') return memExt.getEnergyReport();
  if (cmd === '/gratitude') { const items=rest.split('|').map(s=>s.trim()); if(!items[0]) return 'Usage: /gratitude [item1] | [item2] | [item3]'; return memExt.logGratitude(items[0],items[1],items[2]); }
  
  // ===== NETWORKING & READING =====
  if (cmd === '/connect') { if(!a1) return 'Usage: /connect [name] | [role] | [context] | [follow-up]'; const c=memExt.logConnection(a1,a2,a3,a4); return `🤝 Connection logged: ${c.name} (${c.role||'N/A'})`; }
  if (cmd === '/network') return memExt.listConnections();
  if (cmd === '/book') { if(!a1) return 'Usage: /book [title] | [author] | [rating 1-5] | [review]'; const b=memExt.logBook(a1,a2,a3,a4); return `📚 Book logged: "${b.title}" ${"⭐".repeat(b.rating||0)}`; }
  if (cmd === '/books') return memExt.listBooks();
  
  // ===== DELEGATION =====
  if (cmd === '/delegate') { if(!a1||!a2) return 'Usage: /delegate [task] | [assignee] | [deadline] | [note]'; const d=memExt.logDelegation(a1,a2,a3,a4); return `📌 Delegated: "${d.task}" → ${d.assignee}\nDeadline: ${d.deadline}`; }
  if (cmd === '/delegations') return memExt.listDelegations();
  if (cmd === '/delegated') { if(!rest) return 'Usage: /delegated [task name]'; const d=memExt.completeDelegation(rest); return d?`✅ Delegation complete: "${d.task}"`:`❌ Not found.`; }
  
  // ===== DEV TOOLS =====
  if (cmd === '/api') { const [method,url,...bodyParts]=rest.split(' '); if(!method||!url) return 'Usage: /api [GET/POST] [url] [optional-body]'; return await devtools.testEndpoint(method,url,bodyParts.join(' ')); }
  if (cmd === '/json') { if(!rest) return 'Usage: /json [paste JSON]'; return devtools.formatJSON(rest); }
  if (cmd === '/regex') { if(!rest) return 'Usage: /regex [describe what to match]'; return await devtools.generateRegex(rest); }
  if (cmd === '/sql') { if(!a1) return 'Usage: /sql [describe what you need] | [db type]'; return await devtools.writeSQL(a1,a2); }
  if (cmd === '/error') { if(!rest) return 'Usage: /error [paste your stack trace]'; return await devtools.decodeError(rest); }
  if (cmd === '/data') { if(!rest) return 'Usage: /data [paste data to analyze]'; return await devtools.analyzeData(rest); }
  if (cmd === '/entity') { if(!a1) return 'Usage: /entity [entity-name] | [question about it]'; return await devtools.exploreEntityData(a1,a2); }
  
  // ===== FINANCE =====
  if (cmd === '/forecast') { if(!a1) return 'Usage: /forecast [current MRR] | [monthly growth %] | [months ahead]'; return await devtools.forecastRevenue(a1,a2||'10',a3||'12'); }
  
  // ===== TEAM TOOLS =====
  if (cmd === '/standup') { if(!a1) return 'Usage: /standup [project] | [yesterday] | [today] | [blockers]'; return await devtools.generateStandup(a1,a2,a3,a4); }
  if (cmd === '/onboarding') { if(!a1) return 'Usage: /onboarding [role] | [company] | [tools]'; return await devtools.generateOnboardingDoc(a1,a2,a3); }
  if (cmd === '/review') { if(a1&&a2) return await devtools.generatePerformanceReview(a1,a2,a3,a4); if(!rest) return 'Usage: /review [code] or /perf [name] | [role]'; return await research.reviewCode(rest); }

  // ===== HARZ DASHBOARD =====
  if (cmd === '/dashboard') {
    const uptime = await monitor.getUptimeReport();
    const rate = await nigerian.getExchangeRate();
    const coins = await intelligence.getCryptoPrices(['bitcoin','ethereum']);
    const now = new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'});
    return `🏢 *Harz Ecosystem Dashboard*\n📅 ${now}\n\n🌐 *Platforms*\n✅ HarzDM — harzdm-marketplace.vercel.app\n✅ OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n✅ TradeOS — tradeos-dashboard-fawn.vercel.app\n✅ BuildBot AI — Base44 live\n✅ ContentPilot AI — Base44 live\n✅ Abuja Estate City — abuja-estate-city-ai.vercel.app\n✅ Nexal Media — Base44 live\n✅ DeployForge — Base44 live\n✅ Maganu — Render live\n\n💱 *Market*\nUSD/NGN: ₦${Math.round(rate.usdNgn||1650)}\n${coins}\n\n💳 *Payments*\nPaystack: TEST MODE (pending verify)\nStripe: TEST MODE (pending activate)\n\nType /uptime for server status`;
  }

  // ===== NEWS & INTEL =====
  if (cmd === '/news') {
    const topic = rest || 'Nigeria tech startup AI';
    try {
      const url = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(topic) + '&format=json&no_html=1';
      const r = await axios.get(url, {timeout:8000});
      const d = r.data;
      const items = [];
      if (d.AbstractText) items.push(d.AbstractText);
      (d.RelatedTopics||[]).slice(0,4).forEach(function(t){ if(t.Text) items.push(t.Text); });
      return '📰 *News: ' + topic + '*\n\n' + (items.join('\n\n') || 'No results found.');
    } catch(e) { return '📰 Search error: ' + e.message; }
  }

  if (cmd === '/nigeriannews') {
    try {
      const r = await axios.get('https://api.duckduckgo.com/?q=Nigeria+business+tech+startup+today&format=json&no_html=1',{timeout:8000});
      const d = r.data;
      const items = [];
      if(d.AbstractText) items.push(d.AbstractText);
      (d.RelatedTopics||[]).slice(0,5).forEach(function(t){ if(t.Text) items.push(t.Text); });
      return '🇳🇬 *Nigeria Business & Tech*\n\n' + (items.join('\n\n') || 'No results found.');
    } catch(e) { return '❌ Error: ' + e.message; }
  }

  // ===== CURRENCY & FINANCE =====
  if (cmd === '/convert') {
    const amount = parseFloat(args[0]?.replace(/,/g,''));
    const from2 = (args[1]||'USD').toUpperCase();
    const to2 = (args[2]||'NGN').toUpperCase();
    if(!amount) return 'Usage: /convert [amount] [from] [to]\nExample: /convert 100 USD NGN';
    try {
      const rates = await nigerian.getExchangeRate();
      let result;
      if(from2==='USD'&&to2==='NGN') result = amount * (rates.usdNgn||1650);
      else if(from2==='NGN'&&to2==='USD') result = amount / (rates.usdNgn||1650);
      else if(from2==='GBP'&&to2==='NGN') result = amount * (rates.gbpNgn||2100);
      else if(from2==='NGN'&&to2==='GBP') result = amount / (rates.gbpNgn||2100);
      else result = amount;
      return '💱 *Currency*\n\n' + amount.toLocaleString() + ' ' + from2 + ' = *' + result.toLocaleString('en-NG',{maximumFractionDigits:2}) + ' ' + to2 + '*\nRate: 1 USD ≈ ₦' + Math.round(rates.usdNgn||1650);
    } catch(e) { return '❌ Rate error: ' + e.message; }
  }

  if (cmd === '/roi') {
    const invest = parseFloat(args[0]?.replace(/,/g,''));
    const returns = parseFloat(args[1]?.replace(/,/g,''));
    if(!invest||!returns) return 'Usage: /roi [investment] [returns]\nExample: /roi 500000 850000';
    const roi = ((returns - invest) / invest * 100).toFixed(2);
    const profit = (returns - invest).toLocaleString('en-NG');
    return '📊 *ROI Analysis*\n\nInvestment: ₦' + invest.toLocaleString() + '\nReturns: ₦' + returns.toLocaleString() + '\nProfit: ₦' + profit + '\nROI: *' + roi + '%*\n\n' + (parseFloat(roi)>0?'✅ Profitable':'❌ Loss-making');
  }

  if (cmd === '/mrr') {
    const arr = rest.split('|').map(s=>s.trim());
    const customers = parseInt(arr[0]);
    const arpu = parseFloat((arr[1]||'0').replace(/,/g,''));
    if(!customers||!arpu) return 'Usage: /mrr [customers] | [avg monthly price]';
    const mrr = customers * arpu;
    const arr12 = mrr * 12;
    return '💰 *MRR Calculator*\n\nCustomers: ' + customers + '\nARPU: ₦' + arpu.toLocaleString() + '\nMRR: *₦' + mrr.toLocaleString() + '*\nARR: *₦' + arr12.toLocaleString() + '*\n($' + (mrr/1650).toFixed(0) + ' USD/mo)';
  }

  // ===== APP BUILDING GUIDANCE =====
  if (cmd === '/buildguide') {
    const type = (rest||'saas').toLowerCase();
    const g = {
      saas: '🏗️ *SaaS Build Guide*\n\n1. Entity schemas (User, Subscription, Product)\n2. Auth via createClientFromRequest()\n3. Paystack (NGN) or Stripe (USD) checkout backend fn\n4. HTML frontend in Deno.serve() — inline CSS+JS\n5. Deploy at base44.app/functions/name\n6. Webhook for payment callbacks\n7. Entity CRUD via @base44/sdk',
      landing: '🏗️ *Landing Page Guide*\n\n1. Hero + CTA\n2. Features grid (3-9 items)\n3. Pricing cards (3 tiers)\n4. Testimonials + FAQ\n5. Footer + contact\n\nAll in one Deno.serve() fn. Full inline CSS. No frameworks needed.',
      api: '🏗️ *API Build Guide*\n\n1. POST: await req.json()\n2. SDK: import createClientFromRequest from base44/sdk\n3. Entity: sdk.entities.Name.filter({})\n4. CORS: Access-Control-Allow-Origin: *\n5. Always return JSON with status codes'
    };
    return g[type] || g.saas;
  }

  if (cmd === '/buildtemplate') {
    const type = (rest||'').toLowerCase();
    if(type==='api') return '📄 *API Template*\n\n```ts\nimport { createClientFromRequest } from \'npm:@base44/sdk@0.8.31\';\nDeno.serve(async (req) => {\n  const CORS = { \'Access-Control-Allow-Origin\': \'*\' };\n  if (req.method === \'OPTIONS\') return new Response(null, {status:200,headers:CORS});\n  const body = await req.json();\n  const sdk = createClientFromRequest(req);\n  const data = await sdk.entities.YourEntity.filter({});\n  return new Response(JSON.stringify(data), {headers:{...CORS,\'Content-Type\':\'application/json\'}});\n});```';
    return '📄 *Landing Template*\n\n```ts\nDeno.serve(async (req) => {\n  const html = `<!DOCTYPE html><html><head><title>App</title></head><body><h1>Hello</h1></body></html>`;\n  return new Response(html, {headers:{\'Content-Type\':\'text/html\'}});\n});```\n\nMore: /buildtemplate api';
  }

  // ===== QUICK ECOSYSTEM INFO =====
  if (cmd === '/links') {
    return '🔗 *Harz Ecosystem Links*\n\nharzdm-marketplace.vercel.app\nomega-infinity-dashboard.vercel.app\ntradeos-dashboard-fawn.vercel.app\nabuja-estate-city-ai.vercel.app\nsuperagent-2286fb2f.base44.app/functions/buildbotAI\nsuperagent-2286fb2f.base44.app/functions/contentPilotDashboard\nsuperagent-2286fb2f.base44.app/functions/nexalMedia\nsuperagent-2286fb2f.base44.app/functions/fluxLinks\nmaganu-agent.onrender.com';
  }

  if (cmd === '/base44') {
    return '⚡ *Base44 Platform*\n\nFunction URL: https://superagent-2286fb2f.base44.app/functions/name\n\nActive functions:\nbuildbot AI | contentPilotDashboard | contentPilotCheckout\nnexalMedia | harzWebhook | oracleAI\nnigerianNumberLookup | abujaEstateCityAI | fluxLinks\n\nLanguage: TypeScript/Deno — runs serverless';
  }

  if (cmd === '/stack') {
    return '🛠️ *Harz Tech Stack*\n\n*Hosting*\nBase44 — backend functions (Deno/TS)\nVercel — static frontends\nRender — Node.js services (Maganu)\n\n*AI*\nBase44 Superagent — primary AI\nMaganu — Groq llama-4-scout Telegram\nGroq API — fast LLM inference\n\n*Payments*\nPaystack (NGN, test mode)\nStripe (USD, test mode)\n\n*Database*\nBase44 entities (MongoDB-backed)\n\n*Languages*\nTypeScript/Deno (functions)\nJavaScript/Node.js (Maganu)\nHTML/CSS/JS (frontends)\nNext.js (OMEGA dashboard)';
  }

  // ===== MATH & QUICK CALC =====
  if (cmd === '/calc') { if(!rest) return 'Usage: /calc [expression]\nExample: /calc 15000 * 12 * 0.075'; try { const result = eval(rest.replace(/[^0-9+\-*/().% ]/g,'')); return '🧮 *Result*\n\n' + rest + '\n= *' + result + '*'; } catch(e) { return '❌ Invalid expression: ' + rest; } }

  if (cmd === '/margin') {
    const cost = parseFloat(args[0]?.replace(/,/g,''));
    const price = parseFloat(args[1]?.replace(/,/g,''));
    if(!cost||!price) return 'Usage: /margin [cost] [selling price]\nExample: /margin 8000 15000';
    const profit = price - cost;
    const margin = ((profit/price)*100).toFixed(1);
    const markup = ((profit/cost)*100).toFixed(1);
    return '📊 *Margin Analysis*\n\nCost: ₦' + cost.toLocaleString() + '\nPrice: ₦' + price.toLocaleString() + '\nProfit: ₦' + profit.toLocaleString() + '\nMargin: *' + margin + '%*\nMarkup: ' + markup + '%';
  }

  if (cmd === '/break') {
    const fixed = parseFloat(args[0]?.replace(/,/g,''));
    const varCost = parseFloat(args[1]?.replace(/,/g,''));
    const price = parseFloat(args[2]?.replace(/,/g,''));
    if(!fixed||!varCost||!price) return 'Usage: /break [fixed costs] [variable cost/unit] [selling price]';
    const units = Math.ceil(fixed / (price - varCost));
    const revenue = units * price;
    return '📊 *Breakeven Analysis*\n\nFixed Costs: ₦' + fixed.toLocaleString() + '\nVariable Cost: ₦' + varCost.toLocaleString() + '/unit\nSelling Price: ₦' + price.toLocaleString() + '\n\nBreakeven: *' + units.toLocaleString() + ' units*\nRevenue at breakeven: ₦' + revenue.toLocaleString();
  }

  if (cmd === '/compound') {
    const principal = parseFloat(args[0]?.replace(/,/g,''));
    const rate = parseFloat(args[1]);
    const years = parseInt(args[2]||'5');
    if(!principal||!rate) return 'Usage: /compound [principal] [rate%] [years]\nExample: /compound 1000000 12 5';
    const total = principal * Math.pow(1 + rate/100, years);
    const gain = total - principal;
    return '💰 *Compound Interest*\n\nPrincipal: ₦' + principal.toLocaleString() + '\nRate: ' + rate + '% p.a.\nYears: ' + years + '\n\nFinal: *₦' + Math.round(total).toLocaleString() + '*\nGain: ₦' + Math.round(gain).toLocaleString();
  }

  // ===== MOTIVATION & MINDSET =====
  if (cmd === '/quote') {
    const quotes = [
      'The best time to plant a tree was 20 years ago. The second best time is now.',
      'Stop waiting for the perfect moment. Take the moment and make it perfect.',
      'Your network is your net worth. Build real relationships, not just contacts.',
      'Revenue solves most problems. Ship faster.',
      'Every master was once a disaster. Keep going.',
      'The goal is not to be perfect by the end. The goal is to be better today.',
      'Build in public. Learn in public. Grow in public.',
      'Ideas without execution are just dreams. Execute daily.',
      'Your biggest competitor is your yesterday self.',
      'Done is better than perfect. Launch and iterate.',
      'The man who moves a mountain begins by carrying away small stones.',
      'Excellence is not a destination but a continuous journey.',
      'Lagos hustle is different. You were built for this.',
      'Wealth is built quietly, one decision at a time.',
      'Code it. Ship it. Iterate it. That is the whole game.'
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    return '💡 *Quote of the Moment*\n\n_' + q + '_';
  }

  if (cmd === '/affirmation') {
    const aff = [
      'I am Rabiu Hamza. I build things that matter. I ship fast and learn faster.',
      'Every line of code I write brings the Harz ecosystem closer to dominance.',
      'I am the architect of a 10-platform empire. I execute with precision.',
      'My ideas are valid. My timing is perfect. My team is capable.',
      'I attract the right clients, the right partners, and the right capital.',
      'I am disciplined, focused, and unstoppable in pursuit of my vision.',
      'The Harz ecosystem will serve millions. I am building that future today.',
      'I delegate what slows me, execute what matters, and rest without guilt.',
      'My wealth grows because my value to others grows daily.',
      'I am exactly where I need to be, moving at exactly the right speed.'
    ];
    const a = aff[Math.floor(Math.random() * aff.length)];
    return '🔥 *Your Affirmation*\n\n_' + a + '_\n\nRepeat it 3x. Own it.';
  }

  if (cmd === '/challenge') {
    const challenges = [
      '🎯 Today: Cold-pitch ONE potential client for any of your platforms. Real DM, real offer.',
      '🎯 Today: Post ONE piece of content to the AI Global channel about a Harz platform.',
      '🎯 Today: Review one of your GitHub repos and push at least one meaningful commit.',
      '🎯 Today: Identify ONE bottleneck in your business and fix or delegate it before midnight.',
      '🎯 Today: Set up ONE automation that will save you 30+ minutes every week going forward.',
      '🎯 Today: Write down 3 revenue ideas for any of your 10 platforms. Pick one to implement.',
      '🎯 Today: Do a 10-minute deep work session on your most delayed project. Just 10 minutes.',
      '🎯 Today: Reach out to ONE person in your network who could become a partner or customer.',
      '🎯 Today: Add ONE feature to any platform that users would immediately notice and love.',
      '🎯 Today: Document ONE process in your business that only lives in your head right now.'
    ];
    const c = challenges[Math.floor(Math.random() * challenges.length)];
    return c + '\n\nReport back with /done when finished. 💪';
  }

  // ===== SPRINT & PROJECT PLANNING =====
  if (cmd === '/sprint') {
    if(!a1) return 'Usage: /sprint [project] | [goal] | [days]\nExample: /sprint BuildBot | Launch payment flow | 7';
    const project = a1;
    const goal = a2 || 'Complete milestone';
    const days = parseInt(a3||'7');
    return '🏃 *Sprint Plan: ' + project + '*\n\nGoal: ' + goal + '\nDuration: ' + days + ' days\n\nDay 1-2: Design + architecture\nDay 3-4: Core implementation\nDay 5-6: Testing + QA\nDay ' + days + ': Deploy + review\n\nTrack with /tasks. Log blockers with /error. Report progress with /standup ' + project;
  }

  if (cmd === '/milestone') {
    if(!a1) return 'Usage: /milestone [project] | [milestone] | [deadline]';
    return '🏁 *Milestone Set*\n\nProject: ' + a1 + '\nMilestone: ' + (a2||'MVP complete') + '\nDeadline: ' + (a3||'TBD') + '\n\nBreak it into tasks: /addtask [step]\nTrack daily: /standup ' + a1;
  }

  // ===== HARZ-SPECIFIC COMMANDS =====
  if (cmd === '/harzdm') {
    return '🛒 *HarzDM Marketplace*\n\nURL: harzdm-marketplace.vercel.app\nRevenue split: 90% seller / 10% platform\nPayments: Stripe (USD) + Paystack (NGN)\nEntities: Product, Seller, Order\nGitHub: github.com/rabiuhamza11/harzdm-marketplace (v1.0.0)\n\nBackend functions:\nharzDM | harzDMCheckout | harzDMDashboard\nharzDMCatalog | harzDMSellerSignup | harzWebhook\n\nStatus: LIVE ✅ (Stripe test mode)';
  }

  if (cmd === '/buildbot') {
    return '🏗️ *BuildBot AI*\n\nURL: superagent-2286fb2f.base44.app/functions/buildbotAI\nTiers: Basic ₦15k/mo | Pro ₦45k/mo\nPayments: Paystack\nGitHub: github.com/rabiuhamza11/buildbot-ai (v1.0)\n\nJuly 2026 prices loaded:\nCement: ₦11,300/bag | Iron 12mm: ₦8,500\nBasic: ₦180k/sqm | Standard: ₦350k | Luxury: ₦500k\nSVG floor plan generator: LIVE\n\nAdmin: /functions/buildbotAdmin\nStatus: LIVE ✅';
  }

  if (cmd === '/contentpilot') {
    return '🚀 *ContentPilot AI*\n\nURL: superagent-2286fb2f.base44.app/functions/contentPilotDashboard\nTiers: Starter $15 | Pro $39 | Agency $99/mo\nNGN equiv: ₦15k | ₦35k | ₦85k\nPayments: Paystack + Stripe\nEntity: ContentPilotSubscriber\n\nStatus: LIVE ✅ (test mode)\nCheckout: /functions/contentPilotCheckout\nWebhook: /functions/contentPilotWebhook';
  }

  if (cmd === '/nexal') {
    return '📢 *Nexal Media*\n\nURL: superagent-2286fb2f.base44.app/functions/nexalMedia\nPackages: Starter ₦15,000 (FB+IG) | Growth ₦50,000 (6 platforms)\nPlatforms: Facebook, Instagram, TikTok, YouTube, X, LinkedIn\nEntity: NexalAdSubmission\nPayment: Paystack\n\nStatus: LIVE ✅ (test mode)\nFlow: Submit → Checkout → Webhook → DB record';
  }

  if (cmd === '/omega') {
    return '⚡ *OMEGA INFINITY 1000*\n\nURL: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + TypeScript + PostgreSQL + Docker\n10 AI Agent roles: Executive, Planner, Backend, Frontend,\nDatabase, QA, Security, DevOps, Documentation, Deployment\nGitHub: github.com/rabiuhamza11/omega-infinity-1000 (v1.0)\n\nEntities: OmegaWorkspace, RagChunk, OmegaInfinityProject\nPackager: omega-ai-packager (v0.3.0)\nStatus: LIVE ✅';
  }

  if (cmd === '/tradeos') {
    return '📈 *TradeOS*\n\nURL: tradeos-dashboard-fawn.vercel.app\nExchanges: Binance, Coinbase, Alpaca, OANDA, Kraken\nData: Real-time Kraken integration\nSecurity: AES-256-GCM\nPackages: web | api | mobile | desktop | voice | video\nGitHub: github.com/rabiuhamza11/tradeos (v1.0)\n\nStatus: LIVE ✅';
  }

  if (cmd === '/maganu') {
    return '🤖 *Maganu v7.3*\n\nRunning on: Render (maganu-agent.onrender.com)\nModel: Groq llama-4-scout-17b (30k TPM)\nGitHub: github.com/rabiuhamza11/maganu-agent\nTelegram: @rabiuhamza11_bot\n\nCapabilities: 500+ | Commands: 260+\nMemory: 100 msgs stored, 40 active context\nDeploy: Vercel + Netlify + Render + Railway\nAPI Keys: 13 injected\n\nHonesty protocol: ACTIVE (never lies about actions)\nStatus: LIVE ✅';
  }

  if (cmd === '/hostmaster') {
    return '🌐 *HostMaster AI*\n\nStatus: Prototype LIVE (Base44)\nModules: Domain registration, Web hosting, VPS,\nAI website builder, DNS management, Billing portal\nEntities: HMDomain, HMHostingOrder, HMTicket, HMInvoice\n\nNext step: Namecheap reseller account ($50 min) + static IP\nOr: Cloudflare/Dynadot API key for live registrations\n\nDual-registrar fallback: Cloudflare (at-cost) + Dynadot';
  }

  if (cmd === '/oracle') {
    return '🔮 *Oracle AI*\n\nApp ID: 6a1e2ae23020fb3c9af2fc4d\nURL: superagent-2286fb2f.base44.app/functions/oracleAI\n\nModules: Astrology | Astronomy | Ramli (Geomancy)\nHisab (Calculation) | Numerology | Daily Reading\n\nMonetization:\nFree: 1 reading/day\nSingle: ₦500/reading\nMonthly: ₦2,500/unlimited\nPayment: Paystack\n\nEntity: OracleSession\nStatus: LIVE ✅';
  }

  // ===== BROADCAST TOOLS =====
  if (cmd === '/wamsg') {
    if(!rest) return 'Usage: /wamsg [your message]\nI will format it as a WhatsApp broadcast.';
    return '📤 *WhatsApp Broadcast Ready*\n\n' + rest + '\n\n---\nCopy and send to your AI Global channel or groups.';
  }

  if (cmd === '/caption') {
    if(!a1) return 'Usage: /caption [platform] | [topic]\nExample: /caption instagram | BuildBot AI launch';
    return require('./services/writer').generateAdCopy(a1, a2||'Harz platform', 'entrepreneurs', 'engagement');
  }

  // ===== KNOWLEDGE BASE =====
  if (cmd === '/omega1000') {
    const k = require('./services/knowledge');
    const info = k.searchKnowledge(rest||'omega infinity');
    return '🧠 *OMEGA 1000 Knowledge*\n\n' + (info||'Ask me anything about the OMEGA INFINITY 1000 framework — science, philosophy, engineering, business.');
  }

  if (cmd === '/know') {
    if(!rest) return 'Usage: /know [topic]\nSearch the OMEGA 1000 knowledge base.';
    const k = require('./services/knowledge');
    const info = k.searchKnowledge(rest);
    return '🧠 *' + rest + '*\n\n' + (info||'Not in knowledge base — try /research ' + rest);
  }

  // ===== FILE & DATA TOOLS =====
  if (cmd === '/template') {
    const templates = {
      invoice: 'INVOICE\n---\nFrom: [Your Name]\nTo: [Client Name]\nDate: ' + new Date().toLocaleDateString('en-NG') + '\n\nServices:\n1. [Description] — ₦[Amount]\n\nSubtotal: ₦[X]\nVAT (7.5%): ₦[Y]\nTotal: ₦[Z]\n\nBank: [Bank Name]\nAccount: [Account Number]\nDue: [Date]',
      proposal: 'PROJECT PROPOSAL\n---\nProject: [Name]\nClient: [Name]\nDate: ' + new Date().toLocaleDateString('en-NG') + '\n\nObjective:\n[What you will build]\n\nDeliverables:\n1. [Item 1]\n2. [Item 2]\n\nTimeline: [X weeks]\nBudget: ₦[Amount]\n\nNext Step: [Call/Meeting/Deposit]',
      nda: 'NON-DISCLOSURE AGREEMENT\n---\nBetween: [Party A] and [Party B]\nDate: ' + new Date().toLocaleDateString('en-NG') + '\n\nConfidential Information includes all technical,\nbusiness, and financial data shared between parties.\n\nDuration: 2 years from signing\nJurisdiction: Lagos, Nigeria\n\nSigned: _________  Date: ______'
    };
    const type = (rest||'invoice').toLowerCase();
    return '📄 *' + type.toUpperCase() + ' Template*\n\n' + (templates[type]||templates.invoice);
  }

  // ===== NIGERIAN BUSINESS TOOLS =====
  if (cmd === '/cac') {
    return '🏢 *CAC Business Registration Guide*\n\nStep 1: Go to search.cac.gov.ng\nCheck if business name is available\n\nStep 2: Register at portal.cac.gov.ng\nBusiness Name (BN): ₦10,000\nPrivate Company (Ltd): ₦35,000\n\nStep 3: Required docs\nMeans of ID (NIN/Intl Passport)\nAddress proof\nProprietary Declaration form\n\nStep 4: Timeline\nBN: 48-72 hours online\nLimited: 2-4 weeks\n\nFor FIRS TIN after CAC: tin.jtb.gov.ng';
  }

  if (cmd === '/naira') {
    if(!rest) return 'Usage: /naira [USD amount]\nExample: /naira 500';
    const usdAmt = parseFloat(rest.replace(/[^0-9.]/g,''));
    if(!usdAmt) return '❌ Invalid amount';
    const ngn = usdAmt * 1650;
    return '💱 *USD → NGN*\n\n$' + usdAmt.toLocaleString() + ' USD\n= *₦' + ngn.toLocaleString() + '*\n\n(Rate: ₦1,650/USD — check /rate for live rate)';
  }

  if (cmd === '/pitch') {
    if(!a1) return 'Usage: /pitch [product] | [audience] | [problem]\nExample: /pitch BuildBot AI | contractors | manual cost estimation';
    return require('./services/writer').generateProposal(a2||'Investors', a1, '').then ? 
      require('./services/writer').generateProposal(a2||'Investors', a1, '') :
      '🎤 *Elevator Pitch: ' + a1 + '*\n\nProblem: ' + (a3||'Manual, time-consuming process') + '\nSolution: ' + a1 + ' automates this using AI.\nMarket: ' + (a2||'Nigerian SMEs') + '\nTraction: Early adopters, live platform\nAsk: Invest or partner with us.\nContact: harzco.business@gmail.com';
  }


  // ===== WEATHER =====
  if (cmd === '/weather') {
    const weather = require('./services/weather');
    const city = rest || 'lagos';
    return await weather.getWeather(city);
  }

  // ===== PRODUCTIVITY / POMODORO =====
  if (cmd === '/timer') {
    const prod = require('./services/productivity');
    if (!rest || rest === 'status') return prod.checkTimer(sessionId);
    if (rest === 'stop') return prod.stopTimer(sessionId);
    return prod.startTimer(sessionId, rest);
  }
  if (cmd === '/win') { if(!rest) return 'Usage: /win [what you accomplished]'; const prod=require('./services/productivity'); return prod.addWin(rest); }
  if (cmd === '/wins') { const prod=require('./services/productivity'); return prod.getWins(); }
  if (cmd === '/journal') { if(!rest) return 'Usage: /journal [your thoughts]'; const prod=require('./services/productivity'); return prod.addJournal(rest); }
  if (cmd === '/myjournal') { const prod=require('./services/productivity'); return prod.getJournal(); }
  if (cmd === '/prodstats') { const prod=require('./services/productivity'); return prod.getProductivityStats(); }

  // ===== UTILITY TOOLS =====
  if (cmd === '/wordcount') { if(!rest) return 'Usage: /wordcount [paste text]'; const t=require('./services/tools'); return t.analyzeText(rest); }
  if (cmd === '/wc') { if(!rest) return 'Usage: /wc [paste text]'; const t=require('./services/tools'); return t.analyzeText(rest); }
  if (cmd === '/uuid') { const t=require('./services/tools'); return t.generateUUID(); }
  if (cmd === '/b64') {
    const t=require('./services/tools');
    if(!a1) return 'Usage: /b64 encode [text] or /b64 decode [text]';
    if(a1.toLowerCase()==='encode') return t.base64Encode(args.slice(1).join(' '));
    if(a1.toLowerCase()==='decode') return t.base64Decode(args.slice(1).join(' '));
    return t.base64Encode(rest);
  }
  if (cmd === '/loan') {
    const t=require('./services/tools');
    if(!a1||!a2||!a3) return 'Usage: /loan [principal] | [annual rate%] | [months]\nExample: /loan 5000000 | 18 | 24';
    return t.loanCalculator(a1, a2, a3);
  }
  if (cmd === '/age') { if(!rest) return 'Usage: /age [YYYY-MM-DD]'; const t=require('./services/tools'); return t.calcAge(rest); }
  if (cmd === '/tip') {
    const t=require('./services/tools');
    if(!a1) return 'Usage: /tip [amount] | [tip%] | [people]\nExample: /tip 25000 | 10 | 3';
    return t.calcTip(a1, parseFloat(a2||'10'), parseInt(a3||'1'));
  }
  if (cmd === '/word') { const t=require('./services/tools'); return t.wordOfTheDay(); }
  if (cmd === '/percent') { if(!rest) return 'Usage: /percent 15% of 500000\n/percent 20% off 120000\n/percent 75000 is what % of 500000'; const t=require('./services/tools'); return t.calcPercent(rest); }
  if (cmd === '/genpass') {
    const t=require('./services/tools');
    const len=parseInt(args[0])||16;
    return t.generatePassword(len);
  }

  // ===== ADDITIONAL NIGERIAN TOOLS =====
  if (cmd === '/paye') {
    if(!rest) return 'Usage: /paye [annual salary in NGN]\nExample: /paye 6000000';
    const n=require('./services/nigerian');
    return n.payeCalculator ? n.payeCalculator(rest.replace(/,/g,'')) : 'PAYE calculator not loaded';
  }
  if (cmd === '/holidays') { const n=require('./services/nigerian'); return n.nigerianPublicHolidays ? n.nigerianPublicHolidays() : 'Holiday data not loaded'; }
  if (cmd === '/biz') {
    const n=require('./services/nigerian');
    const type=rest||'bn';
    return n.getBusinessFormationCost ? n.getBusinessFormationCost(type) : '/biz [bn|ltd|ngo|llp]';
  }

  // ===== ADVANCED BUSINESS TOOLS =====
  if (cmd === '/swot') {
    if(!a1) return 'Usage: /swot [product or company]\nExample: /swot BuildBot AI';
    return await think({ message: `Create a concise SWOT analysis for: ${rest}. Format with Strengths, Weaknesses, Opportunities, Threats. Context: This is a Nigerian tech startup. Be specific and actionable.`, from, sessionId, memory: [] });
  }
  if (cmd === '/okr') {
    if(!a1) return 'Usage: /okr [team or product]\nExample: /okr ContentPilot AI Q3 2026';
    return await think({ message: `Create 3 OKRs (Objectives and Key Results) for: ${rest}. Each objective should have 2-3 measurable key results. Context: Nigerian tech startup ecosystem, July 2026.`, from, sessionId, memory: [] });
  }
  if (cmd === '/market') {
    if(!rest) return 'Usage: /market [industry or product]\nExample: /market AI construction tools Nigeria';
    return await think({ message: `Provide a brief market analysis for: ${rest}. Include: market size estimate, key players, growth trends, Nigerian market angle, and opportunity. Be specific with numbers where possible.`, from, sessionId, memory: [] });
  }
  if (cmd === '/valuation') {
    if(!a1) return 'Usage: /valuation [MRR] | [multiplier]\nExample: /valuation 500000 | 24';
    const mrr = parseFloat(String(a1).replace(/,/g,''));
    const mult = parseFloat(a2||'24');
    const arr = mrr * 12;
    const val = arr * mult;
    return `📊 *SaaS Valuation Estimate*\n\nMRR: ₦${mrr.toLocaleString()}\nARR: ₦${arr.toLocaleString()}\nMultiplier: ${mult}x ARR\n\nEstimated Valuation: *₦${val.toLocaleString()}*\n($${(val/1650/1000000).toFixed(2)}M USD)\n\nNote: Early-stage Nigerian SaaS typically 8-20x ARR`;
  }
  if (cmd === '/runway') {
    if(!a1||!a2) return 'Usage: /runway [cash balance] | [monthly burn]\nExample: /runway 5000000 | 800000';
    const cash = parseFloat(String(a1).replace(/,/g,''));
    const burn = parseFloat(String(a2).replace(/,/g,''));
    const months = Math.floor(cash / burn);
    const date = new Date(); date.setMonth(date.getMonth() + months);
    return `🏃 *Runway Calculator*\n\nCash: ₦${cash.toLocaleString()}\nMonthly Burn: ₦${burn.toLocaleString()}\nRunway: *${months} months*\nZero date: ${date.toLocaleDateString('en-NG', {month:'long', year:'numeric'})}\n\n${months < 6 ? '⚠️ CRITICAL — raise or cut costs NOW' : months < 12 ? '⚡ Moderate — start fundraising' : '✅ Healthy runway'}`;
  }
  if (cmd === '/churn') {
    if(!a1||!a2) return 'Usage: /churn [churned customers] | [total customers]\nExample: /churn 3 | 50';
    const churned = parseFloat(a1), total = parseFloat(a2);
    const rate = (churned / total * 100).toFixed(2);
    const ltv_mult = rate > 0 ? (100 / parseFloat(rate)).toFixed(1) : 'infinite';
    return `📉 *Churn Analysis*\n\nChurned: ${churned} / ${total} customers\nChurn Rate: *${rate}%*\nLTV Multiplier: ~${ltv_mult}x ARPU\n\n${parseFloat(rate) > 10 ? '🔴 High churn — investigate immediately' : parseFloat(rate) > 5 ? '🟡 Moderate — improve onboarding' : '🟢 Healthy churn rate'}`;
  }

  // ===== HARZ ECOSYSTEM REVENUE TRACKER =====
  if (cmd === '/revenue') {
    const platforms = [
      { name: 'BuildBot AI', tiers: 'Basic ₦15k | Pro ₦45k', status: 'test' },
      { name: 'ContentPilot', tiers: '$15/$39/$99/mo', status: 'test' },
      { name: 'Nexal Media', tiers: '₦15k-₦50k/campaign', status: 'test' },
      { name: 'HarzDM', tiers: '10% commission', status: 'test' },
      { name: 'Oracle AI', tiers: '₦500/reading | ₦2,500/mo', status: 'test' },
      { name: 'HostMaster AI', tiers: 'Domain + Hosting', status: 'prototype' },
    ];
    let msg = `💰 *Harz Revenue Overview*\n\n`;
    platforms.forEach(p => {
      const icon = p.status === 'test' ? '🟡' : '⚪';
      msg += `${icon} ${p.name}\n   ${p.tiers}\n`;
    });
    msg += `\nAll in test mode — awaiting Paystack/Stripe live verification.\nType /mrr [customers] | [price] to project revenue.`;
    return msg;
  }

  // ===== QUICK INFO COMMANDS =====
  if (cmd === '/todaytip') {
    const tips = [
      'Deploy one small update to any platform today. Forward motion beats perfection.',
      'Check your Paystack dashboard — verify that business documents are submitted.',
      'Write one piece of content about any Harz platform. Post to AI Global channel.',
      'Review one GitHub repo — push a README update or small fix.',
      'Message one potential customer about BuildBot AI. Real outreach, real feedback.',
      'Set up one new automation. Even 5 minutes saved daily = 30 hours/year.',
      'Review your domain portfolio — any renewals coming up? Any new opportunities?',
      'Look at your apps from a visitor perspective. What is confusing?',
      'Price check: are your rates competitive with the Nigerian market? /buildbot',
      'One chapter review: reread one chapter of The Complete Genius 365 today.'
    ];
    const tip = tips[new Date().getDate() % tips.length];
    return `💡 *Daily Tip*\n\n${tip}\n\nFrom your agent, Maganu.`;
  }

  if (cmd === '/version') {
    return `🤖 *Maganu v7.3*\n\nCapabilities: 500+\nCommands: 260+\nModel: llama-4-scout (30k TPM)\nNew in v7.1:\n• /weather [city] — live Nigerian weather\n• /timer [task] — Pomodoro (25 min)\n• /win, /wins — win tracking\n• /journal, /myjournal — journal\n• /loan — loan calculator\n• /paye — salary tax calculator\n• /swot, /okr, /market — strategy\n• /valuation, /runway, /churn — SaaS metrics\n• /percent, /age, /tip — quick math\n• /uuid, /b64, /genpass — dev tools\n• /word — word of the day\nGitHub: github.com/rabiuhamza11/maganu-agent`;
  }


  // ===== AI FALLBACK =====


  const memory = getMemory(sessionId);
  const response = await think({ message: raw, from, sessionId, memory });
  addToMemory(sessionId, { role: 'user', content: raw });
  addToMemory(sessionId, { role: 'assistant', content: response });
  return sentiment.prefix + response;
}

// ============ TELEGRAM ============
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const { message } = req.body;
  if (!message?.text) return;
  const chatId = message.chat.id;
  const text = message.text.trim();
  const from = message.from?.first_name || 'Rabiu';
  const sessionId = String(chatId);
  if (!ownerChatId) { ownerChatId = String(chatId); process.env.OWNER_CHAT_ID = ownerChatId; }
  console.log(`[TG][${from}] ${text.slice(0,60)}`);
  await sendTyping(chatId);
  try { await sendMessage(chatId, await processUpdate(chatId, text, from, sessionId)); }
  catch (err) { await sendMessage(chatId, `❌ ${err.message}`); }
});

// ============ PAYMENT ALERTS ============
app.post('/payment-alert', async (req, res) => {
  res.sendStatus(200);
  try {
    const { event, data } = req.body;
    if (!event?.includes('success') && !event?.includes('succeeded')) return;
    const amount = data?.amount ? `₦${(data.amount/100).toLocaleString()}` : '?';
    const email = data?.customer?.email || data?.receipt_email || data?.metadata?.email || 'Unknown';
    const target = ownerChatId || process.env.OWNER_CHAT_ID;
    if (target) await sendMessage(target, `💰 *Payment Received!*\n\n${amount} from ${email}\nEvent: ${event}\n\n🚀 Harz is making money!`);
  } catch (err) { console.error('Alert:', err.message); }
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
app.get('/', (req, res) => res.json({ name: 'Maganu Agent', version: '7.2.0', status: 'online', capabilities: 500, commands: 275, payments: { paystack: !!process.env.PAYSTACK_SECRET_KEY, stripe: !!process.env.STRIPE_SECRET_KEY, flutterwave: !!process.env.FLUTTERWAVE_SECRET_KEY }, financial: { transfers: true, refunds: true, paymentLinks: true, bankManager: true, universalBanks: true }, owner: 'Rabiu Hamza', scheduler: scheduler.getStatus() }));

// ============ WEBHOOK SETUP ============
async function setWebhook(url) {
  try { const r=await axios.post(`${TELEGRAM_API}/setWebhook`,{url:`${url}/webhook`,allowed_updates:['message']}); console.log('Webhook:',r.data.description); }
  catch (err) { console.error('Webhook:',err.message); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v7.3.0 — ${PORT} | 500+ capabilities | 275+ commands`);
  scheduler.start();
  await setWebhook(process.env.WEBHOOK_URL || 'https://maganu-agent.onrender.com');
});

module.exports = app;
