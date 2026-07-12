// Maganu Persistent Memory — Enhanced
// Stores per-session conversation history with long-term summary extraction
// Uses file system (falls back to in-memory on read-only fs like Render)

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join('/tmp', 'maganu_memory.json');
const SUMMARY_FILE = path.join('/tmp', 'maganu_summaries.json');

// Per-session rolling window — keep last 40 messages (was 30)
const MAX_MESSAGES = 40;
// How many raw messages to pass to LLM — was 12, now 24
const CONTEXT_WINDOW = 24;

// ─── File helpers ───────────────────────────────────────────────────────────

function load(file) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {}
  return {};
}

function save(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

// ─── Session memory ─────────────────────────────────────────────────────────

function getMemory(sessionId) {
  return load(MEMORY_FILE)[sessionId] || [];
}

function addToMemory(sessionId, message) {
  const all = load(MEMORY_FILE);
  const mem = all[sessionId] || [];
  mem.push(message);
  // Keep rolling window
  if (mem.length > MAX_MESSAGES) mem.splice(0, mem.length - MAX_MESSAGES);
  all[sessionId] = mem;
  save(MEMORY_FILE, all);
}

function clearMemory(sessionId) {
  const all = load(MEMORY_FILE);
  delete all[sessionId];
  save(MEMORY_FILE, all);
  // Also clear summary
  const summaries = load(SUMMARY_FILE);
  delete summaries[sessionId];
  save(SUMMARY_FILE, summaries);
}

function getAllSessions() {
  return Object.keys(load(MEMORY_FILE));
}

// ─── Long-term summary ──────────────────────────────────────────────────────
// We store a running plain-text summary of what Maganu knows about each session.
// This survives even when the rolling window gets full.

function getSummary(sessionId) {
  return load(SUMMARY_FILE)[sessionId] || null;
}

function setSummary(sessionId, text) {
  const summaries = load(SUMMARY_FILE);
  summaries[sessionId] = {
    text,
    updated: new Date().toISOString(),
    messageCount: getMemory(sessionId).length
  };
  save(SUMMARY_FILE, summaries);
}

// ─── Context builder ────────────────────────────────────────────────────────
// Returns the optimal context to inject into the LLM prompt.
// Includes: optional long-term summary injection + last N raw messages.

function buildContext(sessionId) {
  const mem = getMemory(sessionId);
  const summary = getSummary(sessionId);

  const context = [];

  // Inject summary as a system-style memory block if it exists
  if (summary && summary.text) {
    context.push({
      role: 'system',
      content: `=== LONG-TERM MEMORY (${summary.updated?.slice(0,10) || 'recent'}) ===\n${summary.text}\n=== END MEMORY ===`
    });
  }

  // Add the most recent raw messages (last 24)
  const recent = mem.slice(-CONTEXT_WINDOW);
  context.push(...recent);

  return context;
}

// ─── Auto-summarise trigger ─────────────────────────────────────────────────
// Called from brain.js after every N messages to compress old context into summary.
// Returns true if a summarise is needed.

function shouldSummarise(sessionId) {
  const mem = getMemory(sessionId);
  // Trigger every 30 messages (when rolling window is getting full)
  return mem.length > 0 && mem.length % 30 === 0;
}

module.exports = {
  getMemory,
  addToMemory,
  clearMemory,
  getAllSessions,
  getSummary,
  setSummary,
  buildContext,
  shouldSummarise,
  CONTEXT_WINDOW
};
