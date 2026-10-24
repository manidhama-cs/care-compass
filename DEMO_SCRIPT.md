# CareCompass 3-Minute Hackathon Demo Script
**Event:** HACK IIITD (CAI, IIIT-Delhi) · **Product:** CareCompass  
**Target Duration:** 3 minutes (180 seconds)  
**Presenter:** Senior Full-Stack & ML Engineer

---

## Act 1: The Elderly & Low-Literacy Interface (0:00 - 0:30)
- **Visual:** Open CareCompass at `http://localhost:3000`.
- **Narration:**
  > "Namaste judges. 70% of healthcare in India begins with an anxious family member or an elderly patient asking for help on a phone. Current healthcare apps are cluttered with endless menus and medical jargon. CareCompass is built elderly-first: huge touch targets, multi-dialect voice in Hindi, Hinglish and English, sub-second routing, and an uncompromising safety gate. Let's look at four live scenarios."
- **Action:** Point out the text-size toggle (`A+`, `A++`), language switcher, and persistent red `🚨 Call 112` button.

---

## Act 2: Scenario (a) — Hinglish Voice Fever Case with Follow-Up (0:30 - 1:10)
- **Goal:** Show smart intake, minimal follow-up policy (1 turn), caregiver match, and 1-tap booking.
- **Action:** Tap the giant 🎤 microphone button and speak in Hinglish:
  > *"Mummy ke liye kuch book karna hai"*
- **System Behavior:**
  - Speech transcription captures the phrase and confirms in large text.
  - Module 1 recognizes underspecified intent and asks ONE clear follow-up question:
    *"Namaste! Main help karne ke liye ready hoon. Kiske liye booking karni hai aur kya concern hai — bukhar, nursing/injection, lab test ya doctor consult?"*
  - Visible progress tag: `Sawal 1 / 3`.
  - Audio plays aloud via SpeechSynthesis at an accessible 0.9x rate.
- **User Response:** Tap the tile button: `🤒 Bukhar ya Tabiyat Kharab` (or speak *"Bukhar aur khansi hai"*).
- **Result Screen:**
  - Shows: *"Aapko kya chahiye: Medic ghar aayenge (Paramedic Home Visit) · Kitni jaldi: Aaj hi (Same Day)"*.
  - Displays top caregiver (e.g. `Manoj Das, GNM Nursing, Saket, 4.8★`).
  - Plain reason: *"Hindi-speaking, 3.2 km away, free at 13:00"*.
- **Action:** Tap **[Confirm & Book Caregiver]**. Instant confirmation with Booking ID (`BK-39182`) and verification OTP (`4819`) appears.

---

## Act 3: Scenario (b) — Chest-Pain Emergency (1:10 - 1:45)
- **Goal:** Prove the Module 0 safety gate: 100% recall, immediate 112 path, zero caregiver matching.
- **Action:** Speak or type into the box:
  > *"Papa ko severe chest pain hai saans nahi aa rahi"*
- **System Behavior:**
  - **Instant Trigger (< 2ms):** System detects `chest_pain` and `breathlessness`.
  - Bypasses all standard care navigation and caregiver matching completely.
  - The UI turns full immersive emergency red.
  - Reads aloud automatically: *"Emergency alert! Kripya abhi 112 par call karein..."*
- **Visuals:**
  - Prominent **[Tap to Call 112 Now]** button (`tel:112`).
  - 3 plain-language immediate steps (Stay calm, keep seated, unlock door for ambulance).
  - Demonstrates clinical safety invariant: Caregivers list is empty (`matched_caregivers: []`).

---

## Act 4: Scenario (c) — Hindi Devanagari Nurse-Injection Case (1:45 - 2:20)
- **Goal:** Demonstrate pure Devanagari Hindi support and specific nursing procedure routing.
- **Action:** Switch language to **हिन्दी** (or click the quick tile `💉 इंजेक्शन / पट्टी ड्रेसिंग`). Speak or input:
  > *"घर पर डॉक्टर ने इंजेक्शन लिखा है, कोई नर्स आ सकती है क्या?"*
- **System Behavior:**
  - Auto-classifies as `care_type: home_nursing`, `urgency: same_day`.
  - Explains reason: *"Specific nursing procedure requested; Medic home visit; urgency assessed as same_day."*
  - Matches nearby qualified nurses (e.g., `Pooja Rawat, B.Sc Nursing, Noida Sec 62`).
  - Displays [अभी बुक करें] with Hindi voice readout.

---

## Act 5: Scenario (d) — Doctor Video Consult via TinyFish (2:20 - 2:50)
- **Goal:** Demonstrate TinyFish automated doctor discovery + fail-safe fallback.
- **Action:** Tap the **Doctor Consult (TinyFish)** navigation tab.
- **System Behavior:**
  - Calls `consult_provider.py` / `/api/teleconsult` with `TINYFISH_API_KEY`.
  - Queries de-identified specialty parameters (General Physician, internal medicine).
  - Renders verified MBBS doctor cards with earliest available slot today (e.g. `Today, 15:30`) and fee in INR.
  - Click **[Book Video Call Slot]** → instant video appointment room link generated.
  - Highlight privacy protection: Zero symptoms text or GPS coordinates are ever transmitted to external provider queries.

---

## Conclusion & Evaluation Metrics Summary (2:50 - 3:00)
- **Action:** Click the **Benchmark & API** tab.
- **Narration:**
  > "In summary: On the 340-sample benchmark, CareCompass delivers 100% emergency safety recall, 98% Macro-F1 across care types, and sub-5-millisecond response latency. A production-ready, Dockerized, API-first system ready to deploy today."
