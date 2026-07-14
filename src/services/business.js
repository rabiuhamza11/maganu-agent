// Maganu Business Operations Service v1.0 — Email, PDF, Invoice, Tax
const axios = require('axios');

// === EMAIL AUTOMATION ===
// Uses Gmail via SMTP (nodemailer) or Resend API
const EMAIL_FROM = process.env.BUSINESS_EMAIL || 'harzco.business@gmail.com';

async function sendEmail(to, subject, body, fromName) {
  // Use Base44 Gmail bridge (live Gmail integration)
  try {
    const res = await axios.post('https://superagent-2286fb2f.base44.app/functions/emailBridge', {
      to, subject, body, fromName: fromName || 'Maganu AI'
    }, { timeout: 15000 });
    return res.data;
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

async function handleSendEmail(args) {
  // /email [to] | [subject] | [body]
  const parts = args.join(' ').split('|').map(s => s.trim());
  if (parts.length < 3) {
    return `📧 *Send Email*\n\nUsage: /email [recipient] | [subject] | [message]\n\nExample:\n/email client@email.com | Project Update | The construction plan is ready for review.`;
  }
  
  const [to, subject, ...bodyParts] = parts;
  const body = bodyParts.join(' | ');
  
  const result = await sendEmail(to, subject, body, 'Maganu AI');
  if (result.success) {
    return `📧 *Email Sent*\n\nTo: ${to}\nSubject: ${subject}\n\n✅ Delivered (ID: ${result.id})`;
  }
  if (result.mailto) {
    return `📧 *Email Drafted (No API Key)*\n\nTo: ${to}\nSubject: ${subject}\n\n⚠️ Set RESEND_API_KEY on Render for automatic sending.\n\nDraft link:\n${result.mailto}`;
  }
  return `❌ Email failed: ${result.error}`;
}

async function handleEmailTemplate(args) {
  const template = args[0]?.toLowerCase();
  const templates = {
    invoice: { subject: 'Invoice from Harz Ecosystem', body: 'Dear Customer,\n\nThank you for your business. Please find your invoice details below.\n\nAmount: [AMOUNT]\nDue Date: [DATE]\n\nPlease make payment to:\nUBA Bank - 2034326424\nAccount Name: Rabiu Hamza Mohammed\n\nRegards,\nHarz Ecosystem' },
    welcome: { subject: 'Welcome to Harz Ecosystem', body: 'Welcome!\n\nThank you for joining the Harz Ecosystem. We are excited to have you on board.\n\nExplore our platforms:\n• HarzDM — Digital Marketplace\n• BuildBot AI — Construction Planning\n• Apex Bank — Digital Banking\n• ContentPilot — AI Content Creation\n\nRegards,\nRabiu Hamza Mohammed\nCEO, Harz Ecosystem' },
    proposal: { subject: 'Business Proposal', body: 'Dear [Name],\n\nI hope this message finds you well. I would like to present a business proposal for your consideration.\n\n[Details]\n\nLooking forward to your response.\n\nBest regards,\nRabiu Hamza Mohammed\nHarz Ecosystem' },
    receipt: { subject: 'Payment Receipt', body: 'Dear Customer,\n\nWe have received your payment. Here are the details:\n\nAmount: [AMOUNT]\nReference: [REF]\nDate: [DATE]\n\nThank you for your business.\n\nHarz Ecosystem' },
  };
  
  const t = templates[template];
  if (!t) return `📧 *Email Templates*\n\nAvailable:\n• /emailtemplate invoice\n• /emailtemplate welcome\n• /emailtemplate proposal\n• /emailtemplate receipt`;
  
  return `📧 *${template.toUpperCase()} Template*\n\nSubject: ${t.subject}\n\n${t.body}`;
}

// === PDF DOCUMENT ENGINE ===
async function generatePDFDocument(type, data) {
  // Generate an HTML document that can be printed to PDF
  const docs = {
    invoice: generateInvoiceHTML(data),
    receipt: generateReceiptHTML(data),
    contract: generateContractHTML(data),
    nda: generateNDAHTML(data),
    businessplan: generateBusinessPlanHTML(data),
    terms: generateTermsHTML(data),
  };
  
  const html = docs[type];
  if (!html) return null;
  
  // Return as a data URL or a service URL
  return { html, type, data };
}

function generateInvoiceHTML(d) {
  const { invoiceNumber, clientName, clientEmail, items, total, currency } = d;
  const vat = total * 0.075;
  const grandTotal = total + vat;
  const itemsHTML = (items || []).map(item => 
    `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${currency} ${item.price.toFixed(2)}</td><td>${currency} ${(item.price * item.quantity).toFixed(2)}</td></tr>`
  ).join('');
  
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:800px;margin:auto;padding:20px}.header{display:flex;justify-content:space-between}.logo{font-size:28px;font-weight:bold;color:#1a1a2e}.section{margin:20px 0}.table{width:100%;border-collapse:collapse}.table th,.table td{border:1px solid #ddd;padding:8px;text-align:left}.table th{background:#1a1a2e;color:white}.total{text-align:right;font-size:18px;font-weight:bold}.footer{margin-top:40px;color:#666;font-size:12px}</style></head><body>
  <div class="header"><div class="logo">Harz Ecosystem</div><div>Invoice #${invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}<br>Date: ${new Date().toLocaleDateString()}</div></div>
  <div class="section"><strong>Bill To:</strong><br>${clientName || 'Client'}<br>${clientEmail || ''}</div>
  <table class="table"><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>${itemsHTML}</table>
  <div class="total"><p>Subtotal: ${currency || 'USD'} ${(total || 0).toFixed(2)}</p><p>VAT (7.5%): ${currency || 'USD'} ${vat.toFixed(2)}</p><p>Grand Total: ${currency || 'USD'} ${grandTotal.toFixed(2)}</p></div>
  <div class="footer"><p>Bank: UBA | Account: 2034326424 | Name: Rabiu Hamza Mohammed</p><p>harzco.business@gmail.com | +234 802 868 7857</p></div>
  </body></html>`;
}

function generateReceiptHTML(d) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:600px;margin:auto;padding:20px}.header{font-size:24px;font-weight:bold;text-align:center}.section{margin:15px 0;border:1px solid #ddd;padding:15px}</style></head><body>
  <div class="header">PAYMENT RECEIPT</div>
  <div class="section"><strong>Receipt #:</strong> RCP-${Date.now().toString().slice(-8)}<br><strong>Date:</strong> ${new Date().toLocaleDateString()}<br><strong>From:</strong> ${d.clientName || 'Client'}<br><strong>Amount:</strong> ${d.currency || 'USD'} ${(d.amount || 0).toFixed(2)}<br><strong>Reference:</strong> ${d.reference || 'N/A'}<br><strong>Method:</strong> ${d.method || 'Bank Transfer'}</div>
  <div class="footer" style="text-align:center;color:#666;margin-top:20px">Harz Ecosystem | harzco.business@gmail.com</div>
  </body></html>`;
}

function generateContractHTML(d) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:800px;margin:auto;padding:20px;line-height:1.6}h1{color:#1a1a2e}</style></head><body>
  <h1>Service Agreement</h1><p>This agreement is made on ${new Date().toLocaleDateString()} between <strong>Harz Ecosystem</strong> (the Provider) and <strong>${d.clientName || 'Client'}</strong> (the Client).</p>
  <p><strong>Scope of Work:</strong> ${d.scope || 'As discussed and agreed upon.'}</p>
  <p><strong>Duration:</strong> ${d.duration || 'As agreed'}</p>
  <p><strong>Payment Terms:</strong> ${d.paymentTerms || 'Payment due upon completion'}</p>
  <p><strong>Amount:</strong> ${d.currency || 'USD'} ${(d.amount || 0).toFixed(2)}</p>
  <p>Both parties agree to the terms outlined above. This contract is binding upon signature.</p>
  <p style="margin-top:40px">Provider: _________________ Date: __________</p>
  <p>Client: _________________ Date: __________</p>
  </body></html>`;
}

function generateNDAHTML(d) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:800px;margin:auto;padding:20px;line-height:1.6}h1{color:#1a1a2e}</style></head><body>
  <h1>Non-Disclosure Agreement</h1><p>This NDA is effective ${new Date().toLocaleDateString()} between <strong>Harz Ecosystem</strong> and <strong>${d.partyName || 'the Receiving Party'}</strong>.</p>
  <p>The Receiving Party agrees to keep confidential all proprietary information disclosed by Harz Ecosystem, including but not limited to: business strategies, technical data, source code, customer information, and financial data.</p>
  <p>This agreement remains in effect for 3 years from the date of signing.</p>
  <p style="margin-top:40px">Signed: _________________ Date: __________</p>
  </body></html>`;
}

function generateBusinessPlanHTML(d) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:800px;margin:auto;padding:20px;line-height:1.6}h1{color:#1a1a2e}h2{color:#0f3460}</style></head><body>
  <h1>${d.businessName || 'Harz Ecosystem'} — Business Plan</h1>
  <h2>Executive Summary</h2><p>${d.summary || 'Harz Ecosystem is a technology conglomerate building digital platforms for the African market.'}</p>
  <h2>Market Analysis</h2><p>${d.market || 'Targeting the Nigerian and West African digital economy.'}</p>
  <h2>Products & Services</h2><p>${d.products || '10+ platforms spanning digital marketplaces, AI construction, trading, banking, and more.'}</p>
  <h2>Revenue Model</h2><p>${d.revenue || 'Subscription fees, transaction commissions, and enterprise licensing.'}</p>
  <h2>Financial Projections</h2><p>${d.projections || 'Year 1: $100k | Year 2: $500k | Year 3: $2M+'}</p>
  </body></html>`;
}

function generateTermsHTML(d) {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial;max-width:800px;margin:auto;padding:20px;line-height:1.6}h1{color:#1a1a2e}</style></head><body>
  <h1>Terms of Service — ${d.platform || 'Harz Ecosystem'}</h1>
  <p>1. Acceptance of Terms: By using this platform, you agree to these terms.</p>
  <p>2. User Responsibilities: Users must provide accurate information and not misuse the platform.</p>
  <p>3. Payment: All fees are as displayed. Refunds subject to our refund policy.</p>
  <p>4. Privacy: We protect your data in accordance with Nigerian data protection regulations.</p>
  <p>5. Liability: Harz Ecosystem is not liable for indirect damages.</p>
  <p>6. Termination: We reserve the right to terminate accounts that violate these terms.</p>
  <p>7. Contact: harzco.business@gmail.com</p>
  </body></html>`;
}

