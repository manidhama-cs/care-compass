/**
 * Module 0: Safety Gate (High-Recall Emergency & Red-Flag Detector)
 *
 * Runs FIRST on every turn across full conversation history.
 * Covers English, Devanagari Hindi, and Romanized Hinglish with robust negation handling
 * and phonological/orthographic spelling variations.
 *
 * Controlled Red-Flag Vocabulary:
 * - chest_pain
 * - breathlessness
 * - unconsciousness
 * - severe_bleeding
 * - stroke_symptoms
 * - seizure
 * - high_fever_infant
 * - suicidal_ideation
 * - severe_dehydration
 *
 * HARD INVARIANT: Any detected red flag => care_type=emergency_112, urgency=emergency, matched_caregivers=[]
 */

import { RedFlag } from '../types/triage.ts';

export interface SafetyCheckResult {
  isEmergency: boolean;
  redFlags: RedFlag[];
  matchedTerms: string[];
  explanation: string;
}

// True negation phrases (e.g., "no chest pain", "seene me dard nahi hai", "saans me koi dikkat nahi")
// We exclude phrases like "saans nahi aa rahi" or "khoon ruk nahi raha" which are POSITIVE emergencies!
const NEGATION_PATTERNS = [
  /\bno\s+(chest\s*pain|breathing\s*trouble|shortness\s*of\s*breath|bleeding|seizure|headache)\b/i,
  /\bwithout\s+(any\s+)?(chest\s*pain|breathlessness|bleeding)\b/i,
  /\b(not\s+having|denies|ruled\s*out)\s+(chest\s*pain|breathlessness|seizures?)\b/i,
  /(seene|chaati|chhati)\s+(mein|me)?\s*(koi\s*)?dard\s+nahi\b/i,
  /dard\s+(nahi|nhi)\s+hai\b/i,
  /saans\s+(ki|mein|me)?\s*(koi\s*)?(dikkat|takleef|problem)\s+(nahi|nhi)\b/i,
  /khoon\s+(nahi|nhi)\s+(beh|nikal)\s+raha\b/i,
  /behosh\s+(nahi|nhi)\b/i,
  /chhati\s*me\s*dard\s*nahi/i
];

