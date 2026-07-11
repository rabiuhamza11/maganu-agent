// In-memory session store (upgrade to Redis for production)
const sessions = new Map();
const MAX_HISTORY = 20; // Keep last 20 messages per session

function getSession(sessionId) {
  return sessions.get(sessionId) || [];
}

function save(sessionId, message) {
  const history = sessions.get(sessionId) || [];
  history.push(message);

  // Keep only last MAX_HISTORY messages
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  sessions.set(sessionId, history);
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

function getAllSessions() {
  return Array.from(sessions.keys());
}

module.exports = { getSession, save, clearSession, getAllSessions };
