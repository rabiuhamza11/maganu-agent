// Maganu Banking Service v1.0 — Apex Bank + OmegaPayGlobal
// Calls the Base44 backend function at /functions/apexBank
const axios = require('axios');

const BANK_API = 'https://superagent-2286fb2f.base44.app/functions/apexBank';

async function callBank(action, data = {}, id = null) {
  try {
    const res = await axios.post(BANK_API, { action, data, id }, { timeout: 15000 });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// /bank — Full banking dashboard
async function handleBankDashboard() {
  const r = await callBank('omegaPayDashboard');
  if (!r.success) return `❌ Banking Error: ${r.error}`;
  const d = r.dashboard;
  let msg = `🏦 *Apex Bank + OmegaPayGlobal*\n\n`;
  msg += `Total Balance: *$${d.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}*\n`;
  msg += `Accounts: ${d.totalAccounts} | Cards: ${d.totalCards}\n`;
  msg += `Transactions: ${d.totalTransactions}\n`;
  msg += `Active Loans: ${d.activeLoans}\n`;
  msg += `Pending Bills: ${d.pendingBills.length}\n`;
  msg += `Savings Goals: ${d.activeSavingsGoals}\n`;
  msg += `Beneficiaries: ${d.totalBeneficiaries}\n\n`;
  msg += `*Accounts:*\n`;
  d.accounts.forEach(a => {
    const icon = a.account_type === 'savings' ? '💰' : a.account_type === 'checking' ? '🏦' : a.account_type === 'credit' ? '💳' : '📈';
    msg += `${icon} ${a.account_name} — $${(a.balance||0).toLocaleString()} (${a.account_number})\n`;
  });
  return msg;
}

// /accounts — List all accounts
async function handleAccounts() {
  const r = await callBank('listAccounts');
  if (!r.success) return `❌ ${r.error}`;
  let msg = `🏦 *Bank Accounts*\n\n`;
  r.accounts.forEach(a => {
    const icon = a.account_type === 'savings' ? '💰' : a.account_type === 'checking' ? '🏦' : a.account_type === 'credit' ? '💳' : '📈';
    msg += `${icon} ${a.account_name}\n  ${a.account_number} | $${(a.balance||0).toLocaleString()} | ${a.status}\n  ID: ${a.id}\n\n`;
  });
  msg += `\nTotal: *$${r.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}*`;
  return msg;
}

// /balance [account_id] — Check balance
async function handleBalance(args) {
  const r = await callBank('listAccounts');
  if (!r.success) return `❌ ${r.error}`;
  
  if (args.length === 0) {
    return `💰 *Total Balance: $${r.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}*\n\nUse /balance [account_id] for specific account.\nUse /accounts to see all account IDs.`;
  }
  
  const account = r.accounts.find(a => a.id === args[0] || a.account_number === args.join(' '));
  if (!account) return `❌ Account not found. Use /accounts to list all accounts.`;
  return `💰 *${account.account_name}*\n\nBalance: $${(account.balance||0).toLocaleString()}\nAccount: ${account.account_number}\nType: ${account.account_type}\nStatus: ${account.status}`;
}

// /txns [account_id] — List transactions
async function handleTransactions(args) {
  const accountId = args.length > 0 ? args[0] : null;
  const r = await callBank('listTransactions', { accountId });
  if (!r.success) return `❌ ${r.error}`;
  if (!r.transactions.length) return `📋 No transactions found.`;
  
  let msg = `📋 *Transactions*\n\n`;
  r.transactions.forEach(t => {
    const icon = t.type === 'credit' ? '✅' : t.type === 'debit' ? '❌' : '🔄';
    msg += `${icon} ${t.type.toUpperCase()} $${t.amount} — ${t.description}\n  Ref: ${t.reference} | ${t.status}\n\n`;
  });
  return msg;
}

// /cards — List all cards
async function handleCards() {
  const r = await callBank('listCards');
  if (!r.success) return `❌ ${r.error}`;
  if (!r.cards.length) return `💳 No cards found.`;
  
  let msg = `💳 *Bank Cards*\n\n`;
  r.cards.forEach(c => {
    const icon = c.card_type === 'visa' ? '💳' : c.card_type === 'mastercard' ? '💳' : '💎';
    msg += `${icon} ${c.card_type.toUpperCase()} •••• ${c.card_number?.slice(-4)}\n`;
    msg += `  Holder: ${c.card_holder_name}\n`;
    msg += `  Expires: ${c.expiry_month}/${c.expiry_year}\n`;
    msg += `  Status: ${c.status} | Limit: $${(c.daily_limit||0).toLocaleString()}\n`;
    msg += `  ID: ${c.id}\n\n`;
  });
  return msg;
}

// /loans — List all loans
async function handleLoans() {
  const r = await callBank('listLoans');
  if (!r.success) return `❌ ${r.error}`;
  if (!r.loans.length) return `🏦 No loans found.`;
  
  let msg = `🏦 *Loans*\n\n`;
  r.loans.forEach(l => {
    const icon = l.status === 'active' ? '🟢' : l.status === 'pending' ? '🟡' : '✅';
    msg += `${icon} ${l.loan_type.toUpperCase()} Loan — $${l.amount.toLocaleString()}\n`;
    msg += `  Rate: ${l.interest_rate}% | Term: ${l.tenure_months}mo\n`;
    msg += `  Monthly: $${(l.monthly_payment||0).toFixed(2)}\n`;
    msg += `  Paid: $${(l.amount_paid||0)} / $${l.amount}\n`;
    msg += `  Purpose: ${l.purpose}\n`;
    msg += `  Status: ${l.status}\n\n`;
  });
  return msg;
}

// /beneficiaries — List beneficiaries
async function handleBeneficiaries() {
  const r = await callBank('listBeneficiaries');
  if (!r.success) return `❌ ${r.error}`;
  if (!r.beneficiaries.length) return `👥 No beneficiaries found.`;
  
  let msg = `👥 *Beneficiaries*\n\n`;
  r.beneficiaries.forEach(b => {
    const flag = b.transfer_type === 'international' ? '🌍' : '🏠';
    msg += `${flag} ${b.name}\n`;
    msg += `  ${b.bank_name} — ${b.account_number}\n`;
    msg += `  ${b.country} | ${b.currency}\n`;
    if (b.swift_bic) msg += `  SWIFT: ${b.swift_bic}\n`;
    msg += `\n`;
  });
  return msg;
}

// /goals — List savings goals
async function handleGoals() {
  const r = await callBank('listSavingsGoals');
  if (!r.success) return `❌ ${r.error}`;
  if (!r.goals.length) return `🎯 No savings goals found.`;
  
  let msg = `🎯 *Savings Goals*\n\n`;
  r.goals.forEach(g => {
    const pct = g.target_amount > 0 ? ((g.current_amount/g.target_amount)*100).toFixed(0) : 0;
    const icon = g.status === 'completed' ? '✅' : g.status === 'active' ? '🎯' : '⏸️';
    msg += `${icon} ${g.name}\n`;
    msg += `  $${(g.current_amount||0).toLocaleString()} / $${g.target_amount.toLocaleString()} (${pct}%)\n`;
    msg += `  Deadline: ${g.deadline} | ${g.status}\n`;
    msg += `  ID: ${g.id}\n\n`;
  });
  return msg;
}

// /bills — List bills
async function handleBills() {
  const r = await callBank('listBills');
  if (!r.success) return `❌ ${r.error}`;
  if (!r.bills.length) return `🧾 No bills found.`;
  
  let msg = `🧾 *Bills*\n\n`;
  r.bills.forEach(b => {
    const icon = b.status === 'paid' ? '✅' : b.status === 'overdue' ? '🔴' : '🟡';
    msg += `${icon} ${b.biller_name} — $${b.amount}\n`;
    msg += `  Category: ${b.category} | Due: ${b.due_date}\n`;
    msg += `  Status: ${b.status} | Auto-pay: ${b.auto_pay ? 'Yes' : 'No'}\n`;
    msg += `  ID: ${b.id}\n\n`;
  });
  return msg;
}

// /paybill [bill_id] — Pay a bill
async function handlePayBill(args) {
  const billId = args.join(' ').trim();
  if (!billId) return `🧾 *Pay Bill*\n\nUsage: /paybill [bill_id]\n\nUse /bills to see bill IDs.`;
  const r = await callBank('payBill', {}, billId);
  if (!r.success) return `❌ ${r.error}`;
  return `🧾 *Bill Paid*\n\n${r.bill?.biller_name} — $${r.bill?.amount}\nStatus: Paid ✅\n\n${r.message}`;
}

// /convert [amount] [from] [to] — Currency conversion
async function handleConvert(args) {
  const [amountStr, from, to] = args;
  if (!amountStr || !from || !to) return `💱 *Currency Converter*\n\nUsage: /convert [amount] [from] [to]\n\nExample:\n/convert 1000 USD NGN\n/convert 500 EUR USD\n\nRates: USD, NGN, EUR, GBP, GHS, KES, ZAR, CAD`;
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return '❌ Invalid amount';
  
  const r = await callBank('convertCurrency', { from: from.toUpperCase(), to: to.toUpperCase(), amount });
  if (!r.success) return `❌ ${r.error}`;
  return `💱 *Currency Conversion*\n\n${amount} ${r.from} = *${r.converted.toFixed(2)} ${r.to}*\nRate: 1 ${r.from} = ${r.rate} ${r.to}`;
}

// /loan [amount] [rate] [months] — Calculate loan
async function handleLoanCalc(args) {
  const [amountStr, rateStr, monthsStr] = args;
  if (!amountStr || !rateStr || !monthsStr) return `🏦 *Loan Calculator*\n\nUsage: /loan [amount] [interest_rate%] [months]\n\nExample:\n/loan 25000 8.5 24\n/loan 100000 6.5 60`;
  
  const amount = parseFloat(amountStr);
  const rate = parseFloat(rateStr);
  const months = parseInt(monthsStr);
  
  const r = await callBank('calculateLoan', { amount, interestRate: rate, tenureMonths: months });
  if (!r.success) return `❌ ${r.error}`;
  return `🏦 *Loan Calculation*\n\nAmount: $${amount.toLocaleString()}\nRate: ${rate}% APR\nTerm: ${months} months\n\nMonthly Payment: *$${r.monthlyPayment.toFixed(2)}*\nTotal Payment: $${r.totalPayment.toFixed(2)}\nTotal Interest: $${r.totalInterest.toFixed(2)}`;
}

module.exports = {
  handleBankDashboard, handleAccounts, handleBalance, handleTransactions,
  handleCards, handleLoans, handleBeneficiaries, handleGoals, handleBills,
  handlePayBill, handleConvert, handleLoanCalc, callBank,
};
