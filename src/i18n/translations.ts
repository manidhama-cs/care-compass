export type AppLanguage = 'English' | 'Hindi' | 'Hinglish';

export interface Translations {
  appName: string;
  tagline: string;
  disclaimer: string;
  call112: string;
  textSize: string;
  speechConfirmTitle: string;
  speechConfirmBtn: string;
  speechRetryBtn: string;
  listening: string;
  tapToSpeak: string;
  orTypeHere: string;
  askPlaceholder: string;
  startBtn: string;
  quickTilesTitle: string;
  emergencyTile: string;
  feverTile: string;
  injectionTile: string;
  bloodTestTile: string;
  doctorTile: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  emergencyAction: string;
  emergencyStep1: string;
  emergencyStep2: string;
  emergencyStep3: string;
  followUpStep: string;
  yes: string;
  no: string;
  careNeeded: string;
  urgencyLabel: string;
  today: string;
  scheduled: string;
  urgent: string;
  topCaregiver: string;
  otherCaregivers: string;
  bookNow: string;
  whyThis: string;
  bookingSuccess: string;
  bookingId: string;
  otpLabel: string;
  shareOtp: string;
  doctorConsultTitle: string;
  doctorConsultSubtitle: string;
  bookVideoCall: string;
  feeLabel: string;
  replayAudio: string;
  resetConversation: string;
}

