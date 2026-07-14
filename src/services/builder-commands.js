// Maganu Builder Commands — handles /build, /generate, /scaffold, /create commands
const builder = require('./builder');

// /build [template] [name] | [description]
// Scaffolds a full project and pushes to GitHub
async function handleBuild(args) {
  const [template, ...nameParts] = args;
  const name = nameParts.join(' ');
  const [cleanName, description] = name.split('|').map(s => s?.trim());
  
  if (!template || !cleanName) {
    return `🏗️ *Build New Project*\n\nUsage: /build [template] [name] | [description]\n\n*Templates:*\n• react — React SPA\n• nextjs — Next.js app\n• express — Express API server\n• static — Static HTML/CSS/JS\n• telegram-bot — Telegram bot\n• python-api — Flask Python API\n\n*Example:*\n/build express My API | A cool REST API\n/build react My Store | E-commerce frontend`;
  }
  
  const result = await builder.scaffoldProject({ name: cleanName, template, description });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `🏗️ *Project Built*\n\n`;
  msg += `Template: ${template}\n`;
  msg += `Repo: ${result.repo}\n`;
  msg += `Files: ${result.files.length}\n`;
  msg += `URL: ${result.url}\n`;
  msg += `\n${result.message}`;
  msg += `\n\n_Deploy with: /create [template] ${cleanName} | ${platform || 'vercel'}_`;
  return msg;
}

// /scaffold [template] [name]
// Same as build but without description
async function handleScaffold(args) {
  const [template, ...nameParts] = args;
  const name = nameParts.join(' ');
  
  if (!template || !name) {
    return `📦 *Scaffold Project*\n\nUsage: /scaffold [template] [name]\n\n*Templates:* react, nextjs, express, static, telegram-bot, python-api\n\nExample: /scaffold express my-api`;
  }
  
  const result = await builder.scaffoldProject({ name, template });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `📦 *Scaffolded ${result.repo}*\n\n`;
  msg += `Template: ${result.template}\n`;
  msg += `Files pushed: ${result.files.length}\n`;
  msg += `GitHub: ${result.url}\n`;
  msg += `\n${result.message}`;
  return msg;
}

// /create [template] [name] | [platform] | [description]
// Scaffolds AND deploys in one command
async function handleCreate(args) {
  const [template, ...nameParts] = args;
  const rest = nameParts.join(' ');
  const [name, platform = 'vercel', description] = rest.split('|').map(s => s?.trim());
  
  if (!template || !name) {
    return `🚀 *Create & Deploy*\n\nUsage: /create [template] [name] | [platform] | [description]\n\n*Templates:* react, nextjs, express, static, telegram-bot, python-api\n*Platforms:* vercel, netlify, render, railway, all\n\n*Example:*\n/create express My API | vercel | REST API server\n/create react My Store | netlify | E-commerce frontend\n/create express My Bot | all | Telegram bot on all platforms`;
  }
  
  const result = await builder.createAndDeploy({ name, template, description, platform });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `🚀 *Created & Deployed*\n\n`;
  msg += `Project: ${name}\n`;
  msg += `Template: ${template}\n`;
  msg += `Platform: ${platform}\n`;
  msg += `Repo: ${result.repoUrl}\n`;
  if (result.url) msg += `Live: ${result.url}\n`;
  msg += `\n${result.message}`;
  return msg;
}

// /generate [type] [name] | [options]
// Generates code snippets
async function handleGenerate(args) {
  const [type, ...nameParts] = args;
  const name = nameParts.join(' ');
  const [cleanName, ...opts] = name.split('|').map(s => s?.trim());
  
  if (!type || !cleanName) {
    return `⚙️ *Generate Code*\n\nUsage: /generate [type] [name] | [options]\n\n*Types:*\n• react-component [ComponentName]\n• api-endpoint [name] | [METHOD /path]\n• express-middleware [name]\n• mongoose-model [ModelName] | [fields]\n• sql-schema [table_name]\n• dockerfile\n• env-template [project]\n• readme [ProjectName] | [description]\n• telegram-command [command]\n\n*Examples:*\n/generate react-component UserProfile\n/generate api-endpoint users | GET /api/users\n/generate mongoose-model User | name: String, email: String, age: Number`;
  }
  
  const options = {};
  if (opts[0]) options.method = opts[0];
  if (opts[1]) options.path = opts[1];
  if (opts.join(' ').includes(':')) options.fields = opts.join(' ');
  if (opts[0] && opts[0].length > 20 && type === 'readme') options.description = opts[0];
  
  const result = await builder.generateCode({ type, name: cleanName, ...options });
  
  if (result.error) return `❌ ${result.error}`;
  
  return `⚙️ *Generated: ${type} — ${cleanName}*\n\n\`\`\`\n${result.code}\n\`\`\``;
}

// /deployall [repo]
// Deploys to all platforms at once
async function handleDeployAll(args) {
  const repoName = args.join(' ').trim();
  
  if (!repoName) {
    return `🚀 *Deploy Everywhere*\n\nUsage: /deployall [repo]\n\nDeploys your repo to Vercel, Netlify, and Render simultaneously.\n\nExample: /deployall my-api`;
  }
  
  const result = await builder.deployEverywhere(repoName);
  
  let msg = `🚀 *Multi-Platform Deploy: ${repoName}*\n\n`;
  
  if (result.urls.vercel) msg += `Vercel: ✅ ${result.urls.vercel}\n`;
  else msg += `Vercel: ❌ Failed\n`;
  
  if (result.urls.netlify) msg += `Netlify: ✅ ${result.urls.netlify}\n`;
  else msg += `Netlify: ❌ Failed\n`;
  
  if (result.urls.render) msg += `Render: ✅ ${result.urls.render}\n`;
  else msg += `Render: ❌ Failed\n`;
  
  msg += `\n${result.message}`;
  return msg;
}

