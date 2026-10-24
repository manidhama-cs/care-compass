/**
 * Evaluation, Cross-Validation & Benchmark Pipeline
 *
 * Computes:
 * 1. Safety Recall on emergency_112 (Target: 100.0%)
 * 2. Macro-F1 on Care Type (6 classes)
 * 3. Macro-F1 on Urgency (4 classes)
 * 4. Caregiver Ranking NDCG@3 & Top-1 Agreement
 * 5. Full Confusion Matrices
 * 6. Generates predictions.csv
 */

import { TRAINING_DATASET, TrainingSample } from '../data/trainingData.ts';
import { evaluateSafetyGate } from './safetyDetector.ts';
import { detectLanguage, processIntake } from './intakeEngine.ts';
import { classifyTriage } from './triageClassifier.ts';
import { matchCaregivers } from './caregiverMatcher.ts';
import { BenchmarkMetrics, TriageResponse } from '../types/triage.ts';

export function runFullTriage(
  userInput: string,
  userLanguage: string = 'auto',
  location?: { lat: number; lng: number },
  conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[] = []
): TriageResponse {
  // Turn 0: Language detection
  const detectedLang = detectLanguage(userInput, userLanguage);

  // Module 0: Safety Gate (FIRST, on full context)
  const safetyResult = evaluateSafetyGate(userInput, conversationHistory);

  // Module 1: Smart Intake & Follow-up check
  const intakeResult = processIntake(userInput, detectedLang, conversationHistory.length);

  // Module 2: Triage Classification
  const triageResult = classifyTriage(userInput, safetyResult, intakeResult, conversationHistory);

  // Module 3: Caregiver Matching (empty for emergencies or null care_type)
  const matchResult = matchCaregivers(
    triageResult.care_type,
    location,
    detectedLang,
    userInput
  );

  return {
    follow_up_question: intakeResult.needsFollowUp ? intakeResult.followUpQuestion : null,
    care_type: triageResult.care_type,
    urgency: triageResult.urgency,
    red_flags: safetyResult.redFlags,
    reasoning: triageResult.reasoning,
    matched_caregivers: matchResult.matchedCaregivers,
    detected_language: detectedLang,
    confidence: triageResult.confidence,
    suggested_options: intakeResult.suggestedOptions
  };
}

/**
 * Computes NDCG@3 between predicted caregiver list and ground truth list
 */
function calculateNDCG3(predicted: string[], groundTruth: string[]): number {
  if (groundTruth.length === 0) return predicted.length === 0 ? 1.0 : 0.5;
  if (predicted.length === 0) return 0.0;

  // DCG
  let dcg = 0;
  for (let i = 0; i < Math.min(3, predicted.length); i++) {
    const cgId = predicted[i];
    const relevance = groundTruth.includes(cgId) ? (groundTruth[0] === cgId ? 2 : 1) : 0;
    dcg += relevance / Math.log2(i + 2);
  }

  // IDCG
  let idcg = 2 / Math.log2(2);
  if (groundTruth.length > 1) idcg += 1 / Math.log2(3);
  if (groundTruth.length > 2) idcg += 1 / Math.log2(4);

  return Math.min(1.0, dcg / idcg);
}

/**
 * Runs evaluation on full or subset dataset
 */
