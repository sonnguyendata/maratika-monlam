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

  const scheduleDays = [
    messages.schedule.days.day1,
    messages.schedule.days.day2,
    messages.schedule.days.day3,
    messages.schedule.days.day4,
    messages.schedule.days.day5
  ];

  const dayLabels = ['day1', 'day2', 'day3', 'day4', 'day5'];

  return (
    <div className="min-h-screen bg-parchment-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="hero-title">
            {messages.schedule.title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-monastic-600 mb-4">
            {messages.schedule.subtitle}
          </h2>
          <p className="hero-subtitle mb-4">
            {messages.schedule.description}
          </p>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-monastic-500 to-golden-500 text-white rounded-full font-semibold shadow-sacred">
            {messages.schedule.location}
          </div>
        </div>

        {/* Schedule Days */}
        <div className="space-y-8">
          {scheduleDays.map((day, index) => (
            <div 
              key={dayLabels[index]}
              className={`card ${
                day.activities.some(activity => activity.highlight) 
                  ? 'ring-2 ring-golden-300 bg-gradient-to-r from-golden-50 to-lotus-50' 
                  : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Day Header */}
                <div className="flex-shrink-0 lg:w-48">
                  <div className={`p-6 rounded-2xl text-center ${
                    day.activities.some(activity => activity.highlight)
                      ? 'bg-golden-500 text-white' 
                      : 'bg-monastic-100 text-monastic-700'
                  }`}>
                    <div className="text-2xl font-bold mb-2">{day.date}</div>
                    <div className="text-lg font-semibold mb-1">{day.title}</div>
                    <div className="text-sm opacity-90">{day.time}</div>
                  </div>
                </div>
                
                {/* Activities */}
                <div className="flex-1">
                  <div className="space-y-4">
                    {day.activities.map((activity, activityIndex) => (
                      <div 
                        key={activityIndex}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          activity.highlight
                            ? 'bg-gradient-to-r from-golden-100 to-amber-100 border-golden-300 shadow-sacred'
                            : 'bg-parchment-50 border-earthy-200 hover:border-golden-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className={`font-semibold ${
                            activity.highlight ? 'text-golden-800' : 'text-earthy-700'
                          }`}>
                            {activity.time}
                          </div>
                          <div className={`text-right ${
                            activity.highlight ? 'text-golden-700 font-medium' : 'text-earthy-600'
                          }`}>
                            {activity.activity}
                          </div>
                        </div>
                        {activity.highlight && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-golden-600">🌸</span>
                            <span className="text-sm text-golden-700 font-medium">
                              Special Ceremony · Nghi lễ đặc biệt
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recording Information */}
        <div className="mt-12">
          <div className="card bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200">
            <div className="text-center">
              <h3 className="text-xl font-serif font-semibold text-monastic-700 mb-4">
                {messages.schedule.recording_info.title}
              </h3>
              <p className="text-lg text-earthy-600 mb-2">
                {messages.schedule.recording_info.time}
              </p>
              <p className="text-sm text-earthy-500">
                {messages.schedule.recording_info.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-r from-golden-50 to-amber-50 border-golden-200">
            <h4 className="font-semibold text-golden-800 mb-3">
              {messages.schedule.contact.registration}
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-earthy-700">{messages.schedule.contact.phone1}</p>
              <p className="text-earthy-700">{messages.schedule.contact.phone2}</p>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-monastic-50 to-red-50 border-monastic-200">
            <h4 className="font-semibold text-monastic-800 mb-3">
              {messages.schedule.contact.organizer}
            </h4>
            <p className="text-sm text-earthy-700">
              {messages.schedule.contact.address}
            </p>
          </div>

          <div className="card bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200">
            <h4 className="font-semibold text-lotus-800 mb-3">
              {messages.schedule.contact.fanpage}
            </h4>
            <p className="text-sm text-earthy-700">
              {messages.schedule.contact.email}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
