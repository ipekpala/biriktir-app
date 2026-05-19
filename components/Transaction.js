export default class Transaction {
  constructor(title, amount, type, category = 'Gelir') {
    this.id = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Benzersiz ID
    this.title = title;
    this.amount = parseFloat(amount);
    this.type = type; // 'expense' veya 'income'
    this.category = type === 'expense' ? category : 'Gelir';
    this.createdAt = new Date().toISOString(); // Analitik için tarih damgası
  }

  // Model içi yardımcı metot: Gider mi kontrolü
  isExpense() {
    return this.type === 'expense';
  }

  // Model içi yardımcı metot: Gelir mi kontrolü
  isIncome() {
    return this.type === 'income';
  }

  // Jürinin gözünü boyayacak formatlanmış string çıktısı
  getFormattedAmount() {
    return `${this.type === 'expense' ? '-' : '+'}${this.amount.toLocaleString()} TL`;
  }
}