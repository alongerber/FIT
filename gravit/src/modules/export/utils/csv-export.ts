import type { WeightEntry } from '../../../shared/types';
import { sortByDate } from '../../weight/utils/calculations';

export function exportCSV(entries: WeightEntry[]): void {
  const sorted = sortByDate(entries);
  const BOM = '\uFEFF';
  const header = 'תאריך,משקל (ק"ג),שינוי יומי,אחוז שומן,הערות\n';

  let prevWeight: number | null = null;
  const rows = sorted.map(e => {
    const delta = prevWeight !== null ? Math.round((e.weightKg - prevWeight) * 10) / 10 : '';
    prevWeight = e.weightKg;
    return `${e.date},${e.weightKg},${delta},${e.bodyFatPct ?? ''},${e.note ? `"${e.note}"` : ''}`;
  }).join('\n');

  const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gravit-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
