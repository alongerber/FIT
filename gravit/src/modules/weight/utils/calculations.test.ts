import { describe, it, expect } from 'vitest';
import {
  sortByDate, calcLevelMetrics, calcDailyDeltas, calcDynamicsMetrics,
  calcTrendMetrics, calcVolatilityMetrics, calcSMA7, calcConsistency, calcNoiseRatio,
} from './calculations';
import type { WeightEntry } from '../../../shared/types';

function makeEntry(date: string, weightKg: number): WeightEntry {
  return {
    id: date, userId: 'u1', date, weightKg,
    bodyFatPct: null, note: null, measurementConditions: null,
    createdAt: date,
  };
}

const entries7 = [
  makeEntry('2026-01-01', 85),
  makeEntry('2026-01-02', 84.8),
  makeEntry('2026-01-03', 84.5),
  makeEntry('2026-01-04', 84.7),
  makeEntry('2026-01-05', 84.3),
  makeEntry('2026-01-06', 84.1),
  makeEntry('2026-01-07', 84.0),
];

describe('sortByDate', () => {
  it('sorts entries chronologically', () => {
    const shuffled = [entries7[3], entries7[0], entries7[6], entries7[1]];
    const result = sortByDate(shuffled);
    expect(result[0].date).toBe('2026-01-01');
    expect(result[result.length - 1].date).toBe('2026-01-07');
  });
});

describe('calcLevelMetrics', () => {
  it('returns null for empty array', () => {
    expect(calcLevelMetrics([])).toBeNull();
  });

  it('calculates correct level metrics', () => {
    const result = calcLevelMetrics(entries7)!;
    expect(result.startWeight).toBe(85);
    expect(result.currentWeight).toBe(84);
    expect(result.min).toBe(84);
    expect(result.max).toBe(85);
    expect(result.mean).toBeCloseTo(84.5, 0);
  });
});

describe('calcDailyDeltas', () => {
  it('returns correct deltas', () => {
    const deltas = calcDailyDeltas(entries7);
    expect(deltas).toHaveLength(6);
    expect(deltas[0]).toBeCloseTo(-0.2, 1);
  });
});

describe('calcDynamicsMetrics', () => {
  it('returns null for < 3 entries', () => {
    expect(calcDynamicsMetrics([makeEntry('2026-01-01', 80)])).toBeNull();
  });

  it('calculates total change correctly', () => {
    const result = calcDynamicsMetrics(entries7)!;
    expect(result.totalChange).toBeCloseTo(-1, 0);
    expect(result.daysDown).toBeGreaterThan(result.daysUp);
  });
});

describe('calcTrendMetrics', () => {
  it('returns null for < 7 entries', () => {
    expect(calcTrendMetrics(entries7.slice(0, 5))).toBeNull();
  });

  it('detects downward trend', () => {
    const result = calcTrendMetrics(entries7)!;
    expect(result.direction).toBe('down');
    expect(result.slope).toBeLessThan(0);
    expect(result.rSquared).toBeGreaterThan(0);
    expect(result.sma7).toHaveLength(7);
    expect(result.ema).toHaveLength(7);
  });

  it('detects flat trend', () => {
    const flat = Array.from({ length: 10 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 80 + (i % 2 === 0 ? 0.1 : -0.1))
    );
    const result = calcTrendMetrics(flat)!;
    expect(result.direction).toBe('flat');
  });
});

describe('calcVolatilityMetrics', () => {
  it('returns null for < 7 entries', () => {
    expect(calcVolatilityMetrics(entries7.slice(0, 5))).toBeNull();
  });

  it('calculates volatility metrics', () => {
    const result = calcVolatilityMetrics(entries7)!;
    expect(result.sd).toBeGreaterThan(0);
    expect(result.cv).toBeGreaterThan(0);
    expect(result.iqr).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.outliers)).toBe(true);
  });

  it('detects outliers', () => {
    const withOutlier = [...entries7, makeEntry('2026-01-08', 95)];
    const result = calcVolatilityMetrics(withOutlier)!;
    expect(result.outliers.length).toBeGreaterThan(0);
  });
});

describe('calcSMA7', () => {
  it('returns correct number of values', () => {
    const result = calcSMA7(entries7);
    expect(result).toHaveLength(7);
    expect(result[6].value).toBeCloseTo(84.5, 0);
  });
});

describe('calcConsistency', () => {
  it('returns 100% for consecutive days', () => {
    expect(calcConsistency(entries7)).toBe(100);
  });

  it('returns lower % for gaps', () => {
    const gapped = [makeEntry('2026-01-01', 80), makeEntry('2026-01-10', 79)];
    expect(calcConsistency(gapped)).toBeLessThan(30);
  });
});

describe('calcNoiseRatio', () => {
  it('returns null for insufficient data', () => {
    expect(calcNoiseRatio([makeEntry('2026-01-01', 80)])).toBeNull();
  });

  it('returns a number for valid data', () => {
    const result = calcNoiseRatio(entries7);
    expect(typeof result).toBe('number');
  });
});
