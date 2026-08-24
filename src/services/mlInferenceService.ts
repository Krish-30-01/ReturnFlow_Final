import modelArtifact from '../ml/model_artifact.json';

export interface PriceEstimateResult {
  predictedPrice: number;
  confidenceLowerBound: number;
  confidenceUpperBound: number;
  confidenceIntervalText: string;
  predictedMatchScore: number;
  modelName: string;
  modelVersion: string;
  keyFactors: string[];
}

/**
 * Deterministic rule-based freight price estimate.
 * Linear formula calibrated against published Indian truck market rates
 * (₹/ton-km) and backhaul discount benchmarks — fully auditable, no
 * trained-model claims.
 */
export function predictFreightPriceAndMatch(input: {
  distanceKm: number;
  weightKg: number;
  vehicleCapacityKg?: number;
  corridorId?: string;
  isWeekend?: boolean;
}): PriceEstimateResult {
  const distanceKm = Math.max(10, input.distanceKm);
  const weightKg = Math.max(100, input.weightKg);

  const params = modelArtifact.parameters;
  const basePrice = (distanceKm * params.baseRatePerKm) + (weightKg * params.weightCoeff) + params.intercept;
  const weekendMultiplier = input.isWeekend ? 1.08 : 1.0;
  const predictedPrice = Math.round(basePrice * weekendMultiplier);

  const bound = Math.round(predictedPrice * (modelArtifact.expectedAccuracy.tolerancePercent / 100));
  const confidenceLowerBound = predictedPrice - bound;
  const confidenceUpperBound = predictedPrice + bound;

  const predictedMatchScore = Math.min(98, Math.max(65, Math.round(85 + (weightKg > 5000 ? 8 : 4) - (distanceKm > 1000 ? 5 : 0))));

  return {
    predictedPrice,
    confidenceLowerBound,
    confidenceUpperBound,
    confidenceIntervalText: `₹${confidenceLowerBound.toLocaleString()} – ₹${confidenceUpperBound.toLocaleString()} (±${modelArtifact.expectedAccuracy.tolerancePercent}%)`,
    predictedMatchScore,
    modelName: modelArtifact.modelName,
    modelVersion: modelArtifact.version,
    keyFactors: [
      `Highway distance: ${distanceKm} km`,
      `Cargo mass: ${weightKg.toLocaleString()} kg`,
      `Market-calibrated ₹/ton-km rates`,
      `Rule-based pricing heuristic (v${modelArtifact.version})`
    ]
  };
}