async function handleGenerateDoc(args) {
  const type = args[0]?.toLowerCase();
  if (!type) {
    return `📄 *PDF Document Engine*\n\nUsage: /pdf [type] [details...]\n\nTypes:\n• invoice — Generate invoice (provide client, items, total)\n• receipt — Payment receipt\n• contract — Service agreement\n• nda — Non-disclosure agreement\n• businessplan — Business plan\n• terms — Terms of service\n\nExample:\n/pdf invoice client:James total:500 currency:USD`;
  }
  
  // Parse key:value pairs from args
  const dataStr = args.slice(1).join(' ');
  const data = {};
  dataStr.split(/\s+(?=\w+:)/).forEach(pair => {
    const [k, ...v] = pair.split(':');
    data[k.trim()] = v.join(':').trim();
  });
  
  const result = await generatePDFDocument(type, data);
  if (!result) return `❌ Unknown document type. Available: invoice, receipt, contract, nda, businessplan, terms`;
  
  return `📄 *${type.toUpperCase()} Document Generated*\n\nA professional HTML document has been created. To get the full printable PDF:\n1. The document HTML is ready\n2. Open it in any browser and print to PDF\n\n📝 Next step: Use /email to send this document to a client.`;
}

// === INVOICE & TAX ENGINE (NIGERIA) ===
async function handleInvoice(args) {
  // /invoice [client] [amount] [currency]
  const parts = args.join(' ').split('|').map(s => s.trim());
  if (parts.length < 2) {
    return `🧾 *Invoice Generator*\n\nUsage: /invoice [client_name] | [amount] | [currency]\n\nExample:\n/invoice James Anderson | 5000 | USD`;
  }
  
  const clientName = parts[0];
  const amount = parseFloat(parts[1]) || 0;
  const currency = parts[2] || 'NGN';
  const vat = amount * 0.075;
  const total = amount + vat;
  const invoiceNum = 'INV-' + Date.now().toString().slice(-6);
  
  return `🧾 *INVOICE ${invoiceNum}*\n\nClient: ${clientName}\nDate: ${new Date().toLocaleDateString()}\n\nSubtotal: ${currency} ${amount.toLocaleString()}\nVAT (7.5%): ${currency} ${vat.toLocaleString()}\n━━━━━━━━━━━━━\nTotal: ${currency} ${total.toLocaleString()}\n\nPayment: UBA Bank — 2034326424\nName: Rabiu Hamza Mohammed`;
}

