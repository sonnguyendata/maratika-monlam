import { Language, I18nMessages } from '@/types';

let messages: Record<Language, I18nMessages> | null = null;

export async function loadMessages(language: Language): Promise<I18nMessages> {
  if (!messages) {
    const [viMessages, enMessages, zhMessages] = await Promise.all([
      import('../../i18n/vi.json'),
      import('../../i18n/en.json'),
      import('../../i18n/zh.json')
    ]);
    
    messages = {
      vi: viMessages.default,
      en: enMessages.default,
      zh: zhMessages.default
    };
  }
  
  return messages[language];
}

export function getLanguageFromStorage(): Language {
  if (typeof window === 'undefined') return 'vi';
  
  const stored = localStorage.getItem('language');
  return (stored === 'en' || stored === 'vi' || stored === 'zh') ? stored : 'vi';
}

export function saveLanguageToStorage(language: Language): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('language', language);
}

export function getLanguageFromHeader(acceptLanguage?: string): Language {
  if (!acceptLanguage) return 'vi';
  
  // Simple language detection - prioritize Vietnamese
  if (acceptLanguage.includes('vi') || acceptLanguage.includes('vn')) {
    return 'vi';
  }
  
  if (acceptLanguage.includes('zh') || acceptLanguage.includes('cn')) {
    return 'zh';
  }
  
  return 'en';
}
