import React, { useState, useEffect } from 'react';
import { NavigationSidebar, ActiveNavTab } from './components/NavigationSidebar.tsx';
import { PatientDashboard } from './components/dashboards/PatientDashboard.tsx';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard.tsx';
import { CaregiverDashboard } from './components/dashboards/CaregiverDashboard.tsx';
import { AdminDashboard } from './components/dashboards/AdminDashboard.tsx';
import { DoctorDirectoryView } from './components/views/DoctorDirectoryView.tsx';
import { CaregiverDirectoryView } from './components/views/CaregiverDirectoryView.tsx';
import { ConsultationRoomView } from './components/views/ConsultationRoomView.tsx';
import { PharmacyZoneView } from './components/views/PharmacyZoneView.tsx';
import { MedicalHistoryView } from './components/views/MedicalHistoryView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { AppointmentsView } from './components/views/AppointmentsView.tsx';
import { BenchmarkView } from './components/BenchmarkView.tsx';
import { QuickTiles } from './components/QuickTiles.tsx';
import { VoiceController } from './components/VoiceController.tsx';
import { EmergencyView } from './components/EmergencyView.tsx';
import { FollowUpView } from './components/FollowUpView.tsx';
import { ResultView } from './components/ResultView.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AppLanguage, I18N } from './i18n/translations.ts';
import { TriageResponse, ConversationTurn } from './types/triage.ts';
import { platformStore } from './services/platformStore.ts';
import {
  Send,
  PhoneCall,
  Globe,
  Type,
  Layers,
  Sparkles,
  Bot,
  UserCheck,
  HeartHandshake,
  Video,
  Pill,
  FileText,
  Clock,
  Shield,
  Home,
  Activity
} from 'lucide-react';

