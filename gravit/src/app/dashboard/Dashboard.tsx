import { useState, useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Tooltip, TOOLTIPS } from '../../shared/components/Tooltip';
import { useStore } from '../../shared/hooks/useStore';
import { todayISO, generateId, formatDateHebrew } from '../../shared/utils/date-helpers';
import { calcLevelMetrics, calcDynamicsMetrics, calcTrendMetrics, calcSMA7, sortByDate, calcVolatilityMetrics } from '../../modules/weight/utils/calculations';
import { calcBodyMetrics } from '../../modules/metrics/utils/body-metrics';
import { calcGoalMetrics } from '../../modules/metrics/utils/goal-analysis';
import { generateInsights } from '../../modules/insights/engine/insight-rules';
import { calcPredictions } from '../../modules/weight/utils/predictions';
import { WeightChart } from '../../modules/weight/components/WeightChart';

type Period = '1W' | '1M' | '3M' | 'ALL';

const CONDITION_OPTIONS = [
  { value: 'morning_fasted', label: 'בוקר לפני אכילה' },
  { value: 'during_day', label: 'במהלך היום' },
  { value: 'post_workout', label: 'אחרי אימון' },
  { value: 'other', label: 'אחר' },
];

function filterByPeriod(entries: ReturnType<typeof sortByDate>, period: Period) {
  if (period === 'ALL') return entries;
  const now = new Date();
  const days = period === '1W' ? 7 : period === '1M' ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
  return entries.filter(e => e.date >= cutoff);
}

