export interface PricingBreakdown {
  distanceKm: number;
  weightKg: number;
  weightTons: number;
  baseRatePerTonKm: number;
  baseFreightCost: number;
  marketPrice: number;
  backhaulDiscountRate: number;
  backhaulDiscountAmount: number;
  driverPayout: number;
  systemRecommendedPrice: number; // alias for driver payout
  platformDiscountRate: number;
  platformFee: number;
  insuranceFee: number;
  retailerBudget: number;
  totalPrice: number;
  savingsPercentage: number;
  co2SavedKg: number;
}

/**
 * Single-source-of-truth realistic commercial freight & backhaul pricing engine.
 * Base rate per ton-km for Indian commercial freight: ₹8-15 / ton-km depending on vehicle class.
 * Reconciles Driver Payout and Retailer Budget:
 *   driverPayout = Math.round(retailerBudget * (1 - platformDiscountRate))
 *   platformFee = retailerBudget - driverPayout
 *   driverPayout + platformFee === retailerBudget (Exact Reconciliation)
 */
export function calculateBackhaulPricing(input: {
  distanceKm: number;
  weightKg: number;
  vehicleType?: string;
  corridorId?: string;
  isReturnTrip?: boolean;
  retailerBudget?: number;
}): PricingBreakdown {
  const distanceKm = Math.max(10, Math.round(input.distanceKm));
  const weightKg = Math.max(50, Math.round(input.weightKg));
  const weightTons = weightKg / 1000;

  // Realistic Base per ton-km commercial freight rate in India (₹8 to ₹15 / ton-km)
  let baseRatePerTonKm = 12; // Standard default LCV/MCV rate
  if (input.vehicleType?.includes('30-Ton') || input.vehicleType?.includes('35-Ton') || input.vehicleType?.includes('Multi-Axle')) {
    baseRatePerTonKm = 9.5; // Heavy Multi-Axle bulk efficiency
  } else if (input.vehicleType?.includes('4-Ton') || input.vehicleType?.includes('Tata 407') || input.vehicleType?.includes('Ace')) {
    baseRatePerTonKm = 14.0; // Light Commercial Vehicle higher per-ton rate
  } else if (weightTons >= 10) {
    baseRatePerTonKm = 9.0;
  } else if (weightTons <= 1) {
    baseRatePerTonKm = 14.5;
  }

  // Minimum base vehicle mobilization cost (fuel + toll baseline for distance)
  const baseMobilization = Math.round(distanceKm * 3.5);
  // Cargo mass freight cost
  const cargoFreight = Math.round(distanceKm * weightTons * baseRatePerTonKm);
  const rawStandardCost = Math.max(1400, baseMobilization + cargoFreight);

  // Standard spot market price (one-way broker booking without return optimization)
  const marketPrice = Math.round(rawStandardCost * 1.35);

  // Backhaul Return Leg Discount: 35% discount for shipper vs spot market
  const isReturn = input.isReturnTrip !== false;
  const backhaulDiscountRate = isReturn ? 0.35 : 0;
  const backhaulDiscountAmount = Math.round(marketPrice * backhaulDiscountRate);

  // Platform discount / take rate (8% commercial SaaS / escrow platform rate)
  const platformDiscountRate = 0.08;

  // Retailer Budget: either passed directly or computed from discounted backhaul market price
  const retailerBudget = input.retailerBudget && input.retailerBudget > 0
    ? input.retailerBudget
    : Math.max(1300, marketPrice - backhaulDiscountAmount);

  // Driver Payout: strictly derived via driver payout = retailer budget * (1 - platform_discount_rate)
  const driverPayout = Math.round(retailerBudget * (1 - platformDiscountRate));

  // Platform Fee: exact difference so driverPayout + platformFee === retailerBudget
  const platformFee = retailerBudget - driverPayout;

  const insuranceFee = 150; // Flat cargo transit insurance
  const totalPrice = retailerBudget + insuranceFee;

  // Shipper savings compared to standard one-way spot broker price
  const savingsPercentage = Math.max(15, Math.round(((marketPrice - retailerBudget) / marketPrice) * 100));

  // CO2 offset: ~85g CO2 per ton-km saved by filling otherwise empty return legs
  const co2SavedKg = Math.round(weightTons * distanceKm * 0.085);

  return {
    distanceKm,
    weightKg,
    weightTons,
    baseRatePerTonKm,
    baseFreightCost: rawStandardCost,
    marketPrice,
    backhaulDiscountRate,
    backhaulDiscountAmount,
    driverPayout,
    systemRecommendedPrice: driverPayout,
    platformDiscountRate,
    platformFee,
    insuranceFee,
    retailerBudget,
    totalPrice,
    savingsPercentage,
    co2SavedKg
  };
}

export const calculateDeterministicPrice = calculateBackhaulPricing;

