// src/pages/Dashboard.tsx
import Breadcrumb from '../components/Breadcrumb';

export default function Dashboard() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/social-media-lab" className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="font-semibold text-np-black mb-1">Generate Social Content</div>
              <div className="text-sm text-gray-600">Create tweet-length captions</div>
            </a>
            <a href="/referral-nurture" className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="font-semibold text-np-black mb-1">Referral Outreach</div>
              <div className="text-sm text-gray-600">Manage attorney relationships</div>
            </a>
            <a href="/news-radar" className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="font-semibold text-np-black mb-1">News Monitoring</div>
              <div className="text-sm text-gray-600">Track industry updates</div>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h3 className="section-title">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-np-black">API Server</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-np-black">Database</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Demo Mode
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-np-black">AI Services</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="section-title">Recent Activity</h3>
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-200 last:border-b-0">
              <div className="text-sm font-medium text-np-black">Social content generated</div>
              <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
            </div>
            <div className="pb-3 border-b border-gray-200 last:border-b-0">
              <div className="text-sm font-medium text-np-black">Referral emails sent</div>
              <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
            </div>
            <div className="pb-3 border-b border-gray-200 last:border-b-0">
              <div className="text-sm font-medium text-np-black">News updates checked</div>
              <div className="text-xs text-gray-500 mt-1">3 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
