import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { useStore } from '../../shared/hooks/useStore';
import { sortByDate, calcDailyDeltas } from '../../modules/weight/utils/calculations';
import { formatDateHebrew } from '../../shared/utils/date-helpers';

export function History() {
  const { entries, deleteWeightEntry } = useStore();
  const sorted = useMemo(() => sortByDate(entries).reverse(), [entries]);
  const forwardSorted = useMemo(() => sortByDate(entries), [entries]);
  const deltas = useMemo(() => calcDailyDeltas(forwardSorted), [forwardSorted]);

  const getDelta = (index: number) => {
    // index in reversed array -> forward index = sorted.length - 1 - index
    const fwdIdx = sorted.length - 1 - index;
    if (fwdIdx <= 0) return null;
    return deltas[fwdIdx - 1];
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">היסטוריית שקילות</h1>
      <p className="text-text-muted text-sm">{entries.length} מדידות</p>

      {sorted.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-center py-8">אין מדידות עדיין</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((entry, i) => {
            const delta = getDelta(i);
            return (
              <Card key={entry.id} className="flex items-center justify-between !py-3">
                <div>
                  <div className="text-text-primary font-inter font-bold">{entry.weightKg} ק&quot;ג</div>
                  <div className="text-text-muted text-xs">{formatDateHebrew(entry.date)}</div>
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
                    className="text-text-muted hover:text-danger text-xs"
                    aria-label="מחק"
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
