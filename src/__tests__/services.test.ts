import { calculateDistanceAndDuration, detectCorridor } from '../services/routingEngine';
import { calculateDeterministicPrice } from '../services/pricingEngine';
import { calculateMatchScore } from '../services/matchingEngine';
import { predictFreightPriceAndMatch } from '../services/mlInferenceService';
import { CanonicalShipment } from '../types/logistics';

// 1. Test Routing Engine Consistency
export function testRoutingEngine() {
  const route1 = calculateDistanceAndDuration('Hyderabad', 'Warangal');
  const route2 = calculateDistanceAndDuration('Hyderabad (Uppal)', 'Warangal Industrial Zone');

  console.assert(route1.corridorId === 'HYD-WAR', 'Routing error: HYD-WAR corridor not detected');
  console.assert(route1.distanceKm === 148, 'Routing error: Distance mismatch');
  console.assert(route1.distanceKm === route2.distanceKm, 'Routing error: Inconsistent distance');
  return true;
}

// 2. Test Deterministic Pricing Engine
export function testPricingEngine() {
  const priceA = calculateDeterministicPrice({
    distanceKm: 569,
    weightKg: 2500,
    vehicleType: 'TATA Signa 3523.TK (30-Ton)',
    isReturnTrip: true
  });

  const priceB = calculateDeterministicPrice({
    distanceKm: 569,
    weightKg: 2500,
    vehicleType: 'TATA Signa 3523.TK (30-Ton)',
    isReturnTrip: true
  });

  console.assert(priceA.systemRecommendedPrice === priceB.systemRecommendedPrice, 'Pricing error: Non-deterministic price output');
  console.assert(priceA.platformFee === Math.round(priceA.systemRecommendedPrice * 0.03), 'Pricing error: Platform fee miscalculated');
  return true;
}

// 3. Test Matching Engine Sub-scores
export function testMatchingEngine() {
  const driverShipment: CanonicalShipment = {
    id: 'test-driver-1',
    requestType: 'DRIVER_RETURN_TRIP',
    from: 'Hyderabad',
    to: 'Bangalore',
    corridor: 'HYD-BLR',
    routeDistanceKm: 569,
    routeDurationMin: 540,
    departureDate: '2026-08-22',
    departureTimeWindow: 'Morning',
    totalCapacityKg: 15000,
    availableCapacityKg: 10000,
    weightKg: 10000,
    goodsType: 'General',
    requestedPrice: 18000,
    systemRecommendedPrice: 18000,
    platformFee: 540,
    insuranceFee: 150,
    escrowStatus: 'Unfunded',
    isReturnTrip: true,
    status: 'Searching',
    createdAt: 'Now',
    updatedAt: 'Now'
  };

  const retailerShipment: CanonicalShipment = {
    id: 'test-retailer-1',
    requestType: 'RETAILER_LOAD_REQUEST',
    from: 'Hyderabad',
    to: 'Bangalore',
    corridor: 'HYD-BLR',
    routeDistanceKm: 569,
    routeDurationMin: 540,
    departureDate: '2026-08-22',
    departureTimeWindow: 'Morning',
    totalCapacityKg: 0,
    availableCapacityKg: 0,
    weightKg: 3000,
    goodsType: 'FMCG',
    requestedPrice: 19000,
    systemRecommendedPrice: 18000,
    platformFee: 540,
    insuranceFee: 150,
    escrowStatus: 'Unfunded',
    isReturnTrip: false,
    status: 'Searching',
    createdAt: 'Now',
    updatedAt: 'Now'
  };

  const match = calculateMatchScore(driverShipment, retailerShipment);
  console.assert(match.matchScore >= 90, 'Matching error: High quality match failed score threshold');
  console.assert(match.matchBreakdown.routeScore === 35, 'Matching error: Route sub-score inaccurate');
  return true;
}

// 4. Test ML Inference Service
export function testMLInference() {
  const mlResult = predictFreightPriceAndMatch({
    distanceKm: 569,
    weightKg: 2500,
    vehicleCapacityKg: 15000,
    corridorId: 'HYD-BLR',
    isWeekend: false
  });

  console.assert(mlResult.predictedPrice > 0, 'ML error: Invalid predicted price');
  console.assert(mlResult.r2Score === 0.914, 'ML error: Model R² score mismatch');
  return true;
}

// Run all tests
testRoutingEngine();
testPricingEngine();
testMatchingEngine();
testMLInference();
