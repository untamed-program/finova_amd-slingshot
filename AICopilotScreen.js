// src/screens/AICopilotScreen.js - Mode 2: Effective Money Management with AI
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { queryAI } from '../services/AIService';
import {
  formatCurrency, calcAvailableBudget, calcSafeDailyLimit,
  getRemainingDaysInMonth,
} from '../utils/financialUtils';

const QUICK_QUESTIONS = [
  'Can I eat out today?',
  'Should I buy a new course?',
  'Can I afford a movie tonight?',
  'How should I budget this week?',
];

export default function AICopilotScreen() {
  const { profile, monthExpenses, totalSpent, appMode } = useApp();
  const [spendingAmount, setSpendingAmount] = useState('');
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const remainingDays = getRemainingDaysInMonth();
  const remainingBudget = useMemo(() => calcAvailableBudget(profile || {}, totalSpent), [profile, totalSpent]);
  const dailyLimit = useMemo(() => calcSafeDailyLimit(remainingBudget, remainingDays), [remainingBudget, remainingDays]);

  const disposable = profile ? profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal : 0;
  const budgetUsedPercent = Math.min((totalSpent / Math.max(disposable, 1)) * 100, 100);

  const handleAsk = async (quickQ = null) => {
    if (loading) return;
    const q = quickQ || question;

    setLoading(true);
    setAiResponse(null);

    try {
      const result = await queryAI({
        userType: profile?.userType || 'other',
        monthlyIncome: profile?.monthlyIncome || 0,
        fixedExpenses: profile?.fixedExpenses || 0,
        savingsGoal: profile?.savingsGoal || 0,
        remainingDays,
        remainingBudget,
        totalSpent,
        spendingRequest: parseFloat(spendingAmount) || 0,
        question: q || `Can I spend ₹${spendingAmount}?`,
      });

      if (result.success) {
        setAiResponse(result.data);
        setHistory(prev => [
          { question: q || `Spend ₹${spendingAmount}?`, response: result.data, time: new Date() },
          ...prev.slice(0, 4),
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const decisionConfig = {
    approve: { color: COLORS.success, bg: COLORS.successSoft, icon: '✅', label: 'Approved' },
    caution: { color: COLORS.warning, bg: COLORS.warningSoft, icon: '⚠️', label: 'Caution' },
    reject: { color: COLORS.danger, bg: COLORS.dangerSoft, icon: '🚫', label: 'Not Recommended' },
  };

  if (appMode === 'simple') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🤖</Text>
        <Text style={styles.lockedTitle}>AI Mode Required</Text>
        <Text style={styles.lockedSub}>Switch to AI Mode from Dashboard to access your Financial Copilot</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AI Copilot</Text>
          <Text style={styles.headerSub}>Powered by behavioral finance AI</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: COLORS.accentSoft }]}>
          <Text style={{ color: COLORS.accent, fontSize: 10, fontWeight: '700' }}>MOCK AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Budget Status */}
          <LinearGradient colors={['#162033', '#1A2235']} style={styles.budgetCard}>
            <View style={styles.budgetRow}>
              <BudgetStat
                label="Remaining"
                value={formatCurrency(remainingBudget)}
                color={remainingBudget > 0 ? COLORS.accent : COLORS.danger}
              />
              <BudgetStat
                label="Daily Safe Limit"
                value={formatCurrency(dailyLimit)}
                color={COLORS.accentBlue}
              />
              <BudgetStat
                label="Days Left"
                value={remainingDays}
                color={COLORS.accentPurple}
              />
            </View>

            <View style={styles.progressLabel}>
              <Text style={styles.progressText}>Budget Used</Text>
              <Text style={styles.progressPct}>{Math.round(budgetUsedPercent)}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, {
                width: `${budgetUsedPercent}%`,
                backgroundColor: budgetUsedPercent > 90 ? COLORS.danger
                  : budgetUsedPercent > 70 ? COLORS.warning : COLORS.accent,
              }]} />
            </View>
          </LinearGradient>

          {/* Ask Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💬 Ask Your Copilot</Text>

            {/* Amount Input */}
            <View style={styles.amountRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={spendingAmount}
                onChangeText={setSpendingAmount}
                placeholder="Amount to spend"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            {/* Question Input */}
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask anything about your finances..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={200}
            />

            {/* Quick Questions */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
              {QUICK_QUESTIONS.map(q => (
                <TouchableOpacity
                  key={q}
                  style={styles.quickChip}
                  onPress={() => {
                    setQuestion(q);
                    handleAsk(q);
                  }}
                >
                  <Text style={styles.quickText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.askBtn, loading && { opacity: 0.7 }]}
              onPress={() => handleAsk()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#000" />
                  <Text style={styles.askBtnText}>Get AI Advice</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Response */}
          {aiResponse && (() => {
            const config = decisionConfig[aiResponse.decision] || decisionConfig.caution;
            return (
              <View style={[styles.responseCard, { borderColor: config.color + '44' }, SHADOWS.card]}>
                <LinearGradient
                  colors={[config.bg, COLORS.surface]}
                  style={styles.responseHeader}
                >
                  <Text style={styles.decisionIcon}>{config.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.decisionLabel, { color: config.color }]}>{config.label}</Text>
                    <Text style={styles.explanation}>{aiResponse.explanation}</Text>
                  </View>
                </LinearGradient>

                <View style={styles.responseBody}>
                  <ResponseSection icon="💡" title="Strategy" text={aiResponse.strategy} />
                  <ResponseSection icon="📋" title="Adjustment Plan" text={aiResponse.adjustment_plan} />
                  {aiResponse.health_tip && (
                    <ResponseSection icon="🧠" title="Behavioral Insight" text={aiResponse.health_tip} />
                  )}
                </View>
              </View>
            );
          })()}

          {/* Query History */}
          {history.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Queries</Text>
              {history.map((item, i) => {
                const config = decisionConfig[item.response.decision] || decisionConfig.caution;
                return (
                  <View key={i} style={styles.histRow}>
                    <Text style={styles.histIcon}>{config.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.histQ}>{item.question}</Text>
                      <Text style={[styles.histD, { color: config.color }]}>{config.label}</Text>
                    </View>
                    <Text style={styles.histTime}>
                      {item.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function BudgetStat({ label, value, color }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.budgetStatValue, { color }]}>{value}</Text>
      <Text style={styles.budgetStatLabel}>{label}</Text>
    </View>
  );
}

function ResponseSection({ icon, title, text }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{icon} {title}</Text>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  lockedTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  lockedSub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  budgetCard: {
    margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  budgetStatValue: { fontSize: 16, fontWeight: '800' },
  budgetStatLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { color: COLORS.textSecondary, fontSize: 12 },
  progressPct: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: SPACING.md },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, marginBottom: SPACING.sm,
  },
  rupee: { color: COLORS.accent, fontSize: 22, fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, color: COLORS.text, fontSize: 20, paddingVertical: 12, fontWeight: '700' },
  questionInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, color: COLORS.text, fontSize: 14,
    minHeight: 60, marginBottom: SPACING.sm, textAlignVertical: 'top',
  },
  quickRow: { marginBottom: SPACING.md },
  quickChip: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
  },
  quickText: { color: COLORS.textSecondary, fontSize: 12 },
  askBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.full,
    padding: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  askBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  responseCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, overflow: 'hidden',
  },
  responseHeader: { flexDirection: 'row', gap: 12, padding: SPACING.md, alignItems: 'flex-start' },
  decisionIcon: { fontSize: 28 },
  decisionLabel: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  explanation: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  responseBody: { padding: SPACING.md },
  section: { marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderColor: COLORS.border },
  histIcon: { fontSize: 16 },
  histQ: { color: COLORS.text, fontSize: 13 },
  histD: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  histTime: { color: COLORS.textMuted, fontSize: 11 },
});
