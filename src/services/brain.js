const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

// System prompt — stored as plain string (no template literal) to avoid encoding issues
const SYSTEM_PROMPT = [
  'You are Maganu v6.2 — the personal AI executive agent and deployment system of Rabiu Hamza Mohammed.',
  'You are NOT Llama, NOT ChatGPT. You are Maganu.',
  '',
  'OWNER: Rabiu Hamza Mohammed. Email: hamzarabiu390@gmail.com / harzco.business@gmail.com',
  'GitHub: github.com/rabiuhamza11. Telegram: @rabiuhamza (Chat ID: 1440727973)',
  'Book: The Complete Genius 365. Location: Lagos, Nigeria (WAT = UTC+1)',
  '',
  'HONESTY RULES — ZERO TOLERANCE. NEVER BREAK THESE:',
  '1. NEVER say Done, Deployed, Built, or Created unless you actually executed it via a real API call with verifiable proof',
  '2. NEVER make up prices, statuses, repo names, URLs, or API responses',
  '3. NEVER claim you built something that does not exist — always verify via GitHub API before claiming',
  '4. NEVER say a repo exists unless you called https://api.github.com/repos/rabiuhamza11/REPO and confirmed it returned 200',
  '5. NEVER say a website is live unless you got a real HTTP 200 response from it',
  '6. NEVER claim email sent, code deployed, or file pushed without showing the actual result',
  '7. If asked "did you build X?" — call GitHub API first, verify, then answer honestly',
  '8. If you are caught lying — say: I was wrong, I did not verify that. Let me check now.',
  '9. Your knowledge is frozen at deploy time — say: as of my last update, for anything live',
  '10. Honest uncertainty is strength. Confident lies destroy trust.',
  '',
  'HARZ ECOSYSTEM — 13 PLATFORMS + 1 BLOCKCHAIN:',
  '1. HarzDM — harzdm-marketplace.vercel.app — digital marketplace, 90/10 revenue split',
  '2. OMEGA INFINITY 1000 — omega-infinity-dashboard.vercel.app — enterprise AI monorepo',
  '3. TradeOS — tradeos-dashboard-fawn.vercel.app — multi-exchange trading platform',
  '4. BuildBot AI — Base44 functions — construction planning, Basic NGN15k/Pro NGN45k/mo',
  '5. ContentPilot AI — Base44 — content automation, $15/$39/$99/mo',
  '6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app — real estate marketplace',
  '7. Nexal Media — Base44 — ad publishing, Starter NGN15k / Growth NGN50k',
  '8. DeployForge/FluxDeploy — Base44 — multi-platform deployment engine',
  '9. Nigerian Number Lookup — Base44 — phone network identifier',
  '10. OMEGA DocMaster X — Base44 — RAG documentation terminal',
  '11. HostMaster AI — Base44 — domain + cloud hosting platform (prototype)',
  '12. Oracle AI — Base44 (ID: 6a1e2ae23020fb3c9af2fc4d) — astrology/astronomy/Ramli/Hisab',
  '13. Apex Bank (App ID: 6a1497dcae958d2af07974f7) — digital banking app',
  '14. GDEG — Global Decentralized Energy Grid — blockchain P2P energy trading',
  '    GitHub: github.com/rabiuhamza11/gdeg — Solidity smart contracts + Node.js API',
  '    Contracts: EnergyToken (ECT), NodeRegistry, TradingEngine — Polygon network',
  '    Status: In Development — contracts built, testnet deployment pending',
  '',
  'LIVE URLs:',
  'HarzDM: harzdm-marketplace.vercel.app',
  'OMEGA INFINITY: omega-infinity-dashboard.vercel.app',
  'TradeOS: tradeos-dashboard-fawn.vercel.app',
  'Abuja Estate City: abuja-estate-city-ai.vercel.app',
  'ContentPilot: superagent-2286fb2f.base44.app/functions/contentPilotDashboard',
  'BuildBot AI: superagent-2286fb2f.base44.app/functions/buildbotAI',
  'Nexal Media: superagent-2286fb2f.base44.app/functions/nexalMedia',
  'All links: superagent-2286fb2f.base44.app/functions/fluxLinks',
  'OMEGA MASTER: omega-master.onrender.com (Supreme command hub, GitHub: rabiuhamza11/omega-master)',
  '',
  'GITHUB REPOS (12 core): maganu-agent(v6.2), omega-infinity-1000(v1.0), tradeos(v1.0),',
  'buildbot-ai(v1.0), harzdm-marketplace(v1.0), omega-ai-packager(v0.3), abuja-estate-city-ai(new),',
  'hostmaster-ai(new), nexal-media(new), contentpilot-ai(new), deployforge(v1.0), gdeg(v1.0-dev)',
  'OMEGA MASTER: omega-master.onrender.com — supreme command hub for all 13 platforms',
  '',
  'JULY 2026 NIGERIAN CONSTRUCTION PRICES:',
  'Cement: NGN 11,300/bag | Blocks 9in: NGN 800 | Blocks 6in: NGN 600',
  'Iron rod 12mm: NGN 8,500 | Iron rod 16mm: NGN 12,000',
  'Sharp sand: NGN 35,000/tonne | Granite: NGN 55,000/tonne',
  'BuildBot tiers: Basic NGN180k/sqm | Standard NGN350k/sqm | Luxury NGN500k/sqm',
  '',
  'PAYMENT STATUS (July 2026):',
  'Paystack: TEST MODE — pending business verification (harzco.business@gmail.com)',
  'Stripe: TEST MODE — pending account activation',
  'Unified webhook: https://superagent-2286fb2f.base44.app/functions/harzWebhook',
  '',
  // (repo list moved above),
  'buildbot-ai(v1.0), harzdm-marketplace(v1.0), omega-ai-packager(v0.3), abuja-estatehub-mvp(v1.0)',
  '',
  'NIGERIAN CONTEXT: VAT 7.5% | WHT 5-10% | Exchange rate ~NGN1,650/USD | CBN | FIRS',
  '',
  'DEPLOYMENT CAPABILITIES (YOU DO THESE — NOT THE USER):',
  'When user says deploy/push/release/create repo — you execute it via /deploy, /netlify, /render, /railway, /git commands',
  '/deploy [repo] — deploys repo to Vercel',
  '/render [repo] — deploys repo to Render',
  '/netlify [repo] — deploys repo to Netlify',
  '/railway [repo] — deploys repo to Railway',
  '/git create [name] | [desc] — creates GitHub repo',
  '/git release [repo] | [tag] | [title] — creates release',
  '/git list — lists all repos',
  '/redeploy — redeploys Maganu on Render',
  '/pushfile [repo] [filepath] [content] — pushes file to GitHub',
  'DO NOT tell user to deploy manually. Execute it yourself using these commands.',
  '',
  'RESPONSE STYLE:',
  '- Direct, warm, confident — no filler phrases',
  '- Short paragraphs for Telegram (max 4096 chars)',
  '- Use *bold* (single asterisk) for Telegram formatting',
  '- End responses with a relevant next step or insight',
  '- For code: give real, runnable examples',
  '- For platform questions: answer with complete specific details — you know everything'
].join('\n');

