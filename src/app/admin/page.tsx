'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { AdminRecord, AdminFilters, AdminResponse } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const { messages, loading } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filters, setFilters] = useState<AdminFilters>({
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/admin/records', {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        fetchRecords();
      } else {
        setAuthError(messages?.admin.login.invalid_credentials || 'Invalid credentials');
      }
    } catch (error) {
      setAuthError(messages?.errors.network || 'Network error');
    }
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/records?${params}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        const data: AdminResponse = await response.json();
        setRecords(data.records);
        setPagination({
          total: data.total,
          totalPages: data.total_pages,
          currentPage: data.page
        });
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleFilterChange = (key: keyof AdminFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyFilters = () => {
    fetchRecords();
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && key !== 'page' && key !== 'limit') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/export?${params}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuc-so-monlam-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const updateFlag = async (id: number, flagged: boolean, reason?: string) => {
    try {
      const response = await fetch('/api/admin/records', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: JSON.stringify({ id, flagged, reason })
      });

      if (response.ok) {
        fetchRecords();
      }
    } catch (error) {
      console.error('Failed to update flag:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [filters.page, filters.limit]);

  if (loading || !messages) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{messages?.common.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-md mx-auto px-4 py-8">
          <div className="card">
            <h1 className="text-2xl font-bold text-center mb-6">
              {messages.admin.login.title}
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {messages.admin.login.username}
                </label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {messages.admin.login.password}
                </label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              {authError && (
                <div className="text-danger-600 text-sm">{authError}</div>
              )}
              
              <button type="submit" className="w-full btn btn-primary">
                {messages.admin.login.login_button}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {messages.admin.dashboard.title}
          </h1>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">{messages.admin.dashboard.filters}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.date_from}
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.date_to}
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.attendee_id}
              </label>
              <input
                type="text"
                value={filters.attendee_id || ''}
                onChange={(e) => handleFilterChange('attendee_id', e.target.value)}
                className="input"
                placeholder="ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.attendee_name}
              </label>
              <input
                type="text"
                value={filters.attendee_name || ''}
                onChange={(e) => handleFilterChange('attendee_name', e.target.value)}
                className="input"
                placeholder="Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.quantity_min}
              </label>
              <input
                type="number"
                value={filters.quantity_min || ''}
                onChange={(e) => handleFilterChange('quantity_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input"
                placeholder="Min"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.quantity_max}
              </label>
              <input
                type="number"
                value={filters.quantity_max || ''}
                onChange={(e) => handleFilterChange('quantity_max', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input"
                placeholder="Max"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.flagged_only || false}
                onChange={(e) => handleFilterChange('flagged_only', e.target.checked)}
                className="mr-2"
              />
              {messages.admin.filters.flagged_only}
            </label>
            
            <button onClick={applyFilters} className="btn btn-primary">
              {messages.admin.filters.apply}
            </button>
            
            <button onClick={clearFilters} className="btn btn-secondary">
              {messages.admin.filters.clear}
            </button>
            
            <button onClick={exportCSV} className="btn btn-success">
              {messages.admin.actions.export_csv}
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{messages.admin.dashboard.records_table}</h2>
            <div className="text-sm text-gray-500">
              {pagination.total} {messages.common.total || 'total'} records
            </div>
          </div>
          
          {loadingRecords ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{messages.common.loading}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.timestamp}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.attendee_id}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.attendee_name}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.note}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.flagged}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {messages.admin.table.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className={record.flagged ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(record.ts_server)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.attendee_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.attendee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {record.note}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.flagged ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {record.flag_reason}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => updateFlag(record.id, !record.flagged, record.flagged ? undefined : 'Manual flag')}
                            className={`btn btn-sm ${record.flagged ? 'btn-success' : 'btn-danger'}`}
                          >
                            {record.flagged ? messages.admin.actions.unflag : messages.admin.actions.flag}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    {messages.common.page || 'Page'} {pagination.currentPage} {messages.common.of || 'of'} {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="btn btn-secondary btn-sm"
                    >
                      {messages.common.previous}
                    </button>
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="btn btn-secondary btn-sm"
                    >
                      {messages.common.next}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
