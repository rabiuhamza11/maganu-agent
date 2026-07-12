const cron = require('node-cron');
const brain = require('./brain');
const payments = require('./payments');
const monitor = require('./monitor');
const content = require('./content');
const calendar = require('./calendar');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendTelegram(message) {
  const chatId = process.env.OWNER_CHAT_ID;
  if (!chatId) {
    console.warn('OWNER_CHAT_ID not set — message not sent. Send /start to Maganu on Telegram to register.');
    return;
  }
  const MAX = 4096;
  const chunks = [];
  for (let i = 0; i < message.length; i += MAX) chunks.push(message.slice(i, i + MAX));
  for (const chunk of chunks) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk, parse_mode: 'Markdown' });
    } catch (_) {
      try { await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk }); } catch (e) {
        console.error('Scheduled send failed:', e.message);
      }
    }
  }
}

const jobs = [];

function start() {
  console.log('📅 Maganu Scheduler v3.0 starting...');

  // ======= 1. MORNING BRIEFING — 7:00 AM Lagos (6:00 AM UTC) =======
  const morningBriefing = cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running morning briefing...');
    try {
      const today = new Date().toLocaleDateString('en-NG', {
        timeZone: 'Africa/Lagos', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const chapter = content.getTodayChapter();
      const calEvents = await calendar.getTodayEvents();

      const aiGreeting = await brain.think({
        message: `Write a 2-line energizing morning greeting for Rabiu Hamza. Today is ${today}. Be direct and motivating. No fluff.`,
        from: 'scheduler', sessionId: 'morning', memory: []
      });

      const msg = `🌅 *Good Morning, Rabiu!*\n\n${aiGreeting}\n\n📅 *Today's Schedule:*\n${calEvents}\n\n${chapter}`;
      await sendTelegram(msg);
    } catch (err) { console.error('Morning briefing failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'morning_briefing', schedule: '7:00 AM Lagos daily', job: morningBriefing });

  // ======= 2. ECOSYSTEM HEALTH + UPTIME — 9:00 AM Lagos (8:00 AM UTC) =======
  const ecosystemCheck = cron.schedule('0 8 * * *', async () => {
    console.log('🔍 Running ecosystem + uptime check...');
    try {
      const { report, downPlatforms } = await monitor.getUptimeReport();
      await sendTelegram(report);
      if (downPlatforms.length) {
        await sendTelegram(`🚨 *ALERT: ${downPlatforms.length} platform(s) down!*\n\n${downPlatforms.map(p => `❌ ${p.name}`).join('\n')}\n\nInvestigating now...`);
      }
    } catch (err) { console.error('Ecosystem check failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'ecosystem_health_check', schedule: '9:00 AM Lagos daily', job: ecosystemCheck });

  // ======= 3. PAYMENT REPORT — 9:30 AM Lagos (8:30 AM UTC) =======
  const paymentReport = cron.schedule('30 8 * * *', async () => {
    console.log('💳 Running payment report...');
    try {
      const report = await payments.getFullPaymentReport();
      await sendTelegram(report);
    } catch (err) { console.error('Payment report failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'payment_report', schedule: '9:30 AM Lagos daily', job: paymentReport });

  // ======= 4. PLATFORM PROMO ROTATION — 10:00 AM Lagos (9:00 AM UTC) =======
  const promoRotation = cron.schedule('0 9 * * *', async () => {
    console.log('📢 Running promo rotation...');
    try {
      const platform = content.getTodayPromoTarget();
      const promo = await content.generatePromoPost(platform.name, platform.desc, platform.url);
      await sendTelegram(`📢 *Daily Platform Spotlight*\n\n${promo}`);
    } catch (err) { console.error('Promo rotation failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'promo_rotation', schedule: '10:00 AM Lagos daily', job: promoRotation });

  console.log(`✅ Scheduler v3.0 — ${jobs.length} automations active`);
  jobs.forEach(j => console.log(`   ✅ ${j.name} — ${j.schedule}`));
}

function getStatus() {
  return {
    agent: 'Maganu v3.0',
    automations: jobs.map(j => ({ name: j.name, schedule: j.schedule, status: 'active' })),
    total: jobs.length
  };
}

function stop() {
  jobs.forEach(({ job }) => job.stop());
}

module.exports = { start, getStatus, stop };
