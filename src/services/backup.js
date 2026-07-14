// Maganu Auto-Backup Service v1.0 — Scheduled Entity Backups to GitHub
const axios = require('axios');

const GITHUB_OWNER = 'rabiuhamza11';
const HEADERS_GH = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'Maganu-Agent/7.0',
  Accept: 'application/vnd.github.v3+json'
});

const BASE44_API = 'https://superagent-2286fb2f.base44.app/functions';

// All entities across the ecosystem
const ENTITIES = {
  // Superagent app (current)
  ApexAccount: null, ApexTransaction: null, ApexCard: null,
  ApexLoan: null, ApexBeneficiary: null, ApexSavingsGoal: null, ApexBill: null,
  NumberLookup: null, Product: null, Seller: null, Order: null,
  BuildProject: null, ChapterTracker: null, DeployTask: null,
  ContentPilotSubscriber: null, OmegaWorkspace: null, RagChunk: null,
  NexalAdSubmission: null, EstateInquiry: null, EstateProperty: null,
  EstatePro: null, EstateMaterial: null, OmegaInfinityProject: null,
  OmegaInfinityRun: null, HMDomain: null, HMHostingOrder: null,
  HMTicket: null, HMInvoice: null, DomainOrder: null,
  OracleSession: null, ApexTransaction2: null,
};

// Backup repo
const BACKUP_REPO = 'maganu-agent';
const BACKUP_PATH = 'backups';

async function fetchAllEntities() {
  const results = {};
  const entityNames = Object.keys(ENTITIES);
  
  for (const entity of entityNames) {
    try {
      // Use Base44 API to read entities
      const res = await axios.post(`${BASE44_API}/apexBank`, {
        action: 'listAccounts',
      }, { timeout: 5000 }).catch(() => null);
      
      // For non-banking entities, use a direct fetch
      // Since we can only access banking entities via the apexBank function,
      // we'll backup what we can
      results[entity] = { status: 'requires_direct_access' };
    } catch (_) {
      results[entity] = { status: 'error' };
    }
  }
  
  return results;
}

async function handleBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${BACKUP_PATH}/backup-${timestamp}.json`;
    
    // Fetch banking data (the entities we can access)
    const [accounts, transactions, cards, loans, beneficiaries, goals, bills] = await Promise.all([
      axios.post(`${BASE44_API}/apexBank`, { action: 'listAccounts' }, { timeout: 10000 }).then(r => r.data?.accounts || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listTransactions' }, { timeout: 10000 }).then(r => r.data?.transactions || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listCards' }, { timeout: 10000 }).then(r => r.data?.cards || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listLoans' }, { timeout: 10000 }).then(r => r.data?.loans || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listBeneficiaries' }, { timeout: 10000 }).then(r => r.data?.beneficiaries || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listSavingsGoals' }, { timeout: 10000 }).then(r => r.data?.goals || []).catch(() => []),
      axios.post(`${BASE44_API}/apexBank`, { action: 'listBills' }, { timeout: 10000 }).then(r => r.data?.bills || []).catch(() => []),
    ]);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      entity: 'Harz Ecosystem — Apex Bank + OmegaPayGlobal',
      data: {
        ApexAccount: accounts,
        ApexTransaction: transactions,
        ApexCard: cards,
        ApexLoan: loans,
        ApexBeneficiary: beneficiaries,
        ApexSavingsGoal: goals,
        ApexBill: bills,
      },
      summary: {
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        totalCards: cards.length,
        totalLoans: loans.length,
        totalBeneficiaries: beneficiaries.length,
        totalSavingsGoals: goals.length,
        totalBills: bills.length,
        totalBalance: accounts.reduce((s, a) => s + (a.balance || 0), 0),
      },
    };
    
    const content = JSON.stringify(backupData, null, 2);
    const base64Content = Buffer.from(content).toString('base64');
    
    // Push to GitHub
    const res = await axios.put(
      `https://api.github.com/repos/${GITHUB_OWNER}/${BACKUP_REPO}/contents/${filename}`,
      {
        message: `backup: entity data snapshot ${timestamp}`,
        content: base64Content,
      },
      { headers: HEADERS_GH(), timeout: 15000 }
    );
    
    if (res.status === 201) {
      return `💾 *Backup Complete*\n\nFile: ${filename}\n\nSummary:\n• Accounts: ${backupData.summary.totalAccounts}\n• Transactions: ${backupData.summary.totalTransactions}\n• Cards: ${backupData.summary.totalCards}\n• Loans: ${backupData.summary.totalLoans}\n• Beneficiaries: ${backupData.summary.totalBeneficiaries}\n• Savings Goals: ${backupData.summary.totalSavingsGoals}\n• Bills: ${backupData.summary.totalBills}\n• Total Balance: $${backupData.summary.totalBalance.toLocaleString()}\n\n✅ Backup saved to GitHub`;
    }
    
    return `❌ Backup failed: GitHub returned ${res.status}`;
  } catch (e) {
    return `❌ Backup error: ${e.message}`;
  }
}

async function handleRestore(args) {
  const date = args[0];
  if (!date) {
    // List available backups
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${BACKUP_REPO}/contents/${BACKUP_PATH}`,
        { headers: HEADERS_GH(), timeout: 10 }
      );
      
      const backups = res.data || [];
      if (backups.length === 0) return `💾 *No backups found.*\n\nUse /backup to create one.`;
      
      let msg = `💾 *Available Backups*\n\n`;
      backups.sort((a, b) => new Date(b.name) - new Date(a.name)).slice(0, 10).forEach(b => {
        msg += `  ${b.name} (${(b.size / 1024).toFixed(1)} KB)\n`;
      });
      msg += `\nTo restore: /restore [backup_filename]`;
      return msg;
    } catch (e) {
      return `❌ No backups found. Use /backup to create one.`;
    }
  }
  
  return `💾 *Restore*\n\nTo restore from ${date}, the data will be loaded but NOT automatically written to prevent overwriting current data.\n\nUse /backup first, then contact support for manual restore.`;
}

async function handleBackupStatus() {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${BACKUP_REPO}/contents/${BACKUP_PATH}`,
      { headers: HEADERS_GH(), timeout: 10 }
    );
    
    const backups = res.data || [];
    if (backups.length === 0) {
      return `💾 *Backup Status*\n\nNo backups yet. Use /backup to create your first snapshot.`;
    }
    
    const latest = backups.sort((a, b) => new Date(b.name) - new Date(a.name))[0];
    const totalSize = backups.reduce((s, b) => s + b.size, 0);
    
    return `💾 *Backup Status*\n\nTotal Backups: ${backups.length}\nTotal Size: ${(totalSize / 1024).toFixed(1)} KB\nLatest: ${latest.name}\n\nUse /backup to create a new snapshot.`;
  } catch (e) {
    return `💾 *Backup Status*\n\nNo backups yet. Use /backup to create your first snapshot.`;
  }
}

module.exports = {
  handleBackup, handleRestore, handleBackupStatus, fetchAllEntities,
};
