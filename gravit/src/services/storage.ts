import type { UserProfile, WeightEntry } from '../shared/types';

const PROFILE_KEY = 'gravit_profile';
const ENTRIES_KEY = 'gravit_entries';

export function loadProfile(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadEntries(): WeightEntry[] {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEntries(entries: WeightEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: WeightEntry): WeightEntry[] {
  const entries = loadEntries();
  const existingIdx = entries.findIndex(e => e.date === entry.date);
  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries.push(entry);
  }
  saveEntries(entries);
  return entries;
}

export function deleteEntry(date: string): WeightEntry[] {
  const entries = loadEntries().filter(e => e.date !== date);
  saveEntries(entries);
  return entries;
}

export function clearAllData(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ENTRIES_KEY);
}
