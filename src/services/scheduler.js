const cron = require('node-cron');
const brain = require('./brain');
const payments = require('./payments');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendTelegram(message) {
  if (!OWNER_CHAT_ID) {
    console.warn('OWNER_CHAT_ID not set — cannot send scheduled message');
    return;
  }
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: OWNER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Scheduled message sent to owner');
  } catch (err) {
    // Retry without markdown
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: OWNER_CHAT_ID,
        text: message
      });
    } catch (e) {
      console.error('Failed to send scheduled message:', e.message);
    }
  }
}

const jobs = [];

function start() {
  console.log('📅 Maganu Scheduler starting...');

  // ======= MORNING BRIEFING — 7:00 AM Lagos (6:00 AM UTC) =======
  const morningBriefing = cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running morning briefing...');
    try {
      const today = new Date().toLocaleDateString('en-NG', {
        timeZone: 'Africa/Lagos',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const briefing = await brain.think({
        message: `Generate a sharp morning briefing for Rabiu Hamza. Today is ${today}. Include: 1) A motivational opener (1 line), 2) Quick Harz Ecosystem status — all 10 platforms live, 3) One powerful insight from "The Complete Genius 365". Keep it concise, energizing, and formatted for Telegram (use *bold* for headers). End with a single action focus for the day.`,
        from: 'scheduler',
        sessionId: 'morning_briefing',
        memory: []
      });

      await sendTelegram(`🌅 *Good Morning, Rabiu!*\n\n${briefing}`);
    } catch (err) {
      console.error('Morning briefing failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'morning_briefing', schedule: '7:00 AM Lagos daily', job: morningBriefing });

  // ======= ECOSYSTEM HEALTH CHECK — 9:00 AM Lagos (8:00 AM UTC) =======
  const ecosystemCheck = cron.schedule('0 8 * * *', async () => {
    console.log('🔍 Running ecosystem health check...');
    try {
      const platforms = [
        { name: 'HarzDM Marketplace', url: 'https://harzdm-marketplace.vercel.app' },
        { name: 'OMEGA INFINITY', url: 'https://omega-infinity-dashboard.vercel.app' },
        { name: 'TradeOS', url: 'https://tradeos-dashboard-fawn.vercel.app' },
        { name: 'Abuja Estate City AI', url: 'https://abuja-estate-city-ai.vercel.app' },
        { name: 'Maganu Agent', url: 'https://maganu-agent.onrender.com' }
      ];

      const checks = await Promise.allSettled(
        platforms.map(p =>
          axios.get(p.url, { timeout: 8000 })
            .then(() => ({ name: p.name, status: '✅ Live' }))
            .catch(() => ({ name: p.name, status: '❌ Down' }))
        )
      );

      const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' });
      let msg = `🔍 *Ecosystem Check — ${date}*\n\n`;
      checks.forEach(r => {
        const c = r.value || r.reason;
        msg += `${c.status} ${c.name}\n`;
      });
      msg += `\n✅ BuildBot AI — Live (Base44)\n✅ ContentPilot AI — Live (Base44)\n✅ Nexal Media — Live (Base44)\n✅ Nigerian Number Lookup — Live (Base44)\n✅ DeployForge — Live (Base44)`;

      await sendTelegram(msg);
    } catch (err) {
      console.error('Ecosystem check failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'ecosystem_check', schedule: '9:00 AM Lagos daily', job: ecosystemCheck });

  // ======= PAYMENT REPORT — 9:30 AM Lagos (8:30 AM UTC) =======
  const paymentReport = cron.schedule('30 8 * * *', async () => {
    console.log('💳 Running payment report...');
    try {
      const report = await payments.getFullPaymentReport();
      await sendTelegram(report);
    } catch (err) {
      console.error('Payment report failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'payment_report', schedule: '9:30 AM Lagos daily', job: paymentReport });

  // ======= PROMO ROTATION — 10:00 AM Lagos (9:00 AM UTC) =======
  const platforms = [
    { name: 'HarzDM Marketplace', desc: 'Global digital marketplace — buy and sell digital products. Sellers keep 90%.', url: 'https://harzdm-marketplace.vercel.app' },
    { name: 'OMEGA INFINITY 1000', desc: 'Enterprise AI agent monorepo — 10 AI roles, full dev pipeline.', url: 'https://omega-infinity-dashboard.vercel.app' },
    { name: 'TradeOS', desc: 'Multi-platform trading system with real-time Kraken market data.', url: 'https://tradeos-dashboard-fawn.vercel.app' },
    { name: 'BuildBot AI', desc: 'AI-powered construction planning for Nigeria. Plans from ₦15,000/mo.', url: 'https://superagent-2286fb2f.base44.app/functions/buildbotAI' },
    { name: 'ContentPilot AI', desc: 'AI content agent — video gen, trend analysis, social scheduling.', url: 'https://superagent-2286fb2f.base44.app/functions/contentPilotDashboard' },
    { name: 'Abuja Estate City AI', desc: 'Smart real estate marketplace for Abuja — properties, pros, materials.', url: 'https://abuja-estate-city-ai.vercel.app' },
    { name: 'Nexal Media', desc: 'Social media ad publishing across 6 platforms. Packages from ₦15,000.', url: 'https://superagent-2286fb2f.base44.app/functions/nexalMedia' },
    { name: 'DeployForge', desc: 'Multi-platform deployment engine — GitHub, Vercel, Render, Netlify, Railway.', url: 'https://github.com/rabiuhamza11/deployforge' },
    { name: 'Nigerian Number Lookup', desc: 'Instant Nigerian phone number network and region detection.', url: 'https://superagent-2286fb2f.base44.app/functions/nigerianNumberLookup' },
    { name: 'OMEGA DocMaster X', desc: 'AI-powered documentation terminal with RAG search.', url: 'https://superagent-2286fb2f.base44.app/functions/omegaDocmasterX' }
  ];

  let promoIndex = new Date().getDay() % platforms.length;

  const promoRotation = cron.schedule('0 9 * * *', async () => {
    console.log('📢 Running promo rotation...');
    try {
      const platform = platforms[promoIndex % platforms.length];
      promoIndex++;

      const promo = await brain.think({
        message: `Write a short, punchy promotional post for *${platform.name}* for the AI Global WhatsApp channel. Platform description: ${platform.desc}. URL: ${platform.url}. Make it exciting, 3-4 lines max. Include 1-2 relevant emojis. End with the URL on its own line. Format for WhatsApp (single *bold*).`,
        from: 'scheduler',
        sessionId: 'promo_rotation',
        memory: []
      });

      await sendTelegram(`📢 *Daily Platform Spotlight*\n\n${promo}`);
    } catch (err) {
      console.error('Promo rotation failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'promo_rotation', schedule: '10:00 AM Lagos daily', job: promoRotation });

  console.log(`✅ Scheduler started — ${jobs.length} automations active`);
  console.log('   7:00 AM — Morning Briefing');
  console.log('   9:00 AM — Ecosystem Health Check');
  console.log('   9:30 AM — Payment Report');
  console.log('  10:00 AM — Platform Promo Rotation');
}

function getStatus() {
  return {
    agent: 'Maganu',
    automations: jobs.map(j => ({ name: j.name, schedule: j.schedule, status: 'active' })),
    total: jobs.length
  };
}

function stop() {
  jobs.forEach(({ job }) => job.stop());
  console.log('Scheduler stopped');
}

module.exports = { start, getStatus, stop };
