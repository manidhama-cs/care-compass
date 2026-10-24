import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  UserCheck,
  CheckCircle,
  Plus,
  Activity,
  Award,
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { downloadPrescriptionPdf, downloadConsultationSummaryPdf } from '../../services/pdfGenerator.ts';
import { DigitalPrescription, PrescriptionItem } from '../../types/platform.ts';

interface DoctorDashboardProps {
  onNavigate: (tab: any) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate }) => {
  const state = platformStore.getState();
  const { currentUser, appointments, prescriptions, activeConsultation } = state;

  // New Prescription Form Modal State
  const [showRxModal, setShowRxModal] = useState(false);
  const [patientName, setPatientName] = useState('Ramesh Sharma');
  const [patientAge, setPatientAge] = useState(58);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Other'>('M');
  const [clinicalNotes, setClinicalNotes] = useState('Patient presented with mild seasonal cough and intermittent gastric reflux. Chest clear, vitals normal.');
  const [followUpAdvice, setFollowUpAdvice] = useState('Review in 14 days if symptoms persist. Avoid spicy and late-night food.');
  const [medications, setMedications] = useState<PrescriptionItem[]>([
    {
      medicationName: 'Pan 40 Tablet',
      strength: '40mg',
      dosage: '1 Tablet',
      frequency: '1-0-0 (Before Breakfast)',
      duration: '14 Days',
      quantity: 14,
      specialInstructions: 'Take on empty stomach with warm water'
    },
    {
      medicationName: 'Dolo 650 Tablet',
      strength: '650mg',
      dosage: '1 Tablet',
      frequency: 'SOS (As needed)',
      duration: '5 Days',
      quantity: 10,
      specialInstructions: 'Take after meals for fever or body ache'
    }
  ]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        medicationName: 'Benadryl Cough Syrup',
        strength: '100ml',
        dosage: '10ml',
        frequency: '0-0-1 (Bedtime)',
        duration: '5 Days',
        quantity: 1,
        specialInstructions: 'Take before sleep'
      }
    ]);
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx = platformStore.issuePrescription({
      patientId: 'PAT_001',
      patientName,
      patientAge,
      patientGender,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorQualification: 'MBBS, MD (Internal Medicine - AIIMS Delhi)',
      doctorRegistrationNumber: 'DMC-48291',
      clinicalNotes,
      medications,
      allergiesNoted: ['Penicillin'],
      followUpAdvice
    });

    setShowRxModal(false);
    downloadPrescriptionPdf(newRx);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Doctor Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Verified Clinician License: DMC-48291 (Medical Council of India)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentUser.name} · Clinician Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Senior Physician · Internal Medicine & Geriatric Triage · Max Smart Hospital, Delhi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowRxModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Prescription</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Schedule</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">4 Consults</div>
          <span className="text-[11px] text-teal-600 font-medium">1 In Progress · 3 Upcoming</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescriptions Issued</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{prescriptions.length} Active</div>
          <span className="text-[11px] text-emerald-600 font-medium">Digitally Signed & Validated</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Rating</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">4.9 ★</div>
          <span className="text-[11px] text-amber-600 font-medium">142 Verified Patient Reviews</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹500</div>
          <span className="text-[11px] text-slate-400 font-medium">Transparent Telehealth Rate</span>
        </div>
      </div>

      {/* Main Split: Today's Schedule & Patient Waiting Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Appointments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Today's Patient Schedule
              </span>
              <span className="text-xs text-slate-400 font-medium">24 Oct 2026</span>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apt.patientName}</h4>
                      <p className="text-xs text-slate-500">{apt.symptomSummary || 'General consultation'}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.dateTime}</span>
                        <span>·</span>
                        <span className="uppercase">{apt.mode} Call</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('consultation')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Video Consult</span>
                    </button>
                    <button
                      onClick={() => setShowRxModal(true)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Issue Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions Issued by this Doctor */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Issued Digital Prescriptions
              </span>
              <button
                onClick={() => setShowRxModal(true)}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                + Create New
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Rx #{rx.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Authorized</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Patient: {rx.patientName} ({rx.patientAge}y) · {rx.consultationDate}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Medications: {rx.medications.map(m => m.medicationName).join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadPrescriptionPdf(rx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Doctor Clinical Guidelines & Verification Badge */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Telemedicine Clinical Protocol
            </h3>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900 text-xs text-teal-950 dark:text-teal-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Telemedicine Practice Guidelines 2026:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Verify patient identity and emergency exclusion before proceeding.</li>
                <li>Digital signatures must be cryptographically hashed for audit compliance.</li>
                <li>List exact strength, dosage frequency, and duration for all prescribed medications.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              Logged in as: <strong>Dr. Rekha Gupta</strong> (DMC-48291).
            </div>
          </div>
        </div>
      </div>

      {/* Digital Prescription Issuance Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Issue Digital Prescription (Rx)
                </h3>
                <p className="text-xs text-slate-500">
                  Doctor: {currentUser.name} (Reg #DMC-48291)
                </p>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleIssuePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Notes & Assessment</label>
                <textarea
                  rows={2}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              {/* Medication Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Prescribed Medications ({medications.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    + Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {medications.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 grid grid-cols-4 gap-2">
                      <div className="col-span-2 font-bold text-slate-900 dark:text-white">
                        {med.medicationName} ({med.strength})
                      </div>
                      <div className="text-teal-600 font-semibold">{med.frequency}</div>
                      <div className="text-slate-500 text-right">{med.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Follow-up Advice & Precautions</label>
                <input
                  type="text"
                  required
                  value={followUpAdvice}
                  onChange={(e) => setFollowUpAdvice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Authorize & Issue PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
