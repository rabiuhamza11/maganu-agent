// Maganu Financial Operations Service — v7.0
// Handles financial transaction commands: transfers, payments, refunds, invoices
const payments = require('./payments');

// Format Naira
const naira = (amt) => `₦${Number(amt).toLocaleString('en-NG')}`;

// /pay [email] [amount] [currency] | [description]
// Creates a payment link and returns checkout URL
async function handlePay(args) {
  const [email, amountStr, currency = 'NGN', ...rest] = args;
  const description = rest.join(' ');
  
  if (!email || !amountStr) {
    return `💳 *Create Payment Link*\n\nUsage: /pay [email] [amount] [currency] | [description]\n\nExample:\n/pay customer@email.com 5000 NGN | BuildBot Pro Plan`;
  }
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return '❌ Invalid amount';
  
  const result = await payments.createPaymentLink({
    gateway: currency.toUpperCase() === 'NGN' ? 'paystack' : 'stripe',
    email, amount, currency: currency.toUpperCase(),
    title: description || 'Harz Ecosystem Payment',
    description,
  });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `💳 *Payment Link Created*\n\n`;
  msg += `Amount: ${result.amount}\n`;
  msg += `Email: ${email}\n`;
  msg += `Reference: ${result.reference || result.session_id || 'N/A'}\n`;
  msg += `\n🔗 Checkout URL:\n${result.checkout_url || result.checkout_url}\n`;
  msg += `\nShare this link with the customer to receive payment.`;
  return msg;
}

// /transfer [amount] | [recipient_code] | [reason]
// Initiates a bank transfer via Paystack
async function handleTransfer(args) {
  const [amountStr, recipientCode, ...reasonParts] = args;
  const reason = reasonParts.join(' ');
  
  if (!amountStr || !recipientCode) {
    return `💸 *Bank Transfer*\n\nUsage: /transfer [amount] | [recipient_code] | [reason]\n\nFirst create a recipient with:\n/recipient [name] | [account_number] | [bank_code]\n\nThen transfer with the recipient_code returned.\n\nSee banks: /banks`;
  }
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return '❌ Invalid amount';
  
  const result = await payments.initiateTransfer({
    amount, recipient_code: recipientCode, reason,
  });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `💸 *Transfer Initiated*\n\n`;
  msg += `Amount: ${result.amount}\n`;
  msg += `Status: ${result.status}\n`;
  msg += `Transfer Code: ${result.transfer_code}\n`;
  msg += `Reference: ${result.reference}\n`;
  msg += `\n${result.message}`;
  
  if (result.status === 'pending') {
    msg += `\n\nTo finalize: /finalize ${result.transfer_code} | [OTP]`;
  }
  return msg;
}

// /recipient [name] | [account_number] | [bank_code]
// Creates a transfer recipient
async function handleRecipient(args) {
  const [name, accountNumber, bankCode] = args;
  
  if (!name || !accountNumber || !bankCode) {
    return `🏦 *Create Transfer Recipient*\n\nUsage: /recipient [name] | [account_number] | [bank_code]\n\nExample:\n/recipient John Doe | 0123456789 | 057\n\nList banks: /banks`;
  }
  
  const result = await payments.createRecipient({
    name, account_number: accountNumber, bank_code: bankCode,
  });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `🏦 *Recipient Created*\n\n`;
  msg += `Name: ${result.name}\n`;
  msg += `Account: ${result.account_number}\n`;
  msg += `Bank: ${result.bank}\n`;
  msg += `Recipient Code: \`${result.recipient_code}\`\n`;
  msg += `\nUse this code to send money: /transfer [amount] | ${result.recipient_code} | [reason]`;
  return msg;
}

// /banks
// Lists all Nigerian banks with their codes
async function handleBanks() {
  const banks = await payments.listBanks();
  if (banks.error) return `❌ ${banks.error}`;
  if (!Array.isArray(banks)) return `❌ Unexpected response`;
  
  let msg = `🏦 *Nigerian Banks*\n\n`;
  // Show top 20 most common
  const top = banks.slice(0, 20);
  top.forEach(b => {
    msg += `${b.code} — ${b.name}\n`;
  });
  if (banks.length > 20) {
    msg += `\n... and ${banks.length - 20} more. Use /banks [search] to filter.`;
  }
  msg += `\n_Use the bank code for /verify and /recipient commands_`;
  return msg;
}

// /verify [account_number] | [bank_code]
// Verifies a bank account name
async function handleVerify(args) {
  const [accountNumber, bankCode] = args;
  
  if (!accountNumber || !bankCode) {
    return `🔍 *Verify Bank Account*\n\nUsage: /verify [account_number] | [bank_code]\n\nExample:\n/verify 0123456789 | 057\n\nList banks: /banks`;
  }
  
  const result = await payments.verifyAccount({ account_number: accountNumber, bank_code: bankCode });
  
  if (result.error) return `❌ ${result.error}`;
  
  return `🔍 *Account Verified*\n\nName: ${result.account_name}\nAccount: ${result.account_number}\n✅ Valid bank account`;
}

