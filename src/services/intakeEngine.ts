/**
 * Module 1: Smart Intake, Entity Extraction & Adaptive Screening Engine
 *
 * Implements a clinical screening state machine:
 * 1. Multi-signal Extraction across full conversation (person, service, symptoms, duration, severity, red flags, location)
 * 2. Negation & Contradiction Handling ("chest pain nahi hai" does not trigger red flag, but records known lack of chest pain)
 * 3. Simultaneous extraction of multiple answers from single messages
 * 4. Explicit Sufficiency Evaluation (evaluateScreeningCompleteness)
 * 5. Adaptive Next-Question selection tailored to the specific concern type
 */

import {
  DetectedLanguage,
  ScreeningSessionState,
  CompletenessEvaluation,
  ConversationTurn
} from '../types/triage.ts';

// Common Hinglish markers for language detection
const HINGLISH_MARKERS = [
  'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'pe', 'par', 'mein', 'me', 'aur', 'bhi',
  'chahiye', 'karna', 'karwana', 'lagwana', 'bukhar', 'khansi', 'dard', 'dawakhana',
  'papa', 'mummy', 'dadi', 'dadaji', 'bacche', 'subah', 'shyam', 'aaj', 'kal', 'koi',
  'ghare', 'ghar', 'madad', 'kuch', 'acidity', 'gas', 'ruk', 'rahi', 'raha', 'unhe',
  'mujhe', 'hum', 'hume', 'dikkat', 'takleef', 'sahiba', 'ji', 'kripya'
];

export function detectLanguage(text: string, requestedLang?: string): DetectedLanguage {
  if (requestedLang && (requestedLang === 'English' || requestedLang === 'Hindi' || requestedLang === 'Hinglish')) {
    return requestedLang as DetectedLanguage;
  }

  // Devanagari Unicode Range: \u0900-\u097F
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 2) {
    return 'Hindi';
  }

  const words = text.toLowerCase().split(/\s+/);
  let hinglishHits = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (HINGLISH_MARKERS.includes(cleanWord)) {
      hinglishHits++;
    }
  }

  if (hinglishHits >= 1 || (words.length > 0 && hinglishHits / words.length > 0.15)) {
    return 'Hinglish';
  }

  return 'English';
}

/**
 * Extracts structured entities from user inputs across the conversation.
 */
