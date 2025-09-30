'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Language } from '@/types';

export function Header() {
  const { language, messages, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!messages) return null;

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                {messages.nav.record}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/report" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.nav.report}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/schedule" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.nav.schedule}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/info" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                {messages.nav.info}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/admin" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium relative group"
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-golden-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-earthy-600 hover:text-monastic-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <button
              onClick={toggleLanguage}
              className="language-toggle"
            >
              {language === 'vi' ? 'EN' : 'VN'}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="px-4 py-4 bg-parchment-50 border-t border-golden-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium py-2 border-b border-golden-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {messages.nav.record}
              </Link>
              <Link 
                href="/report" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium py-2 border-b border-golden-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {messages.nav.report}
              </Link>
              <Link 
                href="/schedule" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium py-2 border-b border-golden-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {messages.nav.schedule}
              </Link>
              <Link 
                href="/info" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium py-2 border-b border-golden-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {messages.nav.info}
              </Link>
              <Link 
                href="/admin" 
                className="text-earthy-600 hover:text-monastic-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
