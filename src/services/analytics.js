// Maganu Analytics & Intelligence Service v1.0 — Predictive Analytics + Web Scraper + Code Review
const axios = require('axios');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/7.0',
  Accept: 'application/vnd.github.v3+json'
});

const ECOSYSTEM_REPOS = [
  'maganu-agent', 'omega-infinity-1000', 'tradeos', 'buildbot-ai',
  'harzdm-marketplace', 'omega-ai-packager', 'abuja-estate-city-ai',
  'contentpilot-ai', 'deployforge', 'hostmaster-ai', 'nexal-media',
  'gdeg', 'omega-master'
];

// === PREDICTIVE ANALYTICS ===
async function handleForecast(args) {
  // Fetch transactions from Apex Bank API
  try {
    const res = await axios.post('https://superagent-2286fb2f.base44.app/functions/apexBank', { action: 'listTransactions' }, { timeout: 10000 });
    const transactions = res.data?.transactions || [];
    
    if (transactions.length === 0) return `📊 *Revenue Forecast*\n\nNo transaction data available.`;
    
    const credits = transactions.filter(t => t.type === 'credit' || t.type === 'transfer');
    const debits = transactions.filter(t => t.type === 'debit' || t.type === 'payment');
    const totalCredits = credits.reduce((s, t) => s + (t.amount || 0), 0);
    const totalDebits = debits.reduce((s, t) => s + (t.amount || 0), 0);
    const netCashFlow = totalCredits - totalDebits;
    
    // Simple projection: average monthly + growth rate
    const avgMonthlyCredit = totalCredits / Math.max(1, Math.ceil(transactions.length / 10));
    const growthRate = 0.15; // 15% month-over-month
    
    const projections = [];
    let projected = avgMonthlyCredit;
    for (let i = 1; i <= 6; i++) {
      projected *= (1 + growthRate);
      projections.push({ month: i, revenue: projected });
    }
    
    let msg = `📊 *Revenue Forecast (6 Months)*\n\n`;
    msg += `*Current Data:*\n`;
    msg += `Total Credits: $${totalCredits.toLocaleString()}\n`;
    msg += `Total Debits: $${totalDebits.toLocaleString()}\n`;
    msg += `Net Cash Flow: $${netCashFlow.toLocaleString()}\n`;
    msg += `Avg Monthly Revenue: $${avgMonthlyCredit.toFixed(2)}\n\n`;
    msg += `*6-Month Projection (15% MoM growth):*\n`;
    projections.forEach(p => {
      const monthName = new Date(Date.now() + p.month * 30 * 86400000).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      msg += `  ${monthName}: $${p.revenue.toFixed(2)}\n`;
    });
    msg += `\n*Total Projected Revenue: $${projections.reduce((s, p) => s + p.revenue, 0).toFixed(2)}*`;
    
    return msg;
  } catch (e) {
    return `❌ Forecast error: ${e.message}`;
  }
}

async function handleCashFlow() {
  try {
    const res = await axios.post('https://superagent-2286fb2f.base44.app/functions/apexBank', { action: 'listAccounts' }, { timeout: 10000 });
    const accounts = res.data?.accounts || [];
    const totalBalance = res.data?.totalBalance || 0;
    
    const res2 = await axios.post('https://superagent-2286fb2f.base44.app/functions/apexBank', { action: 'listTransactions' }, { timeout: 10000 });
    const transactions = res2.data?.transactions || [];
    
    const inflow = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const outflow = transactions.filter(t => t.type === 'debit' || t.type === 'payment').reduce((s, t) => s + t.amount, 0);
    const burnRate = outflow / Math.max(1, Math.ceil(transactions.length / 5));
    
    const runway = burnRate > 0 ? Math.floor(totalBalance / burnRate) : 999;
    
    let msg = `💰 *Cash Flow Analysis*\n\n`;
    msg += `Total Balance: $${totalBalance.toLocaleString()}\n`;
    msg += `Total Inflow: $${inflow.toLocaleString()}\n`;
    msg += `Total Outflow: $${outflow.toLocaleString()}\n`;
    msg += `Net: $${(inflow - outflow).toLocaleString()}\n\n`;
    msg += `Estimated Monthly Burn Rate: $${burnRate.toFixed(2)}\n`;
    msg += `Runway: ${runway} months\n\n`;
    
    msg += `*Account Breakdown:*\n`;
    accounts.forEach(a => {
      const pct = totalBalance > 0 ? ((a.balance / totalBalance) * 100).toFixed(0) : 0;
      msg += `  ${a.account_name}: $${(a.balance || 0).toLocaleString()} (${pct}%)\n`;
    });
    
    return msg;
  } catch (e) {
    return `❌ Cash flow error: ${e.message}`;
  }
}

