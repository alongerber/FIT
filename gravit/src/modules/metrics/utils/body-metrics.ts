import type { UserProfile, BodyMetrics } from '../../../shared/types';

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return round(weightKg / (heightM * heightM));
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'תת-משקל', color: '#F39C12' };
  if (bmi < 25) return { label: 'תקין', color: '#2ECC71' };
  if (bmi < 30) return { label: 'עודף משקל', color: '#F39C12' };
  if (bmi < 35) return { label: 'השמנה דרגה I', color: '#F39C12' };
  if (bmi < 40) return { label: 'השמנה דרגה II', color: '#E74C3C' };
  return { label: 'השמנה דרגה III', color: '#C0392B' };
}

export function calcBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

export function calcTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return round(bmr * (multipliers[activityLevel] || 1.2));
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getHealthyWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: round(18.5 * heightM * heightM),
    max: round(24.9 * heightM * heightM),
  };
}

export function calcBodyMetrics(profile: UserProfile, currentWeight: number): BodyMetrics {
  const bmi = calcBMI(currentWeight, profile.heightCm);
  const category = getBMICategory(bmi);
  const healthyRange = getHealthyWeightRange(profile.heightCm);

  let bmr: number | null = null;
  let tdee: number | null = null;

  if (profile.gender === 'male' || profile.gender === 'female') {
    const age = getAge(profile.birthDate);
    bmr = calcBMR(currentWeight, profile.heightCm, age, profile.gender);
    if (profile.activityLevel) {
      tdee = calcTDEE(bmr, profile.activityLevel);
    }
  }

  return {
    bmi,
    bmiCategory: category.label,
    bmiCategoryColor: category.color,
    bmr,
    tdee,
    healthyWeightRange: healthyRange,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
