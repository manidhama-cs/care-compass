import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Star,
  ShieldCheck,
  Award,
  AlertCircle,
  User,
  HeartHandshake
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';

interface CaregiverDashboardProps {
  onNavigate: (tab: any) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = () => {
  const state = platformStore.getState();
  const { caregivers, caregiverReviews } = state;
  const currentCaregiver = caregivers[0] || state.caregivers[0];

  const [isAvailable, setIsAvailable] = useState(true);
  const [activeRequests, setActiveRequests] = useState([
    {
      id: 'REQ_501',
      patientName: 'Sunita Mehra',
      serviceType: 'Elderly Mobility & Daily Living Support',
      address: 'Pocket C, Saket, New Delhi (1.8 km away)',
      timeWindow: 'Today, 14:00 - 18:00 (4 Hours)',
      fee: 1800,
      status: 'pending' as 'pending' | 'accepted' | 'declined'
    },
    {
      id: 'REQ_502',
      patientName: 'Kailash Nath',
      serviceType: 'Post-Surgical Wound Dressing & Vitals',
      address: 'Block B, Hauz Khas (3.2 km away)',
      timeWindow: 'Tomorrow, 09:00 - 11:00 (2 Hours)',
      fee: 900,
      status: 'pending' as 'pending' | 'accepted' | 'declined'
    }
  ]);

  const handleAccept = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'accepted' as const } : r))
    );
  };

  const handleDecline = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'declined' as const } : r))
    );
  };

  const myReviews = caregiverReviews.filter(r => r.caregiverId === currentCaregiver.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Caregiver Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Verified Healthcare Caregiver Partner · Delhi Nursing Council</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentCaregiver.name} · Caregiver Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentCaregiver.qualifications} · Serving: {currentCaregiver.serviceAreas.join(', ')}
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shrink-0">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-bold text-white">
            {isAvailable ? 'Active & Accepting Requests' : 'Currently Offline'}
          </span>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Toggle
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Rating</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1 text-amber-500 font-mono">
            <Star className="w-5 h-5 fill-amber-500" />
            <span>{currentCaregiver.rating.toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">From {currentCaregiver.completedBookingsCount} bookings</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Hourly Rate</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{currentCaregiver.hourlyRate}/hr</div>
          <span className="text-[11px] text-teal-600 font-medium">Standard Home Visit</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Visits</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentCaregiver.completedBookingsCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% On-Time Record</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permitted Procedures</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentCaregiver.servicesProvided.length} Types</div>
          <span className="text-[11px] text-slate-400 font-medium">Strict Scope Compliant</span>
        </div>
      </div>

      {/* Main Split: Incoming Service Requests | Reviews & Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols: Booking Requests) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Incoming Service Requests ({activeRequests.length})
              </span>
            </div>

            <div className="space-y-4">
              {activeRequests.map(req => (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'accepted'
                      ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : req.status === 'declined'
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                        {req.serviceType}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Patient: {req.patientName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                        ₹{req.fee}
                      </span>
                      <span className="text-xs text-slate-400 block font-normal">Service Fee</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {req.address}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {req.timeWindow}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Booking Accepted. Dispatched to patient address.</span>
                    </div>
                  )}

                  {req.status === 'declined' && (
                    <div className="text-xs text-slate-500">
                      Request was declined.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Patient Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Verified Patient Reviews ({myReviews.length})
              </span>
            </div>

            <div className="space-y-3">
              {myReviews.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{r.patientName}</span>
                    <div className="flex items-center text-amber-500 font-bold">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{r.reviewText}"</p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>{r.serviceCategory}</span>
                    <span>{r.date} · Verified Booking</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scope & Boundaries */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Permitted Clinical Scope
            </h3>

            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                Authorized Services:
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                {currentCaregiver.servicesProvided.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 block mb-1">
                Strictly Prohibited:
              </span>
              <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                {currentCaregiver.servicesNotProvided.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
