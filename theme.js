// src/utils/theme.js - Design system for AI Financial Copilot
// Light mode: White & Blue aesthetic for clean, modern design

export const COLORS = {
  // Base
  background: '#FFFFFF',
  surface: '#F8FAFB',
  surfaceElevated: '#F0F4F8',
  card: '#FFFFFF',

  // Accent palette
  accent: '#3B82F6',        // Blue - primary CTA
  accentSoft: '#3B82F622',
  accentBlue: '#0EA5E9',    // Sky blue
  accentPurple: '#6366F1',
  accentAmber: '#F97316',

  // Status colors
  success: '#10B981',
  successSoft: '#D1FAE510',
  warning: '#F59E0B',
  warningSoft: '#FEF3C710',
  danger: '#EF4444',
  dangerSoft: '#FEE2E210',

  // Typography
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Calendar colors
  calGreen: '#10B981',
  calYellow: '#F59E0B',
  calRed: '#EF4444',
  calEmpty: '#F3F4F6',

  // Gradient stops
  gradientStart: '#FFFFFF',
  gradientEnd: '#F0F4F8',
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  display: { fontWeight: '800', letterSpacing: -0.5 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Expense categories with icons and colors
export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  { id: 'transport', label: 'Transport', icon: '🚌', color: '#3B82F6' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'health', label: 'Health', icon: '💊', color: '#10B981' },
  { id: 'education', label: 'Education', icon: '📚', color: '#06B6D4' },
  { id: 'utilities', label: 'Utilities', icon: '⚡', color: '#F97316' },
  { id: 'other', label: 'Other', icon: '📦', color: '#94A3B8' },
];

export const USER_TYPES = [
  { id: 'student', label: 'Student', icon: '🎓', desc: 'Managing on limited budget' },
  { id: 'professional', label: 'Working Professional', icon: '💼', desc: 'Growing income & savings' },
  { id: 'other', label: 'Other', icon: '✨', desc: 'Custom financial journey' },
];
