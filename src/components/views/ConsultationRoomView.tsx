import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  User,
  ShieldCheck,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { downloadPrescriptionPdf, downloadConsultationSummaryPdf } from '../../services/pdfGenerator.ts';
import { PrescriptionItem, DigitalPrescription } from '../../types/platform.ts';

export const ConsultationRoomView: React.FC = () => {
  const [state, setState] = useState(platformStore.getState());
  const { currentRole, activeConsultation, prescriptions } = state;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'vitals'>('chat');
  const [callDuration, setCallDuration] = useState(148); // in seconds
  const [isCallActive, setIsCallActive] = useState(true);

  // Prescription modal state
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxNotes, setRxNotes] = useState('Diagnosis: Acute allergic rhinopharyngitis with mild seasonal bronchospasm.');
  const [rxFollowUp, setRxFollowUp] = useState('Follow up in 5 days if cough or fever persists. Drink warm fluids.');
  const [medList, setMedList] = useState<PrescriptionItem[]>([
    {
      medicationName: 'Montelukast + Levocetirizine',
      strength: '10mg/5mg',
      dosage: '1 tablet',
      frequency: '0-0-1 (At Bedtime)',
      duration: '5 Days',
      quantity: 5,
      specialInstructions: 'Take at night after food.'
    },
    {
      medicationName: 'Paracetamol 650mg',
      strength: '650mg',
      dosage: '1 tablet',
      frequency: 'SOS (When Needed)',
      duration: '3 Days',
      quantity: 6,
      specialInstructions: 'Only if body temperature exceeds 99.5 F.'
    }
  ]);
  const [rxGenerated, setRxGenerated] = useState<DigitalPrescription | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return platformStore.subscribe(() => {
      setState(platformStore.getState());
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConsultation?.messages]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    platformStore.sendConsultationMessage(chatMessage);
    setChatMessage('');
  };

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultation) return;

    const newRx = platformStore.issuePrescription({
      consultationId: activeConsultation.appointmentId,
      patientId: activeConsultation.patientId,
      patientName: activeConsultation.patientName,
      patientAge: 62,
      patientGender: 'M',
      doctorId: activeConsultation.doctorId,
      doctorName: activeConsultation.doctorName,
      doctorQualification: 'MBBS, MD (Medicine) - AIIMS New Delhi',
      doctorRegistrationNumber: 'DMC-2014-98214',
      clinicalNotes: rxNotes,
      medications: medList,
      allergiesNoted: ['Penicillin', 'Sulfa drugs'],
      followUpAdvice: rxFollowUp
    });

    setRxGenerated(newRx);
    setTimeout(() => {
      setShowRxModal(false);
      setRxGenerated(null);
    }, 2200);
  };

  const handleDownloadSummary = () => {
    if (!activeConsultation) return;
    downloadConsultationSummaryPdf(activeConsultation);
  };

  if (!activeConsultation) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto">
        <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Active Consultation</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          You currently have no ongoing teleconsultation room active. Select a doctor to begin.
        </p>
        <button
          onClick={() => platformStore.switchRole('doctor')}
          className="px-4 py-2 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900"
        >
          Open Doctor Sandbox Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Room Info & Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Encrypted Telehealth Session · Room #{activeConsultation.appointmentId}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live {formatTimer(callDuration)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctor: <span className="font-semibold text-slate-700">{activeConsultation.doctorName}</span> ({activeConsultation.specialization}) · Patient: <span className="font-semibold text-slate-700">{activeConsultation.patientName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentRole === 'doctor' && (
            <button
              onClick={() => setShowRxModal(true)}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Issue Prescription (Rx)
            </button>
          )}

          <button
            onClick={handleDownloadSummary}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Clinical Summary PDF
          </button>
        </div>
      </div>

      {/* Main Split: Left 2/3 Video Feed, Right 1/3 Side Panel (Chat / Notes / Vitals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Video Stream Simulation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 aspect-16/10 flex items-center justify-center shadow-md">
            {/* Primary Video Feed (Doctor or Patient depending on perspective) */}
            {!isVideoOff ? (
              <div className="relative w-full h-full bg-linear-to-b from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full border-2 border-teal-500/60 p-1 flex items-center justify-center bg-slate-800/80 mb-3 shadow-inner">
                  <User className="w-14 h-14 text-teal-400" />
                </div>
                <div className="text-white font-semibold text-sm">
                  {currentRole === 'doctor' ? activeConsultation.patientName : activeConsultation.doctorName}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {currentRole === 'doctor' ? 'Patient (Video & Audio Connected)' : 'Consultant Physician (New Delhi)'}
                </div>
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-slate-200 flex items-center gap-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  HD 1080p · Low Latency (24ms)
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400 text-xs">
                <VideoOff className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                Video Feed Paused
              </div>
            )}

            {/* Picture-in-Picture: Self Cam */}
            <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-900 border border-slate-700 rounded-md overflow-hidden shadow-lg flex flex-col items-center justify-center">
              <User className="w-7 h-7 text-slate-400 mb-1" />
              <div className="text-[10px] text-slate-300 font-medium">You ({currentRole})</div>
            </div>

            {/* Video Overlaid Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full transition-colors ${
                  isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-full transition-colors ${
                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isVideoOff ? 'Start Video' : 'Stop Video'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsCallActive(!isCallActive)}
                className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white ml-2 transition-colors"
                title="End Consultation"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Consultation Guidelines Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Telemedicine Protocol (MCI / NMC Guidelines 2020):</span>
              <span className="ml-1 text-amber-800">
                Prescriptions issued during this teleconsultation are digitally signed, legally valid across registered Indian pharmacies, and securely stored in the patient's medical locker.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Interactive Panel */}
        <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[520px]">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Doctor Notes
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'vitals'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Patient Vitals
            </button>
          </div>

          {/* Tab 1: Live Chat Thread */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {activeConsultation.messages.map((m) => {
                  const isMe =
                    (currentRole === 'doctor' && m.senderRole === 'doctor') ||
                    (currentRole === 'patient' && m.senderRole === 'patient');

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5 px-1">
                        <span className="font-semibold text-slate-700">{m.senderName}</span>
                        <span>· {m.timestamp}</span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[85%] leading-relaxed ${
                          isMe
                            ? 'bg-teal-800 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder={`Type message as ${currentRole}...`}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-teal-800 text-white rounded text-xs font-semibold hover:bg-teal-900"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Clinical Doctor Notes */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Preliminary Assessment / Differential
                </label>
                <input
                  type="text"
                  value={activeConsultation.diagnosisSuggestion}
                  onChange={(e) => {
                    activeConsultation.diagnosisSuggestion = e.target.value;
                    setState({ ...state });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Physician's Consultation Notes
                </label>
                <textarea
                  rows={8}
                  value={activeConsultation.clinicalNotes}
                  onChange={(e) => platformStore.updateConsultationNotes(e.target.value)}
                  placeholder="Record symptoms, duration, examination findings, red-flag exclusions, and dietary advice..."
                  className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">Auto-saved to cloud session</span>
                <button
                  onClick={() => setShowRxModal(true)}
                  className="px-3 py-1.5 bg-teal-800 text-white font-semibold rounded text-xs hover:bg-teal-900"
                >
                  Draft Digital Prescription
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Patient Vitals & History */}
          {activeTab === 'vitals' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Baseline Patient Demographics</h4>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="text-slate-500">Name:</span> {activeConsultation.patientName}</div>
                  <div><span className="text-slate-500">Age/Gender:</span> 62 / Male</div>
                  <div><span className="text-slate-500">Blood Group:</span> B Positive</div>
                  <div><span className="text-slate-500">Location:</span> Saket, New Delhi</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Recent Recorded Vitals</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Blood Pressure</div>
                    <div className="text-base font-bold text-slate-900">128/84 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
                    <div className="text-[10px] text-emerald-700 font-medium">Optimal Controlled</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Oxygen (SpO2)</div>
                    <div className="text-base font-bold text-slate-900">98% <span className="text-xs font-normal text-slate-500">Room Air</span></div>
                    <div className="text-[10px] text-emerald-700 font-medium">Normal</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Pulse Rate</div>
                    <div className="text-base font-bold text-slate-900">76 <span className="text-xs font-normal text-slate-500">bpm</span></div>
                    <div className="text-[10px] text-slate-500">Regular rhythm</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Fasting Glucose</div>
                    <div className="text-base font-bold text-slate-900">118 <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
                    <div className="text-[10px] text-amber-700 font-medium">Pre-diabetic</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-rose-900 mb-1">Documented Drug Allergies</h4>
                <div className="flex gap-2">
                  <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">
                    Penicillin
                  </span>
                  <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">
                    Sulfa Antibiotics
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Issue Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {rxGenerated ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Prescription Issued Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Prescription #{rxGenerated.id} has been digitally signed and made available in {rxGenerated.patientName}'s dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => downloadPrescriptionPdf(rxGenerated)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
                >
                  Download PDF Copy
                </button>
              </div>
            ) : (
              <form onSubmit={handleIssueRx} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Issue Verified Digital Prescription (Rx)</h3>
                    <p className="text-xs text-slate-500">
                      Prescribing Doctor: {activeConsultation.doctorName} (Reg #DMC-2014-98214)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRxModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnosis / Clinical Impression
                  </label>
                  <input
                    type="text"
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                    required
                  />
                </div>

                {/* Medication Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Prescribed Medications</label>
                    <button
                      type="button"
                      onClick={() =>
                        setMedList([
                          ...medList,
                          {
                            medicationName: '',
                            strength: '',
                            dosage: '1 tablet',
                            frequency: '1-0-1',
                            duration: '5 Days',
                            quantity: 10,
                            specialInstructions: 'After meals'
                          }
                        ])
                      }
                      className="text-xs text-teal-800 font-semibold hover:text-teal-900 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Medicine
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-12 gap-2 text-xs">
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Medicine name"
                            value={item.medicationName}
                            onChange={(e) => {
                              const updated = [...medList];
                              updated[idx].medicationName = e.target.value;
                              setMedList(updated);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Strength"
                            value={item.strength}
                            onChange={(e) => {
                              const updated = [...medList];
                              updated[idx].strength = e.target.value;
                              setMedList(updated);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Frequency (e.g. 1-0-1)"
                            value={item.frequency}
                            onChange={(e) => {
                              const updated = [...medList];
                              updated[idx].frequency = e.target.value;
                              setMedList(updated);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Duration"
                            value={item.duration}
                            onChange={(e) => {
                              const updated = [...medList];
                              updated[idx].duration = e.target.value;
                              setMedList(updated);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setMedList(medList.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Follow-up Advice & Lifestyle Precautions
                  </label>
                  <textarea
                    rows={2}
                    value={rxFollowUp}
                    onChange={(e) => setRxFollowUp(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Will be signed using standard SHA-256 digital signature stamp and linked to Delhi Medical Council license.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRxModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900"
                  >
                    Authorize & Sign Prescription
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
