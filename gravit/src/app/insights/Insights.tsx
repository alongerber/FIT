import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { useStore } from '../../shared/hooks/useStore';
import { sortByDate } from '../../modules/weight/utils/calculations';
import { generateInsights } from '../../modules/insights/engine/insight-rules';

const typeStyles: Record<string, string> = {
  positive: 'border-r-success',
  neutral: 'border-r-accent',
  action: 'border-r-warning',
  warning: 'border-r-danger',
  reminder: 'border-r-accent-alt',
};

const typeLabels: Record<string, string> = {
  positive: 'חיובי',
  neutral: 'מידע',
  action: 'פעולה',
  warning: 'אזהרה',
  reminder: 'תזכורת',
};

export function Insights() {
  const { entries, profile } = useStore();
  const sorted = useMemo(() => sortByDate(entries), [entries]);
  const insights = useMemo(() => generateInsights(sorted, profile), [sorted, profile]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">תובנות</h1>

      {insights.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-center py-8">
            {entries.length < 3
              ? 'צריך לפחות 3 מדידות כדי להציג תובנות'
              : 'אין תובנות חדשות כרגע'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {insights.map(insight => (
            <Card key={insight.id} className={`border-r-4 ${typeStyles[insight.type] || ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-text-primary">{insight.title}</span>
                <span className="text-xs text-text-muted">{typeLabels[insight.type]}</span>
              </div>
              <p className="text-text-secondary text-sm">{insight.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
