import React, { useEffect } from 'react';
import { PhoneCall, ShieldAlert, Heart, Volume2, ArrowLeft } from 'lucide-react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { speakAloud } from './VoiceController.tsx';

interface EmergencyViewProps {
  language: AppLanguage;
  redFlags: string[];
  reasoning?: string;
  onBack: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  language,
  redFlags,
  reasoning,
  onBack
}) => {
  const t = I18N[language];

  // Automatically read emergency instructions aloud when mounted
  useEffect(() => {
    const speechText =
      language === 'Hindi'
        ? "यह एक आपातकालीन स्थिति है। तुरंत 112 पर कॉल करें। शांत रहें। मरीज को आराम से बैठाएं या लेटा दें। मुख्य दरवाजा खोल दें और एम्बुलेंस के लिए पता तैयार रखें।"
        : language === 'Hinglish'
        ? "Emergency alert! Kripya abhi 112 par call karein. Shant rahein, patient ko leta dein aur ambulance ke liye address ready rakhein."
        : "Critical emergency detected. Please call 112 immediately. Stay calm, keep the patient comfortable, and unlock the front door for the ambulance.";

    speakAloud(speechText, language);
  }, [language]);

  const handleReplay = () => {
    const speechText =
      language === 'Hindi'
        ? "तुरंत 112 पर कॉल करें। शांत रहें। मरीज को आराम से बैठाएं। दरवाजा खोलकर पता तैयार रखें।"
        : language === 'Hinglish'
        ? "Abhi 112 par call karein. Shant rahein, patient ko aaram se bitha dein aur gate khol dein."
        : "Call 112 immediately. Stay calm, keep patient seated comfortably, and unlock the front door.";

    speakAloud(speechText, language);
  };

  return (
    <div className="min-h-[85vh] bg-red-600 text-white flex flex-col justify-between p-4 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
      {/* Background Pulse Rings */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-700/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold backdrop-blur-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resetConversation}</span>
        </button>

        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold backdrop-blur-sm transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.replayAudio}</span>
        </button>
      </div>

      {/* Center Critical Action Zone */}
      <div className="my-auto py-8 max-w-2xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl text-red-600 shadow-xl mb-6 animate-bounce">
          <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
          {t.emergencyTitle}
        </h1>

        <p className="text-lg sm:text-xl font-medium text-red-100 max-w-xl mx-auto mb-8">
          {t.emergencySubtitle}
        </p>

        {/* Giant Tap-To-Call 112 CTA */}
        <a
          href="tel:112"
          className="inline-flex items-center justify-center gap-4 w-full sm:w-auto px-8 py-5 rounded-2xl bg-white hover:bg-red-50 text-red-600 font-black text-2xl sm:text-3xl shadow-2xl active:scale-95 transition-transform cursor-pointer border-4 border-red-300"
        >
          <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
          <span>{t.emergencyAction}</span>
        </a>

        {redFlags.length > 0 && (
          <div className="mt-6 inline-block bg-red-800/60 backdrop-blur-sm border border-red-400/40 px-4 py-2 rounded-xl text-sm font-bold text-red-100">
            Detected: {redFlags.join(', ')}
          </div>
        )}
      </div>

      {/* 3 Plain Emergency Steps */}
      <div className="max-w-2xl mx-auto w-full relative z-10 bg-red-700/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-red-400/30">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
          <Heart className="w-5 h-5 text-red-200 fill-red-200" />
          <span>3 Immediate First-Aid Steps While Ambulance Arrives:</span>
        </h2>

        <div className="space-y-2.5 text-base sm:text-lg text-red-50 font-medium">
          <p>{t.emergencyStep1}</p>
          <p>{t.emergencyStep2}</p>
          <p>{t.emergencyStep3}</p>
        </div>

        {reasoning && (
          <div className="mt-4 pt-3 border-t border-red-400/30 text-xs sm:text-sm text-red-200">
            <strong>Clinical Safety Rationale:</strong> {reasoning}
          </div>
        )}
      </div>
    </div>
  );
};
