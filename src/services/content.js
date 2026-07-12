// Maganu Content Generator — social posts, promos, book chapters
const { think } = require('./brain');

const BOOK_CHAPTERS = [
  { day: 1, title: "The Power of Beginning", content: "Every great achievement starts with a single decision to begin. Today, choose one thing you've been postponing and start it — even if imperfectly. Action creates momentum. Perfection is the enemy of progress.", action: "Write down one thing you'll start TODAY — not tomorrow." },
  { day: 2, title: "Clarity Is Power", content: "A confused mind does nothing. The clearest people achieve the most because they know exactly what they want. Vagueness kills dreams before they start.", action: "Define your top 3 goals for this year in one sentence each." },
  { day: 3, title: "Build Systems, Not Goals", content: "Goals tell you where to go. Systems get you there. A goal without a system is just a wish. Build daily habits that automatically produce results.", action: "Design one daily system that moves you toward your most important goal." },
  { day: 4, title: "The Compound Effect", content: "Small consistent actions compound into extraordinary results. 1% better every day = 37x better in a year. Most people overestimate what they can do in a day and underestimate what they can do in a year.", action: "Choose one skill and commit to 30 minutes of deliberate practice daily." },
  { day: 5, title: "Own Your Morning", content: "Win the morning, win the day. The first 60 minutes set the tone for everything that follows. Protect your morning from notifications, news, and other people's agendas.", action: "Design a 30-minute morning routine that energizes and focuses you." },
  { day: 6, title: "The Art of Deep Work", content: "Shallow work is busy work. Deep work creates breakthroughs. Protect blocks of time for undistracted, focused effort on your most important tasks. This is where real progress happens.", action: "Schedule two 90-minute deep work blocks this week. Guard them fiercely." },
  { day: 7, title: "Your Network Is Your Net Worth", content: "The quality of your relationships determines the quality of your life. Invest in people who inspire, challenge, and support you. Be intentional about who you spend time with.", action: "Reach out to one person you admire and start a genuine conversation." },
  { day: 8, title: "Embrace Discomfort", content: "Growth lives outside your comfort zone. Every time you feel uncomfortable, you're at the edge of your growth. Lean in. The discomfort is temporary; the growth is permanent.", action: "Do one uncomfortable thing today that your future self will thank you for." },
  { day: 9, title: "Master Your Money", content: "Financial freedom is built one decision at a time. Know where every naira goes. Save before you spend. Invest in assets that work for you while you sleep.", action: "Track every expense today. Identify one unnecessary spend to cut." },
  { day: 10, title: "Think Long-Term", content: "Most people make short-term decisions that destroy long-term outcomes. Train your mind to ask: 'How will this choice affect me in 5 years?' Long-term thinking is a superpower.", action: "Write a letter to your 5-year-future self about what you're building today." }
];

function getChapterByDay(day) {
  const index = ((day - 1) % 365) % BOOK_CHAPTERS.length;
  const chapter = BOOK_CHAPTERS[index] || BOOK_CHAPTERS[0];
  return `📖 *The Complete Genius 365*\n*Day ${day}: ${chapter.title}*\n\n${chapter.content}\n\n*Today's Action:*\n${chapter.action}`;
}

function getTodayChapter() {
  const startDate = new Date('2026-06-04');
  const today = new Date();
  const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const day = Math.max(1, dayDiff);
  return getChapterByDay(day);
}

async function generateSocialPost(platform, topic, tone = 'engaging') {
  const platformGuides = {
    twitter: 'Twitter/X: max 280 chars, punchy, use 1-2 hashtags',
    instagram: 'Instagram: 150-200 words, storytelling style, 5-10 hashtags at end',
    linkedin: 'LinkedIn: professional, 200-300 words, business insight, no hashtags spam',
    whatsapp: 'WhatsApp: conversational, 3-4 lines max, no hashtags, casual tone',
    tiktok: 'TikTok: hook in first line, energetic, 3-5 hashtags, call to action'
  };

  const guide = platformGuides[platform.toLowerCase()] || `${platform}: standard social media post`;

  const post = await think({
    message: `Write a ${tone} social media post for ${platform} about: ${topic}. Platform guide: ${guide}. Make it authentic and valuable. Do NOT use markdown headers.`,
    from: 'content_gen',
    sessionId: 'content_generator',
    memory: []
  });

  return post;
}

async function generatePromoPost(platformName, description, url) {
  return await think({
    message: `Write a short, punchy promotional post for *${platformName}* for a WhatsApp business channel. Description: ${description}. URL: ${url}. Make it exciting and direct — 3-4 lines only. End with the URL on its own line. No markdown headers.`,
    from: 'promo_gen',
    sessionId: 'promo_generator',
    memory: []
  });
}

const ECOSYSTEM_PLATFORMS = [
  { name: 'HarzDM Marketplace', desc: 'Global digital marketplace — buy and sell digital products. Sellers keep 90%.', url: 'https://harzdm-marketplace.vercel.app' },
  { name: 'OMEGA INFINITY 1000', desc: 'Enterprise AI monorepo with 10 AI agent roles for full-stack development.', url: 'https://omega-infinity-dashboard.vercel.app' },
  { name: 'TradeOS', desc: 'Multi-platform trading system with real-time market data from global exchanges.', url: 'https://tradeos-dashboard-fawn.vercel.app' },
  { name: 'BuildBot AI', desc: 'AI construction planning for Nigeria. Get complete building plans from ₦15,000/mo.', url: 'https://superagent-2286fb2f.base44.app/functions/buildbotAI' },
  { name: 'ContentPilot AI', desc: 'AI content agent for video generation, trend analysis, and social scheduling.', url: 'https://superagent-2286fb2f.base44.app/functions/contentPilotDashboard' },
  { name: 'Abuja Estate City AI', desc: 'Smart real estate marketplace for Abuja — properties, professionals, materials.', url: 'https://abuja-estate-city-ai.vercel.app' },
  { name: 'Nexal Media', desc: 'Ad publishing across 6 social platforms. Packages from ₦15,000.', url: 'https://superagent-2286fb2f.base44.app/functions/nexalMedia' },
  { name: 'DeployForge', desc: 'Multi-platform deployment engine — GitHub, Vercel, Render, Netlify, Railway in one click.', url: 'https://github.com/rabiuhamza11/deployforge' },
  { name: 'Nigerian Number Lookup', desc: 'Instant Nigerian phone number network detection — MTN, Airtel, Glo, 9mobile.', url: 'https://superagent-2286fb2f.base44.app/functions/nigerianNumberLookup' },
  { name: 'OMEGA DocMaster X', desc: 'AI-powered documentation terminal with RAG search for the Harz Ecosystem.', url: 'https://superagent-2286fb2f.base44.app/functions/omegaDocmasterX' }
];

function getTodayPromoTarget() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return ECOSYSTEM_PLATFORMS[day % ECOSYSTEM_PLATFORMS.length];
}

module.exports = { getChapterByDay, getTodayChapter, generateSocialPost, generatePromoPost, getTodayPromoTarget, ECOSYSTEM_PLATFORMS };
