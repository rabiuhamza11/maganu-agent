// Maganu Extended Memory — Goals, Decisions, Intentions, Reviews, Personal Growth
const fs = require('fs');
const path = require('path');
const { think } = require('./brain');

const FILES = {
  goals: '/tmp/maganu_goals.json',
  decisions: '/tmp/maganu_decisions.json',
  intentions: '/tmp/maganu_intentions.json',
  reviews: '/tmp/maganu_weekly.json',
  energy: '/tmp/maganu_energy.json',
  gratitude: '/tmp/maganu_gratitude.json',
  networking: '/tmp/maganu_networking.json',
  reading: '/tmp/maganu_reading.json',
  delegation: '/tmp/maganu_delegation.json',
  morning_q: '/tmp/maganu_morning.json',
};

function load(key) {
  try { if (fs.existsSync(FILES[key])) return JSON.parse(fs.readFileSync(FILES[key], 'utf8')); } catch (_) {}
  return key === 'goals' ? [] : key === 'decisions' ? [] : [];
}

function save(key, data) {
  try { fs.writeFileSync(FILES[key], JSON.stringify(data), 'utf8'); } catch (_) {}
}

// ============ GOALS (90-day) ============
function addGoal(title, deadline, description) {
  const goals = load('goals');
  const goal = { id: Date.now(), title, description: description || '', deadline: deadline || '90 days', created: new Date().toISOString(), status: 'active', progress: 0, checkIns: [] };
  goals.push(goal);
  save('goals', goals);
  return goal;
}

function updateGoalProgress(goalId, progress, note) {
  const goals = load('goals');
  const goal = goals.find(g => String(g.id).slice(-4) === goalId || g.title.toLowerCase().includes(goalId.toLowerCase()));
  if (!goal) return null;
  goal.progress = Math.min(100, parseInt(progress) || goal.progress);
  goal.checkIns.push({ date: new Date().toISOString(), progress: goal.progress, note: note || '' });
  if (goal.progress >= 100) goal.status = 'completed';
  save('goals', goals);
  return goal;
}

function listGoals() {
  const goals = load('goals');
  if (!goals.length) return '🎯 No goals set yet.\nAdd with: /goal [title] | [deadline] | [description]';
  let msg = `🎯 *Goals Tracker*\n\n`;
  goals.filter(g => g.status === 'active').forEach(g => {
    const bar = '█'.repeat(Math.floor(g.progress / 10)) + '░'.repeat(10 - Math.floor(g.progress / 10));
    msg += `*${g.title}*\n${bar} ${g.progress}%\nDeadline: ${g.deadline}\n\n`;
  });
  const done = goals.filter(g => g.status === 'completed');
  if (done.length) msg += `✅ Completed: ${done.map(g => g.title).join(', ')}`;
  return msg;
}

// ============ DECISION LOG ============
function logDecision(decision, reasoning, alternatives) {
  const decisions = load('decisions');
  const entry = { id: Date.now(), decision, reasoning: reasoning || '', alternatives: alternatives || '', date: new Date().toISOString(), outcome: '' };
  decisions.push(entry);
  save('decisions', decisions);
  return entry;
}

function listDecisions() {
  const decisions = load('decisions');
  if (!decisions.length) return '📋 No decisions logged yet.\nUse: /decide [decision] | [reasoning] | [alternatives]';
  let msg = `📋 *Decision Log*\n\n`;
  decisions.slice(-8).reverse().forEach(d => {
    const date = new Date(d.date).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' });
    msg += `[${date}] *${d.decision}*\nReason: ${d.reasoning.slice(0, 60)}\n\n`;
  });
  return msg;
}

// ============ DAILY INTENTION ============
async function setIntention(focus) {
  const intentions = load('intentions');
  const today = new Date().toISOString().slice(0, 10);
  const entry = { date: today, focus, set: new Date().toISOString() };
  const existing = intentions.findIndex(i => i.date === today);
  if (existing >= 0) intentions[existing] = entry; else intentions.push(entry);
  save('intentions', intentions);
  const encouragement = await think({
    message: `Rabiu just set his #1 focus for today: "${focus}". Give him a 2-line powerful motivational response that acknowledges his focus and energizes him. No fluff. No emojis overload.`,
    from: 'intention', sessionId: 'intention', memory: []
  });
  return `🎯 *Today's Focus Set*\n\n"${focus}"\n\n${encouragement}`;
}

