// src/screens/HealthScoreScreen.js - Financial Health Score dashboard
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import {
  calcHealthScore, getHealthLabel, formatCurrency,
  calcAvailableBudget, getRemainingDaysInMonth,
  calcSafeDailyLimit, getDaysInMonth, groupByDate,
} from '../utils/financialUtils';
import { StorageService } from '../services/StorageService';

const { width } = Dimensions.get('window');

export default function HealthScoreScreen({ navigation }) {
  const { profile, monthExpenses, totalSpent, reload } = useApp();

  const score = useMemo(() => calcHealthScore(profile, monthExpenses), [profile, monthExpenses]);
  const { label, color } = getHealthLabel(score);

  const remainingDays = getRemainingDaysInMonth();
  const remainingBudget = useMemo(() => calcAvailableBudget(profile || {}, totalSpent), [profile, totalSpent]);
  const dailyLimit = useMemo(() => calcSafeDailyLimit(remainingBudget, remainingDays), [remainingBudget, remainingDays]);
  const totalDays = getDaysInMonth();
  const disposable = profile ? profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal : 0;

  // Last 7 days bar chart
  const now = new Date();
  const last7Data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const byDate = groupByDate(monthExpenses);
    const exps = byDate[dateStr] || [];
    const spent = exps.reduce((s, e) => s + e.amount, 0);
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      spent,
    };
  });

  const barData = {
    labels: last7Data.map(d => d.day),
    datasets: [{ data: last7Data.map(d => d.spent || 0) }],
  };

  // Overspent days count
  const byDate = groupByDate(monthExpenses);
  const dayKeys = Object.keys(byDate);
  const overspentDays = dayKeys.filter(d => {
    const s = byDate[d].reduce((a, e) => a + e.amount, 0);
    return s > dailyLimit;
  }).length;

  // Savings progress
  const projectedSavings = profile ? profile.monthlyIncome - profile.fixedExpenses - totalSpent : 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const savingsPercent = Math.min((projectedSavings / Math.max(savingsGoal, 1)) * 100, 100);

  // Score breakdown
  const budgetScore = Math.min(40, Math.max(0, 40 - Math.max(0, (totalSpent / Math.max(disposable, 1)) - 1) * 40));
  const overScore = Math.max(0, 30 - (dayKeys.length > 0 ? (overspentDays / dayKeys.length) * 30 : 0));
  const savScore = Math.max(0, Math.min(30, (projectedSavings / Math.max(savingsGoal, 1)) * 30));

  const handleReset = () => {
    Alert.alert('Reset App', 'This will clear all data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: async () => {
          await StorageService.clearUserProfile();
          await StorageService.clearExpenses();
          await reload();
          navigation.replace('Onboarding');
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Health</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score Hero */}
        <LinearGradient colors={['#162033', '#1A2235']} style={styles.scoreCard}>
          {/* Circular score display */}
          <View style={styles.scoreCircleWrapper}>
            <View style={[styles.scoreCircle, { borderColor: color }]}>
              <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
          <Text style={styles.scoreSub}>Your financial health score for this month</Text>

          {/* Score bar */}
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
          </View>
        </LinearGradient>

        {/* Score Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <ScoreComponent label="Budget Adherence" score={Math.round(budgetScore)} max={40} color={COLORS.accent} icon="💰" />
          <ScoreComponent label="Spending Consistency" score={Math.round(overScore)} max={30} color={COLORS.accentBlue} icon="📅" />
          <ScoreComponent label="Savings Progress" score={Math.round(savScore)} max={30} color={COLORS.accentPurple} icon="🏦" />
        </View>

        {/* Monthly Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Days Overspent" value={overspentDays} unit="days" color={overspentDays > 5 ? COLORS.danger : COLORS.warning} icon="📊" />
          <StatCard label="Remaining Budget" value={formatCurrency(remainingBudget, true)} color={remainingBudget > 0 ? COLORS.success : COLORS.danger} icon="💵" />
          <StatCard label="Transactions" value={monthExpenses.length} unit="this month" color={COLORS.accentBlue} icon="🧾" />
          <StatCard label="Savings Rate" value={`${Math.max(0, Math.round((projectedSavings / Math.max(profile?.monthlyIncome || 1, 1)) * 100))}%`} color={COLORS.accentPurple} icon="📈" />
        </View>

        {/* Savings Goal */}
        {savingsGoal > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Savings Goal</Text>
            <View style={styles.savingsRow}>
              <View>
                <Text style={styles.savingsValue}>{formatCurrency(Math.max(projectedSavings, 0))}</Text>
                <Text style={styles.savingsSub}>of {formatCurrency(savingsGoal)} goal</Text>
              </View>
              <Text style={[styles.savingsPct, { color: savingsPercent >= 100 ? COLORS.success : COLORS.warning }]}>
                {Math.max(0, Math.round(savingsPercent))}%
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, {
                width: `${Math.max(0, Math.min(savingsPercent, 100))}%`,
                backgroundColor: savingsPercent >= 100 ? COLORS.success : COLORS.accentBlue,
              }]} />
            </View>
          </View>
        )}

        {/* 7-Day Spending Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last 7 Days Spending</Text>
          {last7Data.some(d => d.spent > 0) ? (
            <BarChart
              data={barData}
              width={width - 64}
              height={160}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
                labelColor: () => COLORS.textSecondary,
                propsForLabels: { fontSize: 10 },
              }}
              style={{ borderRadius: RADIUS.md }}
              showValuesOnTopOfBars={false}
              withInnerLines={false}
              fromZero
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No spending data yet</Text>
            </View>
          )}
          {/* Daily limit line hint */}
          <Text style={styles.chartHint}>
            Daily safe limit: {formatCurrency(dailyLimit)}
          </Text>
        </View>

        {/* Tips Based on Score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Personalized Tips</Text>
          {getTips(score, profile?.userType).map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>→</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function ScoreComponent({ label, score, max, color, icon }) {
  const pct = (score / max) * 100;
  return (
    <View style={styles.scoreComp}>
      <Text style={styles.compIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.compHeader}>
          <Text style={styles.compLabel}>{label}</Text>
          <Text style={[styles.compScore, { color }]}>{score}/{max}</Text>
        </View>
        <View style={styles.compBarTrack}>
          <View style={[styles.compBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const getTips = (score, userType) => {
  const tips = [];
  if (score < 40) {
    tips.push('You\'re significantly over budget. Pause all non-essential spending for the rest of the month.');
    tips.push('List your top 3 discretionary expenses and cut at least one entirely.');
  } else if (score < 60) {
    tips.push('You\'re on the edge. Stick strictly to your daily limit for the next week.');
    if (userType === 'student') tips.push('Cook at home more — food is often the biggest variable expense for students.');
    else tips.push('Review your subscriptions. Cancel any unused ones immediately.');
  } else if (score < 80) {
    tips.push('Good progress! Try to save an extra 5% by reducing entertainment spending.');
    tips.push('Set up automatic transfers to savings at month start to hit your goal consistently.');
  } else {
    tips.push('Excellent discipline! Consider investing your surplus in a recurring deposit or liquid fund.');
    tips.push('You\'re building strong financial habits. Maintain this momentum next month too.');
  }
  tips.push('Track every ₹10 — small expenses add up faster than you think.');
  return tips;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  resetBtn: { padding: 8 },
  scoreCard: {
    margin: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.lg,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  scoreCircleWrapper: { marginBottom: SPACING.md },
  scoreCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 4, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scoreNumber: { fontSize: 40, fontWeight: '800', letterSpacing: -2 },
  scoreMax: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginTop: -4 },
  scoreLabel: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  scoreSub: { color: COLORS.textMuted, fontSize: 12, marginBottom: SPACING.md },
  scoreBarTrack: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: 8, borderRadius: 4 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: SPACING.md },
  scoreComp: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  compIcon: { fontSize: 18, width: 24 },
  compHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  compLabel: { color: COLORS.textSecondary, fontSize: 13 },
  compScore: { fontSize: 13, fontWeight: '700' },
  compBarTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  compBarFill: { height: 4, borderRadius: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    width: (width - 56) / 2, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statUnit: { color: COLORS.textMuted, fontSize: 11 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  savingsValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  savingsSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  savingsPct: { fontSize: 24, fontWeight: '800' },
  barTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  emptyChart: { alignItems: 'center', paddingVertical: SPACING.lg },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  chartHint: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tipBullet: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginTop: 1 },
  tipText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
