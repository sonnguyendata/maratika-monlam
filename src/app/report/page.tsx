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
            {messages.report.kpis.last_updated}: {lastUpdated.toLocaleString()}
          </p>
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
                <div className="kpi-label">{messages.report.kpis.total_all_time}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-value">{reportData.totals.today.toLocaleString()}</div>
                <div className="kpi-label">{messages.report.kpis.total_today}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-value">{reportData.totals.unique_ids.toLocaleString()}</div>
                <div className="kpi-label">{messages.report.kpis.unique_participants}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="card mb-12">
              <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">{messages.report.chart.title}</h2>
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
                      formatter={(value: number) => [value.toLocaleString(), messages.report.chart.y_axis]}
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
              <h2 className="text-2xl font-serif font-semibold mb-6 text-monastic-600">{messages.report.leaderboard.title}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-earthy-200">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.leaderboard.rank}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.leaderboard.name}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.leaderboard.total}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-earthy-700 uppercase tracking-wider">
                        {messages.report.leaderboard.submissions}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-earthy-500">
                          {participant.submission_count}
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
