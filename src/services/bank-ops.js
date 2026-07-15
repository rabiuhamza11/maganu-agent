// Maganu Universal Bank Operations Service — v7.3
// Manage ANY bank Rabiu asks about — Nigerian + International
// Bank lookup, USSD codes, account verification, quick transfer, bulk transfer,
// SWIFT/IBAN, bank comparison, bank branches, customer service

const axios = require('axios');
const payments = require('./payments');

// ============ NIGERIAN BANKS DATABASE ============
const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank', ussd: '*901#', phone: '0700CALLACCESS', swift: 'ABNGNGLA', type: 'commercial' },
  { code: '063', name: 'Access Bank (Diamond)', ussd: '*426#', phone: '0700CALLACCESS', swift: 'ABNGNGLA', type: 'commercial' },
  { code: '035A', name: 'ALAT by Wema', ussd: '*945#', phone: '0800800945', swift: 'WEMANGLA', type: 'digital' },
  { code: '401', name: 'ASO Savings and Loans', ussd: '*894#', phone: '08006662700', swift: 'ASOSNGLA', type: 'mortgage' },
  { code: '403', name: 'Standard Trust Bank', ussd: '*822#', phone: '08080082222', swift: 'STBTNGLA', type: 'commercial' },
  { code: '050', name: 'Ecobank Nigeria', ussd: '*326#', phone: '08002253262', swift: 'ECOCNGLA', type: 'commercial' },
  { code: '562', name: 'Eyowo', ussd: '*622#', phone: '01700236', swift: '', type: 'fintech' },
  { code: '084', name: 'Fidelity Bank', ussd: '*770#', phone: '08003331111', swift: 'FIDTNGLA', type: 'commercial' },
  { code: '070', name: 'First Bank of Nigeria', ussd: '*894#', phone: '01700180', swift: 'FBNINGLA', type: 'commercial' },
  { code: '214', name: 'First City Monument Bank (FCMB)', ussd: '*329#', phone: '0700787888', swift: 'FCMBNGLA', type: 'commercial' },
  { code: '058', name: 'GTBank', ussd: '*737#', phone: '08002255555', swift: 'GTBANGLA', type: 'commercial' },
  { code: '057', name: 'Zenith Bank', ussd: '*966#', phone: '08005000000', swift: 'ZEIBNGLA', type: 'commercial' },
  { code: '030', name: 'Heritage Bank', ussd: '*745#', phone: '08006666666', swift: 'HBCLNGLA', type: 'commercial' },
  { code: '082', name: 'Keystone Bank', ussd: '*711#', phone: '08007000700', swift: 'KEYBNGLA', type: 'commercial' },
  { code: '076', name: 'Polaris Bank', ussd: '*833#', phone: '08007000000', swift: 'PBOANGLA', type: 'commercial' },
  { code: '232', name: 'Sterling Bank', ussd: '*822#', phone: '08080082222', swift: 'STBTNGLA', type: 'commercial' },
  { code: '221', name: 'Stanbic IBTC Bank', ussd: '*909#', phone: '08001259888', swift: 'SBICNGLX', type: 'commercial' },
  { code: '068', name: 'Standard Chartered Bank', ussd: '*977#', phone: '08008800000', swift: 'SCBLNGLA', type: 'commercial' },
  { code: '032', name: 'Union Bank', ussd: '*826#', phone: '08008888999', swift: 'UBNNGLA', type: 'commercial' },
  { code: '033', name: 'United Bank for Africa (UBA)', ussd: '*919#', phone: '08002255322', swift: 'UNAFNGLA', type: 'commercial' },
  { code: '215', name: 'Unity Bank', ussd: '*7799#', phone: '08002255322', swift: 'UNTNGLA', type: 'commercial' },
  { code: '035', name: 'Wema Bank', ussd: '*945#', phone: '0800800945', swift: 'WEMANGLA', type: 'commercial' },
  { code: '560', name: 'Providus Bank', ussd: '*331#', phone: '08008888888', swift: 'PRVNGLA', type: 'commercial' },
  { code: '231', name: 'Citibank Nigeria', ussd: '', phone: '08002255555', swift: 'CITINGLA', type: 'commercial' },
  { code: '301', name: 'Jaiz Bank', ussd: '*773#', phone: '08002255322', swift: 'JAIZNGLA', type: 'islamic' },
  { code: '072', name: 'Titan Trust Bank', ussd: '*822#', phone: '08080082222', swift: 'TTBNGLA', type: 'commercial' },
  { code: '526', name: 'Taj Bank', ussd: '*898#', phone: '08002255322', swift: 'TAJNGLA', type: 'islamic' },
  { code: '503', name: 'Kuda Microfinance Bank', ussd: '', phone: '08000000000', swift: 'KUDANGLA', type: 'digital' },
  { code: '090', name: 'Opay Digital Services', ussd: '*955#', phone: '08000000000', swift: '', type: 'fintech' },
  { code: '100', name: 'Palmpay', ussd: '*861#', phone: '08000000000', swift: '', type: 'fintech' },
  { code: '999', name: 'VBank', ussd: '*822#', phone: '08080082222', swift: 'VBNGLA', type: 'digital' },
  { code: '551', name: 'FSDH Merchant Bank', ussd: '', phone: '08000000000', swift: 'FSDHNGLA', type: 'merchant' },
  { code: '509', name: 'Rand Merchant Bank', ussd: '', phone: '08000000000', swift: 'RMBNGLA', type: 'merchant' },
  { code: '522', name: 'Coronation Merchant Bank', ussd: '', phone: '08000000000', swift: 'CMBNGLA', type: 'merchant' },
  { code: '536', name: 'Globus Bank', ussd: '', phone: '08000000000', swift: 'GLOBNGLA', type: 'commercial' },
  { code: '541', name: 'Premium Trust Bank', ussd: '', phone: '08000000000', swift: 'PTBNGLA', type: 'commercial' },
  { code: '542', name: 'Parallex Bank', ussd: '', phone: '08000000000', swift: 'PARANGLA', type: 'commercial' },
];

