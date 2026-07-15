// Maganu KYC & Identity Verification Service — v7.3
// Integrates Smile ID for BVN, NIN, and bank account verification
// Also includes Mono for open banking (real account data)
// Requires: SMILE_ID_PARTNER_ID, SMILE_ID_API_KEY, MONO_SECRET_KEY

const axios = require('axios');
const crypto = require('crypto');

// ============ SMILE ID CONFIG ============
const SMILE_BASE = 'https://api.smileidentity.com/v1';

function getSmileConfig() {
  return {
    partnerId: process.env.SMILE_ID_PARTNER_ID,
    apiKey: process.env.SMILE_ID_API_KEY,
    sandbox: process.env.SMILE_ID_SANDBOX !== 'false',
  };
}

function isSmileConfigured() {
  return !!(process.env.SMILE_ID_PARTNER_ID && process.env.SMILE_ID_API_KEY);
}

// Generate Smile ID signature
function generateSmileSignature(timestamp, partnerId, apiKey) {
  var signature = crypto
    .createHmac('sha256', apiKey)
    .update(timestamp + partnerId)
    .digest('hex');
  return signature;
}

// ============ BVN VERIFICATION /verifybvn [bvn] ============
async function verifyBVN(args) {
  var bvn = args.join(' ').trim();
  
  if (!bvn) {
    return '\uD83D\uDD0D *BVN Verification*\n\nUsage: /verifybvn [BVN number]\n\nExample:\n/verifybvn 12345678901\n\nThis verifies a Bank Verification Number through Smile ID and returns the name of the account holder.\n\n' + (isSmileConfigured() ? '\u2705 Smile ID: Connected' : '\u26A0\uFE0F Smile ID: Not configured. Set SMILE_ID_PARTNER_ID and SMILE_ID_API_KEY to enable.');
  }
  
  // BVN is 11 digits
  if (!/^[0-9]{11}$/.test(bvn)) {
    return '\u274C Invalid BVN format. BVN must be exactly 11 digits.';
  }
  
  if (!isSmileConfigured()) {
    return '\u26A0\uFE0F *Smile ID Not Configured*\n\nTo enable BVN verification, you need:\n1. Sign up at https://smile.id (contact sales@smile.id)\n2. Get your Partner ID and API Key\n3. Set environment variables:\n   SMILE_ID_PARTNER_ID=your_partner_id\n   SMILE_ID_API_KEY=your_api_key\n   SMILE_ID_SANDBOX=false (for production)\n\nOnce configured, /verifybvn will return real BVN data from NIBSS.';
  }
  
  try {
    var config = getSmileConfig();
    var timestamp = new Date().toISOString();
    var signature = generateSmileSignature(timestamp, config.partnerId, config.apiKey);
    
    var payload = {
      partner_id: config.partnerId,
      timestamp: timestamp,
      signature: signature,
      smile_client_id: config.partnerId,
      country: 'NG',
      id_type: 'BVN',
      id_number: bvn,
      product: 'basic_kyc',
      callback_url: '',  // Synchronous
    };
    
    var url = (config.sandbox ? 'https://api.smileidentity.com/v1' : 'https://api.smileidentity.com/v1') + '/id_verification';
    
    var res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    
    var data = res.data;
    
    if (data.ResultCode === '1012') {
      // Success
      var msg = '\u2705 *BVN Verified*\n\n';
      msg += 'BVN: ' + bvn + '\n';
      msg += 'Name: ' + (data.FullName || data.full_name || 'N/A') + '\n';
      if (data.DateOfBirth || data.dob) msg += 'DOB: ' + (data.DateOfBirth || data.dob) + '\n';
      if (data.PhoneNumber || data.phone_number) msg += 'Phone: ' + (data.PhoneNumber || data.phone_number) + '\n';
      if (data.Gender || data.gender) msg += 'Gender: ' + (data.Gender || data.gender) + '\n';
      if (data.Address || data.address) msg += 'Address: ' + (data.Address || data.address) + '\n';
      msg += '\nVerification: Smile ID \u2705\nSource: NIBSS (Nigeria Inter-Bank Settlement System)';
      return msg;
    } else {
      return '\u274C *BVN Verification Failed*\n\nResult Code: ' + (data.ResultCode || 'unknown') + '\nMessage: ' + (data.ResultText || data.ResultMessage || 'No record found');
    }
  } catch (err) {
    var errMsg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    return '\u274C Error verifying BVN: ' + errMsg;
  }
}

