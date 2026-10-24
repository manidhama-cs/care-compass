/**
 * CareCompass Comprehensive Synthetic Seed Data
 * 100% Fictional Data for Hackathon Demonstration & Clinical Usability Testing
 */

import {
  UserProfile,
  Doctor,
  CaregiverProfile,
  CaregiverReview,
  Pharmacy,
  Medicine,
  Appointment,
  DigitalPrescription,
  MedicalRecord,
  Order,
  NotificationItem,
  AuditLogEntry
} from '../types/platform.ts';

// 1. Current Active Demo Users for Role Switching
export const DEMO_USERS: Record<string, UserProfile> = {
  patient: {
    id: "PAT_001",
    name: "Ramesh Sharma",
    email: "ramesh.sharma@example.com",
    role: "patient",
    phone: "+91 98100 12345",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
    locationArea: "Saket, New Delhi"
  },
  doctor: {
    id: "DOC_001",
    name: "Dr. Rekha Gupta",
    email: "dr.rekha.gupta@carecompass.demo",
    role: "doctor",
    phone: "+91 98200 45678",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256",
    locationArea: "Max Smart Hospital, Saket, Delhi"
  },
  caregiver: {
    id: "CG_016",
    name: "Ritu Kumar",
    email: "ritu.kumar@caregiver.demo",
    role: "caregiver",
    phone: "+91 98300 78901",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    locationArea: "Saket & South Delhi"
  },
  admin: {
    id: "ADM_001",
    name: "Dr. Sanjeev Vohra (Chief Medical Officer)",
    email: "admin@carecompass.org",
    role: "admin",
    phone: "+91 98999 99999",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256",
    locationArea: "CareCompass Operations HQ, New Delhi"
  }
};

