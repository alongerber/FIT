import { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { useStore } from '../../shared/hooks/useStore';
import { calcLevelMetrics, sortByDate, calcConsistency } from '../../modules/weight/utils/calculations';
import { calcBodyMetrics } from '../../modules/metrics/utils/body-metrics';
import { exportCSV } from '../../modules/export/utils/csv-export';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'יושבני' },
  { value: 'lightly_active', label: 'פעילות קלה' },
  { value: 'moderately_active', label: 'פעילות בינונית' },
  { value: 'very_active', label: 'פעילות גבוהה' },
  { value: 'extra_active', label: 'פעילות אינטנסיבית' },
] as const;

export function Settings() {
  const { profile, entries, updateProfile, clearAll } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!profile) return null;

  const sorted = sortByDate(entries);
  const level = calcLevelMetrics(sorted);
  const body = level ? calcBodyMetrics(profile, level.currentWeight) : null;
  const consistency = calcConsistency(sorted);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">הגדרות</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="font-medium">פרטים אישיים</h2>
        <div>
          <label className="block text-text-muted text-xs mb-1">גובה (ס&quot;מ)</label>
          <input
            type="number"
            value={profile.heightCm}
            onChange={e => updateProfile({ heightCm: Number(e.target.value) })}
            className="w-full bg-surface text-text-primary rounded-xl px-4 py-2 border border-surface focus:border-accent outline-none font-inter"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1">מגדר</label>
          <select
            value={profile.gender || ''}
            onChange={e => updateProfile({ gender: (e.target.value || null) as typeof profile.gender })}
            className="w-full bg-surface text-text-primary rounded-xl px-4 py-2 border border-surface focus:border-accent outline-none"
          >
            <option value="">לא רוצה לציין</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
            <option value="other">אחר</option>
          </select>
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1">רמת פעילות</label>
          <select
            value={profile.activityLevel || ''}
            onChange={e => updateProfile({ activityLevel: (e.target.value || null) as typeof profile.activityLevel })}
            className="w-full bg-surface text-text-primary rounded-xl px-4 py-2 border border-surface focus:border-accent outline-none"
          >
            <option value="">לא נבחר</option>
            {ACTIVITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-medium">יעד</h2>
        <div>
          <label className="block text-text-muted text-xs mb-1">משקל יעד (ק&quot;ג)</label>
          <input
            type="number"
            step="0.1"
            value={profile.targetWeightKg || ''}
            onChange={e => updateProfile({ targetWeightKg: Number(e.target.value) || null })}
            className="w-full bg-surface text-text-primary rounded-xl px-4 py-2 border border-surface focus:border-accent outline-none font-inter"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1">תאריך יעד</label>
          <input
            type="date"
            value={profile.targetDate || ''}
            onChange={e => updateProfile({ targetDate: e.target.value || null })}
            className="w-full bg-surface text-text-primary rounded-xl px-4 py-2 border border-surface focus:border-accent outline-none"
          />
        </div>
      </Card>

      {/* Stats summary */}
      <Card className="flex flex-col gap-2">
        <h2 className="font-medium">סטטיסטיקות</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-text-muted">מספר מדידות</div>
          <div className="text-text-primary font-inter">{entries.length}</div>
          <div className="text-text-muted">עקביות</div>
          <div className="text-text-primary font-inter">{consistency}%</div>
          {body && (
            <>
              <div className="text-text-muted">טווח בריא</div>
              <div className="text-text-primary font-inter">{body.healthyWeightRange.min}–{body.healthyWeightRange.max} ק&quot;ג</div>
            </>
          )}
        </div>
      </Card>

      {/* Export */}
      <Card>
        <h2 className="font-medium mb-3">ייצוא</h2>
        <Button variant="secondary" onClick={() => exportCSV(entries)} className="w-full">
          ייצוא CSV
        </Button>
      </Card>

      {/* Danger zone */}
      <Card className="border border-danger/30">
        <h2 className="font-medium text-danger mb-3">אזור מסוכן</h2>
        {!showConfirm ? (
          <Button variant="danger" onClick={() => setShowConfirm(true)} className="w-full">
            מחק את כל הנתונים
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-text-secondary text-sm">בטוח? הפעולה הזו בלתי הפיכה.</p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => { clearAll(); window.location.reload(); }} className="flex-1">
                כן, מחק הכל
              </Button>
              <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
