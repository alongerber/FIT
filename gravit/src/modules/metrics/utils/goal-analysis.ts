import type { WeightEntry, GoalMetrics } from '../../../shared/types';
import { sortByDate, calcTrendMetrics } from '../../weight/utils/calculations';

export function calcGoalMetrics(
  entries: WeightEntry[],
  targetWeight: number | null,
  targetDate: string | null,
  startWeight: number
): GoalMetrics | null {
  if (entries.length === 0 || targetWeight === null) return null;
  const sorted = sortByDate(entries);
  const current = sorted[sorted.length - 1].weightKg;
  const gap = round(current - targetWeight);
  const gapPct = round((gap / current) * 100);
  const totalNeeded = startWeight - targetWeight;
  const progressPct = totalNeeded === 0 ? 100 : round(((startWeight - current) / totalNeeded) * 100);

  const trend = calcTrendMetrics(entries);
  const weeklyRateActual = trend ? round(trend.slope * 7) : 0;

  let weeklyRateRequired: number | null = null;
  let estimatedWeeks: GoalMetrics['estimatedWeeks'] = null;

  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const weeksLeft = Math.max(1, (target.getTime() - now.getTime()) / (7 * 86400000));
    weeklyRateRequired = round(gap / weeksLeft);
  }

  if (Math.abs(gap) > 0.1) {
    estimatedWeeks = {
      conservative: Math.ceil(Math.abs(gap) / 0.25),
      standard: Math.ceil(Math.abs(gap) / 0.5),
      aggressive: Math.ceil(Math.abs(gap) / 0.75),
    };
  }

  return {
    gap,
    gapPct,
    progressPct: Math.max(0, Math.min(100, progressPct)),
    weeklyRateActual,
    weeklyRateRequired,
    estimatedWeeks,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
