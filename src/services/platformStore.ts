/**
 * CareCompass Platform State Store & LocalStorage Persistence Manager
 * Provides unified, reactive state for multi-role workflows.
 */

import {
  UserProfile,
  UserRole,
  Doctor,
  CaregiverProfile,
  CaregiverReview,
  Pharmacy,
  Medicine,
  CartItem,
  Order,
  Appointment,
  ConsultationSession,
  DigitalPrescription,
  MedicalRecord,
  NotificationItem,
  AuditLogEntry
} from '../types/platform.ts';

import {
  DEMO_USERS,
  SEED_DOCTORS,
  SEED_CAREGIVERS,
  SEED_CAREGIVER_REVIEWS,
  SEED_PHARMACIES,
  SEED_MEDICINES,
  SEED_APPOINTMENTS,
  SEED_PRESCRIPTIONS,
  SEED_MEDICAL_RECORDS,
  SEED_ORDERS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from '../data/seedData.ts';

export interface PlatformState {
  currentRole: UserRole;
  currentUser: UserProfile;
  doctors: Doctor[];
  caregivers: CaregiverProfile[];
  caregiverReviews: CaregiverReview[];
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  cart: CartItem[];
  orders: Order[];
  appointments: Appointment[];
  activeConsultation: ConsultationSession | null;
  prescriptions: DigitalPrescription[];
  medicalRecords: MedicalRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = 'carecompass_platform_v2_store';

function loadInitialState(): PlatformState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored state, falling back to seed', e);
    }
  }

  return {
    currentRole: 'patient',
    currentUser: DEMO_USERS.patient,
    doctors: SEED_DOCTORS,
    caregivers: SEED_CAREGIVERS,
    caregiverReviews: SEED_CAREGIVER_REVIEWS,
    pharmacies: SEED_PHARMACIES,
    medicines: SEED_MEDICINES,
    cart: [
      { medicine: SEED_MEDICINES[0], quantity: 1 },
      { medicine: SEED_MEDICINES[3], quantity: 1 }
    ],
    orders: SEED_ORDERS,
    appointments: SEED_APPOINTMENTS,
    activeConsultation: {
      appointmentId: 'APT_101',
      doctorId: 'DOC_001',
      patientId: 'PAT_001',
      doctorName: 'Dr. Rekha Gupta',
      patientName: 'Ramesh Sharma',
      specialization: 'General Physician',
      dateTime: 'Today, 15:30',
      status: 'scheduled',
      messages: [
        { id: 'M1', senderRole: 'doctor', senderName: 'Dr. Rekha Gupta', text: 'Namaste Ramesh ji. I am reviewing your blood pressure records.', timestamp: '15:30' },
        { id: 'M2', senderRole: 'patient', senderName: 'Ramesh Sharma', text: 'Doctor sahiba, I have had a slight dry cough since yesterday as well.', timestamp: '15:31' }
      ],
      clinicalNotes: 'Follow-up for mild blood pressure elevation and seasonal allergy cough.',
      diagnosisSuggestion: 'Mild GERD with post-nasal allergic drip.'
    },
    prescriptions: SEED_PRESCRIPTIONS,
    medicalRecords: SEED_MEDICAL_RECORDS,
    notifications: SEED_NOTIFICATIONS,
    auditLogs: SEED_AUDIT_LOGS
  };
}

// Global Store Singleton
class StoreManager {
  private state: PlatformState = loadInitialState();
  private listeners: Set<() => void> = new Set();

