/**
 * Module 3: Intelligent Caregiver Matching Engine
 *
 * Implements the benchmark weighted scoring algorithm:
 * - Language Match: 0.35 (Hinglish maps to Hindi/English fluency)
 * - Proximity Score: 0.30 (Haversine distance within max_radius_km; 1.0 for teleconsult)
 * - Skill Alignment: 0.20 (Procedure-specific capability)
 * - Quality Rating: 0.15 (Normalized caregiver rating / 5.0)
 *
 * Invariants:
 * - Emergency cases (emergency_112) return matched_caregivers: []
 * - Teleconsultation ignores physical distance
 * - Inactive caregivers are filtered out
 * - Returns top 1-3 caregivers with human-readable rationale
 */

import { CareType, Location, MatchedCaregiverResult, Caregiver } from '../types/triage.ts';
import { CAREGIVERS } from '../data/caregivers.ts';

// Default central Delhi NCR fallback location
export const DEFAULT_DELHI_NCR_LOCATION: Location = {
  lat: 28.6139,
  lng: 77.2090
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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

export function matchCaregivers(
  careType: CareType,
  userLocation?: Location,
  userLanguage: string = 'auto',
  userInput: string = '',
  caregiverRoster: Caregiver[] = CAREGIVERS
): { matchedCaregivers: MatchedCaregiverResult[]; locationUsed: Location; isFallbackLocation: boolean } {
  // HARD INVARIANT: Emergency routing or null care type returns empty list
  if (careType === 'emergency_112' || !careType) {
    return {
      matchedCaregivers: [],
      locationUsed: userLocation || DEFAULT_DELHI_NCR_LOCATION,
      isFallbackLocation: !userLocation
    };
  }

  const isFallbackLocation = !userLocation || isNaN(userLocation.lat) || isNaN(userLocation.lng);
  const location = isFallbackLocation ? DEFAULT_DELHI_NCR_LOCATION : userLocation!;

  // 1. Determine Target Role
  let targetRole: 'medic' | 'doctor' | 'phlebotomist';
  if (careType === 'home_nursing' || careType === 'paramedic_home_visit') {
    targetRole = 'medic';
  } else if (careType === 'lab_test_home') {
    targetRole = 'phlebotomist';
  } else if (careType === 'teleconsultation') {
    targetRole = 'doctor';
  } else {
    return { matchedCaregivers: [], locationUsed: location, isFallbackLocation };
  }

  // Detect relevant required skills from user query
  const lowerInput = userInput.toLowerCase();
  const desiredSkills: string[] = [];
  if (/injection|insulin|im|iv/i.test(lowerInput)) desiredSkills.push('injection_im', 'injection_iv');
  if (/dressing|wound|bedsore|patti/i.test(lowerInput)) desiredSkills.push('wound_dressing', 'post_surgical_care');
  if (/bp|sugar|vitals/i.test(lowerInput)) desiredSkills.push('bp_sugar_check', 'vitals_monitoring');
  if (/catheter/i.test(lowerInput)) desiredSkills.push('catheter_care');
  if (/sample|blood\s*test|cbc|thyroid/i.test(lowerInput)) desiredSkills.push('sample_collection', 'home_phlebotomy');
  if (/teleconsult|doctor|reports|second\s*opinion/i.test(lowerInput)) desiredSkills.push('teleconsultation', 'report_review');

  const candidatesWithScore: { caregiver: Caregiver; score: number; distance: number; reason: string }[] = [];

  for (const cg of caregiverRoster) {
    // Must be active and match role
    if (!cg.active || cg.role !== targetRole) {
      continue;
    }

    // Distance calculation
    const distance = calculateHaversineDistance(
      location.lat,
      location.lng,
      cg.base_lat,
      cg.base_lng
    );

    // Distance constraint (teleconsultation ignores distance)
    const isVirtual = careType === 'teleconsultation';
    if (!isVirtual && distance > cg.max_radius_km) {
      continue;
    }

    // A. Language Score (0.35 weight)
    let langScore = 0.5;
    const targetLang = (userLanguage === 'auto' || userLanguage === 'Hinglish') ? 'Hindi' : userLanguage;
    if (cg.languages.some(l => l.toLowerCase() === targetLang.toLowerCase())) {
      langScore = 1.0;
    } else if (cg.languages.includes('Hindi') || cg.languages.includes('English')) {
      langScore = 0.8;
    }

    // B. Proximity Score (0.30 weight)
    let proxScore = 1.0;
    if (!isVirtual) {
      proxScore = Math.max(0, 1 - distance / cg.max_radius_km);
    }

    // C. Skill Alignment Score (0.20 weight)
    let skillScore = 0.7;
    if (desiredSkills.length > 0) {
      const matchCount = desiredSkills.filter(s => cg.skills.includes(s)).length;
      if (matchCount > 0) {
        skillScore = 1.0;
      }
    } else {
      skillScore = 0.85;
    }

    // D. Rating Score (0.15 weight)
    const ratingScore = Math.min(1.0, cg.rating / 5.0);

    // Weighted composite
    const compositeScore = Number(
      (0.35 * langScore + 0.30 * proxScore + 0.20 * skillScore + 0.15 * ratingScore).toFixed(2)
    );

    // Human-readable reason
    const distText = isVirtual ? 'Virtual Doctor' : `${distance.toFixed(1)} km away`;
    const langText = cg.languages.slice(0, 2).join(' & ');
    const reason = `${langText} speaking, ${distText}, free ${cg.free_from}-${cg.free_until}, rated ${cg.rating.toFixed(1)}★ (${cg.qualification})`;

    candidatesWithScore.push({
      caregiver: cg,
      score: compositeScore,
      distance,
      reason
    });
  }

  // Sort descending by score, tie-break by rating and proximity
  candidatesWithScore.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.caregiver.rating !== a.caregiver.rating) return b.caregiver.rating - a.caregiver.rating;
    return a.distance - b.distance;
  });

  // Top 1 to 3 caregivers
  const topMatches: MatchedCaregiverResult[] = candidatesWithScore.slice(0, 3).map(c => ({
    caregiver_id: c.caregiver.caregiver_id,
    score: c.score,
    reason: c.reason
  }));

  return {
    matchedCaregivers: topMatches,
    locationUsed: location,
    isFallbackLocation
  };
}
