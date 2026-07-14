// Maganu Builder Service v1.0 — Project Scaffolding, Code Generation, Full-Stack Building
const axios = require('axios');
const deploy = require('./deploy');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/7.0',
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

// ============ PROJECT TEMPLATES ============

const TEMPLATES = {
  'react': {
    name: 'React App',
    files: {
      'package.json': (name) => JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1', 'react-scripts': '5.0.1' },
        scripts: { start: 'react-scripts start', build: 'react-scripts build', test: 'react-scripts test' },
        browserslist: { production: [">0.2%", "not dead", "not op_mini all"], development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"] }
      }, null, 2),
      'public/index.html': (name) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`,
      'src/index.js': () => `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
      'src/App.js': (name) => `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${name}</h1>
        <p>Built with Maganu AI — Harz Ecosystem</p>
      </header>
    </div>
  );
}

export default App;`,
      'src/App.css': () => `.App { text-align: center; }
.App-header { background: #282c34; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
.App-header h1 { font-size: 3rem; }`,
      'src/index.css': () => `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`,
      '.gitignore': () => `node_modules/\nbuild/\n.env\n*.log`,
      'README.md': (name) => `# ${name}\n\nBuilt with Maganu AI — Harz Ecosystem\n\n## Commands\n\`npm install\` then \`npm start\``
    }
  },
  'nextjs': {
    name: 'Next.js App',
    files: {
      'package.json': (name) => JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
        dependencies: { next: '^14.2.0', react: '^18.3.1', 'react-dom': '^18.3.1' }
      }, null, 2),
      'next.config.js': () => `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;`,
      'pages/index.js': (name) => `export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>${name}</h1>
      <p>Built with Maganu AI — Harz Ecosystem</p>
    </main>
  );
}`,
      'pages/_app.js': () => `import '../styles/globals.css'
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`,
      'styles/globals.css': () => `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; }`,
      '.gitignore': () => `node_modules/\n.next/\n.env\n*.log`,
      'README.md': (name) => `# ${name}\n\nNext.js app built with Maganu AI.\n\n## Dev\n\`npm install\` then \`npm run dev\``
    }
  },
  'express': {
    name: 'Express API',
    files: {
      'package.json': (name) => JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        main: 'src/server.js',
        scripts: { start: 'node src/server.js', dev: 'nodemon src/server.js' },
        dependencies: { express: '^4.19.2', cors: '^2.8.5', axios: '^1.7.0', dotenv: '^16.4.5' },
        devDependencies: { nodemon: '^3.1.0' }
      }, null, 2),
      'src/server.js': (name) => `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ name: '${name}', version: '1.0.0', status: 'online', built: 'Maganu AI' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('${name} running on port ' + PORT));`,
      '.env.example': () => `PORT=3000\n# Add your API keys here`,
      '.gitignore': () => `node_modules/\n.env\n*.log`,
      'Procfile': () => `web: node src/server.js`,
      'README.md': (name) => `# ${name}\n\nExpress API built with Maganu AI.\n\n## Run\n\`npm install\` then \`npm start\``
    }
  },
  'static': {
    name: 'Static Website',
    files: {
      'index.html': (name) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>${name}</h1>
    <p>Built with Maganu AI — Harz Ecosystem</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': (name) => `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; }
.container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
h1 { font-size: 3rem; margin-bottom: 1rem; }
p { color: #888; }`,
      'script.js': () => `console.log('${name} — built with Maganu AI');`,
      'README.md': (name) => `# ${name}\n\nStatic site built with Maganu AI.\nDeploy to Vercel, Netlify, or GitHub Pages.`
    }
  },
  'telegram-bot': {
    name: 'Telegram Bot',
    files: {
      'package.json': (name) => JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        main: 'src/bot.js',
        scripts: { start: 'node src/bot.js', dev: 'nodemon src/bot.js' },
        dependencies: { express: '^4.19.2', axios: '^1.7.0', dotenv: '^16.4.5' },
        devDependencies: { nodemon: '^3.1.0' }
      }, null, 2),
      'src/bot.js': (name) => `require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = 'https://api.telegram.org/bot' + BOT_TOKEN;

async function sendMessage(chatId, text) {
  try {
    await axios.post(TELEGRAM_API + '/sendMessage', { chat_id: chatId, text: text });
  } catch (err) { console.error('Send error:', err.message); }
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const msg = req.body.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text === '/start') {
    await sendMessage(chatId, '${name} bot is online! Built with Maganu AI.');
  } else {
    await sendMessage(chatId, 'You said: ' + text);
  }
});

app.get('/', (req, res) => res.json({ name: '${name}', status: 'online' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('${name} bot running on port ' + PORT));`,
      '.env.example': () => `BOT_TOKEN=your_telegram_bot_token\nPORT=3000`,
      '.gitignore': () => `node_modules/\n.env\n*.log`,
      'Procfile': () => `web: node src/bot.js`,
      'README.md': (name) => `# ${name}\n\nTelegram bot built with Maganu AI.\n\n## Setup\n1. Get a bot token from @BotFather\n2. Copy .env.example to .env and add your token\n3. \`npm install\` then \`npm start\``
    }
  },
  'python-api': {
    name: 'Python API',
    files: {
      'requirements.txt': () => `flask==3.0.0\ncorslib==0.15.3\nrequests==2.31.0\npython-dotenv==1.0.0`,
      'app.py': (name) => `from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'name': '${name}',
        'version': '1.0.0',
        'status': 'online',
        'built': 'Maganu AI'
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)`,
      'Procfile': () => `web: gunicorn app:app`,
      'requirements.txt': () => `flask==3.0.0\nflask-cors==4.0.0\ngunicorn==21.2.0\nrequests==2.31.0\npython-dotenv==1.0.0`,
      'README.md': (name) => `# ${name}\n\nPython API built with Maganu AI.\n\n## Run\n\`pip install -r requirements.txt\` then \`python app.py\``
    }
  }
};

