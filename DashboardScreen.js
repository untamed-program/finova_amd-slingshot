// src/screens/DashboardScreen.js - Main dashboard overview
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import {
  COLORS, SPACING, RADIUS, SHADOWS, CATEGORIES,
} from '../utils/theme';
import {
  formatCurrency, calcAvailableBudget, calcSafeDailyLimit,
  getRemainingDaysInMonth, getCurrentMonthLabel, calcHealthScore, getHealthLabel,
} from '../utils/financialUtils';

export default function DashboardScreen({ navigation }) {
  const { profile, monthExpenses, totalSpent, appMode, setMode } = useApp();

  const remainingDays = getRemainingDaysInMonth();
  const availableBudget = useMemo(() => calcAvailableBudget(profile || {}, totalSpent), [profile, totalSpent]);
  const dailyLimit = useMemo(() => calcSafeDailyLimit(availableBudget, remainingDays), [availableBudget, remainingDays]);
  const healthScore = useMemo(() => calcHealthScore(profile, monthExpenses), [profile, monthExpenses]);
  const { label: healthLabel, color: healthColor } = getHealthLabel(healthScore);
  const disposable = profile ? profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal : 0;
  const spentPercent = Math.min((totalSpent / Math.max(disposable, 1)) * 100, 100);

  // Recent 3 expenses
  const recentExpenses = monthExpenses.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#F5F5F5', '#EEEEEE']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
              <Text style={styles.userName}>{getProfileLabel(profile?.userType)} 👋</Text>
            </View>
            <View style={styles.modeToggle}>
              <Text style={styles.modeLabel}>{appMode === 'ai' ? '🤖 AI' : '📊 Simple'}</Text>
              <Switch
                value={appMode === 'ai'}
                onValueChange={v => setMode(v ? 'ai' : 'simple')}
                trackColor={{ false: COLORS.border, true: COLORS.accentSoft }}
                thumbColor={appMode === 'ai' ? COLORS.accent : COLORS.textMuted}
              />
            </View>
          </View>
          <Text style={styles.monthLabel}>{getCurrentMonthLabel()}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Budget Hero Card */}
          <View style={[styles.heroCard, SHADOWS.card]}>
            <LinearGradient
              colors={['#162033', '#1A2235']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>Remaining Budget</Text>
              <Text style={[styles.heroAmount, { color: availableBudget > 0 ? COLORS.accent : COLORS.danger }]}>
                {formatCurrency(availableBudget)}
              </Text>

              {/* Budget bar */}
              <View style={styles.barTrack}>
                <View style={[styles.barFill, {
                  width: `${spentPercent}%`,
                  backgroundColor: spentPercent > 90 ? COLORS.danger : spentPercent > 70 ? COLORS.warning : COLORS.accent,
                }]} />
              </View>

              <View style={styles.heroRow}>
                <StatMini label="Spent" value={formatCurrency(totalSpent, true)} color={COLORS.warning} />
                <StatMini label="Budget" value={formatCurrency(disposable, true)} color={COLORS.text} />
                <StatMini label="Daily Limit" value={formatCurrency(dailyLimit, true)} color={COLORS.accentBlue} />
              </View>
            </LinearGradient>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              label="Days Left"
              value={remainingDays}
              color={COLORS.accentBlue}
            />
            <StatCard
              icon="trending-down-outline"
              label="Transactions"
              value={monthExpenses.length}
              color={COLORS.accentPurple}
            />
            <StatCard
              icon="heart-outline"
              label="Health"
              value={`${healthScore}`}
              color={healthColor}
              sub={healthLabel}
            />
          </View>

          {/* AI Mode Banner */}
          {appMode === 'ai' && (
            <TouchableOpacity
              style={[styles.aiBanner, SHADOWS.glow]}
              onPress={() => navigation.navigate('AI Copilot')}
            >
              <LinearGradient
                colors={[COLORS.accentSoft, '#00D4AA11']}
                style={styles.aiBannerInner}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.aiBannerIcon}>🤖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiBannerTitle}>AI Copilot Active</Text>
                  <Text style={styles.aiBannerSub}>Ask "Can I spend ₹500?" →</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Savings Progress */}
          {profile?.savingsGoal > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Savings Goal</Text>
              <View style={styles.savingsRow}>
                <Text style={styles.savingsAmount}>₹{profile.savingsGoal.toLocaleString('en-IN')}</Text>
                <Text style={styles.savingsStatus}>
                  {availableBudget > 0 ? '✅ On Track' : '⚠️ At Risk'}
                </Text>
              </View>
            </View>
          )}

          {/* Recent Transactions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tracker')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            {recentExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyText}>No expenses yet this month</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => navigation.navigate('AddExpense')}
                >
                  <Text style={styles.addBtnText}>+ Add First Expense</Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentExpenses.map(exp => <ExpenseRow key={exp.id} expense={exp} />)
            )}
          </View>

          {/* Add Expense FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <LinearGradient colors={[COLORS.accent, '#00B894']} style={styles.fabInner}>
              <Ionicons name="add" size={28} color="#000" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 6 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatMini({ label, value, color }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function ExpenseRow({ expense }) {
  const cat = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[7];
  return (
    <View style={styles.expRow}>
      <View style={[styles.expIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expNote}>{expense.note || cat.label}</Text>
        <Text style={styles.expCat}>{cat.label}</Text>
      </View>
      <Text style={styles.expAmount}>-{formatCurrency(expense.amount)}</Text>
    </View>
  );
}

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const getProfileLabel = (type) => {
  const map = { student: 'Scholar', professional: 'Professional', other: 'Friend' };
  return map[type] || 'Friend';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  greeting: { color: COLORS.textSecondary, fontSize: 13 },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  modeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  monthLabel: { color: COLORS.textMuted, fontSize: 12 },
  content: { padding: SPACING.md },
  heroCard: { borderRadius: RADIUS.xl, marginBottom: SPACING.md, overflow: 'hidden' },
  heroGradient: { padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  heroLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  heroAmount: { fontSize: 38, fontWeight: '800', letterSpacing: -1, marginBottom: 16 },
  barTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  miniValue: { fontSize: 15, fontWeight: '700' },
  miniLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  statSub: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
  aiBanner: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md },
  aiBannerInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: 10 },
  aiBannerIcon: { fontSize: 24 },
  aiBannerTitle: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  aiBannerSub: { color: COLORS.textSecondary, fontSize: 12 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: SPACING.sm },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsAmount: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  savingsStatus: { color: COLORS.textSecondary, fontSize: 13 },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  expIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  expNote: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  expCat: { color: COLORS.textMuted, fontSize: 12 },
  expAmount: { color: COLORS.warning, fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.lg },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 12 },
  addBtn: { backgroundColor: COLORS.accentSoft, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full },
  addBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  fab: { position: 'absolute', bottom: 100, right: SPACING.md, borderRadius: RADIUS.full, ...SHADOWS.glow },
  fabInner: { width: 56, height: 56, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center' },
});