// /refund [reference] | [amount]
// Refunds a Paystack transaction
async function handleRefund(args) {
  const [reference, amountStr] = args;
  
  if (!reference) {
    return `🔄 *Refund Transaction*\n\nUsage: /refund [reference] | [amount (optional)]\n\nExample:\n/refund ref_abc123\n/refund ref_abc123 | 5000`;
  }
  
  const amount = amountStr ? parseFloat(amountStr) : undefined;
  if (amountStr && (isNaN(amount) || amount <= 0)) return '❌ Invalid amount';
  
  const result = await payments.refundTransaction({ reference, amount, note: 'Refund via Maganu AI' });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `🔄 *Refund Processed*\n\n`;
  msg += `Refund ID: ${result.refund_id}\n`;
  msg += `Amount: ${result.amount}\n`;
  msg += `Status: ${result.status}\n`;
  msg += `Reference: ${result.reference}\n`;
  msg += `\n${result.message}`;
  return msg;
}

// /txn [reference]
// Get full transaction details
async function handleTransaction(args) {
  const reference = args.join(' ').trim();
  if (!reference) return `📋 *Transaction Details*\n\nUsage: /txn [reference]\n\nExample:\n/txn ref_abc123`;
  
  const result = await payments.getTransactionDetails(reference);
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `📋 *Transaction Details*\n\n`;
  msg += `Reference: ${result.reference}\n`;
  msg += `Amount: ${result.amount}\n`;
  msg += `Status: ${result.status}\n`;
  msg += `Channel: ${result.channel}\n`;
  msg += `Platform: ${result.platform}\n`;
  msg += `Customer: ${result.customer?.email || 'N/A'}\n`;
  msg += `Fees: ${result.fees}\n`;
  msg += `Date: ${result.date?.slice(0, 19).replace('T', ' ')}\n`;
  msg += `Gateway: ${result.gateway_response}`;
  return msg;
}

// /finalize [transfer_code] | [otp]
// Finalize a pending transfer
async function handleFinalize(args) {
  const [transferCode, otp] = args;
  
  if (!transferCode || !otp) {
    return `✅ *Finalize Transfer*\n\nUsage: /finalize [transfer_code] | [OTP]\n\nThe OTP is sent to the email registered with your Paystack account.`;
  }
  
  const result = await payments.finalizeTransfer({ transfer_code: transferCode, otp });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `✅ *Transfer Finalized*\n\n`;
  msg += `Status: ${result.status}\n`;
  msg += `Transfer Code: ${result.transfer_code}\n`;
  msg += `\n${result.message}`;
  return msg;
}

// /flw [amount] | [email] | [customer_name] | [phone]
// Create Flutterwave payment link
async function handleFlutterwave(args) {
  const [amountStr, email, customerName, phone] = args;
  
  if (!amountStr || !email) {
    return `💙 *Flutterwave Payment*\n\nUsage: /flw [amount] | [email] | [customer_name] | [phone]\n\nExample:\n/flw 5000 | customer@email.com | John Doe | 08012345678`;
  }
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return '❌ Invalid amount';
  
  const result = await payments.createFlutterwavePayment({
    email, amount, currency: 'NGN',
    title: `Harz Payment - ${customerName || email}`,
    customer_name: customerName, phone,
  });
  
  if (result.error) return `❌ ${result.error}`;
  
  let msg = `💙 *Flutterwave Payment Link*\n\n`;
  msg += `Amount: ${result.amount}\n`;
  msg += `Reference: ${result.tx_ref}\n`;
  msg += `\n🔗 Checkout URL:\n${result.checkout_url}`;
  return msg;
}

// /gateway
// Show all payment gateway statuses
async function handleGatewayStatus() {
  let msg = `🔌 *Payment Gateways Status*\n\n`;
  
  // Paystack
  const ps = process.env.PAYSTACK_SECRET_KEY;
  if (ps) {
    const mode = ps.startsWith('sk_live') ? '🟢 LIVE' : '🟡 TEST';
    msg += `Paystack: ${mode} ✅\n`;
  } else {
    msg += `Paystack: ❌ Not configured\n`;
  }
  
  // Stripe
  const stripe = process.env.STRIPE_SECRET_KEY;
  if (stripe) {
    const mode = stripe.startsWith('sk_live') || stripe.startsWith('pk_live') ? '🟢 LIVE' : '🟡 TEST';
    msg += `Stripe: ${mode} ✅\n`;
  } else {
    msg += `Stripe: ❌ Not configured\n`;
  }
  
  // Flutterwave
  const flw = process.env.FLUTTERWAVE_SECRET_KEY;
  if (flw) {
    msg += `Flutterwave: ✅ Connected\n`;
  } else {
    msg += `Flutterwave: ❌ Not configured\n`;
  }
  
  msg += `\n*Commands:*\n`;
  msg += `/pay [email] [amt] [cur] | [desc] — Payment link\n`;
  msg += `/transfer [amt] | [recipient] | [reason] — Send money\n`;
  msg += `/recipient [name] | [acct] | [bank] — Create recipient\n`;
  msg += `/verify [acct] | [bank] — Verify account name\n`;
  msg += `/banks — List Nigerian banks\n`;
  msg += `/refund [ref] | [amt] — Refund transaction\n`;
  msg += `/txn [ref] — Transaction details\n`;
  msg += `/finalize [code] | [otp] — Finalize transfer\n`;
  msg += `/flw [amt] | [email] | [name] | [phone] — Flutterwave link\n`;
  msg += `/gateway — This status screen`;
  
  return msg;
}

module.exports = {
  handlePay, handleTransfer, handleRecipient, handleBanks,
  handleVerify, handleRefund, handleTransaction, handleFinalize,
  handleFlutterwave, handleGatewayStatus,
};
