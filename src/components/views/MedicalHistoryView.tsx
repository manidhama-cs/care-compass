import React, { useState } from 'react';
import {
  FileText,
  Activity,
  Calendar,
  Download,
  Plus,
  AlertCircle,
  Clock,
  Heart,
  Droplet,
  UploadCloud,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { downloadPatientHealthRecordPdf, downloadPrescriptionPdf } from '../../services/pdfGenerator.ts';
import { MedicalRecord } from '../../types/platform.ts';

export const MedicalHistoryView: React.FC = () => {
  const [state, setState] = useState(platformStore.getState());
  const { medicalRecords, currentUser, prescriptions } = state;

  const [activeTab, setActiveTab] = useState<'records' | 'vitals' | 'allergies'>('records');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MedicalRecord['type']>('Lab Report');
  const [newProvider, setNewProvider] = useState('Dr. Lal PathLabs - Green Park');
  const [newSummary, setNewSummary] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setState(platformStore.getState());
    });
  }, []);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecord: MedicalRecord = {
      id: `MED_${Date.now().toString().slice(-4)}`,
      patientId: currentUser.id,
      title: newTitle,
      type: newType,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctorOrLab: newProvider,
      summary: newSummary || 'Self-uploaded clinical report document.',
      fileSize: '1.4 MB PDF',
      isPatientReported: true,
      downloadable: true
    };

    medicalRecords.unshift(newRecord);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setNewTitle('');
      setNewSummary('');
    }, 1500);
  };

  const handleDownload = (rec: MedicalRecord) => {
    if (rec.type === 'Prescription') {
      const rx = prescriptions[0];
      if (rx) {
        downloadPrescriptionPdf(rx);
        return;
      }
    }
    downloadPatientHealthRecordPdf(currentUser, [rec]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Personal Health Record (PHR) Locker
            </span>
            <span className="text-xs text-slate-500">ABHA / NDHM Compliant</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Medical History & Health Records
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete longitudinal clinical record for {currentUser.name} (ABHA: 91-4829-1092-4412).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-2 bg-teal-800 text-white rounded font-medium text-xs flex items-center gap-1.5 hover:bg-teal-900 shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Document
          </button>
          <button
            onClick={() => downloadPatientHealthRecordPdf(currentUser, medicalRecords)}
            className="px-3 py-2 border border-slate-300 text-slate-700 rounded font-medium text-xs flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Full Dossier
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-lg">
        <button
          onClick={() => setActiveTab('records')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-teal-800 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinical Records & Reports ({medicalRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('vitals')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'vitals'
              ? 'border-teal-800 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Biometric Vitals & Log
        </button>
        <button
          onClick={() => setActiveTab('allergies')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'allergies'
              ? 'border-teal-800 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Allergies & Risk Factors
        </button>
      </div>

      {/* Tab 1: Records List */}
      {activeTab === 'records' && (
        <div className="bg-white border border-slate-200 rounded-b-lg divide-y divide-slate-100">
          {medicalRecords.map((rec) => (
            <div key={rec.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-teal-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.type}
                    </span>
                    {rec.isPatientReported && (
                      <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.2 rounded">
                        Self Reported
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{rec.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{rec.doctorOrLab}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.date}
                    </span>
                    {rec.fileSize && (
                      <>
                        <span>·</span>
                        <span>{rec.fileSize}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleDownload(rec)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium rounded flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  PDF Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Vitals */}
      {activeTab === 'vitals' && (
        <div className="bg-white border border-slate-200 rounded-b-lg p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Blood Pressure</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">128/84 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Optimal Controlled</div>
              <div className="text-[10px] text-slate-400 mt-2">Last logged: 2 hours ago via OMRON Bluetooth</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Blood Glucose (Fasting)</span>
                <Droplet className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">118 <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">Mild Pre-diabetic Range</div>
              <div className="text-[10px] text-slate-400 mt-2">Target: 70 - 100 mg/dL</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>SpO2 Oxygen Saturation</span>
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">98% <span className="text-xs font-normal text-slate-500">Room Air</span></div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Healthy Respiration</div>
              <div className="text-[10px] text-slate-400 mt-2">Pulse Rate: 76 bpm</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Body Mass Index (BMI)</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">24.2 <span className="text-xs font-normal text-slate-500">kg/m²</span></div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Normal Weight</div>
              <div className="text-[10px] text-slate-400 mt-2">Height: 172 cm · Weight: 71.5 kg</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 mb-1">Physician Trend Note</h4>
            <p>
              Blood pressure has demonstrated steady regulation over the past 30 days under Amlodipine 5mg therapy. Continue home monitoring twice weekly and maintain low-sodium intake.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Allergies */}
      {activeTab === 'allergies' && (
        <div className="bg-white border border-slate-200 rounded-b-lg p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Documented Clinical Drug Allergies</h3>
            <div className="space-y-2">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded flex justify-between items-center text-rose-900">
                <div>
                  <span className="font-bold">Penicillin and Beta-Lactam Derivatives</span>
                  <p className="text-rose-700 text-[11px] mt-0.5">Reaction: Urticaria and severe facial edema within 45 minutes of oral intake (2018)</p>
                </div>
                <span className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  Severe / Contraindicated
                </span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded flex justify-between items-center text-rose-900">
                <div>
                  <span className="font-bold">Sulfonamides (Sulfa drugs)</span>
                  <p className="text-rose-700 text-[11px] mt-0.5">Reaction: Cutaneous rash and pruritus</p>
                </div>
                <span className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  Moderate
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Documented Food / Environmental Allergies</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
              <span className="font-bold">Dust Mites & Particulate Matter (PM2.5/PM10)</span>
              <p className="text-amber-800 text-[11px] mt-0.5">Triggers seasonal dry cough, post-nasal drip, and mild wheeze during Delhi winter months.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Document Uploaded!</h3>
                <p className="text-xs text-slate-600">Saved to patient medical locker with digital timestamp.</p>
              </div>
            ) : (
              <form onSubmit={handleAddRecord} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Upload Medical Record</h3>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBC Blood Count & Lipid Profile"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Record Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MedicalRecord['type'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Consultation Summary">Consultation Summary</option>
                    <option value="Procedure">Procedure / Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Laboratory / Hospital / Doctor
                  </label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinical Summary / Key Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state key test results or doctor's impression..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="p-3 border border-dashed border-slate-300 rounded text-center bg-slate-50">
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-600">Simulated file upload (PDF/JPG up to 25MB)</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-800 text-white font-semibold rounded hover:bg-teal-900"
                  >
                    Save to Locker
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
