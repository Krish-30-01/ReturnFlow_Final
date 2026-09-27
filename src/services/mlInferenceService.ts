import modelArtifact from '../ml/model_artifact.json';

export interface PriceEstimateResult {
  predictedMatchScore: number;
  priceEstimateLow: number;
  priceEstimateHigh: number;
  confidence: number;
}

export function predictFreightPriceAndMatch(input: {
  distanceKm: number;
  weightKg: number;
  corridorId?: string;
}): PriceEstimateResult {
  const { distanceKm, weightKg } = input;

  // Simple linear model from artifact coefficients
  const coef = modelArtifact.coefficients;
  const rawScore =
    coef.intercept +
    coef.distance_km * distanceKm +
    coef.weight_kg * weightKg +
    coef.corridor_density * 0.6 + // default corridor density
    coef.time_of_day * 9 + // morning slot
    coef.day_of_week * 2; // mid-week

  const predictedMatchScore = Math.min(98, Math.max(45, Math.round(rawScore)));

  // Price band — derived from weight × distance × base rate
  const baseLow = Math.round(distanceKm * (weightKg / 1000) * 1.5 + distanceKm * 6);
  const baseHigh = Math.round(baseLow * 1.35);

  return {
    predictedMatchScore,
    priceEstimateLow: baseLow,
    priceEstimateHigh: baseHigh,
    confidence: 0.74,
  };
}
