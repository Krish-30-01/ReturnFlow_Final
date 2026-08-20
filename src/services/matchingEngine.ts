import { CanonicalShipment, MatchBreakdown } from '../types/logistics';
import { calculateDeterministicPrice, PricingBreakdown } from './pricingEngine';

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
  const normDriverFrom = driverShipment.from.toLowerCase();
  const normDriverTo = driverShipment.to.toLowerCase();
  const normRetailerFrom = retailerShipment.from.toLowerCase();
  const normRetailerTo = retailerShipment.to.toLowerCase();

  // 1. Route & Corridor Compatibility (0 - 35 points)
  let routeScore = 5;
  const corridorsMatch = driverShipment.corridor === retailerShipment.corridor;

  if (corridorsMatch) {
    if (
      (normDriverFrom.includes(normRetailerFrom) || normRetailerFrom.includes(normDriverFrom)) &&
      (normDriverTo.includes(normRetailerTo) || normRetailerTo.includes(normDriverTo))
    ) {
      routeScore = 35; // Direct city-level match
    } else {
      routeScore = 28; // Corridor match with minor detour
    }
  } else if (
    (driverShipment.corridor === 'DEL-BLR' && retailerShipment.corridor === 'HYD-BLR') ||
    (driverShipment.corridor === 'HYD-BLR' && retailerShipment.corridor === 'DEL-BLR')
  ) {
    routeScore = 22; // Overlapping corridor segment
  }

  // 2. Capacity & Weight Efficiency (0 - 25 points)
  let capacityScore = 10;
  const availableCap = driverShipment.availableCapacityKg || driverShipment.totalCapacityKg || 10000;
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
  if (driverShipment.departureDate === retailerShipment.departureDate) {
    timeWindowScore = 20;
  } else {
    timeWindowScore = 12;
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

  const totalScore = Math.min(99, Math.max(15, routeScore + capacityScore + timeWindowScore + priceScore + co2SavingsScore));

  const pricing = calculateDeterministicPrice({
    distanceKm: driverShipment.routeDistanceKm || 500,
    weightKg: cargoWeight,
    vehicleType: driverShipment.vehicleType,
    corridorId: driverShipment.corridor,
    isReturnTrip: true
  });

  let explanation = '';
  if (totalScore >= 90) {
    explanation = `Optimal backhaul match! Same day schedule, exact route corridor (${driverShipment.corridor}), and high capacity efficiency (${cargoWeight.toLocaleString()} Kg). Saves ₹${(pricing.marketPrice - pricing.systemRecommendedPrice).toLocaleString()} vs standard one-way freight.`;
  } else if (totalScore >= 75) {
    explanation = `Strong partial load compatibility on ${driverShipment.corridor} corridor. Pickup location aligns with driver's primary transit route with minimal detour.`;
  } else {
    explanation = `Moderate corridor alignment on ${driverShipment.corridor}. Truck has ${availableCap.toLocaleString()} Kg spare capacity for return leg.`;
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
