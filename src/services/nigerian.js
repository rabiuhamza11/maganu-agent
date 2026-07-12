// Maganu Nigerian Business Tools
const axios = require('axios');

// NGN/USD live rate
async function getExchangeRate() {
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 });
    return { usdNgn: res.data?.rates?.NGN || 1600, gbpNgn: (res.data?.rates?.NGN || 1600) / (res.data?.rates?.GBP || 0.79), source: 'live' };
  } catch (_) {
    return { usdNgn: 1600, gbpNgn: 2030, source: 'estimated' };
  }
}

// VAT calculator (7.5% Nigeria)
function calculateVAT(amount, currency = 'NGN') {
  const vatRate = 0.075;
  const vat = amount * vatRate;
  const total = amount + vat;
  const symbol = currency === 'NGN' ? '₦' : '$';
  return {
    subtotal: amount,
    vatAmount: Math.round(vat),
    total: Math.round(total),
    formatted: `${symbol}${amount.toLocaleString()} + VAT (7.5%) = ${symbol}${Math.round(total).toLocaleString()}`
  };
}

// Withholding tax calculator
function calculateWHT(amount, serviceType = 'consulting') {
  const rates = {
    consulting: 0.10,    // 10%
    management: 0.10,
    construction: 0.05,  // 5%
    rent: 0.10,
    dividend: 0.10,
    interest: 0.10,
    royalties: 0.15,     // 15%
    technical: 0.10
  };
  const rate = rates[serviceType.toLowerCase()] || 0.10;
  const wht = amount * rate;
  return {
    gross: amount,
    whtRate: `${rate * 100}%`,
    whtAmount: Math.round(wht),
    net: Math.round(amount - wht),
    formatted: `Gross: ₦${amount.toLocaleString()} | WHT (${rate*100}%): ₦${Math.round(wht).toLocaleString()} | Net: ₦${Math.round(amount-wht).toLocaleString()}`
  };
}

// FIRS compliance checklist
function getFIRSChecklist() {
  return `🏛 *FIRS Tax Compliance Checklist*\n\n*Registration*\n1. TIN (Tax Identification Number) — registered ✓?\n2. VAT registration (if turnover > ₦25M/year)\n3. Company Income Tax registration\n\n*Monthly/Quarterly*\n4. VAT returns filed monthly (21st of following month)\n5. WHT remittance monthly\n6. PAYE (employee taxes) remitted monthly\n\n*Annual*\n7. Annual income tax return (CIT) — June 30th deadline\n8. Audited financial statements\n9. Transfer pricing documentation (if applicable)\n\n*Best Practice*\n10. Keep all receipts and invoices for 6 years\n11. Separate business and personal accounts\n12. Register with CAC (Corporate Affairs Commission)\n\nContact: info@firs.gov.ng | 0800-CALL-FIRS`;
}

// CBN news (simulated with AI context)
function getCBNContext() {
  return `🏦 *CBN Policy Context (2026)*\n\nKey rates:\nMPR: 26.25% (Monetary Policy Rate)\nCash Reserve Ratio: 45%\nLiquidity Ratio: 30%\n\nRecent directives:\n- Foreign exchange unification policy ongoing\n- naira redesign implementation\n- BVN/NIN linkage mandatory for all accounts\n- Open Banking policy framework active\n\nFor live CBN news: cbn.gov.ng/newsroom`;
}

// Nigerian invoice formatter
function formatNigerianInvoice(clientName, serviceDesc, amount, includeVAT = true) {
  const vat = includeVAT ? calculateVAT(amount) : null;
  const total = includeVAT ? vat.total : amount;
  const invoiceNo = `HARZ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', year: 'numeric', month: 'long', day: 'numeric' });

  let inv = `🧾 *TAX INVOICE*\n\n`;
  inv += `Invoice: ${invoiceNo}\nDate: ${date}\n\n`;
  inv += `*FROM:*\nHarz Ecosystem Ltd\nRabiu Hamza Mohammed\nLagos, Nigeria\nEmail: harzco.business@gmail.com\n\n`;
  inv += `*TO:*\n${clientName}\n\n`;
  inv += `*DESCRIPTION:*\n${serviceDesc}\n\n`;
  inv += `Subtotal: ₦${amount.toLocaleString()}\n`;
  if (includeVAT) inv += `VAT (7.5%): ₦${vat.vatAmount.toLocaleString()}\n`;
  inv += `*TOTAL: ₦${total.toLocaleString()}*\n\n`;
  inv += `*PAYMENT:*\nBank: [Your bank name]\nAccount: [Account number]\nOr pay via: paystack.com/pay/harzco\n\nThank you for your business.`;
  return inv;
}

// Price alert tracker
const priceAlerts = [];
async function checkPriceAlert(threshold, direction = 'above') {
  const { usdNgn } = await getExchangeRate();
  const triggered = direction === 'above' ? usdNgn >= threshold : usdNgn <= threshold;
  return { triggered, currentRate: usdNgn, threshold, direction };
}

module.exports = { getExchangeRate, calculateVAT, calculateWHT, getFIRSChecklist, getCBNContext, formatNigerianInvoice, checkPriceAlert };
