import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Phone, User, Calendar, KeyRound, Volume2 } from 'lucide-react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { BookingConfirmation, Caregiver } from '../types/triage.ts';
import { CAREGIVERS } from '../data/caregivers.ts';
import { speakAloud } from './VoiceController.tsx';

interface BookingModalProps {
  language: AppLanguage;
  caregiverId: string;
  careType: string;
  onClose: () => void;
  onSuccess: (confirmation: BookingConfirmation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  language,
  caregiverId,
  careType,
  onClose,
  onSuccess
}) => {
  const t = I18N[language];
  const caregiver = CAREGIVERS.find(c => c.caregiver_id === caregiverId) || CAREGIVERS[0];

  const [patientName, setPatientName] = useState('Ramesh Sharma');
  const [patientPhone, setPatientPhone] = useState('+91 98100 12345');
  const [address, setAddress] = useState('Flat 402, Sector 18, Noida, Delhi NCR');
  const [slot, setSlot] = useState('Today, Earliest Slot');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiver_id: caregiverId,
          care_type: careType,
          patient_name: patientName,
          patient_phone: patientPhone,
          address,
          preferred_slot: slot
        })
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmation(data.booking);
        onSuccess(data.booking);

        const speech =
          language === 'Hindi'
            ? `बुकिंग हो गई है। आपकी बुकिंग संख्या ${data.booking.booking_id} है। ओटीपी ${data.booking.otp} है। ${data.booking.caregiver_name} आपके घर पहुंचेंगे।`
            : language === 'Hinglish'
            ? `Booking confirm ho gayi hai. Booking ID ${data.booking.booking_id} aur OTP ${data.booking.otp} hai.`
            : `Booking confirmed successfully. Booking ID ${data.booking.booking_id}. Your OTP is ${data.booking.otp}.`;
        speakAloud(speech, language);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmation ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>One-Tap Booking Confirmation</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Book {caregiver.role === 'doctor' ? `Dr. ${caregiver.name}` : caregiver.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              {caregiver.qualification} · {caregiver.base_area} · ★{caregiver.rating.toFixed(1)}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Patient Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Service Address (Delhi NCR)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Preferred Arrival Window
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Today, Earliest Slot">Today, Earliest Slot ({caregiver.free_from} - {caregiver.free_until})</option>
                    <option value="Today Evening (16:00 - 18:00)">Today Evening (16:00 - 18:00)</option>
                    <option value="Tomorrow Morning (09:00 - 11:00)">Tomorrow Morning (09:00 - 11:00)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Confirming..." : t.bookNow}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.bookingSuccess}
            </h2>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t.bookingId}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{confirmation.booking_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Caregiver:</span>
                <span className="font-bold text-slate-900 dark:text-white">{confirmation.caregiver_name} ({confirmation.caregiver_role})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Arrival Slot:</span>
                <span className="font-semibold text-emerald-600">{confirmation.eta_or_slot}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 flex items-center gap-1 font-bold">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  {t.otpLabel}:
                </span>
                <span className="text-xl font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-0.5 rounded-lg border border-emerald-300">
                  {confirmation.otp}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {t.shareOtp}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer mt-4"
            >
              Done / Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