async function handleTax(args) {
  const subCmd = args[0]?.toLowerCase();
  
  if (subCmd === 'vat' || (!subCmd && args.length > 0)) {
    // /tax vat [amount]
    const amount = parseFloat(subCmd === 'vat' ? args[1] : args[0]);
    if (isNaN(amount)) return `💰 *VAT Calculator*\n\nUsage: /tax vat [amount]\n\nExample: /tax vat 50000`;
    const vat = amount * 0.075;
    return `💰 *VAT Calculation (Nigeria)*\n\nAmount: ₦${amount.toLocaleString()}\nVAT (7.5%): ₦${vat.toLocaleString()}\nTotal: ₦${(amount + vat).toLocaleString()}`;
  }
  
  if (subCmd === 'paye') {
    // /tax paye [annual_income]
    const income = parseFloat(args[1]);
    if (isNaN(income)) return `💰 *PAYE Calculator*\n\nUsage: /tax paye [annual_income]\n\nExample: /tax paye 5000000`;
    
    const paye = calculatePAYE(income);
    return `💰 *PAYE Calculation (Nigeria)*\n\nAnnual Income: ₦${income.toLocaleString()}\nPAYE Tax: ₦${paye.tax.toLocaleString()}\nNet Income: ₦${(income - paye.tax).toLocaleString()}\nMonthly Tax: ₦${(paye.tax / 12).toLocaleString()}\nMonthly Net: ₦${((income - paye.tax) / 12).toLocaleString()}`;
  }
  
  if (subCmd === 'company') {
    // /tax company [profit]
    const profit = parseFloat(args[1]);
    if (isNaN(profit)) return `💰 *Company Tax Calculator*\n\nUsage: /tax company [profit]\n\nExample: /tax company 10000000`;
    const tax = profit * 0.30; // 30% company income tax
    return `💰 *Company Income Tax (Nigeria)*\n\nAnnual Profit: ₦${profit.toLocaleString()}\nCIT (30%): ₦${tax.toLocaleString()}\nAfter-Tax Profit: ₦${(profit - tax).toLocaleString()}`;
  }
  
  return `💰 *Tax Engine (Nigeria)*\n\nUsage:\n• /tax vat [amount] — VAT 7.5% calculator\n• /tax paye [annual_income] — Personal income tax\n• /tax company [profit] — Company income tax 30%`;
}

function calculatePAYE(annualIncome) {
  // Nigerian PAYE 2024 brackets
  let tax = 0;
  let remaining = annualIncome;
  const brackets = [
    { rate: 0.07, limit: 300000 },     // First ₦300k — 7%
    { rate: 0.11, limit: 300000 },    // Next ₦300k — 11%
    { rate: 0.15, limit: 500000 },    // Next ₦500k — 15%
    { rate: 0.19, limit: 500000 },    // Next ₦500k — 19%
    { rate: 0.21, limit: 1600000 },  // Next ₦1.6M — 21%
    { rate: 0.24, limit: Infinity },  // Above ₦3.2M — 24%
  ];
  
  for (const bracket of brackets) {
    const taxable = Math.min(remaining, bracket.limit);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  
  return { tax, netIncome: annualIncome - tax };
}

module.exports = {
  sendEmail, handleSendEmail, handleEmailTemplate,
  generatePDFDocument, handleGenerateDoc,
  handleInvoice, handleTax, calculatePAYE,
};