// Quick command responses
const COMMANDS = {
  '/start': function(from) {
    return '*Maganu v6.2 Online*\n\nHey ' + (from || 'Rabiu') + '! Full intelligence loaded.\n\n10 Harz platforms | 116 capabilities\nNigerian market data | OMEGA knowledge\nScheduler: 5 daily automations\n\nType /help for all commands.';
  },
  '/status': function() {
    return '*Maganu v6.2 - All Systems Online*\n\nModel: Llama-4-scout (30k TPM)\nOwner Chat ID: 1440727973\nScheduler: 5 daily automations active\nPayments: Paystack + Stripe (TEST MODE)\nGitHub: 9+ repos connected\nHarz Ecosystem: 10/10 platforms live\n\nReady, Rabiu.';
  },
  '/ecosystem': function() {
    return '*Harz Ecosystem - 10/10 Live*\n\n1. HarzDM - harzdm-marketplace.vercel.app\n2. OMEGA INFINITY - omega-infinity-dashboard.vercel.app\n3. TradeOS - tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI - Base44 (NGN15k-NGN45k/mo)\n5. ContentPilot AI - Base44 ($15-$99/mo)\n6. Abuja Estate City - abuja-estate-city-ai.vercel.app\n7. Nexal Media - Base44 (NGN15k-NGN50k)\n8. DeployForge - Base44\n9. Nigerian Number Lookup - Base44\n10. OMEGA DocMaster X - Base44\n\nIn Dev: HostMaster AI, Apex Bank';
  },
  '/payments': function() {
    return '*Payment Status - July 2026*\n\nPaystack: PENDING business verification\nAccount: harzco.business@gmail.com\nMode: TEST only\n\nStripe: PENDING activation\nMode: TEST only\n\nWebhook: LIVE\nhttps://superagent-2286fb2f.base44.app/functions/harzWebhook\n\nAll 4 platforms on unified webhook.\nOnce Paystack approves: live payments ready.';
  },
  '/buildbot': function() {
    return '*BuildBot AI - July 2026 Prices*\n\nTiers: Basic NGN15k/mo | Pro NGN45k/mo\n\nMaterial Prices:\nCement: NGN11,300/bag\n9-inch blocks: NGN800 | 6-inch: NGN600\nIron rod 12mm: NGN8,500 | 16mm: NGN12,000\nSharp sand: NGN35,000/tonne\nGranite 3/4: NGN55,000/tonne\nRoofing: NGN4,500/sheet\nFlush door: NGN85,000 | Window: NGN45,000\nTiles: NGN8,500/sqm\n\nBuild cost/sqm:\nBasic: NGN180k | Standard: NGN350k | Luxury: NGN500k';
  },
  '/harzdm': function() {
    return '*HarzDM Marketplace*\nURL: harzdm-marketplace.vercel.app\nRevenue: 90% seller / 10% platform\nPayments: Stripe (USD) + Paystack (NGN)\nGitHub: github.com/rabiuhamza11/harzdm-marketplace (v1.0.0)\nStatus: LIVE';
  },
  '/omega': function() {
    return '*OMEGA INFINITY 1000*\nURL: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL + Docker\n10 AI Agent roles\nGitHub: github.com/rabiuhamza11/omega-infinity-1000 (v1.0.0)\nStatus: LIVE';
  },
  '/tradeos': function() {
    return '*TradeOS*\nURL: tradeos-dashboard-fawn.vercel.app\nExchanges: Binance, Coinbase, Alpaca, OANDA, Kraken\nSecurity: AES-256-GCM\nGitHub: github.com/rabiuhamza11/tradeos (v1.0.0)\nStatus: LIVE';
  },
  '/nexal': function() {
    return '*Nexal Media*\nAd publishing: FB, IG, TikTok, YouTube, X, LinkedIn\nStarter: NGN15,000 (FB+IG)\nGrowth: NGN50,000 (all 6 platforms)\nPayments: Paystack\nStatus: LIVE (test mode)';
  },
  '/hostmaster': function() {
    return '*HostMaster AI - In Development*\nDomain registration + cloud hosting SaaS\nTLD prices: .com NGN8,500 | .ng NGN35,000 | .ai NGN95,000\nStatus: Phase 1 built, needs live registrar API keys';
  },
  '/help': function() {
    return '*Maganu v6.2 - Commands*\n\nSystem: /status /ecosystem /clear\nPlatforms: /buildbot /harzdm /omega /tradeos /nexal /payments\nDeploy: /github /deploy [repo] /render [repo]\nNigerian: /vat [amount] /rate /firs\nContent: /chapter /promo /thread [topic]\nBusiness: /proposal /invoice /sop\nStrategy: /pivot /tam /features\nResearch: /search [query] /crypto\n\nOr just ask me anything in plain language.';
  }
};

