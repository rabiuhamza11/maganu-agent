# Maganu — Custom AI Agent
**Built by Rabiu Hamza | Harz Ecosystem**

Maganu is a fully custom AI agent powered by Claude, deployed as a standalone Node.js server with WhatsApp integration via Twilio.

---

## Features
- 🤖 Powered by Claude AI (Anthropic)
- 📱 WhatsApp messaging via Twilio
- 🧠 Conversation memory per session
- 📅 Scheduled automations (daily briefings, ecosystem checks)
- 🌐 Full Harz Ecosystem knowledge built-in
- ⚡ REST API for direct chat and message sending
- 🔒 Rate limiting, CORS, Helmet security

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Required API Keys
- **ANTHROPIC_API_KEY** — Get from https://console.anthropic.com
- **TWILIO_ACCOUNT_SID** — Get from https://console.twilio.com
- **TWILIO_AUTH_TOKEN** — Get from https://console.twilio.com
- **OWNER_WHATSAPP** — Your WhatsApp number e.g. `whatsapp:+2347012345678`

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Railway (recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## WhatsApp Setup (Twilio)

1. Sign up at https://console.twilio.com
2. Go to **Messaging > Try it out > Send a WhatsApp message**
3. Follow Twilio Sandbox instructions to connect your number
4. Set webhook URL to: `https://your-domain.com/webhook/whatsapp`
5. Set HTTP method to **POST**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Agent status |
| GET | `/health` | Health check |
| POST | `/chat` | Direct chat API |
| POST | `/webhook/whatsapp` | Twilio WhatsApp webhook |
| POST | `/send` | Send message to WhatsApp |
| GET | `/memory/:sessionId` | View session memory |
| DELETE | `/memory/:sessionId` | Clear session memory |
| GET | `/automations` | List active automations |

---

## Commands (WhatsApp)
Send these to Maganu on WhatsApp:
- `/status` — System status
- `/help` — Show all commands
- `/ecosystem` — All Harz platforms
- `/harzdm` — HarzDM marketplace info
- `/omega` — OMEGA INFINITY info
- `/tradeos` — TradeOS info
- `/buildbot` — BuildBot AI info

---

## Architecture
```
maganu/
  src/
    server.js          # Express server + routes
    services/
      brain.js         # Claude AI integration + commands
      memory.js        # Session conversation memory
      whatsapp.js      # Twilio WhatsApp sender
      scheduler.js     # Cron automations
```

---

**Owner:** Rabiu Hamza Mohammed  
**Ecosystem:** Harz  
**GitHub:** github.com/rabiuhamza11  
