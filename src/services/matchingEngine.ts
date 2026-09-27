import { Trip, LoadRequest, MatchResult } from '../types/logistics';
import { calculateMatchScore } from '../utils/matchingAlgorithm';

export interface EvaluatedMatch extends MatchResult {}

export function calculateMatchScoreForPair(
  trip: Trip,
  load: LoadRequest
): EvaluatedMatch {
  return calculateMatchScore(trip, load);
}