// ============ SCAFFOLD PROJECT ============

async function scaffoldProject({ name, template = 'express', description, isPrivate = false }) {
  const tmpl = TEMPLATES[template];
  if (!tmpl) {
    return { error: `Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(', ')}` };
  }

  const repoName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Step 1: Create repo
  const repoResult = await deploy.createRepo(repoName, description || `${tmpl.name} — ${name}`, isPrivate);
  if (!repoResult.ok && !repoResult.message?.includes('already exists')) {
    return { error: 'Failed to create repo: ' + (repoResult.error || 'Unknown') };
  }

  // Step 2: Push all template files
  const results = [];
  const fileEntries = Object.entries(tmpl.files);

  for (const [filePath, genFn] of fileEntries) {
    const content = genFn(name);
    const pushResult = await deploy.createOrUpdateFile(repoName, filePath, content, `feat: scaffold ${filePath}`);
    results.push({ file: filePath, ok: pushResult.ok });
    // Small delay to avoid GitHub rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  const successCount = results.filter(r => r.ok).length;
  const allOk = successCount === results.length;

  return {
    ok: allOk,
    repo: repoName,
    template: template,
    url: `https://github.com/${GITHUB_OWNER}/${repoName}`,
    files: results,
    message: allOk
      ? `✅ Scaffolded ${repoName} with ${successCount} files (${tmpl.name} template)`
      : `⚠️ Scaffolded ${repoName} — ${successCount}/${results.length} files pushed`
  };
}

// ============ GENERATE CODE ============

async function generateCode({ type, name, ...options }) {
  const generators = {
    'react-component': () => `import React from 'react';
import './${name}.css';

function ${toPascalCase(name)}() {
  return (
    <div className="${name}">
      <h2>${toPascalCase(name)}</h2>
      <p>Generated by Maganu AI</p>
    </div>
  );
}

export default ${toPascalCase(name)};`,

    'api-endpoint': () => {
      const method = (options.method || 'GET').toUpperCase();
      const path = options.path || `/${name.toLowerCase()}`;
      return `// ${method} ${path}
app.${method.toLowerCase()}('${path}', async (req, res) => {
  try {
    // TODO: Add your logic here
    res.json({ success: true, message: '${name} endpoint working' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;
    },

    'express-middleware': () => `function ${name}Middleware(req, res, next) {
  // ${name} middleware — generated by Maganu AI
  console.log('[${name}]', req.method, req.path);
  next();
}

module.exports = ${name}Middleware;`,

    'mongoose-model': () => {
      const fields = options.fields || 'name: String, email: String, createdAt: { type: Date, default: Date.now }';
      return `const mongoose = require('mongoose');

const ${toPascalCase(name)}Schema = new mongoose.Schema({
  ${fields}
});

module.exports = mongoose.model('${toPascalCase(name)}', ${toPascalCase(name)}Schema);`;
    },

    'sql-schema': () => {
      const tableName = name.toLowerCase().replace(/\s+/g, '_');
      return `CREATE TABLE ${tableName} (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated by Maganu AI — Harz Ecosystem`;
    },

    'dockerfile': () => `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Generated by Maganu AI`,

    'env-template': () => `# ${name} Environment Variables
PORT=3000
NODE_ENV=production
# Add your API keys below:
# API_KEY=
# DATABASE_URL=
# Generated by Maganu AI`,

    'readme': () => `# ${name}

${options.description || 'A project built with Maganu AI — Harz Ecosystem'}

## Features
- Feature 1
- Feature 2

## Installation
\`\`\`bash
npm install
npm start
\`\`\`

## Built With
- Maganu AI (Harz Ecosystem)
- Node.js + Express

## Author
**Rabiu Hamza Mohammed**
GitHub: [github.com/rabiuhamza11](https://github.com/rabiuhamza11)`,

    'telegram-command': () => `  if (cmd === '/${name}') {
    // /${name} command — generated by Maganu AI
    return '*${toPascalCase(name)}*\\n\\nGenerated command. Add your logic here.';
  }`,
  };

  const gen = generators[type];
  if (!gen) {
    return { error: `Unknown code type: ${type}. Available: ${Object.keys(generators).join(', ')}` };
  }

  return { ok: true, code: gen(), type, name };
}

// ============ DEPLOY EVERYWHERE ============

async function deployEverywhere(repoName) {
  const results = {};

  // Deploy to all platforms simultaneously
  const [vercel, netlify, render] = await Promise.all([
    deploy.deployVercel(repoName),
    deploy.deployNetlify(repoName),
    deploy.deployRender(repoName),
  ]);

  results.vercel = vercel;
  results.netlify = netlify;
  results.render = render;

  const successes = Object.entries(results).filter(([_, r]) => r.ok).map(([p]) => p);
  const failures = Object.entries(results).filter(([_, r]) => !r.ok).map(([p, r]) => `${p}: ${r.error}`);

  return {
    ok: successes.length > 0,
    platforms: successes,
    urls: {
      vercel: vercel.ok ? vercel.url : null,
      netlify: netlify.ok ? netlify.url : null,
      render: render.ok ? render.url : null,
    },
    failures: failures.length ? failures : null,
    message: successes.length > 0
      ? `✅ Deployed ${repoName} to: ${successes.join(', ')}`
      : `❌ All deployments failed`,
    summary: `Deployed to ${successes.length}/3 platforms${failures.length ? ` (failed: ${failures.join('; ')})` : ''}`
  };
}

// ============ CREATE & DEPLOY IN ONE STEP ============

async function createAndDeploy({ name, template = 'express', description, platform = 'vercel', isPrivate = false }) {
  // Step 1: Scaffold
  const scaffold = await scaffoldProject({ name, template, description, isPrivate });
  if (!scaffold.ok) return scaffold;

  // Wait for GitHub to propagate
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Deploy
  let deployResult;
  if (platform === 'all') {
    deployResult = await deployEverywhere(scaffold.repo);
  } else if (platform === 'vercel') {
    deployResult = await deploy.deployVercel(scaffold.repo);
  } else if (platform === 'netlify') {
    deployResult = await deploy.deployNetlify(scaffold.repo);
  } else if (platform === 'render') {
    deployResult = await deploy.deployRender(scaffold.repo);
  } else if (platform === 'railway') {
    deployResult = await deploy.deployRailway(scaffold.repo);
  } else {
    deployResult = await deploy.deployVercel(scaffold.repo);
  }

  return {
    ok: true,
    repo: scaffold.repo,
    repoUrl: scaffold.url,
    scaffold: scaffold.message,
    deploy: deployResult.ok ? `✅ Deployed to ${platform}` : `⚠️ Deploy pending: ${deployResult.error || 'unknown'}`,
    url: deployResult.url || (deployResult.urls ? Object.values(deployResult.urls).filter(Boolean).join(', ') : null),
    message: `🚀 ${name} created and deployed!\nRepo: ${scaffold.url}\n${deployResult.ok ? 'Live: ' + (deployResult.url || 'processing') : 'Deploy: ' + (deployResult.error || 'queued')}`
  };
}

// ============ MULTI-FILE PUSH ============

async function pushMultipleFiles(repoName, files) {
  const results = [];
  for (const [path, content] of Object.entries(files)) {
    const r = await deploy.createOrUpdateFile(repoName, path, content, `feat: update ${path}`);
    results.push({ path, ok: r.ok, error: r.error });
    await new Promise(r => setTimeout(r, 300));
  }
  return {
    ok: results.every(r => r.ok),
    repo: repoName,
    files: results,
    message: `Pushed ${results.filter(r => r.ok).length}/${results.length} files to ${repoName}`
  };
}

// ============ RENDER ENV MANAGEMENT ============

async function setRenderEnvVar(serviceId, key, value) {
  try {
    const token = process.env.RENDER_API_KEY;
    const res = await axios.put(
      `https://api.render.com/v1/services/${serviceId}/env-vars/${key}`,
      { value },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return { ok: true, key, message: `✅ ${key} set` };
  } catch (err) {
    return { ok: false, error: err.response?.data?.message || err.message };
  }
}

async function getRenderServices() {
  try {
    const token = process.env.RENDER_API_KEY;
    const res = await axios.get('https://api.render.com/v1/services?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return (res.data || []).map(s => ({
      id: s.service?.id || s.id,
      name: s.service?.name || s.name,
      status: s.service?.status || s.status,
      url: s.service?.serviceDetails?.url || s.url,
      type: s.service?.type || s.type,
    }));
  } catch (err) {
    return [];
  }
}

// ============ VERCEL ENV MANAGEMENT ============

async function setVercelEnvVar(projectName, key, value, target = 'production') {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN_2 || process.env.VERCEL_TOKEN;
    const userRes = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const teamId = userRes.data?.user?.defaultTeamId;
    const qs = teamId ? `?teamId=${teamId}` : '';

    // Get project ID
    let projectId;
    try {
      const check = await axios.get(`https://api.vercel.com/v9/projects/${projectName}${qs}`, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
      });
      projectId = check.data?.id;
    } catch (_) {
      return { ok: false, error: `Project ${projectName} not found on Vercel` };
    }

    // Create env var
    await axios.post(`https://api.vercel.com/v9/projects/${projectId}/env${qs}`, {
      key,
      value,
      target: [target],
      type: 'encrypted',
    }, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' } });

    return { ok: true, key, project: projectName, message: `✅ ${key} set on ${projectName}` };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error?.message || err.message };
  }
}

