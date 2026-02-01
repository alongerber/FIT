# 📋 מסמך אפיון מלא – אפליקציית מעקב משקל "GRAVIT"

> **מסמך פרומפט לבניית אפליקציה מסחרית למעקב משקל, הרכב גוף והתקדמות פיזית**
> גרסה: 1.0 | תאריך: פברואר 2026

---

## 1. סקירה כללית (Overview)

### 1.1 מהות המוצר

אפליקציית ווב מודולרית (Progressive Web App) למעקב משקל והרכב גוף, המיועדת לאנשים שקיבלו החלטה להתחיל תהליך של שינוי פיזי – ירידה במשקל, עיצוב הגוף, או שניהם.

### 1.2 עקרונות מנחים

| עיקרון | משמעות |
|--------|--------|
| **פרימיום מינימליסטי** | עיצוב מודרני, נקי, בלי עומס – כל אלמנט על המסך חייב להצדיק את קיומו |
| **הנגשה מוחלטת** | כל נתון מוצג עם הסבר קצר בעברית פשוטה. אין הנחה שהמשתמש מכיר מונחים |
| **מוטיבציה מבוססת נתונים** | לא אימוג'ים, לא משפטי השראה ריקים. מוטיבציה נובעת מתובנות אמיתיות על התקדמות |
| **מודולריות** | כל פיצ'ר הוא מודול עצמאי. קל להוסיף מודולים עתידיים (אימונים, תזונה) בלי לשבור דבר |
| **כנות** | האפליקציה לא מחמיאה. היא מציגה את המציאות – טובה או רעה – בצורה בונה |

### 1.3 שפת ממשק

- עברית מלאה (RTL) לכל הטקסטים, כפתורים, וניווט
- מונחים טכניים באנגלית (BMI, TDEE, BMR) תמיד מלווים בהסבר עברי
- פורמט מספרים: נקודה עשרונית (82.3), תאריכים בפורמט ישראלי (02/02/2026)

### 1.4 פלטפורמה וטכנולוגיה

| רכיב | בחירה | סיבה |
|------|--------|------|
| Frontend | React + TypeScript | מודולריות, type safety, אקוסיסטם עשיר |
| Styling | Tailwind CSS | עיצוב מהיר, consistent, RTL support |
| Charts | Recharts / D3.js | ויזואליזציות מקצועיות וניתנות להתאמה |
| Backend/DB | Supabase (PostgreSQL) | Auth מובנה, real-time, Row Level Security, חינמי לתחילת דרך |
| Auth | Supabase Auth | Google/Email sign-in, אבטחה מובנית |
| AI | Anthropic Claude API | ניתוח תמונות, תובנות מותאמות |
| Hosting | Vercel / Netlify | CI/CD אוטומטי, edge functions |
| State | Zustand / React Context | קל, ללא boilerplate מיותר |

---

## 2. ארכיטקטורה מודולרית

### 2.1 מבנה מודולים – Phase Map

```
GRAVIT App
│
├── Core Module (Phase 1) ← אנחנו כאן
│   ├── Auth & Onboarding
│   ├── Weight Input & History
│   ├── Dashboard & Analytics
│   ├── Body Metrics (BMI, BMR, TDEE)
│   ├── Goal Tracking & Predictions
│   ├── Smart Insights Engine
│   └── Export (PDF/CSV)
│
├── Body Module (Phase 2)
│   ├── Photo Progress Tracking
│   ├── AI Body Composition Analysis
│   └── Body Measurements Log
│
├── Nutrition Module (Phase 3 – Future)
│   ├── Barcode Scanning (Open Food Facts API)
│   ├── AI Meal Photo Analysis
│   ├── Calorie & Protein Tracking
│   └── Daily Nutrition Summary
│
└── Training Module (Phase 4 – Future)
    ├── Workout Logging
    ├── Exercise Library
    ├── Progression Tracking
    └── Training Volume Analytics
```

### 2.2 מבנה תיקיות (File Structure)

