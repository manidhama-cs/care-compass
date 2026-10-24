import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  HeartHandshake,
  Pill,
  Calendar,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  Layers,
  Flag
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';

export const AdminDashboard: React.FC = () => {
  const [storeState, setStoreState] = useState(platformStore.getState());
  const [activeSubTab, setActiveSubTab] = useState<'verifications' | 'reviews' | 'audit_logs'>('verifications');

  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setStoreState({ ...platformStore.getState() });
    });
  }, []);

  const { doctors, caregivers, caregiverReviews, auditLogs, appointments, orders, medicines } = storeState;

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>CareCompass Platform System Administration & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Clinical Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage provider credentialing, review moderation, medicine catalog verification, and regulatory audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => platformStore.resetToSeed()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Seed State</span>
          </button>
        </div>
      </div>

      {/* High-Level System KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Doctors</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{doctors.length}</div>
          <span className="text-[11px] text-teal-600 font-medium">{doctors.filter(d => d.isVerified).length} Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caregivers</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{caregivers.length}</div>
          <span className="text-[11px] text-teal-600 font-medium">{caregivers.filter(c => c.isVerified).length} Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Appointments</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{appointments.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Telehealth & Home Visits</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medicines Catalog</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{medicines.length}</div>
          <span className="text-[11px] text-purple-600 font-medium">{medicines.filter(m => m.requiresPrescription).length} Rx Controlled</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Events</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{auditLogs.length}</div>
          <span className="text-[11px] text-blue-600 font-medium">Immutable Trail</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'verifications'
              ? 'bg-slate-900 text-white dark:bg-teal-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Provider Credential Verifications
        </button>
        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'reviews'
              ? 'bg-slate-900 text-white dark:bg-teal-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Review Moderation
        </button>
        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'audit_logs'
              ? 'bg-slate-900 text-white dark:bg-teal-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Compliance Audit Logs
        </button>
      </div>

      {/* Sub Tab 1: Verifications */}
      {activeSubTab === 'verifications' && (
        <div className="space-y-6">
          {/* Doctor Verification Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Doctor Credential Verification Table
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="p-2.5">Doctor</th>
                  <th className="p-2.5">Specialization</th>
                  <th className="p-2.5">MCI / DMC Registration</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctors.slice(0, 6).map(doc => (
                  <tr key={doc.id}>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{doc.name}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{doc.specialization}</td>
                    <td className="p-2.5 font-mono text-slate-500">{doc.registrationNumber}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.isVerified ? 'Verified' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => platformStore.toggleDoctorVerification(doc.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          doc.isVerified
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {doc.isVerified ? 'Revoke' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Caregiver Verification Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Caregiver & Nurse Verification Table
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="p-2.5">Caregiver</th>
                  <th className="p-2.5">Qualifications</th>
                  <th className="p-2.5">Experience</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {caregivers.slice(0, 5).map(cg => (
                  <tr key={cg.id}>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{cg.name}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{cg.qualifications}</td>
                    <td className="p-2.5 text-slate-500">{cg.experienceYears} Years</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cg.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cg.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => platformStore.toggleCaregiverVerification(cg.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          cg.isVerified
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {cg.isVerified ? 'Revoke' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Reviews Moderation */}
      {activeSubTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Caregiver & Doctor Review Moderation Queue
          </h3>
          <div className="space-y-3">
            {caregiverReviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{r.patientName}</span>
                    <span className="text-[10px] text-amber-600 font-bold">{r.rating}★</span>
                    {r.isFlagged && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Flagged for Review</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{r.reviewText}"</p>
                  <p className="text-[10px] text-slate-400">{r.serviceCategory} · {r.date}</p>
                </div>
                <button
                  onClick={() => platformStore.toggleReviewFlag(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    r.isFlagged
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {r.isFlagged ? 'Restore Review' : 'Flag Review'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Audit Logs */}
      {activeSubTab === 'audit_logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Real-Time Audit Trail
          </h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono">
                <div>
                  <span className="font-bold text-teal-600 mr-2">[{log.action}]</span>
                  <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0">
                  {log.timestamp} · User: {log.userId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
