// Maganu Developer Tools — API tester, JSON, regex, SQL, error decoder
const axios = require('axios');
const { think } = require('./brain');

// ============ API ENDPOINT TESTER ============
async function testEndpoint(method, url, body) {
  const start = Date.now();
  try {
    const config = { method: method.toUpperCase(), url, timeout: 15000, headers: { 'Content-Type': 'application/json', 'User-Agent': 'Maganu-DevTools/5.0' } };
    if (body && ['POST','PUT','PATCH'].includes(method.toUpperCase())) {
      try { config.data = JSON.parse(body); } catch (_) { config.data = body; }
    }
    const res = await axios(config);
    const ms = Date.now() - start;
    const bodySnippet = JSON.stringify(res.data).slice(0, 300);
    return `🧪 *API Test Result*\n\nURL: ${url}\nMethod: ${method.toUpperCase()}\nStatus: ${res.status} ${res.statusText}\nTime: ${ms}ms\n\n*Response:*\n\`\`\`\n${bodySnippet}${bodySnippet.length >= 300 ? '...' : ''}\n\`\`\``;
  } catch (err) {
    const ms = Date.now() - start;
    const status = err.response?.status || 'N/A';
    const errBody = JSON.stringify(err.response?.data || err.message).slice(0, 200);
    return `❌ *API Test Failed*\n\nURL: ${url}\nStatus: ${status}\nTime: ${ms}ms\nError: ${errBody}`;
  }
}

// ============ JSON FORMATTER ============
function formatJSON(rawText) {
  try {
    const parsed = JSON.parse(rawText.trim());
    const pretty = JSON.stringify(parsed, null, 2);
    const keys = typeof parsed === 'object' ? Object.keys(parsed).length : 0;
    const isArray = Array.isArray(parsed);
    return `✅ *Valid JSON*\n\nType: ${isArray ? `Array (${parsed.length} items)` : `Object (${keys} keys)`}\n\n\`\`\`\n${pretty.slice(0, 1500)}${pretty.length > 1500 ? '\n...(truncated)' : ''}\n\`\`\``;
  } catch (err) {
    return `❌ *Invalid JSON*\n\nError: ${err.message}\n\nCommon fixes:\n1. Check for trailing commas\n2. Use double quotes (not single)\n3. Ensure all brackets/braces are closed`;
  }
}

// ============ REGEX GENERATOR ============
async function generateRegex(description) {
  return await think({
    message: `Generate a regex pattern for: "${description}"\n\nProvide:\n1. The regex pattern (in code block)\n2. Explanation of each part\n3. Example matches (3 that work)\n4. Example non-matches (2 that don't)\n5. JavaScript usage example\n6. Python usage example\n\nBe precise and test-ready.`,
    from: 'devtools', sessionId: 'regex', memory: []
  });
}

// ============ SQL QUERY WRITER ============
async function writeSQL(description, dbType) {
  return await think({
    message: `Write a ${dbType || 'PostgreSQL'} SQL query for: "${description}"\n\nProvide:\n1. The main query (in code block)\n2. Explanation of what it does\n3. Performance note (index recommendations if relevant)\n4. Variant for MySQL if different\n5. Sample result format\n\nBe production-ready. Handle edge cases.`,
    from: 'devtools', sessionId: 'sql', memory: []
  });
}

// ============ ERROR DECODER ============
async function decodeError(stackTrace) {
  return await think({
    message: `Decode and explain this error/stack trace in plain English:\n\n\`\`\`\n${stackTrace.slice(0, 2000)}\n\`\`\`\n\nProvide:\n1. What went wrong (plain English, 1-2 lines)\n2. Root cause\n3. Step-by-step fix\n4. How to prevent it in future\n5. Code snippet showing the fix (if applicable)\n\nBe specific. Don't be vague.`,
    from: 'devtools', sessionId: 'error_decode', memory: []
  });
}

