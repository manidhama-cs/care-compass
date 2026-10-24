import React from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import {
  downloadPrescriptionPdf,
  downloadConsultationSummaryPdf,
  downloadPatientHealthRecordPdf
} from '../../services/pdfGenerator.ts';

export const ReportsView: React.FC = () => {
  const state = platformStore.getState();
  const { prescriptions, activeConsultation, currentUser, medicalRecords } = state;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official Clinical Documents
              </span>
              <span className="text-xs text-slate-500">ISO-Compliant PDF Generation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Digital Prescriptions
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Instantly generate, preview, and download digitally signed clinical reports, prescriptions, and health summaries.
            </p>
          </div>

          <button
            onClick={() => downloadPatientHealthRecordPdf(currentUser, medicalRecords)}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-2 shadow-xs shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Complete Health Dossier
          </button>
        </div>
      </div>

      {/* Section 1: Authorized Digital Prescriptions */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Authorized Digital Prescriptions ({prescriptions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">MCI Telemedicine Practice Compliant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-teal-800 font-bold bg-teal-100/60 px-2 py-0.5 rounded">
                      #{rx.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">
                      Dr. {rx.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {rx.doctorQualification} · Reg: {rx.doctorRegistrationNumber}
                    </p>
                  </div>

                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-700" />
                    Digitally Signed
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">Patient:</span> {rx.patientName} ({rx.patientAge}y / {rx.patientGender})
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date:</span> {rx.consultationDate}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Diagnosis:</span> {rx.clinicalNotes}
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 font-medium">Medications ({rx.medications.length}):</span>
                    <ul className="mt-1 list-disc list-inside text-slate-700 font-medium">
                      {rx.medications.map((m, idx) => (
                        <li key={idx}>
                          {m.medicationName} ({m.strength}) · {m.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                  {rx.digitalSignature}
                </span>
                <button
                  onClick={() => downloadPrescriptionPdf(rx)}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Consultation Summaries */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Clinical Consultation Summaries
            </h3>
          </div>
          <span className="text-xs text-slate-500">Provider & Patient Copies</span>
        </div>

        {activeConsultation ? (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Session #{activeConsultation.appointmentId}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {activeConsultation.doctorName} · {activeConsultation.specialization}
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Consultation regarding: {activeConsultation.clinicalNotes || activeConsultation.diagnosisSuggestion}
              </p>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Patient: {activeConsultation.patientName}</span>
                <span>·</span>
                <span>Time: {activeConsultation.dateTime}</span>
                <span>·</span>
                <span>Messages recorded: {activeConsultation.messages.length}</span>
              </div>
            </div>

            <button
              onClick={() => downloadConsultationSummaryPdf(activeConsultation)}
              className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Clinical Summary PDF
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            No active consultation session found.
          </div>
        )}
      </div>

      {/* Section 3: Legal & Regulatory Framework */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <AlertCircle className="w-4 h-4 text-slate-700" />
          Regulatory Compliance Notice
        </div>
        <p className="leading-relaxed">
          All digital prescriptions and summaries emitted through CareCompass conform to Section 33 of the Indian Medical Council Act, 1956 and the Telemedicine Practice Guidelines issued by the Board of Governors (in supersession of the Medical Council of India) on 25th March 2020. Electronic signatures adhere to Section 5 of the Information Technology Act, 2000.
        </p>
      </div>
    </div>
  );
};
