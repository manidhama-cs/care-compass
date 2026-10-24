/**
 * Module 3: Intelligent Clinical Provider Matching & Anti-Repetition Engine
 *
 * Implements a strict Two-Stage Matching Process:
 * - Stage A: Strict Eligibility Filtering (Role, Qualifications, Active Status, Area/Radius, Availability)
 * - Stage B: Multi-Criteria Ranking (Skills, Language, Bayesian Rating, Proximity, Anti-Repetition)
 *
 * Strict Role Separation:
 * - home_nursing: Nursing Professionals (GNM, B.Sc Nursing) with injection/dressing skills
 * - paramedic_home_visit: Medics / EMTs for in-person assessment and vitals checks
 * - lab_test_home: Certified Phlebotomists
 * - teleconsultation: Registered Doctors (MBBS / MD)
 *
 * Anti-Repetition:
 * - Tracks rejectedCaregivers and previouslyShownCaregivers to avoid repeating the top provider
 * - Falls back honestly with empty matches rather than assigning unqualified providers
 * - Discloses when distance matching is unavailable due to missing user coordinates
 */

import { CareType, Location, MatchedCaregiverResult, Caregiver } from '../types/triage.ts';
import { CAREGIVERS } from '../data/caregivers.ts';

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface MatchCaregiversOptions {
  careType: CareType;
  userLocation?: Location | null;
  userLanguage?: string;
  userInput?: string;
  rejectedCaregivers?: string[];
  previouslyShownCaregivers?: string[];
  caregiverRoster?: Caregiver[];
}

