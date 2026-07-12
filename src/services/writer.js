// Maganu Writing Engine — Proposals, SOPs, emails, scripts, press releases, ads
const { think } = require('./brain');

// ============ BUSINESS DOCUMENTS ============
async function generateProposal(clientName, projectDesc, budget) {
  return await think({
    message: `Write a professional business proposal for:\nClient: ${clientName}\nProject: ${projectDesc}\nBudget: ${budget || 'To be discussed'}\n\nStructure:\n1. Executive Summary (2-3 lines)\n2. Problem Statement\n3. Proposed Solution\n4. Our Approach (3 phases)\n5. Deliverables\n6. Timeline\n7. Investment/Pricing\n8. Why Harz Ecosystem / Rabiu Hamza\n9. Next Steps\n\nTone: professional, confident, Nigerian business context. Use *bold* headers.`,
    from: 'writer', sessionId: 'proposal', memory: []
  });
}

async function generateSOP(processName, steps) {
  return await think({
    message: `Write a detailed Standard Operating Procedure (SOP) for: "${processName}"\nContext/steps provided: ${steps || 'use best practices'}\n\nFormat as:\n1. Purpose\n2. Scope\n3. Responsibilities\n4. Step-by-step procedure (numbered)\n5. Quality checks\n6. Common errors to avoid\n7. Related documents\n\nMake it clear, unambiguous, and actionable. Use *bold* headers.`,
    from: 'writer', sessionId: 'sop', memory: []
  });
}

async function generateJobDescription(role, company, requirements) {
  return await think({
    message: `Write a compelling job description for:\nRole: ${role}\nCompany: ${company || 'Harz Ecosystem'}\nRequirements: ${requirements || 'standard for this role'}\n\nInclude: role summary, responsibilities (5-7 bullets as numbered list), requirements, nice-to-haves, what we offer, how to apply.\nTone: exciting but professional. Nigerian tech startup context.\nUse *bold* headers.`,
    from: 'writer', sessionId: 'jd', memory: []
  });
}

async function generatePressRelease(headline, product, detail) {
  return await think({
    message: `Write a professional press release:\nHeadline: ${headline}\nProduct/News: ${product}\nDetail: ${detail || ''}\n\nFormat:\n- FOR IMMEDIATE RELEASE\n- Dateline (Lagos, Nigeria — ${new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', year: 'numeric', month: 'long', day: 'numeric' })})\n- Lead paragraph (who, what, when, where, why)\n- Quote from Rabiu Hamza, Founder, Harz Ecosystem\n- Body (2-3 paragraphs)\n- Boilerplate about Harz Ecosystem\n- Contact: harzco.business@gmail.com\n\nTone: authoritative, newsworthy. Use *bold* for the headline.`,
    from: 'writer', sessionId: 'press', memory: []
  });
}

async function analyzeContract(contractText) {
  return await think({
    message: `Analyze this contract and flag any risks, unusual clauses, or missing protections:\n\n${contractText.slice(0, 3000)}\n\nProvide:\n1. Summary of what this contract covers\n2. Red flags or risky clauses (be specific)\n3. Missing standard protections\n4. Payment terms analysis\n5. Exit/termination clause assessment\n6. Overall recommendation: sign/negotiate/reject\n\nUse *bold* headers. Be direct.`,
    from: 'writer', sessionId: 'contract', memory: []
  });
}

// ============ EMAIL & OUTREACH ============
async function generateEmailDrip(productName, targetAudience, numEmails = 5) {
  return await think({
    message: `Write a ${numEmails}-email onboarding drip sequence for:\nProduct: ${productName}\nAudience: ${targetAudience}\n\nFor each email:\n- Subject line\n- Preview text\n- Body (3-5 short paragraphs)\n- CTA\n- Send timing (Day 0, Day 2, etc.)\n\nProgression: Welcome → Value → Social proof → Feature spotlight → Conversion push.\nTone: warm, helpful, not salesy. Use *bold* for email numbers and subject lines.`,
    from: 'writer', sessionId: 'drip', memory: []
  });
}

async function generateColdOutreach(targetRole, company, productName, value) {
  return await think({
    message: `Write 3 cold outreach email variants for:\nTarget: ${targetRole} at ${company || 'target companies'}\nOur product: ${productName}\nValue proposition: ${value || 'not specified'}\n\nFor each:\n- Subject line (under 8 words)\n- Opening hook (1 line, no "I hope this finds you well")\n- Body (3-4 lines max)\n- Soft CTA\n\nVariant angles: pain-focused, curiosity, social proof.\nUse *bold* for variant labels.`,
    from: 'writer', sessionId: 'outreach', memory: []
  });
}

