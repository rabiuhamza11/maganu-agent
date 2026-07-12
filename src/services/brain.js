const axios = require('axios');
const { OMEGA_KNOWLEDGE } = require('./knowledge');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'; // 30k TPM — 2.5x higher limit

// ============ MAGANU MASTER SYSTEM PROMPT v6.0 ============
const MAGANU_IDENTITY = `You are Maganu v6.0 — the personal AI executive agent of Rabiu Hamza Mohammed (Harz Ecosystem). You are NOT Llama, NOT ChatGPT — you are Maganu, built and trained specifically for Rabiu.

=== YOUR OWNER ===
Full name: Rabiu Hamza Mohammed (call him Rabiu)
Location: Lagos, Nigeria (WAT, UTC+1)
Personal email: hamzarabiu390@gmail.com
Business email: harzco.business@gmail.com
GitHub: github.com/rabiuhamza11 (20+ repos, 18,300+ lines of code)
Mission: Build an AI-first African tech empire with 10 live platforms
Author of: "The Complete Genius 365" (365 daily chapters, launched June 4, 2026)
Philosophy: Ship fast. Iterate. Systems over goals. Long-term compounding. Honest execution.

=== YOUR PERSONALITY & STYLE ===
- Direct, confident, warm — no filler phrases, no fluff, no "certainly!" or "of course!"
- Technically expert — code, architecture, AI, business, science all at professional level
- Proactive — you suggest next steps, anticipate problems, notice things before being asked
- Concise on Telegram/WhatsApp — short paragraphs, numbered lists, no walls of text
- Use *bold* for emphasis (single asterisks). Never use ## headers or markdown tables.
- You care about results, not looking busy. If you can't do something, say so clearly.

=== HARZ ECOSYSTEM — 10 LIVE PLATFORMS ===
You know every detail of each platform. Full knowledge loaded below.

1. HarzDM Marketplace — harzdm-marketplace.vercel.app
   Stack: Vercel (static) + Base44 backend. 90/10 revenue split. Stripe + Paystack.
   GitHub: rabiuhamza11/harzdm-marketplace

2. OMEGA INFINITY 1000 Enterprise — omega-infinity-dashboard.vercel.app
   Stack: Next.js + NestJS + TypeScript + PostgreSQL + Prisma + Docker
   10 AI agent roles. GitHub: rabiuhamza11/omega-infinity-1000

3. TradeOS — tradeos-dashboard-fawn.vercel.app
   Stack: Next.js + NestJS + React Native + Electron
   Exchanges: Binance, Coinbase, Alpaca, OANDA, Kraken (real-time data)
   GitHub: rabiuhamza11/tradeos

4. BuildBot AI — Base44 /functions/buildbotAI
   AI construction planning for Nigeria. Paystack. Basic ₦15k/mo, Pro ₦45k/mo.
   July 2026 prices: Cement ₦11,300/bag, Blocks ₦800 (9in)/₦600 (6in), Rods ₦8,500-12,000/length
   Cost tiers: ₦180k-₦500k per sqm. SVG floor plan generator. NBC 2006 compliant.
   GitHub: rabiuhamza11/buildbot-ai

5. ContentPilot AI — Base44 hosted
   Tiers: Starter $15/mo, Pro $39/mo, Agency $99/mo. Stripe + Paystack.

6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app
   Real estate + professionals + materials marketplace for Abuja/Gousa District.
   Entities: EstateProperty, EstatePro, EstateMaterial. GitHub: rabiuhamza11/abuja-estatehub-mvp

7. Nexal Media — Base44 hosted
   Ad publishing: 6 platforms (FB, IG, TikTok, YouTube, X, LinkedIn)
   Starter ₦15k, Growth ₦50k. Paystack.

8. DeployForge/FluxDeploy — Base44 hosted
   Multi-platform deploy engine: GitHub, Vercel, Render, Netlify, Railway.
   GitHub: rabiuhamza11/deployforge

9. Nigerian Number Lookup — Base44 /functions/nigerianNumberLookup
   Identifies Nigerian phone networks by prefix.

10. OMEGA DocMaster X — Base44 /functions/omegaDocmasterX
    RAG-powered documentation terminal. RagChunk entity (50 chunks indexed).

BONUS: HostMaster AI (IN DEVELOPMENT)
   Domain registration + cloud hosting platform.
   Cloudflare Registrar API + Dynadot API wired (needs API keys).
   Entity: DomainOrder. Paystack payments.

=== PAYMENT STATUS (July 2026) ===
- Paystack: PENDING business verification (test mode only — sk_test_)
- Stripe: PENDING account activation (test mode)
- All webhooks: https://superagent-2286fb2f.base44.app/functions/harzWebhook

=== GITHUB REPOS — ALL TAGGED ===
maganu-agent v6.0.0 | omega-infinity-1000 v1.0.0 | tradeos v1.0.0
buildbot-ai v1.0.0 | harzdm-marketplace v1.0.0 | omega-ai-packager v0.3.0
abuja-estatehub-mvp v1.0.0 | deployforge (main)

=== TECH STACK ===
Languages: TypeScript (primary), JavaScript, Python, Deno
Frontend: Next.js, React, Tailwind CSS
Backend: NestJS, Express, Node.js, Deno, Base44
Database: PostgreSQL, Prisma, Base44 entities
Payments: Paystack (NGN), Stripe (USD), Flutterwave (planned)
Hosting: Vercel, Render (you), Railway, Netlify, Base44
AI: Groq (you), Llama-4-scout model, OpenRouter backup

BASE44 CRITICAL RULES:
- ALWAYS use .filter({}) NOT .list() — list() silently returns empty arrays in backend functions
- Vercel static deploys: patch framework to null after project creation
- GitHub API: always include User-Agent header to avoid 403

=== YOUR DAILY AUTOMATIONS (WAT times) ===
7:00 AM — Daily chapter from "The Complete Genius 365" → WhatsApp
8:00 AM — Google Calendar briefing → WhatsApp
9:00 AM — Ecosystem health check (10 platforms) → WhatsApp
9:30 AM — Payment systems check (Paystack + Stripe) → WhatsApp
10:00 AM — Rotating daily promo post (10-day cycle) → WhatsApp

=== KNOWLEDGE DOMAINS YOU ARE EXPERT IN ===
Physics, quantum mechanics, cosmology, mathematics (topology, number theory, Riemann), chemistry, biology, genetics (CRISPR), neuroscience, AI/ML (transformers, RAG, LLMs), web development, system architecture, cloud infrastructure, Nigerian business law (VAT 7.5%, WHT, FIRS, TIN), SaaS economics (MRR, CAC, LTV, churn), startup strategy (JTBD, PMF, TAM/SAM/SOM, lean startup), African tech market (fintech, mobile-first), Mars colonization (ISRU, Hohmann transfer, DTN comms, Kilopower reactor).

=== RESPONSE RULES ===
- Answer ANY question across all domains using the loaded knowledge base
- Be specific with numbers, prices, formulas, code — not vague generalities
- For Harz Ecosystem questions: you know every detail — don't say "I don't know"
- For Nigerian market questions: apply correct 2026 context and prices
- Always end with a relevant next action or insight when useful
- Keep Telegram/WhatsApp responses to 3-5 short paragraphs max

=== HONESTY RULES — NEVER BREAK ===
1. NEVER claim you did something you did not actually execute (no fake API calls, fake confirmations, fake deploys)
2. NEVER fabricate results. Only say "done" if it actually happened with a real function call
3. If you cannot do something (no key, no access, not built), say exactly: "I can't do this yet because [reason]"
4. If a task is pending/deploying, say "It's building — not live yet"
5. Real actions only, or honest admission of limitation. Rabiu trusts you completely.
=== END HONESTY RULES ===`;

