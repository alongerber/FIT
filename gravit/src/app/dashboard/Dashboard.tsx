import { useState, useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { useStore } from '../../shared/hooks/useStore';
import { todayISO, generateId, formatDateHebrew } from '../../shared/utils/date-helpers';
import { calcLevelMetrics, calcDynamicsMetrics, calcTrendMetrics, calcSMA7, sortByDate } from '../../modules/weight/utils/calculations';
import { calcBodyMetrics } from '../../modules/metrics/utils/body-metrics';
import { calcGoalMetrics } from '../../modules/metrics/utils/goal-analysis';
import { generateInsights } from '../../modules/insights/engine/insight-rules';
import { WeightChart } from '../../modules/weight/components/WeightChart';

type Period = '1W' | '1M' | '3M' | 'ALL';

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

  const sorted = useMemo(() => sortByDate(entries), [entries]);
  const filtered = useMemo(() => filterByPeriod(sorted, period), [sorted, period]);
  const level = useMemo(() => calcLevelMetrics(filtered), [filtered]);
  const dynamics = useMemo(() => calcDynamicsMetrics(sorted), [sorted]);
  const trend = useMemo(() => calcTrendMetrics(sorted), [sorted]);
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

  const todayEntry = sorted.find(e => e.date === todayISO());

  const handleSave = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight < 30 || weight > 300) return;
    addWeightEntry({
      id: generateId(),
      userId: profile?.id || '',
      date: selectedDate,
      weightKg: weight,
      bodyFatPct: null,
      note: null,
      measurementConditions: null,
      createdAt: new Date().toISOString(),
    });
    setWeightInput('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              className="flex-1 bg-surface text-text-primary rounded-xl px-4 py-3 text-2xl font-inter text-center border border-surface focus:border-accent outline-none"
            />
            <span className="text-text-secondary">ק&quot;ג</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-text-muted text-sm border-none outline-none"
            />
            <Button onClick={handleSave} disabled={!weightInput} className="text-sm px-4 py-2">
              {saved ? 'נשמר!' : 'שמור'}
            </Button>
          </div>
          {todayEntry && (
            <p className="text-text-muted text-xs">שקילה אחרונה היום: {todayEntry.weightKg} ק&quot;ג</p>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      {level && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'היום', value: level.currentWeight, suffix: '' },
            { label: 'שבוע', value: weekChange, suffix: '' },
            { label: 'חודש', value: monthChange, suffix: '' },
            { label: 'סה״כ', value: dynamics?.totalChange ?? null, suffix: '' },
          ].map(stat => (
            <Card key={stat.label} className="!p-3 text-center">
              <div className="text-text-muted text-xs">{stat.label}</div>
              <div className={`font-inter font-bold text-lg ${
                stat.value !== null && stat.value < 0 ? 'text-success' :
                stat.value !== null && stat.value > 0 ? 'text-danger' : 'text-text-primary'
              }`}>
                {stat.value !== null ? (stat.label !== 'היום' && stat.value > 0 ? '+' : '') + stat.value : '–'}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {filtered.length >= 2 && (
        <Card>
          <div className="flex gap-2 mb-3">
            {(['1W', '1M', '3M', 'ALL'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  period === p ? 'bg-accent text-background' : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {p === 'ALL' ? 'הכל' : p}
              </button>
            ))}
          </div>
          <WeightChart
            entries={filtered}
            sma7={sma7Data}
            targetWeight={profile?.targetWeightKg ?? undefined}
          />
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
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${goalMetrics.progressPct}%` }}
              />
            </div>
            <div className="text-accent font-bold font-inter">{Math.round(goalMetrics.progressPct)}%</div>
            <div className="text-text-muted text-xs">נשאר: {goalMetrics.gap} ק&quot;ג</div>
          </Card>
        )}
        {bodyMetrics && (
          <Card>
            <div className="text-text-muted text-xs mb-1">BMI</div>
            <div className="font-inter font-bold text-xl" style={{ color: bodyMetrics.bmiCategoryColor }}>
              {bodyMetrics.bmi}
            </div>
            <div className="text-text-muted text-xs">{bodyMetrics.bmiCategory}</div>
          </Card>
        )}
      </div>

      {/* BMR / TDEE */}
      {bodyMetrics && (bodyMetrics.bmr || bodyMetrics.tdee) && (
        <div className="grid grid-cols-2 gap-3">
          {bodyMetrics.bmr && (
            <Card>
              <div className="text-text-muted text-xs mb-1">BMR</div>
              <div className="font-inter font-bold text-lg text-text-primary">{Math.round(bodyMetrics.bmr)}</div>
              <div className="text-text-muted text-xs">קלוריות/יום</div>
            </Card>
          )}
          {bodyMetrics.tdee && (
            <Card>
              <div className="text-text-muted text-xs mb-1">TDEE</div>
              <div className="font-inter font-bold text-lg text-accent-alt">{Math.round(bodyMetrics.tdee)}</div>
              <div className="text-text-muted text-xs">קלוריות/יום</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
