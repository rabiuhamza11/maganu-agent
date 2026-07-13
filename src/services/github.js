// Maganu GitHub Intelligence — Full Deployment Capabilities
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/6.2',
  Accept: 'application/vnd.github.v3+json'
};

async function getRepoStats() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=50&sort=updated`, { headers: HEADERS });
    const repos = res.data;
    const total = repos.length;
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const topRepos = repos.slice(0, 8).map(r => `${r.name} — ⭐${r.stargazers_count} — ${r.language || 'N/A'}`);
    return { total, totalStars, topRepos, repos };
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function getRecentActivity() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/events?per_page=15`, { headers: HEADERS });
    return res.data.slice(0, 8).map(e => {
      const date = new Date(e.created_at).toLocaleDateString('en-NG');
      const repo = e.repo?.name?.replace(`${GITHUB_OWNER}/`, '') || '?';
      if (e.type === 'PushEvent') return `📤 Push to ${repo} — ${e.payload?.commits?.length || 0} commit(s) — ${date}`;
      if (e.type === 'CreateEvent') return `🆕 Created ${e.payload?.ref_type} in ${repo} — ${date}`;
      if (e.type === 'IssuesEvent') return `🐛 Issue ${e.payload?.action} in ${repo} — ${date}`;
      if (e.type === 'PullRequestEvent') return `🔀 PR ${e.payload?.action} in ${repo} — ${date}`;
      return `${e.type} on ${repo} — ${date}`;
    });
  } catch (err) { return [`Error: ${err.response?.data?.message || err.message}`]; }
}

async function listRepos() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=50&sort=updated`, { headers: HEADERS });
    return res.data.map(r => ({ name: r.name, url: r.html_url, language: r.language, stars: r.stargazers_count, updated: r.updated_at?.slice(0, 10), description: r.description }));
  } catch (err) { throw new Error(err.response?.data?.message || err.message); }
}

async function createRepo(name, description, isPrivate) {
  try {
    const res = await axios.post('https://api.github.com/user/repos',
      { name, description: description || `${name} — Harz Ecosystem`, private: !!isPrivate, auto_init: true, license_template: 'mit' },
      { headers: { ...HEADERS, 'Content-Type': 'application/json' } }
    );
    return { ok: true, name: res.data.name, url: res.data.html_url, clone_url: res.data.clone_url, default_branch: res.data.default_branch || 'main' };
  } catch (err) {
    return { error: err.response?.data?.message || err.message, details: err.response?.data?.errors || [] };
  }
}

async function getFileSHA(repo, filePath, branch) {
  try {
    const res = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${filePath}`, { headers: HEADERS, params: { ref: branch || 'main' } });
    return res.data.sha;
  } catch (err) { if (err.response?.status === 404) return null; throw err; }
}