// /env [platform] [project] [key] | [value]
// Set environment variable on Vercel or Render
async function handleEnv(args) {
  const [platform, project, key, ...valueParts] = args;
  const value = valueParts.join(' ');
  
  if (!platform || !project || !key || !value) {
    return `🔐 *Set Environment Variable*\n\nUsage: /env [platform] [project] [key] | [value]\n\n*Platforms:* vercel, render\n\n*Examples:*\n/env vercel my-api API_KEY | sk_123456\n/env render maganu-agent GROQ_API_KEY | gsk_abc123`;
  }
  
  let result;
  if (platform === 'vercel') {
    result = await builder.setVercelEnvVar(project, key, value);
  } else if (platform === 'render') {
    result = await builder.setRenderEnvVar(project, key, value);
  } else {
    return `❌ Unknown platform: ${platform}. Use 'vercel' or 'render'.`;
  }
  
  if (result.error) return `❌ ${result.error}`;
  return `🔐 *Env Var Set*\n\nPlatform: ${platform}\nProject: ${project}\nKey: ${key}\n\n${result.message}`;
}

// /services
// List all Render services
async function handleServices() {
  const services = await builder.getRenderServices();
  
  if (!services.length) return `📋 No Render services found.`;
  
  let msg = `📋 *Render Services*\n\n`;
  services.forEach(s => {
    const icon = s.status === 'live' ? '🟢' : s.status === 'suspended' ? '🔴' : '🟡';
    msg += `${icon} ${s.name}\n`;
    msg += `  ID: ${s.id}\n`;
    if (s.url) msg += `  URL: ${s.url}\n`;
    msg += `  Status: ${s.status}\n\n`;
  });
  return msg;
}

// /projectstatus [repo]
// Check project status across all platforms
async function handleProjectStatus(args) {
  const repoName = args.join(' ').trim();
  if (!repoName) return `📊 *Project Status*\n\nUsage: /projectstatus [repo]\n\nShows GitHub, Vercel, and Render status for a repo.`;
  
  const status = await builder.getProjectStatus(repoName);
  
  let msg = `📊 *Project Status: ${repoName}*\n\n`;
  
  if (status.github.ok) {
    msg += `GitHub: ✅ ${status.github.url}\n`;
  } else {
    msg += `GitHub: ❌ Not found\n`;
  }
  
  if (status.vercel.ok) {
    msg += `Vercel: ✅ ${status.vercel.url}\n`;
  } else {
    msg += `Vercel: ❌ Not deployed\n`;
  }
  
  if (status.render.ok) {
    msg += `Render: ${status.render.status === 'live' ? '🟢' : '🟡'} ${status.render.url || 'N/A'} (${status.render.status})\n`;
  } else {
    msg += `Render: ❌ Not deployed\n`;
  }
  
  return msg;
}

// /pushfiles [repo] | [file1:content1] | [file2:content2]
// Push multiple files at once
async function handlePushFiles(args) {
  const parts = args.join(' ').split('|').map(s => s?.trim());
  const repoName = parts[0];
  
  if (!repoName || parts.length < 2) {
    return `📤 *Push Multiple Files*\n\nUsage: /pushfiles [repo] | [file1:content1] | [file2:content2]\n\nExample:\n/pushfiles my-api | src/index.js:console.log('hello') | .env:PORT=3000`;
  }
  
  const files = {};
  for (let i = 1; i < parts.length; i++) {
    const colonIdx = parts[i].indexOf(':');
    if (colonIdx > 0) {
      const path = parts[i].slice(0, colonIdx).trim();
      const content = parts[i].slice(colonIdx + 1).trim();
      files[path] = content;
    }
  }
  
  if (!Object.keys(files).length) return `❌ No files parsed. Use file:content format.`;
  
  const result = await builder.pushMultipleFiles(repoName, files);
  
  let msg = `📤 *Push Files to ${repoName}*\n\n`;
  result.files.forEach(f => {
    msg += `${f.ok ? '✅' : '❌'} ${f.path}\n`;
  });
  msg += `\n${result.message}`;
  return msg;
}

// /templates
// List all available templates
async function handleTemplates() {
  const templates = Object.entries(builder.TEMPLATES);
  
  let msg = `📦 *Available Templates*\n\n`;
  templates.forEach(([key, tmpl]) => {
    const fileCount = Object.keys(tmpl.files).length;
    msg += `• ${key} — ${tmpl.name} (${fileCount} files)\n`;
  });
  msg += `\n*Usage:*\n/build [template] [name] | [description]\n/create [template] [name] | [platform] | [description]\n/scaffold [template] [name]`;
  return msg;
}

module.exports = {
  handleBuild, handleScaffold, handleCreate, handleGenerate,
  handleDeployAll, handleEnv, handleServices, handleProjectStatus,
  handlePushFiles, handleTemplates,
};
