import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import type { WeightEntry } from '../../../shared/types';
import { sortByDate } from '../utils/calculations';

interface Props {
  entries: WeightEntry[];
  sma7: { date: string; value: number }[];
  targetWeight?: number;
}

export function WeightChart({ entries, sma7, targetWeight }: Props) {
  const data = useMemo(() => {
    const sorted = sortByDate(entries);
    return sorted.map((e, i) => ({
      date: formatShort(e.date),
      weight: e.weightKg,
      sma7: sma7[i]?.value ?? null,
    }));
  }, [entries, sma7]);

  const weights = entries.map(e => e.weightKg);
  const min = Math.floor(Math.min(...weights, targetWeight ?? Infinity) - 1);
  const max = Math.ceil(Math.max(...weights, targetWeight ?? -Infinity) + 1);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4ECDC4"
            strokeWidth={2}
            dot={{ fill: '#4ECDC4', r: 3 }}
            activeDot={{ r: 5 }}
            name="משקל"
          />
          <Line
            type="monotone"
            dataKey="sma7"
            stroke="#7C5CFC"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="ממוצע נע 7"
          />
          {targetWeight && (
            <ReferenceLine
              y={targetWeight}
              stroke="#A0AEC0"
              strokeDasharray="3 3"
              label={{ value: 'יעד', fill: '#A0AEC0', fontSize: 11 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatShort(date: string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
