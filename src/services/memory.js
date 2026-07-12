// Persistent memory using a simple JSON file store
// Falls back to in-memory if file system is unavailable

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join('/tmp', 'maganu_memory.json');
const MAX_MEMORY = 30;

function loadAll() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function saveAll(data) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data), 'utf8');
  } catch (_) {}
}

function getMemory(sessionId) {
  const all = loadAll();
  return all[sessionId] || [];
}

function addToMemory(sessionId, message) {
  const all = loadAll();
  const mem = all[sessionId] || [];
  mem.push(message);
  if (mem.length > MAX_MEMORY) mem.splice(0, mem.length - MAX_MEMORY);
  all[sessionId] = mem;
  saveAll(all);
}

function clearMemory(sessionId) {
  const all = loadAll();
  delete all[sessionId];
  saveAll(all);
}

function getAllSessions() {
  return Object.keys(loadAll());
}

module.exports = { getMemory, addToMemory, clearMemory, getAllSessions };