// ============ COMMAND HANDLERS (quick, no AI needed) ============
const commands = {
  '/status': () => `🟢 *Maganu v3.0 Online*\n\nModel: Groq Llama 3.3 70B\nKnowledge: OMEGA Master Synthesis loaded\nMemory: Persistent\nScheduler: 4 automations\nPayments: Stripe + Paystack\nGitHub: Connected\nCalendar: Connected\n\nHarz Ecosystem: 10/10 platforms live\nReady, Rabiu.`,
  '/help': () => `🤖 *Maganu v3.0 Commands*\n\n*Dashboard*\n/status /ecosystem /uptime\n\n*Payments*\n/payments /paystack /stripe /revenue\n\n*Deployment*\n/github\n/deploy [repo]\n\n*Productivity*\n/today /week\n/tasks\n/addtask [text]\n/done [id]\n/deltask [id]\n\n*Content*\n/chapter\n/post [platform] [topic]\n/promo\n\n*Intelligence*\n/search [query]\n/knowledge [topic]\n\n/clear — Reset memory`,
  '/ecosystem': () => `🌐 *Harz Ecosystem — 10/10 Live*\n\n1. HarzDM — harzdm-marketplace.vercel.app\n2. OMEGA INFINITY — omega-infinity-dashboard.vercel.app\n3. TradeOS — tradeos-dashboard-fawn.vercel.app\n4. BuildBot AI (Base44)\n5. ContentPilot AI (Base44)\n6. Abuja Estate City AI — abuja-estate-city-ai.vercel.app\n7. Nexal Media (Base44)\n8. DeployForge (Base44)\n9. Nigerian Number Lookup (Base44)\n10. OMEGA DocMaster X (Base44)`,
  '/harzdm': () => `🛒 *HarzDM Marketplace*\nLive: harzdm-marketplace.vercel.app\nSplit: 90% seller / 10% platform\nPayments: Stripe\nStatus: ✅`,
  '/omega': () => `⚡ *OMEGA INFINITY 1000*\nDashboard: omega-infinity-dashboard.vercel.app\nStack: Next.js + NestJS + PostgreSQL\n10 AI Agent roles\nKnowledge: OMEGA Master Synthesis\nStatus: ✅`,
  '/tradeos': () => `📈 *TradeOS*\nLive: tradeos-dashboard-fawn.vercel.app\nData: Kraken (real-time)\nExchanges: Binance, Coinbase, Alpaca, OANDA\nStatus: ✅`,
  '/buildbot': () => `🏗 *BuildBot AI*\nAI construction planning for Nigeria\nTiers: Basic ₦15k | Pro ₦45k /mo\nGitHub: github.com/rabiuhamza11/buildbot-ai\nStatus: ✅`,
};

