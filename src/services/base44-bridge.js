// Base44 Integration Bridge Service — gives Maganu access to all Base44 integrations
// Calls the deployed maganuBridge backend function on Base44

const BASE44_BRIDGE_URL = process.env.BASE44_BRIDGE_URL || 'https://6a1e2efdc14fbb292286fb2f.base44app.com/functions/maganuBridge';
const GMAIL_TOKEN = process.env.GMAIL_ACCESS_TOKEN || '';
const CALENDAR_TOKEN = process.env.GOOGLECALENDAR_ACCESS_TOKEN || '';

async function callBridge(action, extra = {}) {
  try {
    const axios = require('axios');
    const payload = { action, ...extra };
    if (GMAIL_TOKEN) payload.gmailToken = GMAIL_TOKEN;
    if (CALENDAR_TOKEN) payload.calendarToken = CALENDAR_TOKEN;
    
    const res = await axios.post(BASE44_BRIDGE_URL, payload, { timeout: 15000 });
    return res.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  // Email
  sendEmail: (to, subject, body) => callBridge('sendEmail', { to, subject, body }),
  readEmails: (max = 10) => callBridge('readEmails', { max }),
  searchEmails: (query, max = 10) => callBridge('searchEmails', { query, max }),
  
  // Calendar
  getCalendar: (daysAhead = 7) => callBridge('getCalendar', { daysAhead }),
  createCalendarEvent: (title, startTime, endTime, description, location) => 
    callBridge('createCalendarEvent', { title, startTime, endTime, description, location }),
  
  // Entity CRUD
  getEntityData: (entityName) => callBridge('getEntityData', { entityName }),
  createEntityRecord: (entityName, data) => callBridge('createEntityRecord', { entityName, data }),
  updateEntityRecord: (entityName, id, data) => callBridge('updateEntityRecord', { entityName, id, data }),
  
  // Domain-specific
  getCRMStats: () => callBridge('getCRMStats'),
  getOrders: () => callBridge('getOrders'),
  getProducts: () => callBridge('getProducts'),
  getMusicTracks: () => callBridge('getMusicTracks'),
  getFilms: () => callBridge('getFilms'),
  getFXRates: () => callBridge('getFXRates'),
  getEstateProperties: () => callBridge('getEstateProperties'),
  getApexAccounts: () => callBridge('getApexAccounts'),
  getAjoGroups: () => callBridge('getAjoGroups'),
  getEduCourses: () => callBridge('getEduCourses'),
  getContentProjects: () => callBridge('getContentProjects'),
  getSubscribers: () => callBridge('getSubscribers'),
  getEcosystemSummary: () => callBridge('getEcosystemSummary'),
  
  // Messaging
  sendTelegram: (message, chatId) => callBridge('sendTelegram', { message, chatId }),
  
  // System
  getStatus: () => callBridge('getStatus'),
  
  // Generic bridge call
  call: callBridge,
  
  // Telegram command handler for bridge
  async handleCommand(cmd, args) {
    try {
      switch (cmd) {
        case '/bridge': {
          const status = await callBridge('getStatus');
          if (status.success) {
            const s = status.system;
            let msg = `🌉 *Maganu Bridge v${s.version}*\n\n`;
            msg += `*Integrations:*\n`;
            msg += `  Gmail: ${s.integrations.gmail}\n`;
            msg += `  Calendar: ${s.integrations.googleCalendar}\n`;
            msg += `  Telegram: ${s.integrations.telegram}\n`;
            msg += `  WhatsApp: ${s.integrations.whatsapp}\n\n`;
            msg += `*Capabilities (${s.capabilities.length}):*\n`;
            s.capabilities.forEach(c => msg += `  • ${c}\n`);
            msg += `\n*Entities:* ${s.entityCount} tables accessible`;
            return msg;
          }
          return '❌ Bridge error: ' + (status.error || 'unknown');
        }
        
        case '/ecosystem': {
          const summary = await callBridge('getEcosystemSummary');
          if (summary.success) {
            const e = summary.ecosystem;
            let msg = `🌍 *Harz Ecosystem Summary*\n\n`;
            msg += `Platforms: ${e.platforms}\n`;
            msg += `Products: ${e.products} (${e.total_product_sales} sales)\n`;
            msg += `Orders: ${e.orders} (${e.paid_orders} paid)\n`;
            msg += `CRM Customers: ${e.crm_customers}\n`;
            msg += `Music Tracks: ${e.music_tracks} (${e.total_music_plays} plays)\n`;
            msg += `Films: ${e.films} (${e.total_film_views} views)\n`;
            msg += `Subscribers: ${e.subscribers} (${e.active_subscribers} active)\n`;
            msg += `Bank Accounts: ${e.bank_accounts}\n`;
            msg += `Ajo Groups: ${e.ajo_groups}\n`;
            msg += `Edu Courses: ${e.edu_courses}\n`;
            msg += `Estate Properties: ${e.estate_properties}`;
            return msg;
          }
          return '❌ Error: ' + (summary.error || 'unknown');
        }
        
        case '/crmstats': {
          const result = await callBridge('getCRMStats');
          if (result.success) {
            const s = result.stats;
            let msg = `📊 *WhatsApp CRM Stats*\n\n`;
            msg += `Total: ${s.total_customers}\n`;
            msg += `New: ${s.new} | Responded: ${s.responded}\n`;
            msg += `In Progress: ${s.in_progress} | Converted: ${s.converted}\n`;
            msg += `Follow-up: ${s.follow_up} | Lost: ${s.lost}\n`;
            msg += `Revenue: ₦${s.total_revenue.toLocaleString()}\n`;
            msg += `Conversion: ${s.conversion_rate}%\n\n`;
            if (s.recent_customers.length > 0) {
              msg += `*Recent Customers:*\n`;
              s.recent_customers.forEach(c => {
                msg += `  ${c.name} (${c.phone})\n`;
                msg += `  Interest: ${c.product} | Status: ${c.status}\n`;
              });
            }
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/orders': {
          const result = await callBridge('getOrders');
          if (result.success) {
            const s = result.summary;
            let msg = `📦 *Orders Summary*\n\n`;
            msg += `Total: ${s.total_orders}\n`;
            msg += `Paid: ${s.paid} | Pending: ${s.pending}\n`;
            msg += `Revenue: ₦${s.total_revenue.toLocaleString()}\n\n`;
            if (result.orders && result.orders.length > 0) {
              msg += `*Recent Orders:*\n`;
              result.orders.slice(0, 5).forEach(o => {
                msg += `  ${o.product_title} — ${o.buyer_name || o.buyer_email}\n`;
                msg += `  ${o.currency} ${o.amount} | ${o.payment_status}\n`;
              });
            }
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/products': {
          const result = await callBridge('getProducts');
          if (result.success) {
            const s = result.summary;
            let msg = `🛒 *Products Summary*\n\n`;
            msg += `Total: ${s.total_products} (${s.active} active)\n`;
            msg += `Total Sales: ${s.total_sales}\n\n`;
            msg += `*Top Products:*\n`;
            s.top_products.forEach(p => {
              msg += `  ${p.title} — $${p.price} (${p.sales} sales, ⭐${p.rating})\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/music': {
          if (args && args.toLowerCase() === 'stats') {
            const result = await callBridge('getMusicTracks');
            if (result.success) {
              const s = result.summary;
              let msg = `🎵 *HarzMusic Stats*\n\n`;
              msg += `Tracks: ${s.total_tracks}\n`;
              msg += `Total Plays: ${s.total_plays.toLocaleString()}\n`;
              msg += `Total Downloads: ${s.total_downloads.toLocaleString()}\n\n`;
              msg += `*Trending:*\n`;
              s.trending.forEach(t => {
                msg += `  ${t.title} — ${t.artist} (${t.plays} plays)\n`;
              });
              return msg;
            }
            return '❌ Error: ' + (result.error || 'unknown');
          }
          return 'Usage: /music stats';
        }
        
        case '/films': {
          const result = await callBridge('getFilms');
          if (result.success) {
            const s = result.summary;
            let msg = `🎬 *HarzFilm Stats*\n\n`;
            msg += `Films: ${s.total_films}\n`;
            msg += `Views: ${s.total_views.toLocaleString()}\n`;
            msg += `Purchases: ${s.total_purchases}\n`;
            msg += `Rentals: ${s.total_rentals}\n\n`;
            if (s.featured.length > 0) {
              msg += `*Featured:*\n`;
              s.featured.forEach(f => {
                msg += `  ${f.title} — ${f.creator} (⭐${f.rating})\n`;
              });
            }
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/apex': {
          const result = await callBridge('getApexAccounts');
          if (result.success) {
            const s = result.summary;
            let msg = `🏦 *Apex Bank Summary*\n\n`;
            msg += `Accounts: ${s.total_accounts}\n`;
            msg += `Total Balance: $${s.total_balance.toLocaleString()}\n`;
            msg += `Transactions: ${s.total_transactions}\n\n`;
            msg += `*Recent Transactions:*\n`;
            s.recent_transactions.forEach(t => {
              msg += `  ${t.type}: $${t.amount} — ${t.description}\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/ajo': {
          const result = await callBridge('getAjoGroups');
          if (result.success) {
            let msg = `💰 *HarzAjo Summary*\n\n`;
            msg += `Groups: ${result.total_groups}\n`;
            msg += `Members: ${result.total_members}\n\n`;
            if (result.groups && result.groups.length > 0) {
              result.groups.forEach(g => {
                msg += `  ${g.group_name || 'Group'} — ${g.capacity} capacity\n`;
                msg += `  ${g.currency} ${g.contribution_amount} | Cycle: ${g.current_cycle}/${g.cycle_frequency}\n`;
              });
            }
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/subs': {
          const result = await callBridge('getSubscribers');
          if (result.success) {
            const s = result.summary;
            let msg = `📈 *ContentPilot Subscribers*\n\n`;
            msg += `Total: ${s.total_subscribers}\n`;
            msg += `Active: ${s.active}\n`;
            msg += `MRR: $${s.total_mrr}\n\n`;
            msg += `*By Plan:*\n`;
            Object.entries(s.by_plan).forEach(([plan, count]) => {
              msg += `  ${plan}: ${count}\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/fx': {
          const result = await callBridge('getFXRates');
          if (result.success) {
            let msg = `💱 *FX Rates*\n\n`;
            result.rates.slice(0, 10).forEach(r => {
              msg += `  ${r.currency_code}: ₦${r.rate} (${r.daily_change_percent || '0'}%)\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/estate': {
          const result = await callBridge('getEstateProperties');
          if (result.success) {
            let msg = `🏠 *Estate Properties*\n\n`;
            msg += `Total: ${result.count}\n\n`;
            result.properties.slice(0, 5).forEach(p => {
              msg += `  ${p.title} — ${p.property_type}\n`;
              msg += `  ${p.location} | ${p.currency} ${p.price?.toLocaleString()}\n`;
              msg += `  ${p.bedrooms} bed, ${p.bathrooms} bath | ${p.status}\n\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/sendemail': {
          // /sendemail to:subject:body
          const parts = (args || '').split(':');
          if (parts.length < 3) return 'Usage: /sendemail recipient@email.com:Subject:Body text';
          const [to, subject, ...bodyParts] = parts;
          const result = await callBridge('sendEmail', { to, subject, body: bodyParts.join(':') });
          if (result.success) return `✅ Email sent to ${to}! Message ID: ${result.messageId}`;
          return '❌ Email failed: ' + (result.error || 'unknown');
        }
        
        case '/readmail': {
          const result = await callBridge('readEmails', { max: 5 });
          if (result.success) {
            if (result.count === 0) return '📭 No emails in inbox';
            let msg = `📧 *Recent Emails (${result.count})*\n\n`;
            result.emails.forEach(e => {
              msg += `*From:* ${e.from}\n`;
              msg += `*Subject:* ${e.subject}\n`;
              msg += `*Date:* ${e.date}\n`;
              msg += `${e.snippet}\n\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        case '/calendar': {
          const result = await callBridge('getCalendar', { daysAhead: 7 });
          if (result.success) {
            if (result.count === 0) return '📅 No upcoming events in the next 7 days';
            let msg = `📅 *Upcoming Events (${result.count})*\n\n`;
            result.events.forEach(e => {
              msg += `*${e.summary}*\n`;
              msg += `  ${e.start} → ${e.end}\n`;
              if (e.location) msg += `  📍 ${e.location}\n`;
              if (e.description) msg += `  ${e.description.substring(0, 100)}\n`;
              msg += `\n`;
            });
            return msg;
          }
          return '❌ Error: ' + (result.error || 'unknown');
        }
        
        default:
          return null; // Not a bridge command
      }
    } catch (err) {
      return '❌ Bridge error: ' + err.message;
    }
  }
};
