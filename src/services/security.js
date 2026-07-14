// Maganu Security Service v1.0 — Platform Protection & Vulnerability Scanning
const axios = require('axios');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/7.0',
  Accept: 'application/vnd.github.v3+json'
});

const ECOSYSTEM_URLS = [
  { name: 'Maganu Agent', url: 'https://maganu-agent.onrender.com', type: 'api' },
  { name: 'HarzDM', url: 'https://harzdm-marketplace.vercel.app', type: 'frontend' },
  { name: 'OMEGA INFINITY', url: 'https://omega-infinity-dashboard.vercel.app', type: 'frontend' },
  { name: 'TradeOS', url: 'https://tradeos-dashboard-fawn.vercel.app', type: 'frontend' },
  { name: 'Abuja Estate City', url: 'https://abuja-estate-city-ai.vercel.app', type: 'frontend' },
  { name: 'OMEGA MASTER', url: 'https://omega-master.onrender.com', type: 'api' },
  { name: 'Apex Bank API', url: 'https://superagent-2286fb2f.base44.app/functions/apexBank', type: 'api' },
  { name: 'HarzDM Checkout', url: 'https://superagent-2286fb2f.base44.app/functions/harzDMCheckout', type: 'api' },
  { name: 'BuildBot AI', url: 'https://superagent-2286fb2f.base44.app/functions/buildbotAI', type: 'api' },
  { name: 'Nexal Media', url: 'https://superagent-2286fb2f.base44.app/functions/nexalMedia', type: 'api' },
  { name: 'ContentPilot', url: 'https://superagent-2286fb2f.base44.app/functions/contentPilotDashboard', type: 'api' },
  { name: 'HostMaster', url: 'https://superagent-2286fb2f.base44.app/functions/hostmasterAI', type: 'api' },
  { name: 'Oracle AI', url: 'https://superagent-2286fb2f.base44.app/functions/oracleAI', type: 'api' },
];

const ECOSYSTEM_REPOS = [
  'maganu-agent', 'omega-infinity-1000', 'tradeos', 'buildbot-ai',
  'harzdm-marketplace', 'omega-ai-packager', 'abuja-estate-city-ai',
  'contentpilot-ai', 'deployforge', 'hostmaster-ai', 'nexal-media',
  'gdeg', 'omega-master'
];

const SENSITIVE_PATTERNS = [
  /sk_live_[a-zA-Z0-9]{20,}/g,     // Stripe live keys
  /sk_test_[a-zA-Z0-9]{20,}/g,     // Stripe test keys
  /sk_[a-zA-Z0-9]{30,}/g,           // Generic secret keys
  /ghp_[a-zA-Z0-9]{30,}/g,          // GitHub tokens
  /gho_[a-zA-Z0-9]{30,}/g,          // GitHub OAuth tokens
  /xox[baprs]-[a-zA-Z0-9-]+/g,     // Slack tokens
  /AKIA[A-Z0-9]{16}/g,              // AWS keys
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, // Private keys
  /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, // Hardcoded API keys
  /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,     // Hardcoded passwords
  /secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, // Hardcoded secrets
];