  public getState(): PlatformState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Could not save state to localStorage', e);
      }
    }
    this.listeners.forEach(fn => fn());
  }

  // Role Switching
  public switchRole(role: UserRole) {
    this.state.currentRole = role;
    this.state.currentUser = DEMO_USERS[role];
    this.addAuditLog('SWITCH_ROLE', role, `Switched active role to ${role}`);
    this.notify();
  }

  // Doctor Actions
  public bookAppointment(doctorId: string, dateTime: string, mode: 'video' | 'in_person', symptomSummary?: string): Appointment {
    const doc = this.state.doctors.find(d => d.id === doctorId);
    const newApt: Appointment = {
      id: `APT_${Date.now().toString().slice(-5)}`,
      patientId: this.state.currentUser.id,
      patientName: this.state.currentUser.name,
      doctorId,
      doctorName: doc ? doc.name : 'Dr. Specialist',
      specialization: doc ? doc.specialization : 'General Medicine',
      dateTime,
      mode,
      fee: doc ? doc.consultationFee : 500,
      status: 'Upcoming',
      roomUrl: `/consultation/room/APT_${Date.now().toString().slice(-5)}`,
      symptomSummary: symptomSummary || 'Routine medical consult'
    };

    this.state.appointments.unshift(newApt);
    this.addNotification('appointment', 'New Appointment Confirmed', `Your appointment with ${newApt.doctorName} is confirmed for ${dateTime}.`);
    this.addAuditLog('BOOK_APPOINTMENT', newApt.id, `Booked ${mode} appointment with ${newApt.doctorName}`);
    this.notify();
    return newApt;
  }

  public cancelAppointment(appointmentId: string) {
    this.state.appointments = this.state.appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a
    );
    this.addNotification('appointment', 'Appointment Cancelled', `Appointment #${appointmentId} was cancelled.`);
    this.notify();
  }

  public issuePrescription(prescription: Omit<DigitalPrescription, 'id' | 'consultationDate' | 'isAuthorized' | 'digitalSignature' | 'status'>): DigitalPrescription {
    const id = `RX_${new Date().getFullYear()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx: DigitalPrescription = {
      ...prescription,
      id,
      consultationDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      isAuthorized: true,
      digitalSignature: `SHA256:${Date.now().toString(16)}-${prescription.doctorName.replace(/[^a-zA-Z]/g, '')}-VerifiedDoc`,
      status: 'Active'
    };

    this.state.prescriptions.unshift(newRx);
    this.addNotification('prescription', 'Digital Prescription Issued', `Dr. ${prescription.doctorName} has issued prescription #${id}.`);
    this.addAuditLog('ISSUE_PRESCRIPTION', id, `Issued digital prescription to ${prescription.patientName}`);
    this.notify();
    return newRx;
  }

  // Consultation Chat
  public sendConsultationMessage(text: string) {
    if (!this.state.activeConsultation) return;
    const isDoctor = this.state.currentRole === 'doctor';
    const newMsg = {
      id: `M_${Date.now()}`,
      senderRole: isDoctor ? ('doctor' as const) : ('patient' as const),
      senderName: isDoctor ? this.state.activeConsultation.doctorName : this.state.activeConsultation.patientName,
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    this.state.activeConsultation.messages.push(newMsg);
    this.notify();
  }

  public updateConsultationNotes(notes: string) {
    if (this.state.activeConsultation) {
      this.state.activeConsultation.clinicalNotes = notes;
      this.notify();
    }
  }

  // Caregiver Booking & Reviews
  public bookCaregiver(caregiverId: string, hours: number, address: string, date: string) {
    const cg = this.state.caregivers.find(c => c.id === caregiverId);
    if (!cg) return;
    const fee = cg.hourlyRate * hours;
    this.addNotification('appointment', 'Caregiver Booking Confirmed', `${cg.name} booked for ${hours} hours on ${date}. Total fee: ₹${fee}.`);
    this.addAuditLog('BOOK_CAREGIVER', caregiverId, `Booked ${cg.name} for ₹${fee}`);
    this.notify();
  }

  public addCaregiverReview(caregiverId: string, rating: number, reviewText: string, serviceCategory: string) {
    const newReview: CaregiverReview = {
      id: `REV_${Date.now().toString().slice(-5)}`,
      caregiverId,
      patientName: this.state.currentUser.name,
      rating,
      reviewText,
      serviceCategory,
      date: 'Today',
      verifiedBooking: true
    };
    this.state.caregiverReviews.unshift(newReview);

    // Recalculate average rating
    const cgReviews = this.state.caregiverReviews.filter(r => r.caregiverId === caregiverId && !r.isFlagged);
    const avg = cgReviews.reduce((sum, r) => sum + r.rating, 0) / (cgReviews.length || 1);
    this.state.caregivers = this.state.caregivers.map(c =>
      c.id === caregiverId ? { ...c, rating: Number(avg.toFixed(1)), completedBookingsCount: c.completedBookingsCount + 1 } : c
    );

    this.addAuditLog('POST_REVIEW', newReview.id, `Submitted ${rating}★ review for Caregiver ${caregiverId}`);
    this.notify();
  }

  // Pharmacy & Cart
  public addToCart(medicine: Medicine, quantity: number = 1) {
    const existingIndex = this.state.cart.findIndex(i => i.medicine.id === medicine.id);
    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({ medicine, quantity });
    }
    this.notify();
  }

  public updateCartQuantity(medicineId: string, quantity: number) {
    if (quantity <= 0) {
      this.state.cart = this.state.cart.filter(i => i.medicine.id !== medicineId);
    } else {
      const item = this.state.cart.find(i => i.medicine.id === medicineId);
      if (item) item.quantity = quantity;
    }
    this.notify();
  }

  public clearCart() {
    this.state.cart = [];
    this.notify();
  }

  public checkoutOrder(deliveryAddress: string, attachedPrescriptionId?: string): Order {
    const subtotal = this.state.cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
    const deliveryFee = 40;
    const hasRxItem = this.state.cart.some(item => item.medicine.requiresPrescription);

    const newOrder: Order = {
      id: `ORD_${Date.now().toString().slice(-5)}`,
      patientId: this.state.currentUser.id,
      patientName: this.state.currentUser.name,
      pharmacyName: this.state.cart[0]?.medicine.pharmacyName || 'Apollo Pharmacy - Saket',
      items: this.state.cart.map(item => ({
        medicineName: item.medicine.name,
        quantity: item.quantity,
        price: item.medicine.price,
        requiresPrescription: item.medicine.requiresPrescription
      })),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      deliveryAddress,
      status: hasRxItem ? 'Prescription Verified' : 'Order Placed',
      createdAt: 'Today, Just now',
      hasVerifiedPrescription: Boolean(attachedPrescriptionId || !hasRxItem)
    };

    this.state.orders.unshift(newOrder);
    this.state.cart = [];
    this.addNotification('order', 'Order Placed Successfully', `Order #${newOrder.id} confirmed with ${newOrder.pharmacyName}. Total: ₹${newOrder.total}.`);
    this.addAuditLog('CHECKOUT_ORDER', newOrder.id, `Placed medicine order with ${newOrder.items.length} items`);
    this.notify();
    return newOrder;
  }

  // Admin Verification Toggles
  public toggleDoctorVerification(doctorId: string) {
    this.state.doctors = this.state.doctors.map(d =>
      d.id === doctorId ? { ...d, isVerified: !d.isVerified } : d
    );
    this.addAuditLog('TOGGLE_VERIFICATION', doctorId, `Updated doctor verification status`);
    this.notify();
  }

  public toggleCaregiverVerification(caregiverId: string) {
    this.state.caregivers = this.state.caregivers.map(c =>
      c.id === caregiverId ? { ...c, isVerified: !c.isVerified } : c
    );
    this.addAuditLog('TOGGLE_VERIFICATION', caregiverId, `Updated caregiver verification status`);
    this.notify();
  }

  public toggleReviewFlag(reviewId: string) {
    this.state.caregiverReviews = this.state.caregiverReviews.map(r =>
      r.id === reviewId ? { ...r, isFlagged: !r.isFlagged } : r
    );
    this.addAuditLog('FLAG_REVIEW', reviewId, `Toggled review moderation flag`);
    this.notify();
  }

  // Helper logging
  private addNotification(type: NotificationItem['type'], title: string, message: string) {
    this.state.notifications.unshift({
      id: `NOTIF_${Date.now()}`,
      userId: this.state.currentUser.id,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    });
  }

  private addAuditLog(action: string, resource: string, details: string) {
    this.state.auditLogs.unshift({
      id: `AUD_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN'),
      userId: this.state.currentUser.id,
      action,
      resource,
      details
    });
  }

  // Reset to clean seed
  public resetToSeed() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = loadInitialState();
    this.notify();
  }
}

export const platformStore = new StoreManager();
