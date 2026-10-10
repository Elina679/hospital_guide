import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh-CN' | 'zh-MO' | 'zh-TW' | 'en' | 'mn' | 'ug' | 'bo';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 从localStorage获取语言设置，如果没有则使用系统语言
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // 检测系统语言
    const systemLanguage = navigator.language;
    const languageMap: Record<string, Language> = {
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'zh-MO': 'zh-MO',
      'en': 'en',
      'mn': 'mn',
      'ug': 'ug',
      'bo': 'bo'
    };
    
    return languageMap[systemLanguage] || 'zh-CN';
  });

  // 当语言改变时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
