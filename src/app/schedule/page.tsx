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

  // Schedule data based on the image
  const scheduleDays = [
    {
      date: "29/10/2025",
      title: "NGÀY 1",
      time: "8:00 - 18:00",
      activities: [
        { time: "8:00 - 10:00", activity: "Chuẩn bị quán đảnh", highlight: false },
        { time: "10:30 - 12:00", activity: "Quán đảnh Liên Hoa Sinh Tam Thân", highlight: true },
        { time: "14:00 - 15:30", activity: "Giảng về Đức Liên Hoa Sanh Tam Thân\nThực hành Nghi quỹ ngẫm và Tĩnh tục số", highlight: false },
        { time: "16:00 - 18:00", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false }
      ]
    },
    {
      date: "30/10/2025", 
      title: "NGÀY 2",
      time: "8:00 - 18:00",
      activities: [
        { time: "8:00 - 9:30", activity: "Hướng dẫn thực hành Đức Liên Hoa sanh Tam Thân", highlight: false },
        { time: "10:00 - 12:00", activity: "Thực hành Nghi quỹ ngẫm và Tĩnh tục số", highlight: false },
        { time: "14:00 - 15:30", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false },
        { time: "16:00 - 18:00", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false }
      ]
    },
    {
      date: "31/10/2025",
      title: "NGÀY 3", 
      time: "8:00 - 18:00",
      activities: [
        { time: "8:00 - 9:30", activity: "Truyền Lung và giới thiệu về Ngondro Liên Hoa Sanh Tam Thân", highlight: false },
        { time: "10:00 - 12:00", activity: "Thực hành Nghi quỹ ngẫm và Tĩnh tục số", highlight: false },
        { time: "14:00 - 15:30", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false },
        { time: "16:00 - 18:00", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false }
      ]
    },
    {
      date: "1/11/2025",
      title: "NGÀY 4",
      time: "8:00 - 19:00", 
      activities: [
        { time: "8:00 - 9:30", activity: "Trao truyền Tái bảo Ratna Thotrengsal", highlight: true },
        { time: "10:00 - 12:00", activity: "Thực hành Nghi quỹ ngẫm và Tĩnh tục số", highlight: false },
        { time: "14:00 - 16:00", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false },
        { time: "16:30 - 18:00", activity: "Tĩnh tục số Cầu nguyện Hòa Bình Thế Giới", highlight: false },
        { time: "18:00 - 19:00", activity: "Quy y cho các Phật tử đăng ký", highlight: false }
      ]
    },
    {
      date: "2/11/2025",
      title: "NGÀY 5",
      time: "8:00 - 20:00",
      activities: [
        { time: "8:00 - 10:00", activity: "Thực hành Nghi quỹ ngẫm và Tĩnh tục số", highlight: false },
        { time: "10:30 - 12:00", activity: "Ban phước thành tựu", highlight: true },
        { time: "14:00 - 16:00", activity: "Cúng Lửa", highlight: false },
        { time: "16:30 - 17:30", activity: "Cúng đèn cầu nguyện Hòa Bình Thế Giới", highlight: false },
        { time: "18:00 - 19:00", activity: "Ban phước cộng đồng", highlight: false },
        { time: "19:00 - 20:00", activity: "Lời cảm tạ, cúng dường Chủ tăng và Ban Pháp Hoa", highlight: false }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-parchment-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-monastic-600 mb-2">
            LỊCH TRÌNH PHÁP HỘI
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-monastic-700 mb-4">
            MARATIKA WORLD PEACE MONLAM
          </h2>
          <p className="text-lg md:text-xl text-earthy-600 mb-2">
            PHÁP HỘI MONLAM CẦU NGUYỆN HÒA BÌNH THẾ GIỚI
          </p>
          <p className="text-base text-earthy-600 mb-6">
            Trì tụng 100 triệu biến chân ngôn Liên Hoa Sinh Tam Thân
          </p>
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-monastic-500 to-golden-500 text-white rounded-lg font-semibold shadow-sacred text-lg">
            CHÙA PHÁP VÂN, HÀ NỘI, VIỆT NAM
          </div>
        </div>

        {/* Schedule Days */}
        <div className="space-y-8">
          {scheduleDays.map((day, index) => (
            <div 
              key={index}
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
                            {activity.activity.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
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

        {/* Contact Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-r from-golden-50 to-amber-50 border-golden-200">
            <h4 className="font-semibold text-golden-800 mb-3 text-center">
              QR đăng ký tham gia
            </h4>
            <div className="text-center space-y-2 text-sm">
              <p className="text-earthy-700">0933.911.359 (Anh Diện)</p>
              <p className="text-earthy-700">0972.831.882 (Bích Ngân)</p>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-monastic-50 to-red-50 border-monastic-200">
            <h4 className="font-semibold text-monastic-800 mb-3 text-center">
              Tổ chức bởi: Maratika Vietnam
            </h4>
            <p className="text-sm text-earthy-700 text-center">
              Chùa Pháp Vân, 1299 Giải Phóng, Hà Nội
            </p>
          </div>

          <div className="card bg-gradient-to-r from-lotus-50 to-sky-50 border-lotus-200">
            <h4 className="font-semibold text-lotus-800 mb-3 text-center">
              QR fanpage theo dõi thông tin
            </h4>
            <p className="text-sm text-earthy-700 text-center">
              Email liên hệ<br/>
              Maratika.hn@gmail.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