// ============ NIN VERIFICATION /verifynin [nin] ============
async function verifyNIN(args) {
  var nin = args.join(' ').trim();
  
  if (!nin) {
    return '\uD83D\uDD0D *NIN Verification*\n\nUsage: /verifynin [NIN number]\n\nExample:\n/verifynin 12345678901\n\nVerifies a National Identification Number through Smile ID.\n\n' + (isSmileConfigured() ? '\u2705 Smile ID: Connected' : '\u26A0\uFE0F Smile ID: Not configured. Set SMILE_ID_PARTNER_ID and SMILE_ID_API_KEY.');
  }
  
  if (!/^[0-9]{11}$/.test(nin)) {
    return '\u274C Invalid NIN format. NIN must be exactly 11 digits.';
  }
  
  if (!isSmileConfigured()) {
    return '\u26A0\uFE0F *Smile ID Not Configured*\n\nTo enable NIN verification:\n1. Sign up at https://smile.id\n2. Get Partner ID and API Key\n3. Set: SMILE_ID_PARTNER_ID, SMILE_ID_API_KEY\n\n' + getVerificationChecklist();
  }
  
  try {
    var config = getSmileConfig();
    var timestamp = new Date().toISOString();
    var signature = generateSmileSignature(timestamp, config.partnerId, config.apiKey);
    
    var payload = {
      partner_id: config.partnerId,
      timestamp: timestamp,
      signature: signature,
      smile_client_id: config.partnerId,
      country: 'NG',
      id_type: 'NIN',
      id_number: nin,
      product: 'basic_kyc',
      callback_url: '',
    };
    
    var url = 'https://api.smileidentity.com/v1/id_verification';
    
    var res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    
    var data = res.data;
    
    if (data.ResultCode === '1012') {
      var msg = '\u2705 *NIN Verified*\n\n';
      msg += 'NIN: ' + nin + '\n';
      msg += 'Name: ' + (data.FullName || 'N/A') + '\n';
      if (data.DateOfBirth) msg += 'DOB: ' + data.DateOfBirth + '\n';
      if (data.Gender) msg += 'Gender: ' + data.Gender + '\n';
      if (data.PhoneNumber) msg += 'Phone: ' + data.PhoneNumber + '\n';
      if (data.Address) msg += 'Address: ' + data.Address + '\n';
      msg += '\nVerification: Smile ID \u2705\nSource: NIMC (National Identity Management Commission)';
      return msg;
    } else {
      return '\u274C *NIN Verification Failed*\n\nResult Code: ' + (data.ResultCode || 'unknown') + '\nMessage: ' + (data.ResultText || data.ResultMessage || 'No record found');
    }
  } catch (err) {
    return '\u274C Error verifying NIN: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
  }
}

// ============ BANK ACCOUNT VERIFICATION /verifyacct [account] | [bank_code] ============
async function verifyBankAccount(args) {
  var parts = args.join(' ').split('|').map(function(s) { return s.trim(); });
  var accountNumber = parts[0];
  var bankCode = parts[1];
  
  if (!accountNumber || !bankCode) {
    return '\uD83D\uDD0D *Bank Account KYC Verification*\n\nUsage: /verifyacct [account_number] | [bank_code]\n\nThis uses Smile ID to verify the account holder name via NIBSS.\n\nExample:\n/verifyacct 2034326424 | 033\n\n' + (isSmileConfigured() ? '\u2705 Smile ID: Connected' : '\u26A0\uFE0F Smile ID: Not configured.');
  }
  
  if (!isSmileConfigured()) {
    return '\u26A0\uFE0F *Smile ID Not Configured*\n\nSet SMILE_ID_PARTNER_ID and SMILE_ID_API_KEY to enable.\n\nAlternatively, use /verify [account] | [bank_code] for Paystack verification (already available).';
  }
  
  try {
    var config = getSmileConfig();
    var timestamp = new Date().toISOString();
    var signature = generateSmileSignature(timestamp, config.partnerId, config.apiKey);
    
    var payload = {
      partner_id: config.partnerId,
      timestamp: timestamp,
      signature: signature,
      smile_client_id: config.partnerId,
      country: 'NG',
      id_type: 'BANK_ACCOUNT',
      id_number: accountNumber,
      bank_code: bankCode,
      product: 'basic_kyc',
      callback_url: '',
    };
    
    var url = 'https://api.smileidentity.com/v1/id_verification';
    
    var res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    
    var data = res.data;
    
    if (data.ResultCode === '1012') {
      return '\u2705 *Bank Account Verified (KYC)*\n\nAccount: ' + accountNumber + '\nBank Code: ' + bankCode + '\nName: ' + (data.FullName || 'N/A') + '\n\nSource: NIBSS via Smile ID';
    } else {
      return '\u274C *Verification Failed*\n\nResult Code: ' + (data.ResultCode || 'unknown') + '\nMessage: ' + (data.ResultText || 'No record found');
    }
  } catch (err) {
    return '\u274C Error: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
  }
}

// ============ MONO OPEN BANKING ============
function isMonoConfigured() {
  return !!process.env.MONO_SECRET_KEY;
}

