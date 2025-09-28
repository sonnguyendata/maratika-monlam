'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, I18nMessages } from '@/types';
import { loadMessages, getLanguageFromStorage, saveLanguageToStorage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  messages: I18nMessages | null;
  setLanguage: (lang: Language) => void;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [messages, setMessages] = useState<I18nMessages | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedLanguage = getLanguageFromStorage();
    setLanguageState(storedLanguage);
    
    loadMessages(storedLanguage).then((loadedMessages) => {
      setMessages(loadedMessages);
      setLoading(false);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguageToStorage(lang);
    loadMessages(lang).then((loadedMessages) => {
      setMessages(loadedMessages);
    });
  };

  return (
    <LanguageContext.Provider value={{ language, messages, setLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}
