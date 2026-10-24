/**
 * Multi-Turn Clinical Screening State Machine & Orchestrator
 *
 * Coordinates:
 * 1. Session state lifecycle (creation, accumulation, retrieval, TTL)
 * 2. Module 0 Safety Gate evaluation on full cumulative conversation
 * 3. Clinical entity extraction & knowledge base updates
 * 4. Explicit sufficiency evaluation (isSufficient check)
 * 5. Triage classification without early-guessing
 * 6. Provider matching with anti-repetition and transparent reasons
 */

import {
  ScreeningSessionState,
  SessionTriageRequest,
  SessionTriageResponse,
  TriageResponse,
  ConversationTurn,
  Location
} from '../types/triage.ts';
import { sessionStore } from './sessionStore.ts';
import { evaluateSafetyGate } from './safetyDetector.ts';
import {
  detectLanguage,
  extractEntitiesFromConversation,
  evaluateScreeningCompleteness
} from './intakeEngine.ts';
import { classifyTriage } from './triageClassifier.ts';
import { matchCaregivers } from './caregiverMatcher.ts';

export function runSessionScreening(request: SessionTriageRequest): SessionTriageResponse {
  const {
    sessionId,
    user_input,
    language = 'auto',
    location = null,
    rejected_caregiver_id,
    selected_caregiver_id,
    conversation_history = [],
    isSingleTurnEvaluation = false
  } = request;

  // 1. Detect language
  const detectedLang = detectLanguage(user_input, language);

  // 2. Retrieve or create session
  const session = sessionStore.getOrCreateSession(sessionId, detectedLang, location);
  session.isSingleTurnEvaluation = isSingleTurnEvaluation;

  // Sync passed conversation history if provided from client
  if (conversation_history.length > 0 && session.conversationHistory.length === 0) {
    session.conversationHistory = [...conversation_history];
  }

  // Handle caregiver rejection if user requested another provider
  if (rejected_caregiver_id) {
    sessionStore.recordCaregiverRejection(session.sessionId, rejected_caregiver_id);
    if (!session.rejectedCaregivers.includes(rejected_caregiver_id)) {
      session.rejectedCaregivers.push(rejected_caregiver_id);
    }
  }

  // Handle caregiver selection
  if (selected_caregiver_id) {
    sessionStore.selectCaregiver(session.sessionId, selected_caregiver_id);
    session.selectedCaregiverId = selected_caregiver_id;
  }

  // 3. Append new user message to session history
  if (user_input && user_input.trim()) {
    session.conversationHistory.push({
      role: 'user',
      content: user_input.trim()
    });
  }

  // 4. Module 0: Emergency Safety Check (FIRST on full context)
  const safetyResult = evaluateSafetyGate(user_input, session.conversationHistory);

  if (safetyResult.isEmergency) {
    session.screeningStatus = 'emergency';
    session.careType = 'emergency_112';
    session.urgency = 'emergency';
    session.reasoning = safetyResult.explanation || 'Emergency red-flag symptom detected.';
    session.matchedCaregivers = [];
    session.nextQuestion = null;
    session.suggestedOptions = [];
    sessionStore.saveSession(session);

    return {
      sessionId: session.sessionId,
      screeningStatus: 'emergency',
      assistantMessage: session.reasoning,
      follow_up_question: null,
      missingInformation: [],
      care_type: 'emergency_112',
      urgency: 'emergency',
      red_flags: safetyResult.redFlags,
      reasoning: session.reasoning,
      matched_caregivers: [],
      suggested_options: [],
      canBook: false,
      nextAction: 'call_112',
      sessionState: session
    };
  }

  // 5. Extract structured entities from full conversation
  const extracted = extractEntitiesFromConversation(session.conversationHistory, user_input);

  // Update session state cumulatively
  if (extracted.targetPerson !== 'unknown') {
    session.targetPerson = extracted.targetPerson;
    session.knownAnswers['target_person_known'] = true;
  }
  if (extracted.requestedService !== 'none') {
    session.requestedService = extracted.requestedService;
    session.knownAnswers['requested_service_known'] = true;
  }
  if (extracted.symptoms.length > 0) {
    for (const s of extracted.symptoms) {
      if (!session.symptoms.includes(s)) {
        session.symptoms.push(s);
      }
    }
  }
  if (extracted.duration) {
    session.duration = extracted.duration;
    session.knownAnswers['duration_known'] = true;
  }
  if (extracted.severity !== 'unknown') {
    session.severity = extracted.severity;
    session.knownAnswers['severity_known'] = true;
  }
  if (extracted.progression !== 'unknown') {
    session.progression = extracted.progression;
  }
  for (const ctx of extracted.relevantContext) {
    if (!session.relevantContext.includes(ctx)) {
      session.relevantContext.push(ctx);
    }
  }

  // If user denied symptoms or confirmed safety
  if (extracted.deniedSymptoms.length > 0 || /safe|theek\s*hai|koi\s*dikkat\s*nahi|nahi|no\b|saans\s*theek|normal/i.test(user_input)) {
    session.knownAnswers['red_flags_cleared'] = true;
  }

  // Progression & Severity signals
  if (
    extracted.progression !== 'unknown' ||
    extracted.severity !== 'unknown' ||
    /badh\s*raha|waisa\s*hi|constant|mild|tez|halka|halki|jyada|worsening|stable|improving/i.test(user_input)
  ) {
    session.knownAnswers['progression_known'] = true;
  }

  // Associated symptoms and Comorbidities check
  if (
    /thand|chills|khansi|cough|gala|throat|ulti|vomiting|dast|loose|sugar|diabetes|bp|hypertension|purani\s*bimari|sirf\s*bukhar|koi\s*aur\s*dikkat\s*nahi|kuch\s*nahi|none|chal-phir|bistar/i.test(user_input)
  ) {
    session.knownAnswers['associated_symptoms_checked'] = true;
  }

  // Check if user answered preference question (teleconsult vs medic vs nurse vs lab)
  if (/doctor|video\s*consult|online|सलाह|teleconsult/i.test(user_input)) {
    session.knownAnswers['care_mode_preference'] = 'teleconsult';
    session.requestedService = 'doctor_consult';
  } else if (/nurse|injection|dressing|patti|नर्स/i.test(user_input)) {
    session.knownAnswers['care_mode_preference'] = 'home_nursing';
    if (session.requestedService === 'none') {
      session.requestedService = 'injection';
    }
  } else if (/lab\s*test|blood\s*test|sample|जांच|सैंपल/i.test(user_input)) {
    session.knownAnswers['care_mode_preference'] = 'lab_test';
    session.requestedService = 'lab_test';
  } else if (/medic|home\s*visit|checkup|vitals|विजिट/i.test(user_input)) {
    session.knownAnswers['care_mode_preference'] = 'medic_visit';
  }

  // Check if location was provided in text
  if (extracted.extractedLocationText) {
    session.knownAnswers['location_confirmed'] = true;
  }

  // 6. Explicit Sufficiency Evaluation
  const completeness = evaluateScreeningCompleteness(session);

  // Update missing information
  session.missingInformation = completeness.missingFields;

  // 7. Branch: Need more information vs Ready for recommendation
  if (!completeness.isSufficient) {
    // If no further question is recommended (limit reached), escalate to human care assistance
    if (!completeness.recommendedNextQuestion) {
      session.screeningStatus = 'needs_human_assistance';
      session.careType = null;
      session.urgency = null;
      session.reasoning = completeness.reason;
      session.matchedCaregivers = [];
      session.nextQuestion = null;
      session.suggestedOptions = ["📞 Call 1800-SANOCARE Support", "👨‍⚕️ Request General Teleconsult"];
      sessionStore.saveSession(session);

      return {
        sessionId: session.sessionId,
        screeningStatus: 'needs_human_assistance',
        assistantMessage: session.reasoning,
        follow_up_question: null,
        missingInformation: session.missingInformation,
        care_type: null,
        urgency: null,
        red_flags: [],
        reasoning: session.reasoning,
        matched_caregivers: [],
        suggested_options: session.suggestedOptions,
        canBook: false,
        nextAction: 'human_helpline',
        sessionState: session
      };
    }

    // Increment question count since we are asking a follow-up
    session.questionCount += 1;
    session.screeningStatus = 'asking_follow_up';
    session.nextQuestion = completeness.recommendedNextQuestion.question;
    session.suggestedOptions = completeness.recommendedNextQuestion.suggestedOptions || [];
    session.careType = null;
    session.urgency = null;
    session.reasoning = completeness.reason;
    session.matchedCaregivers = [];

    // Append assistant question to history
    session.conversationHistory.push({
      role: 'assistant',
      content: session.nextQuestion
    });

    sessionStore.saveSession(session);

    return {
      sessionId: session.sessionId,
      screeningStatus: 'asking_follow_up',
      assistantMessage: session.nextQuestion,
      follow_up_question: session.nextQuestion,
      missingInformation: session.missingInformation,
      care_type: null,
      urgency: null,
      red_flags: [],
      reasoning: completeness.reason,
      matched_caregivers: [],
      suggested_options: session.suggestedOptions,
      canBook: false,
      nextAction: 'answer_question',
      sessionState: session
    };
  }

  // 8. Triage Classification (Screening is complete!)
  const classification = classifyTriage(session, safetyResult, completeness);

  session.careType = classification.care_type;
  session.urgency = classification.urgency;
  session.reasoning = classification.reasoning;

  // If classification still couldn't resolve (e.g. limit reached on vague input)
  if (!classification.care_type) {
    session.screeningStatus = 'needs_human_assistance';
    session.nextQuestion = null;
    session.suggestedOptions = [];
    session.matchedCaregivers = [];
    sessionStore.saveSession(session);

    return {
      sessionId: session.sessionId,
      screeningStatus: 'needs_human_assistance',
      assistantMessage: session.reasoning,
      follow_up_question: null,
      missingInformation: session.missingInformation,
      care_type: null,
      urgency: null,
      red_flags: [],
      reasoning: session.reasoning,
      matched_caregivers: [],
      suggested_options: ["📞 Call 1800-SANOCARE Support", "👨‍⚕️ Request General Teleconsult"],
      canBook: false,
      nextAction: 'human_helpline',
      sessionState: session
    };
  }

  // 9. Caregiver Matching (Only for valid care_type)
  const matchResult = matchCaregivers({
    careType: session.careType,
    userLocation: session.location,
    userLanguage: detectedLang,
    userInput: user_input,
    rejectedCaregivers: session.rejectedCaregivers,
    previouslyShownCaregivers: session.previouslyShownCaregivers
  });

  session.matchedCaregivers = matchResult.matchedCaregivers;
  session.screeningStatus = 'ready_for_recommendation';
  session.nextQuestion = null;
  session.suggestedOptions = [];

  // Record top caregivers as shown in this session
  for (const cg of matchResult.matchedCaregivers) {
    if (!session.previouslyShownCaregivers.includes(cg.caregiver_id)) {
      session.previouslyShownCaregivers.push(cg.caregiver_id);
    }
  }

  sessionStore.saveSession(session);

  return {
    sessionId: session.sessionId,
    screeningStatus: 'ready_for_recommendation',
    assistantMessage: session.reasoning,
    follow_up_question: null,
    missingInformation: [],
    care_type: session.careType,
    urgency: session.urgency,
    red_flags: [],
    reasoning: session.reasoning,
    matched_caregivers: session.matchedCaregivers,
    suggested_options: [],
    canBook: session.matchedCaregivers.length > 0,
    nextAction: 'confirm_booking',
    sessionState: session
  };
}

/**
 * Adapter for the legacy/benchmark runFullTriage API contract
 */
export function runStatelessTriage(
  userInput: string,
  userLanguage: string = 'auto',
  location?: Location,
  conversationHistory: ConversationTurn[] = [],
  isSingleTurnEvaluation: boolean = false
): TriageResponse {
  const result = runSessionScreening({
    user_input: userInput,
    language: userLanguage as any,
    location,
    conversation_history: conversationHistory,
    isSingleTurnEvaluation
  });

  return {
    follow_up_question: result.follow_up_question,
    care_type: result.care_type,
    urgency: result.urgency,
    red_flags: result.red_flags,
    reasoning: result.reasoning,
    matched_caregivers: result.matched_caregivers,
    detected_language: result.sessionState?.language || 'Hinglish',
    confidence: result.care_type ? 0.95 : 0.5,
    suggested_options: result.suggested_options
  };
}
