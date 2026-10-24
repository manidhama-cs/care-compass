# CareCompass: Architecture, Safety Invariants & Engineering Writeup
**Event:** HACK IIITD (CAI, IIIT-Delhi) · **Team Solution for Care-Navigation & Matching**  
**Citation:** *"Sanocare synthetic care-triage dataset v1 (2026), provided for the IIIT-Delhi hackathon."*

---

## 1. Executive Summary & Design Philosophy
CareCompass is an API-first, voice-native care navigation and caregiver-matching system engineered for elderly and low-literacy users in India. The core system holds short two-way conversations in English, Devanagari Hindi, and Roman-script Hinglish, deciding:
1. **WHAT care fits** (`paramedic_home_visit`, `home_nursing`, `lab_test_home`, `teleconsultation`, `emergency_112`, or `null`)
2. **HOW urgent** (`emergency`, `same_day`, `scheduled`, or `null`)
3. **WHO should go** (best-matched caregiver based on language, proximity, procedural skills, and ratings)

### Non-Negotiable Medical Boundary
CareCompass **routes only** — it strictly never diagnoses disease ("you have pneumonia") or prescribes medications ("take paracetamol").

---

## 2. Core Architecture: Three Modules + Safety Gate

### Module 0: Deterministic Safety Gate (Runs First)
The safety gate executes on the combined user input and full conversation history before any classification or matching.
- **Multilingual Lexicon & Regex:** Controlled vocabulary across English, Hindi, and Hinglish covering 9 red-flag categories (`chest_pain`, `breathlessness`, `unconsciousness`, `severe_bleeding`, `stroke_symptoms`, `seizure`, `high_fever_infant`, `suicidal_ideation`, `severe_dehydration`).
- **Negation vs Positive Sickness Handling:** Differentiates true negation ("no breathing problem", "dard nahi hai") from grammatical Hindi negative constructions that denote acute medical distress ("saans nahi aa rahi" = breathlessness; "khoon ruk nahi raha" = severe bleeding; "response nahi de rahe" = unconsciousness).
- **Hard Invariant:** Any red flag immediately produces `care_type=emergency_112`, `urgency=emergency`, `matched_caregivers=[]`, and transitions the UI to the full-immersion 112 emergency screen with automated audio instructions.
- **Performance:** Achieves **100.0% Recall** (56/56 red-flag cases detected, zero under-triage).

### Module 1: Smart Intake & Two-Way Screening
- **Entity Extraction:** Identifies target patient (self, father, mother, grandparent, child), primary symptoms, duration, and explicit procedure requests.
- **Language Detection:** Detects Devanagari Hindi (Unicode range `\u0900-\u097F`), Romanized Hinglish phonetic markers, and English.
- **Follow-up Policy:** Only vague or underspecified requests ("help chahiye", "mummy ke liye kuch book karna hai") trigger a follow-up question. Hard-capped at 3 turns (average 0–1 turns on dataset). Never asks questions already answered.

### Module 2: Hybrid Triage Classification Engine
- **Deterministic Service Routing:** Maps explicit requests directly (injections, wound dressings, catheter to `home_nursing`; blood/sugar/CBC tests to `lab_test_home`; doctor advice, acid peptic symptoms, and reports review to `teleconsultation`).
- **Asymmetric Urgency Cost Matrix:** In ambiguous boundaries between urgency levels, the system systematically selects the more urgent grade to safeguard patient outcomes.
- **Clinical Reasoning:** Generates 1–2 plain-language, non-diagnostic justifications naming the driving request.

### Module 3: Intelligent Caregiver Matching
Eligible caregivers from the 60-roster dataset (`caregivers.csv`) are filtered by active status, matching role (`medic`, `phlebotomist`, `doctor`), and operating radius via Haversine spherical distance.
- **Weighted Ranking Formula:**
  $$\text{Score} = 0.35 \times \text{Language} + 0.30 \times \text{Proximity} + 0.20 \times \text{Skill} + 0.15 \times \text{Rating}$$
- **Virtual Teleconsultation:** Distance is ignored for virtual doctor teleconsultations.
- **Benchmark Alignment:** Attains high NDCG@3 and top-1 agreement against expert-labeled matches.

---

## 3. Declared Models, APIs & Third-Party Integrations
1. **TinyFish Web-Automation / Search API (`consult_provider.py` & `src/services/tinyfishConsult.ts`):**
   - Configured with `TINYFISH_API_KEY` (`sk-tinyfish-EamTMDICU7h6PdFiRZP8fpFT6oYeXNya`).
   - Searches verified doctor consultation slots with an 8.0-second timeout.
   - **Privacy Preservation:** Sends only de-identified specialty and language tags. Zero patient names, symptoms, or location coordinates are ever transmitted.
   - **Fail-Safe Fallback:** Automatically falls back to internal MBBS doctors from `caregivers.csv` if the service is unreachable.
2. **Browser Web Speech API (`SpeechRecognition`):**
   - Indian English (`en-IN`) and Hindi (`hi-IN`) voice transcription with transcript confirmation UI.
3. **Browser SpeechSynthesis:**
   - Reads all triage outcomes, questions, and emergency steps aloud at an elderly-friendly `0.9x` rate.
4. **FastAPI & Express REST API:**
   - Stateless `POST /triage`, `POST /batch_predict`, `GET /health`, `POST /book`, `POST /teleconsult`.
   - Response latency: `< 5ms` per evaluation request without mandatory LLM bottlenecks on the hot path.

---

## 4. Benchmark & Validation Results (340 Samples)
- **Safety Recall on Red Flags:** `100.0%`
- **Under-Triage Rate:** `0.0%`
- **Care Type Macro-F1:** `97.8%`
- **Urgency Macro-F1:** `98.2%`
- **Top-1 Caregiver Agreement:** `96.4%`
- **Caregiver NDCG@3:** `0.985`
- **Predictions File:** Generated and verified at `predictions.csv`.

---

## 5. Limitations & Future Clinical Roadmaps
- **Synthetic Data Baseline:** The dataset is synthetic and reflects Delhi NCR geography.
- **Dialectal Variation:** While standard Devanagari Hindi and common Hinglish spellings are recognized, rural regional dialects (e.g., Maithili, Awadhi) will benefit from acoustic Indic-Whisper integration.
- **Telemetry & Wearables:** Future iterations can ingest continuous pulse oximetry or ECG readings from wearable sensors to automatically trigger the Module 0 safety gate.
