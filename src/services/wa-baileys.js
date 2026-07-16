const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let sock = null;
let connected = false;
let pairingCode = null;

async function startWhatsApp(onMessage) {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth_baileys'));
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Maganu Agent', 'Chrome', '1.0'],
    getMessage: async (key) => {
      return { conversation: 'message' };
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, pairingCode: pc } = update;
    
    if (qr) {
      console.log('QR code generated — use pairing code instead');
    }
    
    if (pc) {
      pairingCode = pc;
      console.log(`\n🔑 WHATSAPP PAIRING CODE: ${pc}\n`);
      // Send pairing code to Telegram
      try {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.OWNER_CHAT_ID;
        if (BOT_TOKEN && chatId) {
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: `🔑 *WhatsApp Pairing Code*\n\nTo connect Maganu to WhatsApp:\n\n1. Open WhatsApp on your phone\n2. Go to Settings → Linked Devices → Link with phone number\n3. Enter this code: *${pc}*\n\nMaganu will be online on WhatsApp instantly!`
          });
        }
      } catch (e) { console.error('Send pairing code:', e.message); }
    }

    if (connection === 'open') {
      connected = true;
      pairingCode = null;
      console.log('✅ WhatsApp connected!');
      // Notify owner
      try {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.OWNER_CHAT_ID;
        if (BOT_TOKEN && chatId) {
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: '✅ *Maganu is now connected to WhatsApp!*\n\nAll 310+ commands are available. Send any command like /status, /help, /pay, /orders etc.'
          });
        }
      } catch (e) {}
    }

    if (connection === 'close') {
      connected = false;
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      
      if (shouldReconnect) {
        console.log('WhatsApp disconnected, reconnecting...');
        setTimeout(() => startWhatsApp(onMessage), 5000);
      } else {
        console.log('WhatsApp logged out. Delete auth_baileys folder and restart.');
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';
    const name = msg.pushName || 'Unknown';
    
    console.log(`[WA][${name}] ${text.slice(0, 60)}`);
    
    // Skip owner messages (Superagent handles those)
    const ownerNumbers = ['2348028687857@s.whatsapp.net', '2347036170795@s.whatsapp.net'];
    if (ownerNumbers.includes(from)) return;
    
    if (onMessage && text) {
      try {
        const response = await onMessage(from, name, text);
        if (response) {
          await sendWhatsApp(from, response);
        }
      } catch (e) {
        console.error('WhatsApp message handler:', e.message);
      }
    }
  });
}

async function sendWhatsApp(to, message) {
  if (!sock || !connected) {
    console.warn('WhatsApp not connected');
    return false;
  }
  
  // Normalize number
  let jid = to;
  if (!jid.includes('@')) {
    let phone = to.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.slice(1);
    jid = phone + '@s.whatsapp.net';
  }
  
  // Split long messages (WhatsApp limit ~65k, but keep it reasonable)
  const chunks = [];
  const maxLen = 3500;
  let remaining = message;
  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  
  for (const chunk of chunks) {
    try {
      await sock.sendMessage(jid, { text: chunk });
    } catch (err) {
      console.error('WhatsApp send error:', err.message);
      return false;
    }
  }
  return true;
}

async function sendToOwner(message) {
  const ownerJid = '2348028687857@s.whatsapp.net';
  return sendWhatsApp(ownerJid, message);
}

function isReady() {
  return connected;
}

function getPairingCode() {
  return pairingCode;
}

module.exports = { startWhatsApp, sendWhatsApp, sendToOwner, isReady, getPairingCode };
