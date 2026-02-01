import { describe, it, expect } from 'vitest';
import { calcBMI, getBMICategory, calcBMR, calcTDEE, getAge, getHealthyWeightRange } from './body-metrics';

describe('calcBMI', () => {
  it('calculates BMI correctly', () => {
    // 80kg, 175cm -> 80/(1.75^2) = 26.1
    expect(calcBMI(80, 175)).toBeCloseTo(26.1, 1);
  });

  it('handles edge cases', () => {
    expect(calcBMI(50, 150)).toBeCloseTo(22.2, 1);
    expect(calcBMI(120, 180)).toBeCloseTo(37.0, 0);
  });
});

describe('getBMICategory', () => {
  it('returns correct categories', () => {
    expect(getBMICategory(17).label).toBe('תת-משקל');
    expect(getBMICategory(22).label).toBe('תקין');
    expect(getBMICategory(27).label).toBe('עודף משקל');
    expect(getBMICategory(32).label).toBe('השמנה דרגה I');
    expect(getBMICategory(37).label).toBe('השמנה דרגה II');
    expect(getBMICategory(42).label).toBe('השמנה דרגה III');
  });
});

describe('calcBMR', () => {
  it('calculates male BMR (Mifflin-St Jeor)', () => {
    // Male, 80kg, 175cm, 30 years: (10*80) + (6.25*175) - (5*30) + 5 = 1748.75
    const result = calcBMR(80, 175, 30, 'male');
    expect(result).toBeCloseTo(1748.8, 0);
  });

  it('calculates female BMR', () => {
    // Female, 65kg, 165cm, 25 years: (10*65) + (6.25*165) - (5*25) - 161 = 1395.25
    const result = calcBMR(65, 165, 25, 'female');
    expect(result).toBeCloseTo(1395.3, 0);
  });
});

describe('calcTDEE', () => {
  it('applies correct multipliers', () => {
    expect(calcTDEE(1700, 'sedentary')).toBeCloseTo(2040, 0);
    expect(calcTDEE(1700, 'moderately_active')).toBeCloseTo(2635, 0);
    expect(calcTDEE(1700, 'extra_active')).toBeCloseTo(3230, 0);
  });
});

describe('getAge', () => {
  it('calculates age correctly', () => {
    const age = getAge('1996-01-15');
    // In Feb 2026, this person is 30
    expect(age).toBe(30);
  });
});

describe('getHealthyWeightRange', () => {
  it('returns correct range for 175cm', () => {
    const range = getHealthyWeightRange(175);
    // 18.5 * 1.75^2 = 56.7, 24.9 * 1.75^2 = 76.3
    expect(range.min).toBeCloseTo(56.7, 0);
    expect(range.max).toBeCloseTo(76.3, 0);
  });
});
