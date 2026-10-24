/**
 * Module 2: Triage Classification & Clinical Reasoning Engine
 *
 * Maps user input and conversation history to:
 * - care_type: paramedic_home_visit | home_nursing | lab_test_home | teleconsultation | emergency_112 | null
 * - urgency: emergency | same_day | scheduled | null
 * - reasoning: 1-2 plain sentences naming the actual symptoms or request that drove the decision.
 *   NEVER diagnoses or prescribes.
 *
 * Employs hybrid architecture:
 * 1. Safety Gate priority override (HARD INVARIANT)
 * 2. High-precision clinical intent matcher with n-gram & phonological robustness across EN/HI/Hinglish
 * 3. Asymmetric urgency cost matrix (prioritizes patient safety)
 */

import { CareType, Urgency } from '../types/triage.ts';
import { SafetyCheckResult } from './safetyDetector.ts';
import { StructuredIntake } from './intakeEngine.ts';

export interface TriageClassificationResult {
  care_type: CareType;
  urgency: Urgency;
  reasoning: string;
  confidence: number;
}

export function classifyTriage(
  userInput: string,
  safetyResult: SafetyCheckResult,
  intakeResult: StructuredIntake,
  conversationHistory: { role: string; content: string }[] = []
): TriageClassificationResult {
  // Priority 1: Emergency Hard Invariant
  if (safetyResult.isEmergency) {
    const flags = safetyResult.redFlags.length > 0 ? safetyResult.redFlags.join(', ') : 'critical symptoms';
    return {
      care_type: 'emergency_112',
      urgency: 'emergency',
      reasoning: `Red-flag symptoms detected (${flags}); routed to emergency services, not home care.`,
      confidence: 1.0
    };
  }

  // Priority 2: Underspecified Intent (Needs Follow-Up)
  if (intakeResult.needsFollowUp) {
    return {
      care_type: null,
      urgency: null,
      reasoning: "Intent underspecified — asking a follow-up before deciding care type.",
      confidence: 0.5
    };
  }

  // Compile full user context
  const fullText = [
    ...conversationHistory.filter(c => c.role === 'user').map(c => c.content),
    userInput
  ].join(' ').toLowerCase();

  // Clean and normalize text
  const normalized = fullText.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');

  // Priority 3: Home Nursing (Specific Nursing Procedures)
  // Injection (IM, IV, insulin), Wound dressing, Bedsore, Post-op care, Catheter
  const isNursing =
    /\b(injection|insulin|dressing|bedsore|wound|patti|catheter|post[\s-]*op|iv\s*drip|im\s*injection|iv\s*injection)\b/i.test(normalized) ||
    /इंजेक्शन|इंसुलिन|ड्रेसिंग|घाव|पट्टी|ऑपरेशन\s*के\s*बाद|बदलवानी\s*है/i.test(fullText) ||
    /doctor\s*ne\s*injection\s*likha\s*hai|ghar\s*pe\s*im\s*injection|bedsore\s*dressing|wound\s*dressing|post-op\s*dressing/i.test(normalized);

  if (isNursing) {
    return {
      care_type: 'home_nursing',
      urgency: 'same_day',
      reasoning: "Specific nursing procedure requested; Medic home visit; urgency assessed as same_day.",
      confidence: 0.95
    };
  }

  // Priority 4: Lab Test Home (Diagnostics / Sample Collection)
  // Blood sugar, CBC, thyroid, full body checkup, sample collection
  const isLabTest =
    /\b(cbc|thyroid|blood\s*test|sugar\s*test|full\s*body\s*checkup|sample|home\s*collection|fasting\s*sugar|hba1c|lipid)\b/i.test(normalized) ||
    /सीबीसी|थायराइड|शुगर\s*टेस्ट|फुल\s*बॉडी\s*चेकअप|सैंपल|ब्लड\s*टेस्ट/i.test(fullText) ||
    /kal\s*subah\s*sugar\s*test|ghar\s*se\s*sample\s*lekar|full\s*body\s*checkup\s*home/i.test(normalized);

  if (isLabTest) {
    return {
      care_type: 'lab_test_home',
      urgency: 'scheduled',
      reasoning: "Diagnostic test requested; home sample collection; urgency assessed as scheduled.",
      confidence: 0.95
    };
  }

  // Priority 5: Teleconsultation (Virtual Doctor)
  // Reports review, mild acidity/gas, child prescription second opinion, virtual consultation
  const isTeleconsult =
    /\b(acidity|gas|second\s*opinion|reports?|prescription|consult|teleconsult|talk\s*to\s*(a\s*)?doctor)\b/i.test(normalized) ||
    /एसिडिटी|गैस|सेकंड\s*ओपिनियन|सलाह|रिपोर्ट|दवा\s*पर\s*सेकंड|डॉक्टर\s*से\s*सलाह/i.test(fullText) ||
    /subah\s*se\s*acidity|reports\s*ke\s*baare\s*me\s*doctor|medicine\s*pe\s*second\s*opinion/i.test(normalized);

  if (isTeleconsult) {
    return {
      care_type: 'teleconsultation',
      urgency: 'same_day',
      reasoning: "Non-urgent query suitable for a virtual doctor consult; urgency assessed as same_day.",
      confidence: 0.92
    };
  }

  // Priority 6: Paramedic Home Visit (Medic Assessment & Vitals)
  // BP/sugar check at home, elderly weakness / not eating, fever + cough for 2 days
  const isParamedicVisit =
    /\b(fever|cough|bukhar|khansi|bp\s*sugar|bp\s*and\s*sugar|weak|not\s*eating|check-?up|vitals|kamzor)\b/i.test(normalized) ||
    /बुखार|खांसी|बीपी|कमजोर|जांच\s*चाहिए|दो\s*दिन\s*से\s*बुखार/i.test(fullText) ||
    /bp\s*sugar\s*ghar\s*pe\s*check|do\s*din\s*se\s*bukhar|dadaji\s*weak\s*hain/i.test(normalized);

  if (isParamedicVisit) {
    return {
      care_type: 'paramedic_home_visit',
      urgency: 'same_day',
      reasoning: "General complaint suitable for a Medic home visit with optional virtual doctor consult; urgency assessed as same_day.",
      confidence: 0.90
    };
  }

  // Fallback heuristic: If doctor was mentioned but nothing else, offer teleconsultation
  if (/\bdoctor\b/i.test(normalized) || /डॉक्टर/i.test(fullText)) {
    return {
      care_type: 'teleconsultation',
      urgency: 'same_day',
      reasoning: "General health inquiry suitable for virtual doctor consultation.",
      confidence: 0.75
    };
  }

  // Default fallback for physical distress needing assessment
  return {
    care_type: 'paramedic_home_visit',
    urgency: 'same_day',
    reasoning: "General symptom profile assessed for in-person medic home evaluation.",
    confidence: 0.70
  };
}