// 2. 20 Sample Doctors across Multiple Specializations
export const SEED_DOCTORS: Doctor[] = [
  {
    id: "DOC_001",
    name: "Dr. Rekha Gupta",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256",
    specialization: "General Physician & Internal Medicine",
    qualification: "MBBS, MD (Internal Medicine - AIIMS Delhi)",
    registrationNumber: "DMC-48291",
    isVerified: true,
    experienceYears: 14,
    languages: ["Hindi", "English", "Punjabi"],
    consultationFee: 500,
    clinicAddress: "Saket Medical Centre, Press Enclave Road, Saket",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 15:30",
    rating: 4.9,
    reviewCount: 142,
    about: "Senior Physician specialized in hypertension, diabetes management, seasonal fevers, and comprehensive preventive care.",
    recommendationReason: "Top rated general physician in South Delhi with same-day video availability."
  },
  {
    id: "DOC_002",
    name: "Dr. Pawan Singh",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256",
    specialization: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    registrationNumber: "DMC-39182",
    isVerified: true,
    experienceYears: 18,
    languages: ["Hindi", "English", "Bhojpuri"],
    consultationFee: 800,
    clinicAddress: "Indirapuram Heart Clinic, Ghaziabad",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Tomorrow at 10:00",
    rating: 5.0,
    reviewCount: 98,
    about: "Consultant Interventional Cardiologist focusing on coronary artery disease, arrhythmia, and post-angioplasty care.",
    recommendationReason: "High specialization in cardiovascular care with stellar verified patient reviews."
  },
  {
    id: "DOC_003",
    name: "Dr. Kavita Das",
    avatarUrl: "https://images.unsplash.com/photo-1594824813637-450f6b439c08?auto=format&fit=crop&q=80&w=256",
    specialization: "Pediatrics & Child Care",
    qualification: "MBBS, DCH, DNB (Pediatrics)",
    registrationNumber: "DMC-61294",
    isVerified: true,
    experienceYears: 11,
    languages: ["Hindi", "English", "Bengali"],
    consultationFee: 600,
    clinicAddress: "Janakpuri Child Clinic, B-Block, Janakpuri",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 16:45",
    rating: 4.8,
    reviewCount: 115,
    about: "Dedicated pediatrician expert in newborn nutrition, pediatric infections, vaccinations, and growth milestone screening.",
    recommendationReason: "Quick consultation response for parents seeking pediatric second opinions."
  },
  {
    id: "DOC_004",
    name: "Dr. Ankit Verma",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256",
    specialization: "Pulmonology & Respiratory Medicine",
    qualification: "MBBS, MD (Respiratory Medicine)",
    registrationNumber: "DMC-55102",
    isVerified: true,
    experienceYears: 9,
    languages: ["Hindi", "English", "Haryanvi"],
    consultationFee: 650,
    clinicAddress: "Apollo Clinic, Greater Noida Alpha 1",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 17:30",
    rating: 4.7,
    reviewCount: 76,
    about: "Pulmonologist treating chronic cough, asthma, bronchitis, post-viral respiratory distress, and sleep apnea.",
    recommendationReason: "Recommended for cough, breath evaluation, and inhaler prescription adjustments."
  },
  {
    id: "DOC_005",
    name: "Dr. Ritu Chauhan",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256",
    specialization: "Dermatology & Skin Health",
    qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    registrationNumber: "DMC-44910",
    isVerified: true,
    experienceYears: 12,
    languages: ["Hindi", "English"],
    consultationFee: 700,
    clinicAddress: "Pitampura Skin Centre, Netaji Subhash Place",
    modes: ["video"],
    nextAvailableSlot: "Tomorrow at 11:30",
    rating: 4.8,
    reviewCount: 130,
    about: "Specialized in inflammatory skin diseases, allergy rashes, eczema, acne, and trichology.",
    recommendationReason: "Convenient online high-resolution skin image review."
  },
  {
    id: "DOC_006",
    name: "Dr. Rahul Mishra",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256",
    specialization: "Orthopedics & Joint Care",
    qualification: "MBBS, MS (Orthopedics - Safdarjung Hospital)",
    registrationNumber: "DMC-31849",
    isVerified: true,
    experienceYears: 16,
    languages: ["Hindi", "English"],
    consultationFee: 750,
    clinicAddress: "Bone & Joint Clinic, Indirapuram",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 18:00",
    rating: 4.6,
    reviewCount: 88,
    about: "Orthopedic surgeon managing arthritis, spine pain, post-fracture rehabilitation, and sports injuries.",
    recommendationReason: "Expert in geriatric mobility, osteoporosis, and knee pain management."
  },
  {
    id: "DOC_007",
    name: "Dr. Sunita Singh",
    avatarUrl: "https://images.unsplash.com/photo-1594824813637-450f6b439c08?auto=format&fit=crop&q=80&w=256",
    specialization: "Obstetrics & Gynecology",
    qualification: "MBBS, MS (OB-GYN)",
    registrationNumber: "DMC-50218",
    isVerified: true,
    experienceYears: 15,
    languages: ["Hindi", "English", "Haryanvi"],
    consultationFee: 600,
    clinicAddress: "Lajpat Nagar Women's Health Clinic",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 16:00",
    rating: 4.9,
    reviewCount: 162,
    about: "Comprehensive women's health specialist covering antenatal care, PCOS/PCOD, hormonal imbalance, and menopause.",
    recommendationReason: "Empathetic, highly rated women's health consultation."
  },
  {
    id: "DOC_008",
    name: "Dr. Manoj Saini",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256",
    specialization: "Gastroenterology",
    qualification: "MBBS, MD, DM (Gastroenterology)",
    registrationNumber: "DMC-49120",
    isVerified: true,
    experienceYears: 10,
    languages: ["Hindi", "English", "Punjabi"],
    consultationFee: 700,
    clinicAddress: "Karol Bagh Digestive Health, Pusa Road",
    modes: ["video"],
    nextAvailableSlot: "Tomorrow at 14:00",
    rating: 4.7,
    reviewCount: 94,
    about: "Consultant Gastroenterologist treating severe GERD, liver disorders, IBS, and chronic constipation.",
    recommendationReason: "Prompt relief advice for chronic acidity and abdominal discomfort."
  },
  {
    id: "DOC_009",
    name: "Dr. Shalini Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256",
    specialization: "Psychiatry & Behavioral Health",
    qualification: "MBBS, MD (Psychiatry - VMMC)",
    registrationNumber: "DMC-58201",
    isVerified: true,
    experienceYears: 13,
    languages: ["Hindi", "English"],
    consultationFee: 900,
    clinicAddress: "Saket Wellness Center, Saket",
    modes: ["video"],
    nextAvailableSlot: "Tomorrow at 16:00",
    rating: 4.9,
    reviewCount: 71,
    about: "Compassionate mental health professional specializing in anxiety, clinical depression, panic disorders, and insomnia.",
    recommendationReason: "Safe, confidential tele-psychiatry sessions."
  },
  {
    id: "DOC_010",
    name: "Dr. Sunil Verma",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256",
    specialization: "ENT (Ear, Nose & Throat)",
    qualification: "MBBS, MS (ENT)",
    registrationNumber: "DMC-38012",
    isVerified: true,
    experienceYears: 8,
    languages: ["Hindi", "English", "Punjabi"],
    consultationFee: 550,
    clinicAddress: "Vasant Kunj ENT Clinic, Sector B",
    modes: ["video", "in_person"],
    nextAvailableSlot: "Today at 18:30",
    rating: 4.5,
    reviewCount: 64,
    about: "Treating recurrent sinusitis, vertigo, allergic rhinitis, tonsillitis, and ear infections.",
    recommendationReason: "Evening slot availability for acute throat or sinus infections."
  }
];

