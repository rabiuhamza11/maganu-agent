// Maganu AI — Payment Management Service
// Handles all transaction operations via Telegram commands
// Connected to Base44 backend: /functions/harzPayments

const BASE44_PAYMENTS = 'https://superagent-2286fb2f.base44.app/functions/harzPayments';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RABIU_CHAT_ID = '1440727973';

class PaymentService {
  constructor(bot) {
    this.bot = bot;
    this.registerCommands();
  }

  registerCommands() {
    // /pay — Main payment menu
    this.bot.command('pay', (ctx) => this.paymentMenu(ctx));
    
    // /orders — List all orders
    this.bot.command('orders', (ctx) => this.listOrders(ctx));
    
    // /pending — Show pending payments
    this.bot.command('pending', (ctx) => this.listPending(ctx));
    
    // /confirm <reference> — Confirm a payment by reference
    this.bot.command('confirm', (ctx) => this.confirmPayment(ctx));
    
    // /revenue — Show revenue summary
    this.bot.command('revenue', (ctx) => this.revenueSummary(ctx));
    
    // /neworder — Create a new order manually
    this.bot.command('neworder', (ctx) => this.createNewOrder(ctx));
    
    // /payoptions — Show available payment methods
    this.bot.command('payoptions', (ctx) => this.paymentOptions(ctx));
  }

  async callAPI(action, data = {}) {
    try {
      const res = await fetch(BASE44_PAYMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async paymentMenu(ctx) {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Revenue Summary', callback_data: 'pay_revenue' }],
          [{ text: '⏳ Pending Payments', callback_data: 'pay_pending' }],
          [{ text: '📦 All Orders', callback_data: 'pay_orders' }],
          [{ text: '💳 Payment Options', callback_data: 'pay_options' }],
        ]
      }
    };
    await ctx.reply('💳 *Payment Management*\n\nSelect an option below:', keyboard);
  }

  async listOrders(ctx) {
    const data = await this.callAPI('all_orders', { limit: 20 });
    if (!data.success) return ctx.reply('❌ Error fetching orders: ' + (data.error || 'Unknown'));
    
    let msg = `📦 *Order Summary*\n\n`;
    msg += `Total: ${data.total}\nPaid: ${data.paid}\nPending: ${data.pending}\nRevenue: ₦${(data.revenue||0).toLocaleString()}\n\n`;
    
    if (data.orders && data.orders.length > 0) {
      msg += `*Recent Orders:*\n`;
      data.orders.slice(0, 10).forEach((o, i) => {
        const ref = 'HARZ-' + (o.id||'').substring(0, 8).toUpperCase();
        const status = o.payment_status === 'paid' ? '✅' : '⏳';
        msg += `\n${i+1}. ${status} ${o.product_title}\n   ₦${(o.amount||0).toLocaleString()} — ${o.buyer_name||'N/A'}\n   Ref: ${ref}\n   ${o.payment_status}\n`;
      });
    } else {
      msg += 'No orders yet.';
    }
    
    await ctx.reply(msg);
  }

  async listPending(ctx) {
    const data = await this.callAPI('pending_payments');
    if (!data.success) return ctx.reply('❌ Error: ' + (data.error || 'Unknown'));
    
    if (data.count === 0) {
      return ctx.reply('✅ *No pending payments.* All orders are paid!');
    }
    
    let msg = `⏳ *Pending Payments (${data.count})*\n`;
    msg += `Total Pending: ₦${(data.total_amount||0).toLocaleString()}\n\n`;
    
    data.pending.forEach((o, i) => {
      const ref = 'HARZ-' + (o.id||'').substring(0, 8).toUpperCase();
      msg += `${i+1}. ${o.product_title}\n   ₦${(o.amount||0).toLocaleString()} — ${o.buyer_name||'N/A'}\n   ${o.buyer_email||'No email'}\n   Ref: ${ref}\n   Confirm: /confirm ${ref}\n\n`;
    });
    
    await ctx.reply(msg);
  }

