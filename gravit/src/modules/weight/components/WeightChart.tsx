import { useMemo } from 'react';
import {
  ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, ComposedChart,
} from 'recharts';
import type { WeightEntry } from '../../../shared/types';
import type { Prediction } from '../utils/predictions';
import { sortByDate } from '../utils/calculations';

interface Props {
  entries: WeightEntry[];
  sma7: { date: string; value: number }[];
  targetWeight?: number;
  predictions?: Prediction[];
}

export function WeightChart({ entries, sma7, targetWeight, predictions = [] }: Props) {
  const data = useMemo(() => {
    const sorted = sortByDate(entries);
    const chartData: Record<string, unknown>[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      const prevEntry = i > 0 ? sorted[i - 1] : null;

      // Check for gap > 7 days
      let hasGap = false;
      if (prevEntry) {
        const daysDiff = (new Date(entry.date).getTime() - new Date(prevEntry.date).getTime()) / 86400000;
        hasGap = daysDiff > 7;
      }

      chartData.push({
        date: formatShort(entry.date),
        fullDate: entry.date,
        weight: entry.weightKg,
        weightGap: hasGap ? entry.weightKg : undefined,
        sma7: sma7[i]?.value ?? null,
        type: 'actual',
      });
    }

    // Add predictions
    for (const pred of predictions) {
      chartData.push({
        date: formatShort(pred.date),
        fullDate: pred.date,
        predicted: pred.predicted,
        upper: pred.upper,
        lower: pred.lower,
        type: 'prediction',
      });
    }

    return chartData;
  }, [entries, sma7, predictions]);

  const allValues = [
    ...entries.map(e => e.weightKg),
    ...predictions.map(p => p.upper),
    ...predictions.map(p => p.lower),
    ...(targetWeight ? [targetWeight] : []),
  ];
  const min = allValues.length > 0 ? Math.floor(Math.min(...allValues) - 1) : 0;
  const max = allValues.length > 0 ? Math.ceil(Math.max(...allValues) + 1) : 100;

  return (
    <div className="h-56" role="img" aria-label="גרף מגמת משקל">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#636E80', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: '#636E80', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#16213E',
              border: '1px solid #4ECDC4',
              borderRadius: 8,
              color: '#fff',
              direction: 'rtl',
            }}
          />

          {/* Confidence band for predictions */}
          {predictions.length > 0 && (
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#7C5CFC"
              fillOpacity={0.1}
              name="גבול עליון"
            />
          )}
          {predictions.length > 0 && (
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#0F0F1A"
              fillOpacity={1}
              name="גבול תחתון"
            />
          )}

          {/* Main weight line */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4ECDC4"
            strokeWidth={2}
            dot={{ fill: '#4ECDC4', r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
            name="משקל"
          />

          {/* Dashed line for gaps > 7 days */}
          <Line
            type="monotone"
            dataKey="weightGap"
            stroke="#4ECDC4"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            connectNulls={false}
            name=""
          />

          {/* SMA7 line */}
          <Line
            type="monotone"
            dataKey="sma7"
            stroke="#7C5CFC"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="ממוצע נע 7"
          />

          {/* Prediction line */}
          {predictions.length > 0 && (
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#7C5CFC"
              strokeWidth={2}
              dot={false}
              name="תחזית"
            />
          )}

          {targetWeight && (
            <ReferenceLine
              y={targetWeight}
              stroke="#A0AEC0"
              strokeDasharray="3 3"
              label={{ value: 'יעד', fill: '#A0AEC0', fontSize: 11 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatShort(date: string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