export default function App() {
  const [storeState, setStoreState] = useState(platformStore.getState());
  const { currentRole, currentUser } = storeState;

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [language, setLanguage] = useState<AppLanguage>('Hinglish');
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Conversation & Triage State
  const [currentStage, setCurrentStage] = useState<'initial' | 'emergency' | 'follow_up' | 'result'>('initial');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState<TriageResponse | null>(null);
  const [followUpCount, setFollowUpCount] = useState(0);

  // Booking Modal State (from Triage Flow)
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCaregiverId, setBookingCaregiverId] = useState<string>('');

  const t = I18N[language];

  useEffect(() => {
    return platformStore.subscribe(() => {
      setStoreState({ ...platformStore.getState() });
    });
  }, []);

  // Core Triage Dispatcher
  const handleExecuteTriage = async (input: string) => {
    if (!input || !input.trim()) return;
    setIsProcessing(true);

    const newHistory: ConversationTurn[] = [
      ...conversationHistory,
      { role: 'user', content: input.trim() }
    ];
    setConversationHistory(newHistory);
    setTextInput('');

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: input.trim(),
          language: language === 'Hinglish' ? 'Hinglish' : language,
          location: { lat: 28.54, lng: 77.27 }, // Delhi NCR
          conversation_history: newHistory
        })
      });

      if (res.ok) {
        const data: TriageResponse = await res.json();
        setLatestResponse(data);

        // Update language if detected
        if (data.detected_language && (data.detected_language === 'Hindi' || data.detected_language === 'English' || data.detected_language === 'Hinglish')) {
          setLanguage(data.detected_language as AppLanguage);
        }

        // Branch by outcome
        if (data.care_type === 'emergency_112') {
          setCurrentStage('emergency');
        } else if (data.follow_up_question) {
          setFollowUpCount(prev => prev + 1);
          setCurrentStage('follow_up');
        } else {
          setCurrentStage('result');
        }
      }
    } catch (err) {
      console.error('Triage execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStage('initial');
    setConversationHistory([]);
    setLatestResponse(null);
    setFollowUpCount(0);
    setTextInput('');
  };

  const handleTriggerEmergency = () => {
    setActiveTab('triage');
    handleExecuteTriage(
      language === 'Hindi'
        ? "आपातकाल! सीने में तेज दर्द है और सांस नहीं आ रही"
        : language === 'Hinglish'
        ? "Emergency! Papa ko severe chest pain hai saans nahi aa rahi"
        : "Emergency! Severe chest pain and breathlessness"
    );
  };

  const handleOpenBooking = (caregiverId: string) => {
    setBookingCaregiverId(caregiverId);
    setShowBookingModal(true);
  };

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const getTextSizeClass = () => {
    if (textSize === 'large') return 'text-lg';
    if (textSize === 'xlarge') return 'text-xl';
    return 'text-base';
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex font-sans ${getTextSizeClass()}`}>
      {/* Platform Navigation Sidebar */}
      <NavigationSidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onEmergencyClick={handleTriggerEmergency}
      />

      {/* Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Universal Top Bar for Language, Accessibility & Quick Roles */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Role:
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-slate-900 text-white">
              {currentRole}
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-xs font-medium text-slate-700 hidden sm:inline">
              {currentUser.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
              {(['English', 'Hindi', 'Hinglish'] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    language === lang
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Text Size Accessibility Toggle */}
            <button
              onClick={cycleTextSize}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1 border border-slate-200"
              title="Cycle font size (A / A+ / A++)"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}</span>
            </button>

            {/* Emergency Hotline Direct Button */}
            <button
              onClick={handleTriggerEmergency}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>112 Emergency</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Render */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {currentRole === 'patient' && <PatientDashboard onNavigate={setActiveTab} />}
              {currentRole === 'doctor' && <DoctorDashboard onNavigate={setActiveTab} />}
              {currentRole === 'caregiver' && <CaregiverDashboard onNavigate={setActiveTab} />}
              {currentRole === 'admin' && <AdminDashboard />}
            </>
          )}

          {/* TAB: AI CARE TRIAGE FLOW */}
          {activeTab === 'triage' && (
            <div className="w-full flex-1 flex flex-col justify-center">
              {/* Stage A: Initial Input (Voice + Quick Tiles + Text) */}
              {currentStage === 'initial' && (
                <div className="space-y-6 max-w-3xl mx-auto w-full py-4">
                  {/* Brand Hero Kicker */}
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold tracking-wider text-teal-800 uppercase bg-teal-50 px-2.5 py-1 rounded border border-teal-200 inline-block mb-1">
                      Module 0 Safety Gate & Non-Diagnostic Care Navigation
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {language === 'Hindi'
                        ? "आपको किस तरह की स्वास्थ्य सेवा चाहिए?"
                        : language === 'Hinglish'
                        ? "Aapko kis tarah ki health care chahiye?"
                        : "How can we assist your health needs today?"}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
                      {t.tagline}
                    </p>
                  </div>

                  {/* Voice Input Section (Elderly First) */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center flex flex-col items-center">
                    <VoiceController
                      language={language}
                      onTranscriptConfirmed={handleExecuteTriage}
                      isProcessing={isProcessing}
                    />

                    {/* Manual Text Box Alternative */}
                    <div className="w-full mt-6 pt-6 border-t border-slate-100 max-w-xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {t.orTypeHere}
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleExecuteTriage(textInput);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder={t.askPlaceholder}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2.5 rounded border border-slate-300 bg-slate-50 text-xs font-medium focus:ring-1 focus:ring-teal-700 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isProcessing || !textInput.trim()}
                          className="px-4 py-2.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.startBtn}</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Quick Touch Tiles */}
                  <QuickTiles
                    language={language}
                    onSelectQuery={handleExecuteTriage}
                    onEmergencyClick={handleTriggerEmergency}
                    onDoctorClick={() => setActiveTab('doctors')}
                  />
                </div>
              )}

              {/* Stage B: Emergency View (Full immersion Red) */}
              {currentStage === 'emergency' && (
                <EmergencyView
                  language={language}
                  redFlags={latestResponse?.red_flags || []}
                  reasoning={latestResponse?.reasoning}
                  onBack={handleReset}
                />
              )}

              {/* Stage C: Follow-Up Screening View */}
              {currentStage === 'follow_up' && latestResponse?.follow_up_question && (
                <FollowUpView
                  language={language}
                  question={latestResponse.follow_up_question}
                  stepNumber={followUpCount}
                  totalSteps={3}
                  suggestedOptions={latestResponse.suggested_options}
                  onAnswer={handleExecuteTriage}
                  onBack={handleReset}
                  isProcessing={isProcessing}
                />
              )}

              {/* Stage D: Result & Matching View */}
              {currentStage === 'result' && latestResponse && (
                <ResultView
                  language={language}
                  careType={latestResponse.care_type}
                  urgency={latestResponse.urgency}
                  reasoning={latestResponse.reasoning}
                  matchedCaregivers={latestResponse.matched_caregivers}
                  onBookCaregiver={handleOpenBooking}
                  onReset={handleReset}
                />
              )}
            </div>
          )}

          {/* TAB: DOCTOR DIRECTORY */}
          {activeTab === 'doctors' && (
            <DoctorDirectoryView onBookSuccess={() => setActiveTab('appointments')} />
          )}

          {/* TAB: CAREGIVER ROSTER */}
          {activeTab === 'caregivers' && (
            <CaregiverDirectoryView />
          )}

          {/* TAB: CONSULTATION ROOM */}
          {activeTab === 'consultation' && (
            <ConsultationRoomView />
          )}

          {/* TAB: MEDICINES & PHARMACY */}
          {activeTab === 'medicines' && (
            <PharmacyZoneView />
          )}

          {/* TAB: MEDICAL HISTORY & VITALS */}
          {activeTab === 'history' && (
            <MedicalHistoryView />
          )}

          {/* TAB: PDF REPORTS & PRESCRIPTIONS */}
          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {/* TAB: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <AppointmentsView
              onJoinRoom={() => setActiveTab('consultation')}
              onBookNew={() => setActiveTab('doctors')}
            />
          )}

          {/* TAB: ADMIN CONSOLE */}
          {activeTab === 'admin' && (
            <AdminDashboard />
          )}

          {/* TAB: BENCHMARK & EVALUATION SUITE */}
          {activeTab === 'benchmark' && (
            <BenchmarkView />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 bg-white">
          <p>
            CareCompass Platform &copy; 2026 · HACK IIITD (CAI, IIIT-Delhi) Hackathon · Sanocare synthetic care-triage dataset v1 (2026) · Strict Non-Diagnostic Routing Boundary
          </p>
        </footer>
      </div>

      {/* Booking Modal (from Triage Flow) */}
      {showBookingModal && (
        <BookingModal
          language={language}
          caregiverId={bookingCaregiverId}
          careType={latestResponse?.care_type || 'home_nursing'}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            setActiveTab('appointments');
          }}
        />
      )}
    </div>
  );
}
