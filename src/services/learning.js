// Maganu Learning Engine — Daily digest, skill coach, flashcards, book recs
const { think } = require('./brain');

// Daily tech digest
async function getDailyTechDigest() {
  const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric' });
  return await think({
    message: `Generate a sharp daily tech and AI digest for ${date}. Cover:\n1. Most important AI/LLM development this week\n2. One key software engineering insight\n3. One African tech/startup news item\n4. One tool or framework worth knowing\n5. One-line "thought of the day" on building in the AI era\n\nBe specific, factual, and concise. Format with *bold* headers for Telegram.`,
    from: 'digest', sessionId: 'tech_digest', memory: []
  });
}

// Skill of the week
const SKILLS = [
  'TypeScript advanced types and generics',
  'PostgreSQL query optimization and indexing',
  'Redis caching strategies for Node.js',
  'Docker multi-stage builds',
  'Nginx reverse proxy configuration',
  'React Server Components architecture',
  'API rate limiting strategies',
  'Stripe webhook idempotency',
  'GitHub Actions CI/CD pipelines',
  'Prisma ORM advanced patterns',
  'JWT authentication best practices',
  'MongoDB aggregation pipelines',
  'WebSocket real-time architecture',
  'Microservices communication patterns',
  'SEO optimization for Next.js',
  'Paystack API integration patterns',
  'SaaS pricing psychology',
  'Product-led growth strategies',
  'African market digital product strategy',
  'No-code tool monetization',
  'LLM prompt engineering',
  'RAG (Retrieval Augmented Generation)',
  'Vector databases (pgvector)',
  'Building AI agents from scratch',
  'Groq vs OpenAI latency optimization'
];

async function getSkillLesson() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const skill = SKILLS[weekNum % SKILLS.length];
  return await think({
    message: `Teach me "${skill}" in a practical, hands-on way. Include:\n1. What it is and why it matters (2-3 lines)\n2. Core concept explained simply\n3. A practical code example or step-by-step\n4. One common mistake to avoid\n5. Next step to practice it today\n\nFormat with *bold* headers. Keep it actionable and concise.`,
    from: 'learning', sessionId: 'skill_coach', memory: []
  });
}

// Flashcard quiz from OMEGA knowledge
const FLASHCARD_TOPICS = [
  { q: 'What is the Riemann Hypothesis?', a: 'All non-trivial zeros of the Riemann zeta function ζ(s) have real part = 1/2. Unproven. Worth $1M Clay prize.' },
  { q: 'What does CRISPR-Cas9 do?', a: 'Guide RNA directs the Cas9 nuclease to a target DNA sequence where it makes a precise cut, enabling gene editing.' },
  { q: 'What is a Hohmann transfer orbit?', a: 'The minimum energy trajectory between two circular orbits. Earth to Mars takes 7-9 months and windows open every 26 months.' },
  { q: 'What is CAP theorem?', a: 'A distributed system can only guarantee 2 of 3: Consistency, Availability, Partition tolerance. Not all 3 simultaneously.' },
  { q: 'What is LTP in neuroscience?', a: 'Long-Term Potentiation — the strengthening of synapses based on repeated activity. The cellular mechanism of learning and memory.' },
  { q: 'What is the Sabatier reaction?', a: 'CO2 + 4H2 → CH4 + 2H2O. Used on Mars to produce methane fuel and water from the CO2 atmosphere.' },
  { q: 'What is post-quantum cryptography?', a: 'Cryptographic algorithms resistant to quantum computer attacks. Examples: CRYSTALS-Kyber (lattice-based), XMSS (hash-based).' },
  { q: 'What is the Rule of 40 for SaaS?', a: 'A healthy SaaS company\'s revenue growth rate + profit margin should be ≥ 40%. Balances growth vs profitability.' },
  { q: 'What is neuroplasticity?', a: 'The brain\'s ability to reorganize itself by forming new neural connections throughout life — especially through learning and practice.' },
  { q: 'What is dark energy?', a: 'A hypothetical form of energy (~68% of universe) causing accelerating expansion. Described by Einstein\'s cosmological constant Λ.' },
  { q: 'What is game theory\'s Nash Equilibrium?', a: 'A state where no player can benefit by changing strategy while others keep theirs unchanged. Named after John Nash.' },
  { q: 'What is the Paystack webhook flow?', a: 'Customer pays → Paystack triggers POST to your webhook URL → you verify signature with HMAC-SHA512 → update DB → return 200.' },
  { q: 'What is RAG in AI?', a: 'Retrieval-Augmented Generation — LLM answers are grounded by fetching relevant chunks from a knowledge base before generation.' },
  { q: 'What is Nigeria\'s VAT rate?', a: '7.5% (raised from 5% in 2020 by Finance Act). Applied to most goods and services. Threshold: ₦25M annual turnover.' },
  { q: 'What is SaaS NRR (Net Dollar Retention)?', a: 'Revenue from existing customers at end of period / start of period. > 100% means expansions exceed churn. Best SaaS: 120%+.' }
];

