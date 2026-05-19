import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BarChart({ categories, getCategoryTotal, totalExpense, theme, isDarkMode }) {
  return (
    <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
      <Text style={styles.sectionLabel}>HARCAMA DAĞILIMI (ANALİZ)</Text>
      {categories.map(cat => {
        const total = getCategoryTotal(cat);
        const pct = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
        return (
          <View key={cat} style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: theme.textMain, fontWeight: '600' }}>{cat}</Text>
              <Text style={{ color: theme.textMain, fontWeight: 'bold' }}>{total} TL</Text>
            </View>
            <View style={[styles.chartTrack, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
              <View style={[styles.chartFill, { width: `${pct}%`, backgroundColor: '#3b82f6' }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: { borderRadius: 30, padding: 25, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5, marginBottom: 15 },
  chartTrack: { height: 8, borderRadius: 10 },
  chartFill: { height: '100%', borderRadius: 10 },
});