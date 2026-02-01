import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { useStore } from '../../shared/hooks/useStore';
import { sortByDate, calcDailyDeltas } from '../../modules/weight/utils/calculations';
import { formatDateHebrew } from '../../shared/utils/date-helpers';

const CONDITION_LABELS: Record<string, string> = {
  morning_fasted: 'בוקר לפני אכילה',
  during_day: 'במהלך היום',
  post_workout: 'אחרי אימון',
  other: 'אחר',
};

export function History() {
  const { entries, deleteWeightEntry } = useStore();
  const sorted = useMemo(() => sortByDate(entries).reverse(), [entries]);
  const forwardSorted = useMemo(() => sortByDate(entries), [entries]);
  const deltas = useMemo(() => calcDailyDeltas(forwardSorted), [forwardSorted]);

  const getDelta = (index: number) => {
    const fwdIdx = sorted.length - 1 - index;
    if (fwdIdx <= 0) return null;
    return deltas[fwdIdx - 1];
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">היסטוריית שקילות</h1>
      <p className="text-text-muted text-sm">{entries.length} מדידות</p>

      {sorted.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary mb-2">אין מדידות עדיין</p>
          <p className="text-text-muted text-sm">חזור לדשבורד כדי להזין את המדידה הראשונה</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="רשימת שקילות">
          {sorted.map((entry, i) => {
            const delta = getDelta(i);
            return (
              <Card key={entry.id} className="flex items-center justify-between !py-3 animate-fade-in" role="listitem">
                <div>
                  <div className="text-text-primary font-inter font-bold">{entry.weightKg} ק&quot;ג</div>
                  <div className="text-text-muted text-xs">{formatDateHebrew(entry.date)}</div>
                  {entry.bodyFatPct && (
                    <div className="text-text-muted text-xs">שומן: {entry.bodyFatPct}%</div>
                  )}
                  {entry.measurementConditions && (
                    <div className="text-text-muted text-xs">{CONDITION_LABELS[entry.measurementConditions] || entry.measurementConditions}</div>
                  )}
                  {entry.note && <div className="text-text-muted text-xs mt-1">{entry.note}</div>}
                </div>
                <div className="flex items-center gap-3">
                  {delta !== null && (
                    <span className={`font-inter text-sm ${
                      delta < 0 ? 'text-success' : delta > 0 ? 'text-danger' : 'text-text-muted'
                    }`}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <button
                    onClick={() => deleteWeightEntry(entry.date)}
                    className="text-text-muted hover:text-danger text-xs transition-colors"
                    aria-label={`מחק מדידה מתאריך ${formatDateHebrew(entry.date)}`}
                  >
                    מחק
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
