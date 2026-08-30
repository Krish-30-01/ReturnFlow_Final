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
 *
 * Indian inter-city truck freight benchmarks (ICICI Logistics, CRISIL, BlackBuck data):
 *   LCV (≤4 ton)         : ₹2.8 – 3.5 / ton-km  (higher fixed cost per km, smaller payload)
 *   MCV (4–14 ton)       : ₹2.0 – 2.6 / ton-km
 *   HCV / Multi-Axle     : ₹1.5 – 2.0 / ton-km  (bulk efficiency on NH corridors)
 *
 * The "spot market" price is a same-day one-way broker booking — no return optimisation.
 * Backhaul legs are priced at a 30–35% discount vs spot because the driver's fixed costs
 * (fuel for the forward leg, driver salary, toll) are already covered.
 *
 * Reconciliation guarantee:
 *   driverPayout + platformFee === retailerBudget  (exact, no rounding gap)
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
  const weightKg   = Math.max(50,  Math.round(input.weightKg));
  const weightTons = weightKg / 1000;

  // ─── Realistic per ton-km base rate (Indian NH freight, 2024–25) ───────────
  let baseRatePerTonKm: number;

  const vt = (input.vehicleType || '').toLowerCase();

  if (vt.includes('4-ton') || vt.includes('tata 407') || vt.includes('ace') || vt.includes('lcv')) {
    // Light Commercial Vehicle — smaller payload, higher fixed cost per ton
    baseRatePerTonKm = 3.2;
  } else if (vt.includes('30-ton') || vt.includes('35-ton') || vt.includes('multi-axle') || vt.includes('signa')) {
    // Heavy multi-axle — bulk NH efficiency
    baseRatePerTonKm = 1.65;
  } else if (vt.includes('14-ton') || vt.includes('ashok') || vt.includes('3118') || vt.includes('mcv')) {
    // Mid-size commercial vehicle
    baseRatePerTonKm = 2.2;
  } else {
    // Default: weight-band heuristic
    if (weightTons >= 15)      baseRatePerTonKm = 1.65; // heavy bulk
    else if (weightTons >= 5)  baseRatePerTonKm = 2.1;  // standard truck
    else if (weightTons >= 1)  baseRatePerTonKm = 2.8;  // small payload
    else                       baseRatePerTonKm = 3.5;  // sub-ton parcel
  }

  // ─── Base freight cost ───────────────────────────────────────────────────
  // Mobilisation = fixed fuel + toll baseline for distance (₹7/km for NH)
  const baseMobilization = Math.round(distanceKm * 7);
  // Cargo mass freight = distance × payload × rate
  const cargoFreight     = Math.round(distanceKm * weightTons * baseRatePerTonKm);
  const rawStandardCost  = Math.max(1200, baseMobilization + cargoFreight);

  // ─── Spot market price (one-way broker, no return optimisation) ──────────
  // Broker adds ~15% margin on top of raw freight cost
  const marketPrice = Math.round(rawStandardCost * 1.15);

  // ─── Backhaul discount ───────────────────────────────────────────────────
  // 30% discount vs spot: driver's forward-leg costs already sunk
  const isReturn             = input.isReturnTrip !== false;
  const backhaulDiscountRate = isReturn ? 0.30 : 0;
  const backhaulDiscountAmount = Math.round(marketPrice * backhaulDiscountRate);

  // ─── Platform take rate ──────────────────────────────────────────────────
  const platformDiscountRate = 0.08; // 8% escrow + platform fee on retailer side

  // ─── Retailer budget & driver payout ────────────────────────────────────
  const retailerBudget = (input.retailerBudget && input.retailerBudget > 0)
    ? input.retailerBudget
    : Math.max(1200, marketPrice - backhaulDiscountAmount);

  // Driver payout is retailerBudget minus the 8% platform fee
  const driverPayout = Math.round(retailerBudget * (1 - platformDiscountRate));
  const platformFee  = retailerBudget - driverPayout; // exact, no rounding gap

  const insuranceFee = 150; // flat cargo transit insurance
  const totalPrice   = retailerBudget + insuranceFee;

  // ─── Savings % ───────────────────────────────────────────────────────────
  // Show genuine savings only — no artificial floor
  const rawSavingsPct   = Math.round(((marketPrice - retailerBudget) / marketPrice) * 100);
  const savingsPercentage = rawSavingsPct > 0 ? rawSavingsPct : 0;

  // ─── CO₂ offset ──────────────────────────────────────────────────────────
  // ~85g CO₂ per ton-km avoided by filling otherwise-empty return legs
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
