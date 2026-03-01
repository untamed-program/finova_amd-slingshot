// src/context/AppContext.js - Global state with Context + useReducer
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { StorageService } from '../services/StorageService';
import { getCurrentMonthExpenses } from '../utils/financialUtils';

const AppContext = createContext(null);

const initialState = {
  profile: null,
  expenses: [],
  appMode: 'simple', // 'simple' | 'ai'
  isLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'SET_MODE':
      return { ...state, appMode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load initial data from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [profile, expenses, mode] = await Promise.all([
        StorageService.getUserProfile(),
        StorageService.getExpenses(),
        StorageService.getAppMode(),
      ]);
      if (profile) dispatch({ type: 'SET_PROFILE', payload: profile });
      dispatch({ type: 'SET_EXPENSES', payload: expenses || [] });
      dispatch({ type: 'SET_MODE', payload: mode });
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveProfile = useCallback(async (profile) => {
    await StorageService.saveUserProfile(profile);
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const addExpense = useCallback(async (expense) => {
    const updated = await StorageService.addExpense(expense);
    dispatch({ type: 'SET_EXPENSES', payload: updated });
  }, []);

  const deleteExpense = useCallback(async (id) => {
    const updated = await StorageService.deleteExpense(id);
    dispatch({ type: 'SET_EXPENSES', payload: updated });
  }, []);

  const setMode = useCallback(async (mode) => {
    await StorageService.setAppMode(mode);
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // Derived: current month expenses only
  const monthExpenses = getCurrentMonthExpenses(state.expenses);
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <AppContext.Provider
      value={{
        ...state,
        monthExpenses,
        totalSpent,
        saveProfile,
        addExpense,
        deleteExpense,
        setMode,
        reload: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
