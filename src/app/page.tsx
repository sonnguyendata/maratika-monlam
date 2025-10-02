'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { SubmissionData, InputMode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const { messages, loading } = useLanguage();
  const [formData, setFormData] = useState<SubmissionData>({
    attendee_id: '',
    attendee_name: '',
    quantity: 0,
    note: '',
    idempotency_key: uuidv4(),
    input_mode: 'direct',
    mala_count: 0,
    mala_type: 108
  });
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [malaType, setMalaType] = useState<number>(108);
  const [malaCount, setMalaCount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; dailyTotal?: number; totalCount?: number } | null>(null);

  useEffect(() => {
    // Load saved data from localStorage
    const savedId = localStorage.getItem('attendee_id');
    const savedName = localStorage.getItem('attendee_name');
    
    if (savedId) setFormData(prev => ({ ...prev, attendee_id: savedId }));
    if (savedName) setFormData(prev => ({ ...prev, attendee_name: savedName }));
  }, []);

  // Function to normalize phone number
  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle Vietnamese phone numbers
    if (digits.startsWith('84')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return '84' + digits.substring(1);
    } else if (digits.length >= 9) {
      return '84' + digits;
    }
    
    return digits;
  };

  // Function to load name by phone number
  const loadNameByPhone = async (phone: string) => {
    if (!phone || phone.length < 9) return;
    
    const normalizedPhone = normalizePhoneNumber(phone);
    
    try {
      // Check localStorage first
      const savedName = localStorage.getItem(`name_${normalizedPhone}`);
      if (savedName) {
        setFormData(prev => ({ ...prev, attendee_name: savedName }));
        return;
      }

      // TODO: Add API call to fetch name by phone number
      // For now, we'll just use localStorage
    } catch (error) {
      console.error('Error loading name:', error);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, attendee_id: phone }));
    loadNameByPhone(phone);
  };

  // Handle input mode change
  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setFormData(prev => ({ ...prev, input_mode: mode }));
    
    if (mode === 'mala') {
      const totalQuantity = malaCount * malaType;
      setFormData(prev => ({ 
        ...prev, 
        quantity: totalQuantity,
        mala_count: malaCount,
        mala_type: malaType
      }));
    }
  };

  // Handle mala type change
  const handleMalaTypeChange = (type: number) => {
    setMalaType(type);
    setFormData(prev => ({ ...prev, mala_type: type }));
    
    if (inputMode === 'mala') {
      const totalQuantity = malaCount * type;
      setFormData(prev => ({ ...prev, quantity: totalQuantity }));
    }
  };

  // Handle mala count change
  const handleMalaCountChange = (count: number) => {
    const validCount = Math.max(0, count); // Allow 0 as minimum
    setMalaCount(validCount);
    setFormData(prev => ({ ...prev, mala_count: validCount }));
    
    if (inputMode === 'mala') {
      const totalQuantity = validCount * malaType;
      setFormData(prev => ({ ...prev, quantity: totalQuantity }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          idempotency_key: uuidv4() // Generate new key for each submission
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Save to localStorage
        localStorage.setItem('attendee_id', formData.attendee_id);
        localStorage.setItem('attendee_name', formData.attendee_name);
        
        // Save phone number and name mapping
        const normalizedPhone = normalizePhoneNumber(formData.attendee_id);
        if (normalizedPhone && formData.attendee_name) {
          localStorage.setItem(`name_${normalizedPhone}`, formData.attendee_name);
        }
        
        setSubmitResult({
          success: true,
          message: messages?.record.success || 'Success!',
          dailyTotal: result.daily_total,
          totalCount: result.total_count
        });
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          quantity: inputMode === 'mala' ? malaCount * malaType : 0,
          note: '',
          idempotency_key: uuidv4()
        }));
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Error occurred'
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: messages?.errors.network || 'Network error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !messages) {
    return (
      <div className="min-h-screen bg-parchment-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto"></div>
          <p className="mt-4 text-earthy-600">{messages?.common.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="hero-title">
            {messages.record.title}
          </h1>
          <p className="hero-subtitle">
            {messages.app.subtitle}
          </p>
          <p className="hero-dates">
            {messages.app.event_dates}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="attendee_id" className="block text-sm font-medium text-earthy-700 mb-3">
                {messages.record.phone} — {messages.record.phone_placeholder}
              </label>
              <input
                type="tel"
                id="attendee_id"
                value={formData.attendee_id}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={messages.record.phone_placeholder}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="attendee_name" className="block text-sm font-medium text-earthy-700 mb-3">
                {messages.record.name}
              </label>
              <input
                type="text"
                id="attendee_name"
                value={formData.attendee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, attendee_name: e.target.value }))}
                placeholder={messages.record.name_placeholder}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earthy-700 mb-3">
                {messages.record.input_mode}
              </label>
              
              {/* Input Mode Selection */}
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleInputModeChange('direct')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                    inputMode === 'direct'
                      ? 'border-golden-500 bg-golden-50 text-golden-700'
                      : 'border-earthy-200 bg-parchment-50 text-earthy-600 hover:border-golden-300'
                  }`}
                >
                  {messages.record.direct_input}
                </button>
                <button
                  type="button"
                  onClick={() => handleInputModeChange('mala')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                    inputMode === 'mala'
                      ? 'border-golden-500 bg-golden-50 text-golden-700'
                      : 'border-earthy-200 bg-parchment-50 text-earthy-600 hover:border-golden-300'
                  }`}
                >
                  {messages.record.mala_input}
                </button>
              </div>

              {inputMode === 'direct' ? (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-earthy-700 mb-3">
                    {messages.record.quantity}
                  </label>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                      className="quantity-stepper-btn"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 }))}
                      placeholder={messages.record.quantity_placeholder}
                      className="input text-center w-72"
                      min="0"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity + 1) }))}
                      className="quantity-stepper-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mala Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-earthy-700 mb-3">
                      {messages.record.select_mala_type}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleMalaTypeChange(21)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          malaType === 21
                            ? 'border-golden-500 bg-golden-50 text-golden-700'
                            : 'border-earthy-200 bg-parchment-50 text-earthy-600 hover:border-golden-300'
                        }`}
                      >
                        21
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMalaTypeChange(54)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          malaType === 54
                            ? 'border-golden-500 bg-golden-50 text-golden-700'
                            : 'border-earthy-200 bg-parchment-50 text-earthy-600 hover:border-golden-300'
                        }`}
                      >
                        54
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMalaTypeChange(108)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          malaType === 108
                            ? 'border-golden-500 bg-golden-50 text-golden-700'
                            : 'border-earthy-200 bg-parchment-50 text-earthy-600 hover:border-golden-300'
                        }`}
                      >
                        108
                      </button>
                    </div>
                  </div>

                  {/* Mala Count Input */}
                  <div>
                    <label htmlFor="mala_count" className="block text-sm font-medium text-earthy-700 mb-3">
                      {messages.record.mala_count_placeholder}
                    </label>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleMalaCountChange(Math.max(0, malaCount - 1))}
                        className="quantity-stepper-btn"
                        aria-label="Decrease mala count"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        id="mala_count"
                        value={malaCount || ''}
                        onChange={(e) => handleMalaCountChange(parseInt(e.target.value) || 0)}
                        className="input text-center w-48"
                        min="0"
                        placeholder="0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleMalaCountChange(malaCount + 1)}
                        className="quantity-stepper-btn"
                        aria-label="Increase mala count"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Quantity Display */}
                  <div className="p-4 bg-golden-50 rounded-lg border border-golden-200">
                    <p className="text-sm text-earthy-600 mb-1">
                      {messages.record.quantity}:
                    </p>
                    <p className="text-2xl font-bold text-golden-700">
                      {formData.quantity} = {malaCount} × {malaType}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-earthy-700 mb-3">
                {messages.record.note}
              </label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder={messages.record.note_placeholder}
                className="input"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary py-4 text-lg font-semibold"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{messages.common.loading}</span>
                </div>
              ) : (
                messages.record.submit
              )}
            </button>
          </form>

          {submitResult && (
            <div className={`mt-8 p-6 rounded-2xl border-2 ${
              submitResult.success 
                ? 'bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200 text-lotus-800' 
                : 'bg-gradient-to-r from-monastic-50 to-red-50 border-monastic-200 text-monastic-800'
            }`}>
              {submitResult.success && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="lotus-icon success-animation">🌸</div>
                  <p className="font-semibold text-lg">{submitResult.message}</p>
                </div>
              )}
              {!submitResult.success && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 text-monastic-500">⚠️</div>
                  <p className="font-semibold text-lg">{submitResult.message}</p>
                </div>
              )}
              {submitResult.success && (submitResult.dailyTotal !== undefined || submitResult.totalCount !== undefined) && (
                <div className="mt-4 space-y-2">
                  {submitResult.dailyTotal !== undefined && (
                    <div className="p-3 bg-golden-50 rounded-lg border border-golden-200">
                      <p className="text-sm text-earthy-600">
                        {messages.record.todayTotal.replace('{{n}}', submitResult.dailyTotal.toString())}
                      </p>
                    </div>
                  )}
                  {submitResult.totalCount !== undefined && (
                    <div className="p-3 bg-lotus-50 rounded-lg border border-lotus-200">
                      <p className="text-sm text-earthy-600">
                        {messages.record.totalCount.replace('{{n}}', submitResult.totalCount.toString())}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
