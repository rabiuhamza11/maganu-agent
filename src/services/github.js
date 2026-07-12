// Maganu GitHub Intelligence
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/2.0',
  Accept: 'application/vnd.github.v3+json'
};

async function getRepoStats() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=30&sort=updated`, { headers: HEADERS });
    const repos = res.data;
    const total = repos.length;
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const topRepos = repos.slice(0, 5).map(r => `${r.name} — ⭐${r.stargazers_count} — ${r.language || 'N/A'}`);
    return { total, totalStars, topRepos };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

async function getRecentActivity() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/events?per_page=10`, { headers: HEADERS });
    const events = res.data;
    return events.slice(0, 5).map(e => {
      const date = new Date(e.created_at).toLocaleDateString('en-NG');
      const repo = e.repo?.name?.replace(`${GITHUB_OWNER}/`, '') || '?';
      if (e.type === 'PushEvent') return `📤 Push to ${repo} — ${e.payload?.commits?.length || 0} commit(s) — ${date}`;
      if (e.type === 'CreateEvent') return `🆕 Created ${e.payload?.ref_type} in ${repo} — ${date}`;
      if (e.type === 'IssuesEvent') return `🐛 Issue ${e.payload?.action} in ${repo} — ${date}`;
      return `${e.type} on ${repo} — ${date}`;
    });
  } catch (err) {
    return [`Error: ${err.response?.data?.message || err.message}`];
  }
}

async function deployToVercel(repoName) {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    // Get team ID
    const userRes = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const teamId = userRes.data?.user?.defaultTeamId;

    // Create project
    const projRes = await axios.post(
      `https://api.vercel.com/v9/projects${teamId ? `?teamId=${teamId}` : ''}`,
      { name: repoName, gitRepository: { type: 'github', repo: `${GITHUB_OWNER}/${repoName}` } },
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' } }
    );
    return { ok: true, projectId: projRes.data?.id, name: projRes.data?.name };
  } catch (err) {
    return { error: err.response?.data?.error?.message || err.message };
  }
}

async function getGitHubReport() {
  const [stats, activity] = await Promise.all([getRepoStats(), getRecentActivity()]);
  let msg = `🐙 *GitHub Report — ${GITHUB_OWNER}*\n\n`;
  if (stats.error) {
    msg += `❌ ${stats.error}`;
  } else {
    msg += `Repos: ${stats.total} | Stars: ⭐${stats.totalStars}\n\n`;
    msg += `*Top Repos:*\n${stats.topRepos.join('\n')}\n\n`;
    msg += `*Recent Activity:*\n${activity.join('\n')}`;
  }
  return msg;
}

module.exports = { getRepoStats, getRecentActivity, deployToVercel, getGitHubReport };
