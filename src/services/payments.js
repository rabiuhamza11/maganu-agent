// Maganu Financial Intelligence — Stripe + Paystack + Flutterwave + PayPal
// v7.0 — Full financial transaction capability
const axios = require('axios');

// ============ PAYSTACK — TRANSACTIONS ============

// Create a Paystack payment link / checkout
async function createPaystackPayment({ email, amount, currency = 'NGN', title, description, channels }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const res = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: Math.round(amount * 100),
      currency,
      callback_url: process.env.PAYSTACK_CALLBACK_URL || 'https://superagent-2286fb2f.base44.app/functions/harzWebhook',
      metadata: { title, description, app: 'MaganuAI' },
      channels: channels || ['card', 'bank', 'ussd', 'bank_transfer'],
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    
    return {
      success: true,
      reference: res.data.data.reference,
      checkout_url: res.data.data.authorization_url,
      amount: `${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString()}`,
      email,
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Initiate a transfer (send money to a bank account)
async function initiateTransfer({ amount, recipient_code, reason, currency = 'NGN' }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    // Create transfer
    const res = await axios.post('https://api.paystack.co/transfer', {
      source: 'balance',
      amount: Math.round(amount * 100),
      recipient: recipient_code,
      reason: reason || 'Transfer from Harz Ecosystem',
      currency,
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    
    return {
      success: true,
      transfer_code: res.data.data.transfer_code,
      reference: res.data.data.reference,
      status: res.data.data.status,
      amount: `₦${amount.toLocaleString()}`,
      message: 'Transfer initiated. OTP may be required to finalize.',
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Finalize transfer (with OTP if required)
async function finalizeTransfer({ transfer_code, otp }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    const res = await axios.post('https://api.paystack.co/transfer/finalize_transfer', {
      transfer_code,
      otp,
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    
    return {
      success: true,
      status: res.data.data.status,
      transfer_code: res.data.data.transfer_code,
      message: res.data.data.message || 'Transfer completed successfully',
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Create a transfer recipient (bank account)
async function createRecipient({ name, account_number, bank_code, type = 'nuban' }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const res = await axios.post('https://api.paystack.co/transferrecipient', {
      type,
      name,
      account_number,
      bank_code,
      currency: 'NGN',
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    
    return {
      success: true,
      recipient_code: res.data.data.recipient_code,
      name: res.data.data.details.account_name,
      account_number: res.data.data.details.account_number,
      bank: res.data.data.details.bank_name,
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Verify a bank account number
async function verifyAccount({ account_number, bank_code }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const res = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    
    return {
      success: true,
      account_name: res.data.data.account_name,
      account_number: res.data.data.account_number,
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// List Nigerian banks
async function listBanks() {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const res = await axios.get('https://api.paystack.co/bank?country=nigeria&perPage=50', {
      headers: { Authorization: `Bearer ${key}` }
    });
    
    const banks = (res.data.data || []).filter(b => b.active && b.country === 'Nigeria');
    return banks.map(b => ({ name: b.name, code: b.code, slug: b.slug }));
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Refund a transaction
async function refundTransaction({ reference, amount, note }) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const body = { reference };
    if (amount) body.amount = Math.round(amount * 100);
    if (note) body.note = note;
    
    const res = await axios.post('https://api.paystack.co/refund', body, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
    });
    
    return {
      success: true,
      refund_id: res.data.data.id,
      status: res.data.data.status,
      amount: `₦${(res.data.data.amount / 100).toLocaleString()}`,
      reference: res.data.data.transaction_reference,
      message: 'Refund initiated successfully',
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// Get a single transaction details
async function getTransactionDetails(reference) {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    
    const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    
    const t = res.data.data;
    return {
      success: true,
      reference: t.reference,
      amount: `₦${(t.amount / 100).toLocaleString()}`,
      status: t.status,
      currency: t.currency,
      customer: t.customer,
      channel: t.channel,
      platform: t.metadata?.app || t.metadata?.platform || 'Unknown',
      date: t.created_at,
      fees: `₦${(t.fees / 100).toLocaleString()}`,
      gateway_response: t.gateway_response,
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// ============ PAYSTACK — DASHBOARD (existing, enhanced) ============

async function getPaystackBalance() {
  try {
    const res = await axios.get('https://api.paystack.co/balance', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const balances = res.data?.data || [];
    return balances.map(b => `${b.currency}: ₦${(b.balance / 100).toLocaleString()}`).join('\n') || 'No balance data';
  } catch (err) {
    return `Paystack error: ${err.response?.data?.message || err.message}`;
  }
}

async function getPaystackTransactions(limit = 5) {
  try {
    const res = await axios.get(`https://api.paystack.co/transaction?perPage=${limit}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const txns = res.data?.data || [];
    if (!txns.length) return 'No transactions yet.';
    return txns.map(t =>
      `${t.customer?.email || 'Unknown'} — ₦${(t.amount / 100).toLocaleString()} — ${t.status} — ${new Date(t.created_at).toLocaleDateString('en-NG')}`
    ).join('\n');
  } catch (err) {
    return `Paystack error: ${err.response?.data?.message || err.message}`;
  }
}

async function getPaystackStats() {
  try {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { error: 'PAYSTACK_SECRET_KEY not set' };
    const headers = { Authorization: 'Bearer ' + key };
    const [balRes, txRes, custRes] = await Promise.all([
      axios.get('https://api.paystack.co/balance', { headers }),
      axios.get('https://api.paystack.co/transaction?perPage=100', { headers }),
      axios.get('https://api.paystack.co/customer?perPage=50', { headers }),
    ]);
    const txns = txRes.data && txRes.data.data ? txRes.data.data : [];
    const customers = custRes.data && custRes.data.data ? custRes.data.data : [];
    const balances = balRes.data && balRes.data.data ? balRes.data.data : [];
    const balNGN = balances.find(function(b) { return b.currency === 'NGN'; });
    const balanceAmt = balNGN ? balNGN.balance / 100 : 0;

    const MODE_MAP = {
      BuildBotAI: 'BuildBot AI', NexalMedia: 'Nexal Media',
      ContentPilot: 'ContentPilot AI', HarzDM: 'HarzDM',
      HostMasterAI: 'HostMaster AI', OracleAI: 'Oracle AI',
      MaganuAI: 'Maganu AI',
    };

    const statuses = {};
    const byPlatform = {};
    let totalSuccess = 0, successAmt = 0, totalAmt = 0;

    txns.forEach(function(t) {
      const status = t.status || 'unknown';
      statuses[status] = (statuses[status] || 0) + 1;
      const meta = t.metadata || {};
      const rawApp = meta.app || meta.platform || 'Other';
      const platform = MODE_MAP[rawApp] || rawApp;
      if (!byPlatform[platform]) byPlatform[platform] = { count: 0, amount: 0, success: 0 };
      byPlatform[platform].count++;
      byPlatform[platform].amount += (t.amount || 0) / 100;
      totalAmt += (t.amount || 0) / 100;
      if (status === 'success') {
        byPlatform[platform].success++;
        totalSuccess++;
        successAmt += (t.amount || 0) / 100;
      }
    });

    const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';
    const recent = txns.slice(0, 5).map(function(t) {
      return {
        email: t.customer && t.customer.email ? t.customer.email : 'Unknown',
        amount: (t.amount || 0) / 100,
        status: t.status,
        platform: MODE_MAP[t.metadata && t.metadata.app ? t.metadata.app : ''] || (t.metadata && t.metadata.app ? t.metadata.app : 'Unknown'),
        date: t.created_at ? t.created_at.slice(0, 10) : 'N/A'
      };
    });

    return {
      mode, balanceAmt, totalTxns: txns.length, totalSuccess, successAmt,
      totalAmt, customers: customers.length, statuses, byPlatform, recent,
      balance: '₦' + balanceAmt.toLocaleString('en-NG'),
      successfulTxns: totalSuccess,
      totalRevenue: '₦' + successAmt.toLocaleString('en-NG')
    };
  } catch (err) {
    return { error: (err.response && err.response.data && err.response.data.message) ? err.response.data.message : err.message };
  }
}

// ============ STRIPE — ENHANCED ============

async function getStripeBalance() {
  try {
    const res = await axios.get('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    const available = res.data?.available || [];
    return available.map(b => `${b.currency.toUpperCase()}: $${(b.amount / 100).toFixed(2)}`).join('\n') || '$0.00';
  } catch (err) {
    return `Stripe error: ${err.response?.data?.error?.message || err.message}`;
  }
}

async function getStripeTransactions(limit = 5) {
  try {
    const res = await axios.get(`https://api.stripe.com/v1/charges?limit=${limit}`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    const charges = res.data?.data || [];
    if (!charges.length) return 'No Stripe transactions yet.';
    return charges.map(c =>
      `${c.billing_details?.email || c.receipt_email || 'Unknown'} — $${(c.amount / 100).toFixed(2)} — ${c.status} — ${new Date(c.created * 1000).toLocaleDateString('en-NG')}`
    ).join('\n');
  } catch (err) {
    return `Stripe error: ${err.response?.data?.error?.message || err.message}`;
  }
}

async function getStripeStats() {
  try {
    const [balRes, chargeRes] = await Promise.all([
      axios.get('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
      }),
      axios.get('https://api.stripe.com/v1/charges?limit=50', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
      })
    ]);
    const charges = chargeRes.data?.data || [];
    const succeeded = charges.filter(c => c.status === 'succeeded');
    const total = succeeded.reduce((sum, c) => sum + c.amount, 0);
    const available = balRes.data?.available || [];
    const balStr = available.map(b => `${b.currency.toUpperCase()}: $${(b.amount / 100).toFixed(2)}`).join(', ') || '$0';

    return {
      balance: balStr,
      totalCharges: charges.length,
      succeededCharges: succeeded.length,
      totalRevenue: `$${(total / 100).toFixed(2)}`,
      recentCharges: charges.slice(0, 3).map(c => ({
        email: c.billing_details?.email || c.receipt_email || 'Unknown',
        amount: `$${(c.amount / 100).toFixed(2)}`,
        status: c.status,
        date: new Date(c.created * 1000).toLocaleDateString('en-NG')
      }))
    };
  } catch (err) {
    return { error: err.response?.data?.error?.message || err.message };
  }
}

// Create a Stripe checkout session
async function createStripeCheckout({ email, amount, currency = 'usd', product_name, success_url, cancel_url }) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { error: 'STRIPE_SECRET_KEY not set' };
    
    const res = await axios.post('https://api.stripe.com/v1/checkout/sessions', new URLSearchParams({
      'payment_method_types[0]': 'card',
      'customer_email': email,
      'line_items[0][price_data][currency]': currency,
      'line_items[0][price_data][product_data][name]': product_name || 'Harz Ecosystem Product',
      'line_items[0][price_data][unit_amount]': Math.round(amount * 100).toString(),
      'line_items[0][quantity]': '1',
      mode: 'payment',
      'success_url': success_url || 'https://superagent-2286fb2f.base44.app/functions/harzWebhook?status=success',
      'cancel_url': cancel_url || 'https://superagent-2286fb2f.base44.app/functions/harzWebhook?status=cancelled',
    }), { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    
    return {
      success: true,
      checkout_url: res.data.url,
      session_id: res.data.id,
      amount: `$${amount.toFixed(2)}`,
      email,
    };
  } catch (err) {
    return { error: err.response?.data?.error?.message || err.message };
  }
}

// Create a Stripe refund
async function createStripeRefund({ charge_id, amount }) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { error: 'STRIPE_SECRET_KEY not set' };
    
    const params = { charge: charge_id };
    if (amount) params.amount = Math.round(amount * 100);
    
    const res = await axios.post('https://api.stripe.com/v1/refunds', new URLSearchParams(params), {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return {
      success: true,
      refund_id: res.data.id,
      amount: `$${(res.data.amount / 100).toFixed(2)}`,
      status: res.data.status,
      message: 'Refund processed successfully',
    };
  } catch (err) {
    return { error: err.response?.data?.error?.message || err.message };
  }
}

// ============ FLUTTERWAVE ============

async function getFlutterwaveBalance() {
  try {
    const key = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!key) return { error: 'FLUTTERWAVE_SECRET_KEY not set' };
    
    const res = await axios.get('https://api.flutterwave.com/v3/balances', {
      headers: { Authorization: `Bearer ${key}` }
    });
    
    const balances = res.data?.data || [];
    return {
      success: true,
      balances: balances.map(b => `${b.currency}: ${b.currency === 'NGN' ? '₦' : '$'}${b.available_balance.toLocaleString()}`),
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

async function createFlutterwavePayment({ email, amount, currency = 'NGN', title, customer_name, phone }) {
  try {
    const key = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!key) return { error: 'FLUTTERWAVE_SECRET_KEY not set' };
    
    const tx_ref = `maganu-${Date.now()}`;
    const res = await axios.post('https://api.flutterwave.com/v3/payments', {
      tx_ref,
      amount,
      currency,
      redirect_url: process.env.FLUTTERWAVE_CALLBACK_URL || 'https://superagent-2286fb2f.base44.app/functions/harzWebhook',
      customer: { email, phonenumber: phone || '', name: customer_name || '' },
      customizations: { title: title || 'Harz Ecosystem Payment' },
      payment_options: 'card,banktransfer,ussd,account',
    }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    
    return {
      success: true,
      tx_ref,
      checkout_url: res.data.data.link,
      amount: `${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString()}`,
    };
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

async function getFlutterwaveTransactions(limit = 10) {
  try {
    const key = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!key) return { error: 'FLUTTERWAVE_SECRET_KEY not set' };
    
    const res = await axios.get(`https://api.flutterwave.com/v3/transactions?per_page=${limit}`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    
    const txns = res.data?.data || [];
    return txns.map(t => 
      `${t.customer?.email || 'Unknown'} — ${t.currency === 'NGN' ? '₦' : '$'}${t.amount.toLocaleString()} — ${t.status} — ${t.created_at?.slice(0,10)}`
    ).join('\n') || 'No transactions yet.';
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}

// ============ UNIFIED PAYMENT LINK ============

async function createPaymentLink({ gateway, email, amount, currency, title, description, customer_name, phone }) {
  if (gateway === 'paystack') {
    return createPaystackPayment({ email, amount, currency, title, description });
  } else if (gateway === 'stripe') {
    return createStripeCheckout({ email, amount, currency: (currency || 'usd').toLowerCase(), product_name: title });
  } else if (gateway === 'flutterwave') {
    return createFlutterwavePayment({ email, amount, currency, title, customer_name, phone });
  } else {
    // Auto-select: NGN → Paystack, USD → Stripe
    if (currency === 'NGN' || currency === 'ngn') {
      return createPaystackPayment({ email, amount, currency: 'NGN', title, description });
    } else {
      return createStripeCheckout({ email, amount, currency: currency || 'usd', product_name: title });
    }
  }
}

// ============ COMBINED REPORT ============

async function getFullPaymentReport() {
  const [paystack, stripe] = await Promise.all([getPaystackStats(), getStripeStats()]);

  let report = `💳 *Financial Report — ${new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}*\n\n`;

  report += `*PAYSTACK*\n`;
  if (paystack.error) {
    report += `❌ ${paystack.error}\n`;
  } else {
    report += `Mode: ${paystack.mode === 'LIVE' ? '🟢 LIVE' : '🟡 TEST'}\n`;
    report += `Balance: ${paystack.balance}\n`;
    report += `Transactions: ${paystack.successfulTxns}/${paystack.totalTxns} successful\n`;
    report += `Revenue: ${paystack.totalRevenue}\n`;
    report += `Customers: ${paystack.customers}\n`;
    if (paystack.recent && paystack.recent.length) {
      report += `Recent:\n`;
      paystack.recent.forEach(t => {
        report += `  ${t.email} — ₦${t.amount.toLocaleString()} (${t.status})\n`;
      });
    }
  }

  report += `\n*STRIPE*\n`;
  if (stripe.error) {
    report += `❌ ${stripe.error}\n`;
  } else {
    report += `Balance: ${stripe.balance}\n`;
    report += `Charges: ${stripe.succeededCharges}/${stripe.totalCharges} succeeded\n`;
    report += `Revenue: ${stripe.totalRevenue}\n`;
    if (stripe.recentCharges && stripe.recentCharges.length) {
      report += `Recent:\n`;
      stripe.recentCharges.forEach(c => {
        report += `  ${c.email} — ${c.amount} (${c.status})\n`;
      });
    }
  }

  // Try Flutterwave if configured
  const flutterwave = await getFlutterwaveBalance();
  if (flutterwave.success) {
    report += `\n*FLUTTERWAVE*\n`;
    report += `Balance: ${flutterwave.balances.join(', ')}\n`;
  }

  report += `\n*GATEWAY STATUS*\n`;
  report += `Paystack: ${process.env.PAYSTACK_SECRET_KEY ? '✅ Connected' : '❌ Not set'}\n`;
  report += `Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Connected' : '❌ Not set'}\n`;
  report += `Flutterwave: ${process.env.FLUTTERWAVE_SECRET_KEY ? '✅ Connected' : '❌ Not set'}\n`;
  report += `\n_Dashboard: https://superagent-2286fb2f.base44.app/functions/paystackDashboard_`;

  return report;
}

module.exports = {
  // Paystack — Transactions
  createPaystackPayment, initiateTransfer, finalizeTransfer,
  createRecipient, verifyAccount, listBanks, refundTransaction, getTransactionDetails,
  // Paystack — Dashboard
  getPaystackBalance, getPaystackTransactions, getPaystackStats,
  // Stripe
  getStripeBalance, getStripeTransactions, getStripeStats,
  createStripeCheckout, createStripeRefund,
  // Flutterwave
  getFlutterwaveBalance, createFlutterwavePayment, getFlutterwaveTransactions,
  // Unified
  createPaymentLink, getFullPaymentReport,
};
