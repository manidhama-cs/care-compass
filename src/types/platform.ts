/**
 * CareCompass Platform Comprehensive Data Models & Types
 * Roles: Patient, Doctor, Caregiver, Admin
 */

export type UserRole = 'patient' | 'doctor' | 'caregiver' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  locationArea: string;
}

export interface Doctor {
  id: string;
  name: string;
  avatarUrl: string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  isVerified: boolean;
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  clinicAddress: string;
  modes: ('video' | 'in_person')[];
  nextAvailableSlot: string;
  rating: number;
  reviewCount: number;
  about: string;
  rankingScore?: number;
  recommendationReason?: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  avatarUrl: string;
  categories: string[];
  qualifications: string;
  isVerified: boolean;
  experienceYears: number;
  languages: string[];
  serviceAreas: string[];
  hourlyRate: number;
  servicesProvided: string[];
  servicesNotProvided: string[];
  rating: number;
  completedBookingsCount: number;
  availability: string;
  about: string;
}

export interface CaregiverReview {
  id: string;
  caregiverId: string;
  patientName: string;
  rating: number;
  reviewText: string;
  serviceCategory: string;
  date: string;
  verifiedBooking: boolean;
  isFlagged?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  openingHours: string;
  deliveryAvailable: boolean;
  isVerified: boolean;
  distanceKm: number;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: 'Analgesics' | 'Antibiotics' | 'Diabetes' | 'Cardiovascular' | 'Gastrointestinal' | 'Respiratory' | 'Vitamins' | 'First Aid';
  strength: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Ointment' | 'Inhaler';
  packSize: string;
  price: number;
  inStock: boolean;
  pharmacyId: string;
  pharmacyName: string;
  requiresPrescription: boolean;
  imageUrl?: string;
  usageInstructions: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  pharmacyName: string;
  items: {
    medicineName: string;
    quantity: number;
    price: number;
    requiresPrescription: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  status: 'Order Placed' | 'Prescription Verified' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
  hasVerifiedPrescription: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  dateTime: string;
  mode: 'video' | 'in_person';
  fee: number;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  roomUrl: string;
  symptomSummary?: string;
}

export interface ConsultationMessage {
  id: string;
  senderRole: 'doctor' | 'patient';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ConsultationSession {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  specialization: string;
  dateTime: string;
  status: 'scheduled' | 'live' | 'completed';
  messages: ConsultationMessage[];
  clinicalNotes: string;
  diagnosisSuggestion: string;
  issuedPrescriptionId?: string;
}

export interface PrescriptionItem {
  medicationName: string;
  strength: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1 (After Food)"
  duration: string;  // e.g. "5 Days"
  quantity: number;
  specialInstructions: string;
}

export interface DigitalPrescription {
  id: string;
  consultationId?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F' | 'Other';
  doctorId: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegistrationNumber: string;
  consultationDate: string;
  clinicalNotes: string;
  medications: PrescriptionItem[];
  allergiesNoted: string[];
  followUpAdvice: string;
  isAuthorized: boolean;
  digitalSignature: string;
  status: 'Active' | 'Dispensed' | 'Cancelled';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'Prescription' | 'Lab Report' | 'Consultation Summary' | 'Procedure';
  date: string;
  doctorOrLab: string;
  summary: string;
  fileSize?: string;
  isPatientReported: boolean;
  downloadable: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'appointment' | 'prescription' | 'report' | 'order' | 'alert';
  read: boolean;
  actionUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
}