// 3. 30 Sample Caregivers (Medics, Nurses, Attendants)
export const SEED_CAREGIVERS: CaregiverProfile[] = [
  {
    id: "CG_016",
    name: "Ritu Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    categories: ["Post-Surgical Care", "Elderly Assistance", "Wound Dressing", "Vitals Monitoring"],
    qualifications: "GNM Nursing (Delhi Nursing Council Reg #RN-8921)",
    isVerified: true,
    experienceYears: 17,
    languages: ["Hindi", "English"],
    serviceAreas: ["Saket", "Hauz Khas", "Malviya Nagar", "Vasant Kunj"],
    hourlyRate: 450,
    servicesProvided: ["Wound dressing", "Catheter care", "Injection IV/IM", "BP & Sugar check", "Elderly mobility support"],
    servicesNotProvided: ["Independent prescription", "Emergency resuscitation", "ICU intubation"],
    rating: 5.0,
    completedBookingsCount: 384,
    availability: "Available Today (10:00 - 16:00)",
    about: "Empathetic, highly experienced registered nurse with 17 years in tertiary hospitals. Specializes in post-operative wound healing and geriatric care."
  },
  {
    id: "CG_014",
    name: "Ankit Gupta",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    categories: ["Elderly Assistance", "Nursing Procedures", "Nebulization"],
    qualifications: "B.Sc Nursing (Guru Gobind Singh IP University)",
    isVerified: true,
    experienceYears: 6,
    languages: ["Hindi", "Punjabi", "Tamil"],
    serviceAreas: ["Janakpuri", "Tilak Nagar", "Rajouri Garden", "Uttam Nagar"],
    hourlyRate: 400,
    servicesProvided: ["Injection IM/IV", "Nebulization", "BP/Sugar monitoring", "Oral medication administration"],
    servicesNotProvided: ["Surgical procedures", "Prescription alteration"],
    rating: 4.8,
    completedBookingsCount: 192,
    availability: "Available Tomorrow (08:00 - 14:00)",
    about: "Energetic and patient-focused nurse skilled in gentle injection delivery, nebulizer setup, and elderly bed-to-chair transfers."
  },
  {
    id: "CG_026",
    name: "Pawan Das",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    categories: ["Post-Surgical Care", "Bedsore Management", "Catheter Care"],
    qualifications: "GNM Nursing (Reg #RN-6712)",
    isVerified: true,
    experienceYears: 4,
    languages: ["Hindi", "Punjabi", "Tamil"],
    serviceAreas: ["Noida Sec 62", "Noida Sec 18", "Indirapuram"],
    hourlyRate: 350,
    servicesProvided: ["Surgical stitch dressing", "Catheter drainage & care", "Vital signs tracking"],
    servicesNotProvided: ["Emergency invasive lines"],
    rating: 4.9,
    completedBookingsCount: 140,
    availability: "Available Today (16:00 - 21:00)",
    about: "Certified home healthcare nurse specializing in post-orthopedic and abdominal surgery recovery."
  },
  {
    id: "CG_052",
    name: "Divya Rawat",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
    categories: ["Critical Bedside Care", "Elderly Assistance", "Sample Collection"],
    qualifications: "B.Sc Nursing (AIIMS Certified Home Care Partner)",
    isVerified: true,
    experienceYears: 10,
    languages: ["Hindi", "Tamil", "Bhojpuri"],
    serviceAreas: ["Rohini", "Pitampura", "Prashant Vihar"],
    hourlyRate: 500,
    servicesProvided: ["IV Infusion monitoring", "Tracheostomy basic suctioning", "Ryle's tube feeding", "Bedsore prevention"],
    servicesNotProvided: ["Surgical interventions"],
    rating: 5.0,
    completedBookingsCount: 275,
    availability: "Available Today (14:00 - 21:00)",
    about: "Gold medalist nursing graduate with deep ICU bedside experience, now dedicated to high-dependency elderly care at home."
  },
  {
    id: "CG_048",
    name: "Pooja Das",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256",
    categories: ["Elderly Daily Living", "Dementia Support", "Post-Discharge"],
    qualifications: "Certified Geriatric Care Assistant (NSDC Level 4)",
    isVerified: true,
    experienceYears: 5,
    languages: ["Hindi", "Bhojpuri", "Punjabi"],
    serviceAreas: ["Govindpuri", "Kalkaji", "Alaknanda", "Greater Kailash"],
    hourlyRate: 300,
    servicesProvided: ["Assisted bathing & grooming", "Mobility & walking companion", "Meal feeding assistance", "Medication reminder"],
    servicesNotProvided: ["Injections", "IV Cannulation"],
    rating: 4.7,
    completedBookingsCount: 112,
    availability: "Available Today (09:00 - 15:00)",
    about: "Dedicated senior companion trained in gentle dementia communication, hygiene maintenance, and fall prevention."
  }
];

