// Maganu Uptime Monitor + Business Intelligence
const axios = require('axios');

const PLATFORMS = [
  { name: 'HarzDM Marketplace', url: 'https://harzdm-marketplace.vercel.app', emoji: '🛒' },
  { name: 'OMEGA INFINITY', url: 'https://omega-infinity-dashboard.vercel.app', emoji: '⚡' },
  { name: 'TradeOS', url: 'https://tradeos-dashboard-fawn.vercel.app', emoji: '📈' },
  { name: 'Abuja Estate City AI', url: 'https://abuja-estate-city-ai.vercel.app', emoji: '🏠' },
  { name: 'Maganu Agent', url: 'https://maganu-agent.onrender.com', emoji: '🤖' },
  { name: 'BuildBot AI', url: 'https://superagent-2286fb2f.base44.app/functions/buildbotAI', emoji: '🏗' },
  { name: 'ContentPilot AI', url: 'https://superagent-2286fb2f.base44.app/functions/contentPilotDashboard', emoji: '🎬' },
  { name: 'Nexal Media', url: 'https://superagent-2286fb2f.base44.app/functions/nexalMedia', emoji: '📢' },
  { name: 'Nigerian Number Lookup', url: 'https://superagent-2286fb2f.base44.app/functions/nigerianNumberLookup', emoji: '📱' },
  { name: 'OMEGA DocMaster X', url: 'https://superagent-2286fb2f.base44.app/functions/omegaDocmasterX', emoji: '📚' }
];

async function checkPlatform(platform) {
  try {
    const start = Date.now();
    await axios.get(platform.url, { timeout: 10000 });
    const ms = Date.now() - start;
    return { ...platform, status: 'up', ms, icon: '✅' };
  } catch (err) {
    return { ...platform, status: 'down', ms: null, icon: '❌', error: err.message };
  }
}

async function checkAll() {
  const results = await Promise.allSettled(PLATFORMS.map(p => checkPlatform(p)));
  return results.map(r => r.value || r.reason);
}

async function getUptimeReport() {
  const checks = await checkAll();
  const up = checks.filter(c => c.status === 'up');
  const down = checks.filter(c => c.status === 'down');
  const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' });
  const time = new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });

  let msg = `🔍 *Uptime Report — ${date} ${time}*\n\n`;
  msg += `Status: ${up.length}/${checks.length} platforms live\n\n`;

  checks.forEach(c => {
    const speed = c.ms ? ` (${c.ms}ms)` : '';
    msg += `${c.icon} ${c.emoji} ${c.name}${speed}\n`;
  });

  if (down.length) {
    msg += `\n⚠️ ${down.length} platform(s) need attention!`;
  } else {
    msg += `\n🚀 All systems operational!`;
  }

  return { report: msg, downPlatforms: down };
}

async function getDownPlatforms() {
  const checks = await checkAll();
  return checks.filter(c => c.status === 'down');
}

module.exports = { checkAll, getUptimeReport, getDownPlatforms, PLATFORMS };
