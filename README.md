# Maganu AI Agent v7.0 — Financial Edition

🤖 **Maganu AI** — Rabiu Hamza's personal AI assistant and Harz Ecosystem controller.

## What's New in v7.0

### 💰 Financial Transactions
- **Bank Transfers** — Send money to any Nigerian bank account
- **Payment Links** — Generate checkout links for customers
- **Refunds** — Process full or partial refunds
- **Account Verification** — Verify bank account names instantly
- **Transfer Recipients** — Create and manage recipients
- **Transaction Lookup** — Full transaction details by reference

### 💳 Payment Gateways
- **Paystack** — Full API integration (payments, transfers, refunds, banks)
- **Stripe** — Checkout sessions, charges, refunds
- **Flutterwave** — Payment links, balance, transactions
- **Auto-routing** — NGN → Paystack, USD → Stripe

### 🚀 Enhanced Capabilities
- 200+ capabilities (up from 170)
- 165+ commands (up from 140)
- Financial operations module
- Multi-gateway payment link generation
- Real-time bank verification
- Nigerian bank directory

## Commands

| Command | Description |
|---------|-------------|
| `/pay [email] [amt] [cur] \| [desc]` | Create payment link |
| `/transfer [amt] \| [recipient] \| [reason]` | Bank transfer |
| `/recipient [name] \| [acct] \| [bank]` | Create transfer recipient |
| `/verify [acct] \| [bank]` | Verify account name |
| `/banks` | List Nigerian banks |
| `/refund [ref] \| [amt]` | Refund transaction |
| `/txn [ref]` | Transaction details |
| `/finalize [code] \| [otp]` | Finalize transfer |
| `/flw [amt] \| [email] \| [name] \| [phone]` | Flutterwave payment |
| `/gateway` | Payment gateway status |

## Architecture
- **Runtime**: Node.js + Express
- **AI**: Groq llama-4-scout (30k TPM)
- **Host**: Render.com
- **Payments**: Paystack + Stripe + Flutterwave
- **Deploy**: Vercel + Netlify + Render + Railway

## Owner
**Rabiu Hamza Mohammed** (hamzarabiu390@gmail.com)
Telegram: @Maganu AI Agent

---
Built with ❤️ by Rabiu Hamza | Harz Ecosystem