function getFlashcard() {
  const idx = Math.floor(Date.now() / (4 * 60 * 60 * 1000)) % FLASHCARD_TOPICS.length;
  return FLASHCARD_TOPICS[idx];
}

// Book recommendations
async function getBookRec(context) {
  return await think({
    message: `Recommend 3 books for someone who is: ${context}\n\nFor each book:\n1. Title and Author\n2. One-line core insight\n3. Why it applies specifically to this person's context\n\nPrioritize books with real, actionable impact. Mix business, technical, and personal development.`,
    from: 'learning', sessionId: 'book_rec', memory: []
  });
}

// Product launch plan
async function generateLaunchPlan(productName, description) {
  return await think({
    message: `Generate a complete product launch plan for:\nProduct: ${productName}\nDescription: ${description}\n\nCover:\n1. Pre-launch (2 weeks before): actions and content\n2. Launch day: announcement strategy and channels\n3. Post-launch (week 1): user acquisition and feedback\n4. Growth (month 1): retention and expansion\n5. Key metrics to track\n\nApply Nigerian/African market context where relevant. Be specific and actionable. Use *bold* headers.`,
    from: 'business', sessionId: 'launch_plan', memory: []
  });
}

// Pricing advisor
async function getPricingAdvice(product, revenueGoal, costPerUser) {
  return await think({
    message: `Give pricing strategy advice for:\nProduct: ${product}\nMonthly revenue goal: ${revenueGoal}\nCost per user/month: ${costPerUser}\n\nProvide:\n1. Recommended price tiers (with rationale)\n2. Pricing psychology tactics\n3. Break-even analysis\n4. Freemium vs paid-only recommendation\n5. Nigerian market pricing considerations\n\nBe specific with numbers. Use *bold* headers.`,
    from: 'business', sessionId: 'pricing', memory: []
  });
}

// A/B test copy generator
async function generateABTest(product, targetAudience) {
  return await think({
    message: `Generate 2 A/B test variants for a landing page headline and CTA for:\nProduct: ${product}\nTarget audience: ${targetAudience}\n\nFor each variant:\n1. Hero headline (max 10 words)\n2. Sub-headline (max 20 words)\n3. CTA button text (max 5 words)\n4. Value proposition angle being tested\n\nMake the variants meaningfully different (e.g. pain-focused vs benefit-focused).`,
    from: 'business', sessionId: 'ab_test', memory: []
  });
}

// Business name generator
async function generateBusinessNames(idea, industry) {
  return await think({
    message: `Generate 8 creative business/brand names for:\nIdea: ${idea}\nIndustry: ${industry}\n\nFor each name:\n1. The name\n2. Why it works (1 line)\n3. Domain availability guess (common endings: .com .ai .io .ng)\n\nMix: tech-forward names, African-inspired names, and globally neutral names.`,
    from: 'business', sessionId: 'names', memory: []
  });
}

// Habit tracker
const HABITS_FILE = require('path').join('/tmp', 'maganu_habits.json');
const fs = require('fs');

function loadHabits() {
  try { if (fs.existsSync(HABITS_FILE)) return JSON.parse(fs.readFileSync(HABITS_FILE, 'utf8')); } catch (_) {}
  return { habits: [], logs: [] };
}

function saveHabits(data) {
  try { fs.writeFileSync(HABITS_FILE, JSON.stringify(data), 'utf8'); } catch (_) {}
}

function addHabit(name) {
  const data = loadHabits();
  const habit = { id: Date.now(), name, streak: 0, created: new Date().toISOString() };
  data.habits.push(habit);
  saveHabits(data);
  return habit;
}

function logHabit(habitName) {
  const data = loadHabits();
  const today = new Date().toISOString().slice(0, 10);
  const habit = data.habits.find(h => h.name.toLowerCase().includes(habitName.toLowerCase()));
  if (!habit) return null;
  const alreadyLogged = data.logs.some(l => l.habitId === habit.id && l.date === today);
  if (!alreadyLogged) {
    data.logs.push({ habitId: habit.id, date: today });
    habit.streak = (habit.streak || 0) + 1;
    saveHabits(data);
  }
  return { habit, alreadyLogged };
}

function getHabitReport() {
  const data = loadHabits();
  if (!data.habits.length) return '📊 No habits tracked yet.\nAdd with: /addhabit Exercise\nLog with: /habit Exercise';
  let msg = `📊 *Habit Tracker*\n\n`;
  data.habits.forEach(h => {
    const streak = h.streak || 0;
    const fire = streak >= 7 ? '🔥' : streak >= 3 ? '✅' : '⭕';
    msg += `${fire} ${h.name} — ${streak} day streak\n`;
  });
  return msg;
}

module.exports = { getDailyTechDigest, getSkillLesson, getFlashcard, getBookRec, generateLaunchPlan, getPricingAdvice, generateABTest, generateBusinessNames, addHabit, logHabit, getHabitReport };