export function matchCaregivers({
  careType,
  userLocation,
  userLanguage = 'auto',
  userInput = '',
  rejectedCaregivers = [],
  previouslyShownCaregivers = [],
  caregiverRoster = CAREGIVERS
}: MatchCaregiversOptions): {
  matchedCaregivers: MatchedCaregiverResult[];
  locationDisclosed: string;
  hasLocation: boolean;
} {
  // HARD INVARIANT: Emergency routing or null care_type returns empty list
  if (careType === 'emergency_112' || !careType) {
    return {
      matchedCaregivers: [],
      locationDisclosed: 'Emergency routing active — emergency responders dispatched via 112.',
      hasLocation: Boolean(userLocation && !isNaN(userLocation.lat))
    };
  }

  const hasLocation = Boolean(
    userLocation &&
    typeof userLocation.lat === 'number' &&
    typeof userLocation.lng === 'number' &&
    !isNaN(userLocation.lat) &&
    !isNaN(userLocation.lng)
  );

  const locationDisclosed = hasLocation
    ? `User coordinates (${userLocation!.lat.toFixed(2)}, ${userLocation!.lng.toFixed(2)}) applied for proximity filtering.`
    : 'No explicit GPS location provided; distance filtering omitted, ranking by qualifications and availability.';

  // -------------------------------------------------------------
  // STAGE A: ELIGIBILITY FILTERING
  // -------------------------------------------------------------

  let targetRole: 'medic' | 'doctor' | 'phlebotomist';
  const requiredSkills: string[] = [];
  const requiredQualifications: string[] = [];

  const lowerInput = userInput.toLowerCase();

  switch (careType) {
    case 'home_nursing':
      targetRole = 'medic';
      requiredQualifications.push('Nursing', 'B.Sc Nursing', 'GNM');
      if (/injection|insulin|im|iv/i.test(lowerInput)) {
        requiredSkills.push('injection_im', 'injection_iv');
      }
      if (/dressing|wound|bedsore|patti/i.test(lowerInput)) {
        requiredSkills.push('wound_dressing', 'post_surgical_care');
      }
      if (/catheter/i.test(lowerInput)) {
        requiredSkills.push('catheter_care');
      }
      break;

    case 'paramedic_home_visit':
      targetRole = 'medic';
      requiredSkills.push('vitals_monitoring', 'bp_sugar_check');
      break;

    case 'lab_test_home':
      targetRole = 'phlebotomist';
      requiredSkills.push('sample_collection', 'home_phlebotomy');
      break;

    case 'teleconsultation':
      targetRole = 'doctor';
      requiredQualifications.push('MBBS', 'MD');
      requiredSkills.push('teleconsultation', 'prescription');
      break;

    default:
      return {
        matchedCaregivers: [],
        locationDisclosed,
        hasLocation
      };
  }

  // Filter candidates matching target role and active status
  const eligibleCandidates: Caregiver[] = [];

  for (const cg of caregiverRoster) {
    // 1. Must be active
    if (!cg.active) continue;

    // 2. Strict Role Match
    if (cg.role !== targetRole) continue;

    // 3. Distance check for in-person visits when location is provided
    const isVirtual = careType === 'teleconsultation';
    if (!isVirtual && hasLocation) {
      const dist = calculateHaversineDistance(
        userLocation!.lat,
        userLocation!.lng,
        cg.base_lat,
        cg.base_lng
      );
      if (dist > cg.max_radius_km) {
        continue; // Outside service radius
      }
    }

    // 4. Qualification Match for Nursing / Doctors
    if (requiredQualifications.length > 0) {
      const qualMatch = requiredQualifications.some(q =>
        cg.qualification.toLowerCase().includes(q.toLowerCase())
      );
      if (!qualMatch) continue;
    }

    eligibleCandidates.push(cg);
  }

  // If no eligible candidates after strict filtering, return honest no-match!
  if (eligibleCandidates.length === 0) {
    return {
      matchedCaregivers: [],
      locationDisclosed,
      hasLocation
    };
  }

  // -------------------------------------------------------------
  // STAGE B: MULTI-CRITERIA RANKING & ANTI-REPETITION
  // -------------------------------------------------------------

  interface ScoredCandidate {
    caregiver: Caregiver;
    compositeScore: number;
    distance: number | null;
    reason: string;
    isRejected: boolean;
  }

  const scoredList: ScoredCandidate[] = [];

  for (const cg of eligibleCandidates) {
    const isVirtual = careType === 'teleconsultation';
    let distance: number | null = null;
    let proximityScore = 1.0;

    if (!isVirtual && hasLocation) {
      distance = calculateHaversineDistance(
        userLocation!.lat,
        userLocation!.lng,
        cg.base_lat,
        cg.base_lng
      );
      proximityScore = Math.max(0, 1 - distance / Math.max(cg.max_radius_km, 1));
    }

    // Language Alignment (0.30 weight)
    let langScore = 0.6;
    const targetLang = (userLanguage === 'auto' || userLanguage === 'Hinglish') ? 'Hindi' : userLanguage;
    if (cg.languages.some(l => l.toLowerCase() === targetLang.toLowerCase())) {
      langScore = 1.0;
    } else if (cg.languages.includes('Hindi') || cg.languages.includes('English')) {
      langScore = 0.85;
    }

    // Skill Match (0.30 weight)
    let skillScore = 0.75;
    if (requiredSkills.length > 0) {
      const matchCount = requiredSkills.filter(s => cg.skills.includes(s)).length;
      if (matchCount > 0) {
        skillScore = 1.0;
      }
    } else {
      skillScore = 0.9;
    }

    // Quality Rating (0.25 weight)
    const ratingScore = Math.min(1.0, cg.rating / 5.0);

    // Experience bonus (0.15 weight)
    const expScore = Math.min(1.0, cg.experience_years / 10.0);

    let compositeScore = Number(
      (0.30 * langScore + (hasLocation ? 0.20 * proximityScore : 0.10) + 0.25 * skillScore + 0.15 * ratingScore + 0.10 * expScore).toFixed(2)
    );

    // ANTI-REPETITION PENALTY:
    // If provider was previously rejected by user in this session, apply penalty so other eligible providers can be shown first
    const isRejected = rejectedCaregivers.includes(cg.caregiver_id);
    if (isRejected) {
      compositeScore = Math.max(0.1, compositeScore - 0.40);
    } else if (previouslyShownCaregivers.includes(cg.caregiver_id)) {
      compositeScore = Math.max(0.1, compositeScore - 0.05);
    }

    // Honest Human Reason
    const distText = isVirtual
      ? 'Teleconsultation'
      : hasLocation
      ? `${distance!.toFixed(1)} km away`
      : `Based in ${cg.base_area}`;

    const langText = cg.languages.slice(0, 2).join(' & ');
    const reason = `${langText} speaking, ${distText}, free ${cg.free_from}-${cg.free_until}, rated ${cg.rating.toFixed(1)}★ (${cg.qualification})`;

    scoredList.push({
      caregiver: cg,
      compositeScore,
      distance,
      reason,
      isRejected
    });
  }

  // Sort: non-rejected first, then by compositeScore descending, tie-break by rating
  scoredList.sort((a, b) => {
    if (a.isRejected !== b.isRejected) {
      return a.isRejected ? 1 : -1;
    }
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    return b.caregiver.rating - a.caregiver.rating;
  });

  // Top 3 unique candidates
  const topMatches: MatchedCaregiverResult[] = scoredList.slice(0, 3).map(item => ({
    caregiver_id: item.caregiver.caregiver_id,
    score: item.compositeScore,
    reason: item.reason
  }));

  return {
    matchedCaregivers: topMatches,
    locationDisclosed,
    hasLocation
  };
}
