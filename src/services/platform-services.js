// Harz Ecosystem Platform Services — Health, MindCare, CyberShield
// Integrates 3 new platforms into Maganu AI v7.5.0

const MINDCARE_API = 'https://superagent-2286fb2f.base44.app/functions/mindCareAI';
const CYBER_API = 'https://superagent-2286fb2f.base44.app/functions/cyberShieldX';
const HEALTH_API = 'https://superagent-2286fb2f.base44.app/functions/omegaHealthAI';

async function callAPI(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===== MINDCARE AI COMMANDS =====
async function mindcareCommand(args, user) {
  const sub = args[0] || 'help';
  const email = user?.email || 'hamzarabiu390@gmail.com';

  switch(sub) {
    case 'chat': {
      const msg = args.slice(1).join(' ');
      if (!msg) return 'Usage: /mindcare chat <your message>';
      const d = await callAPI(MINDCARE_API, { action: 'chat', email, message: msg });
      if (d.response) {
        let r = `🧠 MindCare AI:\n\n${d.response}`;
        if (d.detected_emotion) r += `\n\nEmotion: ${d.detected_emotion}`;
        if (d.crisis) r += `\n\n🚨 CRISIS RESOURCES:\n${d.crisis_resources.join('\n')}`;
        r += `\n\n⚠️ Not a licensed therapist. For professional help, consult a mental health professional.`;
        return r;
      }
      return 'MindCare AI unavailable. Try again later.';
    }
    case 'mood': {
      if (args.length < 4) return 'Usage: /mindcare mood <happiness 1-10> <anxiety 1-10> <stress 1-10> [notes]';
      const d = await callAPI(MINDCARE_API, {
        action: 'log_mood', email,
        happiness: parseInt(args[1]), anxiety: parseInt(args[2]), stress: parseInt(args[3]),
        energy: 5, motivation: 5, confidence: 5, focus: 5, anger: 1,
        notes: args.slice(4).join(' ') || ''
      });
      if (d.success) {
        let r = `✅ Mood logged!\nWellness Score: ${d.wellness_score}/100\nMood: ${d.mood.mood_label}`;
        if (d.crisis_alert) r += '\n\n🚨 Crisis support has been provided.';
        return r;
      }
      return 'Failed to log mood.';
    }
    case 'journal': {
      const content = args.slice(1).join(' ');
      if (!content) return 'Usage: /mindcare journal <your thoughts>';
      const d = await callAPI(MINDCARE_API, { action: 'create_journal', email, title: 'Telegram Entry', content });
      if (d.journal) {
        return `✅ Journal saved!\n\nEmotion: ${d.journal.dominant_emotion}\nSentiment: ${d.journal.sentiment_score}\n\nInsights: ${d.journal.growth_insights}`;
      }
      return 'Failed to save journal.';
    }
    case 'assess': {
      const type = (args[1] || 'PHQ-9').toUpperCase();
      if (!['PHQ-9','GAD-7','WHO-5','PSS'].includes(type)) return 'Available: PHQ-9, GAD-7, WHO-5, PSS';
      const d = await callAPI(MINDCARE_API, { action: 'get_assessment', assessment_type: type });
      if (d.assessment) {
        let r = `📋 ${d.assessment.name}\n${d.assessment.description}\n\n`;
        d.assessment.questions.forEach((q,i) => { r += `${i+1}. ${q}\n  Options: ${d.assessment.options.join(' | ')}\n`; });
        r += `\nTo submit: /mindcare submit ${type} <scores comma-separated>\n⚠️ Screening tool only — not a diagnosis.`;
        return r;
      }
      return 'Assessment unavailable.';
    }
    case 'submit': {
      const type = (args[1] || 'PHQ-9').toUpperCase();
      const answers = (args[2] || '').split(',').map(Number);
      if (answers.length < 3) return 'Usage: /mindcare submit <type> <scores comma-separated>\nExample: /mindcare submit PHQ-9 0,1,2,3,0,1,2,3,0';
      const d = await callAPI(MINDCARE_API, { action: 'submit_assessment', email, assessment_type: type, answers });
      if (d.result) {
        return `📋 ${type} Results:\nScore: ${d.result.score}/${d.result.max_score}\nSeverity: ${d.result.severity}\n\n${d.result.interpretation}\n\nRecommendation: ${d.result.recommendations}\n\n⚠️ ${d.result.disclaimer}`;
      }
      return 'Failed to submit assessment.';
    }
    case 'crisis': {
      const d = await callAPI(MINDCARE_API, { action: 'crisis_resources' });
      if (d.resources) {
        let r = '🚨 Crisis Resources\n\nNigeria:\n';
        d.resources.nigeria.forEach(x => r += `• ${x}\n`);
        r += '\nInternational:\n';
        d.resources.international.forEach(x => r += `• ${x}\n`);
        r += `\n${d.resources.message}`;
        return r;
      }
      return 'Resources unavailable.';
    }
    case 'therapy': {
      const type = (args[1] || 'CBT').toUpperCase();
      const d = await callAPI(MINDCARE_API, { action: 'get_therapy_exercises', therapy_type: type.toLowerCase() });
      if (d.exercises) {
        let r = `🧘 ${type} Therapy Exercises:\n\n`;
        d.exercises.forEach((e,i) => {
          r += `${i+1}. ${e.name}\n   ${e.description}\n   Duration: ${e.duration_minutes} min\n   Steps: ${e.steps}\n\n`;
        });
        return r;
      }
      return 'Exercises unavailable.';
    }
    case 'meditate': {
      const d = await callAPI(MINDCARE_API, { action: 'get_meditations' });
      if (d.meditations) {
        let r = '🎵 Meditation Library:\n\n';
        d.meditations.forEach((m,i) => {
          r += `${i+1}. ${m.session_name} (${m.session_type})\n   ${m.description}\n   ${m.duration_minutes} min | ${m.difficulty}\n\n`;
        });
        return r;
      }
      return 'Meditation library unavailable.';
    }
    case 'help':
    default:
      return `🧠 MindCare AI Commands:\n\n/mindcare chat <message> — Talk to AI companion\n/mindcare mood <happy> <anxiety> <stress> [notes] — Log mood\n/mindcare journal <text> — Write journal entry\n/mindcare assess <PHQ-9|GAD-7|WHO-5|PSS> — Take assessment\n/mindcare submit <type> <scores> — Submit assessment answers\n/mindcare therapy <CBT|DBT|ACT|mindfulness> — Get exercises\n/mindcare meditate — Browse meditation library\n/mindcare crisis — Get crisis resources\n\n⚠️ Educational support only. Not a substitute for professional care.`;
  }
}

// ===== CYBER SHIELD X COMMANDS =====
async function cyberCommand(args, user) {
  const sub = args[0] || 'help';

  switch(sub) {
    case 'stats': {
      const d = await callAPI(CYBER_API, { action: 'stats' });
      if (d.stats) {
        return `🛡️ CYBER SHIELD X Stats:\n\nAgents: ${d.stats.ai_agents} (${d.stats.active_agents} active)\nExecutives: ${d.stats.executives} | Specialists: ${d.stats.specialists}\nSuccess Rate: ${d.stats.avg_agent_success}%\n\nThreats: ${d.stats.threats_detected} (${d.stats.threats_blocked} blocked)\nIncidents: ${d.stats.open_incidents} open / ${d.stats.total_incidents} total\nVulns: ${d.stats.vulnerabilities} (${d.stats.patched_vulns} patched)\nEndpoints: ${d.stats.endpoints}\nEvents: ${d.stats.security_events} (${d.stats.blocked_events} blocked)\nIntel: ${d.stats.threat_intel_items} items`;
      }
      return 'Stats unavailable.';
    }
    case 'threats': {
      const d = await callAPI(CYBER_API, { action: 'get_threats', limit: 10 });
      if (d.threats && d.threats.length) {
        let r = '🔥 Recent Threats:\n\n';
        d.threats.forEach((t,i) => {
          r += `${i+1}. [${t.severity.toUpperCase()}] ${t.threat_type} → ${t.target_asset}\n   Source: ${t.source_ip} | Score: ${t.risk_score}/100 | ${t.status}\n\n`;
        });
        return r;
      }
      return 'No threats detected.';
    }
    case 'simulate': {
      const type = args[1] || 'malware';
      const d = await callAPI(CYBER_API, { action: 'simulate_attack', attack_type: type });
      if (d.threat) {
        let r = `⚡ Simulated ${d.threat.threat_type} Attack:\n\nSeverity: ${d.threat.severity.toUpperCase()}\nSource: ${d.threat.source_ip} → ${d.threat.target_asset}\nRisk Score: ${d.threat.risk_score}/100\nMITRE: ${d.threat.mitre_attack_id}\n\nAI Analysis: ${d.threat.ai_analysis}`;
        if (d.auto_response) {
          r += `\n\n🤖 AUTO-RESPONSE (${d.auto_response.response_time_ms}ms):`;
          d.auto_response.actions.forEach(a => r += `\n✓ ${a}`);
        }
        return r;
      }
      return 'Simulation failed.';
    }
    case 'score': {
      const d = await callAPI(CYBER_API, { action: 'security_score' });
      if (d.score !== undefined) {
        return `📈 Security Score: ${d.score}/100 (Grade: ${d.grade})\n\nOpen incidents: ${d.breakdown.open_incidents}\nCritical threats: ${d.breakdown.critical_threats}\nHigh vulns: ${d.breakdown.high_vulns}\nCompromised endpoints: ${d.breakdown.compromised_endpoints}`;
      }
      return 'Score unavailable.';
    }
    case 'agents': {
      const d = await callAPI(CYBER_API, { action: 'agents' });
      if (d.agents) {
        let r = `🤖 AI Security Fleet (${d.total} agents, ${d.active} active):\n\nExecutives:\n`;
        d.agents.filter(a => a.tier === 'executive').forEach(a => {
          r += `• ${a.agent_name} — ${a.role} (${a.success_rate}%)\n`;
        });
        r += `\nSpecialists:\n`;
        d.agents.filter(a => a.tier === 'specialist').forEach(a => {
          r += `• ${a.agent_name} — ${a.specialization.substring(0,40)} (${a.success_rate}%)\n`;
        });
        return r;
      }
      return 'Agents unavailable.';
    }
    case 'checkip': {
      const ip = args[1];
      if (!ip) return 'Usage: /cyber checkip <IP address>';
      const d = await callAPI(CYBER_API, { action: 'check_ip_reputation', ip });
      if (d.reputation) {
        return `🔍 IP Reputation: ${d.reputation.ip}\nReputation: ${d.reputation.reputation.toUpperCase()}\nRisk: ${d.reputation.risk_level}\nDetails: ${d.reputation.details}`;
      }
      return 'Check failed.';
    }
    case 'compliance': {
      const fw = args[1] || 'ISO27001';
      const d = await callAPI(CYBER_API, { action: 'run_compliance_check', framework: fw });
      if (d.report) {
        return `📋 ${d.report.report_title}\nScore: ${d.report.score}/${d.report.max_score}\nStatus: ${d.report.status}\n\nFindings: ${d.report.findings}\n\nRecommendations: ${d.report.recommendations}`;
      }
      return 'Compliance check failed.';
    }
    case 'help':
    default:
      return `🛡️ CYBER SHIELD X Commands:\n\n/cyber stats — Platform overview\n/cyber threats — Recent threats\n/cyber simulate <attack_type> — Simulate attack\n/cyber score — Security health score\n/cyber agents — View 37 AI agents\n/cyber checkip <IP> — Check IP reputation\n/cyber compliance <framework> — Run audit\n\nAttack types: malware, ransomware, phishing, ddos, sql_injection, xss, rce, credential_theft, botnet, api_attack\nFrameworks: ISO27001, SOC2, PCI_DSS, GDPR, HIPAA, NIST_CSF, CIS_Controls, OWASP_Top10`;
  }
}

// ===== OMEGA HEALTH AI COMMANDS =====
async function healthCommand(args, user) {
  const sub = args[0] || 'help';
  const email = user?.email || 'hamzarabiu390@gmail.com';

  switch(sub) {
    case 'stats': {
      const d = await callAPI(HEALTH_API, { action: 'stats' });
      if (d.stats) {
        return `🏥 OMEGA HEALTH AI:\n\nAgents: ${d.stats.agents || 'N/A'}\nProfiles: ${d.stats.profiles || 0}\nAssessments: ${d.stats.assessments || 0}\nNutrition Plans: ${d.stats.nutrition_plans || 0}\nFitness Plans: ${d.stats.fitness_plans || 0}\nMedications: ${d.stats.medications || 0}\nAppointments: ${d.stats.appointments || 0}`;
      }
      return 'Stats unavailable.';
    }
    case 'symptom': {
      const symptoms = args.slice(1).join(' ');
      if (!symptoms) return 'Usage: /health symptom <describe your symptoms>';
      const d = await callAPI(HEALTH_API, { action: 'symptom_check', email, symptoms });
      if (d.analysis) {
        let r = `🏥 AI Symptom Assessment:\n\n${d.analysis}\n\nPossible conditions: ${d.possible_conditions || 'See full analysis'}\nCare level: ${d.care_level || 'See analysis'}\n\n⚠️ Educational guidance only. Not a medical diagnosis. Consult a healthcare professional.`;
        return r;
      }
      return 'Assessment unavailable.';
    }
    case 'agents': {
      const d = await callAPI(HEALTH_API, { action: 'agents' });
      if (d.agents) {
        let r = `🏥 OMEGA HEALTH AI Agents (${d.total}):\n\n`;
        d.agents.forEach(a => {
          r += `• ${a.agent_name} — ${a.role} (${a.success_rate}%)\n`;
        });
        return r;
      }
      return 'Agents unavailable.';
    }
    case 'help':
    default:
      return `🏥 OMEGA HEALTH AI Commands:\n\n/health stats — Platform overview\n/health symptom <description> — AI symptom checker\n/health agents — View 18 medical AI agents\n\n⚠️ Educational guidance only. Not a medical diagnosis. Always consult a healthcare professional.`;
  }
}

module.exports = { mindcareCommand, cyberCommand, healthCommand };
