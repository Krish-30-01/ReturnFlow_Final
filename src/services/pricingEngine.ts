export interface PricingBreakdown {
  driverPayout: number;
  platformFee: number;
  insuranceFee: number;
  retailerBudget: number;
  totalPrice: number;
  marketPrice: number;
  savingsPercentage: number;
  co2SavedKg: number;
}

const VEHICLE_RATE_PER_TON_KM: Record<string, number> = {
  'LCV': 3.2,
  '4-ton': 3.2,
  'TATA 407': 3.2,
  'MCV': 2.2,
  '14-ton': 2.2,
  'Ashok Leyland': 2.2,
  'HCV': 1.65,
  '30-ton': 1.65,
  'TATA Signa': 1.65,
  'BharatBenz': 1.65,
};

function getRatePerTonKm(vehicleType: string): number {
  const v = vehicleType.toLowerCase();
  if (v.includes('407') || v.includes('4-ton') || v.includes('lcv')) return 3.2;
  if (v.includes('14-ton') || v.includes('mcv') || v.includes('ashok')) return 2.2;
  return 1.65; // HCV default for 30-ton
}

export function calculateBackhaulPricing(input: {
  distanceKm: number;
  weightKg: number;
  vehicleType?: string;
  corridorId?: string;
  isReturnTrip?: boolean;
  retailerBudget?: number;
}): PricingBreakdown {
  const { distanceKm, weightKg, vehicleType = 'HCV', isReturnTrip = true } = input;

  const weightTons = weightKg / 1000;
  const ratePerTonKm = getRatePerTonKm(vehicleType);

  // Base mobilization cost
  const mobilizationBase = distanceKm * 7;

  // Cargo revenue
  const cargoRevenue = distanceKm * weightTons * ratePerTonKm;

  // Raw cost
  const rawCost = mobilizationBase + cargoRevenue;

  // Spot market price (broker markup 15%)
  const spotMarketPrice = Math.round(rawCost * 1.15);

  // Backhaul discount: 30-35% below spot (fixed cost already covered by forward leg)
  const backhaulDiscount = isReturnTrip ? (distanceKm > 500 ? 0.35 : 0.30) : 0;
  const driverPayout = Math.round(spotMarketPrice * (1 - backhaulDiscount));

  // Platform fee: 8% of driver payout
  const platformFee = Math.round(driverPayout * 0.08);

  // Insurance: flat ₹150
  const insuranceFee = 150;

  // Retailer total
  const retailerBudget = driverPayout + platformFee;
  const totalPrice = retailerBudget + insuranceFee;

  // Savings vs spot: compare retailerBudget (ReturnFlow all-in before insurance)
  // against spotMarketPrice (what a broker would charge the shipper)
  const savingsPercentage = Math.round(((spotMarketPrice - retailerBudget) / spotMarketPrice) * 100);

  // CO2 avoided: ICCT factor 0.0811 kg CO2/tonne-km
  const co2SavedKg = Math.round(weightTons * distanceKm * 0.0811);

  return {
    driverPayout,
    platformFee,
    insuranceFee,
    retailerBudget,
    totalPrice,
    marketPrice: spotMarketPrice,
    savingsPercentage: Math.max(0, savingsPercentage),
    co2SavedKg,
  };
}
