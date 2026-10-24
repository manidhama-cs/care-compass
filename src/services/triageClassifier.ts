/**
 * Module 2: Triage Classification & Clinical Reasoning Engine
 *
 * Maps screening state to:
 * - care_type: paramedic_home_visit | home_nursing | lab_test_home | teleconsultation | emergency_112 | null
 * - urgency: emergency | same_day | scheduled | null
 * - reasoning: plain-language explanation naming the specific signals driving the decision.
 *   NEVER diagnoses or prescribes medication.
 *
 * Strictly adheres to:
 * 1. Safety Gate priority override (HARD INVARIANT)
 * 2. Unresolved state (care_type=null, urgency=null) while screening is incomplete
 * 3. Never guessing paramedic_home_visit for unknown or vague distress
 * 4. Distinct service categories (Nurse != Doctor != Medic != Phlebotomist)
 */

import { CareType, Urgency, ScreeningSessionState, CompletenessEvaluation } from '../types/triage.ts';
import { SafetyCheckResult } from './safetyDetector.ts';

export interface TriageClassificationResult {
  care_type: CareType;
  urgency: Urgency;
  reasoning: string;
  confidence: number;
}

export function classifyTriage(
  sessionState: ScreeningSessionState,
  safetyResult: SafetyCheckResult,
  completeness: CompletenessEvaluation
): TriageClassificationResult {
  // Priority 1: Emergency Hard Invariant
  if (safetyResult.isEmergency) {
    const flags = safetyResult.redFlags.length > 0 ? safetyResult.redFlags.join(', ') : 'critical red-flag symptoms';
    return {
      care_type: 'emergency_112',
      urgency: 'emergency',
      reasoning: `Red-flag symptoms detected (${flags}); routed immediately to emergency ambulance services (112), not routine home care.`,
      confidence: 1.0
    };
  }

  // Priority 2: Unresolved / Incomplete Screening
  // Must return care_type=null and urgency=null so NO premature final caregiver is recommended!
  if (!completeness.isSufficient) {
    return {
      care_type: null,
      urgency: null,
      reasoning: completeness.reason || "Screening in progress — asking follow-up questions before determining care pathway.",
      confidence: 0.5
    };
  }

  // Compile full user text cleanly without duplicating entries
  const userUtterances = sessionState.conversationHistory
    .filter(turn => turn.role === 'user')
    .map(turn => turn.content);
  const fullText = userUtterances.join(' ').toLowerCase();

  const { requestedService, symptoms, knownAnswers, relevantContext } = sessionState;

  // Priority 3: Explicit Home Nursing (Injection, Wound Dressing, Bedsore, Catheter)
  if (
    requestedService === 'injection' ||
    requestedService === 'dressing' ||
    /\b(injection|insulin|im\s*injection|iv\s*injection|dressing|bedsore|wound\s*dressing|patti|catheter)\b/i.test(fullText) ||
    /इंजेक्शन|इंसुलिन|ड्रेसिंग|पट्टी|कैथेटर/i.test(fullText)
  ) {
    return {
      care_type: 'home_nursing',
      urgency: 'same_day',
      reasoning: "Specific nursing procedure requested; qualified Medic / Nurse home visit; urgency assessed as same_day.",
      confidence: 0.95
    };
  }

  // Priority 4: Home Diagnostic Lab Testing (Blood test, CBC, Thyroid, HbA1c)
  if (
    requestedService === 'lab_test' ||
    /\b(cbc|thyroid|blood\s*test|sugar\s*test|lipid|sample\s*collection|fasting\s*sugar)\b/i.test(fullText) ||
    /सीबीसी|थायराइड|ब्लड\s*टेस्ट|शुगर\s*टेस्ट|सैंपल\s*कलेक्शन/i.test(fullText)
  ) {
    return {
      care_type: 'lab_test_home',
      urgency: 'scheduled',
      reasoning: "Diagnostic pathology test requested; certified phlebotomist home sample collection; urgency assessed as scheduled.",
      confidence: 0.95
    };
  }

  // Priority 5: Teleconsultation (Virtual Doctor)
  // Triggered when:
  // - User explicitly requested doctor consult / reports review / second opinion
  // - User selected 'Doctor Video Consult' in preference follow-up
  // - Mild symptoms (acidity, cold/cough, rashes) suitable for virtual physician review
  const prefersDoctor =
    knownAnswers['care_mode_preference'] === 'teleconsult' ||
    /doctor|video\s*consult|teleconsult|डॉक्टर|सलाह/i.test(String(knownAnswers['care_mode_preference'] || ''));

  const isTeleconsultIntent =
    requestedService === 'doctor_consult' ||
    prefersDoctor ||
    /\b(acidity|gas|second\s*opinion|reports?|prescription|consult|teleconsult|talk\s*to\s*(a\s*)?doctor)\b/i.test(fullText) ||
    /एसिडिटी|गैस|सेकंड\s*ओपिनियन|डॉक्टर\s*से\s*बात|रिपोर्ट\s*दिखानी/i.test(fullText);

  if (isTeleconsultIntent) {
    return {
      care_type: 'teleconsultation',
      urgency: 'same_day',
      reasoning: "Non-urgent health query suitable for online physician review; urgency assessed as same_day.",
      confidence: 0.92
    };
  }

  // Priority 6: Paramedic Home Visit (Medic Assessment & Vitals Monitoring)
  // Reserved for:
  // - In-person vitals checks (BP, blood glucose, SpO2 monitoring)
  // - Weakness/bedridden elderly assessment needing in-person examination
  // - When user explicitly chose in-person Medic visit
  const prefersMedic =
    knownAnswers['care_mode_preference'] === 'medic_visit' ||
    /medic|in-person|home\s*visit|घर\s*पर\s*जांच/i.test(String(knownAnswers['care_mode_preference'] || ''));

  const isParamedicNeed =
    prefersMedic ||
    requestedService === 'vitals_check' ||
    relevantContext.includes('bedridden') ||
    /\b(bp\s*sugar|bp\s*check|vitals|weak\s*and\s*not\s*eating|check-?up\s*at\s*home|kamzor)\b/i.test(fullText) ||
    /बीपी\s*चेक|घर\s*पर\s*जांच|कमजोर\s*हैं/i.test(fullText);

  if (isParamedicNeed) {
    return {
      care_type: 'paramedic_home_visit',
      urgency: 'same_day',
      reasoning: "Comprehensive in-person vitals monitoring and physical assessment by certified Medic; urgency assessed as same_day.",
      confidence: 0.90
    };
  }

  // Symptom-driven default when user has symptoms like fever/cough and completed screening:
  // Prefer teleconsultation as the safe, conservative first line of medical assessment
  if (symptoms.length > 0) {
    return {
      care_type: 'teleconsultation',
      urgency: 'same_day',
      reasoning: `Symptom profile (${symptoms.join(', ')}) routed to online physician consultation for initial assessment.`,
      confidence: 0.88
    };
  }

  // If information is genuinely ambiguous and no category fits:
  // DO NOT guess paramedic_home_visit. Return unresolved with guidance to connect with human support!
  return {
    care_type: null,
    urgency: null,
    reasoning: "Health inquiry details are insufficient to recommend a specific provider type. Please connect with our human care coordinator (1800-SANOCARE).",
    confidence: 0.30
  };
}