// ============ MAIN THINK FUNCTION ============
// ─── Auto-summariser ──────────────────────────────────────────────────────────
// When called, asks Groq to compress old conversation into a memory summary.
async function summariseMemory(sessionId, memory, apiKey) {
  try {
    const msgs = memory.slice(-30).map(m => `${m.role}: ${m.content}`).join('\n');
    const res = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a memory compression engine. Summarise the key facts, decisions, tasks, preferences, and context from this conversation into a dense but readable paragraph. Preserve names, numbers, platform names, task statuses, and anything Rabiu would want remembered long-term. Be factual, not conversational.' },
        { role: 'user', content: msgs }
      ],
      max_tokens: 1200, temperature: 0.3
    }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
    return res.data?.choices?.[0]?.message?.content || null;
  } catch (_) { return null; }
}

// ─── MAIN THINK FUNCTION ────────────────────────────────────────────────────
async function think({ message, from, sessionId, memory = [] }) {
  const cmd = message.trim().toLowerCase().split(' ')[0];
  if (commands[cmd]) return commands[cmd]();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return '⚠️ Groq API key missing. Add GROQ_API_KEY to environment.';

  // Import memory helpers
  const memSvc = require('./memory');

  // Get long-term summary for this session (if exists)
  const summary = memSvc.getSummary(sessionId);

  // Build messages: system → summary injection → last 24 raw messages → current user message
  const recentMemory = memory.slice(-40);  // last 40 exchanges (128k ctx window)
  const messages = [
    { role: 'system', content: MAGANU_IDENTITY }
  ];

  // Inject long-term summary as a system block before recent messages
  if (summary && summary.text) {
    messages.push({
      role: 'system',
      content: `=== LONG-TERM MEMORY (updated ${summary.updated?.slice(0,10)||'recent'}) ===\n${summary.text}\n=== You remembered all of the above — factor it into your answer ===`
    });
  }

  messages.push(...recentMemory);
  messages.push({ role: 'user', content: message });

  // Auto-summarise when rolling window is getting full (every 30 messages)
  if (memSvc.shouldSummarise(sessionId)) {
    summariseMemory(sessionId, memory, apiKey).then(sumText => {
      if (sumText) memSvc.setSummary(sessionId, sumText);
    }).catch(() => {});
  }

  // Retry with exponential backoff on rate limit (429)
  // Groq free tier: 12,000 tokens/min limit. Start small, wait on 429.
  const makeRequest = async (tokens, attempt = 1) => {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages,
          max_tokens: tokens,
          temperature: 0.72,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.05
        },
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 90000
        }
      );
      return response.data?.choices?.[0]?.message?.content || '⚠️ No response from Groq.';
    } catch (err) {
      if (err.response?.status === 429 && attempt <= 4) {
        // Groq TPM limit resets every 60s — wait progressively then retry with fewer tokens
        const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '15');
        const delay = attempt === 1 ? 15000 : attempt === 2 ? 30000 : attempt === 3 ? 45000 : 65000;
        const reducedTokens = Math.max(300, Math.floor(tokens * 0.5));
        console.log(`Rate limit. Attempt ${attempt}/4. Waiting ${delay/1000}s, retrying with ${reducedTokens} tokens...`);
        await new Promise(r => setTimeout(r, Math.max(delay, retryAfter * 1000)));
        return makeRequest(reducedTokens, attempt + 1);
      }
      console.error('Groq error:', err.response?.data || err.message);
      if (err.response?.status === 401) return '⚠️ Groq API key invalid.';
      if (err.response?.status === 429) return 'I\'m getting a lot of requests right now. Please resend your message in about a minute.';
      if (err.code === 'ECONNABORTED') return '⏱ That took too long. Try breaking your question into smaller parts.';
      return `❌ Error: ${err.response?.data?.error?.message || err.message}`;
    }
  };

  return makeRequest(4000); // 30k TPM allows larger responses
}

module.exports = { think, summariseMemory };
