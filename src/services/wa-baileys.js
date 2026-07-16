const axios = require('axios');

// Try to load Baileys — handle if it fails
let makeWASocket, useMultiFileAuthState, DisconnectReason, Boom;
let baileysLoaded = false;
let loadError = null;

try {
  const baileys = require('@whiskeysockets/baileys');
  makeWASocket = baileys.default || baileys.makeWASocket;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  baileysLoaded = true;
  console.log('✅ Baileys library loaded');
} catch (e) {
  loadError = e.message;
  console.error('❌ Baileys failed to load:', e.message);
}

try {
  Boom = require('@hapi/boom');
} catch (e) {
  // Fallback: simple error class
  Boom = class {
    constructor(error) {
      this.error = error;
      this.output = { statusCode: error?.output?.statusCode || 500 };
    }
  };
  console.warn('⚠️ @hapi/boom not available, using fallback');
}

const fs = require('fs');
const path = require('path');

let sock = null;
let connected = false;
let pairingCode = null;
let initError = null;

async function startWhatsApp(onMessage) {
  if (!baileysLoaded) {
    initError = 'Baileys library not installed: ' + (loadError || 'unknown');
    console.error(initError);
    return;
  }

  try {
    // Ensure auth directory exists
    const authDir = path.join(__dirname, '../auth_baileys');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Maganu Agent', 'Chrome', '1.0'],
      logger: {
        level: 'silent',
        info: () => {},
        error: (m) => console.error('Baileys:', m),
        warn: () => {},
        debug: () => {},
        trace: () => {},
        child: function() { return this; }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, pairingCode: pc } = update;

      if (pc) {
        pairingCode = pc;
        console.log(`\n🔑 WHATSAPP PAIRING CODE: ${pc}\n`);
        // Send to Telegram
        try {
          const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = process.env.OWNER_CHAT_ID;
          if (BOT_TOKEN && chatId) {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              chat_id: chatId,
              text: `🔑 *WhatsApp Pairing Code*\n\nTo connect Maganu to WhatsApp:\n\n1. Open WhatsApp\n2. Settings → Linked Devices → Link with phone number\n3. Enter this code: *${pc}*\n\nMaganu will be online on WhatsApp instantly!`
            });
          }
        } catch (e) { console.error('Send pairing code:', e.message); }
      }

      if (connection === 'open') {
        connected = true;
        pairingCode = null;
        console.log('✅ WhatsApp connected!');
        try {
          const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = process.env.OWNER_CHAT_ID;
          if (BOT_TOKEN && chatId) {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              chat_id: chatId,
              text: '✅ Maganu is now connected to WhatsApp! All commands available.'
            });
          }
        } catch (e) {}
      }

      if (connection === 'close') {
        connected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 404;
        if (shouldReconnect) {
          console.log('WhatsApp disconnected, reconnecting in 5s...');
          setTimeout(() => startWhatsApp(onMessage), 5000);
        }
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const from = msg.key.remoteJid;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const name = msg.pushName || 'Unknown';
      
      const ownerNumbers = ['2348028687857@s.whatsapp.net', '2347036170795@s.whatsapp.net'];
      if (ownerNumbers.includes(from)) return;
      
      if (onMessage && text) {
        try {
          const response = await onMessage(from, name, text);
          if (response) await sendWhatsApp(from, response);
        } catch (e) { console.error('WA msg handler:', e.message); }
      }
    });
  } catch (err) {
    initError = err.message;
    console.error('WhatsApp init failed:', err.message);
  }
}

async function sendWhatsApp(to, message) {
  if (!sock || !connected) return false;
  let jid = to;
  if (!jid.includes('@')) {
    let phone = to.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.slice(1);
    jid = phone + '@s.whatsapp.net';
  }
  try {
    await sock.sendMessage(jid, { text: message });
    return true;
  } catch (err) {
    console.error('WA send error:', err.message);
    return false;
  }
}

async function sendToOwner(message) {
  return sendWhatsApp('2348028687857', message);
}

function isReady() { return connected; }
function getPairingCode() { return pairingCode; }
function getStatus() {
  return { connected, baileysLoaded, pairingCode, initError: initError || loadError };
}

module.exports = { startWhatsApp, sendWhatsApp, sendToOwner, isReady, getPairingCode, getStatus };
