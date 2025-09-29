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

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/report/summary');
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchReportData, 15000);
    return () => clearInterval(interval);
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
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="hero-title">
            {messages.report.title}
          </h1>
          <p className="text-sm text-earthy-500">
            Cập nhật lần cuối: {lastUpdated.toLocaleString()}
          </p>
          
          {/* QR Code Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-lotus-50 to-sky-50 rounded-2xl border-2 border-lotus-200">
            <h3 className="text-lg font-serif font-semibold text-monastic-700 mb-4">
              Quét mã QR để ghi nhận túc số
            </h3>
            <p className="text-sm text-earthy-600 mb-4">
              Scan QR code to submit your mantra count
            </p>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="text-xs">QR Code Placeholder</div>
                    <div className="text-xs mt-1">Add qr-code.png to public folder</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-earthy-500 mt-3">
              Hướng dẫn: Mở camera điện thoại và quét mã QR
            </p>
            <p className="text-xs text-earthy-500">
              Instructions: Open phone camera and scan QR code
            </p>
          </div>
        </div>

        {loadingReport ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto"></div>
            <p className="mt-4 text-earthy-600">{messages.common.loading}</p>
          </div>
        ) : reportData ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="kpi-card">
                <div className="kpi-value">{reportData.totals.all_time.toLocaleString()}</div>
                <div className="kpi-label">{messages.report.kpi_total}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-value">{reportData.totals.today.toLocaleString()}</div>
                <div className="kpi-label">{messages.report.kpi_today}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-value">{reportData.totals.unique_ids.toLocaleString()}</div>
                <div className="kpi-label">{messages.report.kpi_unique}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="card mb-12">
              <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">{messages.report.daily_chart}</h2>
              <div className="h-80">
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
            </div>

            {/* Leaderboard */}
            <div className="card">
              <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">{messages.report.top10}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-earthy-200">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.rank}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.name}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.total}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-parchment-50 divide-y divide-earthy-200">
                    {reportData.top10.map((participant, index) => (
                      <tr key={participant.id} className={`table-row ${index === 0 ? 'table-row-top' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-earthy-900">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <span className="text-golden-500">👑</span>}
                            <span className={index === 0 ? 'text-golden-600 font-bold' : 'text-earthy-700'}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-earthy-900">
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-earthy-900 font-semibold">
                          <span className={index === 0 ? 'text-golden-600' : 'text-monastic-600'}>
                            {participant.total.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-earthy-600">{messages.errors.server}</p>
          </div>
        )}
      </main>
    </div>
  );
}
