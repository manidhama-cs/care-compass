import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { Appointment } from '../../types/platform.ts';

interface AppointmentsViewProps {
  onJoinRoom: (appointmentId: string) => void;
  onBookNew: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ onJoinRoom, onBookNew }) => {
  const [state, setState] = useState(platformStore.getState());
  const { appointments, currentRole, currentUser } = state;

  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');

  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setState(platformStore.getState());
    });
  }, []);

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter === 'All') return true;
    return apt.status === statusFilter;
  });

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      platformStore.cancelAppointment(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Consultation Schedule
            </span>
            <span className="text-xs text-slate-500">Live Telemedicine & OPD</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultations & Appointments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage upcoming video appointments, doctor visits, and review past clinical encounters.
          </p>
        </div>

        <button
          onClick={onBookNew}
          className="px-4 py-2 bg-teal-800 text-white rounded text-xs font-semibold hover:bg-teal-900 flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Calendar className="w-4 h-4" />
          Book New Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-3 border border-slate-200 rounded-lg text-xs">
        <Filter className="w-4 h-4 text-slate-400 ml-1" />
        <span className="font-semibold text-slate-700 mr-2">Filter Status:</span>
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs">
            No appointments found matching "{statusFilter}".
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  apt.mode === 'video'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                }`}>
                  {apt.mode === 'video' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{apt.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentRole === 'doctor' ? apt.patientName : apt.doctorName}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">({apt.specialization})</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-700">Chief Complaint / Reason:</span> {apt.symptomSummary || 'General follow-up'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.dateTime}
                    </span>
                    <span>·</span>
                    <span className="uppercase text-[11px] font-semibold text-slate-600">
                      {apt.mode === 'video' ? 'Teleconsult Video' : 'In-Clinic OPD'}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900">₹{apt.fee}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div>
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded border ${
                    apt.status === 'Upcoming'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : apt.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {apt.status === 'Upcoming' && <Clock className="w-3 h-3 mr-1 text-amber-600" />}
                    {apt.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />}
                    {apt.status === 'Cancelled' && <XCircle className="w-3 h-3 mr-1 text-slate-400" />}
                    {apt.status}
                  </span>
                </div>

                {apt.status === 'Upcoming' && (
                  <>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onJoinRoom(apt.id)}
                      className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Enter Room
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
