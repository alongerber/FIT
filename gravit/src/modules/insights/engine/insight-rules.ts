import type { WeightEntry, Insight, UserProfile } from '../../../shared/types';
import { sortByDate, calcDailyDeltas, calcTrendMetrics, calcVolatilityMetrics, calcConsistency, calcNoiseRatio } from '../../weight/utils/calculations';
import { calcGoalMetrics } from '../../metrics/utils/goal-analysis';

let insightId = 0;
function makeInsight(type: Insight['type'], category: Insight['category'], title: string, message: string): Insight {
  return { id: `insight-${++insightId}`, type, category, title, message };
}

export function generateInsights(entries: WeightEntry[], profile: UserProfile | null): Insight[] {
  const insights: Insight[] = [];
  if (entries.length < 3) return insights;

  const sorted = sortByDate(entries);
  const deltas = calcDailyDeltas(entries);

  // Streak detection
  let streak = 0;
  let streakDir: 'down' | 'up' | null = null;
  for (let i = deltas.length - 1; i >= 0; i--) {
    if (deltas[i] < -0.01) {
      if (streakDir === 'down' || streakDir === null) { streak++; streakDir = 'down'; }
      else break;
    } else if (deltas[i] > 0.01) {
      if (streakDir === 'up' || streakDir === null) { streak++; streakDir = 'up'; }
      else break;
    } else break;
  }

  if (streakDir === 'down' && streak >= 7) {
    insights.push(makeInsight('positive', 'trend', 'רצף ירידה',
      `${streak} ימי ירידה ברצף. המגמה יציבה. זכור – עלייה יומית קטנה אחרי רצף כזה היא טבעית לחלוטין.`));
  } else if (streakDir === 'up' && streak >= 5) {
    insights.push(makeInsight('neutral', 'trend', 'רצף עלייה',
      `${streak} ימי עלייה ברצף. זה לא בהכרח אומר שאתה לא בכיוון – בדוק תנאי מדידה, צריכת מלח, ומחזוריות.`));
  }

  // Trend insights
  const trend = calcTrendMetrics(entries);
  if (trend) {
    if (trend.direction === 'down' && trend.rSquared > 0.7) {
      insights.push(makeInsight('positive', 'trend', 'מגמת ירידה ברורה',
        `המגמה ברורה וחזקה: ירידה עקבית. קו המגמה מסביר ${Math.round(trend.rSquared * 100)}% מהשינוי.`));
    }
    if (trend.direction === 'flat' && entries.length >= 14) {
      insights.push(makeInsight('neutral', 'trend', 'פלאטו',
        'המשקל ברמה שטוחה כבר שבועיים. אם אתה בגירעון – ייתכן שהגוף הסתגל. שווה לבחון שינויים בתזונה או אימון.'));
    }
  }

  // Volatility
  const vol = calcVolatilityMetrics(entries);
  if (vol) {
    if (vol.cv > 2) {
      insights.push(makeInsight('action', 'volatility', 'תנודתיות גבוהה',
        'תנודתיות גבוהה בימים האחרונים. נסה לשקול באותו זמן ואותם תנאים כל יום.'));
    }
    if (vol.outliers.length > 0) {
      insights.push(makeInsight('neutral', 'volatility', 'מדידה חריגה',
        `זוהו ${vol.outliers.length} מדידות חריגות. ייתכן שנובעות מתנאי מדידה שונים.`));
    }
  }

  const noiseRatio = calcNoiseRatio(entries);
  if (noiseRatio !== null && noiseRatio > 3) {
    insights.push(makeInsight('action', 'volatility', 'רעש גבוה',
      'הרבה תנודות יומיות ביחס למגמה. המספרים היומיים מסיחים את הדעת – תסתכל על הממוצע הנע.'));
  }

  // Goal insights
  if (profile?.targetWeightKg) {
    const goal = calcGoalMetrics(entries, profile.targetWeightKg, profile.targetDate || null, sorted[0].weightKg);
    if (goal) {
      if (goal.progressPct >= 45 && goal.progressPct <= 55) {
        insights.push(makeInsight('positive', 'goal', 'חצי מהדרך!',
          `חצי מהדרך! ירדת ${Math.abs(Math.round((sorted[0].weightKg - sorted[sorted.length - 1].weightKg) * 10) / 10)} ק"ג. ההתמדה משתלמת.`));
      }
      if (goal.weeklyRateRequired && goal.weeklyRateActual < goal.weeklyRateRequired * 0.5) {
        insights.push(makeInsight('action', 'goal', 'קצב איטי',
          `הקצב הנוכחי איטי מהנדרש. כדי להגיע ליעד בזמן, צריך להגביר את הקצב.`));
      }
    }
  }

  // Consistency
  const consistency = calcConsistency(entries);
  if (consistency > 90) {
    insights.push(makeInsight('positive', 'consistency', 'עקביות מעולה',
      `עקביות מדידה מעולה – ${consistency}% מהימים. זה נותן תמונה מדויקת.`));
  }

  // Days without measurement
  const lastEntry = sorted[sorted.length - 1];
  const daysSinceLast = Math.round((Date.now() - new Date(lastEntry.date).getTime()) / 86400000);
  if (daysSinceLast >= 3) {
    insights.push(makeInsight('reminder', 'consistency', 'תזכורת מדידה',
      `עברו ${daysSinceLast} ימים מהמדידה האחרונה. עקביות במדידה חשובה כמו עקביות בתזונה.`));
  }

  // Health: rapid loss
  if (trend && profile) {
    const weeklyLoss = Math.abs(trend.slope * 7);
    const currentWeight = sorted[sorted.length - 1].weightKg;
    const weeklyPct = (weeklyLoss / currentWeight) * 100;
    if (weeklyPct > 1 && trend.direction === 'down') {
      insights.push(makeInsight('warning', 'health', 'ירידה מהירה',
        `הירידה השבועית מהירה (${Math.round(weeklyPct * 10) / 10}%). ירידה מהירה מדי עלולה לגרום לאובדן מסת שריר.`));
    }
  }

  return insights;
}
