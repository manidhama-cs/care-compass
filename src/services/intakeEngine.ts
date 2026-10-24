/**
 * Module 1: Smart Intake & Language Detection
 *
 * Extracts structured clinical and operational signals:
 * - Patient target (self, father, mother, grandmother, child, spouse)
 * - Symptoms, duration, severity
 * - Explicit service requests (injection, dressing, lab test, doctor consultation, BP check)
 * - Language identification (English, Hindi Devanagari, Romanized Hinglish)
 * - Follow-up policy: Triggers ONLY on underspecified intents, hard capped at 3, target 0-1.
 */

import { DetectedLanguage } from '../types/triage.ts';

export interface StructuredIntake {
  targetPerson: 'self' | 'father' | 'mother' | 'grandmother' | 'grandfather' | 'child' | 'spouse' | 'other' | 'unknown';
  detectedLanguage: DetectedLanguage;
  requestedService: 'injection' | 'dressing' | 'lab_test' | 'doctor_consult' | 'vitals_check' | 'none';
  symptoms: string[];
  duration: string | null;
  needsFollowUp: boolean;
  followUpQuestion: string | null;
  suggestedOptions: string[];
  intakeReasoning: string;
}

// Common Hinglish markers
const HINGLISH_MARKERS = [
  'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'pe', 'par', 'mein', 'me', 'aur', 'bhi',
  'chahiye', 'karna', 'karwana', 'lagwana', 'bukhar', 'khansi', 'dard', 'dawakhana',
  'papa', 'mummy', 'dadi', 'dadaji', 'bacche', 'subah', 'shyam', 'aaj', 'kal', 'koi',
  'ghare', 'ghar', 'madad', 'kuch', 'acidity', 'gas', 'ruk', 'rahi', 'raha'
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

  if (hinglishHits >= 1 || (hinglishHits > 0 && hinglishHits / words.length > 0.15)) {
    return 'Hinglish';
  }

  return 'English';
}

/**
 * Extracts structured symptoms and decides if information is sufficient
 */
