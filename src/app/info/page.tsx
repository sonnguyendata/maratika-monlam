'use client';

import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';

export default function InfoPage() {
  const { messages, loading } = useLanguage();

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
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="hero-title">
            {messages.info.title}
          </h1>
          <p className="hero-subtitle">
            World Peace Monlam · 100 million mantras for world peace
          </p>
        </div>

        <div className="space-y-8">
          {/* Purpose */}
          <div className="card">
            <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">
              Mục đích · Purpose
            </h2>
            <div className="prose prose-earthy max-w-none">
              <p className="text-lg leading-relaxed text-earthy-700 mb-4">
                {messages.info.purpose}
              </p>
              <p className="text-lg leading-relaxed text-earthy-700">
                {messages.info.purpose}
              </p>
            </div>
          </div>

          {/* Location & Dates */}
          <div className="card">
            <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">
              Địa điểm & Thời gian · Location & Dates
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-golden-100 rounded-full flex items-center justify-center">
                  <span className="text-golden-600">📅</span>
                </div>
                <div>
                  <p className="text-earthy-700 font-medium">29/10 – 02/11/2025</p>
                  <p className="text-earthy-600 text-sm">October 29 – November 2, 2025</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-golden-100 rounded-full flex items-center justify-center">
                  <span className="text-golden-600">📍</span>
                </div>
                <div>
                  <p className="text-earthy-700 font-medium">Chùa Pháp Vân, 1299 Giải Phóng, Hà Nội</p>
                  <p className="text-earthy-600 text-sm">Phap Van Pagoda, 1299 Giai Phong, Hanoi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Registration */}
          <div className="card">
            <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">
              Liên hệ & Đăng ký · Contact & Registration
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-lotus-100 rounded-full flex items-center justify-center">
                  <span className="text-lotus-600">📞</span>
                </div>
                <div>
                  <p className="text-earthy-700 font-medium">{messages.info.contact}</p>
                  <p className="text-earthy-600 text-sm">Contact information will be provided</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-lotus-100 rounded-full flex items-center justify-center">
                  <span className="text-lotus-600">📝</span>
                </div>
                <div>
                  <p className="text-earthy-700 font-medium">{messages.info.register}</p>
                  <p className="text-earthy-600 text-sm">Registration link will be provided</p>
                </div>
              </div>
            </div>
          </div>

          {/* Merit Offering (Optional) */}
          <div className="card bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200">
            <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">
              Cúng dường công đức · Merit Offering
            </h2>
            <div className="space-y-4">
              <p className="text-earthy-700">
                Để hỗ trợ Pháp hội và hồi hướng công đức, quý vị có thể cúng dường qua:
              </p>
              <p className="text-earthy-700">
                To support the festival and dedicate merit, you may offer through:
              </p>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-lotus-200">
                <p className="text-sm text-earthy-600 mb-2">Bank transfer information:</p>
                <p className="text-sm text-earthy-600 mb-2">Thông tin chuyển khoản:</p>
                <div className="font-mono text-sm bg-earthy-50 p-3 rounded border">
                  <p>Bank details will be provided</p>
                  <p>Thông tin ngân hàng sẽ được cung cấp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="card">
            <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">
              Thông tin bổ sung · Additional Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-earthy-700 mb-2">Thời gian ghi nhận</h3>
                  <p className="text-sm text-earthy-600">6:00 - 22:00 hàng ngày</p>
                </div>
                <div>
                  <h3 className="font-semibold text-earthy-700 mb-2">Recording time</h3>
                  <p className="text-sm text-earthy-600">6:00 AM - 10:00 PM daily</p>
                </div>
                <div>
                  <h3 className="font-semibold text-earthy-700 mb-2">Mục tiêu</h3>
                  <p className="text-sm text-earthy-600">100 triệu túc số cho hòa bình thế giới</p>
                </div>
                <div>
                  <h3 className="font-semibold text-earthy-700 mb-2">Goal</h3>
                  <p className="text-sm text-earthy-600">100 million mantras for world peace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
