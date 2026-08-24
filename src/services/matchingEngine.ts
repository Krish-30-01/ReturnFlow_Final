import { CanonicalShipment, MatchBreakdown } from '../types/logistics';
import { calculateDeterministicPrice, PricingBreakdown } from './pricingEngine';
import { calculateGeometricOverlap, getCoordinates } from '../utils/matchingAlgorithm';
import { estimateRoadDistanceKm } from './routingEngine';

export interface EvaluatedMatch {
  id: string;
  driverShipment: CanonicalShipment;
  retailerShipment: CanonicalShipment;
  matchScore: number; // 0 to 100
  matchBreakdown: MatchBreakdown;
  pricing: PricingBreakdown;
  explanation: string;
}

export function calculateMatchScore(
  driverShipment: CanonicalShipment,
  retailerShipment: CanonicalShipment
): EvaluatedMatch {
  // Pure coordinate-based geometry for origin & destination
  const driverCoords = getCoordinates(driverShipment);
  const retailerCoords = getCoordinates(retailerShipment);

  // 1. Geometric Route & Corridor Compatibility (0 - 35 points)
  const geom = calculateGeometricOverlap(
    driverCoords.origin,
    driverCoords.destination,
    retailerCoords.origin,
    retailerCoords.destination
  );

  const routeScore = Math.round(geom.overlapRatio * 35);

  // 2. Capacity & Weight Efficiency (0 - 25 points)
  let capacityScore = 10;
  const availableCap = Math.max(1, driverShipment.availableCapacityKg || driverShipment.totalCapacityKg || 10000);
  const cargoWeight = retailerShipment.weightKg || 500;

  if (availableCap >= cargoWeight) {
    const utilization = cargoWeight / availableCap;
    if (utilization >= 0.7) {
      capacityScore = 25;
    } else if (utilization >= 0.3) {
      capacityScore = 20;
    } else {
      capacityScore = 15;
    }
  } else {
    capacityScore = 5; // Over capacity
  }

  // 3. Time Schedule Window Alignment (0 - 20 points)
  let timeWindowScore = 14;
  if (driverShipment.departureDate && retailerShipment.departureDate) {
    const tripTime = new Date(driverShipment.departureDate).getTime();
    const loadTime = new Date(retailerShipment.departureDate).getTime();
    const diffDays = Math.round(Math.abs(tripTime - loadTime) / 86400000);
    if (diffDays === 0) {
      timeWindowScore = 20;
    } else if (diffDays === 1) {
      timeWindowScore = 15;
    } else {
      timeWindowScore = Math.max(5, 12 - diffDays * 2);
    }
  }

  // 4. Price & Budget Compatibility (0 - 10 points)
  let priceScore = 6;
  const driverMin = driverShipment.requestedPrice || 2000;
  const retailerBudget = retailerShipment.requestedPrice || 2500;

  if (retailerBudget >= driverMin) {
    priceScore = 10;
  } else if (retailerBudget >= driverMin * 0.85) {
    priceScore = 8;
  }

  // 5. Fuel & CO2 Savings Score (0 - 10 points)
  const co2SavingsScore = 9;

  // Zero out if route overlap is zero to prevent false matches
  const totalScore = geom.overlapRatio === 0
    ? 0
    : Math.min(99, Math.max(15, routeScore + capacityScore + timeWindowScore + priceScore + co2SavingsScore));

  const distanceKm = driverShipment.routeDistanceKm || estimateRoadDistanceKm(retailerCoords.origin, retailerCoords.destination);
  const pricing = calculateDeterministicPrice({
    distanceKm,
    weightKg: cargoWeight,
    vehicleType: driverShipment.vehicleType,
    corridorId: driverShipment.corridor,
    isReturnTrip: true
  });

  let explanation = '';
  if (geom.overlapRatio === 0) {
    explanation = `Route mismatch: Transit path (${driverShipment.from} → ${driverShipment.to}) does not align with load route (${retailerShipment.from} → ${retailerShipment.to}).`;
  } else if (totalScore >= 90) {
    explanation = `Optimal backhaul match! Direct coordinate alignment (${geom.description}), same-day schedule, and high capacity efficiency (${cargoWeight.toLocaleString()} Kg). Saves ₹${(pricing.marketPrice - pricing.systemRecommendedPrice).toLocaleString()} vs standard one-way freight.`;
  } else if (totalScore >= 75) {
    explanation = `Strong partial load compatibility (${geom.description}). Pickup location aligns with driver's primary transit route with minimal detour.`;
  } else {
    explanation = `Moderate corridor alignment (${geom.description}). Truck has ${availableCap.toLocaleString()} Kg spare capacity for return leg.`;
  }

  return {
    id: `match-${driverShipment.id}-${retailerShipment.id}`,
    driverShipment,
    retailerShipment,
    matchScore: totalScore,
    matchBreakdown: {
      routeScore,
      capacityScore,
      timeWindowScore,
      priceScore,
      co2SavingsScore
    },
    pricing,
    explanation
  };
}