export function Dashboard() {
  const { profile, entries, addWeightEntry } = useStore();
  const [weightInput, setWeightInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [period, setPeriod] = useState<Period>('1M');
  const [saved, setSaved] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [outlierWarning, setOutlierWarning] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  const sorted = useMemo(() => sortByDate(entries), [entries]);
  const filtered = useMemo(() => filterByPeriod(sorted, period), [sorted, period]);
  const level = useMemo(() => calcLevelMetrics(filtered), [filtered]);
  const dynamics = useMemo(() => calcDynamicsMetrics(sorted), [sorted]);
  const trend = useMemo(() => calcTrendMetrics(sorted), [sorted]);
  const volatility = useMemo(() => calcVolatilityMetrics(sorted), [sorted]);
  const bodyMetrics = useMemo(() => profile && level ? calcBodyMetrics(profile, level.currentWeight) : null, [profile, level]);
  const goalMetrics = useMemo(() =>
    profile?.targetWeightKg && sorted.length > 0
      ? calcGoalMetrics(sorted, profile.targetWeightKg, profile.targetDate || null, sorted[0].weightKg)
      : null,
    [sorted, profile]
  );
  const insights = useMemo(() => generateInsights(sorted, profile), [sorted, profile]);
  const topInsight = insights[0] || null;
  const sma7Data = useMemo(() => calcSMA7(filtered), [filtered]);
  const predictions = useMemo(() => showPredictions ? calcPredictions(sorted) : [], [sorted, showPredictions]);

  const todayEntry = sorted.find(e => e.date === todayISO());

  const checkOutlier = (weight: number): boolean => {
    if (!volatility || sorted.length < 7) return false;
    const mean = sorted.reduce((s, e) => s + e.weightKg, 0) / sorted.length;
    const diff = Math.abs(weight - mean);
    if (diff > 2 * volatility.sd) {
      const sign = weight > mean ? '+' : '-';
      setOutlierWarning(
        `המדידה חריגה (${sign}${Math.round(diff * 10) / 10} ק"ג מהממוצע). ייתכן שנובעת מתנאי מדידה שונים. לשמור?`
      );
      return true;
    }
    return false;
  };

  const doSave = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight < 30 || weight > 300) return;
    addWeightEntry({
      id: generateId(),
      userId: profile?.id || '',
      date: selectedDate,
      weightKg: weight,
      bodyFatPct: bodyFatInput ? parseFloat(bodyFatInput) : null,
      note: noteInput || null,
      measurementConditions: conditionInput || null,
      createdAt: new Date().toISOString(),
    });
    setWeightInput('');
    setBodyFatInput('');
    setConditionInput('');
    setNoteInput('');
    setOutlierWarning(null);
    setShowExtended(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight < 30 || weight > 300) return;
    if (!checkOutlier(weight)) {
      doSave();
    }
  };

  const weekChange = trend && sorted.length >= 7
    ? Math.round(trend.slope * 7 * 10) / 10
    : null;
  const monthChange = dynamics && sorted.length >= 14
    ? Math.round(((sorted[sorted.length - 1]?.weightKg || 0) -
        (sorted.find(e => e.date >= new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])?.weightKg || sorted[0]?.weightKg || 0)) * 10) / 10
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">GRAVIT</h1>
          <p className="text-text-muted text-sm">{formatDateHebrew(todayISO())}</p>
        </div>
      </div>

      {/* Weight Input */}
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder={todayEntry ? String(todayEntry.weightKg) : '0.0'}
              aria-label="הזנת משקל בק&quot;ג"
              className="flex-1 bg-surface text-text-primary rounded-xl px-4 py-3 text-2xl font-inter text-center border border-surface focus:border-accent outline-none transition-colors"
            />
            <span className="text-text-secondary">ק&quot;ג</span>
          </div>

          {/* Extended inputs */}
          {showExtended && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-text-muted text-xs mb-1">
                    אחוז שומן
                    <Tooltip content={TOOLTIPS.fm}><span className="text-accent mr-1">?</span></Tooltip>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatInput}
                    onChange={e => setBodyFatInput(e.target.value)}
                    placeholder="—"
                    aria-label="אחוז שומן"
                    className="w-full bg-surface text-text-primary rounded-xl px-3 py-2 border border-surface focus:border-accent outline-none font-inter text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-text-muted text-xs mb-1">תנאי מדידה</label>
                  <select
                    value={conditionInput}
                    onChange={e => setConditionInput(e.target.value)}
                    aria-label="תנאי מדידה"
                    className="w-full bg-surface text-text-primary rounded-xl px-3 py-2 border border-surface focus:border-accent outline-none text-sm"
                  >
                    <option value="">—</option>
                    {CONDITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-text-muted text-xs mb-1">הערה (עד 200 תווים)</label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value.slice(0, 200))}
                  placeholder="הערה אופציונלית..."
                  aria-label="הערה"
                  className="w-full bg-surface text-text-primary rounded-xl px-3 py-2 border border-surface focus:border-accent outline-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Outlier warning dialog */}
          {outlierWarning && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 animate-fade-in" role="alert">
              <p className="text-warning text-sm mb-2">{outlierWarning}</p>
              <div className="flex gap-2">
                <Button onClick={doSave} className="text-xs px-3 py-1">כן, שמור</Button>
                <Button variant="secondary" onClick={() => { setOutlierWarning(null); setWeightInput(''); }} className="text-xs px-3 py-1">בטל</Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                aria-label="תאריך מדידה"
                className="bg-transparent text-text-muted text-sm border-none outline-none"
              />
              <button
                onClick={() => setShowExtended(!showExtended)}
                className="text-text-muted text-xs hover:text-accent transition-colors"
                aria-expanded={showExtended}
              >
                {showExtended ? 'פחות פרטים' : 'פרטים נוספים'}
              </button>
            </div>
            <Button onClick={handleSave} disabled={!weightInput || !!outlierWarning} className="text-sm px-4 py-2">
              {saved ? (
                <span className="animate-fade-in">נשמר</span>
              ) : 'שמור'}
            </Button>
          </div>
          {todayEntry && (
            <p className="text-text-muted text-xs">שקילה אחרונה היום: {todayEntry.weightKg} ק&quot;ג</p>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      {level && (
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="סטטיסטיקות מהירות">
          {[
            { label: 'היום', value: level.currentWeight, isBase: true },
            { label: 'שבוע', value: weekChange, isBase: false },
            { label: 'חודש', value: monthChange, isBase: false },
            { label: 'סה״כ', value: dynamics?.totalChange ?? null, isBase: false },
          ].map(stat => (
            <Card key={stat.label} className="!p-3 text-center">
              <div className="text-text-muted text-xs">{stat.label}</div>
              <div className={`font-inter font-bold text-lg ${
                !stat.isBase && stat.value !== null && stat.value < 0 ? 'text-success' :
                !stat.isBase && stat.value !== null && stat.value > 0 ? 'text-danger' : 'text-text-primary'
              }`}>
                {stat.value !== null ? (!stat.isBase && stat.value > 0 ? '+' : '') + stat.value : '–'}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {filtered.length >= 2 && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-2" role="group" aria-label="בחירת תקופה">
              {(['1W', '1M', '3M', 'ALL'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  aria-pressed={period === p}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    period === p ? 'bg-accent text-background' : 'bg-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p === 'ALL' ? 'הכל' : p}
                </button>
              ))}
            </div>
            {sorted.length >= 7 && (
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                aria-pressed={showPredictions}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  showPredictions ? 'bg-accent-alt/20 text-accent-alt' : 'bg-surface text-text-muted hover:text-text-primary'
                }`}
              >
                {showPredictions ? 'הסתר תחזית' : 'תחזית'}
              </button>
            )}
          </div>
          <WeightChart
            entries={filtered}
            sma7={sma7Data}
            targetWeight={profile?.targetWeightKg ?? undefined}
            predictions={predictions}
          />
          {showPredictions && predictions.length > 0 && (
            <div className="mt-2 text-text-muted text-xs flex gap-4">
              <span>תחזית 7 ימים: <span className="text-accent font-inter">{predictions[6]?.predicted}</span> ק&quot;ג</span>
              <span>30 ימים: <span className="text-accent font-inter">{predictions[29]?.predicted}</span> ק&quot;ג</span>
              <Tooltip content={TOOLTIPS.confidenceBand}><span className="text-accent">?</span></Tooltip>
            </div>
          )}
        </Card>
      )}

      {/* Empty state for new users */}
      {entries.length < 2 && (
        <Card className="text-center py-6">
          <p className="text-text-secondary mb-2">הזן משקל יומי כדי לראות את הגרף והתובנות</p>
          <p className="text-text-muted text-sm">צריך לפחות 2 מדידות לגרף, 7 למגמה ותחזית</p>
        </Card>
      )}

      {/* Top Insight */}
      {topInsight && (
        <Card className={`border-r-4 ${
          topInsight.type === 'positive' ? 'border-r-success' :
          topInsight.type === 'warning' ? 'border-r-danger' :
          topInsight.type === 'action' ? 'border-r-warning' :
          'border-r-accent'
        }`}>
          <p className="text-sm text-text-secondary mb-1">{topInsight.title}</p>
          <p className="text-text-primary">{topInsight.message}</p>
        </Card>
      )}

      {/* Goal + Body Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {goalMetrics && (
          <Card>
            <div className="text-text-muted text-xs mb-1">התקדמות ליעד</div>
            <div className="h-2 bg-surface rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${goalMetrics.progressPct}%` }}
              />
            </div>
            <div className="text-accent font-bold font-inter">{Math.round(goalMetrics.progressPct)}%</div>
            <div className="text-text-muted text-xs">נשאר: {goalMetrics.gap} ק&quot;ג</div>
            {goalMetrics.estimatedWeeks && (
              <div className="text-text-muted text-xs mt-1">
                ~{goalMetrics.estimatedWeeks.standard} שבועות בקצב רגיל
              </div>
            )}
          </Card>
        )}
        {bodyMetrics && (
          <Card>
            <div className="text-text-muted text-xs mb-1">
              <Tooltip content={TOOLTIPS.bmi}>BMI</Tooltip>
            </div>
            <div className="font-inter font-bold text-xl" style={{ color: bodyMetrics.bmiCategoryColor }}>
              {bodyMetrics.bmi}
            </div>
            <div className="text-text-muted text-xs">{bodyMetrics.bmiCategory}</div>
            <div className="text-text-muted text-xs mt-1">
              טווח תקין: {bodyMetrics.healthyWeightRange.min}–{bodyMetrics.healthyWeightRange.max}
            </div>
          </Card>
        )}
      </div>

      {/* BMR / TDEE */}
      {bodyMetrics && (bodyMetrics.bmr || bodyMetrics.tdee) && (
        <div className="grid grid-cols-2 gap-3">
          {bodyMetrics.bmr && (
            <Card>
              <div className="text-text-muted text-xs mb-1">
                <Tooltip content={TOOLTIPS.bmr}>BMR</Tooltip>
              </div>
              <div className="font-inter font-bold text-lg text-text-primary">{Math.round(bodyMetrics.bmr)}</div>
              <div className="text-text-muted text-xs">קלוריות/יום</div>
            </Card>
          )}
          {bodyMetrics.tdee && (
            <Card>
              <div className="text-text-muted text-xs mb-1">
                <Tooltip content={TOOLTIPS.tdee}>TDEE</Tooltip>
              </div>
              <div className="font-inter font-bold text-lg text-accent-alt">{Math.round(bodyMetrics.tdee)}</div>
              <div className="text-text-muted text-xs">קלוריות/יום</div>
            </Card>
          )}
        </div>
      )}

      {/* Body composition if body fat entered */}
      {level && sorted.length > 0 && sorted[sorted.length - 1].bodyFatPct && (
        <Card>
          <div className="text-text-muted text-xs mb-2">הרכב גוף</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-text-muted text-xs">
                <Tooltip content={TOOLTIPS.fm}>מסת שומן</Tooltip>
              </div>
              <div className="font-inter font-bold text-text-primary">
                {Math.round(level.currentWeight * (sorted[sorted.length - 1].bodyFatPct! / 100) * 10) / 10} ק&quot;ג
              </div>
            </div>
            <div>
              <div className="text-text-muted text-xs">
                <Tooltip content={TOOLTIPS.lbm}>מסת גוף רזה</Tooltip>
              </div>
              <div className="font-inter font-bold text-text-primary">
                {Math.round(level.currentWeight * (1 - sorted[sorted.length - 1].bodyFatPct! / 100) * 10) / 10} ק&quot;ג
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
