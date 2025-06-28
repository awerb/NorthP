import { Outlet, Link } from 'react-router-dom';
import BrandHeader from './BrandHeader';
import FooterLogo from './FooterLogo';

export default function Layout() {
  return (
    <div className="flex h-screen bg-np-white font-instrument">
      <aside className="w-60 bg-np-white border-r border-np-gray p-4 space-y-4">
        <BrandHeader />
        <nav className="flex flex-col space-y-2 text-np-black">
          <Link to="/" className="hover:text-np-blue transition-colors">Dashboard</Link>
          <Link to="/social-media-lab" className="hover:text-np-blue transition-colors">Social Media Lab</Link>
          <Link to="/news-radar" className="hover:text-np-blue transition-colors">News Radar</Link>
          <Link to="/referral-nurture" className="hover:text-np-blue transition-colors">Referral Nurture</Link>
          <Link to="/ai-visibility-checker" className="hover:text-np-blue transition-colors">AI Visibility Checker</Link>
          <Link to="/keyword-monitor" className="hover:text-np-blue transition-colors">Keyword Monitor</Link>
          <Link to="/union-strong" className="hover:text-np-blue transition-colors">Union Strong</Link>
          <Link to="/creative-playground" className="hover:text-np-blue transition-colors">Creative Playground</Link>
        </nav>
      </aside>
      <main className="flex-1 relative bg-np-white">
        <div className="p-6 bg-np-white text-np-black font-instrument h-full overflow-auto">
          <Outlet />
        </div>
        <FooterLogo />
      </main>
    </div>
  );
}
