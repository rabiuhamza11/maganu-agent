// Maganu Research & Analysis Engine
const axios = require('axios');
const { think } = require('./brain');

// ============ DEEP WEB RESEARCH ============
async function deepResearch(query) {
  try {
    // Multi-source DuckDuckGo search
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, { timeout: 10000 });
    const data = res.data;

    let rawData = '';
    if (data.AbstractText) rawData += `Summary: ${data.AbstractText}\n\n`;
    if (data.Abstract) rawData += `Source: ${data.AbstractSource}\n`;
    if (data.RelatedTopics?.length) {
      rawData += 'Related:\n';
      data.RelatedTopics.slice(0, 5).forEach(t => {
        if (t.Text) rawData += `- ${t.Text}\n`;
      });
    }
    if (data.Results?.length) {
      rawData += '\nTop Results:\n';
      data.Results.slice(0, 3).forEach(r => rawData += `- ${r.Text}: ${r.FirstURL}\n`);
    }

    if (!rawData.trim()) rawData = `No direct results found for: ${query}`;

    // AI synthesis
    const synthesis = await think({
      message: `Research query: "${query}"\n\nRaw data found:\n${rawData}\n\nProvide a comprehensive, expert-level synthesis. Add context from your knowledge base. Be specific and actionable. Format for Telegram with *bold* headers.`,
      from: 'research', sessionId: 'research', memory: []
    });

    return synthesis;
  } catch (err) {
    // Fallback to pure AI knowledge
    return await think({
      message: `Deep research on: "${query}"\n\nProvide a comprehensive expert analysis from your knowledge base. Be specific, cite frameworks and data where relevant. Format with *bold* headers.`,
      from: 'research', sessionId: 'research', memory: []
    });
  }
}

// ============ COMPETITOR ANALYSIS ============
async function analyzeCompetitor(company) {
  const analysis = await think({
    message: `Perform a thorough competitor analysis of: "${company}"\n\nCover:\n1. Business model and revenue streams\n2. Target market and positioning\n3. Key strengths and weaknesses\n4. Technology stack (if known)\n5. Market share and growth trajectory\n6. How Rabiu's Harz Ecosystem platforms compare or can compete\n\nBe specific. Use *bold* for section headers.`,
    from: 'research', sessionId: 'competitor_analysis', memory: []
  });
  return analysis;
}

// ============ CODE REVIEW ============
async function reviewCode(code) {
  const review = await think({
    message: `Perform a thorough code review of the following code:\n\n\`\`\`\n${code}\n\`\`\`\n\nAnalyze:\n1. Bugs and potential runtime errors\n2. Security vulnerabilities\n3. Performance issues\n4. Code quality and readability\n5. Suggested improvements with corrected code\n\nBe specific. Use *bold* for section headers.`,
    from: 'code_review', sessionId: 'code_review', memory: []
  });
  return review;
}

// ============ ARCHITECTURE REVIEW ============
async function reviewArchitecture(description) {
  const review = await think({
    message: `Perform a full technical architecture review of the following system:\n\n${description}\n\nAnalyze:\n1. Scalability and bottlenecks\n2. Single points of failure\n3. Security surface area\n4. Cost efficiency\n5. Technology choices vs alternatives\n6. Recommended improvements with rationale\n\nBe specific and expert-level. Use *bold* for section headers.`,
    from: 'arch_review', sessionId: 'arch_review', memory: []
  });
  return review;
}

// ============ DOCUMENT SUMMARIZER ============
async function summarizeDocument(text) {
  const wordCount = text.split(' ').length;
  const summary = await think({
    message: `Summarize the following document (${wordCount} words) into a concise, actionable brief:\n\n${text.slice(0, 4000)}\n\nProvide:\n1. One-paragraph executive summary\n2. Key points (max 5)\n3. Action items or decisions needed\n\nUse *bold* for headers.`,
    from: 'summarizer', sessionId: 'summarizer', memory: []
  });
  return summary;
}

// ============ SENTIMENT ANALYSIS ============
function analyzeSentiment(text) {
  const urgentWords = ['urgent', 'asap', 'emergency', 'broken', 'down', 'critical', 'help', 'stuck', 'fail', 'crash', 'problem', 'error', 'fix'];
  const stressWords = ['stressed', 'tired', 'overwhelmed', 'frustrated', 'angry', 'worried', 'anxious'];
  const positiveWords = ['great', 'amazing', 'perfect', 'love', 'excellent', 'good', 'nice', 'thanks'];

  const lower = text.toLowerCase();
  const isUrgent = urgentWords.some(w => lower.includes(w));
  const isStressed = stressWords.some(w => lower.includes(w));
  const isPositive = positiveWords.some(w => lower.includes(w));

  if (isUrgent) return { tone: 'urgent', emoji: '🚨', prefix: 'On it right now — ' };
  if (isStressed) return { tone: 'stressed', emoji: '🤝', prefix: 'Understood, let\'s sort this out — ' };
  if (isPositive) return { tone: 'positive', emoji: '🔥', prefix: '' };
  return { tone: 'neutral', emoji: '', prefix: '' };
}

module.exports = { deepResearch, analyzeCompetitor, reviewCode, reviewArchitecture, summarizeDocument, analyzeSentiment };