async function createOrUpdateFile(repo, filePath, content, message, branch) {
  try {
    const br = branch || 'main';
    const sha = await getFileSHA(repo, filePath, br);
    const body = { message: message || `chore: update ${filePath}`, content: Buffer.from(content).toString('base64'), branch: br };
    if (sha) body.sha = sha;
    const res = await axios.put(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${filePath}`, body, { headers: { ...HEADERS, 'Content-Type': 'application/json' } });
    return { ok: true, file: filePath, url: res.data.content?.html_url };
  } catch (err) { return { error: err.response?.data?.message || err.message, file: filePath }; }
}

async function pushMultipleFiles(repo, files, commitMessage, branch) {
  const results = [];
  for (const f of files) {
    const r = await createOrUpdateFile(repo, f.path, f.content, commitMessage, branch || 'main');
    results.push(r);
  }
  const succeeded = results.filter(r => r.ok).length;
  return { ok: succeeded === files.length, pushed: succeeded, total: files.length, results };
}

async function createBranch(repo, newBranch, fromBranch) {
  try {
    const from = fromBranch || 'main';
    const refRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/ref/heads/${from}`, { headers: HEADERS });
    const sha = refRes.data.object.sha;
    await axios.post(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/refs`, { ref: `refs/heads/${newBranch}`, sha }, { headers: { ...HEADERS, 'Content-Type': 'application/json' } });
    return { ok: true, branch: newBranch, from };
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function listBranches(repo) {
  try {
    const res = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/branches`, { headers: HEADERS });
    return res.data.map(b => b.name);
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function createRelease(repo, tag, name, body, draft, prerelease) {
  try {
    const res = await axios.post(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/releases`,
      { tag_name: tag, name: name || tag, body: body || '', draft: !!draft, prerelease: !!prerelease, generate_release_notes: true },
      { headers: { ...HEADERS, 'Content-Type': 'application/json' } }
    );
    return { ok: true, id: res.data.id, url: res.data.html_url, tag };
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function listReleases(repo) {
  try {
    const res = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/releases?per_page=5`, { headers: HEADERS });
    return res.data.map(r => ({ tag: r.tag_name, name: r.name, url: r.html_url, date: r.created_at?.slice(0, 10) }));
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function updateRepoTopics(repo, topics) {
  try {
    await axios.put(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/topics`, { names: topics }, { headers: { ...HEADERS, Accept: 'application/vnd.github.mercy-preview+json' } });
    return { ok: true, repo, topics };
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function updateRepoDescription(repo, description, homepage) {
  try {
    await axios.patch(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}`, { description, homepage: homepage || '' }, { headers: { ...HEADERS, 'Content-Type': 'application/json' } });
    return { ok: true, repo };
  } catch (err) { return { error: err.response?.data?.message || err.message }; }
}

async function deployToVercel(repoName) {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN_2 || process.env.VERCEL_TOKEN;
    const userRes = await axios.get('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
    const teamId = userRes.data?.user?.defaultTeamId;
    const projRes = await axios.post(
      `https://api.vercel.com/v9/projects${teamId ? `?teamId=${teamId}` : ''}`,
      { name: repoName, gitRepository: { type: 'github', repo: `${GITHUB_OWNER}/${repoName}` } },
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' } }
    );
    return { ok: true, projectId: projRes.data?.id, name: projRes.data?.name };
  } catch (err) { return { error: err.response?.data?.error?.message || err.message }; }
}

async function getGitHubReport() {
  const [stats, activity] = await Promise.all([getRepoStats(), getRecentActivity()]);
  let msg = `🐙 *GitHub Report — ${GITHUB_OWNER}*\n\n`;
  if (stats.error) { msg += `❌ ${stats.error}`; }
  else {
    msg += `Repos: ${stats.total} | Stars: ⭐${stats.totalStars}\n\n`;
    msg += `*Top Repos:*\n${stats.topRepos.join('\n')}\n\n`;
    msg += `*Recent Activity:*\n${activity.join('\n')}`;
  }
  return msg;
}

async function handleGitHubCommand(sub, args) {
  const [arg1, arg2, arg3] = args || [];
  switch ((sub || '').toLowerCase()) {
    case 'create': {
      if (!arg1) return '❌ Usage: /git create [repo-name] | [description]';
      const desc = args.slice(1).join(' | ');
      const r = await createRepo(arg1, desc, false);
      if (r.error) return `❌ Create failed: ${r.error}`;
      return `✅ *Repo Created!*\n\nName: ${r.name}\nURL: ${r.url}\nBranch: ${r.default_branch}`;
    }
    case 'list': {
      const repos = await listRepos();
      if (repos.error) return `❌ ${repos.error}`;
      const lines = repos.slice(0, 15).map((r, i) => `${i+1}. ${r.name} — ${r.language || 'N/A'} — ${r.updated}`);
      return `🐙 *All Repos (${repos.length}):*\n\n${lines.join('\n')}`;
    }
    case 'release': {
      if (!arg1 || !arg2) return '❌ Usage: /git release [repo] | [tag] | [title]\nExample: /git release maganu-agent | v6.2.0 | Maganu v6.2';
      const r = await createRelease(arg1, arg2, arg3 || arg2);
      if (r.error) return `❌ Release failed: ${r.error}`;
      return `✅ *Release Created!*\n\nRepo: ${arg1}\nTag: ${r.tag}\nURL: ${r.url}`;
    }
    case 'branch': {
      if (!arg1 || !arg2) return '❌ Usage: /git branch [repo] | [branch-name]';
      const r = await createBranch(arg1, arg2);
      if (r.error) return `❌ Branch failed: ${r.error}`;
      return `✅ Branch _${r.branch}_ created in *${arg1}*`;
    }
    case 'branches': {
      if (!arg1) return '❌ Usage: /git branches [repo]';
      const branches = await listBranches(arg1);
      if (branches.error) return `❌ ${branches.error}`;
      return `🌿 *Branches in ${arg1}:*\n${branches.join('\n')}`;
    }
    case 'releases': {
      if (!arg1) return '❌ Usage: /git releases [repo]';
      const releases = await listReleases(arg1);
      if (releases.error) return `❌ ${releases.error}`;
      if (!releases.length) return `No releases in *${arg1}* yet`;
      return `🏷️ *Releases in ${arg1}:*\n${releases.map(r => `${r.tag} — ${r.name} — ${r.date}`).join('\n')}`;
    }
    case 'topics': {
      if (!arg1 || !arg2) return '❌ Usage: /git topics [repo] | [topic1,topic2]';
      const topics = arg2.split(',').map(t => t.trim());
      const r = await updateRepoTopics(arg1, topics);
      if (r.error) return `❌ ${r.error}`;
      return `✅ Topics updated for *${arg1}*:\n${topics.join(', ')}`;
    }
    case 'describe': {
      if (!arg1 || !arg2) return '❌ Usage: /git describe [repo] | [description]';
      const r = await updateRepoDescription(arg1, args.slice(1).join(' '));
      if (r.error) return `❌ ${r.error}`;
      return `✅ Description updated for *${arg1}*`;
    }
    case 'activity':
      return `*🕐 GitHub Activity:*\n\n${(await getRecentActivity()).join('\n')}`;
    default:
      return await getGitHubReport();
  }
}

module.exports = { getRepoStats, getRecentActivity, listRepos, createRepo, createOrUpdateFile, pushMultipleFiles, createBranch, listBranches, createRelease, listReleases, updateRepoTopics, updateRepoDescription, deployToVercel, getGitHubReport, handleGitHubCommand };
