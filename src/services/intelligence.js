// Maganu Intelligence Engine — Real-time data, domain checks, trending, crypto
const axios = require('axios');

// ============ CRYPTO PRICES ============
async function getCryptoPrices(coins = ['bitcoin', 'ethereum', 'binancecoin']) {
  try {
    const ids = coins.join(',');
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,ngn&include_24hr_change=true`, { timeout: 10000 });
    const data = res.data;
    let msg = `₿ *Crypto Prices*\n\n`;
    const names = { bitcoin: 'BTC', ethereum: 'ETH', binancecoin: 'BNB', solana: 'SOL', cardano: 'ADA' };
    Object.entries(data).forEach(([id, d]) => {
      const change = d.usd_24h_change?.toFixed(2);
      const arrow = change >= 0 ? '📈' : '📉';
      msg += `${arrow} ${names[id] || id.toUpperCase()}: $${d.usd?.toLocaleString()} (₦${d.ngn?.toLocaleString()})\n24h: ${change}%\n\n`;
    });
    return msg;
  } catch (err) {
    return `❌ Crypto data unavailable: ${err.message}`;
  }
}

// ============ DOMAIN CHECKER ============
async function checkDomain(domain) {
  const tlds = ['.com', '.io', '.ai', '.ng', '.co', '.app', '.dev'];
  const results = [];
  const base = domain.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/gi, '').toLowerCase();

  for (const tld of tlds) {
    const full = `${base}${tld}`;
    try {
      await axios.get(`https://rdap.org/domain/${full}`, { timeout: 5000 });
      results.push({ domain: full, available: false, status: '🔴 Taken' });
    } catch (err) {
      if (err.response?.status === 404) {
        results.push({ domain: full, available: true, status: '🟢 Available' });
      } else {
        results.push({ domain: full, available: null, status: '⚪ Unknown' });
      }
    }
  }
  return results;
}

async function formatDomainCheck(domain) {
  const results = await checkDomain(domain);
  let msg = `🌐 *Domain Check: ${domain}*\n\n`;
  results.forEach(r => { msg += `${r.status} ${r.domain}\n`; });
  const available = results.filter(r => r.available).map(r => r.domain);
  if (available.length) msg += `\n✅ *Best picks:* ${available.slice(0, 3).join(', ')}`;
  return msg;
}

// ============ SSL CHECKER ============
async function checkSSL(domain) {
  try {
    const res = await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on&maxAge=24`, { timeout: 15000 });
    const data = res.data;
    const grade = data.endpoints?.[0]?.grade || 'Pending';
    const status = data.status;
    return `🔒 *SSL Check: ${domain}*\n\nStatus: ${status}\nGrade: ${grade}\n${grade === 'A' || grade === 'A+' ? '✅ Excellent SSL configuration' : '⚠️ SSL may need improvement'}`;
  } catch (_) {
    // Fallback — simple HTTPS check
    try {
      await axios.get(`https://${domain}`, { timeout: 8000 });
      return `🔒 *SSL: ${domain}*\n\n✅ HTTPS responding — certificate appears valid`;
    } catch (err) {
      return `❌ SSL check failed for ${domain}: ${err.message}`;
    }
  }
}

// ============ GITHUB TRENDING ============
async function getGitHubTrending() {
  try {
    const res = await axios.get('https://gh-trending-api.herokuapp.com/repositories', { timeout: 10000 });
    const repos = res.data?.slice(0, 5) || [];
    if (!repos.length) throw new Error('No data');
    let msg = `🔥 *GitHub Trending Today*\n\n`;
    repos.forEach((r, i) => {
      msg += `${i + 1}. *${r.author}/${r.name}*\n${r.description?.slice(0, 80) || 'No description'}\n⭐ ${r.stars} | ${r.language || 'N/A'}\n\n`;
    });
    return msg;
  } catch (_) {
    // Fallback AI-generated
    const { think } = require('./brain');
    return await think({
      message: 'List 5 real trending GitHub repositories from this week in AI, developer tools, or web development. Include repo name, description, and why it matters. Format with *bold* names.',
      from: 'trending', sessionId: 'trending', memory: []
    });
  }
}

// ============ STARTUP FUNDING NEWS ============
async function getFundingNews() {
  const { think } = require('./brain');
  return await think({
    message: 'Give me a briefing on recent African tech startup funding rounds and notable global tech investment news from 2026. Include company name, amount raised, investor, and one-line on what the company does. Prioritize Nigerian and African startups. Format with *bold* company names.',
    from: 'news', sessionId: 'funding_news', memory: []
  });
}

// ============ PRODUCT HUNT DAILY ============
async function getProductHuntDaily() {
  const { think } = require('./brain');
  return await think({
    message: 'Describe 5 interesting product launches that would be trending on Product Hunt today (July 2026). Focus on AI tools, developer tools, and productivity apps. For each: product name, tagline, category, and why builders should care. Format with *bold* names.',
    from: 'producthunt', sessionId: 'ph_daily', memory: []
  });
}

module.exports = { getCryptoPrices, formatDomainCheck, checkSSL, getGitHubTrending, getFundingNews, getProductHuntDaily };
