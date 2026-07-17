// Base44 Integration Bridge v3.0 — 60+ actions, 30+ Telegram commands
// Full ecosystem access for Maganu on Render

const BASE44_BRIDGE_URL = process.env.BASE44_BRIDGE_URL || 'https://6a1e2efdc14fbb292286fb2f.base44app.com/functions/maganuBridge';
const GMAIL_TOKEN = process.env.GMAIL_ACCESS_TOKEN || '';
const CALENDAR_TOKEN = process.env.GOOGLECALENDAR_ACCESS_TOKEN || '';

async function callBridge(action, extra = {}) {
const PAYMENT_BRIDGE_URL = 'https://6a1e2efdc14fbb292286fb2f.base44app.com/functions/paymentBridge';

async function callPayment(action, extra = {}) {
  try {
    const axios = require('axios');
    const res = await axios.post(PAYMENT_BRIDGE_URL, { action, ...extra }, { timeout: 20000 });
    return res.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}
  try {
    const axios = require('axios');
    const payload = { action, ...extra };
    if (GMAIL_TOKEN) payload.gmailToken = GMAIL_TOKEN;
    if (CALENDAR_TOKEN) payload.calendarToken = CALENDAR_TOKEN;
    const res = await axios.post(BASE44_BRIDGE_URL, payload, { timeout: 20000 });
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
  createCalendarEvent: (title, startTime, endTime, description, location) => callBridge('createCalendarEvent', { title, startTime, endTime, description, location }),
  // Generic Entity CRUD
  getEntityData: (entityName) => callBridge('getEntityData', { entityName }),
  queryEntity: (entityName, filter, sort, limit) => callBridge('queryEntity', { entityName, filter, sort, limit }),
  getEntityCount: (entityName) => callBridge('getEntityCount', { entityName }),
  createEntityRecord: (entityName, data) => callBridge('createEntityRecord', { entityName, data }),
  updateEntityRecord: (entityName, id, data) => callBridge('updateEntityRecord', { entityName, id, data }),
  deleteEntityRecord: (entityName, id) => callBridge('deleteEntityRecord', { entityName, id }),
  multiQuery: (entities) => callBridge('multiQuery', { entities }),
  getFullDashboard: () => callBridge('getFullDashboard'),
  // Domain summaries
  getCRMStats: () => callBridge('getCRMStats'),
  getOrders: () => callBridge('getOrders'),
  getProducts: () => callBridge('getProducts'),
  getMusicTracks: () => callBridge('getMusicTracks'),
  getMusicArtists: () => callBridge('getMusicArtists'),
  getFilms: () => callBridge('getFilms'),
  getFilmCreators: () => callBridge('getFilmCreators'),
  getFXRates: () => callBridge('getFXRates'),
  getEstateProperties: () => callBridge('getEstateProperties'),
  getEstateInquiries: () => callBridge('getEstateInquiries'),
  getApexAccounts: () => callBridge('getApexAccounts'),
  getApexCards: () => callBridge('getApexCards'),
  getApexLoans: () => callBridge('getApexLoans'),
  getApexSavings: () => callBridge('getApexSavings'),
  getAjoGroups: () => callBridge('getAjoGroups'),
  getLoans: () => callBridge('getLoans'),
  getBillPayments: () => callBridge('getBillPayments'),
  getEduCourses: () => callBridge('getEduCourses'),
  getEduStudents: () => callBridge('getEduStudents'),
  getEduInstructors: () => callBridge('getEduInstructors'),
  getEduEnrollments: () => callBridge('getEduEnrollments'),
  getEduJobs: () => callBridge('getEduJobs'),
  getEduLiveClasses: () => callBridge('getEduLiveClasses'),
  getEduMarketplace: () => callBridge('getEduMarketplace'),
  getContentProjects: () => callBridge('getContentProjects'),
  getContentAnalytics: () => callBridge('getContentAnalytics'),
  getAIExecutives: () => callBridge('getAIExecutives'),
  getHealthProfiles: () => callBridge('getHealthProfiles'),
  getAppointments: () => callBridge('getAppointments'),
  getMindCare: () => callBridge('getMindCare'),
  getCyberStatus: () => callBridge('getCyberStatus'),
  getDomainOrders: () => callBridge('getDomainOrders'),
  getOracleSessions: () => callBridge('getOracleSessions'),
  getBuildProjects: () => callBridge('getBuildProjects'),
  getNexalAds: () => callBridge('getNexalAds'),
  getNumberLookups: () => callBridge('getNumberLookups'),
  getChapterTracker: () => callBridge('getChapterTracker'),
  getDeployTasks: () => callBridge('getDeployTasks'),
  getOmegaProjects: () => callBridge('getOmegaProjects'),
  getFileStore: () => callBridge('getFileStore'),
  getReferrals: () => callBridge('getReferrals'),
  getSubscribers: () => callBridge('getSubscribers'),
  getEcosystemSummary: () => callBridge('getEcosystemSummary'),
  // Messaging
  sendTelegram: (message, chatId) => callBridge('sendTelegram', { message, chatId }),
  // System
  getStatus: () => callBridge('getStatus'),
  call: callBridge,
  // Payment Bridge — Paystack + Stripe + Flutterwave
  paymentStatus: () => callPayment('paymentStatus'),
  // Paystack
  paystackBalance: () => callPayment('paystackBalance'),
  paystackTransactions: (limit = 10) => callPayment('paystackTransactions', { limit }),
  paystackStats: () => callPayment('paystackStats'),
  paystackCreatePayment: (email, amount, currency, title, description) => callPayment('paystackCreatePayment', { email, amount, currency, title, description }),
  paystackVerify: (reference) => callPayment('paystackVerify', { reference }),
  paystackRefund: (reference, amount, note) => callPayment('paystackRefund', { reference, amount, note }),
  paystackCreateRecipient: (name, account_number, bank_code) => callPayment('paystackCreateRecipient', { name, account_number, bank_code }),
  paystackTransfer: (amount, recipient_code, reason) => callPayment('paystackTransfer', { amount, recipient_code, reason }),
  paystackVerifyAccount: (account_number, bank_code) => callPayment('paystackVerifyAccount', { account_number, bank_code }),
  paystackListBanks: () => callPayment('paystackListBanks'),
  // Stripe
  stripeBalance: () => callPayment('stripeBalance'),
  stripeTransactions: (limit = 10) => callPayment('stripeTransactions', { limit }),
  stripeStats: () => callPayment('stripeStats'),
  stripeCheckout: (email, amount, currency, product_name) => callPayment('stripeCheckout', { email, amount, currency, product_name }),
  stripeRefund: (charge_id, amount) => callPayment('stripeRefund', { charge_id, amount }),
  stripeProducts: () => callPayment('stripeProducts'),
  // Paystack extended
  paystackCreateCustomer: (email, first_name, last_name, phone) => callPayment('paystackCreateCustomer', { email, first_name, last_name, phone }),
  paystackListCustomers: (limit) => callPayment('paystackListCustomers', { limit }),
  paystackCreatePlan: (name, amount, interval, currency) => callPayment('paystackCreatePlan', { name, amount, interval, currency }),
  paystackListPlans: () => callPayment('paystackListPlans'),
  paystackCreatePage: (name, amount, currency) => callPayment('paystackCreatePage', { name, amount, currency }),
  paystackListPages: () => callPayment('paystackListPages'),
  paystackCreateSubaccount: (business_name, settlement_bank, account_number, percentage) => callPayment('paystackCreateSubaccount', { business_name, settlement_bank, account_number, percentage_charge: percentage }),
  paystackListTransfers: (limit) => callPayment('paystackListTransfers', { limit }),
  // Stripe extended
  stripeCreateProduct: (name, description) => callPayment('stripeCreateProduct', { name, description }),
  stripeCreatePrice: (product_id, amount, currency, recurring) => callPayment('stripeCreatePrice', { product_id, amount, currency, recurring }),
  stripeListPrices: () => callPayment('stripeListPrices'),
  stripeCreateCustomer: (email, name, phone) => callPayment('stripeCreateCustomer', { email, name, phone }),
  stripeListCustomers: (limit) => callPayment('stripeListCustomers', { limit }),
  stripeCreateSubscription: (customer_id, price_id) => callPayment('stripeCreateSubscription', { customer_id, price_id }),
  stripeListSubscriptions: () => callPayment('stripeListSubscriptions'),
  stripeCreateInvoice: (customer_id) => callPayment('stripeCreateInvoice', { customer_id }),
  stripeListInvoices: (limit) => callPayment('stripeListInvoices', { limit }),
  stripeCreatePaymentLink: (price_id, quantity) => callPayment('stripeCreatePaymentLink', { price_id, quantity }),
  stripeCreateCoupon: (percent_off, duration, months) => callPayment('stripeCreateCoupon', { percent_off, duration, duration_in_months: months }),

  async handleCommand(cmd, args) {
    try {
      switch (cmd) {
        // ===== SYSTEM =====
        case '/bridge': {
          const status = await callBridge('getStatus');
          if (status.success) {
            const s = status.system;
            let msg = `🌉 *Maganu Bridge v${s.version}*\n\n`;
            msg += `*Integrations:*\n  Gmail: ${s.integrations.gmail}\n  Calendar: ${s.integrations.googleCalendar}\n  Telegram: ${s.integrations.telegram}\n\n`;
            msg += `*Capabilities:* ${s.capabilities.length} actions\n`;
            msg += `*Entities:* ${s.entityCount} tables`;
            return msg;
          }
          return '❌ ' + (status.error || 'unknown');
        }

        case '/dashboard': {
          const result = await callBridge('getFullDashboard');
          if (result.success) {
            let msg = `📊 *Full Ecosystem Dashboard*\n\n`;
            msg += `*Entities:* ${result.total_entities}\n*Total Records:* ${result.total_records}\n\n`;
            const c = result.counts;
            const cats = [
              ['Marketplace', ['Product', 'Seller', 'Order']],
              ['CRM', ['WhatsAppCRM', 'Referral']],
              ['Music', ['MusicTrack', 'MusicArtist', 'MusicPurchase']],
              ['Film', ['Film', 'FilmCreator', 'FilmPurchase', 'FilmReview']],
              ['Banking', ['ApexAccount', 'ApexTransaction', 'ApexCard', 'ApexLoan', 'ApexSavingsGoal', 'ApexBill']],
              ['Ajo', ['AjoGroup', 'AjoMember', 'AjoContribution']],
              ['Loans', ['MicroLoan', 'LoanApplication', 'BillPayment']],
              ['Education', ['EduCourse', 'EduStudent', 'EduInstructor', 'EduEnrollment', 'EduCertificate']],
              ['Content', ['ContentProject', 'ContentScript', 'ContentCampaign', 'ContentAsset', 'AnalyticsMetric']],
              ['Health', ['HealthProfile', 'HealthMetric', 'Medication', 'MedicalRecord']],
              ['Mental Health', ['MindCareProfile', 'MoodEntry', 'MindCareJournal', 'WellnessGoal']],
              ['Cyber', ['CyberThreat', 'CyberIncident', 'CyberVulnerability', 'CyberAgent']],
              ['Hosting', ['HMDomain', 'HMHostingOrder', 'HMTicket', 'HMInvoice', 'DomainOrder']],
              ['Other', ['BuildProject', 'NexalAdSubmission', 'OracleSession', 'DeployTask', 'FileStore']]
            ];
            cats.forEach(([name, ents]) => {
              const total = ents.reduce((s, e) => s + (c[e] || 0), 0);
              if (total > 0) {
                msg += `*${name}:* ${total}\n  `;
                msg += ents.map(e => `${e.replace(/([A-Z])/g, ' $1').trim()}: ${c[e] || 0}`).join(' | ') + '\n';
              }
            });
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/ecosystem': {
          const summary = await callBridge('getEcosystemSummary');
          if (summary.success) {
            const e = summary.ecosystem;
            let msg = `🌍 *Harz Ecosystem Summary*\n\n`;
            msg += `Platforms: ${e.platforms}\nProducts: ${e.products} (${e.total_product_sales} sales)\n`;
            msg += `Orders: ${e.orders} (${e.paid_orders} paid)\nCRM: ${e.crm_customers} customers\n`;
            msg += `Music: ${e.music_tracks} tracks, ${e.total_music_plays} plays\n`;
            msg += `Films: ${e.films} (${e.total_film_views} views)\n`;
            msg += `Subs: ${e.subscribers} (${e.active_subscribers} active)\n`;
            msg += `Bank: ${e.bank_accounts} accts, $${e.total_bank_balance}\n`;
            msg += `Ajo: ${e.ajo_groups} | Edu: ${e.edu_courses} courses, ${e.edu_students} students\n`;
            msg += `Estate: ${e.estate_properties} | Health: ${e.health_profiles}\n`;
            msg += `Cyber: ${e.cyber_threats} threats | Content: ${e.content_projects} projects\n`;
            msg += `Domains: ${e.domains} | Loans: ${e.micro_loans}`;
            return msg;
          }
          return '❌ ' + (summary.error || 'unknown');
        }

        // ===== CRM =====
        case '/crmstats': {
          const result = await callBridge('getCRMStats');
          if (result.success) {
            const s = result.stats;
            let msg = `📊 *CRM Stats*\n\nTotal: ${s.total_customers}\nNew: ${s.new} | Responded: ${s.responded}\nConverted: ${s.converted} | Rate: ${s.conversion_rate}%\nRevenue: ₦${s.total_revenue.toLocaleString()}\n`;
            if (s.recent_customers.length > 0) { msg += `\n*Recent:*\n`; s.recent_customers.forEach(c => { msg += `  ${c.name} (${c.phone}) — ${c.product} [${c.status}]\n`; }); }
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== ORDERS =====
        case '/orders': {
          const result = await callBridge('getOrders');
          if (result.success) {
            const s = result.summary;
            let msg = `📦 *Orders*\n\nTotal: ${s.total_orders} | Paid: ${s.paid} | Pending: ${s.pending}\nRevenue: ₦${s.total_revenue.toLocaleString()}\n`;
            if (result.orders && result.orders.length > 0) { msg += `\n*Recent:*\n`; result.orders.slice(0, 5).forEach(o => { msg += `  ${o.product_title} — ${o.buyer_name || o.buyer_email} (${o.currency}${o.amount}, ${o.payment_status})\n`; }); }
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== PRODUCTS =====
        case '/products': {
          const result = await callBridge('getProducts');
          if (result.success) {
            const s = result.summary;
            let msg = `🛒 *Products*\n\nTotal: ${s.total_products} (${s.active} active)\nSellers: ${s.total_sellers}\nTotal Sales: ${s.total_sales}\n\n*Top:*\n`;
            s.top_products.forEach(p => { msg += `  ${p.title} — $${p.price} (${p.sales} sales, ⭐${p.rating})\n`; });
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== MUSIC =====
        case '/music': {
          if (args && args.toLowerCase() === 'stats') {
            const result = await callBridge('getMusicTracks');
            if (result.success) {
              const s = result.summary;
              let msg = `🎵 *HarzMusic*\n\nTracks: ${s.total_tracks}\nArtists: ${s.total_artists}\nPlays: ${s.total_plays.toLocaleString()}\nDownloads: ${s.total_downloads}\nPurchases: ${s.total_purchases}\nRevenue: ₦${s.total_revenue.toLocaleString()}\n`;
              if (s.trending.length > 0) { msg += `\n*Trending:*\n`; s.trending.forEach(t => { msg += `  ${t.title} — ${t.artist} (${t.plays} plays)\n`; }); }
              return msg;
            }
            return '❌ ' + (result.error || 'unknown');
          }
          return 'Usage: /music stats';
        }

        case '/artists': {
          const result = await callBridge('getMusicArtists');
          if (result.success) {
            let msg = `🎤 *HarzMusic Artists (${result.total_artists})*\n\n`;
            result.artists.forEach(a => { msg += `  ${a.artist_name}${a.verified ? ' ✓' : ''} — ${a.track_count} tracks, ${a.total_sales} sales\n`; });
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== FILM =====
        case '/films': {
          const result = await callBridge('getFilms');
          if (result.success) {
            const s = result.summary;
            let msg = `🎬 *HarzFilm*\n\nFilms: ${s.total_films}\nCreators: ${s.total_creators}\nViews: ${s.total_views.toLocaleString()}\nPurchases: ${s.total_purchases} | Rentals: ${s.total_rentals}\nReviews: ${s.total_reviews} | Avg: ⭐${s.avg_rating}\n`;
            if (s.featured.length > 0) { msg += `\n*Featured:*\n`; s.featured.forEach(f => { msg += `  ${f.title} — ${f.creator} (⭐${f.rating})\n`; }); }
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/creators': {
          const result = await callBridge('getFilmCreators');
          if (result.success) {
            let msg = `🎬 *HarzFilm Creators (${result.total_creators})*\n\n`;
            result.creators.forEach(c => { msg += `  ${c.creator_name}${c.verified ? ' ✓' : ''} — ${c.film_count} films, ${c.total_sales} sales\n`; });
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== BANKING =====
        case '/apex': {
          const result = await callBridge('getApexAccounts');
          if (result.success) {
            const s = result.summary;
            let msg = `🏦 *Apex Bank*\n\nAccounts: ${s.total_accounts}\nBalance: $${s.total_balance.toLocaleString()}\nTransactions: ${s.total_transactions}\nCards: ${s.total_cards} | Loans: ${s.total_loans}\n\n*Recent TXN:*\n`;
            s.recent_transactions.forEach(t => { msg += `  ${t.type}: $${t.amount} — ${t.description} [${t.status}]\n`; });
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/apexcards': {
          const result = await callBridge('getApexCards');
          if (result.success) { let msg = `💳 *Apex Cards (${result.total_cards})*\n\n`; result.cards.forEach(c => { msg += `  ${c.card_holder_name} — ${c.card_type} ••••${c.card_number?.slice(-4) || ''} [${c.status}]\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/apexloans': {
          const result = await callBridge('getApexLoans');
          if (result.success) { const s = result.summary; let msg = `💰 *Apex Loans*\n\nTotal: ${s.total_loans} | Active: ${s.active}\nBorrowed: $${s.total_borrowed.toLocaleString()} | Paid: $${s.total_paid.toLocaleString()}\n`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== AJO =====
        case '/ajo': {
          const result = await callBridge('getAjoGroups');
          if (result.success) {
            const s = result.summary;
            let msg = `💰 *HarzAjo*\n\nGroups: ${s.total_groups}\nMembers: ${s.total_members}\nCollected: ₦${s.total_collected.toLocaleString()}\nContributions: ${s.total_contributions}\n`;
            if (result.groups && result.groups.length > 0) { msg += `\n*Groups:*\n`; result.groups.forEach(g => { msg += `  ${g.admin_name || 'Group'} — ${g.capacity} cap, ${g.currency}${g.contribution_amount}/${g.cycle_frequency}\n`; }); }
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== LOANS =====
        case '/loans': {
          const result = await callBridge('getLoans');
          if (result.success) { const s = result.summary; let msg = `💵 *HarzLend*\n\nTotal: ${s.total_loans} | Approved: ${s.approved} | Pending: ${s.pending}\nDisbursed: ₦${s.total_disbursed.toLocaleString()}\nApplications: ${s.total_applications}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== FX =====
        case '/fx': {
          const result = await callBridge('getFXRates');
          if (result.success) { let msg = `💱 *FX Rates (${result.total_rates})*\n`; result.rates.slice(0, 10).forEach(r => { msg += `  ${r.currency_code}: ₦${r.rate} (${r.daily_change_percent || '0'}%)\n`; }); if (result.total_trades > 0) msg += `\nTrades: ${result.total_trades} (${result.active_trades} active)`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== ESTATE =====
        case '/estate': {
          const result = await callBridge('getEstateProperties');
          if (result.success) { let msg = `🏠 *Estate Properties (${result.count})*\nInquiries: ${result.inquiries} | Pros: ${result.professionals} | Materials: ${result.materials}\n\n`; result.properties.slice(0, 5).forEach(p => { msg += `  ${p.title} — ${p.location}\n  ${p.bedrooms} bed, ${p.bathrooms} bath | ${p.currency} ${p.price?.toLocaleString()} [${p.status}]\n\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/inquiries': {
          const result = await callBridge('getEstateInquiries');
          if (result.success) { let msg = `📩 *Estate Inquiries (${result.count})*\n\n`; if (result.inquiries.length > 0) result.inquiries.slice(0, 5).forEach(i => { msg += `  ${i.full_name} — ${i.interest}\n  ${i.email} | ${i.phone} [${i.status}]\n\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== EDUCATION =====
        case '/edu': {
          const result = await callBridge('getEduCourses');
          if (result.success) { let msg = `🎓 *EduWealth*\n\nCourses: ${result.total_courses}\nStudents: ${result.total_students}\nEnrollments: ${result.total_enrollments}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/students': {
          const result = await callBridge('getEduStudents');
          if (result.success) { let msg = `🎓 *Students (${result.total})*\n\n`; result.students.slice(0, 5).forEach(s => { msg += `  ${s.full_name} — L${s.level} | XP: ${s.xp_points} | ${s.enrolled_courses?.length || 0} courses\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/jobs': {
          const result = await callBridge('getEduJobs');
          if (result.success) { let msg = `💼 *Job Postings (${result.total})*\n\n`; result.jobs.slice(0, 5).forEach(j => { msg += `  ${j.job_title} — ${j.company_name}\n  ${j.location} | ${j.salary_range} ${j.currency} [${j.status}]\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/liveclass': {
          const result = await callBridge('getEduLiveClasses');
          if (result.success) { let msg = `📹 *Live Classes (${result.total})*\n\n`; result.classes.forEach(c => { msg += `  ${c.title}\n  ${c.scheduled_date} ${c.scheduled_time} | ${c.registered_count}/${c.max_participants}\n  [${c.status}]\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== CONTENT =====
        case '/content': {
          const result = await callBridge('getContentProjects');
          if (result.success) { let msg = `📝 *Content Pipeline*\n\nProjects: ${result.total_projects}\nCampaigns: ${result.total_campaigns}\nScripts: ${result.total_scripts}\nAssets: ${result.total_assets}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/analytics': {
          const result = await callBridge('getContentAnalytics');
          if (result.success) { let msg = `📈 *Content Analytics*\n\nMetrics: ${result.total_metrics}\nSchedules: ${result.total_schedules}\nTrends: ${result.total_trends}\nMonetization Channels: ${result.monetization?.length || 0}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/aiagents': {
          const result = await callBridge('getAIExecutives');
          if (result.success) { let msg = `🤖 *AI Executives (${result.total})*\n\n`; result.executives.forEach(e => { msg += `  ${e.agent_name} — ${e.role} [${e.status}]\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== HEALTH =====
        case '/health': {
          const result = await callBridge('getHealthProfiles');
          if (result.success) { let msg = `🏥 *OMEGA HEALTH AI*\n\nProfiles: ${result.profiles}\nMetrics: ${result.metrics}\nMedications: ${result.medications}\nRecords: ${result.records}\nAgents: ${result.agents}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/appointments': {
          const result = await callBridge('getAppointments');
          if (result.success) { let msg = `📅 *Appointments*\n\n`; if (result.appointments.length > 0) result.appointments.forEach(a => { msg += `  ${a.provider_name} — ${a.facility}\n  ${a.appointment_date} ${a.appointment_time} [${a.status}]\n`; }); else msg += 'No upcoming appointments.'; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== MENTAL HEALTH =====
        case '/mindcare': {
          const result = await callBridge('getMindCare');
          if (result.success) { let msg = `🧠 *MindCare AI*\n\nProfiles: ${result.profiles}\nMood Entries: ${result.mood_entries}\nJournals: ${result.journals}\nAssessments: ${result.assessments}\nGoals: ${result.goals}\nExercises: ${result.exercises}\nMeditations: ${result.meditations}\nCrisis Alerts: ${result.crisis_alerts}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== CYBER =====
        case '/cyber': {
          const result = await callBridge('getCyberStatus');
          if (result.success) { let msg = `🛡️ *CYBER SHIELD X*\n\nThreats: ${result.threats} (${result.active_threats} active, ${result.resolved_threats} resolved)\nIncidents: ${result.incidents}\nVulnerabilities: ${result.vulnerabilities}\nAgents: ${result.agents}\nEndpoints: ${result.endpoints}\nThreat Intel: ${result.threat_intel}\nSecurity Events: ${result.security_events}\nCompliance: ${result.compliance_reports}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== HOSTING =====
        case '/domains': {
          const result = await callBridge('getDomainOrders');
          if (result.success) { let msg = `🌐 *HostMaster*\n\nDomains: ${result.domains}\nHosting Orders: ${result.hosting_orders}\nTickets: ${result.tickets} (${result.open_tickets} open)\nInvoices: ${result.invoices}\nDomain Orders: ${result.domain_orders}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== OTHER PLATFORMS =====
        case '/oracle': {
          const result = await callBridge('getOracleSessions');
          if (result.success) { let msg = `🔮 *Oracle AI*\n\nSessions: ${result.total} | Active: ${result.active}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/builds': {
          const result = await callBridge('getBuildProjects');
          if (result.success) { let msg = `🏗️ *BuildBot AI (${result.total})*\n\n`; Object.entries(result.by_status).forEach(([s, c]) => { msg += `  ${s}: ${c}\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/ads': {
          const result = await callBridge('getNexalAds');
          if (result.success) { let msg = `📢 *Nexal Ads (${result.total})*\nPending: ${result.pending}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/deploys': {
          const result = await callBridge('getDeployTasks');
          if (result.success) { let msg = `🚀 *Deploy Tasks (${result.total})*\n\n`; Object.entries(result.by_status).forEach(([s, c]) => { msg += `  ${s}: ${c}\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/omega': {
          const result = await callBridge('getOmegaProjects');
          if (result.success) { let msg = `♾️ *OMEGA INFINITY*\n\nProjects: ${result.total_projects}\nRuns: ${result.runs}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/referrals': {
          const result = await callBridge('getReferrals');
          if (result.success) { const s = result.summary; let msg = `🔗 *Referrals*\n\nTotal: ${s.total} | Paid: ${s.paid} | Pending: ${s.pending}\nCommission: ₦${s.total_commission.toLocaleString()}`; return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/subs': {
          const result = await callBridge('getSubscribers');
          if (result.success) { const s = result.summary; let msg = `📈 *ContentPilot Subs*\n\nTotal: ${s.total_subscribers} | Active: ${s.active}\nMRR: $${s.total_mrr}\n\n*By Plan:*\n`; Object.entries(s.by_plan).forEach(([p, c]) => { msg += `  ${p}: ${c}\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/files': {
          const result = await callBridge('getFileStore');
          if (result.success) { let msg = `📁 *File Store (${result.total})*\n\n`; result.files.slice(0, 5).forEach(f => { msg += `  ${f.file_name} (${f.file_type}, ${f.file_size})\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== EMAIL =====
        case '/sendemail': {
          const parts = (args || '').split(':');
          if (parts.length < 3) return 'Usage: /sendemail recipient@email.com:Subject:Body text';
          const [to, subject, ...bodyParts] = parts;
          const result = await callBridge('sendEmail', { to, subject, body: bodyParts.join(':') });
          if (result.success) return `✅ Email sent to ${to}! ID: ${result.messageId}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/readmail': {
          const result = await callBridge('readEmails', { max: 5 });
          if (result.success) { if (result.count === 0) return '📭 No emails'; let msg = `📧 *Recent (${result.count})*\n\n`; result.emails.forEach(e => { msg += `*From:* ${e.from}\n*Subject:* ${e.subject}\n${e.snippet}\n\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/calendar': {
          const result = await callBridge('getCalendar', { daysAhead: 7 });
          if (result.success) { if (result.count === 0) return '📅 No upcoming events'; let msg = `📅 *Events (${result.count})*\n\n`; result.events.forEach(e => { msg += `*${e.summary}*\n  ${e.start} → ${e.end}\n`; if (e.location) msg += `  📍 ${e.location}\n`; msg += '\n'; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== ENTITY QUERIES =====
        case '/entity': {
          if (!args) return 'Usage: /entity [EntityName] — returns all records';
          const result = await callBridge('getEntityData', { entityName: args.trim() });
          if (result.success) return `📋 *${args.trim()}*: ${result.count} records`;
          return '❌ ' + (result.error || 'unknown');
        }

        case '/count': {
          if (!args) return 'Usage: /count [EntityName]';
          const result = await callBridge('getEntityCount', { entityName: args.trim() });
          if (result.success) return `📊 ${result.entity}: ${result.count} records`;
          return '❌ ' + (result.error || 'unknown');
        }

        case '/multi': {
          if (!args) return 'Usage: /multi Entity1,Entity2,Entity3';
          const entities = args.split(',').map(e => e.trim());
          const result = await callBridge('multiQuery', { entities });
          if (result.success) { let msg = `📊 *Multi-Query*\n\n`; Object.entries(result.summary).forEach(([e, c]) => { msg += `  ${e}: ${c}\n`; }); return msg; }
          return '❌ ' + (result.error || 'unknown');
        }

        // ===== WRITE COMMANDS (Create/Update/Delete) =====
        case '/create': {
          // /create EntityName:{"field":"value","field2":"value2"}
          if (!args) return 'Usage: /create EntityName:{"field":"value"}';
          const colonIdx = args.indexOf(':');
          if (colonIdx < 0) return 'Usage: /create EntityName:{"field":"value"}';
          const entityName = args.substring(0, colonIdx).trim();
          const jsonStr = args.substring(colonIdx + 1).trim();
          try {
            const data = JSON.parse(jsonStr);
            const result = await callBridge('createEntityRecord', { entityName, data });
            if (result.success) return `✅ Created ${entityName} record! ID: ${result.record?.id || 'unknown'}`;
            return '❌ ' + (result.error || 'create failed');
          } catch (e) { return '❌ Invalid JSON: ' + e.message; }
        }

        case '/update': {
          // /update EntityName:id:{"field":"value"}
          if (!args) return 'Usage: /update EntityName:id:{"field":"value"}';
          const parts = args.split(':');
          if (parts.length < 3) return 'Usage: /update EntityName:id:{"field":"value"}';
          const entityName = parts[0].trim();
          const id = parts[1].trim();
          const jsonStr = parts.slice(2).join(':').trim();
          try {
            const data = JSON.parse(jsonStr);
            const result = await callBridge('updateEntityRecord', { entityName, id, data });
            if (result.success) return `✅ Updated ${entityName} ${id}!`;
            return '❌ ' + (result.error || 'update failed');
          } catch (e) { return '❌ Invalid JSON: ' + e.message; }
        }

        case '/delete': {
          // /delete EntityName:id
          if (!args) return 'Usage: /delete EntityName:id';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /delete EntityName:id';
          const entityName = parts[0].trim();
          const id = parts[1].trim();
          const result = await callBridge('deleteEntityRecord', { entityName, id });
          if (result.success) return `✅ Deleted ${entityName} ${id}!`;
          return '❌ ' + (result.error || 'delete failed');
        }

        case '/addcrm': {
          // /addcrm Name:Phone:Inquiry:Message
          if (!args) return 'Usage: /addcrm Name:Phone:InquiryType:Message';
          const parts = args.split(':');
          if (parts.length < 4) return 'Usage: /addcrm Name:Phone:InquiryType:Message';
          const [name, phone, inquiry, ...msgParts] = parts;
          const result = await callBridge('createEntityRecord', {
            entityName: 'WhatsAppCRM',
            data: { customer_name: name, customer_phone: phone, inquiry_type: inquiry, message: msgParts.join(':'), status: 'new', response_sent: false, platform: 'telegram' }
          });
          if (result.success) return `✅ CRM customer added: ${name} (${phone})
ID: ${result.record?.id || ''}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/addproduct': {
          // /addproduct Title:Price:Category
          if (!args) return 'Usage: /addproduct Title:Price:Category';
          const parts = args.split(':');
          if (parts.length < 3) return 'Usage: /addproduct Title:Price:Category';
          const [title, price, category] = parts;
          const result = await callBridge('createEntityRecord', {
            entityName: 'Product',
            data: { title, price: parseFloat(price) || 0, category, currency: 'USD', status: 'active', sales_count: 0, rating: 0, seller_name: 'Rabiu Hamza', seller_email: 'harzco.business@gmail.com' }
          });
          if (result.success) return `✅ Product added: ${title} ($${price})
ID: ${result.record?.id || ''}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/addorder': {
          // /addorder ProductTitle:BuyerEmail:Amount:Currency
          if (!args) return 'Usage: /addorder ProductTitle:BuyerEmail:Amount:Currency';
          const parts = args.split(':');
          if (parts.length < 4) return 'Usage: /addorder ProductTitle:BuyerEmail:Amount:Currency';
          const [title, email, amount, currency] = parts;
          const result = await callBridge('createEntityRecord', {
            entityName: 'Order',
            data: { product_title: title, buyer_email: email, amount: parseFloat(amount) || 0, currency: currency || 'NGN', payment_status: 'pending', seller_email: 'harzco.business@gmail.com' }
          });
          if (result.success) return `✅ Order created: ${title} for ${email}
Amount: ${currency} ${amount}
ID: ${result.record?.id || ''}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/setstatus': {
          // /setstatus EntityName:id:newstatus
          if (!args) return 'Usage: /setstatus EntityName:id:status';
          const parts = args.split(':');
          if (parts.length < 3) return 'Usage: /setstatus EntityName:id:status';
          const [entityName, id, status] = parts;
          const result = await callBridge('updateEntityRecord', { entityName, id, data: { status } });
          if (result.success) return `✅ ${entityName} ${id} → status: ${status}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/addticket': {
          // /addticket Subject:Message
          if (!args) return 'Usage: /addticket Subject:Your message here';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /addticket Subject:Your message here';
          const [subject, ...msgParts] = parts;
          const result = await callBridge('createEntityRecord', {
            entityName: 'HMTicket',
            data: { ticket_id: 'TKT-' + Date.now().toString(36).toUpperCase(), subject, message: msgParts.join(':'), owner_email: 'harzco.business@gmail.com', owner_name: 'Rabiu Hamza', status: 'open', priority: 'medium', category: 'general' }
          });
          if (result.success) return `✅ Support ticket created: ${subject}
ID: ${result.record?.ticket_id || ''}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/addnote': {
          // /addnote EntityName:id:note text
          if (!args) return 'Usage: /addnote EntityName:id:Your note here';
          const parts = args.split(':');
          if (parts.length < 3) return 'Usage: /addnote EntityName:id:Your note here';
          const [entityName, id, ...noteParts] = parts;
          const note = noteParts.join(':');
          const existing = await callBridge('getEntityData', { entityName });
          if (existing.success && existing.data) {
            const record = existing.data.find(r => r.id === id);
            const currentNotes = record?.notes || '';
            const result = await callBridge('updateEntityRecord', { entityName, id, data: { notes: currentNotes + (currentNotes ? '\n' : '') + new Date().toISOString().slice(0,10) + ': ' + note } });
            if (result.success) return `✅ Note added to ${entityName} ${id}`;
          }
          return '❌ Could not add note';
        }


        // ===== PAYMENT COMMANDS =====
        case '/gateway': {
          const result = await callPayment('paymentStatus');
          if (result.success) {
            const g = result.gateways;
            let msg = `💳 *Payment Gateways*

`;
            msg += `*Paystack:* ${g.paystack.status === 'connected' ? '✅' : '❌'} ${g.paystack.mode}
`;
            msg += `*Stripe:* ${g.stripe.status === 'connected' ? '✅' : '❌'} ${g.stripe.mode}
`;
            msg += `*Flutterwave:* ${g.flutterwave.status === 'connected' ? '✅' : '❌'} ${g.flutterwave.mode}
`;
            return msg;
          }
          return '❌ ' + (result.error || 'unknown');
        }

        case '/paystats': {
          const [ps, st] = await Promise.all([callPayment('paystackStats'), callPayment('stripeStats')]);
          let msg = `📊 *Payment Statistics*

`;
          if (ps.success) {
            msg += `*Paystack (${ps.mode})*
`;
            msg += `Balance: ₦${(ps.balance || 0).toLocaleString()}
`;
            msg += `Transactions: ${ps.totalTxns} (${ps.successTxns} success)
`;
            msg += `Revenue: ₦${(ps.successAmount || 0).toLocaleString()}
`;
            msg += `Customers: ${ps.customers}
`;
            if (ps.recentTxns && ps.recentTxns.length > 0) {
              msg += `
*Recent:*
`;
              ps.recentTxns.forEach(t => { msg += `  ${t.email} — ₦${t.amount.toLocaleString()} [${t.status}]
`; });
            }
          }
          if (st.success) {
            msg += `
*Stripe (${st.mode})*
`;
            msg += `Balance: $${(st.balance?.[0]?.amount || 0).toFixed(2)}
`;
            msg += `Charges: ${st.totalCharges} (${st.succeededCharges} succeeded)
`;
            msg += `Revenue: $${st.totalRevenue.toFixed(2)}
`;
          }
          return msg;
        }

        case '/paylink': {
          // /paylink email:amount:currency:title
          if (!args) return 'Usage: /paylink email:amount:currency:title — Example: /paylink customer@email.com:5000:NGN:Product Name';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /paylink email:amount:currency:title';
          const [email, amount, currency, ...titleParts] = parts;
          const result = await callPayment('paystackCreatePayment', { email, amount: parseFloat(amount), currency: currency || 'NGN', title: titleParts.join(':') || 'Harz Ecosystem' });
          if (result.success) {
            return `✅ *Payment Link Created*

Amount: ${result.currency} ${result.amount.toLocaleString()}
Reference: ${result.reference}

Checkout URL:
${result.checkout_url}`;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stripepay': {
          // /stripepay email:amount:currency:product_name
          if (!args) return 'Usage: /stripepay email:amount:currency:product';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /stripepay email:amount:currency:product';
          const [email, amount, currency, ...prodParts] = parts;
          const result = await callPayment('stripeCheckout', { email, amount: parseFloat(amount), currency: currency || 'usd', product_name: prodParts.join(':') || 'Harz Ecosystem Product' });
          if (result.success) {
            return `✅ *Stripe Checkout*

Amount: ${result.currency} ${result.amount}
Session: ${result.session_id}

Checkout URL:
${result.checkout_url}`;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/verifytxn': {
          if (!args) return 'Usage: /verifytxn [reference]';
          const result = await callPayment('paystackVerify', { reference: args.trim() });
          if (result.success) {
            return `✅ *Transaction Verified*

Reference: ${result.reference}
Amount: ${result.currency} ${result.amount.toLocaleString()}
Status: ${result.status}
Customer: ${result.customer}
Channel: ${result.channel}
Fees: ₦${(result.fees || 0).toLocaleString()}
Date: ${result.date}`;
          }
          return '❌ ' + (result.error || 'not found');
        }

        case '/verifyacct': {
          if (!args) return 'Usage: /verifyacct account:bank_code — Example: /verifyacct 2034326424:033';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /verifyacct account:bank_code';
          const result = await callPayment('paystackVerifyAccount', { account_number: parts[0].trim(), bank_code: parts[1].trim() });
          if (result.success) return `✅ *Account Verified*

Name: ${result.account_name}
Account: ${result.account_number}`;
          return '❌ ' + (result.error || 'not found');
        }

        case '/refund': {
          if (!args) return 'Usage: /refund reference:amount';
          const parts = args.split(':');
          const result = await callPayment('paystackRefund', { reference: parts[0].trim(), amount: parts[1] ? parseFloat(parts[1]) : undefined });
          if (result.success) return `✅ *Refund Initiated*

ID: ${result.refundId}
Amount: ₦${(result.amount || 0).toLocaleString()}
Status: ${result.status}
Ref: ${result.reference}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/nigeriabanks': {
          const result = await callPayment('paystackListBanks');
          if (result.success) {
            let msg = `🏦 *Nigerian Banks (${result.count})*

`;
            result.banks.slice(0, 15).forEach(b => { msg += `  ${b.name} — ${b.code}
`; });
            if (result.count > 15) msg += `
... and ${result.count - 15} more`;
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/paytxn': {
          const result = await callPayment('paystackTransactions', { limit: 10 });
          if (result.success) {
            if (result.count === 0) return '📭 No Paystack transactions yet';
            let msg = `💳 *Paystack Transactions (${result.count})*

`;
            result.transactions.forEach(t => { msg += `  ${t.email || 'Unknown'} — ${t.currency} ${t.amount.toLocaleString()} [${t.status}]
  Ref: ${t.reference}
  ${t.date?.slice(0,10) || ''}

`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stripetxn': {
          const result = await callPayment('stripeTransactions', { limit: 10 });
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe transactions yet';
            let msg = `💜 *Stripe Transactions (${result.count})*

`;
            result.charges.forEach(c => { msg += `  ${c.email || 'Unknown'} — ${c.currency} ${c.amount} [${c.status}]
  ${c.date}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stripebalance': {
          const result = await callPayment('stripeBalance');
          if (result.success) {
            let msg = `💜 *Stripe Balance*

`;
            result.balances.forEach(b => { msg += `  ${b.currency.toUpperCase()}: $${b.amount.toFixed(2)}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/paybalance': {
          const result = await callPayment('paystackBalance');
          if (result.success) {
            let msg = `💳 *Paystack Balance*

`;
            result.balances.forEach(b => { msg += `  ${b.currency}: ₦${b.amount.toLocaleString()}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/recipient': {
          if (!args) return 'Usage: /recipient name:account_number:bank_code';
          const parts = args.split(':');
          if (parts.length < 3) return 'Usage: /recipient name:account_number:bank_code';
          const result = await callPayment('paystackCreateRecipient', { name: parts[0].trim(), account_number: parts[1].trim(), bank_code: parts[2].trim() });
          if (result.success) return `✅ *Recipient Created*

Code: ${result.recipient_code}
Name: ${result.account_name}
Bank: ${result.bank}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/sendmoney': {
          if (!args) return 'Usage: /sendmoney amount:recipient_code:reason';
          const parts = args.split(':');
          if (parts.length < 2) return 'Usage: /sendmoney amount:recipient_code:reason';
          const result = await callPayment('paystackTransfer', { amount: parseFloat(parts[0]), recipient_code: parts[1].trim(), reason: parts[2] || 'Harz Ecosystem transfer' });
          if (result.success) return `✅ *Transfer Initiated*

Amount: ₦${result.amount.toLocaleString()}
Transfer Code: ${result.transfer_code}
Status: ${result.status}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stripeproducts': {
          const result = await callPayment('stripeProducts');
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe products';
            let msg = `💜 *Stripe Products (${result.count})*

`;
            result.products.forEach(p => { msg += `  ${p.name} [${p.active ? 'active' : 'inactive'}]
  ID: ${p.id}
`; if (p.description) msg += `  ${p.description}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }


        // ===== EXTENDED PAYMENT COMMANDS =====
        case '/pscustomer': {
          if (!args) return 'Usage: /pscustomer email | name | phone';
          const [email, ...rest] = args.split('|');
          const nameParts = (rest[0] || '').trim().split(' ');
          const result = await callPayment('paystackCreateCustomer', { email: email.trim(), first_name: nameParts[0] || '', last_name: nameParts.slice(1).join(' ') || '', phone: (rest[1] || '').trim() });
          if (result.success) return `✅ Customer created!
ID: ${result.customerId}
Code: ${result.customer_code}
Email: ${result.email}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/pscustomers': {
          const result = await callPayment('paystackListCustomers', { limit: 15 });
          if (result.success) {
            if (result.count === 0) return '📭 No customers';
            let msg = `👥 *Paystack Customers (${result.count})*

`;
            result.customers.forEach(c => { msg += `  ${c.email}
  Code: ${c.code} | TXNs: ${c.total_transactions || 0}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/psplan': {
          if (!args) return 'Usage: /psplan name | amount | interval | currency';
          const [name, amount, interval, currency] = args.split('|').map(s => s.trim());
          if (!name || !amount || !interval) return 'Usage: /psplan name | amount | interval(daily/weekly/monthly/annually) | currency';
          const result = await callPayment('paystackCreatePlan', { name, amount: parseFloat(amount), interval, currency: currency || 'NGN' });
          if (result.success) return `✅ Plan created!
Name: ${result.name}
Code: ${result.plan_code}
Amount: ${currency || 'NGN'} ${amount}
Interval: ${interval}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/psplans': {
          const result = await callPayment('paystackListPlans');
          if (result.success) {
            if (result.count === 0) return '📭 No subscription plans';
            let msg = `📋 *Paystack Plans (${result.count})*

`;
            result.plans.forEach(p => { msg += `  ${p.name}
  ${p.currency} ${p.amount} / ${p.interval}
  Code: ${p.plan_code}
  Subscribers: ${p.subscribers || 0}

`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/pspage': {
          if (!args) return 'Usage: /pspage name | amount | currency';
          const [name, amount, currency] = args.split('|').map(s => s.trim());
          if (!name) return 'Usage: /pspage name | amount | currency';
          const result = await callPayment('paystackCreatePage', { name, amount: amount ? parseFloat(amount) : undefined, currency: currency || 'NGN' });
          if (result.success) return `✅ Payment Page Created!
Name: ${result.name}
Slug: ${result.slug}
URL: ${result.page_url}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/pspages': {
          const result = await callPayment('paystackListPages');
          if (result.success) {
            if (result.count === 0) return '📭 No payment pages';
            let msg = `📄 *Paystack Pages (${result.count})*

`;
            result.pages.forEach(p => { msg += `  ${p.name}
  ${p.url}
  ${p.amount ? p.currency + ' ' + p.amount : 'Flexible'} | ${p.active ? 'Active' : 'Inactive'}

`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/pssubaccount': {
          if (!args) return 'Usage: /pssubaccount business_name | bank_code | account_number | percentage';
          const [business_name, settlement_bank, account_number, percentage_charge] = args.split('|').map(s => s.trim());
          if (!business_name || !settlement_bank || !account_number) return 'Usage: /pssubaccount business_name | bank_code | account_number | percentage';
          const result = await callPayment('paystackCreateSubaccount', { business_name, settlement_bank, account_number, percentage_charge: percentage_charge ? parseFloat(percentage_charge) : 0 });
          if (result.success) return `✅ Subaccount created!
Business: ${result.business_name}
Code: ${result.subaccount_code}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/pstransfers': {
          const result = await callPayment('paystackListTransfers', { limit: 10 });
          if (result.success) {
            if (result.count === 0) return '📭 No transfers yet';
            let msg = `💸 *Paystack Transfers (${result.count})*

`;
            result.transfers.forEach(t => { msg += `  ${t.recipient || 'Unknown'}
  ₦${t.amount.toLocaleString()} [${t.status}]
  Ref: ${t.reference}
  ${t.date?.slice(0,10) || ''}

`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stproduct': {
          if (!args) return 'Usage: /stproduct name | description';
          const [name, ...descParts] = args.split('|').map(s => s.trim());
          const result = await callPayment('stripeCreateProduct', { name, description: descParts.join(' | ') });
          if (result.success) return `✅ Stripe product created!
ID: ${result.product_id}
Name: ${result.name}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stprice': {
          if (!args) return 'Usage: /stprice product_id | amount | currency | recurring(month/blank)';
          const [product_id, amount, currency, recurring] = args.split('|').map(s => s.trim());
          if (!product_id || !amount) return 'Usage: /stprice product_id | amount | currency | recurring';
          const result = await callPayment('stripeCreatePrice', { product_id, amount: parseFloat(amount), currency: currency || 'usd', recurring: recurring === 'month', interval: recurring || 'month' });
          if (result.success) return `✅ Price created!
ID: ${result.price_id}
Amount: ${result.currency} ${result.amount}
Recurring: ${result.recurring}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stprices': {
          const result = await callPayment('stripeListPrices');
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe prices';
            let msg = `💰 *Stripe Prices (${result.count})*

`;
            result.prices.forEach(p => { msg += `  ${p.currency} ${p.amount} ${p.recurring ? '/ ' + p.interval : ''}
  ID: ${p.id}
  Product: ${p.product}

`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stcustomer': {
          if (!args) return 'Usage: /stcustomer email | name | phone';
          const [email, name, phone] = args.split('|').map(s => s.trim());
          if (!email) return 'Usage: /stcustomer email | name | phone';
          const result = await callPayment('stripeCreateCustomer', { email, name, phone });
          if (result.success) return `✅ Stripe customer created!
ID: ${result.customer_id}
Email: ${result.email}
Name: ${result.name || 'N/A'}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stcustomers': {
          const result = await callPayment('stripeListCustomers', { limit: 15 });
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe customers';
            let msg = `👥 *Stripe Customers (${result.count})*

`;
            result.customers.forEach(c => { msg += `  ${c.name || c.email || 'Unknown'}
  ID: ${c.id}
  ${c.email || ''} ${c.phone ? '| ' + c.phone : ''}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stsub': {
          if (!args) return 'Usage: /stsub customer_id | price_id';
          const [customer_id, price_id] = args.split('|').map(s => s.trim());
          if (!customer_id || !price_id) return 'Usage: /stsub customer_id | price_id';
          const result = await callPayment('stripeCreateSubscription', { customer_id, price_id });
          if (result.success) return `✅ Subscription created!
ID: ${result.subscription_id}
Status: ${result.status}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stsubs': {
          const result = await callPayment('stripeListSubscriptions');
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe subscriptions';
            let msg = `🔄 *Stripe Subscriptions (${result.count})*

`;
            result.subscriptions.forEach(s => { msg += `  ${s.id}
  Status: ${s.status}
  Customer: ${s.customer}
  Ends: ${s.current_period_end}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stinvoices': {
          const result = await callPayment('stripeListInvoices', { limit: 10 });
          if (result.success) {
            if (result.count === 0) return '📭 No Stripe invoices';
            let msg = `🧾 *Stripe Invoices (${result.count})*

`;
            result.invoices.forEach(i => { msg += `  ${i.number || i.id}
  ${i.currency} ${i.amount_due} [${i.status}]
  ${i.paid ? '✅ Paid' : '⏳ Unpaid'}
`; });
            return msg;
          }
          return '❌ ' + (result.error || 'failed');
        }

        case '/stlink': {
          if (!args) return 'Usage: /stlink price_id | quantity';
          const [price_id, quantity] = args.split('|').map(s => s.trim());
          if (!price_id) return 'Usage: /stlink price_id | quantity';
          const result = await callPayment('stripeCreatePaymentLink', { price_id, quantity: parseInt(quantity) || 1 });
          if (result.success) return `✅ Payment Link Created!
ID: ${result.payment_link_id}
URL: ${result.url}`;
          return '❌ ' + (result.error || 'failed');
        }

        case '/stcoupon': {
          if (!args) return 'Usage: /stcoupon percent_off | duration(once/repeating/forever) | months';
          const [percent_off, duration, months] = args.split('|').map(s => s.trim());
          if (!percent_off) return 'Usage: /stcoupon percent_off | duration | months';
          const result = await callPayment('stripeCreateCoupon', { percent_off: parseFloat(percent_off), duration: duration || 'once', duration_in_months: months ? parseInt(months) : undefined });
          if (result.success) return `✅ Coupon created!
ID: ${result.coupon_id}
${result.percent_off}% off | ${result.duration}`;
          return '❌ ' + (result.error || 'failed');
        }


        default:
          return null;
      }
    } catch (err) {
      return '❌ Bridge error: ' + err.message;
    }
  }
};