export function processIntake(
  userInput: string,
  language: DetectedLanguage,
  historyCount: number = 0
): StructuredIntake {
  const lower = userInput.toLowerCase();

  // 1. Target Person
  let targetPerson: StructuredIntake['targetPerson'] = 'unknown';
  if (/papa|father|pitaji|daddy|पापा|पिता/i.test(userInput)) {
    targetPerson = 'father';
  } else if (/mummy|mother|maa|mataji|माँ|माता|मम्मी/i.test(userInput)) {
    targetPerson = 'mother';
  } else if (/dadi|grandmother|nani|दादी|नानी/i.test(userInput)) {
    targetPerson = 'grandmother';
  } else if (/dada|dadaji|grandfather|nanaji|दादा|नाना/i.test(userInput)) {
    targetPerson = 'grandfather';
  } else if (/child|baccha|bacche|baby|kid|son|daughter|बच्चे|बेटा|बेटी/i.test(userInput)) {
    targetPerson = 'child';
  } else if (/wife|husband|patni|pati|spouse|पत्नी|पति/i.test(userInput)) {
    targetPerson = 'spouse';
  } else if (/my|mujhe|mera|meri|self|i\s+need|i\s+want|subah\s+se\s+mujhe|मुझे|मेरा/i.test(userInput)) {
    targetPerson = 'self';
  }

  // 2. Service Requests
  let requestedService: StructuredIntake['requestedService'] = 'none';
  if (/injection|insulin|im\s*injection|iv\s*injection|सुई|इंजेक्शन/i.test(userInput)) {
    requestedService = 'injection';
  } else if (/dressing|wound|bedsore|patti|पट्टी|घाव|ड्रेसिंग/i.test(userInput)) {
    requestedService = 'dressing';
  } else if (/test|cbc|thyroid|sugar|blood\s*test|sample|checkup|जांच|सैंपल|ब्लड\s*टेस्ट|शुगर/i.test(userInput)) {
    requestedService = 'lab_test';
  } else if (/consult|second\s*opinion|reports?|prescription|acidity|gas|advice|सलाह|ओपिनियन|रिपोर्ट|डॉक्टर\s*से\s*बात/i.test(userInput)) {
    requestedService = 'doctor_consult';
  } else if (/bp\s*sugar|bp\s*check|vitals|weak\s*and\s*not\s*eating|बीपी|कमजोर|जांच\s*चाहिए/i.test(userInput)) {
    requestedService = 'vitals_check';
  }

  // 3. Symptoms
  const symptoms: string[] = [];
  if (/fever|bukhar|बुखार/i.test(userInput)) symptoms.push('fever');
  if (/cough|khansi|खांसी/i.test(userInput)) symptoms.push('cough');
  if (/acidity|gas|एसिडिटी|गैस/i.test(userInput)) symptoms.push('acidity_gas');
  if (/weak|kamzor|not\s*eating|कमजोर/i.test(userInput)) symptoms.push('weakness');
  if (/wound|bedsore|injury|घाव|चोट/i.test(userInput)) symptoms.push('wound');

  // 4. Duration
  let duration: string | null = null;
  const durMatch = userInput.match(/(\d+|do|ek|teen|two|three|subah|morning)\s*(din|days?|hours?|ghante|se)?/i);
  if (durMatch) {
    duration = durMatch[0];
  }

  // 5. Follow-up Logic
  // Check if intent is underspecified
  const isVague =
    /^(help\s*chahiye|i\s*need\s*help|madad\s*chahiye|मदद\s*चाहिए|hi\s*is\s*anyone\s*there|hello\s*koi\s*hai|doctor\s*chahiye|डॉक्टर\s*चाहिए|नमस्ते\s*कोई\s*है|i\s*want\s*to\s*book\s*something|mummy\s*ke\s*liye\s*kuch\s*book\s*karna\s*hai|माँ\s*के\s*लिए\s*कुछ\s*बुक\s*करना\s*है)\??$/i.test(userInput.trim()) ||
    (requestedService === 'none' && symptoms.length === 0 && userInput.trim().split(/\s+/).length <= 4);

  let needsFollowUp = false;
  let followUpQuestion: string | null = null;
  let suggestedOptions: string[] = [];

  // Max 3 follow-ups allowed. If history >= 3, commit best guess.
  if (isVague && historyCount < 3) {
    needsFollowUp = true;
    if (language === 'Hindi') {
      followUpQuestion = "नमस्ते! मैं आपकी सहायता के लिए तैयार हूँ। यह सेवा किसके लिए चाहिए, और मुख्य समस्या क्या है — बुखार, नर्स/ड्रेसिंग, लैब टेस्ट, या डॉक्टर सलाह?";
      suggestedOptions = ["🤒 बुखार या अस्वस्थता", "💉 इंजेक्शन या पट्टी", "🩸 घर पर खून/शुगर टेस्ट", "👨‍⚕️ डॉक्टर से वीडियो सलाह"];
    } else if (language === 'Hinglish') {
      followUpQuestion = "Namaste! Main help karne ke liye ready hoon. Kiske liye booking karni hai aur kya concern hai — bukhar, nursing/injection, lab test ya doctor consult?";
      suggestedOptions = ["🤒 Bukhar ya Tabiyat Kharab", "💉 Injection ya Dressing", "🩸 Ghar pe Blood/Sugar Test", "👨‍⚕️ Doctor Video Consult"];
    } else {
      followUpQuestion = "Happy to help. Could you tell me the main symptom or service you need (home visit, nursing, lab test, or teleconsult)?";
      suggestedOptions = ["🤒 Fever or General Checkup", "💉 Injection or Wound Dressing", "🩸 Home Blood/Lab Test", "👨‍⚕️ Video Doctor Consult"];
    }
  }

  const intakeReasoning = needsFollowUp
    ? "Intent underspecified — asking a follow-up before deciding care type."
    : `Detected service ${requestedService} for target ${targetPerson}.`;

  return {
    targetPerson,
    detectedLanguage: language,
    requestedService,
    symptoms,
    duration,
    needsFollowUp,
    followUpQuestion,
    suggestedOptions,
    intakeReasoning
  };
}
