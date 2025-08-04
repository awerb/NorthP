import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Breadcrumb from '../components/Breadcrumb';

interface ReferralTarget {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  firm?: string;
  city?: string;
}

interface ReferralDraft {
  id: number;
  target_id: number;
  subject: string;
  body: string;
  sent: boolean;
  created_at: string;
  target?: ReferralTarget;
}

interface UploadResponse {
  success: boolean;
  message: string;
  processed: number;
  total: number;
  demo: boolean;
}

interface CheckResponse {
  success: boolean;
  message: string;
  checked: number;
  emailsGenerated: number;
  errors: string[];
  demo: boolean;
}

interface OutboxResponse {
  success: boolean;
  drafts: ReferralDraft[];
  count: number;
  demo: boolean;
}

const ReferralNurture: React.FC = () => {
  const [drafts, setDrafts] = useState<ReferralDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [sendingDrafts, setSendingDrafts] = useState<Set<number>>(new Set());

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  // Fetch drafts from the API
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<OutboxResponse>(`${API_BASE}/referral/outbox`);
      setDrafts(response.data.drafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Load drafts on component mount
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Handle CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      setUploadLoading(true);
      setUploadMessage(null);
      
      const response = await axios.post<UploadResponse>(`${API_BASE}/referral/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadMessage(`✅ ${response.data.message}`);
      
      // Clear the file input
      event.target.value = '';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data && 'error' in error.response.data
        ? error.response.data.error : 'Failed to upload file';
      setUploadMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle check for updates
  const handleCheckUpdates = async () => {
    try {
      setCheckLoading(true);
      setCheckMessage(null);
      
      const response = await axios.post<CheckResponse>(`${API_BASE}/referral/check`);
      
      setCheckMessage(`✅ ${response.data.message}`);
      setLastChecked(new Date().toLocaleString());
      
      // Refetch drafts after checking
      await fetchDrafts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data && 'error' in error.response.data
        ? error.response.data.error : 'Failed to check for updates';
      setCheckMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setCheckLoading(false);
    }
  };

  // Handle marking draft as sent
  const handleSendDraft = async (draftId: number) => {
    try {
      setSendingDrafts(prev => new Set([...prev, draftId]));
      
      await axios.patch(`${API_BASE}/referral/outbox/${draftId}/sent`);
      
      // Remove the draft from the list (fade out effect)
      setDrafts(prev => prev.filter(draft => draft.id !== draftId));
    } catch (error: unknown) {
      console.error('Error marking draft as sent:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data && 'error' in error.response.data
        ? error.response.data.error : 'Failed to mark draft as sent';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSendingDrafts(prev => {
        const newSet = new Set(prev);
        newSet.delete(draftId);
        return newSet;
      });
    }
  };

  // Calculate chart data
  const sentCount = 0; // We're only showing unsent drafts, so sent count is always 0 in this view
  const unsentCount = drafts.length;
  
  const chartData = [
    { name: 'Sent', value: sentCount, color: '#10B981' },
    { name: 'Unsent', value: unsentCount, color: '#F59E0B' },
  ];

  const COLORS = ['#10B981', '#F59E0B'];

  return (
    <div>
      <Breadcrumb pageTitle="Referral Nurture" />
      
      {/* CSV Upload Section */}
      <div className="card mb-6">
        <h2 className="section-title">Upload Referral Targets</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploadLoading}
            className="block w-full text-sm text-np-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-np-blue file:text-np-white hover:file:bg-blue-700 disabled:opacity-50"
          />
          {uploadLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-np-blue"></div>
          )}
        </div>
        {uploadMessage && (
          <p className={`mt-2 text-sm ${uploadMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {uploadMessage}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          CSV should have columns: first_name, last_name, email, firm, city
        </p>
      </div>

      {/* Check for Updates Section */}
        <div className="card mb-6">
          <h2 className="section-title">Check for News Updates</h2>
          <button
            onClick={handleCheckUpdates}
            disabled={checkLoading}
            className="bg-np-blue hover:bg-blue-700 disabled:bg-blue-400 text-np-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            {checkLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-np-white"></div>
            )}
            <span>{checkLoading ? 'Checking...' : 'Check for Updates'}</span>
          </button>
          {checkMessage && (
            <p className={`mt-2 text-sm ${checkMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {checkMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drafts Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Email Drafts</h2>
              {lastChecked && (
                <p className="text-sm text-np-gray italic mb-2">Last checked: {lastChecked}</p>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-np-blue"></div>
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-np-gray text-center py-8">No email drafts found. Upload targets and check for updates to generate drafts.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-np-gray">
                  <thead className="bg-np-gray">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">Firm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">Body</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-np-black uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drafts.map((draft) => (
                      <tr 
                        key={draft.id} 
                        className={`transition-opacity duration-500 ${sendingDrafts.has(draft.id) ? 'opacity-50' : 'opacity-100'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-np-black">
                          {draft.target ? `${draft.target.first_name} ${draft.target.last_name}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-np-black">
                          {draft.target?.firm || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-np-black">
                          {draft.target?.city || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-np-black max-w-xs truncate">
                          {draft.subject}
                        </td>
                        <td className="px-6 py-4 text-sm text-np-black max-w-sm">
                          <div className="truncate" title={draft.body}>
                            {draft.body}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleSendDraft(draft.id)}
                            disabled={sendingDrafts.has(draft.id)}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-np-white font-medium py-1 px-3 rounded text-sm transition-colors duration-200"
                          >
                            {sendingDrafts.has(draft.id) ? 'Sending...' : 'Send'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Donut Chart */}
          <div className="card">
            <h2 className="section-title">Draft Status</h2>
            {unsentCount > 0 || sentCount > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-np-gray">
                No draft data available
              </div>
            )}
            
            {/* Stats */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-np-black">Total Drafts:</span>
                <span className="text-sm font-semibold text-np-black">{unsentCount + sentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-np-black">Unsent:</span>
                <span className="text-sm font-semibold text-yellow-600">{unsentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-np-black">Sent:</span>
                <span className="text-sm font-semibold text-green-600">{sentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralNurture;
