// src/pages/KeywordMonitor.tsx
import Breadcrumb from '../components/Breadcrumb';

export default function KeywordMonitor() {
  return (
    <div>
      <Breadcrumb pageTitle="SEO Keywords" />
      
      <div className="bg-np-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-np-black mb-4 font-instrument">Google Search Console Integration</h2>
        <p className="text-np-black mb-4">
          Monitor keyword performance for targeted search terms related to personal injury law in San Francisco.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-np-gray rounded-lg p-4">
            <h3 className="font-medium text-np-black">Target Keywords</h3>
            <ul className="text-sm text-np-black mt-2 space-y-1">
              <li>• personal injury lawyer sf</li>
              <li>• wrongful death lawyer sf</li>
              <li>• car accident attorney sf</li>
            </ul>
          </div>
          
          <div className="bg-np-gray rounded-lg p-4">
            <h3 className="font-medium text-np-black">Tracking Period</h3>
            <p className="text-sm text-np-black mt-2">Last 90 days</p>
            <p className="text-sm text-np-gray italic mt-1">Daily snapshots with alerts</p>
          </div>
          
          <div className="bg-np-gray rounded-lg p-4">
            <h3 className="font-medium text-np-black">Alert Threshold</h3>
            <p className="text-sm text-np-black mt-2">Position &gt; 25</p>
            <p className="text-sm text-np-gray italic mt-1">For 3+ consecutive days</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Setup Required:</strong> Configure Google Search Console service account credentials to begin tracking.
          </p>
          <p className="text-sm text-np-gray italic mt-2">
            API endpoints ready - awaiting GSC integration
          </p>
        </div>
      </div>
    </div>
  );
}
