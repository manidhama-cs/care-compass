import React, { useEffect } from 'react';
import { Volume2, ArrowLeft, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { VoiceController, speakAloud } from './VoiceController.tsx';

interface FollowUpViewProps {
  language: AppLanguage;
  question: string;
  stepNumber: number;
  totalSteps?: number;
  suggestedOptions?: string[];
  onAnswer: (answer: string) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export const FollowUpView: React.FC<FollowUpViewProps> = ({
  language,
  question,
  stepNumber,
  totalSteps = 3,
  suggestedOptions = [],
  onAnswer,
  onBack,
  isProcessing = false
}) => {
  const t = I18N[language];

  const [customText, setCustomText] = React.useState('');

  // Read question aloud when rendered
  useEffect(() => {
    if (question) {
      speakAloud(question, language);
    }
  }, [question, language]);

  const handleReplay = () => {
    speakAloud(question, language);
  };

  return (
    <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 animate-in fade-in duration-200">
      {/* Top Header with Progress and Audio Replay */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resetConversation}</span>
        </button>

        {/* Progress Hint: Sawal 1 / 3 */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            {t.followUpStep} {stepNumber} / {totalSteps}
          </span>
        </div>

        <button
          onClick={handleReplay}
          title={t.replayAudio}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>{t.replayAudio}</span>
        </button>
      </div>

      {/* Main Big Question Container (>= 22px) */}
      <div className="text-center my-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">
          {question}
        </h2>
      </div>

      {/* Contextual Options Grid (Prominent when available) */}
      {suggestedOptions && suggestedOptions.length > 0 && (
        <div className="my-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center">
            {language === 'Hindi' ? "उचित विकल्प चुनें:" : "Select the best option:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => onAnswer(opt)}
                disabled={isProcessing}
                className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-sm sm:text-base font-bold text-left transition-all cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98] flex items-center justify-between"
              >
                <span>{opt}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm opacity-0 group-hover:opacity-100">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Yes/No Buttons (Shown for binary questions or as quick affirmation) */}
      {(suggestedOptions.length === 0 || /kya\s*(unhe|aapko|koi|saans|chest|dard)|is\s*there|do\s*you|are\s*they/i.test(question)) && (
        <div className="grid grid-cols-2 gap-4 my-4">
          <button
            onClick={() => onAnswer("Haan, yeh takleef hai")}
            disabled={isProcessing}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-lg sm:text-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[58px]"
          >
            <CheckCircle className="w-6 h-6" />
            <span>{t.yes}</span>
          </button>

          <button
            onClick={() => onAnswer("Nahi, aisi koi dikkat nahi (Safe)")}
            disabled={isProcessing}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white font-bold text-lg sm:text-xl shadow-xs transition-all cursor-pointer min-h-[58px]"
          >
            <XCircle className="w-6 h-6 text-slate-500" />
            <span>{t.no}</span>
          </button>
        </div>
      )}

      {/* Type Written Answer Form */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customText.trim()) {
              onAnswer(customText.trim());
              setCustomText('');
            }
          }}
          className="flex items-center gap-2 max-w-xl mx-auto"
        >
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={language === 'Hindi' ? "अपना उत्तर यहाँ टाइप करें..." : "Type your specific response here..."}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="submit"
            disabled={isProcessing || !customText.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>

      {/* Voice Answer Alternative */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {language === 'Hindi' ? "या बोलकर उत्तर दें:" : "Or speak your answer:"}
        </p>
        <VoiceController
          language={language}
          onTranscriptConfirmed={onAnswer}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};