// /linkbank — Generate Mono Connect link
async function linkBankAccount(args) {
  if (!isMonoConfigured()) {
    return '\uD83D\uDD17 *Link Bank Account via Mono*\n\nTo enable real bank account data:\n1. Sign up at https://mono.co\n2. Complete KYB (business verification)\n3. Create a Connect App and get your Secret Key\n4. Set environment variable:\n   MONO_SECRET_KEY=your_secret_key\n\nOnce configured, /linkbank will generate a link for users to connect their real bank accounts. Apex Bank will show real balances and transactions.\n\n*Pricing:* ~\u20a619 ($0.05) per API call with volume discounts.';
  }
  
  try {
    // Create a connect link
    var res = await axios.post('https://api.withmono.com/v1/connect/session', {
      scope: 'auth',
    }, {
      headers: {
        'mono-sec-key': process.env.MONO_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    if (res.data && res.data.data && res.data.data.session_id) {
      var sessionId = res.data.data.session_id;
      var connectUrl = 'https://connect.withmono.com/?session=' + sessionId;
      
      return '\uD83D\uDD17 *Bank Account Link*\n\nShare this link with the customer to connect their bank account:\n\n' + connectUrl + '\n\nAfter they link their account, use:\n/acctbalance [code] \u2014 Get real balance\n/accttxns [code] \u2014 Get real transactions\n/acctinfo [code] \u2014 Get account details';
    }
    
    return '\u274C Could not create connect link. Check MONO_SECRET_KEY.';
  } catch (err) {
    return '\u274C Error: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
  }
}

// /acctbalance [code] — Get real account balance via Mono
async function getRealBalance(args) {
  var code = args.join(' ').trim();
  if (!code) return 'Usage: /acctbalance [account_code]\n\nThe code is returned after a user links their bank account via /linkbank.';
  
  if (!isMonoConfigured()) return '\u26A0\uFE0F MONO_SECRET_KEY not configured. Use /linkbank for setup instructions.';
  
  try {
    // Exchange code for account ID
    var exchangeRes = await axios.post('https://api.withmono.com/v1/connect/auth', 
      { code: code },
      { headers: { 'mono-sec-key': process.env.MONO_SECRET_KEY, 'Content-Type': 'application/json' } }
    );
    
    var accountId = exchangeRes.data && exchangeRes.data.id;
    if (!accountId) return '\u274C Could not authenticate account code.';
    
    // Get balance
    var balanceRes = await axios.get('https://api.withmono.com/v1/accounts/' + accountId + '/balance', {
      headers: { 'mono-sec-key': process.env.MONO_SECRET_KEY },
    });
    
    var bal = balanceRes.data && balanceRes.data.data;
    if (!bal) return '\u274C Could not fetch balance.';
    
    return '\uD83D\uDCB0 *Real Account Balance*\n\nBalance: ' + (bal.balance || 'N/A') + '\nAccount ID: ' + accountId + '\nSource: Live bank data via Mono \u2705';
  } catch (err) {
    return '\u274C Error: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
  }
}

// /accttxns [code] — Get real transactions via Mono
async function getRealTransactions(args) {
  var code = args.join(' ').trim();
  if (!code) return 'Usage: /accttxns [account_code]\n\nGet real transaction history from a linked bank account.';
  
  if (!isMonoConfigured()) return '\u26A0\uFE0F MONO_SECRET_KEY not configured.';
  
  try {
    var exchangeRes = await axios.post('https://api.withmono.com/v1/connect/auth',
      { code: code },
      { headers: { 'mono-sec-key': process.env.MONO_SECRET_KEY, 'Content-Type': 'application/json' } }
    );
    
    var accountId = exchangeRes.data && exchangeRes.data.id;
    if (!accountId) return '\u274C Could not authenticate.';
    
    var txnRes = await axios.get('https://api.withmono.com/v1/accounts/' + accountId + '/transactions?limit=20', {
      headers: { 'mono-sec-key': process.env.MONO_SECRET_KEY },
    });
    
    var txns = txnRes.data && txnRes.data.data;
    if (!txns || !txns.length) return 'No transactions found for this account.';
    
    var msg = '\uD83D\uDCD3 *Real Transactions (Live Bank Data)*\n\n';
    txns.slice(0, 15).forEach(function(t, i) {
      var amt = t.amount ? ('\u20a6' + (Math.abs(t.amount) / 100).toLocaleString()) : 'N/A';
      var type = t.amount < 0 ? '\u2193' : '\u2191';
      var date = t.date ? t.date.slice(0, 10) : 'N/A';
      msg += (i + 1) + '. ' + type + ' ' + amt + ' \u2014 ' + (t.narration || 'N/A') + ' \u2014 ' + date + '\n';
    });
    
    msg += '\nSource: Live bank data via Mono \u2705';
    return msg;
  } catch (err) {
    return '\u274C Error: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
  }
}

// ============ KYC STATUS /kycstatus ============
function kycStatus() {
  var msg = '\uD83D\uDD0D *KYC & Identity Verification Status*\n\n';
  
  // Smile ID
  msg += '*Smile ID (BVN/NIN KYC)*\n';
  if (isSmileConfigured()) {
    msg += '   Status: \u2705 Connected\n';
    msg += '   Partner ID: ' + process.env.SMILE_ID_PARTNER_ID + '\n';
    msg += '   Mode: ' + (process.env.SMILE_ID_SANDBOX !== 'false' ? 'Sandbox' : 'Production') + '\n';
  } else {
    msg += '   Status: \u274C Not configured\n';
    msg += '   Required: SMILE_ID_PARTNER_ID, SMILE_ID_API_KEY\n';
    msg += '   Sign up: https://smile.id (contact sales@smile.id)\n';
  }
  
  msg += '\n*Mono (Open Banking)*\n';
  if (isMonoConfigured()) {
    msg += '   Status: \u2705 Connected\n';
  } else {
    msg += '   Status: \u274C Not configured\n';
    msg += '   Required: MONO_SECRET_KEY\n';
    msg += '   Sign up: https://mono.co\n';
    msg += '   Pricing: ~\u20a619 per API call\n';
  }
  
  msg += '\n*Paystack (Transfers & Payments)*\n';
  if (process.env.PAYSTACK_SECRET_KEY) {
    var mode = process.env.PAYSTACK_SECRET_KEY.startsWith('sk_live') ? '\uD83D\uDFE2 LIVE' : '\uD83D\uDFE1 TEST';
    msg += '   Status: ' + mode + '\n';
  } else {
    msg += '   Status: \u274C Not configured\n';
  }
  
  msg += '\n*Available KYC Commands:*\n';
  msg += '/verifybvn [BVN] \u2014 Verify BVN (returns name, DOB)\n';
  msg += '/verifynin [NIN] \u2014 Verify NIN (returns name, DOB)\n';
  msg += '/verifyacct [acct] | [bank] \u2014 KYC bank account verification\n';
  msg += '/linkbank \u2014 Generate Mono Connect link (real bank data)\n';
  msg += '/acctbalance [code] \u2014 Get real account balance\n';
  msg += '/accttxns [code] \u2014 Get real transactions\n';
  msg += '/kycstatus \u2014 This status screen';
  
  return msg;
}

// ============ PAYSTACK BUSINESS VERIFICATION CHECKLIST ============
function getVerificationChecklist() {
  var msg = '\uD83D\uDCCB *Paystack Business Verification Checklist*\n\n';
  msg += '*Option 1: Starter Business (Fastest)*\n';
  msg += '\u2705 BVN (Bank Verification Number)\n';
  msg += '\u2705 Government ID (NIN, Driver\u2019s License, or Passport)\n';
  msg += '\u2705 Personal bank account number\n';
  msg += '\u2705 Business owner contact info\n';
  msg += '\u26A0\uFE0F All names must match across all documents\n\n';
  
  msg += '*Option 2: Registered Business (Full)*\n';
  msg += '\u2705 CAC Certificate of Incorporation\n';
  msg += '\u2705 RC Number (or BN Number for Business Name)\n';
  msg += '\u2705 Memorandum & Articles of Association\n';
  msg += '\u2705 Tax Identification Number (TIN)\n';
  msg += '\u2705 CAC Status Report\n';
  msg += '\u2705 Director BVN + ID (must consent via iGree)\n';
  msg += '\u2705 Proof of address (electricity/water/waste/cable bill \u2014 not older than 6 months)\n\n';
  
  msg += '*Steps to go live:*\n';
  msg += '1. Log into https://dashboard.paystack.com\n';
  msg += '2. Go to Settings \u2192 Business Profile\n';
  msg += '3. Select business type (Starter or Registered)\n';
  msg += '4. Upload required documents\n';
  msg += '5. Director consents to BVN validation via iGree\n';
  msg += '6. Paystack reviews (24-72 hours)\n';
  msg += '7. Once approved, switch from test keys to live keys\n';
  msg += '8. Update PAYSTACK_SECRET_KEY on Render with live key (sk_live_...)\n';
  msg += '\nCurrent status: TEST MODE \uD83D\uDFE1';
  
  return msg;
}

// /paystackverify — Show verification checklist
function paystackVerification() {
  return getVerificationChecklist();
}

module.exports = {
  verifyBVN,
  verifyNIN,
  verifyBankAccount,
  linkBankAccount,
  getRealBalance,
  getRealTransactions,
  kycStatus,
  paystackVerification,
  isSmileConfigured,
  isMonoConfigured,
  getVerificationChecklist,
};