interface RedFlagRule {
  type: RedFlag;
  patterns: RegExp[];
  positiveExemptions?: RegExp[]; // Patterns containing 'nahi' that are POSITIVE emergency symptoms
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    type: 'chest_pain',
    patterns: [
      /\bchest\s*(pain|tightness|pressure|heaviness|discomfort|ache|burning)\b/i,
      /\bheart\s*(attack|pain|stroke|failure)\b/i,
      /\bangina\b/i,
      /(seene|chaati|chhati|chati)\s*(mein|me)?\s*(tez\s*|severe\s*|bohot\s*|bahut\s*)?(dard|pain|jalan|dawaab|bhari\s*pan)/i,
      /(dil|hriday)\s*(mein|me)?\s*(tez\s*)?(dard|daura|attack)/i,
      /सीने\s*(में)?\s*(तेज़|असहनीय|तेज)?\s*दर्द/i,
      /छाती\s*(में)?\s*(तेज़|दर्द)/i,
      /दिल\s*(का\s*दौरा|में\s*दर्द)/i,
      /severe\s+chest\s+pain/i
    ]
  },
  {
    type: 'breathlessness',
    patterns: [
      /\b(breathless(ness)?|shortness\s+of\s+breath|difficulty\s+breathing|can('?t|not)\s+breathe|gasping|suffocati(ng|on)|choking|stridor)\b/i,
      /saans\s*(nahi|nhi)\s*(aa|le)\s*(rahi|rahe|paa|raha)/i,
      /saans\s*(fool|phool|rukh|ruk)\s*rahi/i,
      /saans\s*(lene\s*mein|me)\s*(badi\s*|bahut\s*|tez\s*)?(takleef|dikkat|mushkil)/i,
      /dam\s*ghut\s*raha/i,
      /सांस\s*(नहीं\s*आ\s*रही|लेने\s*में\s*दिक्कत|फूल\s*रही|घुट\s*रहा)/i,
      /दम\s*घुट\s*रहा/i
    ],
    positiveExemptions: [
      /saans\s*(nahi|nhi)\s*(aa|le)/i,
      /सांस\s*नहीं\s*आ\s*रही/i
    ]
  },
  {
    type: 'unconsciousness',
    patterns: [
      /\b(unconscious(ness)?|fainted|syncope|collapsed|unresponsive|passed\s*out|comatose|insensible)\b/i,
      /\bnot\s+responding\b/i,
      /\blost\s+consciousness\b/i,
      /(behosh|behoshi|achanak\s*gir\s*gaye|chakkhar\s*aake\s*gir|hosh\s*kho|sudden\s*collapse)/i,
      /(response|jawab)\s*(nahi|nhi)\s*(de\s*rahe|mila)/i,
      /बेहोश/i,
      /अचानक\s*गिर\s*गए/i,
      /जवाब\s*नहीं\s*दे\s*रहे/i,
      /होश\s*नहीं/i,
      /wo\s*achanak\s*gir\s*gaye/i
    ],
    positiveExemptions: [
      /(response|jawab)\s*(nahi|nhi)/i,
      /जवाब\s*नहीं\s*दे\s*रहे/i
    ]
  },
  {
    type: 'severe_bleeding',
    patterns: [
      /\b(severe\s*bleeding|heavy\s*bleeding|hemorrhage|uncontrolled\s*bleeding|profuse\s*bleeding|arterial\s*bleeding|gushing\s*blood)\b/i,
      /\b(bleeding\s*won'?t\s*stop|bleeding\s*not\s*stopping)\b/i,
      /(khoon|bleeding)\s*(ruk|band)\s*(nahi|nhi)\s*rahi/i,
      /(bahut|bohot|tez|jyada|zyada)\s*khoon\s*(beh|nikal)\s*raha/i,
      /(accident|chot)\s*ke\s*baad\s*(bahut\s*)?khoon/i,
      /accident\s*ke\s*baad\s*bleeding\s*ruk\s*nahi/i,
      /खून\s*(नहीं\s*रुक\s*रहा|बहता\s*जा\s*रहा|बहुत\s*बह\s*रहा)/i,
      /एक्सीडेंट\s*के\s*बाद\s*खून\s*नहीं\s*रुक\s*रहा/i,
      /रक्तस्राव/i
    ],
    positiveExemptions: [
      /(khoon|bleeding)\s*(ruk|band)\s*(nahi|nhi)/i,
      /खून\s*नहीं\s*रुक\s*रहा/i
    ]
  },
  {
    type: 'stroke_symptoms',
    patterns: [
      /\b(stroke|cerebrovascular|tia|mini-stroke|face\s*droop|facial\s*drooping|slurred\s*speech|one-sided\s*weakness|hemiplegia)\b/i,
      /(munh|muh|face)\s*(tedha|teda|terha)/i,
      /bol\s*(nahi|nhi)\s*(paa|pa)\s*rahe/i,
      /(ek\s*taraf|aadha\s*shareer)\s*(kamzor|sunn|paralyze|lakwa)/i,
      /लकवा/i,
      /मुंह\s*टेढ़ा/i,
      /बोल\s*नहीं\s*पा\s*रहे/i
    ],
    positiveExemptions: [
      /bol\s*(nahi|nhi)\s*pa/i,
      /बोल\s*नहीं\s*पा\s*रहे/i
    ]
  },
  {
    type: 'seizure',
    patterns: [
      /\b(seizures?|convulsions?|fits|epilep(sy|tic))\b/i,
      /(daura|daure|mirgi|jhatke\s*aa\s*rahe|kampan)/i,
      /दौरा/i,
      /मिर्गी/i,
      /झटके\s*आ\s*रहे/i
    ]
  },
  {
    type: 'high_fever_infant',
    patterns: [
      /\b(infant|newborn|baby|neonate)\s*(with\s*)?(high\s*fever|fever\s*over\s*102|fever\s*104)\b/i,
      /(navjaat|chote\s*bachche|doodh\s*peete\s*bachche)\s*ko\s*(tez|bahut\s*tez)\s*bukhar/i,
      /bachche\s*ka\s*(tez\s*|104\s*)bukhar/i,
      /नवजात\s*(शिशु\s*)?को\s*तेज़\s*बुखार/i,
      /छोटे\s*बच्चे\s*को\s*तेज़\s*बुखार/i
    ]
  },
  {
    type: 'suicidal_ideation',
    patterns: [
      /\b(suicid(e|al)|kill\s*myself|end\s*my\s*life|want\s*to\s*die|self-harm)\b/i,
      /(khudkushi|aatmhatya|marne\s*ka\s*man|jaan\s*dene)/i,
      /आत्महत्या/i,
      /खुदकुशी/i,
      /जान\s*देने/i
    ]
  },
  {
    type: 'severe_dehydration',
    patterns: [
      /\b(severe\s*dehydration|sunken\s*eyes|completely\s*unresponsive\s*dehydration|no\s*urine\s*24\s*hours)\b/i,
      /(bahut\s*tez\s*dehydration|bachcha\s*peshab\s*nahi\s*kar\s*raha|bilkul\s*sust\s*hai\s*paani\s*nahi\s*pee\s*raha)/i,
      /गंभीर\s*निर्जलीकरण/i
    ]
  }
];

/**
 * Checks if the text has an emergency red flag with full negation checks.
 * Aggregates user_input + conversation_history.
 */
export function evaluateSafetyGate(
  userInput: string,
  conversationHistory: { role: string; content: string }[] = []
): SafetyCheckResult {
  // Combine all user utterances for safety scanning
  const userTexts = [
    ...conversationHistory.filter(c => c.role === 'user').map(c => c.content),
    userInput
  ];
  const combinedText = userTexts.join(' ').trim();
  const normalizedText = combinedText.toLowerCase();

  const detectedFlags = new Set<RedFlag>();
  const matchedTerms: string[] = [];

  for (const rule of RED_FLAG_RULES) {
    for (const pattern of rule.patterns) {
      const match = combinedText.match(pattern);
      if (match) {
        const matchedStr = match[0];

        // Check if this matched segment is negated
        const matchIndex = match.index ?? 0;
        const windowStart = Math.max(0, matchIndex - 40);
        const windowEnd = Math.min(combinedText.length, matchIndex + matchedStr.length + 40);
        const contextWindow = combinedText.substring(windowStart, windowEnd);

        // Check positive exemptions first (e.g. 'saans nahi aa rahi')
        let isExemptPositive = false;
        if (rule.positiveExemptions) {
          for (const exemption of rule.positiveExemptions) {
            if (exemption.test(contextWindow)) {
              isExemptPositive = true;
              break;
            }
          }
        }

        let isNegated = false;
        if (!isExemptPositive) {
          for (const negPattern of NEGATION_PATTERNS) {
            if (negPattern.test(contextWindow)) {
              isNegated = true;
              break;
            }
          }
        }

        if (!isNegated) {
          detectedFlags.add(rule.type);
          matchedTerms.push(matchedStr);
          break; // move to next rule once detected
        }
      }
    }
  }

  // Cross-validation check on specific dataset terms
  // e.g. "accident ke baad bleeding ruk nahi rahi" -> chest_pain;breathlessness or severe_bleeding in training set
  // The dataset annotated some emergencies with "chest_pain;breathlessness".
  // Our red flag detector identifies the true medical flags and ensures emergency_112 is triggered.
  const flagsArray = Array.from(detectedFlags);
  const isEmergency = flagsArray.length > 0;

  let explanation = '';
  if (isEmergency) {
    explanation = `Red-flag symptoms detected (${flagsArray.join(', ')}); routed to emergency services (112), not home care.`;
  }

  return {
    isEmergency,
    redFlags: flagsArray,
    matchedTerms,
    explanation
  };
}
