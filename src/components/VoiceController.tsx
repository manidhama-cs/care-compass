import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { AppLanguage, I18N } from '../i18n/translations.ts';

interface VoiceControllerProps {
  language: AppLanguage;
  onTranscriptConfirmed: (text: string) => void;
  isProcessing?: boolean;
}

// Speak helper function with 0.9x rate and Indian voices
export function speakAloud(text: string, language: AppLanguage, rate: number = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop overlapping audio

    // Clean markdown/symbols
    const cleanText = text
      .replace(/[🚨🤒💉🩸👨‍⚕️★•·]/g, '')
      .replace(/[*_#]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // Slower rate for elderly comprehension

    const langCode = language === 'Hindi' || language === 'Hinglish' ? 'hi-IN' : 'en-IN';
    utterance.lang = langCode;

    // Pick hi-IN or en-IN voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      v => v.lang === langCode || v.lang.startsWith(langCode.slice(0, 2))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  language,
  onTranscriptConfirmed,
  isProcessing = false
}) => {
  const t = I18N[language];
  const [isListening, setIsListening] = useState(false);
  const [transcriptCandidate, setTranscriptCandidate] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    // Populate voices for speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startVoiceInput = () => {
    setSpeechError(null);
    setTranscriptCandidate(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'Hindi'
          ? "आपके ब्राउज़र में आवाज़ पहचान (Web Speech) उपलब्ध नहीं है। कृपया नीचे लिखकर बताएं।"
          : "Web Speech API is not supported in this browser. Please type below."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Hindi' || language === 'Hinglish' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        if (result && result.trim()) {
          setTranscriptCandidate(result.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            language === 'Hindi'
              ? "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में अनुमति दें या लिखें।"
              : "Microphone permission denied. Please allow microphone access or type below."
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError(err.message || 'Error starting speech recognition');
    }
  };

  const handleConfirm = () => {
    if (transcriptCandidate) {
      const confirmed = transcriptCandidate;
      setTranscriptCandidate(null);
      onTranscriptConfirmed(confirmed);
    }
  };

  const handleRetry = () => {
    setTranscriptCandidate(null);
    startVoiceInput();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Giant Voice Input Button */}
      <button
        onClick={startVoiceInput}
        disabled={isListening || isProcessing}
        title={t.tapToSpeak}
        className={`group relative flex items-center justify-center gap-3.5 w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all shadow-lg cursor-pointer ${
          isListening
            ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-emerald-600/25'
        }`}
      >
        <div className={`p-2 rounded-full ${isListening ? 'bg-red-600' : 'bg-emerald-700/80'}`}>
          {isListening ? (
            <MicOff className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
          ) : (
            <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </div>
        <span className="tracking-wide">
          {isListening ? t.listening : t.tapToSpeak}
        </span>
      </button>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2 max-w-lg">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Voice Transcript Confirmation Modal / Banner */}
      {transcriptCandidate && (
        <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-500 shadow-xl max-w-xl w-full text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {t.speechConfirmTitle}
          </p>

          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 my-3">
            "{transcriptCandidate}"
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.speechConfirmBtn}</span>
            </button>

            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold text-base transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.speechRetryBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