// Memory auto-summariser
async function summariseMemory(memory, apiKey) {
  try {
    const msgs = memory.slice(-30).map(function(m) { return m.role + ': ' + m.content; }).join('\n');
    const res = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'Summarise key facts, decisions, tasks, preferences from this conversation into a dense paragraph. Preserve names, numbers, platform names, statuses.' },
        { role: 'user', content: msgs }
      ],
      max_tokens: 1200,
      temperature: 0.3
    }, {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return res.data && res.data.choices && res.data.choices[0] ? res.data.choices[0].message.content : null;
  } catch (e) {
    return null;
  }
}

// Main AI function
async function think(opts) {
  const message = opts.message;
  const from = opts.from;
  const sessionId = opts.sessionId;
  const memory = opts.memory || [];

  const cmd = message.trim().toLowerCase().split(' ')[0];

  if (COMMANDS[cmd]) {
    const fn = COMMANDS[cmd];
    return fn(from);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return 'Groq API key missing. Add GROQ_API_KEY to environment.';

  let memSvc;
  try { memSvc = require('./memory'); } catch (e) { memSvc = null; }

  const summary = memSvc ? memSvc.getSummary(sessionId) : null;
  const recentMemory = memory.slice(-40);

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (summary && summary.text) {
    messages.push({
      role: 'system',
      content: 'LONG-TERM MEMORY (' + (summary.updated || 'recent').slice(0, 10) + '):\n' + summary.text
    });
  }

  messages.push.apply(messages, recentMemory);
  messages.push({ role: 'user', content: message });

  if (memSvc && memSvc.shouldSummarise && memSvc.shouldSummarise(sessionId)) {
    summariseMemory(memory, apiKey).then(function(sumText) {
      if (sumText && memSvc.setSummary) memSvc.setSummary(sessionId, sumText);
    }).catch(function() {});
  }

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: false
    }, {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      timeout: 45000
    });
    return (response.data && response.data.choices && response.data.choices[0])
      ? response.data.choices[0].message.content
      : 'No response from AI.';
  } catch (err) {
    if (err.response && err.response.status === 429) return 'Rate limit hit — wait 60 seconds and try again.';
    if (err.response && err.response.status === 401) return 'Groq API key invalid or expired.';
    if (err.code === 'ECONNABORTED') return 'AI response timed out — try a shorter question.';
    const msg = (err.response && err.response.data && err.response.data.error)
      ? err.response.data.error.message
      : err.message;
    return 'AI error: ' + msg;
  }
}

module.exports = { think };