// 4. Sample Caregiver Reviews
export const SEED_CAREGIVER_REVIEWS: CaregiverReview[] = [
  {
    id: "REV_001",
    caregiverId: "CG_016",
    patientName: "Vikram Malhotra",
    rating: 5,
    reviewText: "Sister Ritu was an absolute blessing for my mother after her knee replacement. Extremely gentle with the dressing and monitored BP twice daily.",
    serviceCategory: "Post-Surgical Care",
    date: "12 Oct 2026",
    verifiedBooking: true
  },
  {
    id: "REV_002",
    caregiverId: "CG_016",
    patientName: "Sunita Kapoor",
    rating: 5,
    reviewText: "Punctual, hygienic, and very polite. Handled catheter replacement with great professionalism without causing my father any pain.",
    serviceCategory: "Wound Dressing",
    date: "18 Oct 2026",
    verifiedBooking: true
  },
  {
    id: "REV_003",
    caregiverId: "CG_014",
    patientName: "Arun Mehra",
    rating: 5,
    reviewText: "Ankit arrived within 30 minutes of our request. My grandfather was feeling weak; he checked his blood sugar and administered the prescribed insulin smoothly.",
    serviceCategory: "Nursing Procedures",
    date: "20 Oct 2026",
    verifiedBooking: true
  },
  {
    id: "REV_004",
    caregiverId: "CG_026",
    patientName: "Neha Aggarwal",
    rating: 5,
    reviewText: "Superb sterile technique during wound dressing. Explained every step clearly to my mother in Hindi.",
    serviceCategory: "Bedsore Management",
    date: "22 Oct 2026",
    verifiedBooking: true
  }
];

