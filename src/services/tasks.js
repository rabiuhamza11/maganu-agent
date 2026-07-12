// Maganu Task Manager — persistent daily tasks
const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join('/tmp', 'maganu_tasks.json');

function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch (_) {}
  return [];
}

function saveTasks(tasks) {
  try { fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks), 'utf8'); } catch (_) {}
}

function addTask(text) {
  const tasks = loadTasks();
  const task = { id: Date.now(), text, done: false, created: new Date().toISOString() };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

function completeTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === Number(id) || String(t.id).endsWith(String(id)));
  if (!task) return null;
  task.done = true;
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);
  return task;
}

function deleteTask(id) {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === Number(id) || String(t.id).endsWith(String(id)));
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  saveTasks(tasks);
  return true;
}

function listTasks() {
  const tasks = loadTasks();
  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  return { pending, done, total: tasks.length };
}

function clearCompleted() {
  const tasks = loadTasks().filter(t => !t.done);
  saveTasks(tasks);
  return tasks.length;
}

function formatTaskList() {
  const { pending, done } = listTasks();
  let msg = `📋 *Task Manager*\n\n`;
  if (!pending.length && !done.length) return msg + 'No tasks yet. Add one with: /addtask Buy groceries';

  if (pending.length) {
    msg += `*Pending (${pending.length}):*\n`;
    pending.forEach((t, i) => {
      const shortId = String(t.id).slice(-4);
      msg += `${i + 1}. [${shortId}] ${t.text}\n`;
    });
  }
  if (done.length) {
    msg += `\n*Done (${done.length}):*\n`;
    done.slice(-5).forEach(t => { msg += `✅ ~${t.text}~\n`; });
  }
  msg += `\nTo complete: /done [id] | To delete: /deltask [id]`;
  return msg;
}

module.exports = { addTask, completeTask, deleteTask, listTasks, clearCompleted, formatTaskList };
