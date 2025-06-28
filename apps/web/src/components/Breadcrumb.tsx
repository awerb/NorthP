import React from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbProps {
  pageTitle?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const location = useLocation();
  
  const getRouteTitle = (path: string): string => {
    const routes: { [key: string]: string } = {
      '/': 'Dashboard',
      '/social-media-lab': 'Social Media Lab',
      '/news-radar': 'News Radar',
      '/referral-nurture': 'Referral Nurture',
      '/ai-visibility-checker': 'AI Visibility Checker',
      '/keyword-monitor': 'Keyword Monitor',
      '/union-strong': 'Union Strong',
      '/creative-playground': 'Creative Playground',
    };
    
    return routes[path] || 'Unknown Page';
  };
  
  const routeTitle = getRouteTitle(location.pathname);
  
  return (
    <div className="mb-8">
      <nav className="text-sm text-gray-500 mb-3">
        <span className="text-blue-600 font-medium">Northpoint</span>
        <span className="mx-2 text-gray-300">→</span>
        <span>{routeTitle}</span>
        {pageTitle && (
          <>
            <span className="mx-2 text-gray-300">→</span>
            <span className="text-black font-medium">{pageTitle}</span>
          </>
        )}
      </nav>
      <h1 className="page-title">
        {pageTitle || routeTitle}
      </h1>
    </div>
  );
};

export default Breadcrumb;
