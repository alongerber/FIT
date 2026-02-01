import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { useStore } from '../../shared/hooks/useStore';
import { generateId, todayISO } from '../../shared/utils/date-helpers';
import type { OnboardingData, UserProfile } from '../../shared/types';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'יושבני', desc: 'עבודה משרדית, כמעט בלי ספורט' },
  { value: 'lightly_active', label: 'פעילות קלה', desc: 'הליכות או אימון 1-2 פעמים בשבוע' },
  { value: 'moderately_active', label: 'פעילות בינונית', desc: 'אימונים 3-4 פעמים בשבוע' },
  { value: 'very_active', label: 'פעילות גבוהה', desc: 'אימונים 5-6 פעמים בשבוע' },
  { value: 'extra_active', label: 'פעילות אינטנסיבית', desc: 'אימונים יומיים או עבודה פיזית כבדה' },
] as const;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const navigate = useNavigate();
  const { setProfile, addWeightEntry } = useStore();

  const update = (fields: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...fields }));

  const finish = () => {
    const id = generateId();
    const profile: UserProfile = {
      id,
      displayName: '',
      birthDate: data.birthDate!,
      heightCm: data.heightCm!,
      gender: data.gender || null,
      activityLevel: data.activityLevel || null,
      targetWeightKg: data.targetWeight || null,
      targetDate: data.targetDate || null,
      targetBodyFatPct: null,
      measurementTimePreference: 'morning',
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    addWeightEntry({
      id: generateId(),
      userId: id,
      date: todayISO(),
      weightKg: data.currentWeight!,
      bodyFatPct: null,
      note: null,
      measurementConditions: null,
      createdAt: new Date().toISOString(),
    });
    navigate('/');
  };

  const targetDiff = data.currentWeight && data.targetWeight
    ? Math.round((data.currentWeight - data.targetWeight) * 10) / 10
    : null;

  const screens = [
    // Screen 0: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-3xl font-bold">בוא נתחיל</h1>
      <p className="text-text-secondary text-lg max-w-xs">
        כמה פרטים בסיסיים כדי שנוכל לעקוב אחרי ההתקדמות שלך בצורה מדויקת
      </p>
      <Button onClick={() => setStep(1)} className="mt-4 w-48">קדימה</Button>
    </div>,

    // Screen 1: Personal details
    <Card key="personal" className="flex flex-col gap-5">
      <h2 className="text-xl font-bold">פרטים אישיים</h2>
      <div>
        <label className="block text-text-secondary text-sm mb-1">תאריך לידה</label>
        <input
          type="date"
          value={data.birthDate || ''}
          onChange={e => update({ birthDate: e.target.value })}
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none"
        />
      </div>
      <div>
        <label className="block text-text-secondary text-sm mb-1">גובה (ס&quot;מ)</label>
        <input
          type="number"
          value={data.heightCm || ''}
          onChange={e => update({ heightCm: Number(e.target.value) })}
          placeholder="170"
          min={100} max={250}
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none font-inter"
        />
      </div>
      <div>
        <label className="block text-text-secondary text-sm mb-1">מגדר (אופציונלי)</label>
        <select
          value={data.gender || ''}
          onChange={e => update({ gender: (e.target.value || null) as OnboardingData['gender'] })}
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none"
        >
          <option value="">לא רוצה לציין</option>
          <option value="male">זכר</option>
          <option value="female">נקבה</option>
          <option value="other">אחר</option>
        </select>
      </div>
      <Button onClick={() => setStep(2)} disabled={!data.birthDate || !data.heightCm}>המשך</Button>
    </Card>,

    // Screen 2: Goal
    <Card key="goal" className="flex flex-col gap-5">
      <h2 className="text-xl font-bold">היעד</h2>
      <div>
        <label className="block text-text-secondary text-sm mb-1">משקל נוכחי (ק&quot;ג)</label>
        <input
          type="number"
          step="0.1"
          value={data.currentWeight || ''}
          onChange={e => update({ currentWeight: Number(e.target.value) })}
          placeholder="82.0"
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none font-inter text-xl"
        />
      </div>
      <div>
        <label className="block text-text-secondary text-sm mb-1">משקל יעד (ק&quot;ג)</label>
        <input
          type="number"
          step="0.1"
          value={data.targetWeight || ''}
          onChange={e => update({ targetWeight: Number(e.target.value) || undefined })}
          placeholder="75.0"
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none font-inter"
        />
      </div>
      <div>
        <label className="block text-text-secondary text-sm mb-1">תאריך יעד (אופציונלי)</label>
        <input
          type="date"
          value={data.targetDate || ''}
          onChange={e => update({ targetDate: e.target.value || undefined })}
          className="w-full bg-surface text-text-primary rounded-xl px-4 py-3 border border-surface focus:border-accent outline-none"
        />
      </div>
      {targetDiff !== null && targetDiff > 0 && (
        <p className="text-text-secondary text-sm">
          זה אומר ירידה של <span className="text-accent font-medium">{targetDiff}</span> ק&quot;ג
        </p>
      )}
      <Button onClick={() => setStep(3)} disabled={!data.currentWeight}>המשך</Button>
    </Card>,

    // Screen 3: Activity level
    <Card key="activity" className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">רמת פעילות</h2>
      <div className="flex flex-col gap-2">
        {ACTIVITY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => update({ activityLevel: opt.value })}
            className={`text-right p-3 rounded-xl border transition-colors ${
              data.activityLevel === opt.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-surface bg-surface/50 text-text-primary hover:border-accent/50'
            }`}
          >
            <div className="font-medium">{opt.label}</div>
            <div className="text-sm text-text-secondary">{opt.desc}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => { update({ activityLevel: null }); setStep(4); }}
        className="text-text-muted text-sm hover:text-text-secondary"
      >
        אדלג בינתיים
      </button>
      <Button onClick={() => setStep(4)} disabled={!data.activityLevel}>המשך</Button>
    </Card>,

    // Screen 4: First weigh-in confirmation
    <div key="start" className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h2 className="text-2xl font-bold">זו נקודת ההתחלה שלך</h2>
      <div className="text-5xl font-bold font-inter text-accent">
        {data.currentWeight || '–'}
        <span className="text-xl text-text-secondary mr-2">ק&quot;ג</span>
      </div>
      <Button onClick={finish} className="mt-4 w-48">יאללה, מתחילים</Button>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step > 0 && step < 4 && (
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-accent' : 'bg-surface'}`}
              />
            ))}
          </div>
        )}
        {screens[step]}
      </div>
    </div>
  );
}
