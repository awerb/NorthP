import { Outlet, Link } from 'react-router-dom';
import BrandHeader from './BrandHeader';
import FooterLogo from './FooterLogo';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 font-brand">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4">
          <BrandHeader />
        </div>
        <nav className="px-4 pb-4 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Dashboard
          </Link>
          <Link 
            to="/social-media-lab" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Social Media Lab
          </Link>
          <Link 
            to="/news-radar" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            News Radar
          </Link>
          <Link 
            to="/referral-nurture" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Referral Nurture
          </Link>
          <Link 
            to="/ai-visibility-checker" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            AI Visibility Checker
          </Link>
          <Link 
            to="/keyword-monitor" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Keyword Monitor
          </Link>
          <Link 
            to="/union-strong" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Union Strong
          </Link>
          <Link 
            to="/creative-playground" 
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Creative Playground
          </Link>
        </nav>
      </aside>
      <main className="flex-1 relative bg-gray-50">
        <div className="p-6 bg-gray-50 text-black font-brand h-full overflow-auto">
          <Outlet />
        </div>
        <FooterLogo />
      </main>
    </div>
  );
}