export function evaluateDataset(dataset: TrainingSample[] = TRAINING_DATASET): BenchmarkMetrics {
  const startTime = Date.now();

  let emergencyTruePositives = 0;
  let emergencyFalseNegatives = 0;
  let emergencyFalsePositives = 0;
  let totalEmergencyGroundTruth = 0;
  let totalNonEmergencyGroundTruth = 0;

  const careTypeClasses = [
    'paramedic_home_visit',
    'home_nursing',
    'lab_test_home',
    'teleconsultation',
    'emergency_112',
    'null'
  ];

  const urgencyClasses = [
    'emergency',
    'same_day',
    'scheduled',
    'null'
  ];

  // Confusion matrices
  const cmCareType: Record<string, Record<string, number>> = {};
  for (const c1 of careTypeClasses) {
    cmCareType[c1] = {};
    for (const c2 of careTypeClasses) {
      cmCareType[c1][c2] = 0;
    }
  }

  const cmUrgency: Record<string, Record<string, number>> = {};
  for (const u1 of urgencyClasses) {
    cmUrgency[u1] = {};
    for (const u2 of urgencyClasses) {
      cmUrgency[u1][u2] = 0;
    }
  }

  let top1CaregiverHits = 0;
  let caregiverMatchCount = 0;
  let totalNdcg = 0;

  for (const sample of dataset) {
    const pred = runFullTriage(
      sample.user_input,
      sample.detected_language,
      { lat: sample.lat, lng: sample.lng },
      []
    );

    const actualCareType = sample.care_type === null ? 'null' : sample.care_type;
    const predCareType = pred.care_type === null ? 'null' : pred.care_type;

    const actualUrgency = sample.urgency === null ? 'null' : sample.urgency;
    const predUrgency = pred.urgency === null ? 'null' : pred.urgency;

    if (cmCareType[actualCareType] && cmCareType[actualCareType][predCareType] !== undefined) {
      cmCareType[actualCareType][predCareType]++;
    }

    if (cmUrgency[actualUrgency] && cmUrgency[actualUrgency][predUrgency] !== undefined) {
      cmUrgency[actualUrgency][predUrgency]++;
    }

    // Safety metrics
    const isActualEmergency = actualCareType === 'emergency_112';
    const isPredEmergency = predCareType === 'emergency_112';

    if (isActualEmergency) {
      totalEmergencyGroundTruth++;
      if (isPredEmergency) {
        emergencyTruePositives++;
      } else {
        emergencyFalseNegatives++;
      }
    } else {
      totalNonEmergencyGroundTruth++;
      if (isPredEmergency) {
        emergencyFalsePositives++;
      }
    }

    // Caregiver matching metrics
    if (sample.matched_caregiver_ids.length > 0) {
      caregiverMatchCount++;
      const predCgIds = pred.matched_caregivers.map(m => m.caregiver_id);
      if (predCgIds.length > 0 && sample.matched_caregiver_ids.includes(predCgIds[0])) {
        top1CaregiverHits++;
      }
      totalNdcg += calculateNDCG3(predCgIds, sample.matched_caregiver_ids);
    }
  }

  // Safety recall (emergency)
  const safetyRecall = totalEmergencyGroundTruth > 0 ? emergencyTruePositives / totalEmergencyGroundTruth : 1.0;
  const safetyFalseAlarmRate = totalNonEmergencyGroundTruth > 0 ? emergencyFalsePositives / totalNonEmergencyGroundTruth : 0.0;

  // Compute Macro-F1 for Care Type
  let careTypeF1Sum = 0;
  for (const c of careTypeClasses) {
    let tp = cmCareType[c][c];
    let fp = 0;
    let fn = 0;
    for (const other of careTypeClasses) {
      if (other !== c) {
        fp += cmCareType[other][c];
        fn += cmCareType[c][other];
      }
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    careTypeF1Sum += f1;
  }
  const careTypeMacroF1 = careTypeF1Sum / careTypeClasses.length;

  // Compute Macro-F1 for Urgency
  let urgencyF1Sum = 0;
  for (const u of urgencyClasses) {
    let tp = cmUrgency[u][u];
    let fp = 0;
    let fn = 0;
    for (const other of urgencyClasses) {
      if (other !== u) {
        fp += cmUrgency[other][u];
        fn += cmUrgency[u][other];
      }
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    urgencyF1Sum += f1;
  }
  const urgencyMacroF1 = urgencyF1Sum / urgencyClasses.length;

  const top1Agreement = caregiverMatchCount > 0 ? top1CaregiverHits / caregiverMatchCount : 1.0;
  const ndcgAt3 = caregiverMatchCount > 0 ? totalNdcg / caregiverMatchCount : 1.0;
  const avgResponseTimeMs = Math.round((Date.now() - startTime) / dataset.length);

  return {
    total_samples: dataset.length,
    safety_recall: Number(safetyRecall.toFixed(4)),
    safety_false_alarm_rate: Number(safetyFalseAlarmRate.toFixed(4)),
    care_type_macro_f1: Number(careTypeMacroF1.toFixed(4)),
    urgency_macro_f1: Number(urgencyMacroF1.toFixed(4)),
    top1_caregiver_agreement: Number(top1Agreement.toFixed(4)),
    ndcg_at_3: Number(ndcgAt3.toFixed(4)),
    avg_response_time_ms: avgResponseTimeMs,
    confusion_matrix_care_type: cmCareType,
    confusion_matrix_urgency: cmUrgency
  };
}

/**
 * Generates predictions CSV string matching hackathon hidden-test format:
 * id,care_type,urgency,red_flags,follow_up_question
 */
export function generatePredictionsCsv(dataset: TrainingSample[] = TRAINING_DATASET): string {
  const header = "id,care_type,urgency,red_flags,follow_up_question";
  const rows = dataset.map(sample => {
    const pred = runFullTriage(
      sample.user_input,
      sample.detected_language,
      { lat: sample.lat, lng: sample.lng },
      []
    );

    const careTypeStr = pred.care_type || "";
    const urgencyStr = pred.urgency || "";
    const redFlagsStr = pred.red_flags.join(";");
    const followUpStr = pred.follow_up_question ? `"${pred.follow_up_question.replace(/"/g, '""')}"` : "";

    return `${sample.id},${careTypeStr},${urgencyStr},${redFlagsStr},${followUpStr}`;
  });

  return [header, ...rows].join("\n");
}
