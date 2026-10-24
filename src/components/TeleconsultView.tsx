import React, { useState, useEffect } from 'react';
import { Video, Star, Clock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { TeleconsultSlot } from '../types/triage.ts';
import { speakAloud } from './VoiceController.tsx';

interface TeleconsultViewProps {
  language: AppLanguage;
  onBack: () => void;
  onEmergencyDetected?: () => void;
}

export const TeleconsultView: React.FC<TeleconsultViewProps> = ({
  language,
  onBack
}) => {
  const t = I18N[language];
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TeleconsultSlot[]>([]);
  const [bookedSlot, setBookedSlot] = useState<TeleconsultSlot | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('General Medicine');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teleconsult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: selectedSpecialty,
          language: language === 'Hindi' ? 'Hindi' : 'Hindi & English',
          preferred_time: 'Earliest'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedSpecialty]);

  const handleBookVideoCall = (slot: TeleconsultSlot) => {
    setBookedSlot(slot);
    const speech =
      language === 'Hindi'
        ? `डॉक्टर वीडियो कॉल बुक हो गया है। ${slot.doctor_name} आपके साथ वीडियो रूम में जुड़ेंगे।`
        : language === 'Hinglish'
        ? `Doctor video call book ho gaya hai. ${slot.doctor_name} online consultation ke liye available hain.`
        : `Doctor video consultation booked with ${slot.doctor_name}. Earliest slot: ${slot.earliest_slot}.`;

    speakAloud(speech, language);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resetConversation}</span>
        </button>

        <button
          onClick={fetchSlots}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Slots</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-900 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/50 text-xs font-bold text-blue-200 mb-3">
            <Video className="w-3.5 h-3.5 text-blue-400" />
            <span>TinyFish Automated Doctor Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {t.doctorConsultTitle}
          </h1>

          <p className="text-sm sm:text-base text-blue-200 font-medium">
            {t.doctorConsultSubtitle}
          </p>
        </div>
      </div>

      {/* Specialty Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['General Medicine', 'Fever & Cough', 'Acidity & Digestion', 'Pediatrics (Second Opinion)'].map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSpecialty === spec
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        /* Doctor Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {slots.map((slot) => (
            <div
              key={slot.doctor_id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-3">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    {slot.provider === 'tinyfish' ? 'TinyFish Verified Doctor' : 'Verified Sanocare MBBS Doctor'}
                  </span>
                  <span className="flex items-center gap-0.5 font-bold text-amber-500 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {slot.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-lg">
                    {slot.doctor_name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {slot.doctor_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {slot.qualification} · {slot.languages.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      Earliest Available Slot:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {slot.earliest_slot}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t.feeLabel}:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      ₹{slot.consultation_fee_inr}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => handleBookVideoCall(slot)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{t.bookVideoCall}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Confirmation Modal for Teleconsult */}
      {bookedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/60 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Video Consultation Confirmed!
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your appointment with <strong>{bookedSlot.doctor_name}</strong> is scheduled for{' '}
              <strong>{bookedSlot.earliest_slot}</strong>.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              Room Link: teleconsult.carecompass.in/room/live-{Date.now().toString().slice(-4)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBookedSlot(null)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Join Video Room
              </button>
              <button
                onClick={() => setBookedSlot(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-center text-xs text-slate-500 font-medium">
        🔒 <strong>TinyFish Privacy Guarantee:</strong> No symptoms text, patient names, or precise GPS coordinates are ever transmitted to external provider queries. Only generic specialty and language tokens are queried.
      </div>
    </div>
  );
};
