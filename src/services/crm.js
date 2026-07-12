// Maganu CRM — Client Tracker, Leads, Invoices, Follow-ups
const fs = require('fs');
const path = require('path');

const CRM_FILE = path.join('/tmp', 'maganu_crm.json');
const LEADS_FILE = path.join('/tmp', 'maganu_leads.json');

function loadCRM() {
  try { if (fs.existsSync(CRM_FILE)) return JSON.parse(fs.readFileSync(CRM_FILE, 'utf8')); } catch (_) {}
  return { clients: [], followups: [] };
}

function saveCRM(data) {
  try { fs.writeFileSync(CRM_FILE, JSON.stringify(data), 'utf8'); } catch (_) {}
}

function loadLeads() {
  try { if (fs.existsSync(LEADS_FILE)) return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (_) {}
  return [];
}

function saveLeads(leads) {
  try { fs.writeFileSync(LEADS_FILE, JSON.stringify(leads), 'utf8'); } catch (_) {}
}

// Add client
function addClient(name, project, email = '', phone = '') {
  const crm = loadCRM();
  const client = { id: Date.now(), name, project, email, phone, status: 'active', created: new Date().toISOString() };
  crm.clients.push(client);
  saveCRM(crm);
  return client;
}

// List clients
function listClients() {
  const crm = loadCRM();
  return crm.clients.filter(c => c.status !== 'archived');
}

// Add follow-up reminder
function addFollowup(name, daysFromNow, note = '') {
  const crm = loadCRM();
  const dueDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  const fu = { id: Date.now(), name, note, dueDate: dueDate.toISOString(), done: false };
  crm.followups.push(fu);
  saveCRM(crm);
  return { ...fu, dueDateStr: dueDate.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric' }) };
}

// Get due follow-ups
function getDueFollowups() {
  const crm = loadCRM();
  const now = new Date();
  return crm.followups.filter(f => !f.done && new Date(f.dueDate) <= new Date(now.getTime() + 24 * 60 * 60 * 1000));
}

// Format CRM list
function formatCRM() {
  const clients = listClients();
  const followups = getDueFollowups();
  let msg = `👥 *CRM Dashboard*\n\n`;
  if (!clients.length) msg += 'No clients yet. Add with: /addclient Name | Project\n';
  else {
    msg += `*Clients (${clients.length}):*\n`;
    clients.slice(0, 10).forEach((c, i) => { msg += `${i+1}. ${c.name} — ${c.project}\n`; });
  }
  if (followups.length) {
    msg += `\n*Due Follow-ups (${followups.length}):*\n`;
    followups.forEach(f => { msg += `⏰ ${f.name} — ${f.note || 'No note'}\n`; });
  }
  return msg;
}

// Generate invoice
function generateInvoice(clientName, items, currency = 'NGN') {
  const symbol = currency === 'NGN' ? '₦' : '$';
  const vatRate = currency === 'NGN' ? 0.075 : 0;
  const subtotal = items.reduce((s, item) => s + (item.qty * item.rate), 0);
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' });

  let invoice = `🧾 *INVOICE*\n\n`;
  invoice += `Invoice No: ${invoiceNo}\nDate: ${date}\nClient: ${clientName}\nFrom: Harz Ecosystem / Rabiu Hamza\n\n`;
  invoice += `*Items:*\n`;
  items.forEach(item => { invoice += `${item.desc} — ${item.qty} x ${symbol}${item.rate.toLocaleString()} = ${symbol}${(item.qty * item.rate).toLocaleString()}\n`; });
  invoice += `\nSubtotal: ${symbol}${subtotal.toLocaleString()}`;
  if (vat > 0) invoice += `\nVAT (7.5%): ${symbol}${vat.toLocaleString()}`;
  invoice += `\n*TOTAL: ${symbol}${total.toLocaleString()}*\n\nPayment: Bank transfer or Paystack\nEmail: harzco.business@gmail.com`;
  return invoice;
}

// Log lead
function logLead(from, message) {
  const leads = loadLeads();
  leads.push({ id: Date.now(), from, message: message.slice(0, 200), timestamp: new Date().toISOString(), status: 'new' });
  saveLeads(leads);
}

function listLeads() {
  return loadLeads().slice(-10);
}

module.exports = { addClient, listClients, addFollowup, getDueFollowups, formatCRM, generateInvoice, logLead, listLeads };
