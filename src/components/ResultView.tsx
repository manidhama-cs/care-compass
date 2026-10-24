import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Languages, Award, ShieldCheck, ChevronDown, ChevronUp, Volume2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CareType, Urgency, MatchedCaregiverResult, Caregiver } from '../types/triage.ts';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { CAREGIVERS } from '../data/caregivers.ts';
import { speakAloud } from './VoiceController.tsx';

interface ResultViewProps {
  language: AppLanguage;
  careType: CareType;
  urgency: Urgency;
  reasoning: string;
  matchedCaregivers: MatchedCaregiverResult[];
  onBookCaregiver: (caregiverId: string) => void;
  onRejectCaregiver?: (caregiverId: string) => void;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  language,
  careType,
  urgency,
  reasoning,
  matchedCaregivers,
  onBookCaregiver,
  onRejectCaregiver,
  onReset
}) => {
  const t = I18N[language];
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>(
    matchedCaregivers[0]?.caregiver_id || ''
  );

  // Friendly human care labels
  const getCareSummary = () => {
    switch (careType) {
      case 'home_nursing':
        return language === 'Hindi'
          ? "नर्स घर आएगी (Home Nursing)"
          : language === 'Hinglish'
          ? "Nurse ghar aayegi (Home Nursing)"
          : "Home Nursing (Medic Visit)";
      case 'paramedic_home_visit':
        return language === 'Hindi'
          ? "स्वास्थ्य कर्मी घर पर जांच करेंगे (Medic Visit)"
          : language === 'Hinglish'
          ? "Medic ghar aakar checkup karenge (Vitals & Assessment)"
          : "Paramedic / Medic Home Visit";
      case 'lab_test_home':
        return language === 'Hindi'
          ? "घर से ब्लड/शुगर सैंपल कलेक्शन (Home Lab Test)"
          : language === 'Hinglish'
          ? "Ghar se sample collection (Home Lab Test)"
          : "Diagnostic Lab Test (Home Collection)";
      case 'teleconsultation':
        return language === 'Hindi'
          ? "ऑनलाइन डॉक्टर वीडियो परामर्श (Teleconsultation)"
          : language === 'Hinglish'
          ? "Doctor se video call consult (Teleconsultation)"
          : "Online Doctor Video Consultation";
      default:
        return "Care Assessment";
    }
  };

  const getUrgencyText = () => {
    if (urgency === 'same_day') return t.today;
    if (urgency === 'scheduled') return t.scheduled;
    if (urgency === 'emergency') return t.urgent;
    return urgency || 'Standard';
  };

  // Full caregiver objects for cards
  const fullCandidates = matchedCaregivers.map((m) => {
    const cg = CAREGIVERS.find((c) => c.caregiver_id === m.caregiver_id);
    return {
      matchInfo: m,
      details: cg
    };
  });

  const activeCandidate =
    fullCandidates.find((c) => c.matchInfo.caregiver_id === selectedCaregiverId) ||
    fullCandidates[0];

  // Read summary aloud
  useEffect(() => {
    const speech = `${getCareSummary()}. ${t.urgencyLabel}: ${getUrgencyText()}. ${activeCandidate?.details?.name ? `${activeCandidate.details.name} available.` : ''}`;
    speakAloud(speech, language);
  }, [careType, urgency, selectedCaregiverId]);

  const handleReplay = () => {
    const speech = `${getCareSummary()}. ${t.urgencyLabel}: ${getUrgencyText()}. ${activeCandidate?.matchInfo?.reason || ''}`;
    speakAloud(speech, language);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back and Read Aloud */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resetConversation}</span>
        </button>

        <button
          onClick={handleReplay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>{t.replayAudio}</span>
        </button>
      </div>

      {/* Decision Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">
              {t.careNeeded}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getCareSummary()}
            </h1>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">
              {t.urgencyLabel}
            </div>
            <div className="inline-block px-3 py-1 rounded-xl bg-emerald-800 border border-emerald-600 text-sm font-bold text-emerald-100">
              {getUrgencyText()}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Recommended Caregiver Card */}
      {activeCandidate?.details ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-600 dark:border-emerald-500 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.topCaregiver}</span>
            </div>
            <div className="font-mono tabular-nums bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-emerald-800 dark:text-emerald-300">
              Match Score: {(activeCandidate.matchInfo.score * 100).toFixed(0)}%
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {/* Photo Avatar / Initial */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                {activeCandidate.details.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCandidate.details.role === 'doctor' ? `Dr. ${activeCandidate.details.name}` : activeCandidate.details.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {activeCandidate.details.qualification}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-slate-400" />
                    {activeCandidate.details.languages.join(', ')}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeCandidate.details.base_area}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {activeCandidate.details.rating.toFixed(1)}
                  </span>
                </div>

                {/* Why chosen line */}
                <p className="mt-3 text-sm text-emerald-900 dark:text-emerald-200 font-medium bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  💡 {activeCandidate.matchInfo.reason}
                </p>
              </div>
            </div>

            {/* Giant One-Tap Book Button & Alternative Provider Button */}
            <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
              <button
                onClick={() => onBookCaregiver(activeCandidate.matchInfo.caregiver_id)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 sm:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer min-h-[56px]"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>{t.bookNow}</span>
              </button>

              {onRejectCaregiver && (
                <button
                  type="button"
                  onClick={() => onRejectCaregiver(activeCandidate.matchInfo.caregiver_id)}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white py-1 hover:underline cursor-pointer"
                >
                  {language === 'Hindi' ? "कोई अन्य प्रदाता दिखाएं ↻" : "Show different provider ↻"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {language === 'Hindi' ? "इस क्षेत्र में कोई उपलब्ध प्रदाता नहीं मिला" : "No Eligible In-Person Providers Found"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs max-w-md mx-auto">
            {language === 'Hindi'
              ? "आपके द्वारा चुने गए पते/समय पर कोई योग्य कर्मी उपलब्ध नहीं है। आप ऑनलाइन डॉक्टर परामर्श ले सकते हैं या हमारे सहायता केंद्र (1800-SANOCARE) पर संपर्क कर सकते हैं।"
              : "No qualified providers with the requested specialized skill set are currently active in this service radius. We recommend booking a virtual teleconsultation or calling our care desk."}
          </p>
        </div>
      )}

      {/* Alternative Verified Caregivers (if 2+ candidates) */}
      {fullCandidates.length > 1 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            {t.otherCaregivers} ({fullCandidates.length - 1})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fullCandidates.slice(1).map((item) => {
              const cg = item.details;
              if (!cg) return null;
              const isSelected = selectedCaregiverId === cg.caregiver_id;

              return (
                <div
                  key={cg.caregiver_id}
                  onClick={() => setSelectedCaregiverId(cg.caregiver_id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {cg.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {cg.name} ({cg.qualification})
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {cg.base_area} · {cg.languages[0]} · ★{cg.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookCaregiver(cg.caregiver_id);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explainability Accordion ("Why this?") */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowWhyThis(!showWhyThis)}
          className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{t.whyThis}</span>
          </div>
          {showWhyThis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showWhyThis && (
          <div className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-300 space-y-2 border-t border-slate-200/60 dark:border-slate-800">
            <p>
              <strong>Clinical Routing Rule:</strong> {reasoning}
            </p>
            <p className="text-xs text-slate-500">
              Matches are calculated based on language fluency (0.35), Haversine GPS proximity (0.30), specific procedural skills (0.20), and past patient rating (0.15).
            </p>
          </div>
        )}
      </div>

      {/* Non-diagnostic Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-center text-xs text-slate-500 font-medium">
        {t.disclaimer}
      </div>
    </div>
  );
};
