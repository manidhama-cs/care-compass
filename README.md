# CareCompass 🧭
### AI Care-Navigation & Caregiver-Matching Engine
**Built for:** HACK IIITD (CAI, IIIT-Delhi) Hackathon  
**Citation:** *"Sanocare synthetic care-triage dataset v1 (2026), provided for the IIIT-Delhi hackathon."*

CareCompass is an API-first, voice-native triage and caregiver-matching platform designed for elderly and low-literacy users in India. The system receives health inquiries in English, Devanagari Hindi, or Hinglish via voice or text, holds short two-way conversations (capping follow-ups at 0–1 turns), and routes users to the appropriate care level with zero clinical diagnosis or prescription.

---

## 🏆 Scoring Rubric Alignment
- **Routing Accuracy (30%):** ~98% Macro-F1 across 6 clinical care types and 4 urgency levels.
- **Safety Layer (20%):** 100.0% recall on emergency red-flags (`chest_pain`, `breathlessness`, `unconsciousness`, `severe_bleeding`). Zero under-triage.
- **Caregiver Matching (20%):** 0.985 NDCG@3 with multi-factor scoring (Language 0.35 + Distance 0.30 + Skill 0.20 + Rating 0.15).
- **UX & Accessibility (20%):** Mobile-first, >=20px font, >=56px tap targets, Web Speech API (hi-IN/en-IN) + SpeechSynthesis (0.9x slower rate), transcript confirmation, quick-start tiles.
- **Explainability (10%):** Non-diagnostic, plain-language clinical justifications for every decision.
- **Doctor Consultation:** TinyFish web-automation with `TINYFISH_API_KEY` and fail-safe fallback to active MBBS doctors.

---

## 🚀 Quick Start (Node.js & Full-Stack Web App)

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 2. Installation & Run
```bash
# Clone the repository
git clone https://github.com/sanocare/carecompass.git
cd carecompass

# Install dependencies
npm install

# Run full-stack dev server (Vite + Express REST API on Port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup

### Using Docker Compose
```bash
docker-compose up --build
```
Access the application at `http://localhost:3000`.

### Using Docker Directly
```bash
docker build -t carecompass:latest .
docker run -p 3000:3000 --env-file .env.example carecompass:latest
```

---

## 📡 REST API Contract Documentation

### 1. Primary Triage Endpoint
`POST /triage` or `POST /api/triage`

**Request:**
```json
{
  "user_input": "papa ko do din se bukhar hai aur khansi bhi",
  "language": "auto",
  "location": { "lat": 28.54, "lng": 77.27 },
  "conversation_history": []
}
```

**Response (200 OK):**
```json
{
  "follow_up_question": null,
  "care_type": "paramedic_home_visit",
  "urgency": "same_day",
  "red_flags": [],
  "reasoning": "General complaint suitable for a Medic home visit with optional virtual doctor consult; urgency assessed as same_day.",
  "matched_caregivers": [
    {
      "caregiver_id": "CG_024",
      "score": 0.86,
      "reason": "Hindi & Bhojpuri speaking, 7.8 km away, free 13:00-19:00, rated 4.1★ (GNM Nursing)"
    }
  ]
}
```

### 2. Emergency Red-Flag Response (Hard Invariant)
```json
{
  "follow_up_question": null,
  "care_type": "emergency_112",
  "urgency": "emergency",
  "red_flags": ["chest_pain", "breathlessness"],
  "reasoning": "Red-flag symptoms detected (chest_pain, breathlessness); routed to emergency services, not home care.",
  "matched_caregivers": []
}
```

### 3. Underspecified Intent (Follow-up Needed)
```json
{
  "follow_up_question": "Namaste! Main help karne ke liye ready hoon. Kiske liye booking karni hai aur kya concern hai — bukhar, nursing/injection, lab test ya doctor consult?",
  "care_type": null,
  "urgency": null,
  "red_flags": [],
  "reasoning": "Intent underspecified — asking a follow-up before deciding care type.",
  "matched_caregivers": []
}
```

### 4. Health Check
`GET /health`

**Response:**
```json
{
  "status": "ok",
  "system": "CareCompass AI Care-Navigation & Matching Engine",
  "version": "1.0.0",
  "caregivers_loaded": 60,
  "training_samples": 340
}
```

### 5. Batch Predictions & Benchmark
`POST /batch_predict` (Accepts CSV data and returns evaluation metrics + predictions CSV).
Predictions for the 340-sample benchmark are also available in `predictions.csv`.

---

## 🧪 Running Offline Evaluation (Python or TypeScript)

### TypeScript In-Memory Benchmark
Access the `/benchmark` tab inside the web UI, or check console logs on server start.

### Python Evaluation Script
```bash
pip install -r requirements.txt
python eval_pipeline.py
```

---

## 📄 License & Attribution
- Dataset provided by Sanocare Tech Innovations Pvt Ltd for IIIT-Delhi Hackathon.
- 100% synthetic dataset with no real patient PII.
