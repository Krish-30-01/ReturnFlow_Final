export interface LogisticsMLRecord {
  id: string;
  timestamp: string;
  corridorId: string;
  distanceKm: number;
  weightKg: number;
  vehicleCapacityKg: number;
  dayOfWeek: number; // 0-6
  isWeekend: number; // 0 or 1
  demandIndex: number; // 0.8 - 1.4
  historicalPricePerKm: number;
  actualPrice: number;
  isMatchSuccess: number; // 0 or 1
}

export function generateHistoricalFreightDataset(): LogisticsMLRecord[] {
  const records: LogisticsMLRecord[] = [];
  const corridors = ['HYD-WAR', 'HYD-BLR', 'DEL-BLR', 'MUM-PUN', 'VIJ-HYD'];
  const distances: Record<string, number> = {
    'HYD-WAR': 148,
    'HYD-BLR': 569,
    'DEL-BLR': 2150,
    'MUM-PUN': 230,
    'VIJ-HYD': 275
  };

  const startDate = new Date('2025-01-01T00:00:00Z').getTime();

  for (let i = 0; i < 500; i++) {
    const corridorId = corridors[i % corridors.length];
    const distanceKm = distances[corridorId];
    const weightKg = Math.round(200 + ((i * 137) % 12000));
    const vehicleCapacityKg = weightKg > 4000 ? 15000 : 4000;
    const dateObj = new Date(startDate + i * 86400000 * 0.5);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
    const demandIndex = parseFloat((0.95 + ((i % 7) * 0.05)).toFixed(2));
    const baseRate = corridorId === 'DEL-BLR' ? 22 : 18;
    const actualPrice = Math.round((distanceKm * baseRate * (0.8 + weightKg / 10000)) * demandIndex * (isWeekend ? 1.08 : 1.0));
    const isMatchSuccess = (actualPrice > 2000 && weightKg <= vehicleCapacityKg) ? 1 : 0;

    records.push({
      id: `ml-rec-${i + 1}`,
      timestamp: dateObj.toISOString(),
      corridorId,
      distanceKm,
      weightKg,
      vehicleCapacityKg,
      dayOfWeek,
      isWeekend,
      demandIndex,
      historicalPricePerKm: baseRate,
      actualPrice,
      isMatchSuccess
    });
  }

  return records;
}
