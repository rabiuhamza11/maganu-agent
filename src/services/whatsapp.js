const twilio = require('twilio');

let twilioClient = null;

function getClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not set. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env');
    }

    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

async function send(to, message) {
  try {
    const client = getClient();
    const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    // Twilio WhatsApp has 1600 char limit — split if needed
    const chunks = splitMessage(message, 1500);

    for (const chunk of chunks) {
      await client.messages.create({
        from,
        to,
        body: chunk
      });
    }

    console.log(`✅ Sent to ${to}: ${message.substring(0, 50)}...`);
    return true;

  } catch (err) {
    console.error(`❌ WhatsApp send failed to ${to}:`, err.message);
    throw err;
  }
}

function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to split at a newline
    let splitAt = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trim();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

async function sendToOwner(message) {
  const ownerNumber = process.env.OWNER_WHATSAPP;
  if (!ownerNumber) {
    console.warn('OWNER_WHATSAPP not set — cannot send to owner');
    return;
  }
  return send(ownerNumber, message);
}

module.exports = { send, sendToOwner, splitMessage };