```
src/
├── app/                        # Pages / Routes
│   ├── (auth)/                 # Login, Register, Onboarding
│   ├── dashboard/              # Main dashboard
│   ├── history/                # Weight history table
│   ├── insights/               # Smart insights page
│   ├── body/                   # Photos & measurements (Phase 2)
│   ├── settings/               # User settings & profile
│   └── export/                 # Export reports
│
├── modules/                    # Feature modules
│   ├── weight/
│   │   ├── components/         # WeightInput, WeightChart, WeightTable
│   │   ├── hooks/              # useWeightData, useWeightStats
│   │   ├── utils/              # calculations, validators
│   │   ├── types/              # TypeScript interfaces
│   │   └── constants/          # thresholds, config
│   │
│   ├── metrics/
│   │   ├── components/         # BMICard, TDEECard, GoalProgress
│   │   ├── hooks/              # useBodyMetrics, useGoalAnalysis
│   │   ├── utils/              # bmi.ts, bmr.ts, tdee.ts, predictions.ts
│   │   └── types/
│   │
│   ├── insights/
│   │   ├── components/         # InsightCard, TrendAlert, WeeklySummary
│   │   ├── hooks/              # useInsights
│   │   ├── engine/             # insight-rules.ts, pattern-detection.ts
│   │   └── types/
│   │
│   ├── body/                   # Phase 2
│   │   ├── components/         # PhotoUpload, PhotoTimeline, AIAnalysis
│   │   ├── hooks/
│   │   ├── services/           # claude-vision.ts
│   │   └── types/
│   │
│   └── export/
│       ├── components/         # ExportDialog, ReportPreview
│       ├── templates/          # PDF templates
│       └── utils/              # pdf-generator.ts, csv-export.ts
│
├── shared/
│   ├── components/             # Button, Card, Modal, Tooltip, Chart wrappers
│   ├── hooks/                  # useAuth, useSupabase, useLocale
│   ├── utils/                  # date-helpers, number-format, statistics
│   ├── types/                  # global types
│   ├── constants/              # app-wide constants
│   └── styles/                 # global styles, theme config
│
├── services/
│   ├── supabase.ts             # DB client & queries
│   ├── claude.ts               # Anthropic API wrapper
│   └── analytics.ts            # Usage tracking
│
└── config/
    ├── theme.ts                # Color palette, typography, spacing
    ├── i18n/                   # Hebrew strings (ready for future languages)
    └── feature-flags.ts        # Module enable/disable
```

---

## 3. מודל נתונים (Database Schema)

### 3.1 Supabase Tables

```sql
-- Users profile (extends Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  birth_date DATE NOT NULL,
  height_cm NUMERIC(5,1) NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  activity_level TEXT CHECK (activity_level IN (
    'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'
  )),
  target_weight_kg NUMERIC(5,1),
  target_date DATE,
  target_body_fat_pct NUMERIC(4,1),
  measurement_time_preference TEXT DEFAULT 'morning',
  units TEXT DEFAULT 'metric',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily weight entries
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,1) NOT NULL,
  body_fat_pct NUMERIC(4,1),          -- optional
  note TEXT,                            -- optional daily note
  measurement_conditions TEXT,          -- 'morning_fasted', 'post_meal', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Body photos (Phase 2)
CREATE TABLE body_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,              -- Supabase Storage URL
  pose_type TEXT CHECK (pose_type IN ('front', 'side', 'back')),
  ai_analysis JSONB,                    -- Claude Vision response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body measurements (Phase 2)
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  date DATE NOT NULL,
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  hips_cm NUMERIC(5,1),
  bicep_cm NUMERIC(5,1),
  thigh_cm NUMERIC(5,1),
  neck_cm NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Row Level Security
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
  ON weight_entries FOR ALL
  USING (auth.uid() = user_id);
-- (repeat for all tables)
```

---

## 4. מסכי אפליקציה – UX Flow

### 4.1 Onboarding Flow (הרשמה ראשונית)

**מסך 1 – ברוך הבא**
- כותרת: "בוא נתחיל"
- תת-כותרת: "כמה פרטים בסיסיים כדי שנוכל לעקוב אחרי ההתקדמות שלך בצורה מדויקת"
- כפתור: "קדימה"

