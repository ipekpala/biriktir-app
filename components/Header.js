import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function Header({ user, streak, isDarkMode, setIsDarkMode, currentBalance, savingsRate, treeColor }) {
  return (
    <View style={styles.mainHeader}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerLarge}>{user.name} ✨</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{user.job}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity style={styles.themeToggle} onPress={() => setIsDarkMode(!isDarkMode)}>
            <Text style={{ fontSize: 18 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <View style={styles.streakPill}><Text style={styles.streakPillText}>🔥 {streak} Gün</Text></View>
        </View>
      </View>
      <Text style={styles.balanceLabel}>GÜNCEL VARLIK</Text>
      <Text style={styles.balanceValue}>{currentBalance.toLocaleString()} TL</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(savingsRate, 100)}%`, backgroundColor: treeColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainHeader: { backgroundColor: '#0f172a', padding: 25, borderRadius: 35, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerLarge: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  themeToggle: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 15 },
  streakPill: { backgroundColor: '#ff4500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakPillText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  balanceLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  balanceValue: { color: '#fff', fontSize: 34, fontWeight: '900', marginVertical: 4 },
  progressContainer: { height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 10 },
  progressBar: { height: '100%', borderRadius: 10 },
});