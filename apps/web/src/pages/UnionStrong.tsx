import { useState, useEffect } from 'react';
import axios from 'axios';

interface Campaign {
  id: number;
  title: string;
  description: string;
  status: string;
  participants: number;
  goal: number;
  progress: number;
  startDate: string;
  endDate: string;
}

interface Statistics {
  totalMembers: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalFunds: number;
  casesWon: number;
  casesInProgress: number;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  priority: string;
}

export default function UnionStrong() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE}/union/dashboard`);
      if (response.data.success) {
        setCampaigns(response.data.data.campaigns || []);
        setStatistics(response.data.data.statistics);
        setRecentActivity(response.data.data.recentActivity || []);
      } else {
        setError('Failed to fetch union data');
      }
    } catch (err) {
      console.error('Error fetching union data:', err);
      setError('Unable to connect to union service');
    }
  };

  // Join a campaign
  const joinCampaign = async (campaignId: number) => {
    try {
      const response = await axios.post(`${API_BASE}/union/join-campaign`, {
        campaignId: campaignId
      });
      
      if (response.data.success) {
        // Update the campaign in state
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, ...response.data.campaign }
            : campaign
        ));
      }
    } catch (err) {
      console.error('Error joining campaign:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_update': return '📢';
      case 'legal_victory': return '⚖️';
      case 'member_milestone': return '🎯';
      case 'funding': return '💰';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading union data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Union Strong</h1>
        <p className="text-slate-600 mt-1">Supporting workers' rights and legal advocacy</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card-stat">
            <div className="stat-value">{statistics.totalMembers.toLocaleString()}</div>
            <div className="stat-label">Total Members</div>
          </div>
          
          <div className="card-stat">
            <div className="stat-value">{statistics.activeCampaigns}</div>
            <div className="stat-label">Active Campaigns</div>
          </div>

          <div className="card-stat">
            <div className="stat-value">{statistics.casesWon}</div>
            <div className="stat-label">Cases Won</div>
          </div>

          <div className="card-stat">
            <div className="stat-value">{formatCurrency(statistics.totalFunds)}</div>
            <div className="stat-label">Total Funds</div>
          </div>

          <div className="card-stat">
            <div className="stat-value">{statistics.casesInProgress}</div>
            <div className="stat-label">Cases in Progress</div>
          </div>

          <div className="card-stat">
            <div className="stat-value">{statistics.completedCampaigns}</div>
            <div className="stat-label">Completed Campaigns</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div className="card">
          <h2 className="section-title">Active Campaigns</h2>
          {campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{campaign.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{campaign.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Progress: {campaign.participants.toLocaleString()} / {campaign.goal.toLocaleString()}</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-blue-600" 
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                    <button
                      onClick={() => joinCampaign(campaign.id)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Join Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-slate-600">No active campaigns at this time</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="section-title">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-slate-900 text-sm">{activity.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Strengthen Workers' Rights</h2>
          <p className="text-slate-600 mb-4">
            Join our mission to protect and advance workers' rights through legal advocacy and community support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-primary">
              💪 Join Movement
            </button>
            <button className="btn-secondary">
              📋 View All Campaigns
            </button>
            <button className="btn-secondary">
              📞 Contact Legal Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