**מסך 2 – פרטים אישיים**
- שדות: תאריך לידה, גובה (ס"מ), מגדר (אופציונלי)
- כל שדה עם tooltip קצר שמסביר למה צריך את זה
- גובה: slider + שדה מספרי

**מסך 3 – היעד**
- משקל נוכחי (ק"ג)
- משקל יעד (ק"ג)
- תאריך יעד (אופציונלי)
- הצגה מיידית: "זה אומר ירידה של X ק"ג" + בדיקה אם היעד ריאלי
- אם יעד לא ריאלי: הודעה ברורה ולא מתנשאת: "היעד הזה דורש קצב ירידה של X ק"ג בשבוע, מה שנחשב מהיר מאוד. מומלץ לשקול יעד ביניים"

**מסך 4 – רמת פעילות** (אופציונלי)
- 5 רמות עם הסבר פשוט לכל אחת:
  - "יושבני – עבודה משרדית, כמעט בלי ספורט"
  - "פעילות קלה – הליכות או אימון 1-2 פעמים בשבוע"
  - "פעילות בינונית – אימונים 3-4 פעמים בשבוע"
  - "פעילות גבוהה – אימונים 5-6 פעמים בשבוע"
  - "פעילות אינטנסיבית – אימונים יומיים או עבודה פיזית כבדה"
- אפשרות לדלג: "אדלג בינתיים" (אם דילג – לא יחושב TDEE)

**מסך 5 – שקילה ראשונה**
- שדה משקל בולט ומרכזי
- "זו נקודת ההתחלה שלך"
- כפתור: "יאללה, מתחילים"

### 4.2 מסך ראשי – Dashboard

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header: שם + תאריך + Settings icon         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  WEIGHT INPUT SECTION               │    │
│  │  [  82.3  ] ק"ג     [שמור]         │    │
│  │  היום: 02/02/2026                   │    │
│  │  (tap date to change)               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  QUICK STATS BAR                    │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │    │
│  │  │היום│ │שבוע│ │חודש│ │סה״כ│       │    │
│  │  │82.3│ │-0.8│ │-2.1│ │-5.4│       │    │
│  │  └────┘ └────┘ └────┘ └────┘       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  MAIN CHART                         │    │
│  │  (Weight trend + moving average)    │    │
│  │  Period selector: [1W][1M][3M][ALL] │    │
│  │  ██████████████████████             │    │
│  │  ██████████████████████             │    │
│  │  ██████████████████████             │    │
│  │  ██████████████████████             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  SMART INSIGHT (1 at a time)        │    │
│  │  "הממוצע הנע שלך ירד ב-0.4 ק"ג    │    │
│  │   השבוע – המגמה ממשיכה לכיוון      │    │
│  │   היעד בקצב יציב"                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌────────────┐  ┌────────────┐             │
│  │  GOAL       │  │  BODY      │             │
│  │  PROGRESS   │  │  METRICS   │             │
│  │  ████ 62%   │  │  BMI: 25.1 │             │
│  │  נשאר: 3.2  │  │  תקין-גבוה│             │
│  └────────────┘  └────────────┘             │
│                                             │
├─────────────────────────────────────────────┤
│  Nav: Dashboard | History | Body | Settings │
└─────────────────────────────────────────────┘
```

### 4.3 הזנת משקל – Flow

**הזנה מהירה (ברירת מחדל):**
- שדה מספרי מרכזי, גדול, בולט
- תאריך היום מוצג (ניתן ללחוץ לשינוי)
- כפתור "שמור" → אנימציה קצרה של אישור → חזרה לדשבורד
- אם כבר יש רשומה להיום: מציג את המשקל שנשמר עם אפשרות לעדכן

**הזנה מורחבת (לחיצה על "פרטים נוספים"):**
- אחוז שומן (אופציונלי)
- תנאי מדידה: "בוקר לפני אכילה" / "במהלך היום" / "אחרי אימון" / "אחר"
- הערה חופשית (עד 200 תווים)

**הזנה בדיעבד:**
- לחיצה על התאריך → date picker → בחירת תאריך אחר
- אם יש כבר רשומה לתאריך: "כבר יש מדידה ליום הזה (82.1 ק"ג). לעדכן?"

---

## 5. מנוע חישובים (Calculations Engine)

### 5.1 מדדי סדרת משקל

**דרישת מינימום: 7 מדידות לחישובי מגמה ותחזית. פחות מ-7 = מדדי רמה בלבד.**

#### 5.1.1 מדדי רמה (Level Metrics) – תמיד זמינים

| מדד | חישוב | תצוגה למשתמש |
|-----|--------|---------------|
| משקל ממוצע | Mean של כל המדידות בטווח | "ממוצע: 83.2 ק"ג" |
| חציון | Median | "חציון: 83.0 ק"ג" – tooltip: "המשקל שחצי מהמדידות מעליו וחצי מתחתיו" |
| מינימום / מקסימום | Min / Max | "טווח: 81.5–85.2 ק"ג" |
| משקל התחלה / נוכחי | First / Last entry | "התחלת ב-87.0 → היום 83.2" |

#### 5.1.2 מדדי שינוי (Dynamics) – 3+ מדידות

| מדד | חישוב | הסבר למשתמש |
|-----|--------|-------------|
| שינוי כולל | Last − First | "ירדת 3.8 ק"ג מתחילת המעקב" |
| שינוי אחוזי | ((Last − First) / First) × 100 | "זה 4.4% מהמשקל ההתחלתי" |
| שינוי יומי ממוצע | Mean of daily deltas | "בממוצע, השינוי היומי: -0.09 ק"ג" |
| שינוי יומי חציוני | Median of daily deltas | (הסבר: "השינוי היומי הנפוץ ביותר") |
| עלייה/ירידה מקסימלית ביום | Max/Min of daily deltas | "העלייה היומית הגדולה ביותר: +0.8 ק"ג" |
| ימי עלייה / ירידה / ללא שינוי | Count by sign | "15 ימי ירידה, 8 ימי עלייה, 2 ללא שינוי" |
| סטיית תקן שינויים יומיים | SD of daily deltas | tooltip: "ככל שהמספר נמוך יותר – השינוי היומי עקבי יותר" |

#### 5.1.3 תנודתיות ויציבות – 7+ מדידות

| מדד | חישוב | הצגה |
|-----|--------|------|
| סטיית תקן | SD of weights | מוצג כ"מדד יציבות" – נמוך = יציב |
| CV (Coefficient of Variation) | (SD / Mean) × 100 | tooltip: "מדד שמשווה את התנודתיות לממוצע – מאפשר השוואה בין תקופות" |
| IQR (טווח בין-רבעוני) | Q3 − Q1 | tooltip: "הטווח שבו 50% המדידות האמצעיות נמצאות" |
| זיהוי ימים חריגים | > 2 SD מהממוצע | marker על הגרף + tooltip: "יום חריג – ייתכן שנובע מתנאי מדידה שונים" |

#### 5.1.4 מגמה (Trend) – 7+ מדידות

| מדד | חישוב | הצגה |
|-----|--------|------|
| שיפוע מגמה | Linear regression slope | "קצב שינוי: -0.12 ק"ג ליום" |
| R² | Coefficient of determination | tooltip: "עד כמה קו המגמה מייצג את הנתונים. מעל 0.7 = מגמה ברורה" |
| כיוון מגמה | Based on slope + significance | "מגמה: ירידה יציבה" / "מגמה: שטוח" / "מגמה: עליה" |
| ממוצע נע 7 ימים | 7-day Simple Moving Average | מוצג כקו על הגרף הראשי |
| מגמה מוחלקת | Exponential Moving Average (α=0.2) | קו נוסף על הגרף (אופציונלי) |

#### 5.1.5 מדדי פרשנות

| מדד | חישוב | הצגה |
|-----|--------|------|
| מדד רעש | SD / abs(total change) | "רמת רעש: נמוכה/בינונית/גבוהה" – tooltip: "כמה תנודות יומיות יש ביחס למגמה הכללית. רעש גבוה = התנודות מסתירות את המגמה" |
| הפרש ממוצע בין ימים | Mean of abs(daily deltas) | "בממוצע, המשקל זז ±0.3 ק"ג מיום ליום" |
| עקביות שקילה | Days with entries / Total days | "עקביות: 92% – שקלת 23 מתוך 25 ימים" |

### 5.2 מדדי גוף (Body Metrics)

#### 5.2.1 BMI

```
BMI = weight_kg / (height_m)²
```

| קטגוריה | BMI | צבע |
|----------|-----|------|
| תת-משקל | < 18.5 | כתום |
| תקין | 18.5–24.9 | ירוק |
| עודף משקל | 25.0–29.9 | צהוב |
| השמנה דרגה I | 30.0–34.9 | כתום |
| השמנה דרגה II | 35.0–39.9 | אדום |
| השמנה דרגה III | ≥ 40.0 | אדום כהה |

**הסבר למשתמש:**
> "BMI (מדד מסת גוף) – מספר שמשווה בין המשקל לגובה שלך.
> זה מדד כללי – הוא לא מבדיל בין שריר לשומן, אז אצל אנשים ספורטיביים הוא עלול להטעות.
> הערך שלך: 26.1 – עודף משקל קל. טווח תקין בשבילך: 57–77 ק"ג"

#### 5.2.2 BMR (Mifflin-St Jeor) – רק עם מגדר

```
גברים:  BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
נשים:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

**הסבר למשתמש:**
> "BMR (קצב חילוף חומרים בסיסי) – כמה קלוריות הגוף שלך שורף רק כדי לתפקד,
> בלי שום פעילות. זה כמו צריכת הדלק של הגוף ב'ניוטרל'.
> הערך שלך: ~1,780 קלוריות ביום"

#### 5.2.3 TDEE – רק עם מגדר + רמת פעילות

```
TDEE = BMR × Activity Multiplier
```

| רמת פעילות | מכפיל |
|------------|--------|
| יושבני | 1.2 |
| קלה | 1.375 |
| בינונית | 1.55 |
| גבוהה | 1.725 |
| אינטנסיבית | 1.9 |

**הסבר למשתמש:**
> "TDEE (סך השריפה היומית) – כמה קלוריות אתה שורף ביום כולל פעילות.
> אם אתה אוכל פחות מהמספר הזה – תרד במשקל.
> הערך שלך: ~2,760 קלוריות ביום"

### 5.3 ניתוח יעד והיתכנות

| מדד | חישוב | תצוגה |
|-----|--------|-------|
| פער ליעד | Current − Target | "נשאר: 5.3 ק"ג עד היעד" |
| פער באחוזים | ((Current − Target) / Current) × 100 | "זה 6.1% מהמשקל הנוכחי" |
| התקדמות | (Start − Current) / (Start − Target) × 100 | Progress bar: "62% מהדרך" |
| קצב בריא | 0.5–1.0% ממשקל הגוף בשבוע | "קצב מומלץ: 0.4–0.8 ק"ג בשבוע" |
| זמן משוער ליעד | Gap / weekly_rate | שלוש תחזיות: |
| | | שמרני (0.25 ק"ג/שבוע): "~21 שבועות" |
| | | סטנדרטי (0.5 ק"ג/שבוע): "~11 שבועות" |
| | | אגרסיבי (0.75 ק"ג/שבוע): "~7 שבועות" |
| דגל יעד לא ריאלי | Target BMI < 17 or > 35 | "שים לב: משקל היעד מחוץ לטווח הבריא" |
| גירעון מומלץ | 500 cal/day = ~0.5 kg/week | "גירעון מומלץ: 500 קלוריות ליום" |
| דגל גירעון מסוכן | deficit > 40% of TDEE or net < 1200/1500 | "גירעון גבוה מדי – עלול לפגוע בבריאות ובמסת שריר" |

### 5.4 ביצוע מול יעד

| מדד | חישוב | תצוגה |
|-----|--------|-------|
| קצב בפועל | Slope × 7 | "קצב נוכחי: -0.45 ק"ג בשבוע" |
| פער מקצב יעד | Actual rate vs Required rate | "מעט מתחת לקצב הנדרש" / "בול על המסלול" / "מעל הקצב הנדרש" |
| אינדקס עקביות | Days trending toward goal / Total days | "73% מהימים – בכיוון היעד" |
| מדד התקדמות נטו | Net progress / Expected progress | > 1.0 = ahead, < 1.0 = behind |

### 5.5 תחזיות

**תחזיות מחושבות רק עם 7+ מדידות. מעל 30 יום קדימה = Low Confidence.**

| תחזית | שיטה | תצוגה |
|--------|------|-------|
| 7 ימים | Linear extrapolation from 14-day trend | "בעוד שבוע: ~81.8 ק"ג" |
| 30 ימים | Weighted: 70% recent trend + 30% overall | "בעוד חודש: ~80.1 ק"ג" |
| טווח תחזית | ±1.5 SD from prediction | "טווח: 79.2–81.0 ק"ג" |
| הסתברות הגעה ליעד | Monte Carlo simplified (based on variance + trend) | "סיכוי להגיע ליעד עד 01/06: ~68%" |

**הצגה חזותית:** אזור מוצלל (confidence band) על הגרף שמתרחב ככל שהתחזית רחוקה יותר.

### 5.6 הרכב גוף (אם הוזן אחוז שומן)

| מדד | חישוב | תצוגה |
|-----|--------|-------|
| מסת שומן (FM) | weight × (body_fat% / 100) | "מסת שומן: 16.5 ק"ג" |
| מסת רזה (LBM) | weight − FM | "מסת גוף רזה: 65.5 ק"ג" – tooltip: "הכל חוץ מהשומן: שריר, עצם, מים, איברים" |
| משקל יעד לפי שומן | LBM / (1 − target_fat% / 100) | "כדי להגיע ל-15% שומן: משקל יעד ~77 ק"ג" |

---

## 6. מנוע תובנות (Smart Insights Engine)

### 6.1 עקרונות

- תובנה אחת בולטת בדשבורד הראשי (הכי רלוונטית כרגע)
- מסך תובנות מלא עם כל התובנות הפעילות
- כל תובנה כתובה בעברית פשוטה, עם הקשר וכיוון פעולה
- ללא אימוג'ים. טון ענייני, ישיר, מכבד

### 6.2 חוקי תובנות (Insight Rules)

**קטגוריה: מגמה**

| Trigger | תובנה | סוג |
|---------|--------|-----|
| 7+ ימי ירידה רצופים | "שבעה ימי ירידה ברצף. המגמה יציבה ומרשימה. זכור – עלייה יומית קטנה אחרי רצף כזה היא טבעית לחלוטין." | חיובי |
| 5+ ימי עלייה רצופים | "חמישה ימי עלייה ברצף. זה לא בהכרח אומר שאתה לא בכיוון – בדוק תנאי מדידה, צריכת מלח, ומחזוריות." | ניטרלי |
| Slope שלילי + R² > 0.7 | "המגמה ברורה וחזקה: ירידה עקבית. קו המגמה מסביר X% מהשינוי." | חיובי |
| Slope ≈ 0 (±0.01) ליותר מ-14 ימים | "המשקל ברמה שטוחה כבר שבועיים. אם אתה בגירעון – ייתכן שהגוף הסתגל. שווה לבחון שינויים בתזונה או אימון." | ניטרלי/פעולה |

**קטגוריה: תנודתיות**

| Trigger | תובנה | סוג |
|---------|--------|-----|
| CV > 2% | "תנודתיות גבוהה בימים האחרונים. נסה לשקול באותו זמן ואותם תנאים כל יום." | פעולה |
| Outlier detected | "המדידה מ-[תאריך] חריגה (±X ק"ג מהממוצע). ייתכן שנובעת מתנאים שונים." | מידע |
| Noise ratio > 3 | "הרבה תנודות יומיות ביחס למגמה. המספרים היומיים מסיחים את הדעת – תסתכל על הממוצע הנע." | פעולה |

**קטגוריה: יעד**

| Trigger | תובנה | סוג |
|---------|--------|-----|
| Actual rate > required rate | "אתה מתקדם מהר מהנדרש. בקצב הנוכחי תגיע ליעד לפני [תאריך]." | חיובי |
| Actual rate < 50% of required | "הקצב הנוכחי איטי מהנדרש. כדי להגיע ליעד בזמן, צריך להגביר את הקצב ל-[X] ק"ג בשבוע." | פעולה |
| 50% of goal reached | "חצי מהדרך! ירדת [X] ק"ג מתוך [Y]. ההתמדה משתלמת." | חיובי |
| Progress index > 1.1 | "אתה מקדים את הלוח זמנים שהצבת." | חיובי |

**קטגוריה: עקביות**

| Trigger | תובנה | סוג |
|---------|--------|-----|
| 3+ ימים בלי מדידה | "עברו [X] ימים מהמדידה האחרונה. עקביות במדידה חשובה כמו עקביות בתזונה." | תזכורת |
| Consistency > 90% | "עקביות מדידה מעולה – [X]% מהימים. זה נותן לנו תמונה מדויקת." | חיובי |
| Measurement conditions vary | "שים לב שהמדידות בתנאים שונים – בוקר, אחרי אוכל, אחרי אימון. זה מוסיף רעש לנתונים." | פעולה |

**קטגוריה: בריאות**

| Trigger | תובנה | סוג |
|---------|--------|-----|
| Weekly loss > 1% body weight | "הירידה השבועית מהירה (X%). ירידה מהירה מדי עלולה לגרום לאובדן מסת שריר." | אזהרה |
| BMI approaching underweight | "ה-BMI שלך מתקרב לתחום תת-משקל. כדאי לבדוק עם איש מקצוע." | אזהרה |
| Predicted deficit < 1200 cal (M) or < 1000 cal (F) | "הגירעון הקלורי המשוער נמוך מהמינימום הבריא. כדאי להתייעץ עם תזונאי." | אזהרה |

---

## 7. ניתוח תמונות AI (Phase 2)

### 7.1 תצורה

**API:** Anthropic Claude API (claude-sonnet-4-5-20250929)

**Flow:**
1. משתמש מצלם / מעלה תמונה (front, side, או back)
2. תמונה נשמרת ב-Supabase Storage (private bucket)
3. נשלחת ל-Claude Vision API עם system prompt ייעודי
4. תשובה נשמרת כ-JSONB ברשומת התמונה
5. מוצגת למשתמש עם disclaimers ברורים

### 7.2 System Prompt לניתוח תמונה

```
אתה מומחה להערכת הרכב גוף מתמונות. ניתנת לך תמונה של אדם
לצד הנתונים הבאים: גיל, גובה, משקל נוכחי, מגדר.

הנחיות:
1. הערך אחוז שומן גוף בטווח (לא מספר יחיד). לדוגמה: "18-22%"
2. זהה אזורי גוף בולטים (בטן, חזה, זרועות, ירכיים)
3. תאר את רמת השריריות הנראית
4. השווה להערכות קודמות אם יש (יינתנו כהקשר)
5. הצע מה כדאי לשים לב אליו בתמונה הבאה

פורמט תשובה (JSON):
{
  "estimated_body_fat_range": { "low": 18, "high": 22 },
  "confidence": "medium",
  "visible_muscle_definition": "moderate",
  "notable_areas": [
    { "area": "abdomen", "observation": "שומן בטני מתון, אין הגדרת שרירי בטן" },
    { "area": "arms", "observation": "הגדרת שריר טובה בזרועות" }
  ],
  "comparison_to_previous": "שיפור קל באזור הבטן ביחס לתמונה הקודמת",
  "recommendations": "לצלם באותה תאורה ואותו זמן ביום לצורך השוואה עקבית"
}

חשוב: הדגש תמיד שזו הערכה ויזואלית בלבד ואינה מחליפה
מדידה מקצועית (DEXA, הידרוסטטית). הטווח הוא ±3-5%.
```

### 7.3 תצוגת תוצאות

**כרטיס תוצאות AI:**
```
┌─────────────────────────────────────┐
│  הערכת הרכב גוף – 02/02/2026       │
│                                     │
│  אחוז שומן משוער: 18-22%           │
│  רמת ביטחון: בינונית               │
│                                     │
│  ▸ בטן: שומן בטני מתון             │
│  ▸ זרועות: הגדרת שריר טובה         │
│                                     │
│  ⓘ זו הערכה ויזואלית בלבד.         │
│    הדיוק: ±3-5 אחוזים.             │
│    למדידה מדויקת – בדיקת DEXA.     │
└─────────────────────────────────────┘
```

---

## 8. ייצוא דוחות (Export Module)

### 8.1 דוח PDF לתזונאי

**מבנה הדוח:**

1. **עמוד שער**
   - שם המשתמש, תאריך הפקת הדוח
   - תקופת המעקב (מ-עד)
   - סיכום: משקל התחלתי → נוכחי, שינוי כולל

2. **פרופיל ומדדים**
   - גיל, גובה, מגדר, רמת פעילות
   - BMI, BMR, TDEE (עם הסברים)
   - יעד ומצב התקדמות

3. **גרף מגמת משקל**
   - גרף מלא עם ממוצע נע + קו מגמה
   - סימון יעד

4. **טבלת נתונים**
   - כל המדידות (תאריך, משקל, שינוי יומי)
   - סימון ימים חריגים

5. **ניתוח סטטיסטי**
   - כל מדדי הרמה, השינוי, והמגמה
   - מדד רעש + המלצה

6. **תובנות ודגלים**
   - תובנות רלוונטיות שנוצרו בתקופה
   - אזהרות בריאותיות אם היו

7. **תחזית**
   - גרף תחזית 30 יום עם confidence band
   - קצב מומלץ

### 8.2 ייצוא CSV

- קובץ CSV פשוט עם כל המדידות
- עמודות: תאריך, משקל, שינוי יומי, אחוז שומן (אם יש), הערות
- UTF-8 with BOM (לתמיכה ב-Excel עברית)

---

## 9. כללי לוגיקה והגבלות

### 9.1 טבלת תנאים

| תנאי | התנהגות |
|------|---------|
| < 3 מדידות | מדדי רמה בסיסיים בלבד (ממוצע, מינימום, מקסימום) |
| 3–6 מדידות | + מדדי שינוי (ללא מגמה ותחזית) |
| 7+ מדידות | כל החישובים פעילים |
| ללא מגדר | BMI – כן. BMR/TDEE – לא. הודעה: "הוסף מגדר בהגדרות לחישוב שריפה קלורית" |
| ללא רמת פעילות | BMI + BMR – כן. TDEE – לא. הודעה: "הוסף רמת פעילות לחישוב שריפה כוללת" |
| תחזית > 30 יום | מסומנת כ-"רמת ודאות נמוכה" עם band רחב |
| תנאי מדידה משתנים | הודעה: "רעש צפוי – תנאי מדידה שונים בין ימים" |
| משקל חריג (> 2 SD) | סימון על הגרף + שאלה: "המדידה חריגה. לשמור?" |
| פער > 7 ימים בלי מדידה | אין אינטרפולציה – פער מוצג כקו מקווקו בגרף |
| יעד BMI < 17 | "היעד מתחת לטווח הבריא" |
| ירידה > 1.5% בשבוע | אזהרה: "קצב ירידה מהיר – שקול להתייעץ עם מומחה" |

### 9.2 אבטחת נתונים

- כל הנתונים מוגנים ב-Row Level Security (Supabase)
- תמונות ב-private storage bucket
- API key ל-Claude לא נחשף ל-client – קריאות דרך Edge Function
- מחיקת חשבון = מחיקת כל הנתונים (GDPR-ready)

---

## 10. עיצוב – Design System

### 10.1 פלטת צבעים

```
Primary:        #1A1A2E    (כחול-כהה עמוק – רקע כרטיסים)
Background:     #0F0F1A    (כמעט שחור – רקע ראשי)
Surface:        #16213E    (כחול-אפור – שטחי עבודה)
Accent:         #4ECDC4    (טורקיז – הדגשות, CTA)
Accent Alt:     #7C5CFC    (סגול – גרפים, אלמנטים משניים)
Success:        #2ECC71    (ירוק – ירידה, חיובי)
Warning:        #F39C12    (כתום – אזהרה)
Danger:         #E74C3C    (אדום – חריגה, סכנה)
Text Primary:   #FFFFFF    (לבן – טקסט ראשי)
Text Secondary: #A0AEC0    (אפור בהיר – טקסט משני)
Text Muted:     #636E80    (אפור – tooltip, הסברים)
```

### 10.2 טיפוגרפיה

```
Font Family:    'Heebo', sans-serif (Google Fonts – תמיכה מלאה בעברית)
Font Weights:   300 (light), 400 (regular), 500 (medium), 700 (bold)

Heading 1:      28px / Bold
Heading 2:      22px / Bold
Heading 3:      18px / Medium
Body:           16px / Regular
Caption:        14px / Regular
Small:          12px / Light

Numbers/Data:   'Inter', monospace-friendly (for aligned digits)
```

### 10.3 רכיבי ממשק

**כרטיסים (Cards):**
- רקע: #1A1A2E
- Border-radius: 16px
- Shadow: subtle dark shadow (0 4px 20px rgba(0,0,0,0.3))
- Padding: 20px

**כפתורים:**
- Primary: רקע Accent (#4ECDC4), טקסט כהה, radius 12px
- Secondary: שקוף עם border Accent
- Destructive: רקע Danger

**גרפים:**
- קו משקל: Accent (#4ECDC4), 2px, animated
- קו ממוצע נע: #7C5CFC, dashed, 1.5px
- קו יעד: #A0AEC0, dotted, 1px
- Area fill: gradient Accent → transparent (20% opacity)
- Grid: #1A1A2E, subtle
- Confidence band: #7C5CFC, 10% opacity fill

**Tooltips:**
- רקע: #16213E
- טקסט: white
- Border: 1px solid Accent
- Max-width: 250px

---

## 11. מפת דרכים (Roadmap)

### Phase 1 – Core (MVP)
**משך: 4-6 שבועות**

- [ ] Auth + Onboarding flow
- [ ] הזנת משקל יומית + עריכה
- [ ] Dashboard ראשי עם גרף מגמה
- [ ] Quick Stats bar
- [ ] חישובי רמה + שינוי + מגמה
- [ ] BMI + BMR + TDEE
- [ ] ניתוח יעד + תחזיות בסיסיות
- [ ] מנוע תובנות (10 חוקים ראשונים)
- [ ] ייצוא CSV

### Phase 2 – Body
**משך: 3-4 שבועות**

- [ ] העלאת תמונות גוף
- [ ] Timeline תמונות
- [ ] ניתוח AI (Claude Vision)
- [ ] מדידות היקפי גוף
- [ ] ייצוא PDF לתזונאי
- [ ] תובנות נוספות

### Phase 3 – Nutrition (עתידי)
- [ ] סריקת ברקוד (Open Food Facts API)
- [ ] צילום ארוחה + ניתוח AI
- [ ] יומן קלוריות וחלבון
- [ ] סיכום תזונה יומי/שבועי

### Phase 4 – Training (עתידי)
- [ ] יומן אימונים
- [ ] ספריית תרגילים
- [ ] מעקב התקדמות (משקלים, חזרות)
- [ ] ניתוח נפח אימון

---

## 12. הנחיות פיתוח (Development Guidelines)

### 12.1 קוד

- TypeScript strict mode
- כל פונקציית חישוב – pure function עם unit tests
- כל component – props typed, default values
- State management: Zustand stores מופרדים per-module
- API calls: centralized service layer, never from components directly
- Error boundaries בכל module

### 12.2 ביצועים

- Lazy loading לכל module שלא בדשבורד
- Chart data: memoized, recalculated only on data change
- Images: compressed before upload, lazy loaded in timeline
- Supabase queries: indexed on user_id + date

### 12.3 נגישות

- ARIA labels על כל אלמנט אינטראקטיבי
- Keyboard navigation מלאה
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Screen reader compatible chart descriptions

### 12.4 בדיקות

- Unit tests: כל פונקציית חישוב (Jest)
- Integration tests: flows קריטיים (Onboarding, Weight Input)
- E2E: Happy path + edge cases (Playwright)
- Visual regression: Storybook + Chromatic

---

## 13. נספח – מילון מונחים למשתמש

כל מונח טכני שמופיע באפליקציה חייב להיות נגיש דרך tooltip או מסך הסברים.

| מונח | הסבר בעברית |
|------|-------------|
| BMI | מדד מסת גוף – מספר שמשווה בין המשקל לגובה. עוזר להבין אם המשקל בטווח בריא |
| BMR | קצב חילוף חומרים בסיסי – כמה קלוריות הגוף שורף במנוחה מוחלטת |
| TDEE | סך השריפה היומית – כמה קלוריות נשרפות ביום כולל כל הפעילות |
| גירעון קלורי | ההפרש בין מה שאוכלים למה שהגוף שורף. גירעון = ירידה במשקל |
| ממוצע נע | ממוצע שמחשב את 7 הימים האחרונים ומתעדכן כל יום. מחליק תנודות |
| סטיית תקן | מדד לתנודתיות – ככל שגבוה יותר, יש יותר קפיצות במשקל |
| R² | מספר בין 0 ל-1 שאומר כמה המגמה ברורה. קרוב ל-1 = מגמה חזקה |
| IQR | הטווח שבו נמצאות 50% מהמדידות האמצעיות. עוזר לסנן קיצוניות |
| CV | מדד תנודתיות יחסי – משווה את התנודות לממוצע. מאפשר השוואה בין תקופות |
| LBM | מסת גוף רזה – כל מה שלא שומן: שריר, עצם, מים, איברים |
| FM | מסת שומן – כמות השומן בגוף בק"ג |
| Slope | שיפוע קו המגמה – מראה לאן המשקל הולך וכמה מהר |
| Confidence Band | טווח ביטחון – האזור שבו המשקל צפוי להיות עם סבירות גבוהה |
| Outlier | מדידה חריגה – ערך שרחוק מאוד מהממוצע, כנראה בגלל תנאים שונים |

---

## 14. סיכום – Check Before Build

לפני כתיבת שורת קוד ראשונה, ודא:

- [ ] Supabase project מוגדר עם tables + RLS
- [ ] Auth flow עובד (email + Google)
- [ ] Design system מוטמע (צבעים, fonts, components)
- [ ] RTL layout עובד בכל הרזולוציות
- [ ] Calculation utils כתובים ונבדקים (pure functions)
- [ ] Chart wrapper component מוכן
- [ ] Module structure מוגדרת בתיקיות

---

> **הערה:** מסמך זה מהווה את ה-source of truth לבניית האפליקציה.
> כל סטייה מהמסמך דורשת אישור ותיעוד.
