/**
 * CareCompass Production Full-Stack Server
 * Hackathon: HACK IIITD (CAI, IIIT-Delhi)
 *
 * Implements strict REST API Contract:
 * - POST /triage
 * - GET  /health
 * - POST /batch_predict
 * - POST /book
 * - POST /teleconsult
 * - GET  /api/benchmark
 *
 * Integrates Vite middleware in development mode and static production serving.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runFullTriage, evaluateDataset, generatePredictionsCsv } from './src/services/benchmarkService.ts';
import { runSessionScreening } from './src/services/screeningStateMachine.ts';
import { sessionStore } from './src/services/sessionStore.ts';
import { fetchDoctorConsultSlot } from './src/services/tinyfishConsult.ts';
import { CAREGIVERS } from './src/data/caregivers.ts';
import { TRAINING_DATASET, parseTrainingDataset } from './src/data/trainingData.ts';
import { BookingConfirmation } from './src/types/triage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// In-memory bookings store
const BOOKINGS: Record<string, BookingConfirmation> = {};

// ==========================================
// API CONTRACT ROUTES (Root and /api/ prefixed)
// ==========================================

// GET /health
const handleHealth = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    system: 'CareCompass AI Care-Navigation & Matching Engine',
    version: '1.0.0',
    hackathon: 'HACK IIITD (CAI, IIIT-Delhi)',
    caregivers_loaded: CAREGIVERS.length,
    training_samples: TRAINING_DATASET.length,
    active_sessions: sessionStore.getActiveSessionCount(),
    timestamp: new Date().toISOString()
  });
};
app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// GET /caregivers
const handleGetCaregivers = (req: express.Request, res: express.Response) => {
  const { role, active_only = 'true' } = req.query;
  let list = CAREGIVERS;
  if (active_only === 'true') {
    list = list.filter(c => c.active);
  }
  if (role && typeof role === 'string') {
    list = list.filter(c => c.role === role);
  }
  res.json({
    total: list.length,
    caregivers: list
  });
};
app.get('/caregivers', handleGetCaregivers);
app.get('/api/caregivers', handleGetCaregivers);

// POST /triage/session (Session-Aware Multi-Turn Screening Endpoint)
const handleSessionTriage = (req: express.Request, res: express.Response) => {
  try {
    const {
      sessionId,
      user_input,
      language = 'auto',
      location,
      rejected_caregiver_id,
      selected_caregiver_id,
      conversation_history = []
    } = req.body || {};

    if (!user_input || typeof user_input !== 'string' || !user_input.trim()) {
      res.status(400).json({ error: 'Missing required field: user_input' });
      return;
    }

    const sessionResponse = runSessionScreening({
      sessionId,
      user_input: user_input.trim(),
      language,
      location,
      rejected_caregiver_id,
      selected_caregiver_id,
      conversation_history
    });

    res.json(sessionResponse);
  } catch (err: any) {
    console.error('Error in /triage/session:', err);
    res.status(500).json({
      error: 'Session screening processing error',
      details: err?.message
    });
  }
};
app.post('/triage/session', handleSessionTriage);
app.post('/api/triage/session', handleSessionTriage);

// POST /triage/session/reset
const handleSessionReset = (req: express.Request, res: express.Response) => {
  const { sessionId } = req.body || {};
  if (sessionId) {
    sessionStore.clearSession(sessionId);
  }
  res.json({ success: true, message: `Session ${sessionId || 'all'} reset` });
};
app.post('/triage/session/reset', handleSessionReset);
app.post('/api/triage/session/reset', handleSessionReset);

// POST /triage (Stateless Backward-Compatible Endpoint)
const handleTriage = (req: express.Request, res: express.Response) => {
  try {
    const { user_input, language = 'auto', location, conversation_history = [] } = req.body || {};

    if (!user_input || typeof user_input !== 'string' || !user_input.trim()) {
      res.status(400).json({ error: 'Missing required field: user_input' });
      return;
    }

    const triageResult = runFullTriage(
      user_input.trim(),
      language,
      location,
      conversation_history,
      false // live multi-turn adaptive evaluation
    );

    // Exact schema response contract
    res.json({
      follow_up_question: triageResult.follow_up_question,
      care_type: triageResult.care_type,
      urgency: triageResult.urgency,
      red_flags: triageResult.red_flags,
      reasoning: triageResult.reasoning,
      matched_caregivers: triageResult.matched_caregivers,
      detected_language: triageResult.detected_language,
      confidence: triageResult.confidence,
      suggested_options: triageResult.suggested_options
    });
  } catch (err: any) {
    console.error('Error in /triage:', err);
    res.status(500).json({
      follow_up_question: null,
      care_type: null,
      urgency: null,
      red_flags: [],
      reasoning: 'An unexpected processing error occurred.',
      matched_caregivers: []
    });
  }
};
app.post('/triage', handleTriage);
app.post('/api/triage', handleTriage);

// POST /teleconsult
const handleTeleconsult = async (req: express.Request, res: express.Response) => {
  try {
    const slots = await fetchDoctorConsultSlot(req.body || {});
    res.json({
      success: true,
      slots
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/teleconsult', handleTeleconsult);
app.post('/api/teleconsult', handleTeleconsult);

// POST /book
const handleBook = (req: express.Request, res: express.Response) => {
  try {
    const {
      caregiver_id,
      care_type = 'home_nursing',
      patient_name = 'Patient',
      patient_phone = '+91 98765 43210',
      address = 'Delhi NCR',
      preferred_slot = 'Today, earliest slot',
      notes = ''
    } = req.body || {};

    const caregiver = CAREGIVERS.find(c => c.caregiver_id === caregiver_id) || {
      name: 'Dr. Rekha Gupta',
      role: 'medic',
      rating: 4.8
    };

    const bookingId = `BK-${Date.now().toString().slice(-6)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const confirmation: BookingConfirmation = {
      booking_id: bookingId,
      status: 'confirmed',
      caregiver_name: caregiver.name,
      caregiver_role: caregiver.role,
      caregiver_phone: '+91 98110 00000',
      patient_name,
      eta_or_slot: preferred_slot,
      otp,
      service_type: care_type,
      created_at: new Date().toISOString(),
      instructions: [
        'Keep medical prescriptions and reports handy.',
        `Share OTP (${otp}) with the caregiver upon arrival for verification.`,
        'Sanocare support helpline: 1800-SANOCARE (Toll-free).'
      ]
    };

    BOOKINGS[bookingId] = confirmation;
    res.json({ success: true, booking: confirmation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/book', handleBook);
app.post('/api/book', handleBook);

// POST /batch_predict
const handleBatchPredict = (req: express.Request, res: express.Response) => {
  try {
    let csvData = '';
    if (typeof req.body === 'string') {
      csvData = req.body;
    } else if (req.body && req.body.csv) {
      csvData = req.body.csv;
    }

    let dataset = TRAINING_DATASET;
    if (csvData && csvData.includes('user_input')) {
      dataset = parseTrainingDataset(csvData);
    }

    const predictionsCsv = generatePredictionsCsv(dataset);
    const metrics = evaluateDataset(dataset);

    if (req.headers.accept?.includes('text/csv')) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="predictions.csv"');
      res.send(predictionsCsv);
      return;
    }

    res.json({
      success: true,
      total_rows: dataset.length,
      metrics,
      predictions_csv: predictionsCsv
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/batch_predict', handleBatchPredict);
app.post('/api/batch_predict', handleBatchPredict);

// GET /api/benchmark
app.get('/api/benchmark', (req, res) => {
  try {
    const metrics = evaluateDataset(TRAINING_DATASET);
    res.json({
      success: true,
      metrics,
      dataset_size: TRAINING_DATASET.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/caregivers
app.get('/api/caregivers', (req, res) => {
  res.json({
    caregivers: CAREGIVERS
  });
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareCompass server listening on http://0.0.0.0:${PORT}`);
    // Pre-warm evaluation cache
    const evalSummary = evaluateDataset(TRAINING_DATASET);
    console.log(`[Benchmark Pre-warm] Safety Recall: ${(evalSummary.safety_recall * 100).toFixed(1)}% | CareType F1: ${(evalSummary.care_type_macro_f1 * 100).toFixed(1)}% | Urgency F1: ${(evalSummary.urgency_macro_f1 * 100).toFixed(1)}% | NDCG@3: ${evalSummary.ndcg_at_3}`);
  });
}

startServer();