export function extractEntitiesFromConversation(
  history: ConversationTurn[],
  latestInput: string
): {
  targetPerson: ScreeningSessionState['targetPerson'];
  requestedService: ScreeningSessionState['requestedService'];
  symptoms: string[];
  duration: string | null;
  severity: ScreeningSessionState['severity'];
  progression: ScreeningSessionState['progression'];
  relevantContext: string[];
  deniedSymptoms: string[];
  extractedLocationText: string | null;
} {
  // Combine all user inputs without duplicating the latest input if already in history
  const userTexts = history.filter(h => h.role === 'user').map(h => h.content);
  if (!userTexts.includes(latestInput)) {
    userTexts.push(latestInput);
  }
  const combined = userTexts.join(' ').toLowerCase();

  // 1. Target Person Extraction
  let targetPerson: ScreeningSessionState['targetPerson'] = 'unknown';
  if (/\b(papa|father|pitaji|daddy|father's|पापा|पिताजी|पिता)\b/i.test(combined)) {
    targetPerson = 'father';
  } else if (/\b(mummy|mother|maa|mataji|mother's|माँ|माता|मम्मी|माताजी)\b/i.test(combined)) {
    targetPerson = 'mother';
  } else if (/\b(dadi|nani|grandmother|दादी|नानी)\b/i.test(combined)) {
    targetPerson = 'grandmother';
  } else if (/\b(dada|dadaji|grandfather|nanaji|दादा|नाना)\b/i.test(combined)) {
    targetPerson = 'grandfather';
  } else if (/\b(child|baccha|bacche|baby|kid|son|daughter|infant|बच्चे|बेटा|बेटी|शिशु)\b/i.test(combined)) {
    targetPerson = 'child';
  } else if (/\b(wife|husband|patni|pati|spouse|पत्नी|पति)\b/i.test(combined)) {
    targetPerson = 'spouse';
  } else if (/\b(my|myself|mujhe|mera|meri|mere|mere\s*liye|for\s*me|self|i\s+need|i\s+want|subah\s+se\s+mujhe|मुझे|मेरा|मेरी|मेरे\s*लिए|खुद)\b/i.test(combined)) {
    targetPerson = 'self';
  } else if (/\b(unhe|unko|patient|unka|unke)\b/i.test(combined)) {
    targetPerson = 'other';
  }

  // 2. Denied Symptoms (Negation Handling)
  const deniedSymptoms: string[] = [];
  if (/no\s+chest\s*pain|chest\s*pain\s*(nahi|nhi|bilkul\s*nahi)|seene\s*(mein|me)?\s*(koi\s*)?dard\s*(nahi|nhi)|सीने\s*में\s*दर्द\s*नहीं/i.test(combined)) {
    deniedSymptoms.push('chest_pain');
  }
  if (/no\s+(breathlessness|breathing\s*trouble)|saans\s*(mein|me)?\s*(koi\s*)?(dikkat|takleef|problem)\s*(nahi|nhi)|सांस\s*में\s*दिक्कत\s*नहीं/i.test(combined)) {
    deniedSymptoms.push('breathlessness');
  }
  if (/no\s+bleeding|khoon\s*(nahi|nhi)\s*beh\s*raha/i.test(combined)) {
    deniedSymptoms.push('severe_bleeding');
  }
  if (/no\s+fever|bukhar\s*(nahi|nhi)\s*hai|बुखार\s*नहीं\s*है/i.test(combined)) {
    deniedSymptoms.push('fever');
  }

  // 3. Requested Service Extraction (Explicit requests)
  let requestedService: ScreeningSessionState['requestedService'] = 'none';
  if (/injection|insulin|im\s*injection|iv\s*injection|suiee?|सुई|इंजेक्शन/i.test(combined)) {
    requestedService = 'injection';
  } else if (/dressing|wound|bedsore|patti|पट्टी|घाव|ड्रेसिंग/i.test(combined)) {
    requestedService = 'dressing';
  } else if (/cbc|thyroid|sugar\s*test|blood\s*test|sample|lipid|hba1c|जांच|सैंपल|ब्लड\s*टेस्ट|शुगर\s*टेस्ट/i.test(combined)) {
    requestedService = 'lab_test';
  } else if (/consult|second\s*opinion|reports?|prescription|doctor\s*se\s*baat|talk\s*to\s*(a\s*)?doctor|सलाह|ओपिनियन|रिपोर्ट|डॉक्टर\s*से\s*सलाह/i.test(combined)) {
    requestedService = 'doctor_consult';
  } else if (/bp\s*sugar|bp\s*check|vitals|pulse|oxygen\s*check|बीपी|जांच\s*चाहिए|वाइटल्स/i.test(combined)) {
    requestedService = 'vitals_check';
  }

  // 4. Symptoms Extraction (excluding denied ones)
  const symptoms: string[] = [];
  if (!deniedSymptoms.includes('fever') && /\b(fever|bukhar|temperature|tapman|बुखार)\b/i.test(combined)) {
    symptoms.push('fever');
  }
  if (/\b(cough|khansi|cold|jukham|जुकाम|खांसी)\b/i.test(combined)) {
    symptoms.push('cough');
  }
  if (/\b(acidity|gas|heartburn|indigestion|pet\s*dard|stomach\s*pain|एसिडिटी|गैस|पेट\s*दर्द)\b/i.test(combined)) {
    symptoms.push('acidity_gas');
  }
  if (/\b(weak(ness)?|kamzor|kamzori|fatigue|exhausted|not\s*eating|chakkhar|कमजोर|कमजोरी)\b/i.test(combined)) {
    symptoms.push('weakness');
  }
  if (/\b(vomiting|ulti|nausea|उल्टी|मतली)\b/i.test(combined)) {
    symptoms.push('vomiting');
  }
  if (/\b(headache|sar\s*dard|सिर\s*दर्द)\b/i.test(combined)) {
    symptoms.push('headache');
  }
  if (/\b(wound|bedsore|injury|cut|chot|घाव|चोट)\b/i.test(combined)) {
    symptoms.push('wound');
  }
  if (/\b(joint\s*pain|knee\s*pain|ghutne\s*me\s*dard|back\s*pain|कमर\s*दर्द|घुटने\s*में\s*दर्द)\b/i.test(combined)) {
    symptoms.push('body_pain');
  }

  // 5. Duration Extraction
  let duration: string | null = null;
  const durMatch = combined.match(/(\d+|ek|do|teen|char|paanch|one|two|three|four|five|several|few)\s*(din|days?|hours?|ghante|weeks?|hafte|mahine|months?)/i);
  if (durMatch) {
    duration = durMatch[0];
  } else if (/aaj\s*subah|today\s*morning|yesterday|kal\s*se|since\s*morning|subah\s*se/i.test(combined)) {
    duration = 'since morning / 1 day';
  }

  // 6. Severity Extraction
  let severity: ScreeningSessionState['severity'] = 'unknown';
  if (/mild|halka|halki|thoda|thodi|slight|हल्का|हल्की/i.test(combined)) {
    severity = 'mild';
  } else if (/moderate|theek\s*thaak|medium|काफी/i.test(combined)) {
    severity = 'moderate';
  } else if (/severe|bahut\s*tez|bohot\s*jyada|very\s*high|unbearable|असहनीय|बहुत\s*तेज़/i.test(combined)) {
    severity = 'severe';
  }

  // 7. Progression Extraction
  let progression: ScreeningSessionState['progression'] = 'unknown';
  if (/better|sudhar|kam\s*ho\s*raha|improving/i.test(combined)) {
    progression = 'better';
  } else if (/worse|badh\s*raha|getting\s*worse|deteriorating/i.test(combined)) {
    progression = 'worse';
  } else if (/same|waisa\s*hi|no\s*change|constant/i.test(combined)) {
    progression = 'same';
  }

  // 8. Relevant Context Extraction
  const relevantContext: string[] = [];
  if (/elderly|bujurg|old\s*age|senior|बुजुर्ग/i.test(combined)) relevantContext.push('elderly');
  if (/post[\s-]*op|surgery|operation|ऑपरेशन/i.test(combined)) relevantContext.push('post_operative');
  if (/diabetes|diabetic|sugar\s*patient|शुगर/i.test(combined)) relevantContext.push('diabetic');
  if (/hypertension|high\s*bp|बीपी/i.test(combined)) relevantContext.push('hypertensive');
  if (/reports?\s*(available|hain|dikhani)|test\s*reports/i.test(combined)) relevantContext.push('reports_available');
  if (/bedridden|bistar\s*par|chal\s*nahi\s*pa\s*rahe/i.test(combined)) relevantContext.push('bedridden');

  // 9. Location text mention
  let extractedLocationText: string | null = null;
  const locMatch = combined.match(/\b(saket|noida|gurgaon|gurugram|dwarka|rohini|greater\s*noida|vasant\s*kunj|green\s*park|delhi|faridabad|ghaziabad|lajpat\s*nagar|karol\s*bagh)\b/i);
  if (locMatch) {
    extractedLocationText = locMatch[0];
  }

  return {
    targetPerson,
    requestedService,
    symptoms,
    duration,
    severity,
    progression,
    relevantContext,
    deniedSymptoms,
    extractedLocationText
  };
}

/**
 * Evaluates whether enough information has been gathered to make a safe, clinical care routing decision.
 * Returns structured completeness evaluation with adaptive next question if incomplete.
 */
export function evaluateScreeningCompleteness(
  sessionState: ScreeningSessionState
): CompletenessEvaluation {
  const {
    targetPerson,
    requestedService,
    symptoms,
    duration,
    severity,
    questionCount,
    maxQuestions,
    language,
    location,
    isLocationExplicit,
    knownAnswers
  } = sessionState;

  const missingFields: string[] = [];

  // Question Limit Check: If reached max questions (default 3), or if 2 questions were already asked and still completely vague:
  const isPersistentlyVague = questionCount >= 2 && requestedService === 'none' && symptoms.length === 0;

  if (questionCount >= maxQuestions || isPersistentlyVague) {
    // If we have at least a concern or service, we can finalize conservatively
    if (requestedService !== 'none' || symptoms.length > 0) {
      return {
        isSufficient: true,
        missingFields: [],
        recommendedNextQuestion: null,
        reason: `Maximum question limit (${maxQuestions}) reached with sufficient signals collected.`
      };
    }

    // Still completely vague after questions -> human assistance needed
    return {
      isSufficient: false,
      missingFields: ['main_concern', 'service_type'],
      recommendedNextQuestion: null,
      reason: `Information remains insufficient after multiple follow-up attempts. Escalating to human care coordinator.`
    };
  }

  // -------------------------------------------------------------
  // BRANCH A: EXPLICIT SERVICE REQUESTS (Lab tests, Injections, Dressing)
  // -------------------------------------------------------------

  // 1. Routine Lab Test (e.g. "Kal subah CBC test ke liye home sample collection chahiye")
  if (requestedService === 'lab_test') {
    // For lab test, need: what test (which is in requestedService or knownAnswers), and service location if home visit
    if (!isLocationExplicit && !knownAnswers['location_confirmed']) {
      missingFields.push('location');
      return {
        isSufficient: false,
        missingFields,
        recommendedNextQuestion: {
          field: 'location',
          question: language === 'Hindi'
            ? "लैब सैंपल कलेक्शन के लिए आपका पता या क्षेत्र क्या है (जैसे साकेत, द्वारका, नोएडा)?"
            : language === 'Hinglish'
            ? "Sample collection ke liye aapka address ya locality kya hai (jaise Saket, Dwarka, Noida)?"
            : "Please share your delivery area or locality for the home lab sample collection (e.g., Saket, Dwarka, Noida):",
          suggestedOptions: ["📍 Saket / South Delhi", "📍 Dwarka / West Delhi", "📍 Noida / Greater Noida", "📍 Gurugram / DLF"]
        },
        reason: "Explicit lab test requested — need service location to dispatch a qualified phlebotomist."
      };
    }

    // Has test and location -> SUFFICIENT! Do NOT ask clinical diagnostic questions.
    return {
      isSufficient: true,
      missingFields: [],
      recommendedNextQuestion: null,
      reason: "Explicit lab test request with location confirmed."
    };
  }

  // 2. Routine Nursing / Injection / Dressing
  if (requestedService === 'injection' || requestedService === 'dressing') {
    // Check if target person is known
    if (targetPerson === 'unknown' && !knownAnswers['target_person_known']) {
      missingFields.push('target_person');
      return {
        isSufficient: false,
        missingFields,
        recommendedNextQuestion: {
          field: 'target_person',
          question: language === 'Hindi'
            ? "यह नर्सिंग सेवा किसके लिए चाहिए (जैसे आपके लिए, माताजी, या पिताजी के लिए)?"
            : language === 'Hinglish'
            ? "Yeh nursing/injection service kiske liye chahiye (aapke liye, mataji, ya pitaji)?"
            : "Who requires this nursing/injection service (for yourself, your mother, or father)?",
          suggestedOptions: ["Mere liye (Self)", "Papa ke liye (Father)", "Mummy ke liye (Mother)", "Buzurg ke liye (Elderly)"]
        },
        reason: "Nursing procedure identified — clarifying recipient to match qualified nurse."
      };
    }

    // If location is not provided
    if (!isLocationExplicit && !knownAnswers['location_confirmed']) {
      missingFields.push('location');
      return {
        isSufficient: false,
        missingFields,
        recommendedNextQuestion: {
          field: 'location',
          question: language === 'Hindi'
            ? "नर्सिंग विज़िट के लिए आपका पता या इलाका क्या है?"
            : language === 'Hinglish'
            ? "Nursing home visit ke liye aapka address ya locality kya hai?"
            : "What is your address or locality for the nursing home visit?",
          suggestedOptions: ["📍 South Delhi", "📍 West Delhi / Dwarka", "📍 Noida", "📍 Gurugram"]
        },
        reason: "Explicit nursing request — need service area for caregiver dispatch."
      };
    }

    return {
      isSufficient: true,
      missingFields: [],
      recommendedNextQuestion: null,
      reason: "Explicit nursing procedure requested with recipient and area confirmed."
    };
  }

  // 3. Explicit Doctor Consultation / Reports Review
  if (requestedService === 'doctor_consult') {
    // If reports review or general second opinion
    if (targetPerson === 'unknown' && !knownAnswers['target_person_known']) {
      missingFields.push('target_person');
      return {
        isSufficient: false,
        missingFields,
        recommendedNextQuestion: {
          field: 'target_person',
          question: language === 'Hindi'
            ? "डॉक्टर से परामर्श किसके लिए चाहिए — आपके अपने लिए या परिवार के किसी सदस्य के लिए?"
            : language === 'Hinglish'
            ? "Doctor consultation kiske liye chahiye — aapke liye ya family member ke liye?"
            : "Who is the doctor consultation for — yourself or a family member?",
          suggestedOptions: ["Mere liye (Myself)", "Papa / Mummy ke liye", "Bacche ke liye (Child)", "Buzurg ke liye (Elderly)"]
        },
        reason: "Doctor consultation requested — establishing patient demographic profile."
      };
    }

    return {
      isSufficient: true,
      missingFields: [],
      recommendedNextQuestion: null,
      reason: "Explicit teleconsultation request with patient profile identified."
    };
  }

  // -------------------------------------------------------------
  // BRANCH B: VAGUE / UNDERSPECIFIED CONCERNS (e.g. "Help chahiye", "Mummy ke liye help")
  // -------------------------------------------------------------
  if (requestedService === 'none' && symptoms.length === 0) {
    missingFields.push('main_concern');
    if (targetPerson === 'unknown') {
      missingFields.push('target_person');
    }

    return {
      isSufficient: false,
      missingFields,
      recommendedNextQuestion: {
        field: 'main_concern',
        question: language === 'Hindi'
          ? "नमस्ते! क्या आप बता सकते हैं कि क्या समस्या है और आपको किस तरह की सहायता चाहिए — डॉक्टर सलाह, घर पर नर्स, या ब्लड टेस्ट?"
          : language === 'Hinglish'
          ? "Namaste! Kya aap bata sakte hain kya takleef hai ya kis tarah ki care chahiye — doctor consult, ghar par nurse, ya blood test?"
          : "Hello! Could you share the health concern or the kind of service needed — doctor consult, home nursing, or a lab test?",
        suggestedOptions: ["👨‍⚕️ Doctor Video Consult", "💉 Home Nurse / Injection", "🩸 Blood / Lab Test", "🩺 In-Person Vitals Check"]
      },
      reason: "Initial concern is underspecified — asking what help is needed before assigning a provider."
    };
  }

  // -------------------------------------------------------------
  // BRANCH C: SYMPTOM-BASED CONCERN (e.g. "Papa ko bukhar hai")
  // -------------------------------------------------------------

  // If in single-turn evaluation mode and user provided both symptom and duration:
  if (sessionState.isSingleTurnEvaluation && duration && symptoms.length > 0) {
    return {
      isSufficient: true,
      missingFields: [],
      recommendedNextQuestion: null,
      reason: "Single-turn benchmark sample with symptom and duration identified."
    };
  }

  // Check 1: Red-flag and Safety Unknowns (Always verify absence of red flags first!)
  const hasSafetyChecked = Boolean(knownAnswers['red_flags_cleared']);
  if (!hasSafetyChecked) {
    missingFields.push('safety_screening');
    return {
      isSufficient: false,
      missingFields,
      recommendedNextQuestion: {
        field: 'safety_screening',
        question: language === 'Hindi'
          ? "क्या उन्हें सांस लेने में कोई तकलीफ, सीने में दर्द, या अत्यधिक कमजोरी/बेहोशी है? और बुखार कब से है?"
          : language === 'Hinglish'
          ? "Kya unhe saans lene me takleef, chest pain, ya behoshi jaisa lag raha hai? Aur bukhar kitne din se hai?"
          : "Are they experiencing any shortness of breath, chest pain, or fainting? And how many days has the fever been present?",
        suggestedOptions: ["Nahi, aisi koi dikkat nahi (Safe)", "Thodi saans phool rahi hai", "1-2 din se bukhar hai", "3 din se jyada ho gaye"]
      },
      reason: "Symptom reported without safety context — screening for red-flags and duration first."
    };
  }

  // Check 2: Duration / Severity if still missing
  if (!duration && !knownAnswers['duration_known']) {
    missingFields.push('duration');
    return {
      isSufficient: false,
      missingFields,
      recommendedNextQuestion: {
        field: 'duration',
        question: language === 'Hindi'
          ? "यह समस्या कितने समय से है — आज शुरू हुई है या 2-3 दिनों से है?"
          : language === 'Hinglish'
          ? "Yeh symptoms kab se hain — aaj se ya 2-3 dino se?"
          : "How long have these symptoms been present — started today, or for 2-3 days?",
        suggestedOptions: ["Aaj subah se (Today)", "2-3 din se (2-3 days)", "1 hafte se (1 week)", "Kayi dino se (Chronic)"]
      },
      reason: "Assessing symptom duration to distinguish acute vs chronic management."
    };
  }

  // Check 3: Care Preference (Virtual Doctor vs In-Person Paramedic)
  if (!knownAnswers['care_mode_preference']) {
    missingFields.push('care_mode_preference');
    return {
      isSufficient: false,
      missingFields,
      recommendedNextQuestion: {
        field: 'care_mode_preference',
        question: language === 'Hindi'
          ? "क्या आप पहले ऑनलाइन डॉक्टर से वीडियो परामर्श लेना चाहेंगे, या घर पर स्वास्थ्य कर्मी (Medic) को बुलाना चाहते हैं?"
          : language === 'Hinglish'
          ? "Aap pehle online doctor se video consult lena chahenge, ya ghar pe Medic checkup visit chahte hain?"
          : "Would you prefer a video doctor teleconsultation first, or an in-person medic home visit?",
        suggestedOptions: ["👨‍⚕️ Online Doctor Video Consult", "🩺 Medic Home Visit (BP/Vitals)", "🩸 Lab Blood Test at Home"]
      },
      reason: "Clarifying user preference between virtual teleconsult and in-person home visit."
    };
  }

  // All critical clinical and operational variables collected
  return {
    isSufficient: true,
    missingFields: [],
    recommendedNextQuestion: null,
    reason: "Clinical symptoms, duration, safety clearance, and preferred care mode sufficiently collected."
  };
}