async function handleChurnAnalysis() {
  // Analyze customer retention based on transaction patterns
  try {
    const res = await axios.post('https://superagent-2286fb2f.base44.app/functions/apexBank', { action: 'listTransactions' }, { timeout: 10000 });
    const transactions = res.data?.transactions || [];
    
    const uniqueRecipients = new Set(transactions.map(t => t.recipient).filter(Boolean));
    const repeatCustomers = new Set();
    const recipientCount = {};
    
    transactions.forEach(t => {
      if (t.recipient) {
        recipientCount[t.recipient] = (recipientCount[t.recipient] || 0) + 1;
        if (recipientCount[t.recipient] > 1) repeatCustomers.add(t.recipient);
      }
    });
    
    const churnRate = uniqueRecipients.size > 0
      ? ((uniqueRecipients.size - repeatCustomers.size) / uniqueRecipients.size * 100).toFixed(1)
      : 0;
    
    let msg = `📊 *Customer Retention Analysis*\n\n`;
    msg += `Total Unique Customers: ${uniqueRecipients.size}\n`;
    msg += `Repeat Customers: ${repeatCustomers.size}\n`;
    msg += `One-time Customers: ${uniqueRecipients.size - repeatCustomers.size}\n`;
    msg += `Churn Rate: ${churnRate}%\n`;
    msg += `Retention Rate: ${(100 - churnRate).toFixed(1)}%\n\n`;
    
    if (Object.keys(recipientCount).length > 0) {
      msg += `*Top Customers (by transactions):*\n`;
      Object.entries(recipientCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name, count]) => { msg += `  ${name}: ${count} transactions\n`; });
    }
    
    return msg;
  } catch (e) {
    return `❌ Churn analysis error: ${e.message}`;
  }
}

// === WEB SCRAPER & MARKET INTELLIGENCE ===
async function handleScrape(args) {
  const url = args[0];
  if (!url) return `🔍 *Web Scraper*\n\nUsage: /scrape [url]\n\nExample:\n/scrape https://example.com\n\nExtracts text content from any webpage.`;
  
  try {
    const res = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = res.data;
    
    // Extract text content (strip HTML tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1] : '';
    
    const summary = text.slice(0, 1500);
    
    return `🔍 *Scraped: ${title}*\n\n${description ? `Description: ${description}\n\n` : ''}Content (first 1500 chars):\n\n${summary}`;
  } catch (e) {
    return `❌ Scrape failed: ${e.message}`;
  }
}

