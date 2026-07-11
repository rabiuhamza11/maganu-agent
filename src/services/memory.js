// In-memory conversation store (per session)
// For production, replace with Redis or a DB

const sessions = new Map();
const MAX_MEMORY = 20; // Max messages per session

function getMemory(sessionId) {
  return sessions.get(sessionId) || [];
}

function addToMemory(sessionId, message) {
  const mem = sessions.get(sessionId) || [];
  mem.push(message);
  // Keep only last MAX_MEMORY messages
  if (mem.length > MAX_MEMORY) {
    mem.splice(0, mem.length - MAX_MEMORY);
  }
  sessions.set(sessionId, mem);
}

function clearMemory(sessionId) {
  sessions.delete(sessionId);
}

module.exports = { getMemory, addToMemory, clearMemory };
