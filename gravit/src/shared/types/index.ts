export interface UserProfile {
  id: string;
  displayName: string;
  birthDate: string; // ISO date
  heightCm: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null;
  targetWeightKg: number | null;
  targetDate: string | null; // ISO date
  targetBodyFatPct: number | null;
  measurementTimePreference: string;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // ISO date
  weightKg: number;
  bodyFatPct: number | null;
  note: string | null;
  measurementConditions: string | null;
  createdAt: string;
}

export type InsightType = 'positive' | 'neutral' | 'action' | 'warning' | 'reminder';

export interface Insight {
  id: string;
  type: InsightType;
  category: 'trend' | 'volatility' | 'goal' | 'consistency' | 'health';
  title: string;
  message: string;
}

export interface LevelMetrics {
  mean: number;
  median: number;
  min: number;
  max: number;
  startWeight: number;
  currentWeight: number;
}

export interface DynamicsMetrics {
  totalChange: number;
  totalChangePct: number;
  avgDailyChange: number;
  medianDailyChange: number;
  maxDailyGain: number;
  maxDailyLoss: number;
  daysUp: number;
  daysDown: number;
  daysFlat: number;
  sdDailyChanges: number;
}

export interface TrendMetrics {
  slope: number;
  rSquared: number;
  direction: 'down' | 'flat' | 'up';
  sma7: number[];
  ema: number[];
}

export interface VolatilityMetrics {
  sd: number;
  cv: number;
  iqr: number;
  outliers: number[];
}

export interface GoalMetrics {
  gap: number;
  gapPct: number;
  progressPct: number;
  weeklyRateActual: number;
  weeklyRateRequired: number | null;
  estimatedWeeks: { conservative: number; standard: number; aggressive: number } | null;
}

export interface BodyMetrics {
  bmi: number;
  bmiCategory: string;
  bmiCategoryColor: string;
  bmr: number | null;
  tdee: number | null;
  healthyWeightRange: { min: number; max: number };
}

export interface OnboardingData {
  birthDate: string;
  heightCm: number;
  gender: UserProfile['gender'];
  currentWeight: number;
  targetWeight: number | null;
  targetDate: string | null;
  activityLevel: UserProfile['activityLevel'];
}
