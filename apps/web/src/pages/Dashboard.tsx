// src/pages/Dashboard.tsx
import Breadcrumb from '../components/Breadcrumb';

export default function Dashboard() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-np-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-np-black mb-4 font-instrument">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/social-media-lab" className="block p-3 rounded-lg bg-np-gray hover:bg-gray-300 transition-colors">
              <div className="font-medium text-np-black">Generate Social Content</div>
              <div className="text-sm text-np-black opacity-70">Create tweet-length captions</div>
            </a>
            <a href="/referral-nurture" className="block p-3 rounded-lg bg-np-gray hover:bg-gray-300 transition-colors">
              <div className="font-medium text-np-black">Referral Outreach</div>
              <div className="text-sm text-np-black opacity-70">Manage attorney relationships</div>
            </a>
            <a href="/news-radar" className="block p-3 rounded-lg bg-np-gray hover:bg-gray-300 transition-colors">
              <div className="font-medium text-np-black">News Monitoring</div>
              <div className="text-sm text-np-black opacity-70">Track industry updates</div>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-np-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-np-black mb-4 font-instrument">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-np-black">API Server</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-np-black">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Demo Mode
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-np-black">AI Services</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-np-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-np-black mb-4 font-instrument">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-np-black font-medium">Social content generated</div>
              <div className="text-sm text-np-gray italic mb-2">2 minutes ago</div>
            </div>
            <div className="text-sm">
              <div className="text-np-black font-medium">Referral emails sent</div>
              <div className="text-sm text-np-gray italic mb-2">1 hour ago</div>
            </div>
            <div className="text-sm">
              <div className="text-np-black font-medium">News updates checked</div>
              <div className="text-sm text-np-gray italic mb-2">3 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
