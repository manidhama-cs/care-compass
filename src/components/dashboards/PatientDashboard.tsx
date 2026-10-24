import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Pill,
  ArrowRight,
  ShieldCheck,
  Star,
  Activity,
  Bot,
  UserCheck,
  HeartHandshake,
  Download,
  AlertCircle
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { downloadPrescriptionPdf } from '../../services/pdfGenerator.ts';

interface PatientDashboardProps {
  onNavigate: (tab: any) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const state = platformStore.getState();
  const { currentUser, appointments, prescriptions, medicalRecords, doctors, orders } = state;

  const upcomingApt = appointments.find(a => a.status === 'Upcoming');
  const recentRx = prescriptions[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Welcome & Quick Status Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Verified Patient Profile · Saket, New Delhi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Access your AI triage assistant, doctor appointments, digital prescriptions, and nearby certified caregivers in one connected dashboard.
          </p>
        </div>

        {/* Start AI Triage Action Banner */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('triage')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Bot className="w-5 h-5 text-slate-950" />
            <span>Start AI Care Triage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigate('triage')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">AI Symptom Triage</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Voice or text screening</div>
        </button>

        <button
          onClick={() => onNavigate('doctors')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Consult Doctor</div>
          <div className="text-[11px] text-slate-500 mt-0.5">20+ verified specialists</div>
        </button>

        <button
          onClick={() => onNavigate('caregivers')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Find Caregivers</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Nurses & elderly care</div>
        </button>

        <button
          onClick={() => onNavigate('medicines')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Medicines & Store</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Nearby Delhi pharmacies</div>
        </button>
      </div>

      {/* Main Split: Left Column (Appointments & Prescriptions) | Right Column (Health Summary & Orders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Next Scheduled Consultation
              </span>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                View All ({appointments.length})
              </button>
            </div>

            {upcomingApt ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                    {upcomingApt.doctorName.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {upcomingApt.doctorName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {upcomingApt.specialization} · Mode: {upcomingApt.mode.toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{upcomingApt.dateTime}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('consultation')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Room</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No upcoming consultations scheduled. Book an online appointment with top specialists.
              </div>
            )}
          </div>

          {/* Recent Prescription Card */}
          {recentRx && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Active Doctor Prescription (#{recentRx.id})
                </span>
                <button
                  onClick={() => downloadPrescriptionPdf(recentRx)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Issued by <strong>{recentRx.doctorName}</strong> on {recentRx.consultationDate}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {recentRx.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {m.medicationName}
                      </div>
                      <div className="text-[11px] text-teal-600 font-medium">
                        {m.frequency}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Duration: {m.duration}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-500">
                    Follow-up: {recentRx.followUpAdvice}
                  </p>
                  <button
                    onClick={() => onNavigate('medicines')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Order from Pharmacy &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Doctors Row */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recommended Doctors (Matched by Specialty & Reviews)
              </span>
              <button
                onClick={() => onNavigate('doctors')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Browse All Doctors &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.slice(0, 2).map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 shrink-0">
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{doc.name}</h4>
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {doc.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{doc.specialization}</p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium mt-1">
                      💡 {doc.recommendationReason}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">₹{doc.consultationFee}</span>
                      <button
                        onClick={() => onNavigate('doctors')}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 cursor-pointer"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col: Health Summary & Orders) */}
        <div className="space-y-6">
          {/* Health Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Vitals & Health Profile
              </span>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                History &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Blood Pressure</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">128/82</div>
                <span className="text-[10px] text-emerald-600 font-medium">Normal Pre-HTN</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fasting Sugar</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">104 mg/dL</div>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Heart Rate</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">72 bpm</div>
                <span className="text-[10px] text-emerald-600 font-medium">Resting Normal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Blood Group</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">B Positive</div>
                <span className="text-[10px] text-slate-400 font-medium">Documented</span>
              </div>
            </div>

            {/* Documented Allergies */}
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200">Documented Allergies:</span>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">Penicillin (Mild urticarial reaction)</p>
            </div>
          </div>

          {/* Recent Pharmacy Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-purple-600" />
                Recent Orders ({orders.length})
              </span>
              <button
                onClick={() => onNavigate('medicines')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Pharmacy &rarr;
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 2).map(ord => (
                  <div key={ord.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Order #{ord.id}</span>
                      <span className="text-emerald-600">{ord.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {ord.pharmacyName} · ₹{ord.total}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {ord.items.map(i => `${i.medicineName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent pharmacy orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