function getTodayIntention() {
  const intentions = load('intentions');
  const today = new Date().toISOString().slice(0, 10);
  const entry = intentions.find(i => i.date === today);
  return entry ? `🎯 *Today's Focus*\n\n"${entry.focus}"` : '🎯 No intention set today.\nUse: /focus [your #1 priority]';
}

// ============ WEEKLY REVIEW ============
async function generateWeeklyReview() {
  const goals = load('goals');
  const decisions = load('decisions');
  const intentions = load('intentions');
  const lastWeek = intentions.slice(-7);
  const week = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', month: 'long', day: 'numeric', year: 'numeric' });

  const context = `Week ending ${week}\nActive goals: ${goals.filter(g=>g.status==='active').map(g=>`${g.title} (${g.progress}%)`).join(', ')||'None'}\nRecent decisions: ${decisions.slice(-3).map(d=>d.decision).join(', ')||'None'}\nThis week's focuses: ${lastWeek.map(i=>i.focus).join(', ')||'None'}`;

  return await think({
    message: `Generate a structured weekly review for Rabiu Hamza based on this context:\n${context}\n\nStructure:\n1. *Wins This Week* (3 items — infer from goals/focus)\n2. *What Could Have Gone Better* (2 items)\n3. *Key Lessons* (2 items)\n4. *Next Week's Priorities* (3 items)\n5. *One Insight for the Journey*\n\nBe direct, honest, and actionable. This is his personal reflection. Use *bold* headers.`,
    from: 'review', sessionId: 'weekly_review', memory: []
  });
}

// ============ ENERGY TRACKER ============
function logEnergy(level, note) {
  const energy = load('energy');
  const time = new Date().toISOString();
  const entry = { level: parseInt(level), note: note || '', time, date: time.slice(0, 10), hour: new Date().getHours() };
  if (!Array.isArray(energy)) { save('energy', [entry]); return entry; }
  energy.push(entry);
  save('energy', energy);
  return entry;
}

function getEnergyReport() {
  const data = load('energy');
  if (!Array.isArray(data) || !data.length) return '⚡ No energy logs yet.\nUse: /energy [1-10] [optional note]';
  const recent = data.slice(-14);
  const avg = (recent.reduce((s, e) => s + e.level, 0) / recent.length).toFixed(1);
  const peak = recent.reduce((best, e) => e.level > best.level ? e : best, recent[0]);
  const low = recent.reduce((worst, e) => e.level < worst.level ? e : worst, recent[0]);
  const peakHour = peak?.hour >= 12 ? `${peak.hour-12||12}PM` : `${peak.hour||12}AM`;
  return `⚡ *Energy Report (14-day)*\n\nAverage: ${avg}/10\nPeak: ${peak?.level}/10 at ${peakHour}\nLowest: ${low?.level}/10\nLogs: ${recent.length}\n\n_Log 3x/day for pattern insights_`;
}

// ============ GRATITUDE LOG ============
function logGratitude(entry1, entry2, entry3) {
  const data = load('gratitude') || [];
  const today = new Date().toISOString().slice(0, 10);
  const entry = { date: today, items: [entry1, entry2, entry3].filter(Boolean), time: new Date().toISOString() };
  const existing = data.findIndex(d => d.date === today);
  if (existing >= 0) data[existing] = entry; else data.push(entry);
  save('gratitude', data);
  return `🙏 *Gratitude Logged*\n\n1. ${entry1 || '-'}\n2. ${entry2 || '-'}\n3. ${entry3 || '-'}\n\n_${data.length} days logged total_`;
}

// ============ NETWORKING TRACKER ============
function logConnection(name, role, context, followup) {
  const data = load('networking') || [];
  const entry = { id: Date.now(), name, role: role || '', context: context || '', followup: followup || '', date: new Date().toISOString() };
  data.push(entry);
  save('networking', data);
  return entry;
}