// 5. 10 Sample Delhi NCR Pharmacies
export const SEED_PHARMACIES: Pharmacy[] = [
  {
    id: "PHARM_001",
    name: "Apollo Pharmacy - Saket",
    address: "Shop 4, Community Center, Saket, New Delhi",
    area: "Saket",
    phone: "+91 11 2685 1029",
    openingHours: "Open 24/7",
    deliveryAvailable: true,
    isVerified: true,
    distanceKm: 1.2
  },
  {
    id: "PHARM_002",
    name: "MedPlus Chemist - Hauz Khas",
    address: "A-12, Green Park Main, Near Hauz Khas Metro",
    area: "Hauz Khas",
    phone: "+91 11 2656 4412",
    openingHours: "08:00 AM - 11:00 PM",
    deliveryAvailable: true,
    isVerified: true,
    distanceKm: 2.8
  },
  {
    id: "PHARM_003",
    name: "Guardian Pharmacy - Connaught Place",
    address: "Block B, Inner Circle, Connaught Place, New Delhi",
    area: "Connaught Place",
    phone: "+91 11 4151 7780",
    openingHours: "09:00 AM - 10:00 PM",
    deliveryAvailable: true,
    isVerified: true,
    distanceKm: 4.5
  },
  {
    id: "PHARM_004",
    name: "Fortis Healthworld - Vasant Kunj",
    address: "Pocket 1, Sector B, Vasant Kunj",
    area: "Vasant Kunj",
    phone: "+91 11 4277 6222",
    openingHours: "Open 24/7",
    deliveryAvailable: true,
    isVerified: true,
    distanceKm: 3.9
  },
  {
    id: "PHARM_005",
    name: "Wellness Forever - Noida Sector 18",
    address: "Atta Market, Sector 18, Noida",
    area: "Noida Sec 18",
    phone: "+91 120 422 1900",
    openingHours: "Open 24/7",
    deliveryAvailable: true,
    isVerified: true,
    distanceKm: 6.1
  }
];