// ============ INTERNATIONAL BANKS (SWIFT) ============
const INTL_BANKS = {
  'USA': [
    { name: 'JPMorgan Chase', swift: 'CHASUS33', phone: '+1-212-270-6000', type: 'commercial' },
    { name: 'Bank of America', swift: 'BOFAUS3N', phone: '+1-800-432-1000', type: 'commercial' },
    { name: 'Wells Fargo', swift: 'WFBIUS6S', phone: '+1-800-869-3557', type: 'commercial' },
    { name: 'Citibank', swift: 'CITIUS33', phone: '+1-800-374-9700', type: 'commercial' },
    { name: 'Goldman Sachs', swift: 'GSCRUS33', phone: '+1-212-902-1000', type: 'investment' },
  ],
  'UK': [
    { name: 'HSBC UK', swift: 'HBUKGB22', phone: '+44-1226-261010', type: 'commercial' },
    { name: 'Barclays Bank', swift: 'BARCGB22', phone: '+44-845-755-5555', type: 'commercial' },
    { name: 'Lloyds Bank', swift: 'LOYDGB22', phone: '+44-845-300-0000', type: 'commercial' },
    { name: 'NatWest', swift: 'NWBKGB22', phone: '+44-800-200-400', type: 'commercial' },
    { name: 'Standard Chartered', swift: 'SCBLGB22', phone: '+44-207-885-8888', type: 'commercial' },
  ],
  'GHANA': [
    { name: 'Ecobank Ghana', swift: 'ECOCGHAC', phone: '+233-302-740400', type: 'commercial' },
    { name: 'GCB Bank', swift: 'GCBGGHAC', phone: '+233-302-680600', type: 'commercial' },
    { name: 'Stanbic Bank Ghana', swift: 'SBICGHAC', phone: '+233-302-740400', type: 'commercial' },
    { name: 'Fidelity Bank Ghana', swift: 'FIDTGHAC', phone: '+233-302-740400', type: 'commercial' },
  ],
  'KENYA': [
    { name: 'KCB Bank Kenya', swift: 'KCBLKENX', phone: '+254-20-2880000', type: 'commercial' },
    { name: 'Equity Bank Kenya', swift: 'EQBLKENA', phone: '+254-763-063000', type: 'commercial' },
    { name: 'Standard Chartered Kenya', swift: 'SCBLKENX', phone: '+254-20-3293000', type: 'commercial' },
    { name: 'Co-operative Bank Kenya', swift: 'KCOOKENA', phone: '+254-20-3276000', type: 'commercial' },
  ],
  'SOUTH_AFRICA': [
    { name: 'Standard Bank', swift: 'SBZAZAJJ', phone: '+27-11-631-4000', type: 'commercial' },
    { name: 'FirstRand Bank (FNB)', swift: 'FIRNZAJJ', phone: '+27-11-632-3000', type: 'commercial' },
    { name: 'ABSA Bank', swift: 'ABSAZAJJ', phone: '+27-11-501-7000', type: 'commercial' },
    { name: 'Nedbank', swift: 'NEDSZAJJ', phone: '+27-11-630-7000', type: 'commercial' },
  ],
  'CANADA': [
    { name: 'RBC Royal Bank', swift: 'ROCCCAT2', phone: '+1-800-769-2511', type: 'commercial' },
    { name: 'TD Canada Trust', swift: 'TDOMCATX', phone: '+1-866-222-3456', type: 'commercial' },
    { name: 'Bank of Montreal', swift: 'BOFMCAM2', phone: '+1-800-363-9992', type: 'commercial' },
    { name: 'Scotiabank', swift: 'NOSCCATT', phone: '+1-800-472-6842', type: 'commercial' },
  ],
  'EUROPE': [
    { name: 'Deutsche Bank (Germany)', swift: 'DEUTDEFF', phone: '+49-69-910-00', type: 'commercial' },
    { name: 'BNP Paribas (France)', swift: 'BNPAFRPP', phone: '+33-1-40-14-45-00', type: 'commercial' },
    { name: 'Santander (Spain)', swift: 'BSCHESMM', phone: '+34-906-206-666', type: 'commercial' },
    { name: 'ING Bank (Netherlands)', swift: 'INGBNL2A', phone: '+31-20-563-9111', type: 'commercial' },
    { name: 'UBS (Switzerland)', swift: 'UBSWCHZH', phone: '+41-44-234-1111', type: 'investment' },
  ],
  'DUBAI': [
    { name: 'Emirates NBD', swift: 'EBILAEAD', phone: '+971-600-340000', type: 'commercial' },
    { name: 'Mashreq Bank', swift: 'BOMLAEAD', phone: '+971-600-533333', type: 'commercial' },
    { name: 'Abu Dhabi Commercial Bank', swift: 'ADCBAEAA', phone: '+971-600-202020', type: 'commercial' },
  ],
  'CHINA': [
    { name: 'Bank of China', swift: 'BKCHCNBJ', phone: '+86-10-66596688', type: 'commercial' },
    { name: 'ICBC', swift: 'ICBKCNBJ', phone: '+86-10-66105799', type: 'commercial' },
  ],
};

