'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { Language } from '@/types';

export function Header() {
  const { language, messages, setLanguage } = useLanguage();

  if (!messages) return null;

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="bg-parchment-50 shadow-sacred border-b-2 border-golden-200 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-dharma-wheel"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-serif font-bold text-monastic-600 hover:text-monastic-700 transition-colors">
              {messages.app.title}
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.navigation.submit}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/report" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.navigation.report}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/admin" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.navigation.admin}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="language-toggle"
            >
              {language === 'vi' ? 'EN' : 'VN'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
