import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Video,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Languages
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { Doctor } from '../../types/platform.ts';

interface DoctorDirectoryViewProps {
  onBookSuccess?: () => void;
}

export const DoctorDirectoryView: React.FC<DoctorDirectoryViewProps> = ({ onBookSuccess }) => {
  const state = platformStore.getState();
  const { doctors } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedMode, setSelectedMode] = useState<'all' | 'video' | 'in_person'>('all');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('Today at 16:00');
  const [consultMode, setConsultMode] = useState<'video' | 'in_person'>('video');
  const [symptomReason, setSymptomReason] = useState('General medical consultation');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const specialties = [
    'All',
    'General Physician',
    'Cardiology',
    'Pediatrics',
    'Pulmonology',
    'Dermatology',
    'Orthopedics',
    'Gastroenterology',
    'Psychiatry',
    'ENT'
  ];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinicAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchesMode =
      selectedMode === 'all' || doc.modes.includes(selectedMode);

    return matchesSearch && matchesSpecialty && matchesMode;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    platformStore.bookAppointment(
      bookingDoctor.id,
      bookingDate,
      consultMode,
      symptomReason
    );

    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setBookingDoctor(null);
      if (onBookSuccess) onBookSuccess();
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Search & Filter Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300 mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Verified Medical Specialists · Delhi NCR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find and Consult Verified Doctors
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse qualified MBBS, MD, and DM specialists with transparent fees, verified registrations, and same-day video availability.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, condition (e.g. fever, heart, skin)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as any)}
              className="py-3 px-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Consultation Modes</option>
              <option value="video">Online Video Call</option>
              <option value="in_person">Clinic In-Person</option>
            </select>
          </div>
        </div>

        {/* Specialty Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Badges & Rating */}
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  {doc.isVerified ? 'MCI Verified' : 'Registered Doctor'}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {doc.rating} ({doc.reviewCount} reviews)
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-slate-800 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 truncate">
                    {doc.specialization}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {doc.qualification} · {doc.experienceYears} Years Exp.
                  </p>
                </div>
              </div>

              {/* Bio & Details */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {doc.about}
              </p>

              <div className="space-y-1.5 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Earliest Slot:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {doc.nextAvailableSlot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:
                  </span>
                  <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">
                    {doc.clinicAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Languages className="w-3.5 h-3.5 text-slate-400" /> Languages:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {doc.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Recommendation Reason */}
              {doc.recommendationReason && (
                <div className="mt-3 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[11px] font-medium text-teal-800 dark:text-teal-300">
                  💡 {doc.recommendationReason}
                </div>
              )}
            </div>

            {/* Card Footer: Fee & Booking CTA */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Consultation Fee</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{doc.consultationFee}
                </span>
              </div>

              <button
                onClick={() => {
                  setBookingDoctor(doc);
                  setConsultMode(doc.modes.includes('video') ? 'video' : 'in_person');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            No doctors found matching "{searchQuery}". Try selecting "All" specialties or clearing your search.
          </p>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            {!bookingConfirmed ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Book with {bookingDoctor.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {bookingDoctor.specialization} · Fee: ₹{bookingDoctor.consultationFee}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultMode('video')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                        consultMode === 'video'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Online Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultMode('in_person')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                        consultMode === 'in_person'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>In-Person Clinic Visit</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Appointment Slot
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Today at 16:00">Today at 16:00 (Next Earliest)</option>
                    <option value="Today at 17:30">Today at 17:30</option>
                    <option value="Tomorrow at 10:00">Tomorrow at 10:00 AM</option>
                    <option value="Tomorrow at 14:00">Tomorrow at 02:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Primary Symptom or Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={symptomReason}
                    onChange={(e) => setSymptomReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Confirm Appointment (₹{bookingDoctor.consultationFee})
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Appointment Confirmed!
                </h4>
                <p className="text-xs text-slate-500">
                  Your appointment with {bookingDoctor.name} has been added to your dashboard schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
