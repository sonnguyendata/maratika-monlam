'use client';

import { useState, useEffect, useCallback } from 'react';
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
    limit: 50,
    sort_by: 'ts_server',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<AdminRecord[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

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

  const fetchRecords = useCallback(async () => {
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
  }, [filters, credentials.username, credentials.password]);

  const handleFilterChange = (key: keyof AdminFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Reset to page 1 when filters change
      if (key !== 'page') {
        newFilters.page = 1;
      }
      return newFilters;
    });
  };

  const applyFilters = () => {
    fetchRecords();
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50, sort_by: 'ts_server', sort_order: 'desc' });
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

  const updateRecord = async (id: number, updates: {
    attendee_id?: string;
    attendee_name?: string;
    quantity?: number;
    note?: string;
  }) => {
    try {
      console.log('Updating record:', id, updates);
      const response = await fetch('/api/admin/records', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: JSON.stringify({ id, updates })
      });

      console.log('Update response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert(`Update failed: ${errorData.error}\nDetails: ${errorData.details || 'No details'}`);
        return;
      }

      fetchRecords();
      setEditingRecord(null);
      alert('Record updated successfully!');
    } catch (error) {
      console.error('Failed to update record:', error);
      alert('Failed to update record: ' + error);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      console.log('Deleting record:', id);
      const response = await fetch(`/api/admin/records?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      console.log('Delete response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert(`Delete failed: ${errorData.error}\nDetails: ${errorData.details || 'No details'}`);
        return;
      }

      fetchRecords();
      alert('Record deleted successfully!');
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to delete record: ' + error);
    }
  };

  const fetchDuplicates = async () => {
    setLoadingDuplicates(true);
    try {
      const response = await fetch('/api/admin/duplicates', {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.duplicates);
      }
    } catch (error) {
      console.error('Failed to fetch duplicates:', error);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const deleteDuplicate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this duplicate record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/duplicates?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        fetchDuplicates();
        fetchRecords();
      }
    } catch (error) {
      console.error('Failed to delete duplicate:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated, fetchRecords]);

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
            {messages.admin.title}
          </h1>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc · Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.admin.filters.by_date}
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
                {messages.admin.filters.by_date}
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
                {messages.admin.filters.by_id}
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
                {messages.admin.filters.by_name}
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
                {messages.admin.filters.qty_range}
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
                {messages.admin.filters.qty_range}
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
          
          <div className="flex flex-wrap items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.flagged_only || false}
                onChange={(e) => handleFilterChange('flagged_only', e.target.checked)}
                className="mr-2"
              />
              {messages.admin.filters.flags_only}
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.duplicate_only || false}
                onChange={(e) => handleFilterChange('duplicate_only', e.target.checked)}
                className="mr-2"
              />
              Duplicate Only
            </label>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sort_by || 'ts_server'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="input"
              >
                <option value="ts_server">Time</option>
                <option value="attendee_id">ID</option>
                <option value="attendee_name">Name</option>
                <option value="quantity">Quantity</option>
                <option value="created_at">Created At</option>
              </select>
              
              <select
                value={filters.sort_order || 'desc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="input"
              >
                <option value="desc">↓ Desc</option>
                <option value="asc">↑ Asc</option>
              </select>
            </div>
            
            <button onClick={applyFilters} className="btn btn-primary">
              Áp dụng
            </button>
            
            <button onClick={clearFilters} className="btn btn-secondary">
              Xóa bộ lọc
            </button>
            
            <button onClick={exportCSV} className="btn btn-success">
              {messages.admin.actions.export_csv}
            </button>
            
            <button 
              onClick={() => {
                setShowDuplicates(!showDuplicates);
                if (!showDuplicates) {
                  fetchDuplicates();
                }
              }} 
              className="btn btn-warning"
            >
              {messages.admin.actions.view_duplicates}
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Bảng ghi nhận · Records Table</h2>
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
                        Thời gian · Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên · Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng · Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi chú · Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nghi vấn · Flag
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động · Actions
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
                              {record.flag_reason === 'BurstByID' ? messages.admin.flags.burst :
                               record.flag_reason === 'SpikeByQty' ? messages.admin.flags.spike :
                               record.flag_reason === 'DupKey' ? messages.admin.flags.duplicate :
                               record.flag_reason === 'MultiAccountSameIP' ? messages.admin.flags.same_ip :
                               record.flag_reason}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateFlag(record.id, !record.flagged, record.flagged ? undefined : 'Manual flag')}
                              className={`btn btn-sm ${record.flagged ? 'btn-success' : 'btn-danger'}`}
                            >
                              {record.flagged ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                            </button>
                            <button
                              onClick={() => {
                                console.log('Edit button clicked for record:', record.id);
                                setEditingRecord(record);
                              }}
                              className="btn btn-sm btn-secondary"
                            >
                              {messages.admin.actions.edit_record || 'Edit'}
                            </button>
                            <button
                              onClick={() => {
                                console.log('Delete button clicked for record:', record.id);
                                deleteRecord(record.id);
                              }}
                              className="btn btn-sm btn-danger"
                            >
                              {messages.admin.actions.delete_record || 'Delete'}
                            </button>
                          </div>
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

        {/* Duplicates Section */}
        {showDuplicates && (
          <div className="card mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Duplicate Records · Bản ghi trùng lặp</h2>
              <div className="text-sm text-gray-500">
                {duplicates.length} duplicate records
              </div>
            </div>
            
            {loadingDuplicates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">{messages.common.loading}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian · Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên · Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng · Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi chú · Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động · Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {duplicates.map((record) => (
                      <tr key={record.id} className="bg-red-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => deleteDuplicate(record.id)}
                            className="btn btn-sm btn-danger"
                          >
                            {messages.admin.actions.delete_duplicate}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Record · Chỉnh sửa bản ghi
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateRecord(editingRecord.id, {
                    attendee_id: formData.get('attendee_id') as string,
                    attendee_name: formData.get('attendee_name') as string,
                    quantity: parseInt(formData.get('quantity') as string),
                    note: formData.get('note') as string
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendee ID
                    </label>
                    <input
                      type="text"
                      name="attendee_id"
                      defaultValue={editingRecord.attendee_id}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendee Name
                    </label>
                    <input
                      type="text"
                      name="attendee_name"
                      defaultValue={editingRecord.attendee_name}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={editingRecord.quantity}
                      className="input"
                      required
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note
                    </label>
                    <textarea
                      name="note"
                      defaultValue={editingRecord.note || ''}
                      className="input"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                    >
                      {messages.common.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRecord(null)}
                      className="btn btn-secondary flex-1"
                    >
                      {messages.common.cancel}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