function listConnections() {
  const data = load('networking') || [];
  if (!data.length) return '🤝 No connections logged yet.\nUse: /connect [name] | [role] | [context] | [follow-up]';
  let msg = `🤝 *Network Tracker (${data.length} connections)*\n\n`;
  data.slice(-8).reverse().forEach(c => {
    const date = new Date(c.date).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' });
    msg += `*${c.name}* — ${c.role}\n[${date}] ${c.context.slice(0, 50)}\n`;
    if (c.followup) msg += `→ Follow-up: ${c.followup}\n`;
    msg += '\n';
  });
  return msg;
}

// ============ READING TRACKER ============
function logBook(title, author, rating, review) {
  const data = load('reading') || [];
  const entry = { id: Date.now(), title, author: author || '', rating: parseInt(rating) || 0, review: review || '', date: new Date().toISOString(), status: 'completed' };
  data.push(entry);
  save('reading', data);
  return entry;
}

function listBooks() {
  const data = load('reading') || [];
  if (!data.length) return '📚 No books logged yet.\nUse: /book [title] | [author] | [rating 1-5] | [one-line review]';
  let msg = `📚 *Reading Log (${data.length} books)*\n\n`;
  const stars = n => '⭐'.repeat(n);
  data.slice(-8).reverse().forEach(b => {
    msg += `${stars(b.rating)} *${b.title}*\nby ${b.author}\n${b.review.slice(0, 80)}\n\n`;
  });
  return msg;
}

// ============ DELEGATION TRACKER ============
function logDelegation(task, assignee, deadline, note) {
  const data = load('delegation') || [];
  const entry = { id: Date.now(), task, assignee, deadline: deadline || 'Not set', note: note || '', status: 'pending', created: new Date().toISOString() };
  data.push(entry);
  save('delegation', data);
  return entry;
}

function listDelegations() {
  const data = load('delegation') || [];
  const active = data.filter(d => d.status === 'pending');
  if (!active.length) return '📌 No delegated tasks pending.';
  let msg = `📌 *Delegated Tasks (${active.length})*\n\n`;
  active.forEach(d => { msg += `*${d.task}*\nTo: ${d.assignee} | Due: ${d.deadline}\n${d.note ? 'Note: ' + d.note : ''}\n\n`; });
  return msg;
}

function completeDelegation(taskSnippet) {
  const data = load('delegation') || [];
  const entry = data.find(d => d.task.toLowerCase().includes(taskSnippet.toLowerCase()) && d.status === 'pending');
  if (!entry) return null;
  entry.status = 'completed';
  entry.completedAt = new Date().toISOString();
  save('delegation', data);
  return entry;
}

// ============ MORNING QUESTIONS ============
async function getMorningQuestions() {
  const questions = [
    ['What is the ONE thing I must accomplish today?', 'What would make today a great day?', 'What am I grateful for right now?'],
    ['What do I need to say no to today to protect my focus?', 'What fear am I going to face today?', 'How will I show up for my future self today?'],
    ['What decision have I been avoiding that I\'ll make today?', 'What skill will I practice or deepen today?', 'Who can I add value to today?'],
    ['What does success look like at the end of today?', 'What energy am I bringing into my work today?', 'What assumption am I challenging today?'],
    ['What would I do today if I knew I couldn\'t fail?', 'What\'s the smallest step toward my biggest goal?', 'What mindset do I need to carry today?'],
  ];
  const dayOfWeek = new Date().getDay();
  const qs = questions[dayOfWeek % questions.length];
  const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric' });
  return `🌅 *Morning Questions — ${date}*\n\nTake 5 minutes. Answer honestly.\n\n1. ${qs[0]}\n\n2. ${qs[1]}\n\n3. ${qs[2]}\n\n_Write your answers below or in your journal._`;
}

module.exports = {
  addGoal, updateGoalProgress, listGoals,
  logDecision, listDecisions,
  setIntention, getTodayIntention,
  generateWeeklyReview,
  logEnergy, getEnergyReport,
  logGratitude,
  logConnection, listConnections,
  logBook, listBooks,
  logDelegation, listDelegations, completeDelegation,
  getMorningQuestions
};