// ============ SOCIAL MEDIA CONTENT ============
async function generate30DayCalendar(platform, topic) {
  return await think({
    message: `Generate a 30-day social media content calendar for:\nPlatform: ${platform}\nTopic/Brand: ${topic}\n\nGroup by week. For each week, give 5-7 post ideas with:\n- Day number\n- Post type (tip, story, poll, behind-scenes, etc.)\n- Brief description of content\n- Hook/opening line\n\nMix: educational, entertaining, promotional, engagement posts.\nUse *bold* for week headers.`,
    from: 'writer', sessionId: 'calendar30', memory: []
  });
}

async function generateNewsletter(platformName, highlights) {
  return await think({
    message: `Write a weekly newsletter for ${platformName}:\nThis week's highlights: ${highlights || 'product updates, tips, community news'}\n\nStructure:\n1. Subject line (catchy, < 10 words)\n2. Preview text\n3. Opening (personal, 2 lines)\n4. Main story (product update or insight, 3-4 paragraphs)\n5. Quick tips section (3 numbered items)\n6. Community spotlight or testimonial\n7. What's coming next week\n8. Sign-off from Rabiu Hamza\n\nTone: friendly expert. Use *bold* headers.`,
    from: 'writer', sessionId: 'newsletter', memory: []
  });
}

async function generateThread(topic, platform = 'Twitter') {
  return await think({
    message: `Write a viral 10-tweet thread for ${platform} about: "${topic}"\n\nTweet 1: Hook (must stop scrolling)\nTweets 2-9: One insight per tweet, each building on the last. Max 280 chars each.\nTweet 10: Summary + CTA + "Follow for more"\n\nStyle: punchy, direct, no fluff. Add thread numbers (1/, 2/, etc.).\nContext: Rabiu Hamza — African tech builder, AI entrepreneur.`,
    from: 'writer', sessionId: 'thread', memory: []
  });
}

async function generateLinkedInArticle(topic, targetAudience) {
  return await think({
    message: `Write a compelling LinkedIn long-form article about: "${topic}"\nTarget audience: ${targetAudience || 'tech entrepreneurs and builders'}\n\nStructure:\n1. Attention-grabbing opening (2-3 lines, no cliches)\n2. The core problem or insight\n3. Main argument with 3 supporting points\n4. Personal experience or example from Rabiu's journey building Harz Ecosystem\n5. Actionable takeaways (3 numbered)\n6. Strong closing with call to connect/follow\n\nTarget: 600-800 words. Professional but personal. Use *bold* for key headers.`,
    from: 'writer', sessionId: 'linkedin', memory: []
  });
}

// ============ AD COPY ============
async function generateAdCopy(platform, product, audience, goal) {
  const guides = {
    facebook: 'Facebook ad: Hook (1 line) + Problem (1 line) + Solution (2 lines) + Social proof + CTA button text. Max 125 chars primary text.',
    google: 'Google Search ad: 3 Headlines (max 30 chars each) + 2 Descriptions (max 90 chars each) + Display URL path',
    tiktok: 'TikTok ad script: Hook (0-3s) + Problem/Story (3-10s) + Solution reveal (10-20s) + CTA (20-30s). Conversational, native-feeling.',
    instagram: 'Instagram ad: Visual description + Caption (2-3 lines) + Hashtags (5) + CTA'
  };
  const guide = guides[platform.toLowerCase()] || `${platform} ad: compelling copy`;
  return await think({
    message: `Write a high-converting ${platform} ad for:\nProduct: ${product}\nTarget audience: ${audience || 'general'}\nGoal: ${goal || 'conversions'}\nFormat guide: ${guide}\n\nWrite 2 variants. Use *bold* for variant labels.`,
    from: 'writer', sessionId: 'adcopy', memory: []
  });
}

// ============ MISC WRITING ============
async function generatePodcastScript(topic, audience, duration = '20 minutes') {
  return await think({
    message: `Write a podcast episode script for:\nTopic: "${topic}"\nAudience: ${audience || 'tech entrepreneurs'}\nDuration: ${duration}\n\nStructure:\n- Intro hook (30 seconds)\n- Host intro (15 seconds)\n- Episode overview\n- Main content (3-4 segments with transitions)\n- Key takeaways summary\n- Outro + CTA\n\nInclude speaker cues [PAUSE], [EMPHASIS]. Write it conversationally — how people actually talk.\nContext: Hosted by Rabiu Hamza of Harz Ecosystem. Use *bold* for segment labels.`,
    from: 'writer', sessionId: 'podcast', memory: []
  });
}

async function generateYouTubeScript(title, niche) {
  return await think({
    message: `Write a YouTube video script for:\nTitle: "${title}"\nNiche: ${niche || 'tech/entrepreneurship'}\n\nStructure:\n- Hook (first 30 seconds — must stop the scroll)\n- Pattern interrupt\n- Subscribe CTA (natural)\n- Main content (5-7 sections with timestamps)\n- Engagement prompt (comment CTA)\n- Summary\n- End screen CTA\n\nStyle: energetic, educational, SEO-conscious. Add [B-ROLL] and [CUT TO] notes.\nUse *bold* for section labels.`,
    from: 'writer', sessionId: 'youtube', memory: []
  });
}

