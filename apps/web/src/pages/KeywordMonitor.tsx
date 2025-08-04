import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface KeywordMetric {
  keyword: string;
  average_position: number;
  ctr: number;
  impressions: number;
  clicks: number;
  last_updated: string;
}

interface KeywordStatus {
  gscInitialized: boolean;
  gscAuthenticated: boolean;
  demoMode: boolean;
  targetKeywords: string[];
  memorySnapshots: number | string;
}

export default function KeywordMonitor() {
  const [metrics, setMetrics] = useState<KeywordMetric[]>([]);
  const [status, setStatus] = useState<KeywordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  // Fetch keyword status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/keywords/status`);
      if (response.data.success) {
        setStatus(response.data.status);
      }
    } catch (err) {
      console.error('Error fetching keyword status:', err);
      setError('Unable to check Google Search Console status');
    }
  }, [API_BASE]);

  // Fetch keyword metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE}/keywords/metrics`);
      if (response.data.success) {
        setMetrics(response.data.metrics || []);
      } else {
        setError('Failed to fetch keyword metrics');
      }
    } catch (err) {
      console.error('Error fetching keyword metrics:', err);
      setError('Unable to connect to keyword tracking service');
    }
  }, [API_BASE]);

  // Update keyword data from GSC
  const updateKeywords = async () => {
    setUpdating(true);
    try {
      await axios.post(`${API_BASE}/keywords/update`);
      await fetchMetrics();
      await fetchStatus();
    } catch (err) {
      console.error('Error updating keywords:', err);
      setError('Failed to update keyword data');
    } finally {
      setUpdating(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchMetrics()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStatus, fetchMetrics]);

  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Format position with alert styling
  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-emerald-600 bg-emerald-50';
    if (position <= 10) return 'text-blue-600 bg-blue-50';
    if (position <= 25) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading keyword data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Keyword Monitor</h1>
          <p className="text-slate-600 mt-1">Google Search Console integration for SEO performance tracking</p>
        </div>
        <button
          onClick={updateKeywords}
          disabled={updating || !status?.gscAuthenticated}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{updating ? 'Updating...' : 'Update Data'}</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-stat">
          <div className="flex items-center justify-between mb-2">
            <div className="stat-label">GSC Connection</div>
            <div className={`w-3 h-3 rounded-full ${status?.gscInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="stat-value text-sm">
            {status?.gscInitialized ? 'Configured' : 'Not Setup'}
          </div>
        </div>

        <div className="card-stat">
          <div className="flex items-center justify-between mb-2">
            <div className="stat-label">Authentication</div>
            <div className={`w-3 h-3 rounded-full ${status?.gscAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="stat-value text-sm">
            {status?.gscAuthenticated ? 'Active' : 'Failed'}
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-value">{status?.targetKeywords?.length || 0}</div>
          <div className="stat-label">Target Keywords</div>
        </div>

        <div className="card-stat">
          <div className="stat-value">{metrics.length}</div>
          <div className="stat-label">Tracked Metrics</div>
        </div>
      </div>

      {/* Configuration Status */}
      {status && !status.gscAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800 mb-1">Setup Required</h3>
              <p className="text-sm text-amber-700 mb-3">
                Configure Google Search Console service account credentials to begin tracking keyword performance.
              </p>
              <div className="text-xs text-amber-600 space-y-1">
                <div>• GSC Initialized: {status.gscInitialized ? '✓' : '✗'}</div>
                <div>• Authentication: {status.gscAuthenticated ? '✓' : '✗'}</div>
                <div>• Demo Mode: {status.demoMode ? 'Active' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Target Keywords Overview */}
      <div className="card">
        <h2 className="section-title">Target Keywords</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">Personal Injury Focus</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• personal injury lawyer sf</li>
              <li>• wrongful death lawyer sf</li>
              <li>• car accident attorney sf</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">Tracking Period</h3>
            <p className="text-sm text-slate-600">Last 90 days</p>
            <p className="text-xs text-slate-500 mt-1">Daily snapshots with trend analysis</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">Alert Threshold</h3>
            <p className="text-sm text-slate-600">Position &gt; 25</p>
            <p className="text-xs text-slate-500 mt-1">For 3+ consecutive days</p>
          </div>
        </div>
      </div>

      {/* Keyword Performance Table */}
      {metrics.length > 0 ? (
        <div className="card">
          <h2 className="section-title">Keyword Performance</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Position</th>
                  <th>CTR</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="font-medium">{metric.keyword}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(metric.average_position)}`}>
                        #{metric.average_position.toFixed(1)}
                      </span>
                    </td>
                    <td>{formatPercent(metric.ctr)}</td>
                    <td>{metric.impressions.toLocaleString()}</td>
                    <td>{metric.clicks.toLocaleString()}</td>
                    <td className="text-sm text-slate-500">{formatDate(metric.last_updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {status?.demoMode && (
            <div className="mt-4 text-xs text-slate-500 italic">
              * Currently showing demo data. Connect Google Search Console for real metrics.
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-slate-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No keyword data available</h3>
          <p className="text-slate-600">Configure Google Search Console to start tracking keyword performance.</p>
        </div>
      )}
    </div>
  );
}