// 6. 50+ Sample Medicines Catalogue
export const SEED_MEDICINES: Medicine[] = [
  // Analgesics / Antipyretics
  {
    id: "MED_001",
    name: "Dolo 650 Tablet",
    genericName: "Paracetamol 650mg",
    brand: "Micro Labs",
    category: "Analgesics",
    strength: "650mg",
    dosageForm: "Tablet",
    packSize: "Strip of 15 tablets",
    price: 32,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "For relief of fever and mild to moderate pain. Take 1 tablet every 6 hours if needed."
  },
  {
    id: "MED_002",
    name: "Crocin Advance 500mg",
    genericName: "Paracetamol Fast Release 500mg",
    brand: "GSK",
    category: "Analgesics",
    strength: "500mg",
    dosageForm: "Tablet",
    packSize: "Strip of 20 tablets",
    price: 30,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "General headache and body ache relief."
  },
  {
    id: "MED_003",
    name: "Combiflam Tablet",
    genericName: "Ibuprofen 400mg + Paracetamol 325mg",
    brand: "Sanofi India",
    category: "Analgesics",
    strength: "400mg + 325mg",
    dosageForm: "Tablet",
    packSize: "Strip of 20 tablets",
    price: 48,
    inStock: true,
    pharmacyId: "PHARM_002",
    pharmacyName: "MedPlus Chemist - Hauz Khas",
    requiresPrescription: true,
    usageInstructions: "For inflammatory muscular pain or joint swelling. Take strictly after meals."
  },

  // Gastrointestinal / Acidity
  {
    id: "MED_004",
    name: "Pan 40 Tablet",
    genericName: "Pantoprazole Gastro-Resistant 40mg",
    brand: "Alkem Laboratories",
    category: "Gastrointestinal",
    strength: "40mg",
    dosageForm: "Tablet",
    packSize: "Strip of 15 tablets",
    price: 155,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Take 1 tablet in the morning 30 minutes before breakfast."
  },
  {
    id: "MED_005",
    name: "Gelusil MPS Antacid Liquid",
    genericName: "Aluminium Hydroxide + Dimethicone",
    brand: "Pfizer",
    category: "Gastrointestinal",
    strength: "200ml",
    dosageForm: "Syrup",
    packSize: "200ml Bottle",
    price: 135,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Instant soothing relief from heartburn, acidity, and gas."
  },
  {
    id: "MED_006",
    name: "Omez 20 Capsule",
    genericName: "Omeprazole 20mg",
    brand: "Dr. Reddy's",
    category: "Gastrointestinal",
    strength: "20mg",
    dosageForm: "Capsule",
    packSize: "Strip of 20 capsules",
    price: 98,
    inStock: true,
    pharmacyId: "PHARM_002",
    pharmacyName: "MedPlus Chemist - Hauz Khas",
    requiresPrescription: true,
    usageInstructions: "For acid reflux and peptic ulcer relief."
  },

  // Diabetes & Metabolic
  {
    id: "MED_007",
    name: "Glycomet-GP 1 Tablet",
    genericName: "Glimepiride 1mg + Metformin 500mg",
    brand: "USV Ltd",
    category: "Diabetes",
    strength: "1mg + 500mg",
    dosageForm: "Tablet",
    packSize: "Strip of 15 tablets",
    price: 120,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Anti-diabetic medicine. Take with first main meal of the day."
  },
  {
    id: "MED_008",
    name: "Human Mixtard 30/70 100IU/ml",
    genericName: "Biphasic Isophane Insulin Injection",
    brand: "Novo Nordisk",
    category: "Diabetes",
    strength: "100 IU/ml (10ml)",
    dosageForm: "Injection",
    packSize: "10ml Vial",
    price: 198,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Inject subcutaneously as prescribed by doctor before meals. Store in refrigerator."
  },

  // Cardiovascular & BP
  {
    id: "MED_009",
    name: "Telma 40 Tablet",
    genericName: "Telmisartan 40mg",
    brand: "Glenmark Pharmaceuticals",
    category: "Cardiovascular",
    strength: "40mg",
    dosageForm: "Tablet",
    packSize: "Strip of 30 tablets",
    price: 245,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "For management of hypertension. Take once daily at fixed time."
  },
  {
    id: "MED_010",
    name: "Ecosprin 75 Tablet",
    genericName: "Aspirin Enteric Coated 75mg",
    brand: "USV Ltd",
    category: "Cardiovascular",
    strength: "75mg",
    dosageForm: "Tablet",
    packSize: "Strip of 14 tablets",
    price: 12,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Cardio-protective blood thinner. Take after meals."
  },

  // Antibiotics & Anti-infectives
  {
    id: "MED_011",
    name: "Augmentin 625 Duo Tablet",
    genericName: "Amoxicillin 500mg + Potassium Clavulanate 125mg",
    brand: "GSK",
    category: "Antibiotics",
    strength: "625mg",
    dosageForm: "Tablet",
    packSize: "Strip of 10 tablets",
    price: 215,
    inStock: true,
    pharmacyId: "PHARM_002",
    pharmacyName: "MedPlus Chemist - Hauz Khas",
    requiresPrescription: true,
    usageInstructions: "Broad-spectrum antibacterial. Complete full course as prescribed."
  },
  {
    id: "MED_012",
    name: "Azithral 500 Tablet",
    genericName: "Azithromycin 500mg",
    brand: "Alembic Pharmaceuticals",
    category: "Antibiotics",
    strength: "500mg",
    dosageForm: "Tablet",
    packSize: "Strip of 5 tablets",
    price: 130,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Take 1 tablet daily 1 hour before food for 3 or 5 days."
  },

  // Respiratory & Cough
  {
    id: "MED_013",
    name: "Benadryl Cough Formula",
    genericName: "Diphenhydramine + Ammonium Chloride",
    brand: "Johnson & Johnson",
    category: "Respiratory",
    strength: "100ml",
    dosageForm: "Syrup",
    packSize: "100ml Bottle",
    price: 110,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Soothing relief from dry irritating cough. Take 5ml at bedtime."
  },
  {
    id: "MED_014",
    name: "Asthalin 100mcg Inhaler",
    genericName: "Salbutamol Inhaler 100mcg",
    brand: "Cipla",
    category: "Respiratory",
    strength: "100mcg (200 doses)",
    dosageForm: "Inhaler",
    packSize: "1 Inhaler",
    price: 155,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: true,
    usageInstructions: "Bronchodilator for rapid relief from shortness of breath and wheezing."
  },

  // First Aid & Wound Supplies
  {
    id: "MED_015",
    name: "Betadine 10% Solution",
    genericName: "Povidone Iodine 10% w/v",
    brand: "Win-Medicare",
    category: "First Aid",
    strength: "100ml",
    dosageForm: "Ointment",
    packSize: "100ml Bottle",
    price: 140,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Antiseptic solution for sterile dressing of cuts, surgical wounds, and burns."
  },
  {
    id: "MED_016",
    name: "Sterile Gauze Bandage Rolls (Pack of 10)",
    genericName: "Cotton Sterile Gauze 10cm x 4m",
    brand: "Dettol Health",
    category: "First Aid",
    strength: "10cm x 4m",
    dosageForm: "Ointment",
    packSize: "Pack of 10",
    price: 120,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Clean wound coverage and dressing retention."
  },

  // Vitamins & Nutrients
  {
    id: "MED_017",
    name: "Becosules Performance Capsule",
    genericName: "B-Complex + Vitamin C + Zinc",
    brand: "Pfizer",
    category: "Vitamins",
    strength: "Daily Formula",
    dosageForm: "Capsule",
    packSize: "Strip of 30 capsules",
    price: 185,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Nutritional supplement for recovery, mouth ulcers, and physical fatigue."
  },
  {
    id: "MED_018",
    name: "Shelcal 500 Tablet",
    genericName: "Calcium 500mg + Vitamin D3 250IU",
    brand: "Torrent Pharmaceuticals",
    category: "Vitamins",
    strength: "500mg + 250IU",
    dosageForm: "Tablet",
    packSize: "Strip of 15 tablets",
    price: 132,
    inStock: true,
    pharmacyId: "PHARM_001",
    pharmacyName: "Apollo Pharmacy - Saket",
    requiresPrescription: false,
    usageInstructions: "Bone health and calcium supplement. Take 1 tablet daily after food."
  }
];

