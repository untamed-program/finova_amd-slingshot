// src/screens/AddExpenseScreen.js - Add expense modal
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, CATEGORIES } from '../utils/theme';

export default function AddExpenseScreen({ navigation }) {
  const { addExpense } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Enter a valid amount');
    if (amt > 100000) return Alert.alert('Amount seems too large. Please verify.');

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: amt,
        category,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Failed to add expense. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === category);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>How much did you spend?</Text>
            <View style={styles.amountRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* Category Picker */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '22' }]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, category === cat.id && { color: cat.color }]}>
                  {cat.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text style={styles.sectionLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={`e.g. ${selectedCat?.label}...`}
            placeholderTextColor={COLORS.textMuted}
            maxLength={100}
          />

          {/* Preview */}
          {amount ? (
            <View style={styles.preview}>
              <Text style={styles.previewIcon}>{selectedCat?.icon}</Text>
              <View>
                <Text style={styles.previewAmount}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                <Text style={styles.previewCat}>{selectedCat?.label}</Text>
              </View>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleAdd}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Adding...' : '✓ Add Expense'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, padding: SPACING.lg },
  amountSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  amountLabel: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.md },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  rupeeSign: { color: COLORS.accent, fontSize: 36, fontWeight: '700', marginRight: 6 },
  amountInput: { color: COLORS.text, fontSize: 52, fontWeight: '800', minWidth: 100 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catIcon: { fontSize: 14 },
  catLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  noteInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, color: COLORS.text, fontSize: 15,
    marginBottom: SPACING.lg,
  },
  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.accentSoft,
  },
  previewIcon: { fontSize: 30 },
  previewAmount: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  previewCat: { color: COLORS.textSecondary, fontSize: 13 },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.full,
    padding: 16, alignItems: 'center', marginBottom: 40,
  },
  submitText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
