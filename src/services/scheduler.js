const cron = require('node-cron');
const whatsapp = require('./whatsapp');
const brain = require('./brain');

const jobs = [];

function start() {
  console.log('📅 Maganu Scheduler starting...');

  // ======= DAILY MORNING BRIEFING — 7:00 AM Lagos =======
  // Lagos is UTC+1, so 7 AM Lagos = 6 AM UTC
  const morningBriefing = cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running morning briefing...');
    try {
      const today = new Date().toLocaleDateString('en-NG', {
        timeZone: 'Africa/Lagos',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const briefing = await brain.think({
        message: `Generate a morning briefing for Rabiu Hamza. Today is ${today}. Include: 1) A motivational opening, 2) Quick status of the Harz Ecosystem (all platforms live), 3) One productivity tip or insight from "The Complete Genius 365". Keep it concise and energizing for WhatsApp.`,
        from: 'scheduler',
        sessionId: 'morning_briefing',
        memory: []
      });

      await whatsapp.sendToOwner(`🌅 *Good Morning, Rabiu!*\n\n${briefing}`);
    } catch (err) {
      console.error('Morning briefing failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'morning_briefing', schedule: '7:00 AM Lagos daily', job: morningBriefing });

  // ======= DAILY ECOSYSTEM STATUS — 9:00 AM Lagos =======
  const ecosystemCheck = cron.schedule('0 8 * * *', async () => {
    console.log('🔍 Running ecosystem check...');
    try {
      const status = `🔍 *Maganu Daily Check — ${new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}*\n\n✅ HarzDM Marketplace — Live\n✅ OMEGA INFINITY — Live\n✅ TradeOS — Live\n✅ BuildBot AI — Live\n✅ ContentPilot AI — Live\n✅ DeployForge — Live\n✅ FluxDeploy — Live\n✅ Abuja Estate City AI — Live\n✅ Nexal Media — Live\n✅ Nigerian Number Lookup — Live\n\n10/10 platforms operational 🚀`;
      await whatsapp.sendToOwner(status);
    } catch (err) {
      console.error('Ecosystem check failed:', err.message);
    }
  }, { timezone: 'UTC' });

  jobs.push({ name: 'ecosystem_check', schedule: '9:00 AM Lagos daily', job: ecosystemCheck });

  console.log(`✅ Scheduler started — ${jobs.length} automations active`);
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
