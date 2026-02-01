import type { WeightEntry, LevelMetrics, DynamicsMetrics, TrendMetrics, VolatilityMetrics } from '../../../shared/types';

export function sortByDate(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function calcLevelMetrics(entries: WeightEntry[]): LevelMetrics | null {
  if (entries.length === 0) return null;
  const sorted = sortByDate(entries);
  const weights = sorted.map(e => e.weightKg);
  const sortedWeights = [...weights].sort((a, b) => a - b);
  const mid = Math.floor(sortedWeights.length / 2);
  const median = sortedWeights.length % 2 === 0
    ? (sortedWeights[mid - 1] + sortedWeights[mid]) / 2
    : sortedWeights[mid];

  return {
    mean: round(weights.reduce((s, w) => s + w, 0) / weights.length),
    median: round(median),
    min: round(Math.min(...weights)),
    max: round(Math.max(...weights)),
    startWeight: sorted[0].weightKg,
    currentWeight: sorted[sorted.length - 1].weightKg,
  };
}

export function calcDailyDeltas(entries: WeightEntry[]): number[] {
  const sorted = sortByDate(entries);
  const deltas: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    deltas.push(round(sorted[i].weightKg - sorted[i - 1].weightKg));
  }
  return deltas;
}

export function calcDynamicsMetrics(entries: WeightEntry[]): DynamicsMetrics | null {
  if (entries.length < 3) return null;
  const sorted = sortByDate(entries);
  const deltas = calcDailyDeltas(entries);
  const first = sorted[0].weightKg;
  const last = sorted[sorted.length - 1].weightKg;
  const totalChange = round(last - first);
  const sortedDeltas = [...deltas].sort((a, b) => a - b);
  const mid = Math.floor(sortedDeltas.length / 2);
  const medianDelta = sortedDeltas.length % 2 === 0
    ? (sortedDeltas[mid - 1] + sortedDeltas[mid]) / 2
    : sortedDeltas[mid];

  return {
    totalChange,
    totalChangePct: round((totalChange / first) * 100),
    avgDailyChange: round(deltas.reduce((s, d) => s + d, 0) / deltas.length),
    medianDailyChange: round(medianDelta),
    maxDailyGain: round(Math.max(...deltas)),
    maxDailyLoss: round(Math.min(...deltas)),
    daysUp: deltas.filter(d => d > 0.01).length,
    daysDown: deltas.filter(d => d < -0.01).length,
    daysFlat: deltas.filter(d => Math.abs(d) <= 0.01).length,
    sdDailyChanges: round(standardDeviation(deltas)),
  };
}

export function calcTrendMetrics(entries: WeightEntry[]): TrendMetrics | null {
  if (entries.length < 7) return null;
  const sorted = sortByDate(entries);
  const weights = sorted.map(e => e.weightKg);
  const n = weights.length;

  // Linear regression
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = (n - 1) / 2;
  const yMean = weights.reduce((s, w) => s + w, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (weights[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;

  // R²
  const predicted = xs.map(x => yMean + slope * (x - xMean));
  const ssRes = weights.reduce((s, w, i) => s + (w - predicted[i]) ** 2, 0);
  const ssTot = weights.reduce((s, w) => s + (w - yMean) ** 2, 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  // SMA 7
  const sma7: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i < 6) {
      sma7.push(round(weights.slice(0, i + 1).reduce((s, w) => s + w, 0) / (i + 1)));
    } else {
      sma7.push(round(weights.slice(i - 6, i + 1).reduce((s, w) => s + w, 0) / 7));
    }
  }

  // EMA (α = 0.2)
  const alpha = 0.2;
  const ema: number[] = [weights[0]];
  for (let i = 1; i < n; i++) {
    ema.push(round(alpha * weights[i] + (1 - alpha) * ema[i - 1]));
  }

  const direction: TrendMetrics['direction'] =
    slope < -0.01 ? 'down' : slope > 0.01 ? 'up' : 'flat';

  return {
    slope: round(slope, 4),
    rSquared: round(rSquared, 3),
    direction,
    sma7,
    ema,
  };
}

export function calcVolatilityMetrics(entries: WeightEntry[]): VolatilityMetrics | null {
  if (entries.length < 7) return null;
  const weights = sortByDate(entries).map(e => e.weightKg);
  const mean = weights.reduce((s, w) => s + w, 0) / weights.length;
  const sd = standardDeviation(weights);
  const cv = mean === 0 ? 0 : (sd / mean) * 100;
  const sortedW = [...weights].sort((a, b) => a - b);
  const q1 = sortedW[Math.floor(sortedW.length * 0.25)];
  const q3 = sortedW[Math.floor(sortedW.length * 0.75)];
  const outliers: number[] = [];
  weights.forEach((w, i) => {
    if (Math.abs(w - mean) > 2 * sd) outliers.push(i);
  });

  return { sd: round(sd), cv: round(cv), iqr: round(q3 - q1), outliers };
}

export function calcSMA7(entries: WeightEntry[]): { date: string; value: number }[] {
  const sorted = sortByDate(entries);
  const result: { date: string; value: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = Math.max(0, i - 6);
    const window = sorted.slice(start, i + 1);
    const avg = window.reduce((s, e) => s + e.weightKg, 0) / window.length;
    result.push({ date: sorted[i].date, value: round(avg) });
  }
  return result;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calcConsistency(entries: WeightEntry[]): number {
  if (entries.length < 2) return 100;
  const sorted = sortByDate(entries);
  const first = new Date(sorted[0].date);
  const last = new Date(sorted[sorted.length - 1].date);
  const totalDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86400000) + 1);
  return round((entries.length / totalDays) * 100);
}

export function calcNoiseRatio(entries: WeightEntry[]): number | null {
  const dynamics = calcDynamicsMetrics(entries);
  if (!dynamics || Math.abs(dynamics.totalChange) < 0.1) return null;
  const volatility = calcVolatilityMetrics(entries);
  if (!volatility) return null;
  return round(volatility.sd / Math.abs(dynamics.totalChange));
}
