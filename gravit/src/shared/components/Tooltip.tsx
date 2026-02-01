import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="button"
      aria-describedby={show ? 'tooltip' : undefined}
    >
      {children}
      {show && (
        <span
          id="tooltip"
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 w-64 bg-surface text-text-primary text-xs leading-relaxed p-3 rounded-xl border border-accent shadow-lg z-50"
        >
          {content}
        </span>
      )}
    </span>
  );
}

export const TOOLTIPS: Record<string, string> = {
  bmi: 'BMI (מדד מסת גוף) – מספר שמשווה בין המשקל לגובה. עוזר להבין אם המשקל בטווח בריא. לא מבדיל בין שריר לשומן.',
  bmr: 'BMR (קצב חילוף חומרים בסיסי) – כמה קלוריות הגוף שורף במנוחה מוחלטת. כמו צריכת דלק ב"ניוטרל".',
  tdee: 'TDEE (סך השריפה היומית) – כמה קלוריות נשרפות ביום כולל כל הפעילות. אם אוכלים פחות מזה – יורדים במשקל.',
  sma7: 'ממוצע נע 7 ימים – ממוצע שמחשב 7 ימים אחרונים ומתעדכן כל יום. מחליק תנודות ומראה את המגמה האמיתית.',
  rSquared: 'R² – מספר בין 0 ל-1 שאומר כמה המגמה ברורה. קרוב ל-1 = מגמה חזקה וברורה.',
  sd: 'סטיית תקן – מדד לתנודתיות. ככל שהמספר גבוה יותר, יש יותר קפיצות במשקל.',
  cv: 'CV – מדד תנודתיות יחסי. משווה את התנודות לממוצע ומאפשר השוואה בין תקופות.',
  iqr: 'IQR – הטווח שבו נמצאות 50% מהמדידות האמצעיות. עוזר לסנן קיצוניות.',
  lbm: 'LBM (מסת גוף רזה) – כל מה שלא שומן: שריר, עצם, מים, איברים.',
  fm: 'FM (מסת שומן) – כמות השומן בגוף בק"ג.',
  slope: 'שיפוע קו המגמה – מראה לאן המשקל הולך וכמה מהר. שלילי = ירידה.',
  confidenceBand: 'טווח ביטחון – האזור שבו המשקל צפוי להיות עם סבירות גבוהה. ככל שהתחזית רחוקה יותר, הטווח מתרחב.',
  outlier: 'מדידה חריגה – ערך שרחוק מהממוצע. כנראה בגלל תנאי מדידה שונים (אחרי אוכל, אימון, וכו\').',
  noiseRatio: 'מדד רעש – כמה תנודות יומיות יש ביחס למגמה הכללית. רעש גבוה = התנודות מסתירות את המגמה.',
  consistency: 'עקביות שקילה – אחוז הימים שבהם שקלת מתוך סך הימים. עקביות גבוהה נותנת תמונה מדויקת יותר.',
  deficit: 'גירעון קלורי – ההפרש בין מה שאוכלים למה שהגוף שורף. גירעון = ירידה במשקל.',
};
