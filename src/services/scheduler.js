const cron = require('node-cron');
const brain = require('./brain');
const payments = require('./payments');
const monitor = require('./monitor');
const content = require('./content');
const calendar = require('./calendar');
const waBaileys = require('./wa-baileys');
const backup = require('./backup');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendTelegram(message) {
  const chatId = process.env.OWNER_CHAT_ID;
  if (!chatId) return;
  const MAX = 4096;
  const chunks = [];
  for (let i = 0; i < message.length; i += MAX) chunks.push(message.slice(i, i + MAX));
  for (const chunk of chunks) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk, parse_mode: 'Markdown' });
    } catch (_) {
      try { await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text: chunk }); } catch (e) {
        console.error('Telegram send failed:', e.message);
      }
    }
  }
}

// Send to both Telegram AND WhatsApp (Baileys)
async function broadcast(message) {
  await sendTelegram(message);
  // Strip markdown for WhatsApp
  const plainMsg = message.replace(/\*/g, '').replace(/_/g, '').replace(/`/g, '');
  await waBaileys.sendToOwner(plainMsg);
}

const jobs = [];

function start() {
  console.log('📅 Maganu Scheduler v4.0 starting...');

  // 1. MORNING BRIEFING — 7:00 AM Lagos (6:00 AM UTC)
  const morningBriefing = cron.schedule('0 6 * * *', async () => {
    try {
      const today = new Date().toLocaleDateString('en-NG', {
        timeZone: 'Africa/Lagos', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const chapter = content.getTodayChapter();
      const calEvents = await calendar.getTodayEvents();
      const aiGreeting = await brain.think({
        message: `Write a 2-line energizing morning greeting for Rabiu Hamza. Today is ${today}.`,
        from: 'scheduler', sessionId: 'morning', memory: []
      });
      await broadcast(`Good Morning, Rabiu!\n\n${aiGreeting}\n\nToday's Schedule:\n${calEvents}\n\n${chapter}`);
    } catch (err) { console.error('Morning briefing failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'morning_briefing', schedule: '7AM daily', job: morningBriefing });

  // 2. ECOSYSTEM HEALTH CHECK — 9:00 AM (8:00 AM UTC)
  const ecosystemCheck = cron.schedule('0 8 * * *', async () => {
    try {
      const { report, downPlatforms } = await monitor.getUptimeReport();
      await broadcast(report);
      if (downPlatforms.length) {
        await broadcast(`ALERT: ${downPlatforms.length} platform(s) down!\n${downPlatforms.map(p => p.name).join(', ')}`);
      }
    } catch (err) { console.error('Health check failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'ecosystem_health_check', schedule: '9AM daily', job: ecosystemCheck });

  // 3. PAYMENT REPORT — 9:30 AM (8:30 AM UTC)
  const paymentReport = cron.schedule('30 8 * * *', async () => {
    try {
      const report = await payments.getFullPaymentReport();
      await broadcast(report);
    } catch (err) { console.error('Payment report failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'payment_report', schedule: '9:30AM daily', job: paymentReport });

  // 4. PROMO ROTATION — 10:00 AM (9:00 AM UTC)
  const promoRotation = cron.schedule('0 9 * * *', async () => {
    try {
      const platform = content.getTodayPromoTarget();
      const promo = await content.generatePromoPost(platform.name, platform.desc, platform.url);
      await broadcast(`Daily Platform Spotlight\n\n${promo}`);
    } catch (err) { console.error('Promo failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'promo_rotation', schedule: '10AM daily', job: promoRotation });

  // 5. CRM DAILY REPORT — 8:15 AM (7:15 AM UTC)
  const crmReport = cron.schedule('15 7 * * *', async () => {
    try {
      const crm = require('./crm');
      const stats = await crm.getStats();
      await broadcast(`Daily CRM Report\n\nTotal: ${stats.total}\nNew: ${stats.new}\nResponded: ${stats.responded}\nRate: ${stats.conversionRate}%`);
    } catch (err) { console.error('CRM report failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'crm_daily_report', schedule: '8:15AM daily', job: crmReport });

  // 6. DAILY BACKUP — 10:00 PM (9:00 PM UTC)
  const dailyBackup = cron.schedule('0 21 * * *', async () => {
    try {
      const result = await backup.runBackup();
      await broadcast(`Daily Backup Complete\n${result.summary || 'Data backed up to GitHub.'}`);
    } catch (err) { console.error('Backup failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'daily_backup', schedule: '10PM daily', job: dailyBackup });

  // 7. YOUTUBE TRENDS — 7:30 AM (6:30 AM UTC)
  const youtubeTrends = cron.schedule('30 6 * * *', async () => {
    try {
      const research = require('./research');
      const trends = await research.getTrendingTopics('Nigeria', ['AI', 'business', 'technology', 'music', 'film']);
      await broadcast(`Daily Trend Discovery\n\n${trends.slice(0, 5).map((t, i) => `${i+1}. ${t.title}`).join('\n')}`);
    } catch (err) { console.error('Trends failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'youtube_trends', schedule: '7:30AM daily', job: youtubeTrends });

  // 8. CONTENT IDEAS — 11:00 AM weekdays (10:00 AM UTC)
  const contentIdeas = cron.schedule('0 10 * * 1-5', async () => {
    try {
      const ideas = await brain.think({
        message: 'Generate 5 content ideas for the Harz Ecosystem YouTube channel. Focus on AI business, construction tech, and Nigerian entrepreneurship.',
        from: 'scheduler', sessionId: 'content', memory: []
      });
      await broadcast(`Daily Content Ideas\n\n${ideas}`);
    } catch (err) { console.error('Content ideas failed:', err.message); }
  }, { timezone: 'UTC' });
  jobs.push({ name: 'content_ideas', schedule: '11AM weekdays', job: contentIdeas });

  console.log(`✅ Scheduler v4.0 — ${jobs.length} automations active`);
  jobs.forEach(j => console.log(`   ✅ ${j.name} — ${j.schedule}`));
}

function getStatus() {
  return {
    agent: 'Maganu v4.0',
    automations: jobs.map(j => ({ name: j.name, schedule: j.schedule, status: 'active' })),
    total: jobs.length,
    channels: { telegram: true, whatsapp: waBaileys.isReady() }
  };
}

function stop() { jobs.forEach(({ job }) => job.stop()); }

module.exports = { start, getStatus, stop };
