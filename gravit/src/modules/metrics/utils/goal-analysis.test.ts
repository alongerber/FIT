import { describe, it, expect } from 'vitest';
import { calcGoalMetrics } from './goal-analysis';
import type { WeightEntry } from '../../../shared/types';

function makeEntry(date: string, weightKg: number): WeightEntry {
  return {
    id: date, userId: 'u1', date, weightKg,
    bodyFatPct: null, note: null, measurementConditions: null,
    createdAt: date,
  };
}

describe('calcGoalMetrics', () => {
  it('returns null when no target', () => {
    expect(calcGoalMetrics([makeEntry('2026-01-01', 80)], null, null, 80)).toBeNull();
  });

  it('returns null for empty entries', () => {
    expect(calcGoalMetrics([], 70, null, 80)).toBeNull();
  });

  it('calculates gap correctly', () => {
    const entries = [makeEntry('2026-01-01', 80), makeEntry('2026-01-07', 78)];
    const result = calcGoalMetrics(entries, 70, null, 80)!;
    expect(result.gap).toBe(8); // 78 - 70
    expect(result.progressPct).toBe(20); // (80-78)/(80-70) * 100
  });

  it('provides estimated weeks', () => {
    const entries = [makeEntry('2026-01-01', 80), makeEntry('2026-01-07', 78)];
    const result = calcGoalMetrics(entries, 70, null, 80)!;
    expect(result.estimatedWeeks).not.toBeNull();
    expect(result.estimatedWeeks!.standard).toBe(16); // 8kg / 0.5 per week
  });
});
