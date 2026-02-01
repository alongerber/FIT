import { useMemo, useState } from 'react';
import { Card } from '../../shared/components/Card';
import { useStore } from '../../shared/hooks/useStore';
import { sortByDate } from '../../modules/weight/utils/calculations';
import { generateInsights } from '../../modules/insights/engine/insight-rules';
import type { Insight } from '../../shared/types';

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

const categoryLabels: Record<string, string> = {
  trend: 'מגמה',
  volatility: 'תנודתיות',
  goal: 'יעד',
  consistency: 'עקביות',
  health: 'בריאות',
};

type CategoryFilter = 'all' | Insight['category'];

export function Insights() {
  const { entries, profile } = useStore();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const sorted = useMemo(() => sortByDate(entries), [entries]);
  const insights = useMemo(() => generateInsights(sorted, profile), [sorted, profile]);

  const filtered = filter === 'all' ? insights : insights.filter(i => i.category === filter);
  const categories: CategoryFilter[] = ['all', 'trend', 'volatility', 'goal', 'consistency', 'health'];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">תובנות</h1>

      {/* Category filter */}
      {insights.length > 0 && (
        <div className="flex gap-2 flex-wrap" role="group" aria-label="סינון לפי קטגוריה">
          {categories.map(cat => {
            const count = cat === 'all' ? insights.length : insights.filter(i => i.category === cat).length;
            if (cat !== 'all' && count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filter === cat ? 'bg-accent text-background' : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat === 'all' ? 'הכל' : categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {insights.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary mb-2">
            {entries.length < 3
              ? 'צריך לפחות 3 מדידות כדי להציג תובנות'
              : 'אין תובנות חדשות כרגע'}
          </p>
          <p className="text-text-muted text-sm">
            {entries.length < 3
              ? 'המשך לשקול כל יום ונציג לך תובנות על ההתקדמות שלך'
              : 'זה בסדר! כשיהיה משהו חדש, תראה את זה כאן'}
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-6">
          <p className="text-text-secondary">אין תובנות בקטגוריה הזו</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3" role="list" aria-label="רשימת תובנות">
          {filtered.map(insight => (
            <Card key={insight.id} className={`border-r-4 ${typeStyles[insight.type] || ''} animate-fade-in`} role="listitem">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-text-primary">{insight.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  insight.type === 'warning' ? 'bg-danger/10 text-danger' :
                  insight.type === 'action' ? 'bg-warning/10 text-warning' :
                  insight.type === 'positive' ? 'bg-success/10 text-success' :
                  'bg-surface text-text-muted'
                }`}>{typeLabels[insight.type]}</span>
              </div>
              <p className="text-text-secondary text-sm">{insight.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
