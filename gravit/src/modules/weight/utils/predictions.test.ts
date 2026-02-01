import { describe, it, expect } from 'vitest';
import { calcPredictions } from './predictions';
import type { WeightEntry } from '../../../shared/types';

function makeEntry(date: string, weightKg: number): WeightEntry {
  return {
    id: date, userId: 'u1', date, weightKg,
    bodyFatPct: null, note: null, measurementConditions: null,
    createdAt: date,
  };
}

describe('calcPredictions', () => {
  it('returns empty for < 7 entries', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 80 - i * 0.1)
    );
    expect(calcPredictions(entries)).toHaveLength(0);
  });

  it('returns 30 predictions for 7+ entries', () => {
    const entries = Array.from({ length: 14 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 85 - i * 0.1)
    );
    const result = calcPredictions(entries);
    expect(result).toHaveLength(30);
  });

  it('predictions have confidence bands', () => {
    const entries = Array.from({ length: 14 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 85 - i * 0.1)
    );
    const result = calcPredictions(entries);
    for (const pred of result) {
      expect(pred.upper).toBeGreaterThanOrEqual(pred.predicted);
      expect(pred.lower).toBeLessThanOrEqual(pred.predicted);
    }
  });

  it('bands widen over time', () => {
    const entries = Array.from({ length: 14 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 85 - i * 0.1)
    );
    const result = calcPredictions(entries);
    const band7 = result[6].upper - result[6].lower;
    const band30 = result[29].upper - result[29].lower;
    expect(band30).toBeGreaterThan(band7);
  });

  it('confidence decreases over time', () => {
    const entries = Array.from({ length: 14 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, 85 - i * 0.1)
    );
    const result = calcPredictions(entries);
    expect(result[0].confidence).toBe('high');
    expect(result[10].confidence).toBe('medium');
    expect(result[20].confidence).toBe('low');
  });
});
