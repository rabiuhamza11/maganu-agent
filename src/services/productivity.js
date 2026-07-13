// Productivity & habit tracking service
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/productivity.json');

function loadData() {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (_) {}
  return { timers: {}, journal: [], wins: [], focus_sessions: 0, streak: 0, last_checkin: null };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (_) {}
}

function startTimer(sessionId, task) {
  const data = loadData();
  data.timers[sessionId] = { task, start: Date.now(), type: 'pomodoro' };
  saveData(data);
  return `⏱️ *Pomodoro Started*\n\nTask: ${task}\nDuration: 25 minutes\nEnd time: ${new Date(Date.now() + 25*60*1000).toLocaleTimeString('en-NG')}\n\nFocus up. No distractions. 🔴\nType /timer status to check, /timer stop to end early.`;
}

function checkTimer(sessionId) {
  const data = loadData();
  const t = data.timers[sessionId];
  if (!t) return '⏱️ No active timer. Start one: /timer [task]';
  const elapsed = Math.floor((Date.now() - t.start) / 60000);
  const remaining = Math.max(0, 25 - elapsed);
  if (remaining === 0) {
    delete data.timers[sessionId];
    data.focus_sessions = (data.focus_sessions || 0) + 1;
    saveData(data);
    return `✅ *Pomodoro Complete!*\n\nTask: ${t.task}\nSession #${data.focus_sessions} done 🎉\n\nTake a 5-min break. Then /timer [next task]`;
  }
  return `⏱️ *Timer Running*\n\nTask: ${t.task}\nElapsed: ${elapsed}m | Remaining: ${remaining}m\nSessions today: ${data.focus_sessions || 0}\n\nStay focused. 🔴`;
}

function stopTimer(sessionId) {
  const data = loadData();
  const t = data.timers[sessionId];
  if (!t) return 'No active timer.';
  const elapsed = Math.floor((Date.now() - t.start) / 60000);
  delete data.timers[sessionId];
  saveData(data);
  return `⏹️ Timer stopped.\nTask: ${t.task}\nTime spent: ${elapsed} minutes`;
}

function addWin(win) {
  const data = loadData();
  data.wins = data.wins || [];
  data.wins.push({ text: win, date: new Date().toISOString() });
  saveData(data);
  return `🏆 Win logged!\n"${win}"\n\nTotal wins recorded: ${data.wins.length}\nType /wins to see all.`;
}

function getWins(limit = 10) {
  const data = loadData();
  const wins = (data.wins || []).slice(-limit).reverse();
  if (!wins.length) return '🏆 No wins logged yet.\nAdd one: /win [what you accomplished]';
  let msg = `🏆 *Your Recent Wins (${wins.length})*\n\n`;
  wins.forEach((w, i) => {
    const d = new Date(w.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
    msg += `${i+1}. ${w.text} _(${d})_\n`;
  });
  return msg;
}

function addJournal(entry) {
  const data = loadData();
  data.journal = data.journal || [];
  const today = new Date().toISOString().split('T')[0];
  data.journal.push({ entry, date: today, time: new Date().toISOString() });
  saveData(data);
  return `📖 Journal entry saved.\nDate: ${today}\nEntries total: ${data.journal.length}`;
}

function getJournal(days = 3) {
  const data = loadData();
  const journal = (data.journal || []).slice(-days * 2).reverse();
  if (!journal.length) return '📖 No journal entries yet.\nAdd one: /journal [your thoughts]';
  let msg = `📖 *Recent Journal*\n\n`;
  journal.forEach(j => {
    msg += `📅 ${j.date}\n${j.entry}\n\n`;
  });
  return msg.trim();
}

function getProductivityStats() {
  const data = loadData();
  return `📊 *Productivity Stats*\n\nFocus sessions: ${data.focus_sessions || 0}\nWins logged: ${(data.wins||[]).length}\nJournal entries: ${(data.journal||[]).length}\nActive timers: ${Object.keys(data.timers||{}).length}\n\nKeep building. 💪`;
}

module.exports = { startTimer, checkTimer, stopTimer, addWin, getWins, addJournal, getJournal, getProductivityStats };
