// Maganu Analytics — GitHub traffic, code stats, platform growth, market data
const axios = require('axios');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/3.0',
  Accept: 'application/vnd.github.v3+json'
};

// ============ GITHUB TRAFFIC ============
async function getRepoTraffic(repoName) {
  try {
    const [views, clones, referrers] = await Promise.allSettled([
      axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/traffic/views`, { headers: HEADERS_GH }),
      axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/traffic/clones`, { headers: HEADERS_GH }),
      axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/traffic/popular/referrers`, { headers: HEADERS_GH })
    ]);

    const v = views.value?.data || {};
    const c = clones.value?.data || {};
    const r = referrers.value?.data || [];

    return {
      repo: repoName,
      views: v.count || 0,
      uniqueViews: v.uniques || 0,
      clones: c.count || 0,
      uniqueClones: c.uniques || 0,
      topReferrers: r.slice(0, 3).map(ref => `${ref.referrer}: ${ref.count} visits`)
    };
  } catch (err) {
    return { repo: repoName, error: err.message };
  }
}

async function getAllRepoTraffic() {
  const repos = ['buildbot-ai', 'tradeos', 'omega-infinity-1000', 'harzdm-marketplace', 'deployforge', 'maganu-agent'];
  const results = await Promise.allSettled(repos.map(r => getRepoTraffic(r)));
  return results.map(r => r.value || r.reason);
}

// ============ CODE STATS ============
async function getDailyCodeStats() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/events?per_page=30`, { headers: HEADERS_GH });
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = res.data.filter(e => e.created_at?.startsWith(today));
    const pushes = todayEvents.filter(e => e.type === 'PushEvent');
    const totalCommits = pushes.reduce((s, e) => s + (e.payload?.commits?.length || 0), 0);
    const repos = [...new Set(pushes.map(e => e.repo?.name?.replace(`${GITHUB_OWNER}/`, '')))];

    return {
      date: today,
      commits: totalCommits,
      pushEvents: pushes.length,
      reposActive: repos,
      totalEvents: todayEvents.length
    };
  } catch (err) {
    return { error: err.message };
  }
}

// ============ WEEKLY BUSINESS DIGEST ============
async function getWeeklyDigest(payments) {
  const [traffic, codeStats, paymentReport] = await Promise.allSettled([
    getAllRepoTraffic(),
    getDailyCodeStats(),
    payments.getFullPaymentReport()
  ]);

  const week = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  let digest = `📊 *Weekly Harz Ecosystem Digest*\n_${week}_\n\n`;

  digest += `*🏗 Development Activity*\n`;
  if (codeStats.value && !codeStats.value.error) {
    const s = codeStats.value;
    digest += `Commits today: ${s.commits}\nActive repos: ${s.reposActive.join(', ') || 'None'}\n\n`;
  }

  digest += `*📈 GitHub Traffic (14-day)*\n`;
  if (traffic.value) {
    traffic.value.slice(0, 4).forEach(t => {
      if (!t.error) digest += `${t.repo}: ${t.views} views, ${t.clones} clones\n`;
    });
  }

  digest += `\n*💳 Payment Summary*\n`;
  digest += paymentReport.value || 'Payment data unavailable';

  return digest;
}

// ============ NIGERIAN MARKET DATA ============
async function getNigerianMarketData() {
  try {
    // USD/NGN rate from public API
    const rateRes = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 });
    const ngnRate = rateRes.data?.rates?.NGN || 'N/A';

    return {
      usdNgn: ngnRate,
      source: 'Exchange Rate API',
      timestamp: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
    };
  } catch (_) {
    // Fallback
    return { usdNgn: '~1,600', source: 'Estimated (live fetch failed)', timestamp: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) };
  }
}

module.exports = { getRepoTraffic, getAllRepoTraffic, getDailyCodeStats, getWeeklyDigest, getNigerianMarketData };
