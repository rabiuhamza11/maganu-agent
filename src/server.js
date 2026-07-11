require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const maganuBrain = require('./services/brain');
const memory = require('./services/memory');
const whatsapp = require('./services/whatsapp');
const scheduler = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ SECURITY MIDDLEWARE ============
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests' }
});
app.use(limiter);

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    agent: 'Maganu',
    version: '1.0.0',
    status: 'online',
    owner: 'Rabiu Hamza',
    ecosystem: 'Harz',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Maganu v1.0.0' });
});

// ============ WHATSAPP WEBHOOK ============
// Twilio sends incoming WhatsApp messages here
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { Body, From, To } = req.body;

    if (!Body || !From) {
      return res.status(400).send('Missing message body');
    }

    console.log(`📩 Message from ${From}: ${Body}`);

    // Acknowledge immediately (Twilio requires fast response)
    res.status(200).send('OK');

    // Get conversation memory for this user
    const sessionId = From.replace('whatsapp:', '').replace('+', '');
    const userMemory = memory.getSession(sessionId);

    // Process with Maganu's brain
    const reply = await maganuBrain.think({
      message: Body,
      from: From,
      sessionId,
      memory: userMemory
    });

    // Save to memory
    memory.save(sessionId, { role: 'user', content: Body });
    memory.save(sessionId, { role: 'assistant', content: reply });

    // Send reply via WhatsApp
    await whatsapp.send(From, reply);

  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

// ============ DIRECT CHAT API ============
// For testing and web interface
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = uuidv4() } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMemory = memory.getSession(sessionId);

    const reply = await maganuBrain.think({
      message,
      from: 'api',
      sessionId,
      memory: userMemory
    });

    memory.save(sessionId, { role: 'user', content: message });
    memory.save(sessionId, { role: 'assistant', content: reply });

    res.json({ reply, sessionId, agent: 'Maganu' });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Maganu encountered an error', details: err.message });
  }
});

// ============ SEND MESSAGE API ============
// For automations to push messages to owner
app.post('/send', async (req, res) => {
  try {
    const { message, to } = req.body;
    const target = to || process.env.OWNER_WHATSAPP;

    if (!message) return res.status(400).json({ error: 'Message required' });

    await whatsapp.send(target, message);
    res.json({ success: true, sent_to: target });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ MEMORY ENDPOINTS ============
app.get('/memory/:sessionId', (req, res) => {
  const hist = memory.getSession(req.params.sessionId);
  res.json({ sessionId: req.params.sessionId, messages: hist, count: hist.length });
});

app.delete('/memory/:sessionId', (req, res) => {
  memory.clearSession(req.params.sessionId);
  res.json({ cleared: true });
});

// ============ SCHEDULER STATUS ============
app.get('/automations', (req, res) => {
  res.json(scheduler.getStatus());
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`
🤖 ═══════════════════════════════════════
   MAGANU AGENT — Online & Ready
   Owner: Rabiu Hamza | Harz Ecosystem  
   Port: ${PORT}
   Time: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
🤖 ═══════════════════════════════════════
  `);

  // Start scheduled automations
  scheduler.start();
});

module.exports = app;
