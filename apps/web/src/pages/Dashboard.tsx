// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kpiData = [
    {
      label: "Active Cases",
      value: "47",
      change: "+12%",
      changeType: "positive",
      icon: "📋"
    },
    {
      label: "Monthly Revenue",
      value: "$324K",
      change: "+8.2%",
      changeType: "positive",
      icon: "💰"
    },
    {
      label: "Referral Network",
      value: "89",
      change: "+5",
      changeType: "positive",
      icon: "🤝"
    },
    {
      label: "Avg Case Value",
      value: "$48K",
      change: "-2.1%",
      changeType: "negative",
      icon: "⚖️"
    }
  ];

  const recentActivity = [
    { time: "2 minutes ago", action: "New referral received from Martinez & Associates", type: "referral" },
    { time: "15 minutes ago", action: "AI visibility check completed for 12 keywords", type: "ai" },
    { time: "1 hour ago", action: "Social media content generated for Twitter", type: "social" },
    { time: "3 hours ago", action: "News alert: Personal injury legislation update", type: "news" }
  ];

  const quickActions = [
    {
      title: "Generate Social Content",
      description: "Create engaging posts for social media platforms",
      icon: "📱",
      href: "/social-media-lab",
      color: "blue"
    },
    {
      title: "Check AI Visibility",
      description: "Analyze your firm's visibility in AI search results",
      icon: "🤖",
      href: "/ai-visibility-checker",
      color: "purple"
    },
    {
      title: "Monitor Keywords",
      description: "Track keyword rankings and search performance",
      icon: "🔍",
      href: "/keyword-monitor",
      color: "green"
    },
    {
      title: "Manage Referrals",
      description: "Connect with referring attorneys and track relationships",
      icon: "🤝",
      href: "/referral-nurture",
      color: "orange"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening'}</h1>
          <p className="page-subtitle">Here's what's happening with your legal practice today</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Last updated</p>
          <p className="text-lg font-semibold text-slate-900">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                {kpi.icon}
              </div>
              <span className={`metric-change ${kpi.changeType}`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {kpi.changeType === 'positive' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 7H7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10M7 7h10" />
                  )}
                </svg>
                {kpi.change}
              </span>
            </div>
            <div className="metric-value">{kpi.value}</div>
            <div className="metric-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="section-title">Quick Actions</h3>
              <p className="section-subtitle">Access your most-used tools and features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="action-item group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl
                      ${action.color === 'blue' ? 'bg-blue-100' : ''}
                      ${action.color === 'purple' ? 'bg-purple-100' : ''}
                      ${action.color === 'green' ? 'bg-emerald-100' : ''}
                      ${action.color === 'orange' ? 'bg-orange-100' : ''}
                    `}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-subtitle">Latest updates from your systems</p>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${activity.type === 'referral' ? 'bg-blue-100 text-blue-600' : ''}
                    ${activity.type === 'ai' ? 'bg-purple-100 text-purple-600' : ''}
                    ${activity.type === 'social' ? 'bg-green-100 text-green-600' : ''}
                    ${activity.type === 'news' ? 'bg-orange-100 text-orange-600' : ''}
                  `}>
                    {activity.type === 'referral' && '🤝'}
                    {activity.type === 'ai' && '🤖'}
                    {activity.type === 'social' && '📱'}
                    {activity.type === 'news' && '📰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button className="btn-ghost w-full">
                View all activity
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* System Health */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">System Health</h3>
            <p className="section-subtitle">Real-time status of your integrated services</p>
          </div>
          <div className="space-y-4">
            {[
              { service: "API Server", status: "Online", latency: "45ms", statusType: "success" },
              { service: "Database", status: "Demo Mode", latency: "12ms", statusType: "warning" },
              { service: "AI Services", status: "Connected", latency: "340ms", statusType: "success" },
              { service: "Search Console", status: "Setup Required", latency: "--", statusType: "error" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.statusType === 'success' ? 'bg-emerald-400' :
                    item.statusType === 'warning' ? 'bg-amber-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="font-medium text-slate-900">{item.service}</span>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${item.statusType}`}>{item.status}</span>
                  <p className="text-xs text-slate-500 mt-1">{item.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Performance Insights</h3>
            <p className="section-subtitle">Key metrics for this month</p>
          </div>
          <div className="space-y-6">
            {[
              { metric: "Website Traffic", value: 85, target: 100, unit: "%" },
              { metric: "Lead Conversion", value: 12, target: 15, unit: "%" },
              { metric: "Referral Response Rate", value: 68, target: 75, unit: "%" }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.metric}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}{item.unit}</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(item.value / item.target) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Target: {item.target}{item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
