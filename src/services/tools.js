// General utility tools: URL shortener, text utils, number tools, QR, etc.
const axios = require('axios');

// Word/character counter
function analyzeText(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const readTime = Math.ceil(words / 200);
  return `📝 *Text Analysis*\n\nWords: ${words.toLocaleString()}\nCharacters: ${chars.toLocaleString()}\nSentences: ${sentences}\nParagraphs: ${paragraphs}\nRead time: ~${readTime} min`;
}

// Random password generator
function generatePassword(length = 16, options = {}) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|';
  let chars = lower + upper + nums + symbols;
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  const strength = length >= 16 ? '🟢 Strong' : length >= 12 ? '🟡 Medium' : '🔴 Weak';
  return `🔐 *Generated Password*\n\n\`${password}\`\n\nLength: ${length} chars\nStrength: ${strength}\n\nSave it securely. Never share.`;
}

// UUID generator
function generateUUID() {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return `🆔 *UUID v4*\n\n\`${uuid}\`\n\nUse for entity IDs, API keys, session tokens.`;
}

// Base64 encoder/decoder
function base64Encode(text) {
  try {
    const encoded = Buffer.from(text).toString('base64');
    return `*Base64 Encoded*\n\n\`${encoded}\``;
  } catch (e) { return '❌ Error: ' + e.message; }
}

function base64Decode(text) {
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf8');
    return `*Base64 Decoded*\n\n${decoded}`;
  } catch (e) { return '❌ Error: ' + e.message; }
}

// Loan calculator
function loanCalculator(principal, annualRate, months) {
  const p = parseFloat(String(principal).replace(/,/g,''));
  const r = parseFloat(String(annualRate)) / 100 / 12;
  const n = parseInt(months);
  if (!p || !r || !n) return 'Usage: /loan [principal] | [annual rate%] | [months]\nExample: /loan 5000000 | 18 | 24';
  const monthly = p * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
  const total = monthly * n;
  const interest = total - p;
  return `💳 *Loan Calculator*\n\nPrincipal: ₦${p.toLocaleString()}\nRate: ${annualRate}% p.a.\nTerm: ${n} months\n\nMonthly Payment: *₦${monthly.toLocaleString('en-NG',{maximumFractionDigits:0})}*\nTotal Repayment: ₦${total.toLocaleString('en-NG',{maximumFractionDigits:0})}\nTotal Interest: ₦${interest.toLocaleString('en-NG',{maximumFractionDigits:0})}\n\nInterest % of loan: ${(interest/p*100).toFixed(1)}%`;
}

// Age calculator
function calcAge(dob) {
  try {
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) { years--; months += 12; }
    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
    return `🎂 *Age Calculator*\n\nDOB: ${birth.toLocaleDateString('en-NG')}\nAge: *${years} years, ${Math.abs(months)} months*\nNext birthday in: ${daysToNext} days`;
  } catch (e) {
    return '❌ Format: /age [YYYY-MM-DD]\nExample: /age 1995-03-15';
  }
}

// Tip calculator
function calcTip(amount, tipPct = 10, people = 1) {
  const a = parseFloat(String(amount).replace(/,/g,''));
  const tip = a * (tipPct / 100);
  const total = a + tip;
  const perPerson = total / people;
  return `🍽️ *Tip Calculator*\n\nBill: ₦${a.toLocaleString()}\nTip (${tipPct}%): ₦${tip.toLocaleString('en-NG',{maximumFractionDigits:0})}\nTotal: *₦${total.toLocaleString('en-NG',{maximumFractionDigits:0})}*\nPer person (${people}): ₦${perPerson.toLocaleString('en-NG',{maximumFractionDigits:0})}`;
}

// Word of the day
function wordOfTheDay() {
  const words = [
    { word: 'Perseverate', def: 'To repeat an action persistently even when it fails. Avoid this — adapt.', use: 'Entrepreneurs who perseverate on dying ideas lose momentum.' },
    { word: 'Serendipity', def: 'Finding something good without actively looking for it.', use: 'Many of the best business partnerships begin with serendipity.' },
    { word: 'Tacit', def: 'Understood or implied without being stated.', use: 'There was a tacit agreement between the founders to scale fast.' },
    { word: 'Frugal', def: 'Sparing resources. The opposite of wasteful.', use: 'The most successful early startups are frugal with capital.' },
    { word: 'Iterate', def: 'To repeat a process with the aim of approaching a desired outcome.', use: 'Iterate on your MVP weekly, not monthly.' },
    { word: 'Juggernaut', def: 'A large, powerful, overwhelming force.', use: 'Once OMEGA INFINITY ships, it will be a juggernaut.' },
    { word: 'Leverage', def: 'Using something to maximum advantage.', use: 'Automation is your greatest leverage as a solo founder.' },
    { word: 'Heuristic', def: 'A practical problem-solving approach not guaranteed to be optimal.', use: 'A good heuristic for pricing: charge more than you think is right.' },
    { word: 'Sanguine', def: 'Optimistic, especially in difficult situations.', use: 'Stay sanguine about the journey — the destination rewards patience.' },
    { word: 'Zeitgeist', def: 'The defining spirit or mood of a particular period of history.', use: 'AI is the zeitgeist of our era — we are building in the right time.' },
  ];
  const w = words[new Date().getDay() % words.length];
  return `📚 *Word of the Day*\n\n*${w.word}*\n_${w.def}_\n\nIn context: "${w.use}"`;
}

// Percentage calculator
function calcPercent(expr) {
  // "x% of y", "x is what % of y", "x% off y"
  const m1 = expr.match(/^([\d.]+)%\s+of\s+([\d.,]+)/i);
  const m2 = expr.match(/^([\d.,]+)\s+is\s+what\s+%\s+of\s+([\d.,]+)/i);
  const m3 = expr.match(/^([\d.]+)%\s+off\s+([\d.,]+)/i);
  if (m1) {
    const pct = parseFloat(m1[1]), total = parseFloat(m1[2].replace(/,/g,''));
    const result = (pct / 100) * total;
    return `🧮 ${pct}% of ₦${total.toLocaleString()} = *₦${result.toLocaleString('en-NG',{maximumFractionDigits:2})}*`;
  }
  if (m2) {
    const part = parseFloat(m2[1].replace(/,/g,'')), whole = parseFloat(m2[2].replace(/,/g,''));
    const pct = (part / whole) * 100;
    return `🧮 ₦${part.toLocaleString()} is *${pct.toFixed(2)}%* of ₦${whole.toLocaleString()}`;
  }
  if (m3) {
    const pct = parseFloat(m3[1]), price = parseFloat(m3[2].replace(/,/g,''));
    const discount = (pct / 100) * price, final = price - discount;
    return `🏷️ ${pct}% off ₦${price.toLocaleString()}\nDiscount: ₦${discount.toLocaleString('en-NG',{maximumFractionDigits:0})}\nFinal price: *₦${final.toLocaleString('en-NG',{maximumFractionDigits:0})}*`;
  }
  return '🧮 Usage:\n/percent 15% of 500000\n/percent 75000 is what % of 500000\n/percent 20% off 120000';
}

module.exports = { analyzeText, generatePassword, generateUUID, base64Encode, base64Decode, loanCalculator, calcAge, calcTip, wordOfTheDay, calcPercent };
