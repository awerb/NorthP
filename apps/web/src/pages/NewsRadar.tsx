import { useState, useEffect } from 'react';
import axios from 'axios';

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  tag?: string;
  summary?: string;
  image_url?: string;
  published_at: string;
  source: string;
  fresh: boolean;
  created_at: string;
}

interface NewsStats {
  total: number;
  fresh: number;
  sources: number;
  last_updated: string;
}

export default function NewsRadar() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE}/news/all`);
      if (response.data.success) {
        setArticles(response.data.articles || []);
      } else {
        setError('Failed to fetch articles');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Unable to connect to news service');
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/news/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Refresh news
  const refreshNews = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API_BASE}/news/refresh`);
      await fetchArticles();
      await fetchStats();
    } catch (err) {
      console.error('Error refreshing news:', err);
      setError('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Get unique tags
  const uniqueTags = ['all', ...Array.from(new Set(articles.map(a => a.tag).filter((tag): tag is string => Boolean(tag))))];

  // Filter articles by tag
  const filteredArticles = selectedTag === 'all' 
    ? articles 
    : articles.filter(a => a.tag === selectedTag);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get tag color
  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'crash': 'bg-red-100 text-red-800',
      'medical malpractice': 'bg-purple-100 text-purple-800',
      'construction': 'bg-amber-100 text-amber-800',
      'legal': 'bg-blue-100 text-blue-800',
      'settlement': 'bg-green-100 text-green-800',
    };
    return colors[tag] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading news...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">News Radar</h1>
          <p className="text-slate-600 mt-1">Stay updated with relevant legal industry news</p>
        </div>
        <button
          onClick={refreshNews}
          disabled={refreshing}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-stat">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Articles</div>
          </div>
          <div className="card-stat">
            <div className="stat-value">{stats.fresh}</div>
            <div className="stat-label">Fresh Articles</div>
          </div>
          <div className="card-stat">
            <div className="stat-value">{stats.sources}</div>
            <div className="stat-label">News Sources</div>
          </div>
          <div className="card-stat">
            <div className="stat-value text-sm">{formatDate(stats.last_updated)}</div>
            <div className="stat-label">Last Updated</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-slate-700">Filter by category:</span>
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tag === 'all' ? 'All' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-slate-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No articles found</h3>
          <p className="text-slate-600">Try refreshing or check back later for new articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {article.tag && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(article.tag)}`}>
                      {article.tag}
                    </span>
                  )}
                  {article.fresh && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                      Fresh
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatDate(article.published_at)}</span>
              </div>

              <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  {article.title}
                </a>
              </h3>

              {article.summary && (
                <p className="text-slate-600 text-sm mb-3 line-clamp-3">{article.summary}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">{article.source}</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Read more</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
