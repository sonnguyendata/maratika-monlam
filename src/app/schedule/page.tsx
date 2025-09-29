'use client';

import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';

export default function SchedulePage() {
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

  const scheduleData = [
    {
      day: "29/10",
      title: "Khai mạc",
      titleEn: "Opening",
      ceremonies: [
        "Lễ khai mạc Pháp hội",
        "Opening Ceremony"
      ],
      highlight: true
    },
    {
      day: "30/10", 
      title: "Cộng tu",
      titleEn: "Practice",
      ceremonies: [
        "Trì tụng thần chú Ba Thân",
        "Three Kāyas Mantra Recitation"
      ],
      highlight: false
    },
    {
      day: "31/10",
      title: "Cộng tu", 
      titleEn: "Practice",
      ceremonies: [
        "Trì tụng thần chú Ba Thân",
        "Three Kāyas Mantra Recitation"
      ],
      highlight: false
    },
    {
      day: "01/11",
      title: "Cộng tu",
      titleEn: "Practice", 
      ceremonies: [
        "Trì tụng thần chú Ba Thân",
        "Three Kāyas Mantra Recitation"
      ],
      highlight: false
    },
    {
      day: "02/11",
      title: "Bế mạc",
      titleEn: "Closing",
      ceremonies: [
        "Lễ bế mạc và hồi hướng",
        "Closing Ceremony & Dedication"
      ],
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-parchment-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="hero-title">
            {messages.schedule.title}
          </h1>
          <p className="hero-subtitle">
            Pháp Hội Monlam 2025 · Monlam Dharma Festival 2025
          </p>
          <p className="hero-dates">
            {messages.app.event_dates}
          </p>
        </div>

        <div className="space-y-6">
          {scheduleData.map((day, index) => (
            <div 
              key={day.day}
              className={`card ${day.highlight ? 'ring-2 ring-golden-300 bg-gradient-to-r from-golden-50 to-lotus-50' : ''}`}
            >
              <div className="flex items-start space-x-6">
                <div className={`flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center ${
                  day.highlight 
                    ? 'bg-golden-500 text-white' 
                    : 'bg-monastic-100 text-monastic-700'
                }`}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{day.day}</div>
                    <div className="text-xs">2025</div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className={`text-xl font-serif font-semibold ${
                      day.highlight ? 'text-golden-700' : 'text-monastic-700'
                    }`}>
                      {day.title}
                    </h3>
                    <span className="text-earthy-500">·</span>
                    <h3 className={`text-xl font-serif font-semibold ${
                      day.highlight ? 'text-golden-700' : 'text-monastic-700'
                    }`}>
                      {day.titleEn}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {day.ceremonies.map((ceremony, ceremonyIndex) => (
                      <p 
                        key={ceremonyIndex}
                        className={`text-sm ${
                          day.highlight ? 'text-earthy-700' : 'text-earthy-600'
                        }`}
                      >
                        {ceremony}
                      </p>
                    ))}
                  </div>
                  
                  {day.highlight && (
                    <div className="mt-4 p-3 bg-golden-100 rounded-lg border border-golden-200">
                      <p className="text-sm text-golden-800 font-medium">
                        🌸 Ceremony highlights · Điểm nhấn nghi lễ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="card bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200">
            <h3 className="text-lg font-serif font-semibold text-monastic-700 mb-3">
              Thời gian ghi nhận túc số
            </h3>
            <p className="text-earthy-600 mb-2">
              Recording time: 6:00 AM - 10:00 PM daily
            </p>
            <p className="text-sm text-earthy-500">
              Ghi nhận túc số: 6:00 - 22:00 hàng ngày
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
