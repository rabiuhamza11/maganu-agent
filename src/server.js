require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { think } = require('./services/brain');
const { getMemory, addToMemory, clearMemory } = require('./services/memory');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID; // Your Telegram chat ID

// ============ SEND MESSAGE TO TELEGRAM ============
async function sendMessage(chatId, text) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('Send error:', err.response?.data || err.message);
    // Retry without markdown if it fails
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
      });
    } catch (e) {
      console.error('Retry send error:', e.message);
    }
  }
}

// ============ SEND TYPING INDICATOR ============
async function sendTyping(chatId) {
  try {
    await axios.post(`${TELEGRAM_API}/sendChatAction`, {
      chat_id: chatId,
      action: 'typing'
    });
  } catch (_) {}
}

// ============ TELEGRAM WEBHOOK ============
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately

  const update = req.body;
  if (!update.message) return;

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const from = msg.from?.first_name || 'User';
  const sessionId = String(chatId);

  console.log(`[${from}] ${text}`);

  // Handle /clear command
  if (text.trim().toLowerCase() === '/clear') {
    clearMemory(sessionId);
    await sendMessage(chatId, '🧹 Memory cleared. Fresh start!');
    return;
  }

  // Show typing indicator
  await sendTyping(chatId);

  // Get conversation memory
  const memory = getMemory(sessionId);

  // Get response from Maganu brain
  const response = await think({ message: text, from, sessionId, memory });

  // Save to memory
  addToMemory(sessionId, { role: 'user', content: text });
  addToMemory(sessionId, { role: 'assistant', content: response });

  // Send response
  await sendMessage(chatId, response);
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    name: 'Maganu Agent',
    version: '1.2.0',
    status: 'online',
    model: 'Groq Llama 3.3 70B',
    owner: 'Rabiu Hamza — Harz Ecosystem'
  });
});

// ============ SEND MESSAGE TO OWNER (for automations) ============
app.post('/notify', async (req, res) => {
  const { message, secret } = req.body;
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!OWNER_CHAT_ID) {
    return res.status(400).json({ error: 'OWNER_CHAT_ID not set' });
  }
  await sendMessage(OWNER_CHAT_ID, message);
  res.json({ ok: true });
});

// ============ SET WEBHOOK ============
async function setWebhook(url) {
  try {
    const result = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: `${url}/webhook`,
      allowed_updates: ['message']
    });
    console.log('Webhook set:', result.data.description);
  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
  }
}

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🤖 Maganu v1.2.0 online — port ${PORT}`);

  // Auto-set webhook if WEBHOOK_URL is provided
  if (process.env.WEBHOOK_URL) {
    await setWebhook(process.env.WEBHOOK_URL);
    console.log(`📡 Webhook set to: ${process.env.WEBHOOK_URL}/webhook`);
  } else {
    console.log('⚠️  Set WEBHOOK_URL env var to activate Telegram webhook');
  }
});

module.exports = app;
