import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 FIREBASE IMPORTS
import { db } from './components/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';

// Modüler Bileşenlerimiz ve Model Sınıfımız
import { getTheme } from './components/Theme';
import Header from './components/Header';
import BarChart from './components/BarChart';
import Transaction from './components/Transaction';

export default function App() {
  // --- STATE YÖNETİMİ ---
  const [user, setUser] = useState({ name: '', surname: '', age: '', job: '', monthlyBudget: '' });
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [targetName, setTargetName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlySaving, setMonthlySaving] = useState('');
  const [daysNeeded, setDaysNeeded] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transTitle, setTransTitle] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transType, setTransType] = useState('expense');
  const [transCategory, setTransCategory] = useState('Gıda');
  const [streak, setStreak] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const categories = ['Gıda', 'Ulaşım', 'Eğlence', 'Fatura', 'Diğer'];

  useEffect(() => { checkUserProfile(); loadTransactions(); }, []);

  // 🔥 FIREBASE: Kullanıcı Profilini Çekme
  const checkUserProfile = async () => {
    try {
      const docRef = doc(db, "users", "global_user"); // Hackathon için tekil sabit ID
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUser(docSnap.data());
        setIsRegistered(true);
      }
    } catch (e) {
      console.log("Firebase kullanıcı çekme hatası, yerel hafıza deneniyor...", e);
      // Firebase düşerse offline fallback
      const savedUser = await AsyncStorage.getItem('@user_profile');
      if (savedUser !== null) { setUser(JSON.parse(savedUser)); setIsRegistered(true); }
    }
  };

  // 🔥 FIREBASE: İşlemleri Gerçek Zamanlı Çekme
  const loadTransactions = async () => {
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fbTrans = [];
      
      querySnapshot.forEach((doc) => {
        const t = doc.data();
        const instance = new Transaction(t.title, t.amount, t.type, t.category);
        instance.id = doc.id;
        instance.createdAt = t.createdAt;
        fbTrans.push(instance);
      });
      setTransactions(fbTrans);
    } catch (e) {
      console.log("Firebase veri çekme hatası:", e);
    }
  };

  // 🔥 FIREBASE: Profil Kaydetme
  const handleRegister = async () => {
    if (!user.name || !user.monthlyBudget) { alert("Lütfen alanları doldurun!"); return; }
    try {
      await setDoc(doc(db, "users", "global_user"), user);
      await AsyncStorage.setItem('@user_profile', JSON.stringify(user));
      setIsRegistered(true);
    } catch (e) {
      alert("Firebase'e kaydedilemedi, yerel hafıza açılıyor.");
      setIsRegistered(true);
    }
  };

  // 🔥 FIREBASE: Yeni İşlemi Buluta Gönderme
  const addTransaction = async () => {
    if (!transTitle || !transAmount) return;

    const newTrans = new Transaction(transTitle, transAmount, transType, transCategory);

    try {
      // Firebase Firestore'a döküman olarak ekliyoruz
      await addDoc(collection(db, "transactions"), {
        title: newTrans.title,
        amount: newTrans.amount,
        type: newTrans.type,
        category: newTrans.category,
        createdAt: newTrans.createdAt
      });
      
      if (newTrans.isIncome()) setStreak(s => s + 1);
      
      setTransTitle(''); 
      setTransAmount(''); 
      loadTransactions(); // Listeyi güncellemek için buluttan geri çekiyoruz
      setActiveTab('home');
    } catch (e) {
      alert("Bulut veritabanına bağlanılamadı.");
    }
  };

  // --- HESAPLAMALAR ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const initialBudget = parseFloat(user.monthlyBudget || 0);
  const currentBalance = initialBudget + totalIncome - totalExpense;
  const savingsRate = (initialBudget + totalIncome) > 0 ? (currentBalance / (initialBudget + totalIncome)) * 100 : 0;

  const getCategoryTotal = (cat) => transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);

  const getTree = () => {
    if (currentBalance <= 0) return { icon: "🥀", stage: "Solmuş Dal", color: "#f87171" };
    if (savingsRate > 75) return { icon: "🍎🌳🍏", stage: "Meyveli Altın Ağaç", color: "#fbbf24" };
    if (savingsRate > 40) return { icon: "🌳", stage: "Ulu Ağaç", color: "#34d399" };
    return { icon: "🌱", stage: "Fidan", color: "#60a5fa" };
  };
  const tree = getTree();
  const theme = getTheme(isDarkMode);

  if (!isRegistered) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.authBox}>
          <Text style={[styles.heroTitle, { color: theme.textMain }]}>BİRİKTİR</Text>
          <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Adınız" placeholderTextColor="#64748b" onChangeText={t => setUser({...user, name:t})} />
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Mesleğiniz" placeholderTextColor="#64748b" onChangeText={t => setUser({...user, job:t})} />
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Aylık Bütçe (TL)" placeholderTextColor="#64748b" keyboardType="numeric" onChangeText={t => setUser({...user, monthlyBudget:t})} />
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
              <Text style={styles.buttonText}>Başlayalım</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        
        <Header 
          user={user} streak={streak} isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} currentBalance={currentBalance} 
          savingsRate={savingsRate} treeColor={tree.color} 
        />

        {activeTab === 'home' && (
          <View>
            <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, alignItems: 'center' }]}>
              <Text style={{ fontSize: 70 }}>{tree.icon}</Text>
              <Text style={[styles.cardTitle, { color: tree.color }]}>{tree.stage}</Text>
              <Text style={[styles.cardDesc, { color: theme.textSub }]}>Bütçe koruma puanın %{savingsRate.toFixed(0)}. Harika gidiyorsun!</Text>
            </View>

            <BarChart 
              categories={categories} getCategoryTotal={getCategoryTotal} 
              totalExpense={totalExpense} theme={theme} isDarkMode={isDarkMode} 
            />

            <TouchableOpacity style={styles.resetBtn} onPress={async () => { await AsyncStorage.clear(); setIsRegistered(false); setTransactions([]); }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Sistemi Baştan Başlat</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'transactions' && (
          <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>İşlem Ekle</Text>
            <View style={styles.typeSwitcher}>
              <TouchableOpacity onPress={() => setTransType('expense')} style={[styles.typeBtn, transType === 'expense' && {backgroundColor: '#ef4444'}]}>
                <Text style={styles.buttonText}>Gider</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTransType('income')} style={[styles.typeBtn, transType === 'income' && {backgroundColor: '#10b981'}]}>
                <Text style={styles.buttonText}>Gelir</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Açıklama" placeholderTextColor="#64748b" value={transTitle} onChangeText={setTransTitle} />
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Miktar" placeholderTextColor="#64748b" keyboardType="numeric" value={transAmount} onChangeText={setTransAmount} />
            
            {transType === 'expense' && (
               <View style={styles.categoryGrid}>
                {categories.map(c => (
                  <TouchableOpacity key={c} onPress={() => setTransCategory(c)} style={[styles.catBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }, transCategory === c && { backgroundColor: '#3b82f6' }]}>
                    <Text style={{ fontSize: 12, color: transCategory === c ? '#fff' : theme.textSub }}>{c}</Text>
                  </TouchableOpacity>
                ))}
               </View>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={addTransaction}>
              <Text style={styles.buttonText}>Sisteme İşle</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'ai' && (
          <View>
            <View style={[styles.glassCard, { backgroundColor: '#1e293b', borderColor: '#3b82f6' }]}>
              <Text style={{ fontSize: 50, marginBottom: 15 }}>🤖</Text>
              <Text style={[styles.cardTitle, { color: '#60a5fa' }]}>BİRİKTİR AI Finansal Zeka</Text>
              <Text style={{ color: '#94a3b8', lineHeight: 22, fontSize: 15 }}>
                Merhaba {user.name}, mevcut harcama modellerini ve bütçe ekosistemini senin için inceledim.
              </Text>
            </View>

            <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={styles.sectionLabel}>AI ÖNGÖRÜLERİ</Text>
              <View style={[styles.aiInsightBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                <Text style={[styles.aiInsightTitle, { color: theme.textMain }]}>🎯 Tasarruf Fırsatı</Text>
                <Text style={{ fontSize: 14, color: theme.textSub, lineHeight: 20 }}>
                  {getCategoryTotal('Gıda') > currentBalance ? 'Gıda harcamaların bütçeni zorluyor. Dışarıdan yemek yerine evde hazırlayarak bu ay ağacını daha hızlı büyütebilirsin.' : 'Bütçe dengen harika! Ağacın çok sağlıklı, yatırımlarla Altın Ağaç evresini tetikleyebilirsin.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'target' && (
          <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>Hedef Takibi</Text>
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Hedef (Örn: MacBook)" placeholderTextColor="#64748b" value={targetName} onChangeText={setTargetName} />
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Tutar" placeholderTextColor="#64748b" keyboardType="numeric" value={targetAmount} onChangeText={setTargetAmount} />
            <TextInput style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.textMain }]} placeholder="Aylık Birikim" placeholderTextColor="#64748b" keyboardType="numeric" value={monthlySaving} onChangeText={setMonthlySaving} />
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#8b5cf6' }]} onPress={() => {
                const days = Math.ceil((parseFloat(targetAmount) / parseFloat(monthlySaving)) * 30);
                setDaysNeeded(days);
            }}>
              <Text style={styles.buttonText}>Yol Haritası Çıkar</Text>
            </TouchableOpacity>
            {daysNeeded && <Text style={styles.targetResult}>Hedefine ulaşmana yaklaşık <Text style={{ fontWeight: 'bold' }}>{daysNeeded} gün</Text> kaldı! 🚀</Text>}
          </View>
        )}

      </ScrollView>

      {/* FLOATING TAB BAR */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBarBg, borderColor: theme.borderColor }]}>
        {['home', 'transactions', 'ai', 'target'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={styles.tabItem}>
            <Text style={[styles.tabIcon, activeTab === t && { color: '#3b82f6', transform: [{ scale: 1.15 }] }]}>
              {t === 'home' ? '🏠' : t === 'transactions' ? '💸' : t === 'ai' ? '🤖' : '🎯'}
            </Text>
            <Text style={[styles.tabLabel, { color: activeTab === t ? '#3b82f6' : theme.textSub, fontWeight: activeTab === t ? 'bold' : 'normal' }]}>
              {t === 'home' ? 'Panel' : t === 'transactions' ? 'İşlem' : t === 'ai' ? 'AI' : 'Hedef'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollPadding: { padding: 25, paddingBottom: 120 },
  authBox: { flex: 1, justifyContent: 'center', padding: 20 },
  heroTitle: { fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  glassCard: { borderRadius: 30, padding: 25, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 5 },
  cardDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 5 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5, marginBottom: 15 },
  modernInput: { borderRadius: 20, padding: 16, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  primaryButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resetBtn: { alignItems: 'center', marginTop: 10, padding: 10 },
  typeSwitcher: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 15, alignItems: 'center' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  aiInsightBox: { padding: 15, borderRadius: 20, borderWidth: 1 },
  aiInsightTitle: { fontWeight: 'bold', marginBottom: 6, fontSize: 15 },
  targetResult: { marginTop: 15, textAlign: 'center', fontSize: 16, color: '#10b981', fontWeight: 'bold' },
  tabBar: { position: 'absolute', bottom: 25, left: 20, right: 20, height: 80, borderRadius: 30, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 15, borderWidth: 1 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 24, color: '#94a3b8' },
  tabLabel: { fontSize: 10, marginTop: 4 }
});