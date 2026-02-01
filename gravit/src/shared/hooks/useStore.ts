import { create } from 'zustand';
import type { UserProfile, WeightEntry } from '../types';
import * as storage from '../../services/storage';

interface AppState {
  profile: UserProfile | null;
  entries: WeightEntry[];
  isOnboarded: boolean;
  loadData: () => void;
  setProfile: (profile: UserProfile) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  deleteWeightEntry: (date: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearAll: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  profile: null,
  entries: [],
  isOnboarded: false,

  loadData: () => {
    const profile = storage.loadProfile();
    const entries = storage.loadEntries();
    set({ profile, entries, isOnboarded: !!profile });
  },

  setProfile: (profile) => {
    storage.saveProfile(profile);
    set({ profile, isOnboarded: true });
  },

  addWeightEntry: (entry) => {
    const entries = storage.addEntry(entry);
    set({ entries });
  },

  deleteWeightEntry: (date) => {
    const entries = storage.deleteEntry(date);
    set({ entries });
  },

  updateProfile: (updates) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...updates };
    storage.saveProfile(updated);
    set({ profile: updated });
  },

  clearAll: () => {
    storage.clearAllData();
    set({ profile: null, entries: [], isOnboarded: false });
  },
}));