// 7. Sample Appointments
export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "APT_101",
    patientId: "PAT_001",
    patientName: "Ramesh Sharma",
    doctorId: "DOC_001",
    doctorName: "Dr. Rekha Gupta",
    specialization: "General Physician",
    dateTime: "Today, 15:30",
    mode: "video",
    fee: 500,
    status: "Upcoming",
    roomUrl: "/consultation/room/APT_101",
    symptomSummary: "Follow-up for mild blood pressure elevation and seasonal allergy."
  },
  {
    id: "APT_102",
    patientId: "PAT_001",
    patientName: "Ramesh Sharma",
    doctorId: "DOC_002",
    doctorName: "Dr. Pawan Singh",
    specialization: "Cardiology",
    dateTime: "15 Oct 2026, 11:00",
    mode: "video",
    fee: 800,
    status: "Completed",
    roomUrl: "/consultation/room/APT_102",
    symptomSummary: "Routine annual cardiac wellness checkup."
  }
];

// 8. Sample Doctor-Issued Digital Prescriptions
export const SEED_PRESCRIPTIONS: DigitalPrescription[] = [
  {
    id: "RX_2026_0942",
    consultationId: "APT_102",
    patientId: "PAT_001",
    patientName: "Ramesh Sharma",
    patientAge: 58,
    patientGender: "M",
    doctorId: "DOC_001",
    doctorName: "Dr. Rekha Gupta",
    doctorQualification: "MBBS, MD (Internal Medicine)",
    doctorRegistrationNumber: "DMC-48291",
    consultationDate: "15 Oct 2026",
    clinicalNotes: "Patient evaluated via teleconsultation for mild seasonal cough and intermittent acidity. Chest clear, vitals stable. Advised light meals and medication course.",
    medications: [
      {
        medicationName: "Pan 40 Tablet",
        strength: "40mg",
        dosage: "1 Tablet",
        frequency: "1-0-0 (Before Breakfast)",
        duration: "14 Days",
        quantity: 14,
        specialInstructions: "Take on empty stomach with warm water."
      },
      {
        medicationName: "Benadryl Cough Formula",
        strength: "100ml",
        dosage: "10ml",
        frequency: "0-0-1 (Bedtime)",
        duration: "5 Days",
        quantity: 1,
        specialInstructions: "May cause mild drowsiness; avoid driving after taking."
      },
      {
        medicationName: "Dolo 650 Tablet",
        strength: "650mg",
        dosage: "1 Tablet",
        frequency: "SOS (As Needed for Fever/Body ache)",
        duration: "5 Days",
        quantity: 10,
        specialInstructions: "Do not exceed 3 tablets in 24 hours."
      }
    ],
    allergiesNoted: ["Penicillin (mild rash)"],
    followUpAdvice: "Review in 2 weeks if cough persists or earlier if fever exceeds 101°F.",
    isAuthorized: true,
    digitalSignature: "SHA256:d8a9e102f3bc8890ac38148e-RekhaGupta-Verified",
    status: "Active"
  }
];

