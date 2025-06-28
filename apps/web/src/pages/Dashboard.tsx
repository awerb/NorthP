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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening'}</h1>
          <p className="text-sm text-slate-600 mt-1">Here's what's happening with your legal practice today</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last updated</p>
          <p className="text-sm font-semibold text-slate-900">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* KPI Cards - More Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">
                {kpi.icon}
              </div>
              <span className={`inline-flex items-center text-xs font-medium ${
                kpi.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {kpi.changeType === 'positive' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 7H7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10M7 7h10" />
                  )}
                </svg>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="text-xs font-medium text-slate-600">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid - More Balanced */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Quick Actions - Takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Quick Actions</h3>
              <p className="text-sm text-slate-600">Access your most-used tools and features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                      ${action.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                      ${action.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                      ${action.color === 'green' ? 'bg-emerald-100 text-emerald-600' : ''}
                      ${action.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                    `}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Recent Activity</h3>
              <p className="text-sm text-slate-600">Latest updates from your systems</p>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
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
                    <p className="text-sm font-medium text-slate-900 leading-tight">{activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View all activity →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Performance - More Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Health */}
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">System Health</h3>
            <p className="text-sm text-slate-600">Real-time status of your integrated services</p>
          </div>
          <div className="space-y-3">
            {[
              { service: "API Server", status: "Online", latency: "45ms", statusType: "success" },
              { service: "Database", status: "Demo Mode", latency: "12ms", statusType: "warning" },
              { service: "AI Services", status: "Connected", latency: "340ms", statusType: "success" },
              { service: "Search Console", status: "Setup Required", latency: "--", statusType: "error" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.statusType === 'success' ? 'bg-emerald-400' :
                    item.statusType === 'warning' ? 'bg-amber-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-900">{item.service}</span>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.statusType === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    item.statusType === 'warning' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>{item.status}</span>
                  <p className="text-xs text-slate-500 mt-1">{item.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Performance Insights</h3>
            <p className="text-sm text-slate-600">Key metrics for this month</p>
          </div>
          <div className="space-y-4">
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
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300" 
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
