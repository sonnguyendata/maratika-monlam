'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { ReportSummary } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReportPage() {
  const { messages, loading } = useLanguage();
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchReportData = async (forceRefresh = false) => {
    try {
      // Add cache-busting timestamp and random parameter
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const url = `/api/report/summary?_t=${timestamp}&_r=${random}`;
      
      console.log('Fetching report data:', { timestamp, forceRefresh });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        // Force no caching
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Report data received:', { 
          totalRecords: data.totals?.all_time || 0,
          todayRecords: data.totals?.today || 0,
          timestamp: new Date().toISOString()
        });
        setReportData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch report data - Response not OK:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    
    // Auto-refresh every 30 seconds (increased from 15 to reduce server load)
    const interval = setInterval(() => fetchReportData(), 30000);
    
    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing data...');
        fetchReportData(true);
      }
    };
    
    // Refresh when user focuses on the window
    const handleFocus = () => {
      console.log('Window focused, refreshing data...');
      fetchReportData(true);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
      
      <main className="w-full px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="hero-title">
            {messages.report.title}
          </h1>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <p className="text-sm text-earthy-500">
              Cập nhật lần cuối: {lastUpdated.toLocaleString()}
            </p>
            <button
              onClick={() => {
                setLoadingReport(true);
                fetchReportData(true);
              }}
              disabled={loadingReport}
              className="btn btn-sm btn-secondary"
            >
              {loadingReport ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-earthy-600"></div>
                  <span>Đang tải...</span>
                </div>
              ) : (
                '🔄 Làm mới'
              )}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Report Data (3/4 width) */}
          <div className="lg:col-span-3 space-y-8">

            {loadingReport ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto"></div>
                <p className="mt-4 text-earthy-600">{messages.common.loading}</p>
              </div>
            ) : reportData ? (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="kpi-card">
                    <div className="kpi-value">{reportData.totals?.all_time?.toLocaleString() || '0'}</div>
                    <div className="kpi-label">{messages.report.kpi_total}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{reportData.totals?.today?.toLocaleString() || '0'}</div>
                    <div className="kpi-label">{messages.report.kpi_today}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{reportData.totals?.unique_ids?.toLocaleString() || '0'}</div>
                    <div className="kpi-label">{messages.report.kpi_unique}</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="card">
                  <h2 className="text-xl font-serif font-semibold mb-4 text-monastic-600">{messages.report.daily_chart}</h2>
                  {reportData.by_day && reportData.by_day.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.by_day}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#57534e' }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#57534e' }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                          formatter={(value: number) => [value.toLocaleString(), 'Tổng số']}
                          contentStyle={{
                            backgroundColor: '#fefdfb',
                            border: '2px solid #f59e0b',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="url(#goldenGradient)"
                          radius={[8, 8, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="goldenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-earthy-500">
                      <p>No data available yet</p>
                    </div>
                  )}
                </div>

                {/* Leaderboard */}
                <div className="card">
                  <h2 className="text-xl font-serif font-semibold mb-4 text-monastic-600">{messages.report.top10}</h2>
                  {reportData.top10 && reportData.top10.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-earthy-200">
                        <thead className="table-header">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-earthy-700 uppercase tracking-wider">
                              {messages.report.rank}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-earthy-700 uppercase tracking-wider">
                              {messages.report.name}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-earthy-700 uppercase tracking-wider">
                              {messages.report.total}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-parchment-50 divide-y divide-earthy-200">
                          {reportData.top10.map((participant, index) => (
                          <tr key={participant.id} className={`table-row ${index === 0 ? 'table-row-top' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-earthy-900">
                              <div className="flex items-center space-x-2">
                                {index === 0 && <span className="text-golden-500">👑</span>}
                                <span className={index === 0 ? 'text-golden-600 font-bold' : 'text-earthy-700'}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-earthy-900">
                              {participant.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-earthy-900 font-semibold">
                              <span className={index === 0 ? 'text-golden-600' : 'text-monastic-600'}>
                                {participant.total.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-earthy-500">
                      <p>No data available yet</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-earthy-600">{messages.errors.server}</p>
              </div>
            )}
          </div>

          {/* Right Side - QR Code (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card bg-gradient-to-b from-lotus-50 to-sky-50 border-lotus-200">
                <h3 className="text-lg font-serif font-semibold text-monastic-700 mb-4 text-center">
                  Quét mã QR
                </h3>
                <p className="text-sm text-earthy-600 mb-4 text-center">
                  Scan QR code to submit
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <img 
                      src="/qr-code.png" 
                      alt="QR Code for mantra submission" 
                      className="w-32 h-32 mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-xs border-2 border-dashed border-gray-300" style={{display: 'none'}}>
                      QR Code
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-earthy-500 mb-2">
                    📱 Mở camera điện thoại
                  </p>
                  <p className="text-xs text-earthy-500">
                    📱 Open phone camera
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