// ============ REVENUE FORECASTING ============
async function forecastRevenue(currentMRR, growthRate, months) {
  const mrr = parseFloat(currentMRR);
  const rate = parseFloat(growthRate) / 100;
  const m = parseInt(months) || 12;

  const projections = [];
  let current = mrr;
  for (let i = 1; i <= m; i++) {
    current = current * (1 + rate);
    if (i === 3 || i === 6 || i === 12 || i === m) {
      projections.push({ month: i, mrr: Math.round(current), arr: Math.round(current * 12) });
    }
  }

  const aiInsight = await think({
    message: `A Nigerian SaaS/tech startup currently has MRR of $${mrr} (or ₦equivalent) and is growing at ${growthRate}% monthly. Provide:\n1. Is this growth rate realistic? Context on what's typical\n2. Key risks to maintaining this growth\n3. What milestones to hit at 3/6/12 months\n4. One growth lever they should focus on\nBe specific. Use *bold* headers.`,
    from: 'analytics', sessionId: 'forecast', memory: []
  });

  let msg = `📊 *Revenue Forecast*\n\nCurrent MRR: ₦${mrr.toLocaleString()}\nGrowth rate: ${growthRate}%/month\n\n`;
  projections.forEach(p => { msg += `Month ${p.month}: MRR ₦${p.mrr.toLocaleString()} | ARR ₦${p.arr.toLocaleString()}\n`; });
  msg += `\n${aiInsight}`;
  return msg;
}

// ============ ENTITY DATA EXPLORER ============
async function exploreEntityData(entityName, question) {
  return await think({
    message: `You are analyzing data from the entity "${entityName}" in the Harz Ecosystem database.\nUser question: "${question}"\n\nThe Harz Ecosystem has these entities: NumberLookup, Product, Seller, Order, BuildProject, ChapterTracker, DeployTask, ContentPilotSubscriber, OmegaWorkspace, RagChunk, NexalAdSubmission, EstateInquiry, EstateProperty, EstatePro, EstateMaterial, OmegaInfinityProject, OmegaInfinityRun.\n\nAnswer the question based on your knowledge of what this entity likely contains. If you can't answer definitively, explain what data would be needed and how to query it.\n\nBe helpful and specific.`,
    from: 'data', sessionId: 'entity_explorer', memory: []
  });
}

// ============ TEAM TOOLS ============
async function generateStandup(projectName, yesterday, today, blockers) {
  return await think({
    message: `Write a professional daily standup update for:\nProject: ${projectName}\nYesterday: ${yesterday || 'Not specified'}\nToday: ${today || 'Not specified'}\nBlockers: ${blockers || 'None'}\n\nFormat it as a clean, readable standup message for a team (Slack/Telegram). Include emojis for readability. Be concise — 5-8 lines max.`,
    from: 'team', sessionId: 'standup', memory: []
  });
}

async function generateOnboardingDoc(role, company, tools) {
  return await think({
    message: `Create a comprehensive onboarding document for a new ${role} at ${company || 'Harz Ecosystem'}.\nTools they'll use: ${tools || 'standard tech stack'}\n\nInclude:\n1. Welcome and company overview (2 lines)\n2. First day checklist (5 items)\n3. First week goals\n4. Key contacts and their roles\n5. Tools setup guide (numbered steps)\n6. Culture and expectations\n7. 30-60-90 day milestones\n\nMake it warm, practical, and complete. Use *bold* headers.`,
    from: 'team', sessionId: 'onboarding', memory: []
  });
}

async function generatePerformanceReview(name, role, strengths, improvements) {
  return await think({
    message: `Write a structured performance review for:\nName: ${name}\nRole: ${role}\nStrengths noted: ${strengths || 'Not specified'}\nAreas for improvement: ${improvements || 'Not specified'}\n\nStructure:\n1. Overall Performance Rating (1-5 scale with justification)\n2. Key Strengths (specific, evidence-based)\n3. Areas for Development\n4. Goals for Next Period (3 SMART goals)\n5. Manager's Summary\n\nTone: fair, constructive, professional. Use *bold* headers.`,
    from: 'team', sessionId: 'perf_review', memory: []
  });
}

// ============ DATA ANALYZER ============
async function analyzeData(dataText) {
  return await think({
    message: `Analyze this data and provide insights:\n\n${dataText.slice(0, 3000)}\n\nProvide:\n1. Data summary (what this data represents)\n2. Key patterns or trends\n3. Outliers or anomalies\n4. Top 3 actionable insights\n5. What additional data would improve the analysis\n\nBe specific with numbers. Use *bold* headers.`,
    from: 'analytics', sessionId: 'data_analysis', memory: []
  });
}

module.exports = {
  testEndpoint, formatJSON, generateRegex, writeSQL, decodeError,
  forecastRevenue, exploreEntityData,
  generateStandup, generateOnboardingDoc, generatePerformanceReview,
  analyzeData
};
