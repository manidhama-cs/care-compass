/**
 * CareCompass Type Definitions
 * Strict implementation of HACK IIITD API Contract and Data Schemas
 */

export type CareType =
  | 'paramedic_home_visit'
  | 'home_nursing'
  | 'lab_test_home'
  | 'teleconsultation'
  | 'emergency_112'
  | null;

export type Urgency =
  | 'emergency'
  | 'same_day'
  | 'scheduled'
  | null;

export type RedFlag =
  | 'chest_pain'
  | 'breathlessness'
  | 'unconsciousness'
  | 'severe_bleeding'
  | 'stroke_symptoms'
  | 'seizure'
  | 'high_fever_infant'
  | 'suicidal_ideation'
  | 'severe_dehydration';

export type DetectedLanguage = 'English' | 'Hindi' | 'Hinglish';

export type ScreeningStatus =
  | 'collecting_information'
  | 'asking_follow_up'
  | 'ready_for_recommendation'
  | 'emergency'
  | 'needs_human_assistance';

export interface Location {
  lat: number;
  lng: number;
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ScreeningSessionState {
  sessionId: string;
  conversationHistory: ConversationTurn[];
  targetPerson: 'self' | 'father' | 'mother' | 'grandmother' | 'grandfather' | 'child' | 'spouse' | 'other' | 'unknown';
  mainConcern: string;
  symptoms: string[];
  duration: string | null;
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
  progression: 'better' | 'worse' | 'same' | 'unknown';
  relevantContext: string[];
  requestedService: 'injection' | 'dressing' | 'lab_test' | 'doctor_consult' | 'vitals_check' | 'none';
  language: DetectedLanguage;
  location: Location | null;
  isLocationExplicit: boolean;
  knownAnswers: Record<string, string | number | boolean>;
  missingInformation: string[];
  screeningStatus: ScreeningStatus;
  questionCount: number;
  maxQuestions: number;
  nextQuestion: string | null;
  suggestedOptions: string[];
  careType: CareType;
  urgency: Urgency;
  reasoning: string;
  matchedCaregivers: MatchedCaregiverResult[];
  previouslyShownCaregivers: string[];
  rejectedCaregivers: string[];
  selectedCaregiverId?: string;
  isSingleTurnEvaluation?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompletenessEvaluation {
  isSufficient: boolean;
  missingFields: string[];
  recommendedNextQuestion: {
    question: string;
    suggestedOptions: string[];
    field: string;
  } | null;
  reason: string;
}

export interface SessionTriageRequest {
  sessionId?: string;
  user_input: string;
  language?: 'auto' | 'English' | 'Hindi' | 'Hinglish';
  location?: Location;
  rejected_caregiver_id?: string;
  selected_caregiver_id?: string;
  conversation_history?: ConversationTurn[];
  isSingleTurnEvaluation?: boolean;
}

export interface SessionTriageResponse {
  sessionId: string;
  screeningStatus: ScreeningStatus;
  assistantMessage: string;
  follow_up_question: string | null;
  missingInformation: string[];
  care_type: CareType;
  urgency: Urgency;
  red_flags: string[];
  reasoning: string;
  matched_caregivers: MatchedCaregiverResult[];
  suggested_options: string[];
  canBook: boolean;
  nextAction: 'answer_question' | 'confirm_booking' | 'call_112' | 'human_helpline' | 'provide_location';
  sessionState?: Partial<ScreeningSessionState>;
}

export interface TriageRequest {
  user_input: string;
  language?: 'auto' | 'English' | 'Hindi' | 'Hinglish';
  location?: Location;
  conversation_history?: ConversationTurn[];
}

export interface MatchedCaregiverResult {
  caregiver_id: string;
  score: number;
  reason: string;
}

export interface TriageResponse {
  follow_up_question: string | null;
  care_type: CareType;
  urgency: Urgency;
  red_flags: string[];
  reasoning: string;
  matched_caregivers: MatchedCaregiverResult[];
  // Extended fields for enriched UX & explainability
  detected_language?: DetectedLanguage;
  confidence?: number;
  suggested_options?: string[];
}

export interface Caregiver {
  caregiver_id: string;
  name: string;
  role: 'medic' | 'doctor' | 'phlebotomist';
  qualification: string;
  gender: 'M' | 'F';
  languages: string[];
  skills: string[];
  base_area: string;
  base_lat: number;
  base_lng: number;
  max_radius_km: number;
  tier?: 'base' | 'standard' | 'advanced' | 'expert' | '';
  rating: number;
  experience_years: number;
  free_from: string;
  free_until: string;
  active: boolean;
  distance_km?: number;
}

export interface BookingRequest {
  caregiver_id: string;
  care_type: string;
  patient_name: string;
  patient_phone: string;
  address: string;
  preferred_slot?: string;
  notes?: string;
  location?: Location;
}

export interface BookingConfirmation {
  booking_id: string;
  status: 'confirmed' | 'dispatched' | 'pending';
  caregiver_name: string;
  caregiver_role: string;
  caregiver_phone: string;
  patient_name: string;
  eta_or_slot: string;
  otp: string;
  service_type: string;
  created_at: string;
  instructions: string[];
}

export interface TeleconsultRequest {
  specialty?: string;
  language?: string;
  preferred_time?: string;
  patient_gender?: string;
}

export interface TeleconsultSlot {
  provider: 'tinyfish' | 'carecompass_internal';
  doctor_id: string;
  doctor_name: string;
  qualification: string;
  languages: string[];
  rating: number;
  earliest_slot: string;
  booking_url?: string;
  consultation_fee_inr: number;
  source: string;
}

export interface BenchmarkMetrics {
  total_samples: number;
  safety_recall: number; // Must be 1.0 (100%)
  safety_false_alarm_rate: number;
  care_type_macro_f1: number;
  urgency_macro_f1: number;
  top1_caregiver_agreement: number;
  ndcg_at_3: number;
  avg_response_time_ms: number;
  confusion_matrix_care_type: Record<string, Record<string, number>>;
  confusion_matrix_urgency: Record<string, Record<string, number>>;
}
