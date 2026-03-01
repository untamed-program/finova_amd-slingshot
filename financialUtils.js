// src/utils/financialUtils.js - Core financial calculation helpers

/**
 * Get remaining days in current month
 */
export const getRemainingDaysInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1; // include today
};

/**
 * Get total days in current month
 */
export const getDaysInMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

/**
 * Get current month/year label
 */
export const getCurrentMonthLabel = () => {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

/**
 * Calculate available budget
 * @param {Object} profile - User profile
 * @param {number} totalSpent - Total spent this month
 */
export const calcAvailableBudget = (profile, totalSpent) => {
  const disposable = (profile.monthlyIncome || 0) - (profile.fixedExpenses || 0) - (profile.savingsGoal || 0);
  return Math.max(disposable - totalSpent, 0);
};

/**
 * Calculate safe daily spending limit
 * @param {number} remainingBudget
 * @param {number} remainingDays
 */
export const calcSafeDailyLimit = (remainingBudget, remainingDays) => {
  if (remainingDays <= 0) return 0;
  return remainingBudget / remainingDays;
};

/**
 * Get spending status for a day
 * @param {number} spent - amount spent
 * @param {number} dailyLimit
 * @returns 'safe' | 'moderate' | 'over'
 */
export const getDayStatus = (spent, dailyLimit) => {
  if (spent === 0) return 'none';
  if (spent <= dailyLimit) return 'safe';
  if (spent <= dailyLimit * 1.5) return 'moderate';
  return 'over';
};

/**
 * Calculate Financial Health Score (0-100)
 * Based on: savings consistency, overspending freq, budget adherence
 */
export const calcHealthScore = (profile, expenses) => {
  if (!profile || !expenses || expenses.length === 0) return 50;

  const income = profile.monthlyIncome || 0;
  const fixed = profile.fixedExpenses || 0;
  const savingsGoal = profile.savingsGoal || 0;
  const disposable = income - fixed - savingsGoal;

  if (income === 0) return 50;

  // Group expenses by day
  const daySpending = {};
  expenses.forEach(exp => {
    const date = exp.date?.split('T')[0] || new Date().toISOString().split('T')[0];
    daySpending[date] = (daySpending[date] || 0) + exp.amount;
  });

  const totalDays = getDaysInMonth();
  const dailyLimit = disposable / totalDays;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const days = Object.keys(daySpending);

  // Score component 1: Budget adherence (40 pts)
  const budgetRatio = totalSpent / Math.max(disposable, 1);
  const budgetScore = budgetRatio <= 1 ? 40 : Math.max(0, 40 - (budgetRatio - 1) * 40);

  // Score component 2: Overspending frequency (30 pts)
  const overDays = days.filter(d => daySpending[d] > dailyLimit).length;
  const overRatio = days.length > 0 ? overDays / days.length : 0;
  const overScore = Math.max(0, 30 - overRatio * 30);

  // Score component 3: Savings consistency (30 pts)
  const projectedSavings = income - fixed - totalSpent;
  const savingsScore = projectedSavings >= savingsGoal
    ? 30
    : Math.max(0, (projectedSavings / Math.max(savingsGoal, 1)) * 30);

  return Math.round(budgetScore + overScore + savingsScore);
};

/**
 * Get health score label and color
 */
export const getHealthLabel = (score) => {
  if (score >= 80) return { label: 'Excellent', color: '#10B981' };
  if (score >= 60) return { label: 'Good', color: '#3B82F6' };
  if (score >= 40) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Needs Work', color: '#EF4444' };
};

/**
 * Format currency in INR
 */
export const formatCurrency = (amount, compact = false) => {
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/**
 * Get expenses for current month only
 */
export const getCurrentMonthExpenses = (expenses) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};

/**
 * Group expenses by date string (YYYY-MM-DD)
 */
export const groupByDate = (expenses) => {
  return expenses.reduce((acc, exp) => {
    const date = exp.date?.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(exp);
    return acc;
  }, {});
};

/**
 * Group expenses by category
 */
export const groupByCategory = (expenses) => {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
};
