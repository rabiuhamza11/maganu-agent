const axios = require('axios');

// Meta WhatsApp Cloud API — FREE (1000 conversations/month)
// No Twilio needed. Direct API calls to Meta.

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const META_API = `https://graph.facebook.com/v21.0`;

function isReady() {
  return !!(WHATSAPP_TOKEN && PHONE_NUMBER_ID);
}

async function send(to, message) {
  if (!isReady()) {
    console.warn('WhatsApp not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID on Render.');
    return false;
  }

  // Normalize phone number (remove + prefix, ensure country code)
  let phone = to.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '234' + phone.slice(1); // Nigeria

  const chunks = splitMessage(message, 4000);
  for (const chunk of chunks) {
    try {
      await axios.post(
        `${META_API}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: chunk }
        },
        { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('WhatsApp send error:', err.response?.data?.error?.message || err.message);
      return false;
    }
  }
  console.log(`WhatsApp sent to ${phone}: ${message.substring(0, 50)}...`);
  return true;
}

async function sendToOwner(message) {
  const ownerNumber = process.env.OWNER_WHATSAPP || '2348028687857';
  return send(ownerNumber, message);
}

function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

// Webhook verification handler (for Meta setup)
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'harz_ecosystem_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified!');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// Process incoming WhatsApp messages
async function handleWebhook(req, res) {
  res.sendStatus(200); // Acknowledge immediately

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return;

    const from = message.from; // Phone number with country code
    const text = message.text?.body || '';
    const name = change?.value?.contacts?.[0]?.name?.formatted_name || 'Unknown';

    console.log(`WhatsApp message from ${name} (${from}): ${text}`);

    // Don't process messages from owner's numbers (let Superagent handle those)
    const ownerNumbers = ['2348028687857', '2347036170795'];
    if (ownerNumbers.includes(from)) return;

    // Forward to CRM logging + auto-reply
    const { processWhatsAppMessage } = require('./crm');
    if (typeof processWhatsAppMessage === 'function') {
      await processWhatsAppMessage(from, name, text);
    }
  } catch (err) {
    console.error('WhatsApp webhook error:', err.message);
  }
}

module.exports = { send, sendToOwner, splitMessage, isReady, verifyWebhook, handleWebhook };
