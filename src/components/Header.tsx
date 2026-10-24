import React from 'react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { PhoneCall, Globe, Type, Stethoscope, Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  activeTab: 'triage' | 'teleconsult' | 'benchmark';
  setActiveTab: (tab: 'triage' | 'teleconsult' | 'benchmark') => void;
  onEmergencyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  textSize,
  setTextSize,
  activeTab,
  setActiveTab,
  onEmergencyClick
}) => {
  const t = I18N[language];

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const textSizeLabel = textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark / Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('triage')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-black text-lg">
              C
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                CareCompass
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block whitespace-nowrap">
                IIIT-Delhi AI Care Navigation
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'triage'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Care Triage</span>
          </button>

          <button
            onClick={() => setActiveTab('teleconsult')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'teleconsult'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Doctor Consult (TinyFish)</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'benchmark'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Benchmark & API</span>
          </button>
        </nav>

        {/* Zone 3: Accessibility Toggles & Emergency CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <Globe className="w-3.5 h-3.5 ml-2 text-slate-500 shrink-0 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label="Language"
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 py-1.5 px-2 rounded-md outline-none cursor-pointer"
            >
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">हिन्दी</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Text Size Toggle */}
          <button
            onClick={cycleTextSize}
            title="Toggle Font Size (Elderly Accessibility)"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors"
          >
            <span className="sr-only">Toggle Font Size</span>
            {textSizeLabel}
          </button>

          {/* Persistent Red Emergency 112 CTA */}
          <button
            onClick={onEmergencyClick}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span className="hidden xs:inline">112</span>
            <span className="hidden sm:inline">Emergency</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-3 py-1 text-xs font-semibold rounded-md ${
            activeTab === 'triage' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Care Triage
        </button>
        <button
          onClick={() => setActiveTab('teleconsult')}
          className={`px-3 py-1 text-xs font-semibold rounded-md ${
            activeTab === 'teleconsult' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Doctor (TinyFish)
        </button>
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`px-3 py-1 text-xs font-semibold rounded-md ${
            activeTab === 'benchmark' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Benchmark & API
        </button>
      </div>
    </header>
  );
};