// ============ HELPER FUNCTIONS ============
function naira(amt) {
  return '\u20a6' + Number(amt).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function findBanks(query) {
  if (!query) return [];
  var q = query.toLowerCase().trim();
  if (q.startsWith('*')) {
    return NIGERIAN_BANKS.filter(function(b) { return b.ussd === q; });
  }
  if (/^\d{3}[a-z]?$/.test(q)) {
    return NIGERIAN_BANKS.filter(function(b) { return b.code.toLowerCase() === q; });
  }
  return NIGERIAN_BANKS.filter(function(b) {
    return b.name.toLowerCase().includes(q);
  });
}

function getUniqueBanks() {
  var seen = {};
  var unique = [];
  NIGERIAN_BANKS.forEach(function(b) {
    var key = b.code + '|' + b.name;
    if (!seen[key]) { seen[key] = true; unique.push(b); }
  });
  return unique;
}

// ============ BANK LOOKUP /bankinfo [name|code|ussd] ============
async function bankLookup(args) {
  var query = args.join(' ').trim();
  if (!query) {
    return '\uD83C\uDFD6\uFE0F *Bank Lookup*\n\nUsage:\n/bankinfo [bank name | code | USSD]\n\nExamples:\n/bankinfo UBA\n/bankinfo 033\n/bankinfo *919#\n/bankinfo GTB\n\nAlso try:\n/banklist \u2014 all Nigerian banks\n/banksintl [country] \u2014 international banks\n/ussd [bank name] \u2014 get USSD code\n/bankcompare [bank1] | [bank2]\n/quicksend [amt] | [acct] | [bank_code] | [reason]';
  }
  
  var results = findBanks(query);
  
  if (!results.length) {
    var countryUpper = query.toUpperCase().replace(/\s/g, '_');
    if (INTL_BANKS[countryUpper]) {
      var intlBanks = INTL_BANKS[countryUpper];
      var msg = '\uD83C\uDF0D *Banks in ' + query.toUpperCase() + '*\n\n';
      intlBanks.forEach(function(b) {
        msg += b.name + '\n   SWIFT: ' + (b.swift || 'N/A') + '\n   Phone: ' + (b.phone || 'N/A') + '\n   Type: ' + (b.type || 'commercial') + '\n\n';
      });
      return msg;
    }
    return 'No bank found for "' + query + '". Try /banklist or /banksintl [country].';
  }
  
  var seen = {};
  var unique = [];
  results.forEach(function(b) {
    var key = b.code + b.name;
    if (!seen[key]) { seen[key] = true; unique.push(b); }
  });
  
  var msg = '\uD83C\uDFD6\uFE0F *Bank Information*\n\n';
  unique.forEach(function(b) {
    msg += '*' + b.name + '*\n';
    msg += '   Code: ' + b.code + '\n';
    if (b.ussd) msg += '   USSD: ' + b.ussd + '\n';
    if (b.swift) msg += '   SWIFT: ' + b.swift + '\n';
    if (b.phone) msg += '   Customer Service: ' + b.phone + '\n';
    msg += '   Type: ' + (b.type || 'commercial') + '\n\n';
  });
  
  if (unique.length === 1) {
    var b = unique[0];
    msg += '*Quick Actions:*\n';
    msg += '/verify [account] | ' + b.code + ' \u2014 Verify account\n';
    msg += '/quicksend [amount] | [account] | ' + b.code + ' | [reason] \u2014 Instant transfer\n';
    msg += '/recipient [name] | [account] | ' + b.code + ' \u2014 Create recipient';
  }
  
  return msg;
}

// ============ BANK LIST /banklist ============
async function bankList() {
  var unique = getUniqueBanks();
  var commercial = unique.filter(function(b) { return b.type === 'commercial'; });
  var digital = unique.filter(function(b) { return b.type === 'digital' || b.type === 'fintech'; });
  var islamic = unique.filter(function(b) { return b.type === 'islamic'; });
  var merchant = unique.filter(function(b) { return b.type === 'merchant'; });
  var mortgage = unique.filter(function(b) { return b.type === 'mortgage'; });
  
  var msg = '\uD83C\uDFD6\uFE0F *All Nigerian Banks (' + unique.length + ' total)*\n\n';
  
  msg += '*COMMERCIAL BANKS*\n';
  commercial.forEach(function(b) {
    msg += b.code + ' \u2014 ' + b.name + (b.ussd ? ' (' + b.ussd + ')' : '') + '\n';
  });
  
  if (digital.length) {
    msg += '\n*DIGITAL / FINTECH*\n';
    digital.forEach(function(b) {
      msg += b.code + ' \u2014 ' + b.name + (b.ussd ? ' (' + b.ussd + ')' : '') + '\n';
    });
  }
  
  if (islamic.length) {
    msg += '\n*ISLAMIC BANKS*\n';
    islamic.forEach(function(b) {
      msg += b.code + ' \u2014 ' + b.name + (b.ussd ? ' (' + b.ussd + ')' : '') + '\n';
    });
  }
  
  if (merchant.length) {
    msg += '\n*MERCHANT BANKS*\n';
    merchant.forEach(function(b) {
      msg += b.code + ' \u2014 ' + b.name + '\n';
    });
  }
  
  if (mortgage.length) {
    msg += '\n*MORTGAGE BANKS*\n';
    mortgage.forEach(function(b) {
      msg += b.code + ' \u2014 ' + b.name + '\n';
    });
  }
  
  msg += '\n_Search: /bankinfo [name|code|ussd]_';
  msg += '\n_Transfer: /quicksend [amt] | [acct] | [code] | [reason]_';
  
  return msg;
}

// ============ USSD LOOKUP /ussd [bank name] ============
async function ussdLookup(args) {
  var query = args.join(' ').trim();
  if (!query) {
    var msg = '\uD83D\uDCF1 *Bank USSD Codes*\n\n';
    var withUssd = NIGERIAN_BANKS.filter(function(b) { return b.ussd; });
    var seen = {};
    withUssd.forEach(function(b) {
      var key = b.ussd + b.name;
      if (!seen[key]) {
        seen[key] = true;
        msg += b.name + ': ' + b.ussd + '\n';
      }
    });
    msg += '\n_Search: /ussd [bank name]_';
    return msg;
  }
  
  var results = findBanks(query);
  if (!results.length) return 'No bank found for "' + query + '". Try /banklist for all banks.';
  
  var seen = {};
  var msg = '\uD83D\uDCF1 *USSD Code*\n\n';
  results.forEach(function(b) {
    var key = b.name;
    if (!seen[key]) {
      seen[key] = true;
      if (b.ussd) {
        msg += b.name + ': ' + b.ussd + '\n';
        msg += 'Code: ' + b.code + ' | Customer Service: ' + (b.phone || 'N/A') + '\n';
      } else {
        msg += b.name + ': No USSD code available\n';
      }
    }
  });
  return msg;
}

// ============ QUICK SEND /quicksend [amount] | [account] | [bank_code] | [reason] ============
async function quickSend(args) {
  var parts = args.join(' ').split('|').map(function(s) { return s.trim(); });
  var amountStr = parts[0];
  var accountNumber = parts[1];
  var bankCode = parts[2];
  var reason = parts[3] || 'Maganu Quick Transfer';
  
  if (!amountStr || !accountNumber || !bankCode) {
    return '\u26A1 *Quick Send \u2014 Instant Bank Transfer*\n\nUsage: /quicksend [amount] | [account_number] | [bank_code] | [reason]\n\nThis will:\n1. Verify the account name\n2. Create a transfer recipient\n3. Send money immediately\n\nExample:\n/quicksend 5000 | 2034326424 | 033 | Rent payment\n/quicksend 10000 | 0123456789 | 058 | Supplier payment\n\nFind bank codes: /banklist or /bankinfo [name]';
  }
  
  var amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return '\u274C Invalid amount. Use numbers like 5000 or 10000.';
  
  // Step 1: Verify account
  var verifyResult = await payments.verifyAccount({ account_number: accountNumber, bank_code: bankCode });
  if (verifyResult.error) return '\u274C Account verification failed: ' + verifyResult.error;
  
  // Step 2: Create recipient with verified name
  var recipientResult = await payments.createRecipient({
    name: verifyResult.account_name,
    account_number: accountNumber,
    bank_code: bankCode,
  });
  if (recipientResult.error) return '\u274C Recipient creation failed: ' + recipientResult.error;
  
  // Step 3: Initiate transfer
  var transferResult = await payments.initiateTransfer({
    amount: amount,
    recipient_code: recipientResult.recipient_code,
    reason: reason,
  });
  
  if (transferResult.error) return '\u274C Transfer failed: ' + transferResult.error;
  
  var msg = '\u26A1 *Quick Send Complete*\n\n';
  msg += '\u2705 Account Verified: ' + verifyResult.account_name + '\n';
  msg += '   Account: ' + accountNumber + '\n';
  msg += '   Bank Code: ' + bankCode + '\n\n';
  msg += 'Amount: ' + naira(amount * 100) + '\n';
  msg += 'Reason: ' + reason + '\n';
  msg += 'Transfer Code: ' + transferResult.transfer_code + '\n';
  msg += 'Status: ' + transferResult.status + '\n';
  msg += 'Reference: ' + (transferResult.reference || 'N/A') + '\n';
  
  if (transferResult.status === 'pending') {
    msg += '\n\uD83D\uDD10 Finalize with OTP:\n/finalize ' + transferResult.transfer_code + ' | [OTP]';
  } else if (transferResult.status === 'success') {
    msg += '\n\u2705 Transfer successful!';
  }
  
  return msg;
}

// ============ BULK SEND /bulksend ============
async function bulkSend(args) {
  var input = args.join(' ');
  
  if (!input || input === 'help') {
    return '\uD83D\uDCE6 *Bulk Send \u2014 Multi-Account Transfer*\n\nUsage: /bulksend [amount] | [account1:bankcode1:name1], [account2:bankcode2:name2], ...\n\nExample:\n/bulksend 5000 | 2034326424:033:Rabiu, 0123456789:058:John\n\nSends the same amount to multiple accounts at once.\nMax 10 accounts per bulk send.';
  }
  
  var parts = input.split('|').map(function(s) { return s.trim(); });
  var amountStr = parts[0];
  var accountsStr = parts[1];
  
  if (!amountStr || !accountsStr) return 'Usage: /bulksend [amount] | [account1:bankcode1:name1], [account2:bankcode2:name2], ...';
  
  var amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return '\u274C Invalid amount';
  
  var accounts = accountsStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  if (accounts.length > 10) return '\u274C Max 10 accounts per bulk send. You provided ' + accounts.length + '.';
  if (accounts.length === 0) return '\u274C No accounts provided.';
  
  var results = [];
  var totalAmount = 0;
  
  for (var i = 0; i < accounts.length; i++) {
    var p = accounts[i].split(':').map(function(s) { return s.trim(); });
    var acct = p[0];
    var bankCode = p[1];
    var name = p[2] || 'Recipient ' + (i + 1);
    
    if (!acct || !bankCode) {
      results.push({ account: acct || '?', status: 'skipped', error: 'Missing account or bank code' });
      continue;
    }
    
    var recipientResult = await payments.createRecipient({
      name: name, account_number: acct, bank_code: bankCode,
    });
    
    if (recipientResult.error) {
      results.push({ account: acct, name: name, status: 'failed', error: recipientResult.error });
      continue;
    }
    
    var transferResult = await payments.initiateTransfer({
      amount: amount, recipient_code: recipientResult.recipient_code, reason: 'Bulk transfer',
    });
    
    if (transferResult.error) {
      results.push({ account: acct, name: name, status: 'failed', error: transferResult.error });
    } else {
      results.push({
        account: acct, name: name, status: transferResult.status,
        code: transferResult.transfer_code, amount: amount,
      });
      totalAmount += amount;
    }
  }
  
  var msg = '\uD83D\uDCE6 *Bulk Transfer Results*\n\n';
  msg += 'Amount per account: ' + naira(amount * 100) + '\n';
  msg += 'Accounts: ' + accounts.length + '\n';
  msg += 'Total: ' + naira(totalAmount * 100) + '\n\n';
  
  var success = 0, failed = 0;
  results.forEach(function(r, i) {
    var icon = r.status === 'success' ? '\u2705' : r.status === 'pending' ? '\u23F3' : '\u274C';
    msg += (i + 1) + '. ' + icon + ' ' + r.name + ' (' + r.account + ')\n';
    msg += '   Status: ' + r.status + '\n';
    if (r.code) msg += '   Code: ' + r.code + '\n';
    if (r.error) msg += '   Error: ' + r.error + '\n';
    if (r.status === 'success' || r.status === 'pending') success++;
    else failed++;
  });
  
  msg += '\n\u2705 Success: ' + success + ' | \u274C Failed: ' + failed;
  
  return msg;
}

// ============ INTERNATIONAL BANKS /banksintl [country] ============
async function internationalBanks(args) {
  var country = (args.join(' ') || '').trim().toUpperCase().replace(/\s/g, '_');
  
  if (!country) {
    var msg = '\uD83C\uDF0D *International Banks*\n\nAvailable countries:\n';
    Object.keys(INTL_BANKS).forEach(function(c) {
      var label = c.replace(/_/g, ' ');
      msg += '\u2022 ' + label + ' (' + INTL_BANKS[c].length + ' banks)\n';
    });
    msg += '\nUsage: /banksintl [country]\nExample: /banksintl USA\n/banksintl UK\n/banksintl Ghana';
    return msg;
  }
  
  if (!INTL_BANKS[country]) {
    return 'No banks found for "' + country + '". Available: ' + Object.keys(INTL_BANKS).join(', ');
  }
  
  var banks = INTL_BANKS[country];
  var label = country.replace(/_/g, ' ');
  var msg = '\uD83C\uDF0D *Banks in ' + label + '*\n\n';
  
  banks.forEach(function(b) {
    msg += '*' + b.name + '*\n';
    msg += '   SWIFT/BIC: ' + (b.swift || 'N/A') + '\n';
    msg += '   Phone: ' + (b.phone || 'N/A') + '\n';
    msg += '   Type: ' + (b.type || 'commercial') + '\n\n';
  });
  
  msg += '_For international transfers, use the SWIFT/BIC code with your bank wire transfer service._';
  return msg;
}

// ============ BANK COMPARE /bankcompare [bank1] | [bank2] ============
async function bankCompare(args) {
  var parts = args.join(' ').split('|').map(function(s) { return s.trim(); });
  var q1 = parts[0], q2 = parts[1];
  
  if (!q1 || !q2) {
    return '\u2696\uFE0F *Bank Comparison*\n\nUsage: /bankcompare [bank1] | [bank2]\n\nExample:\n/bankcompare UBA | GTBank\n/bankcompare 033 | 058\n/bankcompare Access | Zenith';
  }
  
  var banks1 = findBanks(q1);
  var banks2 = findBanks(q2);
  
  if (!banks1.length) return 'No bank found for "' + q1 + '". Try /banklist.';
  if (!banks2.length) return 'No bank found for "' + q2 + '". Try /banklist.';
  
  var b1 = banks1[0];
  var b2 = banks2[0];
  
  var msg = '\u2696\uFE0F *Bank Comparison*\n\n';
  msg += '           ' + b1.name + ' | ' + b2.name + '\n';
  msg += 'Code      ' + b1.code + '          | ' + b2.code + '\n';
  msg += 'USSD      ' + (b1.ussd || 'N/A') + '      | ' + (b2.ussd || 'N/A') + '\n';
  msg += 'SWIFT     ' + (b1.swift || 'N/A') + '  | ' + (b2.swift || 'N/A') + '\n';
  msg += 'Phone     ' + (b1.phone || 'N/A') + ' | ' + (b2.phone || 'N/A') + '\n';
  msg += 'Type      ' + (b1.type || 'commercial') + ' | ' + (b2.type || 'commercial') + '\n';
  
  msg += '\n*Transfer Support:*\nBoth banks support transfers via Paystack.\n\n';
  msg += '*Quick Actions:*\n';
  msg += '/quicksend [amount] | [account] | ' + b1.code + ' | [reason]\n';
  msg += '/quicksend [amount] | [account] | ' + b2.code + ' | [reason]\n';
  msg += '/verify [account] | ' + b1.code + '\n';
  msg += '/verify [account] | ' + b2.code;
  
  return msg;
}

// ============ SWIFT LOOKUP /swift [bank name or code] ============
async function swiftLookup(args) {
  var query = args.join(' ').trim();
  if (!query) return 'Usage: /swift [bank name or code]\n\nExample:\n/swift UBA\n/swift 033\n/swift Access Bank';
  
  var ngResults = findBanks(query);
  if (ngResults.length) {
    var b = ngResults[0];
    if (b.swift) {
      return '\uD83C\uDF10 *SWIFT Code*\n\n' + b.name + '\nSWIFT/BIC: ' + b.swift + '\nCode: ' + b.code + '\n\nUsed for international wire transfers.';
    }
    return 'No SWIFT code available for ' + b.name + '. This bank may not support direct international transfers.';
  }
  
  for (var country in INTL_BANKS) {
    for (var i = 0; i < INTL_BANKS[country].length; i++) {
      var ib = INTL_BANKS[country][i];
      if (ib.name.toLowerCase().includes(query.toLowerCase()) || ib.swift === query.toUpperCase()) {
        return '\uD83C\uDF10 *SWIFT Code*\n\n' + ib.name + ' (' + country.replace(/_/g, ' ') + ')\nSWIFT/BIC: ' + ib.swift + '\nPhone: ' + (ib.phone || 'N/A') + '\nType: ' + (ib.type || 'commercial');
      }
    }
  }
  
  return 'No bank found for "' + query + '". Try /banklist or /banksintl [country].';
}

// ============ IBAN VALIDATOR /iban [iban number] ============
function validateIBAN(args) {
  var iban = args.join(' ').replace(/\s/g, '').toUpperCase();
  if (!iban) return 'Usage: /iban [IBAN number]\n\nExample:\n/iban GB82WEST12345698765432';
  
  if (iban.length < 15 || iban.length > 34) {
    return '\u274C Invalid IBAN length. IBANs are 15-34 characters.\nYour input: ' + iban.length + ' characters.';
  }
  
  var countryCode = iban.slice(0, 2);
  var checkDigits = iban.slice(2, 4);
  var bban = iban.slice(4);
  
  var rearranged = bban + iban.slice(0, 4);
  var numericStr = '';
  for (var i = 0; i < rearranged.length; i++) {
    var ch = rearranged[i];
    if (/[A-Z]/.test(ch)) {
      numericStr += (ch.charCodeAt(0) - 55).toString();
    } else if (/[0-9]/.test(ch)) {
      numericStr += ch;
    }
  }
  
  var remainder = 0;
  for (var j = 0; j < numericStr.length; j++) {
    remainder = (remainder * 10 + parseInt(numericStr[j])) % 97;
  }
  
  var isValid = remainder === 1;
  
  var msg = '\uD83C\uDF10 *IBAN Validation*\n\n';
  msg += 'IBAN: ' + iban + '\n';
  msg += 'Country: ' + countryCode + '\n';
  msg += 'Check Digits: ' + checkDigits + '\n';
  msg += 'BBAN: ' + bban + '\n';
  msg += 'Length: ' + iban.length + ' characters\n';
  msg += 'Valid: ' + (isValid ? '\u2705 YES \u2014 Valid IBAN' : '\u274C NO \u2014 Invalid checksum');
  
  if (isValid) {
    msg += '\n\nThis IBAN passed mod-97 checksum validation.';
  } else {
    msg += '\n\nThe checksum failed. Please verify the IBAN number.';
  }
  
  return msg;
}

// ============ TRANSFER STATUS /transferstatus [transfer_code] ============
async function transferStatus(args) {
  var code = args.join(' ').trim();
  if (!code) return 'Usage: /transferstatus [transfer_code]\n\nExample:\n/transferstatus TRF_abc123';
  
  try {
    var key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return '\u274C PAYSTACK_SECRET_KEY not configured';
    var res = await axios.get('https://api.paystack.co/transfer/lookup/' + code, {
      headers: { Authorization: 'Bearer ' + key },
    });
    var data = res.data && res.data.data;
    if (!data) return 'No transfer found with code ' + code;
    
    var msg = '\uD83D\uDCB8 *Transfer Status*\n\n';
    msg += 'Amount: ' + naira(data.amount || 0) + '\n';
    msg += 'Status: ' + data.status + '\n';
    msg += 'Reference: ' + (data.reference || 'N/A') + '\n';
    msg += 'Reason: ' + (data.reason || 'N/A') + '\n';
    msg += 'Transfer Code: ' + (data.transfer_code || code) + '\n';
    msg += 'Created: ' + (data.created_at ? data.created_at.slice(0, 19).replace('T', ' ') : 'N/A') + '\n';
    
    if (data.recipient) {
      msg += '\n*Recipient:*\n';
      msg += 'Name: ' + (data.recipient.name || 'N/A') + '\n';
      msg += 'Account: ' + (data.recipient.details && data.recipient.details.account_number || 'N/A') + '\n';
      msg += 'Bank: ' + (data.recipient.details && data.recipient.details.bank_name || 'N/A') + '\n';
    }
    
    return msg;
  } catch (err) {
    return 'Error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ ACCOUNT HISTORY /acchistory [account] | [bank_code] ============
async function accountHistory(args) {
  var parts = args.join(' ').split('|').map(function(s) { return s.trim(); });
  var accountNumber = parts[0];
  var bankCode = parts[1];
  
  if (!accountNumber || !bankCode) {
    return '\uD83D\uDCD3 *Account History*\n\nUsage: /acchistory [account_number] | [bank_code]\n\nShows all transfers involving this account.\n\nExample:\n/acchistory 2034326424 | 033';
  }
  
  try {
    var key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return '\u274C PAYSTACK_SECRET_KEY not configured';
    
    var res = await axios.get('https://api.paystack.co/transfer?perPage=50', {
      headers: { Authorization: 'Bearer ' + key },
    });
    var transfers = res.data && res.data.data ? res.data.data : [];
    
    var matching = transfers.filter(function(t) {
      return t.recipient && t.recipient.details && t.recipient.details.account_number === accountNumber;
    });
    
    if (!matching.length) {
      var verifyResult = await payments.verifyAccount({ account_number: accountNumber, bank_code: bankCode });
      if (verifyResult.error) return '\u274C Account not found or invalid.';
      return 'No transfer history for account ' + accountNumber + ' (' + verifyResult.account_name + ').';
    }
    
    var bankInfo = findBanks(bankCode);
    var bankName = bankInfo.length ? bankInfo[0].name : bankCode;
    
    var msg = '\uD83D\uDCD3 *Account History*\n\n';
    msg += 'Account: ' + accountNumber + '\n';
    msg += 'Bank: ' + bankName + '\n';
    msg += 'Transfers: ' + matching.length + '\n\n';
    
    var totalSent = 0;
    matching.slice(0, 15).forEach(function(t, i) {
      var amt = (t.amount || 0) / 100;
      totalSent += amt;
      var date = t.created_at ? t.created_at.slice(0, 10) : 'N/A';
      msg += (i + 1) + '. ' + naira(t.amount || 0) + ' \u2014 ' + t.status + ' \u2014 ' + date + '\n';
      if (t.reason) msg += '   Reason: ' + t.reason + '\n';
    });
    
    msg += '\nTotal sent: ' + naira(totalSent * 100);
    
    return msg;
  } catch (err) {
    return 'Error: ' + ((err.response && err.response.data && err.response.data.message) || err.message);
  }
}

// ============ BANK STATS /bankstats ============
async function bankStats() {
  var unique = getUniqueBanks();
  var commercial = unique.filter(function(b) { return b.type === 'commercial'; }).length;
  var digital = unique.filter(function(b) { return b.type === 'digital' || b.type === 'fintech'; }).length;
  var islamic = unique.filter(function(b) { return b.type === 'islamic'; }).length;
  var merchant = unique.filter(function(b) { return b.type === 'merchant'; }).length;
  var mortgage = unique.filter(function(b) { return b.type === 'mortgage'; }).length;
  var withUssd = NIGERIAN_BANKS.filter(function(b) { return b.ussd; }).length;
  var withSwift = NIGERIAN_BANKS.filter(function(b) { return b.swift; }).length;
  var intlCount = 0;
  for (var c in INTL_BANKS) intlCount += INTL_BANKS[c].length;
  
  var msg = '\uD83D\uDCCA *Banking Statistics*\n\n';
  msg += '*Nigerian Banks: ' + unique.length + '*\n';
  msg += 'Commercial: ' + commercial + '\n';
  msg += 'Digital/Fintech: ' + digital + '\n';
  msg += 'Islamic: ' + islamic + '\n';
  msg += 'Merchant: ' + merchant + '\n';
  msg += 'Mortgage: ' + mortgage + '\n';
  msg += 'With USSD: ' + withUssd + '\n';
  msg += 'With SWIFT: ' + withSwift + '\n\n';
  msg += '*International Banks: ' + intlCount + '*\n';
  Object.keys(INTL_BANKS).forEach(function(c) {
    msg += c.replace(/_/g, ' ') + ': ' + INTL_BANKS[c].length + ' banks\n';
  });
  msg += '\n*Commands:*\n/bankinfo [name] \u2014 Bank details\n/banklist \u2014 All Nigerian banks\n/banksintl [country] \u2014 International banks\n/ussd [bank] \u2014 USSD code\n/swift [bank] \u2014 SWIFT code\n/quicksend \u2014 Instant transfer\n/bulksend \u2014 Bulk transfer\n/bankcompare \u2014 Compare banks\n/iban \u2014 Validate IBAN\n/transferstatus \u2014 Check transfer\n/acchistory \u2014 Account history';
  
  return msg;
}

module.exports = {
  bankLookup,
  bankList,
  ussdLookup,
  quickSend,
  bulkSend,
  internationalBanks,
  bankCompare,
  swiftLookup,
  validateIBAN,
  transferStatus,
  accountHistory,
  bankStats,
  findBanks,
  NIGERIAN_BANKS,
  INTL_BANKS,
};