async function handleMarketIntel(args) {
  const topic = args.join(' ').trim() || 'Nigerian tech startups';
  
  try {
    // Search using DuckDuckGo (no API key needed)
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_html=1`, { timeout: 10000 });
    const data = res.data;
    
    let msg = `📈 *Market Intelligence: ${topic}*\n\n`;
    
    if (data.AbstractText) {
      msg += `${data.AbstractText}\n\n`;
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      msg += `*Key Findings:*\n`;
      data.RelatedTopics.slice(0, 8).forEach(t => {
        if (t.Text) msg += `  • ${t.Text}\n`;
      });
    }
    
    if (data.Results && data.Results.length > 0) {
      msg += `\n*Sources:*\n`;
      data.Results.slice(0, 3).forEach(r => {
        if (r.FirstURL) msg += `  ${r.FirstURL}\n`;
      });
    }
    
    if (msg === `📈 *Market Intelligence: ${topic}*\n\n`) {
      msg += `No detailed results found. Try a more specific query.\n\nTry: /marketintel construction materials prices Nigeria`;
    }
    
    return msg;
  } catch (e) {
    return `❌ Market intelligence failed: ${e.message}`;
  }
}

// === CODE REVIEW & BUG HUNTER ===
const CODE_SMELLS = [
  { pattern: /eval\s*\(/g, severity: 'critical', name: 'Use of eval() — code injection risk' },
  { pattern: /innerHTML\s*=/g, severity: 'warning', name: 'innerHTML assignment — XSS risk' },
  { pattern: /document\.write/g, severity: 'warning', name: 'document.write — XSS risk' },
  { pattern: /setTimeout\s*\(\s*['"]/g, severity: 'warning', name: 'setTimeout with string — code injection' },
  { pattern: /setInterval\s*\(\s*['"]/g, severity: 'warning', name: 'setInterval with string — code injection' },
  { pattern: /\.catch\s*\(\s*\)/g, severity: 'warning', name: 'Empty catch — swallowed errors' },
  { pattern: /console\.log/g, severity: 'info', name: 'console.log — should be removed in production' },
  { pattern: /TODO|FIXME|HACK|XXX/g, severity: 'info', name: 'Technical debt marker' },
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', name: 'Hardcoded password' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', name: 'Hardcoded API key' },
  { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', name: 'Hardcoded secret' },
  { pattern: /var\s+/g, severity: 'info', name: 'var instead of let/const' },
  { pattern: /==\s*[^=]/g, severity: 'warning', name: 'Loose equality (==) — use === instead' },
];

async function handleCodeReview(args) {
  const repo = args[0];
  if (!repo) {
    return `🔍 *Code Review & Bug Hunter*\n\nUsage: /review [repo_name]\n\nAvailable repos:\n${ECOSYSTEM_REPOS.join(', ')}\n\nExample: /review maganu-agent`;
  }
  
  try {
    // Get file tree
    const treeRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/main?recursive=1`, { headers: HEADERS_GH(), timeout: 10 });
    const files = (treeRes.data?.tree || []).filter(f => /\.(js|ts|jsx|tsx)$/.test(f.path) && !f.path.includes('node_modules') && !f.path.includes('.min.'));
    
    if (files.length === 0) return `❌ No code files found in ${repo}.`;
    
    let totalIssues = { critical: 0, warnings: 0, info: 0 };
    let fileIssues = [];
    
    // Scan up to 20 files
    for (const file of files.slice(0, 20)) {
      try {
        const contentRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${file.path}`, { headers: HEADERS_GH(), timeout: 5 });
        const code = Buffer.from(contentRes.data?.content || '', 'base64').toString('utf8');
        
        const issues = [];
        for (const smell of CODE_SMELLS) {
          const matches = code.match(smell.pattern);
          if (matches) {
            issues.push({ name: smell.name, severity: smell.severity, count: matches.length });
            if (smell.severity === 'critical') totalIssues.critical += matches.length;
            else if (smell.severity === 'warning') totalIssues.warnings += matches.length;
            else totalIssues.info += matches.length;
          }
        }
        
        if (issues.length > 0) {
          fileIssues.push({ file: file.path, issues });
        }
      } catch (_) {}
    }
    
    let msg = `🔍 *Code Review: ${repo}*\n\n`;
    msg += `Files Scanned: ${Math.min(files.length, 20)}/${files.length}\n`;
    msg += `🔴 Critical: ${totalIssues.critical} | 🟡 Warnings: ${totalIssues.warnings} | 🔵 Info: ${totalIssues.info}\n\n`;
    
    if (totalIssues.critical > 0) {
      msg += `*🔴 CRITICAL:*\n`;
      fileIssues.forEach(f => {
        f.issues.filter(i => i.severity === 'critical').forEach(i => {
          msg += `  ${f.file}: ${i.name} (${i.count}x)\n`;
        });
      });
      msg += `\n`;
    }
    
    if (totalIssues.warnings > 0) {
      msg += `*🟡 WARNINGS:*\n`;
      fileIssues.forEach(f => {
        f.issues.filter(i => i.severity === 'warning').forEach(i => {
          msg += `  ${f.file}: ${i.name} (${i.count}x)\n`;
        });
      });
      msg += `\n`;
    }
    
    if (totalIssues.info > 0 && totalIssues.critical === 0) {
      msg += `*🔵 INFO:*\n`;
      fileIssues.forEach(f => {
        f.issues.filter(i => i.severity === 'info').slice(0, 3).forEach(i => {
          msg += `  ${f.file}: ${i.name}\n`;
        });
      });
    }
    
    if (totalIssues.critical === 0 && totalIssues.warnings === 0) {
      msg += `✅ Code looks clean! No critical issues found.`;
    }
    
    return msg;
  } catch (e) {
    return `❌ Code review failed: ${e.message}`;
  }
}

async function handleReviewAll() {
  let msg = `🔍 *Ecosystem Code Review*\n\n`;
  let totalCritical = 0, totalWarnings = 0;
  
  for (const repo of ECOSYSTEM_REPOS) {
    try {
      const treeRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/main?recursive=1`, { headers: HEADERS_GH(), timeout: 5 });
      const files = (treeRes.data?.tree || []).filter(f => /\.(js|ts)$/.test(f.path) && !f.path.includes('node_modules'));
      
      let repoCritical = 0, repoWarnings = 0;
      
      for (const file of files.slice(0, 5)) {
        try {
          const contentRes = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${file.path}`, { headers: HEADERS_GH(), timeout: 3 });
          const code = Buffer.from(contentRes.data?.content || '', 'base64').toString('utf8');
          
          for (const smell of CODE_SMELLS) {
            const matches = code.match(smell.pattern);
            if (matches) {
              if (smell.severity === 'critical') repoCritical += matches.length;
              else if (smell.severity === 'warning') repoWarnings += matches.length;
            }
          }
        } catch (_) {}
      }
      
      totalCritical += repoCritical;
      totalWarnings += repoWarnings;
      
      const icon = repoCritical > 0 ? '🔴' : repoWarnings > 0 ? '🟡' : '✅';
      msg += `${icon} ${repo}: ${repoCritical} critical, ${repoWarnings} warnings\n`;
    } catch (_) {
      msg += `⏭️ ${repo}: skipped\n`;
    }
  }
  
  msg += `\n*Total: ${totalCritical} critical, ${totalWarnings} warnings across ${ECOSYSTEM_REPOS.length} repos*`;
  return msg;
}

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

module.exports = {
  handleForecast, handleCashFlow, handleChurnAnalysis,
  handleScrape, handleMarketIntel,
  handleCodeReview, handleReviewAll,
  getRepoTraffic, getDailyCodeStats, getWeeklyDigest,
};
