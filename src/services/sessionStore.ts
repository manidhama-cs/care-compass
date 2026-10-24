/**
 * In-Memory Session Store for Multi-Turn Clinical Screening
 *
 * Maintains structured conversation state across turns:
 * - Prevents premature classification on turn 1
 * - Preserves extracted signals across turns
 * - Tracks questionCount independently from conversationHistory.length
 * - Tracks rejected and previously shown caregivers to avoid repetitive recommendations
 *
 * NOTE ON STORAGE ARCHITECTURE & LIMITATIONS:
 * For this hackathon prototype and evaluation benchmark, sessions are held in-memory
 * with a 2-hour sliding TTL. This allows near-zero latency (<5ms) state updates without external database overhead.
 * In a distributed production cluster, this state manager would be backed by Redis or Firestore.
 */

import {
  ScreeningSessionState,
  ScreeningStatus,
  DetectedLanguage,
  Location,
  CareType,
  Urgency,
  ConversationTurn
} from '../types/triage.ts';

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

class SessionStore {
  private sessions: Map<string, ScreeningSessionState> = new Map();

  /**
   * Initializes a new screening session state
   */
  public createSession(
    sessionId?: string,
    initialLanguage: DetectedLanguage = 'Hinglish',
    initialLocation: Location | null = null
  ): ScreeningSessionState {
    const id = sessionId || `SES_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newSession: ScreeningSessionState = {
      sessionId: id,
      conversationHistory: [],
      targetPerson: 'unknown',
      mainConcern: '',
      symptoms: [],
      duration: null,
      severity: 'unknown',
      progression: 'unknown',
      relevantContext: [],
      requestedService: 'none',
      language: initialLanguage,
      location: initialLocation,
      isLocationExplicit: Boolean(initialLocation && !isNaN(initialLocation.lat) && !isNaN(initialLocation.lng)),
      knownAnswers: {},
      missingInformation: ['main_concern', 'target_person'],
      screeningStatus: 'collecting_information',
      questionCount: 0,
      maxQuestions: 5,
      nextQuestion: null,
      suggestedOptions: [],
      careType: null,
      urgency: null,
      reasoning: '',
      matchedCaregivers: [],
      previouslyShownCaregivers: [],
      rejectedCaregivers: [],
      createdAt: now,
      updatedAt: now
    };

    this.sessions.set(id, newSession);
    return newSession;
  }

  /**
   * Gets an existing session or null if not found
   */
  public getSession(sessionId: string): ScreeningSessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiry
    const lastUpdate = new Date(session.updatedAt).getTime();
    if (Date.now() - lastUpdate > SESSION_TTL_MS) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Retrieves an existing session or creates a new one
   */
  public getOrCreateSession(
    sessionId?: string,
    language: DetectedLanguage = 'Hinglish',
    location: Location | null = null
  ): ScreeningSessionState {
    if (sessionId) {
      const existing = this.getSession(sessionId);
      if (existing) {
        if (location && !existing.isLocationExplicit) {
          existing.location = location;
          existing.isLocationExplicit = true;
        }
        return existing;
      }
    }
    return this.createSession(sessionId, language, location);
  }

  /**
   * Updates an existing session
   */
  public saveSession(session: ScreeningSessionState): ScreeningSessionState {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);
    return session;
  }

  /**
   * Records a user rejection of a caregiver to prevent repeating that caregiver first
   */
  public recordCaregiverRejection(sessionId: string, caregiverId: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      if (!session.rejectedCaregivers.includes(caregiverId)) {
        session.rejectedCaregivers.push(caregiverId);
      }
      this.saveSession(session);
    }
  }

  /**
   * Selects a caregiver for booking
   */
  public selectCaregiver(sessionId: string, caregiverId: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.selectedCaregiverId = caregiverId;
      this.saveSession(session);
    }
  }

  /**
   * Clears a session completely
   */
  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Total active sessions count
   */
  public getActiveSessionCount(): number {
    return this.sessions.size;
  }
}

export const sessionStore = new SessionStore();
