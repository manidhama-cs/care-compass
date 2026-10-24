/**
 * CareCompass Isomorphic Triage Client
 *
 * Provides a resilient dual-mode client adapter:
 * 1. Primary: Communicates with Express full-stack API (/api/triage/session).
 * 2. Automatic Static / GitHub Pages Fallback:
 *    When deployed to GitHub Pages, static Vercel, Netlify, or in offline mode where Express
 *    backend endpoints do not exist (404/405/network error), it seamlessly runs the screening
 *    state machine (runSessionScreening) directly in the browser runtime!
 *
 * This ensures the interactive two-way triage screening NEVER breaks when the repo
 * is pushed to GitHub and deployed on static hosting.
 */

import {
  SessionTriageRequest,
  SessionTriageResponse,
  TriageResponse
} from '../types/triage.ts';
import { runSessionScreening } from './screeningStateMachine.ts';
import { sessionStore } from './sessionStore.ts';

/**
 * Executes a session triage turn with graceful fallback to browser-native execution.
 */
export async function executeSessionTriage(
  request: SessionTriageRequest
): Promise<SessionTriageResponse> {
  const isStaticHost =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('github.io') ||
      window.location.protocol === 'file:');

  // If we know we're on a static host like GitHub Pages, bypass network call immediately
  if (isStaticHost) {
    try {
      return runSessionScreening(request);
    } catch (clientErr) {
      console.error('[CareCompass] Client runtime error:', clientErr);
    }
  }

  // Attempt backend API call first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/triage/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    } else {
      console.warn(
        `[CareCompass] Backend responded with status ${res.status}. Falling back to browser-native screening engine.`
      );
    }
  } catch (netErr) {
    console.warn(
      '[CareCompass] Backend API unreachable (static GitHub deployment or network offline). Activating browser-native screening engine:',
      netErr
    );
  }

  // Resilient Browser-Native Execution: All state machine, safety checks,
  // entity extraction, and caregiver ranking run 100% in-browser!
  return runSessionScreening(request);
}

/**
 * Resets a screening session across both backend and local store.
 */
export async function resetSessionTriage(sessionId?: string): Promise<void> {
  try {
    await fetch('/api/triage/session/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
  } catch {
    // Expected on static hosting; ignore
  }

  if (sessionId) {
    sessionStore.clearSession(sessionId);
  }
}
