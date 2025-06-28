import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SocialMediaLab from './pages/SocialMediaLab';
import NewsRadar from './pages/NewsRadar';
import ReferralNurture from './pages/ReferralNurture';
import AIVisibilityChecker from './pages/AIVisibilityChecker';
import KeywordMonitor from './pages/KeywordMonitor';
import UnionStrong from './pages/UnionStrong';
import CreativePlayground from './pages/CreativePlayground';

netlifyIdentity.init();

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  // Temporarily bypass authentication for testing
  return children;
  // const user = netlifyIdentity.currentUser();
  // return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="social-media-lab" element={<SocialMediaLab />} />
          <Route path="news-radar" element={<NewsRadar />} />
          <Route path="referral-nurture" element={<ReferralNurture />} />
          <Route path="ai-visibility-checker" element={<AIVisibilityChecker />} />
          <Route path="keyword-monitor" element={<KeywordMonitor />} />
          <Route path="union-strong" element={<UnionStrong />} />
          <Route path="creative-playground" element={<CreativePlayground />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
