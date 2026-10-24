/**
 * CareCompass Clinical PDF Report Generator
 * Generates professional, print-ready A4 healthcare documents:
 * 1. Doctor-Issued Digital Prescriptions
 * 2. Consultation Assessment Summaries
 * 3. Comprehensive Patient Health Records
 */

import { jsPDF } from 'jspdf';
import { DigitalPrescription, ConsultationSession, Appointment, UserProfile, MedicalRecord } from '../types/platform.ts';

export function downloadPrescriptionPdf(prescription: DigitalPrescription): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CareCompass Telehealth Network', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Digital Healthcare Platform · Verified Medical Consultation', 14, 18);
  doc.text(`Prescription ID: ${prescription.id}`, pageWidth - 14, 18, { align: 'right' });

  // Doctor Details Section (Left Top)
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(prescription.doctorName, 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(prescription.doctorQualification, 14, 43);
  doc.text(`Reg. No: ${prescription.doctorRegistrationNumber}`, 14, 48);

  // Patient Details Section (Right Box)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(pageWidth - 95, 32, 81, 24, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT DEMOGRAPHICS', pageWidth - 90, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Name: ${prescription.patientName} (${prescription.patientGender}, ${prescription.patientAge}y)`, pageWidth - 90, 42);
  doc.text(`Date: ${prescription.consultationDate}`, pageWidth - 90, 47);
  doc.text(`Status: Authorized & Signed`, pageWidth - 90, 52);

  // Line Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 59, pageWidth - 14, 59);

  // Clinical Diagnosis / Assessment Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CLINICAL ASSESSMENT & NOTES', 14, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitNotes = doc.splitTextToSize(prescription.clinicalNotes, pageWidth - 28);
  doc.text(splitNotes, 14, 71);

  let currentY = 73 + splitNotes.length * 4.5;

  // Known Allergies Warning Box
  if (prescription.allergiesNoted && prescription.allergiesNoted.length > 0) {
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, currentY, pageWidth - 28, 8, 1, 1, 'FD');
    doc.setTextColor(185, 28, 28); // red-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Documented Patient Allergies: ${prescription.allergiesNoted.join(', ')}`, 18, currentY + 5.5);
    currentY += 13;
  } else {
    currentY += 6;
  }

  // Prescription Rx Header
  doc.setTextColor(13, 148, 136); // teal-600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Rx', 14, currentY);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('PRESCRIBED MEDICATIONS', 24, currentY - 1);
  currentY += 6;

  // Medications Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('#', 17, currentY + 5);
  doc.text('MEDICINE & STRENGTH', 25, currentY + 5);
  doc.text('FREQUENCY / DOSAGE', 95, currentY + 5);
  doc.text('DURATION', 145, currentY + 5);
  doc.text('QTY', 178, currentY + 5);
  currentY += 8;

  // Medications Table Rows
  prescription.medications.forEach((med, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}.`, 17, currentY + 4);
    doc.text(`${med.medicationName} (${med.strength})`, 25, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(med.frequency, 95, currentY + 4);
    doc.text(med.duration, 145, currentY + 4);
    doc.text(med.quantity.toString(), 180, currentY + 4);

    // Special Instructions
    if (med.specialInstructions) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Instruction: ${med.specialInstructions}`, 25, currentY + 8);
      currentY += 12;
    } else {
      currentY += 8;
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY - 1, pageWidth - 14, currentY - 1);
  });

  currentY += 6;

  // Follow-up Advice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FOLLOW-UP & GENERAL PRECAUTIONS:', 14, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitAdvice = doc.splitTextToSize(prescription.followUpAdvice, pageWidth - 28);
  doc.text(splitAdvice, 14, currentY);

  // Digital Signature Block at Bottom
  const sigY = 245;
  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth - 75, sigY, pageWidth - 14, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(prescription.doctorName, pageWidth - 75, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Clinician Digital Signature', pageWidth - 75, sigY + 9);
  doc.text(prescription.digitalSignature, pageWidth - 75, sigY + 13);

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an authenticated teleconsultation prescription issued via CareCompass. Generated for demonstration purposes.', 14, 285);
  doc.text(`Verification Hash: ${prescription.id}-${prescription.doctorRegistrationNumber}`, pageWidth - 14, 285, { align: 'right' });

  // Save / Trigger Download
  doc.save(`Prescription_${prescription.id}.pdf`);
}

export function downloadConsultationSummaryPdf(session: ConsultationSession, appointment?: Appointment): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const refId = appointment?.id || session.appointmentId;
  const docName = appointment?.doctorName || session.doctorName;
  const spec = appointment?.specialization || session.specialization;
  const patName = appointment?.patientName || session.patientName;
  const dateTime = appointment?.dateTime || session.dateTime;
  const mode = appointment?.mode ? appointment.mode.toUpperCase() : 'VIDEO TELECONSULT';

  // Header Banner
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CareCompass Consultation Summary', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Telehealth Video Consultation Session Report', 14, 18);
  doc.text(`Session Ref: ${refId}`, pageWidth - 14, 18, { align: 'right' });

  // Details Grid
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONSULTATION PARTICIPANTS', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Doctor: ${docName} (${spec})`, 14, 44);
  doc.text(`Patient: ${patName}`, 14, 49);
  doc.text(`Consultation Time: ${dateTime}`, 14, 54);
  doc.text(`Consultation Mode: ${mode}`, 14, 59);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 65, pageWidth - 14, 65);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLINICAL SUMMARY & OBSERVATIONS', 14, 73);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryNotes = doc.splitTextToSize(session.clinicalNotes || appointment?.symptomSummary || 'Patient consultation completed satisfactorily. Clinical observations and routine health advice provided.', pageWidth - 28);
  doc.text(summaryNotes, 14, 80);

  let currentY = 85 + summaryNotes.length * 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONSULTATION CHAT TRANSCRIPT', 14, currentY);
  currentY += 6;

  if (session.messages && session.messages.length > 0) {
    session.messages.forEach(msg => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(msg.senderRole === 'doctor' ? 13 : 30, msg.senderRole === 'doctor' ? 148 : 41, msg.senderRole === 'doctor' ? 136 : 59);
      doc.text(`[${msg.timestamp}] ${msg.senderName}:`, 14, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitMsg = doc.splitTextToSize(msg.text, pageWidth - 60);
      doc.text(splitMsg, 45, currentY);
      currentY += Math.max(5, splitMsg.length * 4);
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text('Direct live audio-video consultation session conducted.', 14, currentY);
    currentY += 8;
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('CareCompass Telehealth Clinical Summary · Electronic Health Record Document', 14, 285);

  doc.save(`Consultation_Summary_${refId}.pdf`);
}

export function downloadPatientHealthRecordPdf(user: UserProfile, records: MedicalRecord[], prescriptions?: DigitalPrescription[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CareCompass Patient Health Dossier', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated for ${user.name} (${user.id})`, 14, 18);
  doc.text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }), pageWidth - 14, 18, { align: 'right' });

  // Medical Records Table
  let y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DOCUMENTED CLINICAL RECORDS & LAB REPORTS', 14, y);
  y += 7;

  records.forEach((rec, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`${idx + 1}. ${rec.title} (${rec.type})`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${rec.doctorOrLab} · ${rec.date}`, 14, y + 4);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(rec.summary, pageWidth - 28);
    doc.text(splitSummary, 14, y + 8);

    y += 11 + splitSummary.length * 4;
  });

  doc.save(`Health_Record_Summary_${user.id}.pdf`);
}
