// Maganu Bank Manager Operations — Real banking management
// Version: 1.0.0 — Bank manager dashboard, analytics, statements, risk monitoring
const axios = require('axios');

function paystackHeaders() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY not set');
  return { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
}

function getMode() {
  const key = process.env.PAYSTACK_SECRET_KEY || '';
  return key.startsWith('sk_live') ? 'LIVE' : 'TEST';
}

function formatNaira(kobo) {
  return '\u20a6' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============ BANK MANAGER DASHBOARD ============
async function managerDashboard() {
  try {
    var headers = paystackHeaders();
    var now = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
    
    // Fetch balance, recent transactions, settlements, customers in parallel
    var results = await Promise.allSettled([
      axios.get('https://api.paystack.co/balance', { headers }),
      axios.get('https://api.paystack.co/transaction?perPage=50', { headers }),
      axios.get('https://api.paystack.co/settlement?perPage=5', { headers }),
      axios.get('https://api.paystack.co/customer?perPage=100', { headers }),
      axios.get('https://api.paystack.co/transferrecipient?perPage=100', { headers })
    ]);
    
    var balData = results[0].status === 'fulfilled' ? (results[0].value.data.data || []) : [];
    var txns = results[1].status === 'fulfilled' ? (results[1].value.data.data || []) : [];
    var settlements = results[2].status === 'fulfilled' ? (results[2].value.data.data || []) : [];
    var customers = results[3].status === 'fulfilled' ? (results[3].value.data.data || []) : [];
    var recipients = results[4].status === 'fulfilled' ? (results[4].value.data.data || []) : [];
    
    var ngnBalance = balData.find(function(b) { return b.currency === 'NGN'; });
    var balanceAmt = ngnBalance ? formatNaira(ngnBalance.balance) : '\u20a60.00';
    
    // Transaction analytics
    var totalSuccess = 0, successAmt = 0, totalFailed = 0, totalPending = 0;
    var todayCount = 0, todayAmt = 0;
    var weekCount = 0, weekAmt = 0;
    var now2 = Date.now();
    var dayAgo = now2 - 86400000;
    var weekAgo = now2 - 604800000;
    
    txns.forEach(function(t) {
      var ts = new Date(t.created_at).getTime();
      if (t.status === 'success') { totalSuccess++; successAmt += (t.amount || 0) / 100; }
      else if (t.status === 'failed') totalFailed++;
      else if (t.status === 'pending' || t.status === 'queued') totalPending++;
      if (ts > dayAgo) { todayCount++; todayAmt += (t.amount || 0) / 100; }
      if (ts > weekAgo) { weekCount++; weekAmt += (t.amount || 0) / 100; }
    });
    
    var conversionRate = txns.length ? ((totalSuccess / txns.length) * 100).toFixed(1) : '0';
    var avgTxn = totalSuccess ? '\u20a6' + Math.round(successAmt / totalSuccess).toLocaleString() : '\u20a60';
    
    // Top customers by volume
    var custVol = {};
    txns.forEach(function(t) {
      if (t.status === 'success' && t.customer && t.customer.email) {
        var e = t.customer.email;
        custVol[e] = (custVolume[e] || 0) + (t.amount || 0) / 100;
      }
    });
    var topCusts = Object.entries(custVol).sort(function(a,b) { return b[1] - a[1]; }).slice(0, 3);
    
    var report = 'BANK MANAGER DASHBOARD (' + getMode() + ')\n';
    report += 'Updated: ' + now + '\n\n';
    report += 'ACCOUNT BALANCE\n' + balanceAmt + '\n\n';
    report += 'TRANSACTION SUMMARY (last 50)\n';
    report += 'Total: ' + txns.length + ' | Success: ' + totalSuccess + ' | Failed: ' + totalFailed + ' | Pending: ' + totalPending + '\n';
    report += 'Revenue: \u20a6' + successAmt.toLocaleString() + '\n';
    report += 'Conversion: ' + conversionRate + '%\n';
    report += 'Avg txn: ' + avgTxn + '\n\n';
    report += 'TODAY\n' + todayCount + ' txns | \u20a6' + todayAmt.toLocaleString() + '\n\n';
    report += 'THIS WEEK\n' + weekCount + ' txns | \u20a6' + weekAmt.toLocaleString() + '\n\n';
    report += 'CUSTOMERS: ' + customers.length + '\n';
    report += 'RECIPIENTS: ' + recipients.length + '\n';
    report += 'SETTLEMENTS: ' + settlements.length + '\n\n';
    
    if (topCusts.length) {
      report += 'TOP CUSTOMERS\n';
      topCusts.forEach(function(c, i) {
        report += (i+1) + '. ' + c[0].substring(0, 20) + ' — \u20a6' + Math.round(c[1]).toLocaleString() + '\n';
      });
    }
    
    report += '\nCommands:\n/mstmt [days] — account statement\n/mtransfers — pending transfers\n/mrisk — risk monitor\n/msettlements — settlement schedule\n/mcustomers — customer list\n/mrecipients — all recipients\n/mreport [weekly|monthly] — full report';
    
    return report;
  } catch (err) {
    return 'Dashboard error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ ACCOUNT STATEMENT ============
async function accountStatement(days) {
  days = parseInt(days) || 30;
  if (days > 365) days = 365;
  try {
    var headers = paystackHeaders();
    var since = new Date(Date.now() - days * 86400000).toISOString();
    var res = await axios.get('https://api.paystack.co/transaction?perPage=100&from=' + since.slice(0,10), { headers });
    var txns = res.data && res.data.data ? res.data.data : [];
    
    if (!txns.length) return 'No transactions in the last ' + days + ' days.';
    
    var totalIn = 0, totalOut = 0, count = 0;
    var byDay = {};
    
    txns.forEach(function(t) {
      var date = new Date(t.created_at).toLocaleDateString('en-NG');
      if (!byDay[date]) byDay[date] = { count: 0, amount: 0, success: 0 };
      byDay[date].count++;
      byDay[date].amount += (t.amount || 0) / 100;
      if (t.status === 'success') {
        byDay[date].success++;
        totalIn += (t.amount || 0) / 100;
        count++;
      }
    });
    
    var report = 'ACCOUNT STATEMENT — Last ' + days + ' days (' + getMode() + ')\n\n';
    report += 'Total transactions: ' + txns.length + '\n';
    report += 'Successful: ' + count + '\n';
    report += 'Total inflow: \u20a6' + totalIn.toLocaleString() + '\n';
    report += 'Avg per day: \u20a6' + Math.round(totalIn / days).toLocaleString() + '\n\n';
    report += 'DAILY BREAKDOWN\n';
    
    Object.entries(byDay).slice(0, 15).forEach(function(entry) {
      var date = entry[0];
      var d = entry[1];
      report += date + ': ' + d.count + ' txns | \u20a6' + Math.round(d.amount).toLocaleString() + ' | ' + d.success + ' success\n';
    });
    
    if (Object.keys(byDay).length > 15) {
      report += '... and ' + (Object.keys(byDay).length - 15) + ' more days\n';
    }
    
    return report;
  } catch (err) {
    return 'Statement error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ PENDING TRANSFERS ============
async function pendingTransfers() {
  try {
    var headers = paystackHeaders();
    var res = await axios.get('https://api.paystack.co/transfer?perPage=50', { headers });
    var transfers = res.data && res.data.data ? res.data.data : [];
    
    var pending = transfers.filter(function(t) { return t.status === 'pending' || t.status === 'queued' || t.status === 'processing'; });
    var completed = transfers.filter(function(t) { return t.status === 'success'; });
    var failed = transfers.filter(function(t) { return t.status === 'failed' || t.status === 'reversed'; });
    
    var report = 'TRANSFER MANAGEMENT (' + getMode() + ')\n\n';
    report += 'Total transfers: ' + transfers.length + '\n';
    report += 'Pending: ' + pending.length + ' | Completed: ' + completed.length + ' | Failed: ' + failed.length + '\n';
    
    var totalSent = completed.reduce(function(s, t) { return s + (t.amount || 0) / 100; }, 0);
    report += 'Total sent: \u20a6' + totalSent.toLocaleString() + '\n\n';
    
    if (pending.length) {
      report += 'PENDING TRANSFERS\n';
      pending.forEach(function(t, i) {
        report += (i+1) + '. ' + formatNaira(t.amount || 0) + ' — ' + (t.reason || 'N/A') + '\n   Ref: ' + (t.reference || 'N/A') + '\n   Code: ' + (t.transfer_code || 'N/A') + '\n   Status: ' + t.status + '\n';
      });
    }
    
    if (failed.length) {
      report += '\nFAILED TRANSFERS\n';
      failed.slice(0, 5).forEach(function(t, i) {
        report += (i+1) + '. ' + formatNaira(t.amount || 0) + ' — ' + (t.reason || 'N/A') + ' — ' + t.status + '\n';
      });
    }
    
    return report;
  } catch (err) {
    return 'Transfer query error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ RISK & FRAUD MONITOR ============
async function riskMonitor() {
  try {
    var headers = paystackHeaders();
    var res = await axios.get('https://api.paystack.co/transaction?perPage=100', { headers });
    var txns = res.data && res.data.data ? res.data.data : [];
    
    var flagged = [];
    var failedIPs = {};
    var highValue = [];
    var rapidFire = {};
    
    txns.forEach(function(t) {
      // High value transactions (> 100k NGN)
      if (t.amount > 10000000) {
        highValue.push(t);
      }
      // Failed transactions by IP (possible fraud)
      if (t.status === 'failed' && t.ip_address) {
        failedIPs[t.ip_address] = (failedIPs[t.ip_address] || 0) + 1;
      }
      // Rapid fire (same email, multiple txns in short time)
      if (t.customer && t.customer.email) {
        var key = t.customer.email;
        if (!rapidFire[key]) rapidFire[key] = [];
        rapidFire[key].push(new Date(t.created_at).getTime());
      }
    });
    
    // Detect rapid fire (3+ txns within 10 min)
    var rapidFlags = [];
    Object.keys(rapidFire).forEach(function(email) {
      var times = rapidFire[email].sort();
      for (var i = 0; i < times.length - 2; i++) {
        if (times[i+2] - times[i] < 600000) { // 10 minutes
          rapidFlags.push(email);
          break;
        }
      }
    });
    
    // Repeated failed attempts from same IP
    var suspiciousIPs = Object.entries(failedIPs).filter(function(e) { return e[1] >= 3; });
    
    var report = 'RISK & FRAUD MONITOR (' + getMode() + ')\n\n';
    report += 'Scanned: ' + txns.length + ' transactions\n\n';
    
    report += 'HIGH VALUE (> \u20a6100k)\n';
    if (highValue.length) {
      highValue.slice(0, 5).forEach(function(t) {
        report += '\u20a6' + ((t.amount||0)/100).toLocaleString() + ' — ' + (t.customer && t.customer.email || 'N/A') + ' — ' + t.status + '\n';
      });
    } else {
      report += 'None detected\n';
    }
    
    report += '\nSUSPICIOUS IPs (3+ failed attempts)\n';
    if (suspiciousIPs.length) {
      suspiciousIPs.forEach(function(ip) {
        report += ip[0] + ' — ' + ip[1] + ' failed attempts\n';
      });
    } else {
      report += 'None detected\n';
    }
    
    report += '\nRAPID FIRE (3+ txns in 10 min)\n';
    if (rapidFlags.length) {
      rapidFlags.slice(0, 5).forEach(function(e) {
        report += e + '\n';
      });
    } else {
      report += 'None detected\n';
    }
    
    var riskLevel = (highValue.length + suspiciousIPs.length + rapidFlags.length);
    report += '\nRISK LEVEL: ' + (riskLevel === 0 ? 'LOW' : riskLevel <= 3 ? 'MEDIUM' : 'HIGH') + ' (' + riskLevel + ' flags)\n';
    
    return report;
  } catch (err) {
    return 'Risk monitor error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ SETTLEMENT SCHEDULE ============
async function settlementSchedule() {
  try {
    var headers = paystackHeaders();
    var res = await axios.get('https://api.paystack.co/settlement?perPage=20', { headers });
    var settlements = res.data && res.data.data ? res.data.data : [];
    
    if (!settlements.length) return 'No settlements found. Settlements occur when Paystack pays out collected funds to your bank account.';
    
    var totalSettled = 0;
    var pending = [];
    var completed = [];
    
    settlements.forEach(function(s) {
      var amt = (s.total_amount || 0) / 100;
      if (s.status === 'success' || s.status === 'processed') {
        completed.push(s);
        totalSettled += amt;
      } else {
        pending.push(s);
      }
    });
    
    var report = 'SETTLEMENT SCHEDULE (' + getMode() + ')\n\n';
    report += 'Total settlements: ' + settlements.length + '\n';
    report += 'Completed: ' + completed.length + ' | Pending: ' + pending.length + '\n';
    report += 'Total settled: \u20a6' + totalSettled.toLocaleString() + '\n\n';
    
    if (pending.length) {
      report += 'PENDING SETTLEMENTS\n';
      pending.forEach(function(s, i) {
        report += (i+1) + '. \u20a6' + ((s.total_amount||0)/100).toLocaleString() + ' — ' + s.status + ' — ' + new Date(s.settlement_date).toLocaleDateString('en-NG') + '\n';
      });
    }
    
    report += '\nRECENT SETTLEMENTS\n';
    completed.slice(0, 5).forEach(function(s, i) {
      report += (i+1) + '. \u20a6' + ((s.total_amount||0)/100).toLocaleString() + ' — ' + s.status + ' — ' + new Date(s.settlement_date).toLocaleDateString('en-NG') + '\n';
    });
    
    return report;
  } catch (err) {
    return 'Settlement error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ CUSTOMER DIRECTORY ============
async function customerDirectory() {
  try {
    var headers = paystackHeaders();
    var res = await axios.get('https://api.paystack.co/customer?perPage=50', { headers });
    var customers = res.data && res.data.data ? res.data.data : [];
    
    if (!customers.length) return 'No customers found.';
    
    var verified = customers.filter(function(c) { return c.verified; });
    var unverified = customers.filter(function(c) { return !c.verified; });
    
    var report = 'CUSTOMER DIRECTORY (' + getMode() + ')\n\n';
    report += 'Total customers: ' + customers.length + '\n';
    report += 'Verified: ' + verified.length + ' | Unverified: ' + unverified.length + '\n\n';
    report += 'RECENT CUSTOMERS\n';
    
    customers.slice(0, 10).forEach(function(c, i) {
      var flag = c.verified ? 'V' : 'U';
      report += (i+1) + '. [' + flag + '] ' + (c.email || 'N/A') + ' — ' + (c.first_name || '') + ' ' + (c.last_name || '') + ' — ' + new Date(c.created_at || Date.now()).toLocaleDateString('en-NG') + '\n';
    });
    
    if (customers.length > 10) {
      report += '\n... and ' + (customers.length - 10) + ' more\n';
    }
    
    return report;
  } catch (err) {
    return 'Customer error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ RECIPIENT DIRECTORY ============
async function recipientDirectory() {
  try {
    var headers = paystackHeaders();
    var res = await axios.get('https://api.paystack.co/transferrecipient?perPage=100', { headers });
    var recipients = res.data && res.data.data ? res.data.data : [];
    
    if (!recipients.length) return 'No transfer recipients found.';
    
    var report = 'RECIPIENT DIRECTORY (' + getMode() + ')\n\n';
    report += 'Total recipients: ' + recipients.length + '\n\n';
    
    recipients.forEach(function(r, i) {
      report += (i+1) + '. ' + (r.name || 'N/A') + '\n   Account: ' + (r.details && r.details.account_number || 'N/A') + '\n   Bank: ' + (r.details && r.details.bank_name || r.details && r.details.bank_code || 'N/A') + '\n   Code: ' + (r.recipient_code || 'N/A') + '\n   Active: ' + (r.active ? 'YES' : 'NO') + '\n';
    });
    
    return report;
  } catch (err) {
    return 'Recipient error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ FULL REPORT (weekly or monthly) ============
async function fullReport(period) {
  period = period || 'weekly';
  var days = period === 'monthly' ? 30 : 7;
  
  try {
    var headers = paystackHeaders();
    var since = new Date(Date.now() - days * 86400000).toISOString();
    
    var results = await Promise.allSettled([
      axios.get('https://api.paystack.co/transaction?perPage=200&from=' + since.slice(0,10), { headers }),
      axios.get('https://api.paystack.co/balance', { headers }),
      axios.get('https://api.paystack.co/settlement?perPage=10', { headers })
    ]);
    
    var txns = results[0].status === 'fulfilled' ? (results[0].value.data.data || []) : [];
    var balances = results[1].status === 'fulfilled' ? (results[1].value.data.data || []) : [];
    var settlements = results[2].status === 'fulfilled' ? (results[2].value.data.data || []) : [];
    
    var totalSuccess = 0, successAmt = 0, totalFailed = 0;
    var byChannel = {};
    var byCurrency = {};
    var dailyAvg = 0;
    var peakDay = { date: 'N/A', amount: 0 };
    var byDay = {};
    
    txns.forEach(function(t) {
      if (t.status === 'success') {
        totalSuccess++;
        var amt = (t.amount || 0) / 100;
        successAmt += amt;
        var ch = t.channel || 'unknown';
        if (!byChannel[ch]) byChannel[ch] = { count: 0, amount: 0 };
        byChannel[ch].count++;
        byChannel[ch].amount += amt;
        
        var cur = t.currency || 'NGN';
        byCurrency[cur] = (byCurrency[cur] || 0) + amt;
        
        var date = new Date(t.created_at).toLocaleDateString('en-NG');
        if (!byDay[date]) byDay[date] = 0;
        byDay[date] += amt;
      } else if (t.status === 'failed') {
        totalFailed++;
      }
    });
    
    // Find peak day
    Object.entries(byDay).forEach(function(entry) {
      if (entry[1] > peakDay.amount) {
        peakDay = { date: entry[0], amount: entry[1] };
      }
    });
    
    dailyAvg = totalSuccess ? Math.round(successAmt / days) : 0;
    var conversionRate = txns.length ? ((totalSuccess / txns.length) * 100).toFixed(1) : '0';
    
    var ngnBal = balances.find(function(b) { return b.currency === 'NGN'; });
    var balStr = ngnBal ? formatNaira(ngnBal.balance) : '\u20a60.00';
    
    var periodLabel = period === 'monthly' ? 'MONTHLY REPORT (30 days)' : 'WEEKLY REPORT (7 days)';
    
    var report = periodLabel + ' (' + getMode() + ')\n';
    report += 'Generated: ' + new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) + '\n\n';
    report += 'BALANCE: ' + balStr + '\n\n';
    report += 'TRANSACTIONS\n';
    report += 'Total: ' + txns.length + '\n';
    report += 'Success: ' + totalSuccess + ' | Failed: ' + totalFailed + '\n';
    report += 'Revenue: \u20a6' + successAmt.toLocaleString() + '\n';
    report += 'Daily avg: \u20a6' + dailyAvg.toLocaleString() + '\n';
    report += 'Peak day: ' + peakDay.date + ' (\u20a6' + Math.round(peakDay.amount).toLocaleString() + ')\n';
    report += 'Conversion: ' + conversionRate + '%\n\n';
    
    if (Object.keys(byChannel).length) {
      report += 'BY PAYMENT CHANNEL\n';
      Object.entries(byChannel).sort(function(a,b) { return b[1].amount - a[1].amount; }).forEach(function(e) {
        report += e[0] + ': ' + e[1].count + ' txns | \u20a6' + Math.round(e[1].amount).toLocaleString() + '\n';
      });
    }
    
    if (settlements.length) {
      report += '\nSETTLEMENTS (recent)\n';
      settlements.slice(0, 3).forEach(function(s) {
        report += '\u20a6' + ((s.total_amount||0)/100).toLocaleString() + ' — ' + s.status + ' — ' + new Date(s.settlement_date).toLocaleDateString('en-NG') + '\n';
      });
    }
    
    return report;
  } catch (err) {
    return 'Report error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ QUICK WALLET CHECK ============
async function walletCheck() {
  try {
    var results = await Promise.allSettled([
      axios.get('https://api.paystack.co/balance', { headers: paystackHeaders() }),
      axios.get('https://api.stripe.com/v1/balance', { headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY } })
    ]);
    
    var report = 'WALLET BALANCES (' + getMode() + ')\n\n';
    
    if (results[0].status === 'fulfilled') {
      var psBalances = results[0].value.data.data || [];
      report += 'PAYSTACK\n';
      psBalances.forEach(function(b) {
        report += b.currency + ': ' + (b.currency === 'NGN' ? formatNaira(b.balance) : (b.balance/100).toLocaleString()) + '\n';
      });
    } else {
      report += 'PAYSTACK: Error\n';
    }
    
    report += '\n';
    
    if (results[1].status === 'fulfilled') {
      var stripeAvailable = results[1].value.data.available || [];
      report += 'STRIPE\n';
      stripeAvailable.forEach(function(b) {
        report += b.currency.toUpperCase() + ': $' + (b.amount/100).toFixed(2) + '\n';
      });
    } else {
      report += 'STRIPE: Error\n';
    }
    
    return report;
  } catch (err) {
    return 'Wallet check error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

module.exports = {
  managerDashboard,
  accountStatement,
  pendingTransfers,
  riskMonitor,
  settlementSchedule,
  customerDirectory,
  recipientDirectory,
  fullReport,
  walletCheck,
  getMode,
  formatNaira
};