// ============ HELPER ============

function toPascalCase(str) {
  return str.split(/[\s-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

// ============ PROJECT STATUS ============

async function getProjectStatus(repoName) {
  const results = {};

  // GitHub status
  try {
    const ghRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, { headers: HEADERS_GH() });
    results.github = { ok: true, url: ghRes.data.html_url, stars: ghRes.data.stargazers_count, updated: ghRes.data.updated_at };
  } catch (_) {
    results.github = { ok: false };
  }

  // Vercel status
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN_2 || process.env.VERCEL_TOKEN;
    const userRes = await axios.get('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
    const teamId = userRes.data?.user?.defaultTeamId;
    const qs = teamId ? `?teamId=${teamId}` : '';
    const vRes = await axios.get(`https://api.vercel.com/v9/projects/${repoName}${qs}`, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
    results.vercel = { ok: true, url: `https://${repoName}.vercel.app` };
  } catch (_) {
    results.vercel = { ok: false };
  }

  // Render status — try to find matching service
  const services = await getRenderServices();
  const match = services.find(s => s.name === repoName);
  if (match) {
    results.render = { ok: true, url: match.url, status: match.status };
  } else {
    results.render = { ok: false };
  }

  return results;
}

module.exports = {
  scaffoldProject, generateCode, deployEverywhere, createAndDeploy,
  pushMultipleFiles, setRenderEnvVar, getRenderServices,
  setVercelEnvVar, getProjectStatus, TEMPLATES,
};