// 9. Sample Patient Medical Records
export const SEED_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "REC_001",
    patientId: "PAT_001",
    title: "Complete Blood Count (CBC) & Lipid Profile",
    type: "Lab Report",
    date: "14 Oct 2026",
    doctorOrLab: "Dr. Lal PathLabs - Saket",
    summary: "Hemoglobin 14.2 g/dL (Normal). Fasting Blood Sugar 104 mg/dL. Total Cholesterol 188 mg/dL. All parameters within normal reference bounds.",
    fileSize: "1.4 MB",
    isPatientReported: false,
    downloadable: true
  },
  {
    id: "REC_002",
    patientId: "PAT_001",
    title: "Teleconsultation Assessment Summary",
    type: "Consultation Summary",
    date: "15 Oct 2026",
    doctorOrLab: "Dr. Rekha Gupta, MBBS, MD",
    summary: "Routine health review. Prescription issued for mild GERD and nocturnal cough. Blood pressure reading 128/82 mmHg.",
    fileSize: "820 KB",
    isPatientReported: false,
    downloadable: true
  },
  {
    id: "REC_003",
    patientId: "PAT_001",
    title: "Prior Knee X-Ray (Left Lateral View)",
    type: "Procedure",
    date: "04 Aug 2026",
    doctorOrLab: "Max Smart Super Speciality Hospital",
    summary: "Mild degenerative changes consistent with age-related osteoarthritis. Joint space preserved.",
    fileSize: "3.2 MB",
    isPatientReported: true,
    downloadable: true
  }
];

// 10. Sample Pharmacy Orders
export const SEED_ORDERS: Order[] = [
  {
    id: "ORD_78129",
    patientId: "PAT_001",
    patientName: "Ramesh Sharma",
    pharmacyName: "Apollo Pharmacy - Saket",
    items: [
      { medicineName: "Dolo 650 Tablet", quantity: 2, price: 32, requiresPrescription: false },
      { medicineName: "Gelusil MPS Liquid", quantity: 1, price: 135, requiresPrescription: false },
      { medicineName: "Pan 40 Tablet", quantity: 1, price: 155, requiresPrescription: true }
    ],
    subtotal: 354,
    deliveryFee: 40,
    total: 394,
    deliveryAddress: "Flat 402, Sector 18, Noida, Delhi NCR",
    status: "Delivered",
    createdAt: "18 Oct 2026, 14:20",
    hasVerifiedPrescription: true
  }
];

// 11. In-App Notifications
export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "NOTIF_001",
    userId: "PAT_001",
    title: "Upcoming Video Consultation",
    message: "Your appointment with Dr. Rekha Gupta begins in 30 minutes. Click to join waiting room.",
    timestamp: "10 mins ago",
    type: "appointment",
    read: false,
    actionUrl: "/consultation"
  },
  {
    id: "NOTIF_002",
    userId: "PAT_001",
    title: "Digital Prescription Issued",
    message: "Dr. Rekha Gupta has issued digital prescription #RX_2026_0942. Ready to download or order.",
    timestamp: "2 hours ago",
    type: "prescription",
    read: false,
    actionUrl: "/prescriptions"
  },
  {
    id: "NOTIF_003",
    userId: "PAT_001",
    title: "Pharmacy Order Delivered",
    message: "Order #ORD_78129 has been safely delivered to your address.",
    timestamp: "Yesterday",
    type: "order",
    read: true,
    actionUrl: "/medicines"
  }
];

// 12. Security Audit Logs
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD_101",
    timestamp: "24 Oct 2026, 09:15:20",
    userId: "DOC_001",
    action: "ISSUE_PRESCRIPTION",
    resource: "RX_2026_0942",
    details: "Authorized digital prescription for Patient PAT_001 (Ramesh Sharma)"
  },
  {
    id: "AUD_102",
    timestamp: "24 Oct 2026, 09:12:00",
    userId: "DOC_001",
    action: "CONSULTATION_START",
    resource: "APT_101",
    details: "Started encrypted video consultation session"
  },
  {
    id: "AUD_103",
    timestamp: "24 Oct 2026, 08:30:11",
    userId: "PAT_001",
    action: "ORDER_CHECKOUT",
    resource: "ORD_78129",
    details: "Verified prescription attached and order placed with Apollo Pharmacy Saket"
  }
];
