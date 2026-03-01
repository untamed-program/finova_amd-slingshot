// src/services/StorageService.js - Local persistence layer
// Designed to be swappable with a Node.js backend later

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@copilot_user_profile',
  EXPENSES: '@copilot_expenses',
  APP_MODE: '@copilot_app_mode',
};

export const StorageService = {
  // --- User Profile ---
  async getUserProfile() {
    const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  },

  async saveUserProfile(profile) {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async clearUserProfile() {
    await AsyncStorage.removeItem(KEYS.USER_PROFILE);
  },

  // --- Expenses ---
  async getExpenses() {
    const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  },

  async addExpense(expense) {
    const existing = await StorageService.getExpenses();
    const updated = [
      { ...expense, id: Date.now().toString(), date: expense.date || new Date().toISOString() },
      ...existing,
    ];
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
    return updated;
  },

  async deleteExpense(id) {
    const existing = await StorageService.getExpenses();
    const updated = existing.filter(e => e.id !== id);
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
    return updated;
  },

  async clearExpenses() {
    await AsyncStorage.removeItem(KEYS.EXPENSES);
  },

  // --- App Mode ---
  async getAppMode() {
    const mode = await AsyncStorage.getItem(KEYS.APP_MODE);
    return mode || 'simple'; // 'simple' | 'ai'
  },

  async setAppMode(mode) {
    await AsyncStorage.setItem(KEYS.APP_MODE, mode);
  },
};

// NOTE: To connect to Node.js backend later, replace the AsyncStorage calls
// in each method with fetch() calls to your API endpoints, e.g.:
//   async getUserProfile() {
//     const res = await fetch(`${API_BASE}/profile`, { headers: authHeaders });
//     return res.json();
//   }
