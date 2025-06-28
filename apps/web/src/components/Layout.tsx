import { Outlet, Link, useLocation } from 'react-router-dom';
import BrandHeader from './BrandHeader';
import FooterLogo from './FooterLogo';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { to: "/", label: "Overview", icon: "📊" },
    { to: "/social-media-lab", label: "Social Media", icon: "📱" },
    { to: "/news-radar", label: "News Radar", icon: "📰" },
    { to: "/referral-nurture", label: "Referrals", icon: "🤝" },
    { to: "/ai-visibility-checker", label: "AI Visibility", icon: "🤖" },
    { to: "/keyword-monitor", label: "Keywords", icon: "🔍" },
    { to: "/union-strong", label: "Union Strong", icon: "💪" },
    { to: "/creative-playground", label: "Creative", icon: "🎨" }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-brand">
      {/* Professional Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 shadow-sm">
        <div className="p-6 border-b border-slate-200/60">
          <BrandHeader />
        </div>
        
        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link 
                key={item.to}
                to={item.to} 
                className={`group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/50' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/src/assets/Northpoint Logo-05.png" 
                alt="NP" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">NorthPoint Legal</p>
              <p className="text-xs text-slate-500 truncate">Professional Dashboard</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-slate-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-slate-200/60 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-slate-900">
                  {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h1a1 1 0 011 1v12z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <div className="flex-1 p-8 overflow-auto">
            <Outlet />
          </div>
        </div>
        <FooterLogo />
      </main>
    </div>
  );
}
