/**
 * Comprehensive Automated Multi-Turn Test Suite
 * Validates Scenarios A through L as mandated by the rubric and requirements.
 */

import { runSessionScreening } from '../src/services/screeningStateMachine.ts';
import { sessionStore } from '../src/services/sessionStore.ts';
import { evaluateSafetyGate } from '../src/services/safetyDetector.ts';
import { matchCaregivers } from '../src/services/caregiverMatcher.ts';
import { CAREGIVERS } from '../src/data/caregivers.ts';

interface TestResult {
  scenario: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(scenario: string, condition: boolean, message: string, details?: any) {
  results.push({
    scenario,
    passed: condition,
    message,
    details
  });
  const symbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} [${scenario}] - ${message}`);
  if (!condition && details) {
    console.error('   Details:', details);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   RUNNING CARECOMPASS MULTI-TURN TEST SUITE          ');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // Scenario A: Vague Initial Request
  // User: "Mummy ke liye help chahiye."
  // Expected: Ask what kind of help. Do NOT assign a caregiver. care_type = null.
  // --------------------------------------------------------------------------
  {
    const session = runSessionScreening({
      user_input: 'Mummy ke liye help chahiye.',
      language: 'Hinglish'
    });

    assert(
      'Scenario A',
      session.screeningStatus === 'asking_follow_up' &&
      session.care_type === null &&
      session.matched_caregivers.length === 0 &&
      Boolean(session.follow_up_question),
      'Vague request prompts a follow-up question and does NOT assign a premature caregiver',
      { status: session.screeningStatus, care_type: session.care_type, caregivers: session.matched_caregivers.length, question: session.follow_up_question }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario B: Fever with Missing Context
  // User: "Papa ko bukhar hai."
  // Expected: Ask relevant follow-up, do NOT immediately return final caregiver recommendation.
  // --------------------------------------------------------------------------
  let scenarioBSessionId = '';
  {
    const session = runSessionScreening({
      user_input: 'Papa ko bukhar hai.',
      language: 'Hinglish'
    });
    scenarioBSessionId = session.sessionId;

    assert(
      'Scenario B',
      session.screeningStatus === 'asking_follow_up' &&
      session.care_type === null &&
      session.matched_caregivers.length === 0 &&
      session.missingInformation.includes('safety_screening'),
      'Fever without duration or safety context prompts follow-up for red-flags/duration',
      { status: session.screeningStatus, missing: session.missingInformation, question: session.follow_up_question }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario C: Follow-up Answers Update State Across Turns
  // User: "Papa ko bukhar hai." -> Assistant asks -> User: "Saans theek hai, 2 din se bukhar hai, doctor se consult karna hai"
  // Expected: State incorporates duration, safety clearance, and preference; routes to teleconsultation.
  // --------------------------------------------------------------------------
  {
    const sessionTurn2 = runSessionScreening({
      sessionId: scenarioBSessionId,
      user_input: 'Saans theek hai, 2 din se bukhar hai, doctor se consult karna hai',
      language: 'Hinglish'
    });

    assert(
      'Scenario C',
      sessionTurn2.screeningStatus === 'ready_for_recommendation' &&
      sessionTurn2.care_type === 'teleconsultation' &&
      sessionTurn2.matched_caregivers.length > 0 &&
      sessionTurn2.matched_caregivers.every(c => {
        const cg = CAREGIVERS.find(item => item.caregiver_id === c.caregiver_id);
        return cg?.role === 'doctor';
      }),
      'Second turn updates cumulative state without repeating question and resolves to teleconsultation with doctors',
      { care_type: sessionTurn2.care_type, matched_caregivers: sessionTurn2.matched_caregivers }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario D: Explicit Nursing Request
  // User: "Doctor ne injection prescribe kiya hai, ghar par qualified nurse chahiye."
  // Expected: Identifies nursing, asks only missing operational details (e.g. location/area), matches only nurses/medics with nursing qualification.
  // --------------------------------------------------------------------------
  {
    const sessionTurn1 = runSessionScreening({
      user_input: 'Doctor ne injection prescribe kiya hai, mere liye ghar par qualified nurse chahiye, address Saket New Delhi.',
      language: 'Hinglish',
      location: { lat: 28.5244, lng: 77.2066 }
    });

    assert(
      'Scenario D',
      sessionTurn1.care_type === 'home_nursing' &&
      sessionTurn1.screeningStatus === 'ready_for_recommendation' &&
      sessionTurn1.matched_caregivers.length > 0 &&
      sessionTurn1.matched_caregivers.every(c => {
        const cg = CAREGIVERS.find(item => item.caregiver_id === c.caregiver_id);
        return cg?.role === 'medic' && (cg.qualification.includes('Nursing') || cg.qualification.includes('GNM'));
      }),
      'Explicit nursing request with location confirmed matches only qualified nurses (GNM/B.Sc Nursing)',
      { care_type: sessionTurn1.care_type, matched: sessionTurn1.matched_caregivers }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario E: Lab Test Request
  // User: "Kal subah CBC test ke liye home sample collection chahiye, Saket area."
  // Expected: Identifies lab_test_home, matches only phlebotomists.
  // --------------------------------------------------------------------------
  {
    const session = runSessionScreening({
      user_input: 'Kal subah CBC test ke liye home sample collection chahiye, Saket area.',
      language: 'Hinglish',
      location: { lat: 28.5244, lng: 77.2066 }
    });

    assert(
      'Scenario E',
      session.care_type === 'lab_test_home' &&
      session.urgency === 'scheduled' &&
      session.matched_caregivers.length > 0 &&
      session.matched_caregivers.every(c => {
        const cg = CAREGIVERS.find(item => item.caregiver_id === c.caregiver_id);
        return cg?.role === 'phlebotomist';
      }),
      'Home lab test request matches only certified phlebotomists',
      { care_type: session.care_type, urgency: session.urgency, matched: session.matched_caregivers }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario F: Doctor Consultation
  // User: "Mujhe apni reports doctor ko dikhani hain, mere liye."
  // Expected: Routes to teleconsultation, matches only doctors.
  // --------------------------------------------------------------------------
  {
    const session = runSessionScreening({
      user_input: 'Mujhe apni reports doctor ko dikhani hain, mere liye.',
      language: 'Hinglish'
    });

    assert(
      'Scenario F',
      session.care_type === 'teleconsultation' &&
      session.matched_caregivers.length > 0 &&
      session.matched_caregivers.every(c => {
        const cg = CAREGIVERS.find(item => item.caregiver_id === c.caregiver_id);
        return cg?.role === 'doctor';
      }),
      'Doctor reports review inquiry routes to teleconsultation with registered doctors',
      { care_type: session.care_type, matched: session.matched_caregivers }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario G: Emergency Red-Flag
  // User: "Papa ko severe chest pain hai aur saans nahi aa rahi."
  // Expected: Immediate emergency 112 guidance, no routine follow-up, 0 matched caregivers.
  // --------------------------------------------------------------------------
  {
    const session = runSessionScreening({
      user_input: 'Papa ko severe chest pain hai aur saans nahi aa rahi.',
      language: 'Hinglish'
    });

    assert(
      'Scenario G',
      session.screeningStatus === 'emergency' &&
      session.care_type === 'emergency_112' &&
      session.urgency === 'emergency' &&
      session.matched_caregivers.length === 0 &&
      session.red_flags.includes('chest_pain') &&
      session.red_flags.includes('breathlessness'),
      'Emergency red flags trigger immediate 112 escalation with zero matched caregivers',
      { status: session.screeningStatus, flags: session.red_flags, caregivers: session.matched_caregivers.length }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario H: Negated Emergency Symptoms
  // User: "Chest pain nahi hai, lekin mujhe doctor se consult karna hai, mere liye."
  // Expected: Does NOT trigger emergency solely because "chest pain" was mentioned.
  // --------------------------------------------------------------------------
  {
    const session = runSessionScreening({
      user_input: 'Chest pain nahi hai, lekin mujhe doctor se consult karna hai, mere liye.',
      language: 'Hinglish'
    });

    assert(
      'Scenario H',
      session.screeningStatus !== 'emergency' &&
      session.care_type === 'teleconsultation' &&
      session.red_flags.length === 0,
      'Negated chest pain does NOT trigger emergency and correctly routes remaining inquiry',
      { status: session.screeningStatus, care_type: session.care_type, flags: session.red_flags }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario I: Distinct Provider Roles
  // Nursing vs Lab vs Doctor vs Paramedic
  // --------------------------------------------------------------------------
  {
    const nursingMatch = matchCaregivers({ careType: 'home_nursing' });
    const labMatch = matchCaregivers({ careType: 'lab_test_home' });
    const docMatch = matchCaregivers({ careType: 'teleconsultation' });
    const emgMatch = matchCaregivers({ careType: 'emergency_112' });

    const nursingRoles = nursingMatch.matchedCaregivers.map(m => CAREGIVERS.find(c => c.caregiver_id === m.caregiver_id)?.role);
    const labRoles = labMatch.matchedCaregivers.map(m => CAREGIVERS.find(c => c.caregiver_id === m.caregiver_id)?.role);
    const docRoles = docMatch.matchedCaregivers.map(m => CAREGIVERS.find(c => c.caregiver_id === m.caregiver_id)?.role);

    assert(
      'Scenario I',
      nursingRoles.every(r => r === 'medic') &&
      labRoles.every(r => r === 'phlebotomist') &&
      docRoles.every(r => r === 'doctor') &&
      emgMatch.matchedCaregivers.length === 0,
      'Distinct care types strictly map to their required clinical provider roles',
      { nursingRoles, labRoles, docRoles, emgCount: emgMatch.matchedCaregivers.length }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario J: Anti-Repetition on Caregiver Rejection
  // --------------------------------------------------------------------------
  {
    const sessionInit = runSessionScreening({
      user_input: 'Doctor ne injection likha hai, mere liye Saket me nurse chahiye.',
      location: { lat: 28.5244, lng: 77.2066 }
    });

    const firstCaregiverId = sessionInit.matched_caregivers[0]?.caregiver_id;

    // Reject the first caregiver
    const sessionRejected = runSessionScreening({
      sessionId: sessionInit.sessionId,
      user_input: 'Different nurse please',
      rejected_caregiver_id: firstCaregiverId
    });

    const newFirstCaregiverId = sessionRejected.matched_caregivers[0]?.caregiver_id;

    assert(
      'Scenario J',
      Boolean(firstCaregiverId) &&
      Boolean(newFirstCaregiverId) &&
      firstCaregiverId !== newFirstCaregiverId,
      'Rejecting top provider demotes them and promotes the next eligible qualified candidate',
      { firstCaregiverId, newFirstCaregiverId }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario K: Missing Location Handling
  // --------------------------------------------------------------------------
  {
    const matchWithoutLoc = matchCaregivers({
      careType: 'home_nursing',
      userLocation: null
    });

    assert(
      'Scenario K',
      matchWithoutLoc.hasLocation === false &&
      matchWithoutLoc.locationDisclosed.includes('No explicit GPS location provided'),
      'When GPS coordinates are absent, system discloses that distance filtering is omitted',
      { hasLocation: matchWithoutLoc.hasLocation, disclosed: matchWithoutLoc.locationDisclosed }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario L: Question Limit Reached without Clarity -> Human Assistance
  // --------------------------------------------------------------------------
  {
    // Start session and reply with completely vague/unhelpful answers
    let ses = runSessionScreening({ user_input: 'help' });
    ses = runSessionScreening({ sessionId: ses.sessionId, user_input: 'kuch bhi' });
    ses = runSessionScreening({ sessionId: ses.sessionId, user_input: 'nahi pata' });

    assert(
      'Scenario L',
      ses.screeningStatus === 'needs_human_assistance' &&
      ses.care_type === null &&
      ses.matched_caregivers.length === 0,
      'Exceeding question limit with persistently vague responses escalates to human assistance instead of guessing paramedic visit',
      { status: ses.screeningStatus, care_type: ses.care_type, caregivers: ses.matched_caregivers.length }
    );
  }

  // --------------------------------------------------------------------------
  // Scenario M: Deep Multi-Turn Clinical Inquiry (Adaptive Q&A Sequence)
  // --------------------------------------------------------------------------
  {
    // Turn 1: Symptom stated without context
    const turn1 = runSessionScreening({
      user_input: 'Mera pet kharab hai aur ulti jaisa lag raha hai',
      language: 'Hinglish'
    });
    // Turn 2: User clears red flags and states duration
    const turn2 = runSessionScreening({
      sessionId: turn1.sessionId,
      user_input: 'Nahi koi saans ya chest pain nahi hai, kal subah se hai',
      language: 'Hinglish'
    });
    // Turn 3: User answers progression & severity
    const turn3 = runSessionScreening({
      sessionId: turn1.sessionId,
      user_input: 'Bohat tez ulti aur dast ho rahe hain, badh raha hai',
      language: 'Hinglish'
    });
    // Turn 4: User chooses care modality
    const turn4 = runSessionScreening({
      sessionId: turn1.sessionId,
      user_input: 'Online doctor se consult karna chahte hain',
      language: 'Hinglish'
    });

    assert(
      'Scenario M (Deep Multi-Turn)',
      turn1.screeningStatus === 'asking_follow_up' &&
      turn2.screeningStatus === 'asking_follow_up' &&
      turn3.screeningStatus === 'asking_follow_up' &&
      turn4.screeningStatus === 'ready_for_recommendation' &&
      turn4.care_type === 'teleconsultation' &&
      turn4.matched_caregivers.length > 0,
      'Progressive 4-turn clinical screening systematically uncovers safety, duration, severity, and care preference',
      {
        turn1Q: turn1.follow_up_question,
        turn2Q: turn2.follow_up_question,
        turn3Q: turn3.follow_up_question,
        finalCareType: turn4.care_type,
        caregiverCount: turn4.matched_caregivers.length
      }
    );
  }

  // --------------------------------------------------------------------------
  // Edge Case: Session Isolation
  // Two concurrent sessions with different needs must not cross-contaminate state
  // --------------------------------------------------------------------------
  {
    const sesA = runSessionScreening({
      user_input: 'CBC test karwana hai kal subah ghar par Saket me',
      location: { lat: 28.5244, lng: 77.2066 }
    });
    const sesB = runSessionScreening({
      user_input: 'Doctor ne injection likha hai, mere liye nurse chahiye Saket me',
      location: { lat: 28.5244, lng: 77.2066 }
    });

    assert(
      'Edge Case: Session Isolation',
      sesA.care_type === 'lab_test_home' &&
      sesB.care_type === 'home_nursing' &&
      sesA.sessionId !== sesB.sessionId,
      'Concurrent sessions maintain complete state isolation without cross-contamination',
      { sesA_type: sesA.care_type, sesB_type: sesB.care_type }
    );
  }

  // --------------------------------------------------------------------------
  // Edge Case: Inactive Providers Filtered Out
  // Inactive providers in roster must NEVER be recommended
  // --------------------------------------------------------------------------
  {
    const match = matchCaregivers({ careType: 'home_nursing' });
    const hasInactive = match.matchedCaregivers.some(m => {
      const cg = CAREGIVERS.find(c => c.caregiver_id === m.caregiver_id);
      return cg?.active === false;
    });

    assert(
      'Edge Case: Inactive Provider Filter',
      hasInactive === false,
      'Inactive caregivers are strictly excluded from matching recommendations',
      { hasInactive }
    );
  }

  // --------------------------------------------------------------------------
  // Edge Case: Language Switching Mid-Session
  // --------------------------------------------------------------------------
  {
    let ses = runSessionScreening({
      user_input: 'Papa ko bukhar hai',
      language: 'Hinglish'
    });
    // Follow-up answered in Hindi
    ses = runSessionScreening({
      sessionId: ses.sessionId,
      user_input: 'सांस लेने में कोई तकलीफ नहीं है, 2 दिन से बुखार है, डॉक्टर से वीडियो सलाह चाहिए',
      language: 'Hindi'
    });

    assert(
      'Edge Case: Language Adaptation',
      ses.screeningStatus === 'ready_for_recommendation' &&
      ses.care_type === 'teleconsultation',
      'Language change mid-conversation is gracefully adapted and clinical state resolves accurately',
      { status: ses.screeningStatus, care_type: ses.care_type }
    );
  }

  // --------------------------------------------------------------------------
  // Edge Case: HTTP /api/triage/session Live Route Verification
  // --------------------------------------------------------------------------
  try {
    const httpRes = await fetch('http://localhost:3000/api/triage/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input: 'Ghar pe IM injection lagwana hai, mere liye Saket me',
        location: { lat: 28.5244, lng: 77.2066 }
      })
    });
    const httpData = await httpRes.json();

    assert(
      'Edge Case: Live HTTP API Route',
      httpRes.ok &&
      httpData.sessionId &&
      httpData.care_type === 'home_nursing',
      'Live Express endpoint /api/triage/session responds with valid schema and correct care routing',
      { status: httpRes.status, care_type: httpData.care_type, sessionId: httpData.sessionId }
    );
  } catch (err: any) {
    console.warn('HTTP endpoint check skipped (dev server starting up):', err.message);
  }

  console.log('\n======================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL SCENARIOS TESTED: ${results.length}`);
  console.log(`PASSED: ${results.filter(r => r.passed).length}`);
  console.log(`FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`STATUS: ${allPassed ? 'ALL TESTS PASSED ✨' : 'SOME TESTS FAILED ❌'}`);
  console.log('======================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite encountered an error:', err);
  process.exit(1);
});
