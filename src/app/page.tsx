'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { SubmissionData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const { messages, loading } = useLanguage();
  const [formData, setFormData] = useState<SubmissionData>({
    attendee_id: '',
    attendee_name: '',
    quantity: 1,
    note: '',
    idempotency_key: uuidv4()
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; dailyTotal?: number } | null>(null);

  useEffect(() => {
    // Load saved data from localStorage
    const savedId = localStorage.getItem('attendee_id');
    const savedName = localStorage.getItem('attendee_name');
    
    if (savedId) setFormData(prev => ({ ...prev, attendee_id: savedId }));
    if (savedName) setFormData(prev => ({ ...prev, attendee_name: savedName }));
  }, []);

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
        
        setSubmitResult({
          success: true,
          message: messages?.record.success || 'Success!',
          dailyTotal: result.daily_total
        });
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          quantity: 1,
          note: '',
          idempotency_key: uuidv4()
        }));
      } else {
        setSubmitResult({
          success: false,
          message: result.error || messages?.submission.error_message || 'Error occurred'
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
                {messages.record.id} — {messages.record.id_placeholder}
              </label>
              <input
                type="text"
                id="attendee_id"
                value={formData.attendee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, attendee_id: e.target.value }))}
                placeholder={messages.record.id_placeholder}
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
              <label htmlFor="quantity" className="block text-sm font-medium text-earthy-700 mb-3">
                {messages.record.quantity}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                  className="quantity-stepper-btn"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  placeholder={messages.record.quantity_placeholder}
                  className="input text-center flex-1"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + 1) }))}
                  className="quantity-stepper-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
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
              {submitResult.success && submitResult.dailyTotal && (
                <div className="mt-4 p-3 bg-golden-50 rounded-lg border border-golden-200">
                  <p className="text-sm text-earthy-600">
                    {messages.record.todayTotal.replace('{{n}}', submitResult.dailyTotal.toString())}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