// ============ STRATEGY ============
async function getPivotAdvice(ideaDesc, problem) {
  return await think({
    message: `A startup is struggling:\nIdea: ${ideaDesc}\nProblem: ${problem}\n\nGenerate 3 distinct pivot options:\nFor each pivot:\n1. New direction (1 line)\n2. What stays the same vs what changes\n3. Target market shift\n4. Revenue model\n5. Estimated effort to execute (1-3 months, 3-6 months, 6-12 months)\n6. Risk level\n\nApply African/Nigerian market context where relevant. Use *bold* headers.`,
    from: 'strategy', sessionId: 'pivot', memory: []
  });
}

async function getMarketSizing(idea, geography) {
  return await think({
    message: `Estimate market size for: "${idea}" in ${geography || 'Nigeria/Africa'}\n\nProvide:\n1. TAM (Total Addressable Market) — global\n2. SAM (Serviceable Addressable Market) — Nigeria/Africa focus\n3. SOM (Serviceable Obtainable Market) — realistic 3-year target\n4. Key assumptions behind the estimates\n5. Main market drivers and tailwinds\n6. Biggest market risks\n\nUse real data points and comparable markets. Format: *bold* headers, specific numbers.`,
    from: 'strategy', sessionId: 'market_size', memory: []
  });
}

async function prioritizeFeatures(productName, backlogText) {
  return await think({
    message: `Prioritize this product backlog for ${productName}:\n\n${backlogText}\n\nFor each item, score:\n- Impact (1-5): How much does this move the needle?\n- Effort (1-5): How hard to build?\n- Priority score: Impact / Effort\n\nOutput a ranked table (text format) with: Rank | Feature | Impact | Effort | Score | Recommendation\nThen give your top 3 "build now" picks with reasoning. Use *bold* for headers.`,
    from: 'strategy', sessionId: 'features', memory: []
  });
}

async function getExitStrategy(platformName, currentMetrics) {
  return await think({
    message: `Build an exit strategy for: ${platformName}\nCurrent state: ${currentMetrics || 'early stage'}\n\nCover:\n1. Most likely exit paths (acquisition, merger, IPO, strategic partnership)\n2. Ideal acquirer profiles (who would buy this and why)\n3. Key metrics to hit before an exit conversation\n4. Timeline to exit readiness\n5. How to position the platform for maximum valuation\n6. Nigerian/African context (local vs international buyer)\n\nBe specific and actionable. Use *bold* headers.`,
    from: 'strategy', sessionId: 'exit', memory: []
  });
}

// ============ SECURITY ============
function analyzePasswordStrength(password) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', 'admin', 'letmein', '111111'];
  const isCommon = commonPatterns.some(p => password.toLowerCase().includes(p));

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (isCommon) score -= 3;

  const ratings = ['🔴 Very Weak', '🔴 Weak', '🟡 Fair', '🟡 Moderate', '🟢 Strong', '🟢 Very Strong', '🟢 Excellent', '🟢 Excellent'];
  const rating = ratings[Math.max(0, Math.min(score, 7))];

  let tips = [];
  if (len < 12) tips.push('Use at least 12 characters');
  if (!hasUpper) tips.push('Add uppercase letters');
  if (!hasNumber) tips.push('Add numbers');
  if (!hasSpecial) tips.push('Add special characters (!@#$)');
  if (isCommon) tips.push('Avoid common patterns');

  return `🔐 *Password Strength*\n\nRating: ${rating}\nLength: ${len} chars\n\n${tips.length ? '*Improvements:*\n' + tips.map((t,i)=>`${i+1}. ${t}`).join('\n') : '✅ This password looks solid!'}\n\n_Note: Maganu never stores your passwords_`;
}

async function getSecurityAudit(codebaseDesc) {
  return await think({
    message: `Generate a comprehensive security audit checklist for: "${codebaseDesc}"\n\nCover:\n1. Authentication & Authorization\n2. Input validation & SQL injection\n3. XSS and CSRF protection\n4. API security (rate limiting, key exposure)\n5. Data encryption (at rest + in transit)\n6. Dependency vulnerabilities\n7. Environment variable handling\n8. Logging & monitoring\n9. Third-party integrations\n10. Nigerian-specific concerns (mobile money APIs, telco integrations)\n\nFor each area: specific checks + how to fix common issues. Use *bold* headers.`,
    from: 'security', sessionId: 'audit', memory: []
  });
}

module.exports = {
  generateProposal, generateSOP, generateJobDescription, generatePressRelease, analyzeContract,
  generateEmailDrip, generateColdOutreach, generate30DayCalendar, generateNewsletter, generateThread,
  generateLinkedInArticle, generateAdCopy, generatePodcastScript, generateYouTubeScript,
  getPivotAdvice, getMarketSizing, prioritizeFeatures, getExitStrategy,
  analyzePasswordStrength, getSecurityAudit
};
