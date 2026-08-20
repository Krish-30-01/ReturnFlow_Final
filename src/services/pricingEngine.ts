export interface PricingBreakdown {
  distanceKm: number;
  weightKg: number;
  baseRatePerKm: number;
  baseFreightCost: number;
  weightMultiplier: number;
  demandMultiplier: number;
  backhaulDiscountRate: number;
  backhaulDiscountAmount: number;
  systemRecommendedPrice: number;
  platformFee: number;
  insuranceFee: number;
  totalPrice: number;
  marketPrice: number;
  savingsPercentage: number;
  co2SavedKg: number;
}

export function calculateDeterministicPrice(input: {
  distanceKm: number;
  weightKg: number;
  vehicleType?: string;
  corridorId?: string;
  isReturnTrip?: boolean;
}): PricingBreakdown {
  const distanceKm = Math.max(10, input.distanceKm);
  const weightKg = Math.max(100, input.weightKg);

  // Base per-km rate (approx ₹14 to ₹22 per km depending on fleet class)
  let baseRatePerKm = 18;
  if (input.vehicleType?.includes('30-Ton') || input.vehicleType?.includes('35-Ton')) {
    baseRatePerKm = 24;
  } else if (input.vehicleType?.includes('4-Ton')) {
    baseRatePerKm = 14;
  }

  const baseFreightCost = Math.round(distanceKm * baseRatePerKm);
  const weightMultiplier = Math.max(0.85, Math.min(2.5, 0.7 + (weightKg / 5000)));
  const demandMultiplier = 1.05; // Corridor baseline demand coefficient

  // Return-leg efficiency discount (25% discount off standard one-way freight rates)
  const backhaulDiscountRate = input.isReturnTrip !== false ? 0.25 : 0;
  const grossCalculatedPrice = Math.round(baseFreightCost * weightMultiplier * demandMultiplier);
  const backhaulDiscountAmount = Math.round(grossCalculatedPrice * backhaulDiscountRate);

  const systemRecommendedPrice = Math.max(1200, grossCalculatedPrice - backhaulDiscountAmount);

  // Platform commercial model fees
  const platformFee = Math.round(systemRecommendedPrice * 0.03); // 3% SaaS platform fee
  const insuranceFee = 150; // Standard transit insurance cover
  const totalPrice = systemRecommendedPrice + platformFee + insuranceFee;

  // Market price comparison (standard one-way booking without return-trip optimization)
  const marketPrice = Math.round(systemRecommendedPrice * 1.38);
  const savingsPercentage = Math.round(((marketPrice - systemRecommendedPrice) / marketPrice) * 100);

  // Carbon offset: ~85g CO2 per ton-km saved by filling empty return legs
  const co2SavedKg = Math.round((weightKg / 1000) * (distanceKm * 0.085));

  return {
    distanceKm,
    weightKg,
    baseRatePerKm,
    baseFreightCost,
    weightMultiplier,
    demandMultiplier,
    backhaulDiscountRate,
    backhaulDiscountAmount,
    systemRecommendedPrice,
    platformFee,
    insuranceFee,
    totalPrice,
    marketPrice,
    savingsPercentage,
    co2SavedKg
  };
}
