// Maganu Deploy Service — Vercel, Netlify, Render, Railway
const axios = require('axios');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/3.0',
  Accept: 'application/vnd.github.v3+json'
};

// ============ VERCEL ============
async function deployVercel(repoName) {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const userRes = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const teamId = userRes.data?.user?.defaultTeamId;
    const qs = teamId ? `?teamId=${teamId}` : '';

    // Check if project exists
    let projectId;
    try {
      const check = await axios.get(`https://api.vercel.com/v9/projects/${repoName}${qs}`, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
      });
      projectId = check.data?.id;
    } catch (_) {
      // Create new project
      const proj = await axios.post(`https://api.vercel.com/v9/projects${qs}`,
        { name: repoName, gitRepository: { type: 'github', repo: `${GITHUB_OWNER}/${repoName}` }, framework: null },
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' } }
      );
      projectId = proj.data?.id;
      // Patch framework to null
      await axios.patch(`https://api.vercel.com/v9/projects/${projectId}${qs}`,
        { framework: null },
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' } }
      );
    }

    return { ok: true, platform: 'Vercel', projectId, url: `https://${repoName}.vercel.app` };
  } catch (err) {
    return { ok: false, platform: 'Vercel', error: err.response?.data?.error?.message || err.message };
  }
}

// ============ NETLIFY ============
async function deployNetlify(repoName) {
  try {
    const token = process.env.NETLIFY_AUTH_TOKEN;
    // Create site linked to GitHub repo
    const res = await axios.post('https://api.netlify.com/api/v1/sites', {
      name: repoName,
      repo: {
        provider: 'github',
        repo: `${GITHUB_OWNER}/${repoName}`,
        private: false,
        branch: 'main'
      }
    }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

    return { ok: true, platform: 'Netlify', siteId: res.data?.id, url: res.data?.ssl_url || res.data?.url };
  } catch (err) {
    return { ok: false, platform: 'Netlify', error: err.response?.data?.message || err.message };
  }
}

// ============ RENDER ============
async function deployRender(repoName) {
  try {
    const token = process.env.RENDER_API_KEY;
    const res = await axios.post('https://api.render.com/v1/services', {
      type: 'web_service',
      name: repoName,
      repo: `https://github.com/${GITHUB_OWNER}/${repoName}`,
      branch: 'main',
      plan: 'free',
      buildCommand: 'npm install',
      startCommand: 'npm start',
      envVars: []
    }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

    return { ok: true, platform: 'Render', serviceId: res.data?.service?.id, url: `https://${repoName}.onrender.com` };
  } catch (err) {
    return { ok: false, platform: 'Render', error: err.response?.data?.message || err.message };
  }
}

// ============ RAILWAY ============
async function deployRailway(repoName) {
  try {
    const token = process.env.RAILWAY_API_TOKEN;
    const query = `mutation { projectCreate(input: { name: "${repoName}" }) { id name } }`;
    const res = await axios.post('https://backboard.railway.app/graphql/v2',
      { query },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const project = res.data?.data?.projectCreate;
    return { ok: true, platform: 'Railway', projectId: project?.id, url: `https://railway.app/project/${project?.id}` };
  } catch (err) {
    return { ok: false, platform: 'Railway', error: err.response?.data?.errors?.[0]?.message || err.message };
  }
}

// ============ LIST REPOS ============
async function listRepos() {
  try {
    const res = await axios.get(`https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=30&sort=updated`, { headers: HEADERS_GH });
    return res.data.map(r => ({
      name: r.name,
      language: r.language || 'N/A',
      stars: r.stargazers_count,
      private: r.private,
      updatedAt: new Date(r.updated_at).toLocaleDateString('en-NG'),
      url: r.html_url
    }));
  } catch (err) {
    return [];
  }
}

// ============ GITHUB COMMIT ============
async function triggerCommit(repoName, message) {
  try {
    // Get current README to update (simple commit trigger)
    const fileRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/README.md`, { headers: HEADERS_GH });
    const sha = fileRes.data?.sha;
    const currentContent = Buffer.from(fileRes.data?.content || '', 'base64').toString('utf8');
    const newContent = currentContent + `\n<!-- Updated: ${new Date().toISOString()} via Maganu -->`;
    const encoded = Buffer.from(newContent).toString('base64');

    await axios.put(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/README.md`,
      { message, content: encoded, sha },
      { headers: HEADERS_GH }
    );
    return { ok: true, message: `Commit pushed to ${repoName}: "${message}"` };
  } catch (err) {
    return { ok: false, error: err.response?.data?.message || err.message };
  }
}

// ============ RENDER LOGS ============
async function getRenderLogs(serviceId) {
  try {
    const token = process.env.RENDER_API_KEY;
    // Get latest deploy
    const deploysRes = await axios.get(`https://api.render.com/v1/services/${serviceId}/deploys?limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const deploy = deploysRes.data?.[0]?.deploy;
    if (!deploy) return 'No deploys found.';
    return `Latest deploy: ${deploy.id}\nStatus: ${deploy.status}\nCreated: ${new Date(deploy.createdAt).toLocaleString('en-NG')}`;
  } catch (err) {
    return `Logs error: ${err.response?.data?.message || err.message}`;
  }
}

module.exports = { deployVercel, deployNetlify, deployRender, deployRailway, listRepos, triggerCommit, getRenderLogs };
