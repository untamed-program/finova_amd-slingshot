// src/screens/OnboardingScreen.js - User profile setup
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, USER_TYPES } from '../utils/theme';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen({ navigation }) {
  const { saveProfile } = useApp();
  const [step, setStep] = useState(1); // 1: user type, 2: financial info
  const [userType, setUserType] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  const handleNext = () => {
    if (!userType) return Alert.alert('Select your profile type to continue');
    setStep(2);
  };

  const handleComplete = async () => {
    const income = parseFloat(monthlyIncome);
    const fixed = parseFloat(fixedExpenses) || 0;
    const savings = parseFloat(savingsGoal) || 0;

    if (!income || income <= 0) return Alert.alert('Please enter a valid monthly income');
    if (fixed + savings >= income) return Alert.alert('Fixed expenses + savings goal cannot exceed income');

    await saveProfile({ userType, monthlyIncome: income, fixedExpenses: fixed, savingsGoal: savings });
    navigation.replace('MainTabs');
  };

  return (
    <LinearGradient colors={['#0A0E1A', '#0F1929', '#0A0E1A']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.logoIcon}>🤖</Text>
              <Text style={styles.logoText}>AI Financial Copilot</Text>
            </View>
            <Text style={styles.tagline}>Smart budgeting for the next generation</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          {step === 1 ? (
            <View>
              <Text style={styles.sectionTitle}>Who are you?</Text>
              <Text style={styles.sectionSub}>We'll personalize your financial strategy</Text>
              {USER_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeCard, userType === type.id && styles.typeCardActive]}
                  onPress={() => setUserType(type.id)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeLabel}>{type.label}</Text>
                    <Text style={styles.typeDesc}>{type.desc}</Text>
                  </View>
                  {userType === type.id && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.btn} onPress={handleNext}>
                <Text style={styles.btnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Your Finances</Text>
              <Text style={styles.sectionSub}>This helps us calculate your budget accurately</Text>

              <InputField
                label="Monthly Income / Stipend"
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                placeholder="e.g. 30000"
                hint="Your total income this month"
              />
              <InputField
                label="Fixed Expenses"
                value={fixedExpenses}
                onChangeText={setFixedExpenses}
                placeholder="e.g. 10000"
                hint="Rent, subscriptions, EMIs etc."
              />
              <InputField
                label="Monthly Savings Goal"
                value={savingsGoal}
                onChangeText={setSavingsGoal}
                placeholder="e.g. 5000"
                hint="Amount you want to save"
              />

              {monthlyIncome ? (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Budget Breakdown</Text>
                  <Row label="Income" value={`₹${parseFloat(monthlyIncome) || 0}`} />
                  <Row label="Fixed Expenses" value={`-₹${parseFloat(fixedExpenses) || 0}`} color={COLORS.warning} />
                  <Row label="Savings Goal" value={`-₹${parseFloat(savingsGoal) || 0}`} color={COLORS.accentBlue} />
                  <View style={styles.divider} />
                  <Row
                    label="Spendable Budget"
                    value={`₹${Math.max(0, (parseFloat(monthlyIncome) || 0) - (parseFloat(fixedExpenses) || 0) - (parseFloat(savingsGoal) || 0))}`}
                    color={COLORS.accent}
                    bold
                  />
                </View>
              ) : null}

              <TouchableOpacity style={styles.btn} onPress={handleComplete}>
                <Text style={styles.btnText}>Launch My Copilot 🚀</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InputField({ label, value, onChangeText, placeholder, hint }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Text style={styles.rupee}>₹</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
        />
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

function Row({ label, value, color, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color && { color }, bold && { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoIcon: { fontSize: 32 },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  tagline: { color: COLORS.textSecondary, fontSize: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.accent },
  progressLine: { width: 60, height: 2, backgroundColor: COLORS.border, marginHorizontal: 6 },
  progressLineActive: { backgroundColor: COLORS.accent },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  sectionSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  typeIcon: { fontSize: 28 },
  typeLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  typeDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  btn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.full,
    padding: 16, alignItems: 'center', marginTop: SPACING.lg,
  },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: 14 },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14,
  },
  rupee: { color: COLORS.accent, fontSize: 18, fontWeight: '700', marginRight: 6 },
  input: { flex: 1, color: COLORS.text, fontSize: 18, paddingVertical: 14, fontWeight: '600' },
  hint: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, marginLeft: 4 },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
});