  async confirmPayment(ctx) {
    const ref = ctx.message.text.split(' ')[1];
    if (!ref) return ctx.reply('Usage: /confirm HARZ-XXXXXXXX\n\nGet pending references with /pending');
    
    const data = await this.callAPI('confirm_by_reference', { reference: ref });
    
    if (!data.success) {
      return ctx.reply(`❌ ${data.error || 'Failed to confirm payment'}`);
    }
    
    if (data.message === 'Already confirmed') {
      return ctx.reply(`⚠️ Order ${ref} was already confirmed.`);
    }
    
    let msg = `✅ *Payment Confirmed!*\n\n`;
    msg += `Product: ${data.order.product_title}\n`;
    msg += `Amount: ${data.order.currency} ${(data.order.amount||0).toLocaleString()}\n`;
    msg += `Buyer: ${data.order.buyer_name}\n`;
    msg += `Email: ${data.order.buyer_email}\n`;
    msg += `Reference: ${ref}\n\n`;
    
    if (data.email_to_send) {
      msg += `📧 Delivery email is ready to send.\n`;
      msg += `The Superagent will auto-send it to ${data.email_to_send.to}`;
    } else {
      msg += `📦 No buyer email on file — deliver manually via WhatsApp.`;
    }
    
    await ctx.reply(msg);
    
    // Also notify via the main Telegram chat
    if (data.email_to_send) {
      try {
        // Send delivery confirmation to Rabiu
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: RABIU_CHAT_ID,
            text: `✅ PAYMENT CONFIRMED\n\nProduct: ${data.order.product_title}\nAmount: ₦${(data.order.amount||0).toLocaleString()}\nBuyer: ${data.order.buyer_name}\nReference: ${ref}\n\nDelivery email sent to ${data.email_to_send.to}`
          })
        });
      } catch(e) {}
    }
  }

  async revenueSummary(ctx) {
    const data = await this.callAPI('revenue');
    if (!data.success) return ctx.reply('❌ Error: ' + (data.error || 'Unknown'));
    
    let msg = `📊 *Revenue Summary*\n\n`;
    msg += `Total Revenue: ₦${(data.total_revenue||0).toLocaleString()}\n`;
    msg += `Pending Revenue: ₦${(data.pending_revenue||0).toLocaleString()}\n`;
    msg += `Total Orders: ${data.total_orders}\n`;
    msg += `Paid: ${data.paid_orders} | Pending: ${data.pending_orders}\n`;
    
    if (data.recent_paid && data.recent_paid.length > 0) {
      msg += `\n*Recent Paid:*\n`;
      data.recent_paid.forEach((o, i) => {
        msg += `${i+1}. ${o.product} — ₦${(o.amount||0).toLocaleString()} — ${o.buyer}\n`;
      });
    }
    
    if (data.recent_pending && data.recent_pending.length > 0) {
      msg += `\n*Pending Confirmation:*\n`;
      data.recent_pending.forEach((o, i) => {
        msg += `${i+1}. ${o.product} — ₦${(o.amount||0).toLocaleString()} — ${o.ref}\n`;
      });
      msg += `\nUse /confirm <reference> to confirm`;
    }
    
    await ctx.reply(msg);
  }

  async createNewOrder(ctx) {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 4) {
      return ctx.reply('Usage: /neworder <product_title> <amount> <buyer_name> <buyer_email>\n\nExample: /neworder "Estate Estimator" 15000 "John Doe" john@email.com');
    }
    
    const amount = parseInt(args[1]);
    const title = args[0].replace(/"/g, '');
    const name = args[2].replace(/"/g, '');
    const email = args[3];
    
    const data = await this.callAPI('create_order', {
      product_title: title, amount, buyer_name: name, buyer_email: email, currency: 'NGN'
    });
    
    if (!data.success) return ctx.reply('❌ Error creating order');
    
    const p = data.payment_instructions;
    let msg = `✅ *Order Created!*\n\n`;
    msg += `Order ID: ${data.order_id}\n`;
    msg += `Product: ${title}\n`;
    msg += `Amount: ₦${amount.toLocaleString()}\n`;
    msg += `Buyer: ${name} (${email})\n`;
    msg += `Reference: ${p.reference}\n`;
    msg += `USSD: ${p.ussd}\n`;
    msg += `Bank: UBA — 2034326424\n\n`;
    msg += `Send these details to the customer.`;
    
    await ctx.reply(msg);
  }

  async paymentOptions(ctx) {
    const data = await this.callAPI('payment_options');
    if (!data.success) return ctx.reply('❌ Error: ' + (data.error || 'Unknown'));
    
    const o = data.options;
    let msg = `💳 *Available Payment Methods*\n\n`;
    msg += `1. 🏦 Bank Transfer (FREE)\n   ${o.bank_transfer.bank}\n   ${o.bank_transfer.account_name}\n   ${o.bank_transfer.account_number}\n\n`;
    msg += `2. 📱 USSD (FREE)\n   ${o.ussd.code}\n\n`;
    msg += `3. 💳 Card via Payhip (5%)\n   ${o.payhip.url}\n\n`;
    msg += `4. ₿ Crypto (FREE)\n   ${o.crypto.wallet}\n   Network: ${o.crypto.network}\n\n`;
    msg += `5. Paystack — ${o.paystack.status}\n`;
    msg += `6. Stripe — ${o.stripe.status}`;
    
    await ctx.reply(msg);
  }
}

module.exports = PaymentService;