// ============ FULL SECURITY AUDIT ============
async function runFullAudit() {
  const results = {
    timestamp: new Date().toISOString(),
    summary: { critical: 0, warnings: 0, passed: 0, total: 0 },
    repos: [],
    urls: [],
    secrets: [],
    recommendations: [],
  };

  // 1. Scan GitHub repos
  for (const repo of ECOSYSTEM_REPOS) {
    const repoResult = { name: repo, issues: [], status: 'pass' };
    
    try {
      // Check .gitignore
      try {
        await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/.gitignore`, { headers: HEADERS_GH(), timeout: 5 });
      } catch (_) {
        repoResult.issues.push('No .gitignore — secrets at risk');
        repoResult.status = 'warning';
        results.summary.warnings++;
      }

      // Check for .env committed
      try {
        await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/.env`, { headers: HEADERS_GH(), timeout: 5 });
        repoResult.issues.push('CRITICAL: .env file committed to repo!');
        repoResult.status = 'critical';
        results.summary.critical++;
      } catch (_) { /* good — .env not found */ }

      // Scan file tree for sensitive files
      try {
        const tree = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/main?recursive=1`, { headers: HEADERS_GH(), timeout: 5 });
        const files = tree.data?.tree || [];
        const sensitive = files.filter(f => /\.(env|pem|key|p12|pfx)$/.test(f.path) || f.path.includes('credentials'));
        if (sensitive.length) {
          repoResult.issues.push(`Sensitive files found: ${sensitive.map(f => f.path).join(', ')}`);
          repoResult.status = 'critical';
          results.summary.critical++;
        }
      } catch (_) {}

      // Check repo visibility (should be private for sensitive repos)
      const repoInfo = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}`, { headers: HEADERS_GH(), timeout: 5 });
      if (repoInfo.data?.private === false && ['maganu-agent', 'omega-master'].includes(repo)) {
        repoResult.issues.push('Warning: sensitive repo is public');
        repoResult.status = repoResult.status === 'critical' ? 'critical' : 'warning';
        if (repoResult.status === 'warning') results.summary.warnings++;
      }

    } catch (e) { /* repo may not exist */ }

    if (repoResult.status === 'pass') results.summary.passed++;
    results.summary.total++;
    results.repos.push(repoResult);
  }

  // 2. Scan live URLs for security headers
  for (const site of ECOSYSTEM_URLS) {
    const urlResult = { name: site.name, url: site.url, issues: [], status: 'pass' };
    
    try {
      const res = await axios.get(site.url, { timeout: 10, validateStatus: () => true });
      const headers = {};
      Object.keys(res.headers || {}).forEach(k => { headers[k.toLowerCase()] = res.headers[k]; });

      if (!headers['strict-transport-security']) {
        urlResult.issues.push('Missing HSTS header');
        urlResult.status = 'warning';
      }
      if (!headers['x-content-type-options']) {
        urlResult.issues.push('Missing X-Content-Type-Options');
        urlResult.status = 'warning';
      }
      if (!headers['x-frame-options'] && site.type === 'frontend') {
        urlResult.issues.push('Missing X-Frame-Options (clickjacking risk)');
        urlResult.status = 'warning';
      }
      if (headers['access-control-allow-origin'] === '*' && site.type === 'api') {
        urlResult.issues.push('CORS wildcard — open to all origins');
        urlResult.status = 'warning';
      }
      if (res.status >= 500) {
        urlResult.issues.push(`Server error: ${res.status}`);
        urlResult.status = 'critical';
      }
      if (res.status === 0 || res.status >= 400) {
        urlResult.issues.push(`HTTP ${res.status}`);
        if (res.status >= 500) urlResult.status = 'critical';
      }
    } catch (e) {
      urlResult.issues.push(`Unreachable: ${e.message?.slice(0, 60)}`);
      urlResult.status = 'critical';
    }

    if (urlResult.status === 'critical') results.summary.critical++;
    else if (urlResult.status === 'warning') results.summary.warnings++;
    else results.summary.passed++;
    results.summary.total++;
    results.urls.push(urlResult);
  }

  // 3. Check for exposed secrets in repos (scan key files)
  for (const repo of ECOSYSTEM_REPOS) {
    try {
      const tree = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/main?recursive=1`, { headers: HEADERS_GH(), timeout: 5 });
      const codeFiles = (tree.data?.tree || []).filter(f => /\.(js|ts|jsx|tsx|json|py)$/.test(f.path) && !f.path.includes('node_modules'));
      
      for (const file of codeFiles.slice(0, 15)) { // Limit to 15 files per repo
        try {
          const content = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${file.path}`, { headers: HEADERS_GH(), timeout: 5 });
          const decoded = Buffer.from(content.data?.content || '', 'base64').toString('utf8');
          
          for (const pattern of SENSITIVE_PATTERNS) {
            const matches = decoded.match(pattern);
            if (matches) {
              results.secrets.push({ repo, file: file.path, match: matches[0].slice(0, 20) + '...' });
              results.summary.critical++;
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // 4. Generate recommendations
  if (results.summary.critical > 0) results.recommendations.push('🔴 Fix critical issues immediately — exposed secrets or unreachable services');
  if (results.repos.some(r => r.issues.includes('No .gitignore — secrets at risk'))) results.recommendations.push('Add .gitignore to all repos missing one');
  if (results.urls.some(u => u.issues.includes('Missing HSTS header'))) results.recommendations.push('Add HSTS headers to all API endpoints');
  if (results.urls.some(u => u.issues.includes('CORS wildcard — open to all origins'))) results.recommendations.push('Restrict CORS to specific origins instead of wildcard *');
  if (results.urls.some(u => u.issues.includes('Missing X-Frame-Options (clickjacking risk)'))) results.recommendations.push('Add X-Frame-Options: DENY to frontend apps');
  if (!results.recommendations.length) results.recommendations.push('✅ All systems secure — no critical issues found');

  return results;
}

// ============ COMMAND HANDLERS ============

async function handleSecurityAudit() {
  const audit = await runFullAudit();
  let msg = `🛡️ *Security Audit Report*\n\n`;
  msg += `Scanned: ${audit.summary.total} targets\n`;
  msg += `✅ Passed: ${audit.summary.passed} | 🟡 Warnings: ${audit.summary.warnings} | 🔴 Critical: ${audit.summary.critical}\n\n`;

  // Critical issues first
  const criticalRepos = audit.repos.filter(r => r.status === 'critical');
  const criticalUrls = audit.urls.filter(u => u.status === 'critical');
  
  if (criticalRepos.length || criticalUrls.length || audit.secrets.length) {
    msg += `*🔴 CRITICAL ISSUES:*\n`;
    criticalRepos.forEach(r => msg += `  ${r.name}: ${r.issues.join(', ')}\n`);
    criticalUrls.forEach(u => msg += `  ${u.name}: ${u.issues.join(', ')}\n`);
    audit.secrets.forEach(s => msg += `  Secret in ${s.repo}/${s.file}: ${s.match}...\n`);
    msg += `\n`;
  }

  // Warnings
  const warningRepos = audit.repos.filter(r => r.status === 'warning');
  const warningUrls = audit.urls.filter(u => u.status === 'warning');
  
  if (warningRepos.length || warningUrls.length) {
    msg += `*🟡 WARNINGS:*\n`;
    warningRepos.forEach(r => msg += `  ${r.name}: ${r.issues.join(', ')}\n`);
    warningUrls.forEach(u => msg += `  ${u.name}: ${u.issues.join(', ')}\n`);
    msg += `\n`;
  }

  // Recommendations
  msg += `*📋 RECOMMENDATIONS:*\n`;
  audit.recommendations.forEach(r => msg += `  ${r}\n`);

  return msg;
}

async function handleSecurityStatus() {
  let msg = `🛡️ *Security Status Check*\n\n`;
  let allOk = true;

  for (const site of ECOSYSTEM_URLS) {
    try {
      const res = await axios.get(site.url, { timeout: 8, validateStatus: () => true });
      const status = res.status < 400 ? '✅' : '🔴';
      if (res.status >= 400) allOk = false;
      msg += `${status} ${site.name}: ${res.status}\n`;
    } catch (e) {
      allOk = false;
      msg += `🔴 ${site.name}: DOWN\n`;
    }
  }

  msg += `\n${allOk ? '✅ All platforms reachable.' : '🔴 Some platforms have issues.'}`;
  return msg;
}

async function handleSecretScan() {
  let msg = `🔍 *Secret Exposure Scan*\n\n`;
  let found = 0;

  for (const repo of ECOSYSTEM_REPOS) {
    try {
      const tree = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/main?recursive=1`, { headers: HEADERS_GH(), timeout: 5 });
      const files = (tree.data?.tree || []).filter(f => /\.(js|ts|json|py)$/.test(f.path) && !f.path.includes('node_modules'));
      
      for (const file of files.slice(0, 10)) {
        try {
          const content = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${file.path}`, { headers: HEADERS_GH(), timeout: 5 });
          const decoded = Buffer.from(content.data?.content || '', 'base64').toString('utf8');
          
          for (const pattern of SENSITIVE_PATTERNS) {
            const matches = decoded.match(pattern);
            if (matches) {
              msg += `🔴 ${repo}/${file.path}\n  Found: ${matches[0].slice(0, 25)}...\n`;
              found++;
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  if (found === 0) msg += `✅ No exposed secrets found in any repo!\n`;
  else msg += `\n🔴 Found ${found} exposed secrets — rotate these keys immediately!`;
  
  return msg;
}

async function handleHeadersCheck() {
  let msg = `🔒 *Security Headers Check*\n\n`;
  
  for (const site of ECOSYSTEM_URLS) {
    try {
      const res = await axios.get(site.url, { timeout: 8, validateStatus: () => true });
      const headers = {};
      Object.keys(res.headers || {}).forEach(k => { headers[k.toLowerCase()] = res.headers[k]; });
      
      const checks = [
        ['HSTS', !!headers['strict-transport-security']],
        ['X-Content-Type', !!headers['x-content-type-options']],
        ['X-Frame-Options', !!headers['x-frame-options']],
        ['CORS Safe', headers['access-control-allow-origin'] !== '*'],
      ];
      
      const allPass = checks.every(([_, pass]) => pass);
      msg += `${allPass ? '✅' : '🟡'} ${site.name}\n`;
      checks.forEach(([name, pass]) => {
        if (!pass) msg += `   ❌ ${name}\n`;
      });
    } catch (e) {
      msg += `🔴 ${site.name}: Unreachable\n`;
    }
  }
  
  return msg;
}

async function handleRepoSecurity() {
  let msg = `📦 *Repository Security Scan*\n\n`;
  
  for (const repo of ECOSYSTEM_REPOS) {
    try {
      let issues = [];
      
      // Check .gitignore
      try {
        await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/.gitignore`, { headers: HEADERS_GH(), timeout: 5 });
      } catch (_) {
        issues.push('no .gitignore');
      }
      
      // Check for .env
      try {
        await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/.env`, { headers: HEADERS_GH(), timeout: 5 });
        issues.push('.env EXPOSED');
      } catch (_) {}
      
      // Check visibility
      const info = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}`, { headers: HEADERS_GH(), timeout: 5 });
      const isPrivate = info.data?.private;
      
      const icon = issues.length === 0 ? '✅' : issues.includes('.env EXPOSED') ? '🔴' : '🟡';
      msg += `${icon} ${repo} (${isPrivate ? 'private' : 'public'})`;
      if (issues.length) msg += ` — ${issues.join(', ')}`;
      msg += `\n`;
    } catch (e) {
      msg += `🟡 ${repo}: check failed\n`;
    }
  }
  
  return msg;
}

module.exports = {
  handleSecurityAudit, handleSecurityStatus, handleSecretScan,
  handleHeadersCheck, handleRepoSecurity, runFullAudit,
};
