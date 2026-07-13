// Maganu Payment Intelligence — Stripe + Paystack
const axios = require('axios');

// ============ PAYSTACK ============
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
    const res = await axios.get(`https://api.paystack.co/transaction?perPage=${limit}&status=success`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const txns = res.data?.data || [];
    if (!txns.length) return 'No successful transactions yet.';
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

// ============ STRIPE ============
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

// ============ COMBINED REPORT ============
async function getFullPaymentReport() {
  const [paystack, stripe] = await Promise.all([getPaystackStats(), getStripeStats()]);

  let report = `💳 *Payment Report — ${new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}*\n\n`;

  report += `*PAYSTACK*\n`;
  if (paystack.error) {
    report += `❌ ${paystack.error}\n`;
  } else {
    report += `Balance: ${paystack.balance}\n`;
    report += `Transactions: ${paystack.successfulTxns}/${paystack.totalTxns} successful\n`;
    report += `Revenue: ${paystack.totalRevenue}\n`;
    if (paystack.recentTxns?.length) {
      report += `Recent:\n`;
      paystack.recentTxns.forEach(t => {
        report += `  ${t.email} — ${t.amount} (${t.status})\n`;
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
    if (stripe.recentCharges?.length) {
      report += `Recent:\n`;
      stripe.recentCharges.forEach(c => {
        report += `  ${c.email} — ${c.amount} (${c.status})\n`;
      });
    }
  }

  return report;
}

module.exports = {
  getPaystackBalance, getPaystackTransactions, getPaystackStats,
  getStripeBalance, getStripeTransactions, getStripeStats,
  getFullPaymentReport
};
