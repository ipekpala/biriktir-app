export const getTheme = (isDarkMode) => ({
  bg: isDarkMode ? '#0f172a' : '#f8fafc',
  cardBg: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
  textMain: isDarkMode ? '#f8fafc' : '#0f172a',
  textSub: isDarkMode ? '#94a3b8' : '#64748b',
  borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  inputBg: isDarkMode ? '#1e293b' : '#fff',
  tabBarBg: isDarkMode ? '#1e293b' : '#fff'
});