export const I18N: Record<AppLanguage, Translations> = {
  English: {
    appName: "CareCompass",
    tagline: "Safe, voice-first care navigation & caregiver matching",
    disclaimer: "This system routes to appropriate healthcare professionals; it does not diagnose or prescribe medication.",
    call112: "🚨 Call 112 (Emergency)",
    textSize: "Text Size",
    speechConfirmTitle: "Did we hear you correctly?",
    speechConfirmBtn: "Yes, Proceed",
    speechRetryBtn: "Speak Again",
    listening: "Listening... Please describe your health need",
    tapToSpeak: "Tap to Speak (Voice Input)",
    orTypeHere: "or type your request below",
    askPlaceholder: "e.g. Need injection at home / Father has fever",
    startBtn: "Find Care",
    quickTilesTitle: "Choose a quick option or speak:",
    emergencyTile: "🚨 Severe Emergency",
    feverTile: "🤒 Fever & Vitals Check",
    injectionTile: "💉 Injection / Wound Dressing",
    bloodTestTile: "🩸 Blood Test / Sample Collection",
    doctorTile: "👨‍⚕️ Talk to a Doctor",
    emergencyTitle: "Call 112 Immediately",
    emergencySubtitle: "Critical red-flag symptoms detected. Please do not wait for home care.",
    emergencyAction: "Tap to Call 112 Now",
    emergencyStep1: "1. Stay calm. Keep the patient in a comfortable seated or resting position.",
    emergencyStep2: "2. Do not give oral food or water if breathing is labored or unconscious.",
    emergencyStep3: "3. Unlock the main entrance and have your exact street address ready for the ambulance.",
    followUpStep: "Question",
    yes: "Yes (Haan)",
    no: "No (Nahi)",
    careNeeded: "Recommended Care",
    urgencyLabel: "Urgency Level",
    today: "Today (Same Day)",
    scheduled: "Scheduled Slot",
    urgent: "Immediate / Emergency",
    topCaregiver: "Best Matched Caregiver",
    otherCaregivers: "Alternative Verified Caregivers",
    bookNow: "Confirm & Book Caregiver",
    whyThis: "Why was this care & urgency selected?",
    bookingSuccess: "Booking Confirmed Successfully!",
    bookingId: "Booking ID",
    otpLabel: "Verification OTP",
    shareOtp: "Share this OTP with your caregiver when they arrive at your home.",
    doctorConsultTitle: "Online Doctor Video Consultation",
    doctorConsultSubtitle: "Verified MBBS doctors via TinyFish Automated Healthcare Network",
    bookVideoCall: "Book Video Call Slot",
    feeLabel: "Consultation Fee",
    replayAudio: "Read Aloud",
    resetConversation: "Start New Request"
  },
  Hindi: {
    appName: "केयरकम्पास (CareCompass)",
    tagline: "सुरक्षित स्वास्थ्य सेवा नेविगेशन और देखभालकर्ता मिलान",
    disclaimer: "यह प्रणाली केवल सही स्वास्थ्य सेवा चुनने में मदद करती है; यह कोई डॉक्टरी इलाज या दवा नहीं लिखती।",
    call112: "🚨 आपातकाल 112 कॉल करें",
    textSize: "अक्षर आकार",
    speechConfirmTitle: "क्या हमने सही सुना?",
    speechConfirmBtn: "हाँ, आगे बढ़ें",
    speechRetryBtn: "दोबारा बोलें",
    listening: "सुन रहे हैं... कृपया अपनी परेशानी बताएं",
    tapToSpeak: "बोलने के लिए माइक दबाएं",
    orTypeHere: "या नीचे लिखकर बताएं",
    askPlaceholder: "उदा. घर पर इंजेक्शन लगवाना है / पापा को बुखार है",
    startBtn: "सेवा खोजें",
    quickTilesTitle: "सीधा विकल्प चुनें या बोलकर बताएं:",
    emergencyTile: "🚨 गंभीर आपातकाल",
    feverTile: "🤒 बुखार और बीपी/शुगर जांच",
    injectionTile: "💉 इंजेक्शन / पट्टी ड्रेसिंग",
    bloodTestTile: "🩸 खून की जांच / ब्लड टेस्ट",
    doctorTile: "👨‍⚕️ डॉक्टर से वीडियो सलाह",
    emergencyTitle: "अभी 112 पर कॉल करें",
    emergencySubtitle: "गंभीर आपातकालीन लक्षण पाए गए हैं। कृपया होम केयर का इंतजार न करें।",
    emergencyAction: "112 डायल करने के लिए यहाँ दबाएं",
    emergencyStep1: "1. शांत रहें। मरीज को आराम से लेटा दें या सहारा देकर बैठाएं।",
    emergencyStep2: "2. यदि सांस में तकलीफ या बेहोशी है तो मुंह में कुछ न दें।",
    emergencyStep3: "3. मुख्य दरवाजा खोल दें और एम्बुलेंस के लिए घर का सही पता तैयार रखें।",
    followUpStep: "सवाल",
    yes: "हाँ",
    no: "नहीं",
    careNeeded: "जरूरी स्वास्थ्य सेवा",
    urgencyLabel: "समय सीमा",
    today: "आज ही (Same Day)",
    scheduled: "तय समय पर (Scheduled)",
    urgent: "तत्काल आपातकालीन (Emergency)",
    topCaregiver: "सबसे उपयुक्त देखभालकर्ता",
    otherCaregivers: "अन्य उपलब्ध स्वास्थ्य कर्मी",
    bookNow: "अभी बुक करें (Confirm Booking)",
    whyThis: "यह निर्णय क्यों लिया गया?",
    bookingSuccess: "आपकी बुकिंग सफलतापूर्वक हो गई है!",
    bookingId: "बुकिंग संख्या (ID)",
    otpLabel: "सत्यापन कोड (OTP)",
    shareOtp: "देखभालकर्ता के घर आने पर यह OTP उन्हें बताएं।",
    doctorConsultTitle: "ऑनलाइन डॉक्टर वीडियो परामर्श",
    doctorConsultSubtitle: "टाइनीफिश (TinyFish) द्वारा सत्यापित ऑनलाइन MBBS डॉक्टर",
    bookVideoCall: "वीडियो कॉल बुक करें",
    feeLabel: "परामर्श शुल्क",
    replayAudio: "आवाज में सुनें",
    resetConversation: "नई शुरुआत करें"
  },
  Hinglish: {
    appName: "CareCompass",
    tagline: "Aapki zaroorat ke hisaab se sahi health care aur caregiver",
    disclaimer: "Yeh system sirf sahi health service chunne mein madad karta hai; koi ilaaj ya dava prescribe nahi karta.",
    call112: "🚨 Emergency 112 Call Karein",
    textSize: "Font Size",
    speechConfirmTitle: "Kya humne sahi suna?",
    speechConfirmBtn: "Haan, Sahi Hai",
    speechRetryBtn: "Dobara Bolo",
    listening: "Sun rahe hain... Apni takleef ya service bataiye",
    tapToSpeak: "Bolne ke liye Mic dabayein",
    orTypeHere: "ya neeche likh kar batayein",
    askPlaceholder: "e.g. Ghar pe injection lagwana hai / Papa ko bukhar hai",
    startBtn: "Care Khojein",
    quickTilesTitle: "Seedha ek option chuniye ya bolkar batayein:",
    emergencyTile: "🚨 Emergency / Bahut Gambhir",
    feverTile: "🤒 Bukhar & Vitals Check",
    injectionTile: "💉 Injection / Wound Dressing",
    bloodTestTile: "🩸 Blood Test / Sample Ghar Se",
    doctorTile: "👨‍⚕️ Doctor Se Online Salah",
    emergencyTitle: "Abhi 112 Par Call Karein",
    emergencySubtitle: "Red-flag emergency symptoms detect hue hain. Please home care ka wait mat karein.",
    emergencyAction: "Abhi 112 Par Call Karein",
    emergencyStep1: "1. Shant rahein. Patient ko aaram se leta dein ya bitha dein.",
    emergencyStep2: "2. Agar saans lene me takleef hai ya behosh hain toh paani/khana na dein.",
    emergencyStep3: "3. Main gate khol dein aur ambulance ke liye address ready rakhein.",
    followUpStep: "Sawal",
    yes: "Haan (Yes)",
    no: "Nahi (No)",
    careNeeded: "Zaroori Care Service",
    urgencyLabel: "Kitni Jaldi",
    today: "Aaj Hi (Same Day)",
    scheduled: "Scheduled Slot",
    urgent: "Immediate Emergency (112)",
    topCaregiver: "Best Matched Caregiver",
    otherCaregivers: "Dusre Verified Caregivers",
    bookNow: "Abhi Book Karein",
    whyThis: "Yeh decision kyu liya gaya? (Reasoning)",
    bookingSuccess: "Aapki Booking Confirm Ho Gayi!",
    bookingId: "Booking ID",
    otpLabel: "Verification OTP",
    shareOtp: "Caregiver ke aane par unhe yeh OTP batayein.",
    doctorConsultTitle: "Online Doctor Video Consult",
    doctorConsultSubtitle: "Verified MBBS Doctors through TinyFish Automated Network",
    bookVideoCall: "Video Call Slot Book Karein",
    feeLabel: "Consultation Fees",
    replayAudio: "Awaaz Me Sunein",
    resetConversation: "Naya Sawal Poochein"
  }
};
