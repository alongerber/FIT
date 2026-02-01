import type { WeightEntry } from '../../../shared/types';
import { sortByDate, calcTrendMetrics, calcVolatilityMetrics } from './calculations';

export interface Prediction {
  date: string;
  predicted: number;
  upper: number;
  lower: number;
  confidence: 'high' | 'medium' | 'low';
}

export function calcPredictions(entries: WeightEntry[]): Prediction[] {
  if (entries.length < 7) return [];

  const sorted = sortByDate(entries);
  const trend = calcTrendMetrics(entries);
  const vol = calcVolatilityMetrics(entries);
  if (!trend || !vol) return [];

  const lastWeight = sorted[sorted.length - 1].weightKg;
  const lastDate = new Date(sorted[sorted.length - 1].date);

  // Use recent 14-day trend if enough data, else overall
  const recentEntries = sorted.slice(-14);
  const recentTrend = recentEntries.length >= 7 ? calcTrendMetrics(recentEntries) : null;

  const predictions: Prediction[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Weighted prediction: 70% recent, 30% overall for >7 day predictions
    let slope: number;
    if (day <= 7) {
      slope = recentTrend?.slope ?? trend.slope;
    } else {
      slope = (recentTrend?.slope ?? trend.slope) * 0.7 + trend.slope * 0.3;
    }

    const predicted = round(lastWeight + slope * day);
    const bandWidth = vol.sd * 1.5 * Math.sqrt(day / 7);
    const upper = round(predicted + bandWidth);
    const lower = round(predicted - bandWidth);

    const confidence: Prediction['confidence'] =
      day <= 7 ? 'high' : day <= 14 ? 'medium' : 'low';

    predictions.push({ date: dateStr, predicted, upper, lower, confidence });
  }

  return predictions;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}
