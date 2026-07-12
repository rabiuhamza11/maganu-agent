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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  if (cmd === '/start') return `👋 *Maganu v6.0 — Ultimate Edition*\n\nHey ${from}!\n\n116 capabilities | 95+ commands\nOMEGA Master Knowledge loaded\nFull Harz Ecosystem control\n\nType /help for all commands.`;

  if (cmd === '/clear') { clearMemory(sessionId); return '🧹 Memory cleared! (conversation history + long-term summary reset)'; }
  if (cmd === '/memory') {
    const mem = getMemory(sessionId);
    const sum = getSummary(sessionId);
    let msg = `🧠 *Maganu Memory Status*\n\nSession: ${sessionId}\nMessages stored: ${mem.length} (last ${CONTEXT_WINDOW} sent to AI)\n`;
    if (sum) msg += `Long-term summary: ✅ (${sum.updated?.slice(0,10)||'recent'})\n\nSummary:\n${sum.text?.slice(0,400)}...`;
    else msg += 'Long-term summary: None yet (auto-generates after 30 messages)';
    return msg;
  }

  if (cmd === '/status') return `🟢 *Maganu v6.0 Online*\n\n116 capabilities | 95+ commands\nModel: Groq Llama 3.3 70B\nKnowledge: OMEGA Master Synthesis\nMemory: Persistent\nScheduler: 4 automations\nPayments: Stripe + Paystack\nDeploy: Vercel+Netlify+Render+Railway\nCRM + Nigerian Tools\nLearning + Habits\nIntelligence: Crypto, Domains, SSL\nWriter: Proposals, SOPs, Scripts, Ads\nStrategy: Market sizing, Pivots, Exit\nSecurity: Password, Audit\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu. 🔥`;

  if (cmd === '/help') return `🤖 *Maganu v6.0 — 65+ Commands*\n\n*System*\n/status /ecosystem /clear\n\n*Payments*\n/payments /paystack /stripe /revenue\n\n*Deploy*\n/repos /github /commit [repo] [msg]\n/deploy /netlify /render /railway [repo]\n/logs [id]\n\n*Productivity*\n/today /week /uptime\n/tasks /addtask /done /deltask\n\n*CRM*\n/crm /addclient /followup /invoice /leads\n\n*Nigerian Tools*\n/vat /wht /firs /cbn /rate /nginvoice\n\n*Intelligence*\n/crypto — live prices\n/domain [name] — availability\n/ssl [domain] — cert check\n/trending — GitHub hot repos\n/funding — African startup news\n/producthunt — today's launches\n\n*Research*\n/search /research /competitor\n/review /arch /summarize\n\n*Analytics*\n/traffic /codestats /market /digest\n\n*Learning*\n/techdigest /skill /flashcard /books\n\n*Habits*\n/habits /addhabit [name] /habit [name]\n\n*Business Docs*\n/proposal [client] | [project] | [budget]\n/sop [process] | [steps]\n/jd [role] | [company] | [reqs]\n/press [headline] | [product] | [detail]\n/contract [paste text]\n\n*Outreach & Content*\n/drip [product] | [audience]\n/outreach [role] | [company] | [product]\n/calendar30 [platform] | [topic]\n/newsletter [platform] | [highlights]\n/thread [topic]\n/linkedin [topic] | [audience]\n/ad [platform] | [product] | [audience]\n/podcast [topic] | [audience]\n/youtube [title] | [niche]\n\n*Strategy*\n/pivot [idea] | [problem]\n/tam [idea] | [geography]\n/features [product] | [backlog]\n/exit [platform] | [metrics]\n\n*Business Builder*\n/launch /pricing /abtest /names\n\n*Security*\n/password [password]\n/secaudit [codebase]\n\n*Content*\n/chapter /promo /post /broadcast\n\n/email [to subject] | [body]`;

  if (cmd === '/ecosystem') return `🌐 *Harz Ecosystem — 10/10*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`;

  // ===== TASKS =====
  if (cmd === '/tasks') return tasks.formatTaskList();
  if (cmd === '/addtask') { if (!rest) return 'Usage: /addtask [task]'; const t = tasks.addTask(rest); return `✅ Added: "${t.text}" [${String(t.id).slice(-4)}]`; }
  if (cmd === '/done') { const t = tasks.completeTask(args[0]); return t ? `✅ Done: "${t.text}"` : `❌ Task not found.`; }
  if (cmd === '/deltask') { return tasks.deleteTask(args[0]) ? `🗑 Deleted.` : `❌ Not found.`; }

  // ===== DEPLOY =====
  if (cmd === '/repos') { const r = await deploy.listRepos(); if (!r.length) return '❌ No repos.'; let m=`🐙 *Repos (${r.length})*\n\n`; r.slice(0,15).forEach(x=>{m+=`${x.private?'🔒':'🌐'} ${x.name} — ${x.language} ⭐${x.stars}\n`;}); return m; }
  if (cmd === '/deploy') { if (!args[0]) return 'Usage: /deploy [repo]'; const r = await deploy.deployVercel(args[0]); return r.ok?`🚀 Vercel: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/netlify') { if (!args[0]) return 'Usage: /netlify [repo]'; const r = await deploy.deployNetlify(args[0]); return r.ok?`🚀 Netlify: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/render') { if (!args[0]) return 'Usage: /render [repo]'; const r = await deploy.deployRender(args[0]); return r.ok?`🚀 Render: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/railway') { if (!args[0]) return 'Usage: /railway [repo]'; const r = await deploy.deployRailway(args[0]); return r.ok?`🚀 Railway: ${args[0]}\n${r.url}`:`❌ ${r.error}`; }
  if (cmd === '/commit') { const repo=args[0]; const msg=args.slice(1).join(' '); if(!repo||!msg) return 'Usage: /commit [repo] [message]'; const r=await deploy.triggerCommit(repo,msg); return r.ok?`✅ ${r.message}`:`❌ ${r.error}`; }
  if (cmd === '/logs') { const id=args[0]||'srv-d99er9reo5us738eskk0'; return `📋 *Render Logs*\n\n${await deploy.getRenderLogs(id)}`; }

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
  if (cmd === '/paystack') { const s=await payments.getPaystackStats(); if(s.error) return `❌ ${s.error}`; return `💚 *Paystack*\nBalance: ${s.balance}\n${s.successfulTxns}/${s.totalTxns} txns\nRevenue: ${s.totalRevenue}`; }
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
app.get('/', (req, res) => res.json({ name: 'Maganu Agent', version: '6.0.0', status: 'online', capabilities: 86, commands: 65, owner: 'Rabiu Hamza', scheduler: scheduler.getStatus() }));

// ============ WEBHOOK SETUP ============
async function setWebhook(url) {
  try { const r=await axios.post(`${TELEGRAM_API}/setWebhook`,{url:`${url}/webhook`,allowed_updates:['message']}); console.log('Webhook:',r.data.description); }
  catch (err) { console.error('Webhook:',err.message); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v6.0.0 — ${PORT} | 116 capabilities | 95+ commands`);
  scheduler.start();
  await setWebhook(process.env.WEBHOOK_URL || 'https://maganu-agent.onrender.com');
});

module.exports = app;
