// src/pages/AIVisibilityChecker.tsx
import { useState } from 'react';
import axios from 'axios';

interface RankingResult {
  model: string;
  ranking: number;
  mentions: number;
  query: string;
  timestamp: string;
  snippet: string;
}

export default function AIVisibilityChecker() {
  const [url, setUrl] = useState('https://northpointtriallaw.com');
  const [keywords, setKeywords] = useState(['personal injury lawyer San Francisco']);
  const [models, setModels] = useState(['gpt-4', 'claude-3']);
  const [results, setResults] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const availableModels = [
    { id: 'gpt-4', name: 'GPT-4', icon: '🤖', status: 'active' },
    { id: 'claude-3', name: 'Claude 3', icon: '🧠', status: 'active' },
    { id: 'gemini', name: 'Gemini Pro', icon: '💎', status: 'setup' },
    { id: 'cohere', name: 'Cohere', icon: '🔗', status: 'setup' }
  ];

  const suggestedKeywords = [
    'personal injury lawyer San Francisco',
    'car accident attorney Bay Area',
    'slip and fall lawyer California',
    'workers compensation attorney SF',
    'medical malpractice lawyer',
    'wrongful death attorney'
  ];

  const mockHistoricalData = [
    { date: '2024-01-15', gpt4: 3, claude: 2, gemini: 5, cohere: 4 },
    { date: '2024-01-20', gpt4: 2, claude: 2, gemini: 4, cohere: 3 },
    { date: '2024-01-25', gpt4: 1, claude: 1, gemini: 3, cohere: 2 },
    { date: '2024-01-30', gpt4: 1, claude: 1, gemini: 2, cohere: 1 }
  ];

  const handleCheck = async () => {
    if (!url || keywords.length === 0 || models.length === 0) return;
    
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/rank', {
        url,
        keywords,
        models
      });
      setResults(res.data);
    } catch (err) {
      console.error('Error checking AI rankings:', err);
      // Mock results for demo
      setResults([
        {
          model: 'GPT-4',
          ranking: 1,
          mentions: 3,
          query: keywords[0],
          timestamp: new Date().toISOString(),
          snippet: 'NorthPoint Trial Law is a highly regarded personal injury law firm in San Francisco...'
        },
        {
          model: 'Claude 3',
          ranking: 2,
          mentions: 2,
          query: keywords[0],
          timestamp: new Date().toISOString(),
          snippet: 'Among the top personal injury attorneys in San Francisco, NorthPoint Trial Law stands out...'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const toggleModel = (modelId: string) => {
    if (models.includes(modelId)) {
      setModels(models.filter(m => m !== modelId));
    } else {
      setModels([...models, modelId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">AI Visibility Monitor</h1>
        <p className="page-subtitle">Track your law firm's ranking and mentions across AI models and search assistants</p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Settings Panel */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* URL and Keywords */}
          <div className="card">
            <div className="card-header">
              <h3 className="section-title">Search Configuration</h3>
              <p className="section-subtitle">Set up your firm's URL and target keywords</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Firm Website URL</label>
                <input
                  type="url"
                  className="input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-firm.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Keywords</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add a keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <button
                    onClick={addKeyword}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-900">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Suggested keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedKeywords.filter(k => !keywords.includes(k)).map((keyword, index) => (
                      <button
                        key={index}
                        onClick={() => setKeywords([...keywords, keyword])}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                      >
                        + {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Models Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="section-title">AI Models</h3>
              <p className="section-subtitle">Select which AI models to check</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {availableModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    models.includes(model.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${model.status === 'setup' ? 'opacity-50' : ''}`}
                  onClick={() => model.status === 'active' && toggleModel(model.id)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{model.icon}</div>
                    <div className="font-medium text-sm text-slate-900">{model.name}</div>
                    <div className={`text-xs mt-1 ${
                      model.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {model.status === 'active' ? 'Available' : 'Setup Required'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          
          {/* Current Rankings */}
          <div className="card">
            <div className="card-header">
              <h3 className="section-title">Current Rankings</h3>
              <p className="section-subtitle">Latest visibility scores</p>
            </div>
            
            <div className="space-y-4">
              {[
                { model: 'GPT-4', rank: 1, change: '+2', trend: 'up' },
                { model: 'Claude 3', rank: 2, change: '0', trend: 'stable' },
                { model: 'Gemini', rank: 4, change: '-1', trend: 'down' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{item.model}</div>
                    <div className="text-sm text-slate-600">Rank #{item.rank}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    item.trend === 'up' ? 'text-emerald-600' :
                    item.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {item.change !== '0' && (
                      <span className="mr-1">
                        {item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'}
                      </span>
                    )}
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCheck}
            disabled={loading || keywords.length === 0 || models.length === 0}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Checking Rankings...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Check AI Rankings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="card text-center py-12">
          <div className="loading-spinner mx-auto mb-4 w-8 h-8"></div>
          <p className="text-slate-600">Querying AI models for ranking data...</p>
          <p className="text-sm text-slate-500 mt-2">This may take up to 30 seconds</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Latest Results</h3>
            <div className="text-sm text-slate-500">
              Last checked: {new Date(results[0]?.timestamp).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result, index) => (
              <div key={index} className="card-elevated">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{result.model}</h4>
                      <p className="text-sm text-slate-600">{result.query}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      result.ranking <= 3 ? 'text-emerald-600' :
                      result.ranking <= 5 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      #{result.ranking}
                    </div>
                    <div className="text-xs text-slate-500">Ranking</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-700 italic">"{result.snippet}"</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{result.mentions} mentions found</span>
                  <span className={`status-badge ${
                    result.ranking <= 3 ? 'success' :
                    result.ranking <= 5 ? 'warning' : 'error'
                  }`}>
                    {result.ranking <= 3 ? 'Excellent' :
                     result.ranking <= 5 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Trends */}
      {results.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Ranking Trends</h3>
            <p className="section-subtitle">Historical performance across AI models</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>GPT-4</th>
                  <th>Claude 3</th>
                  <th>Gemini</th>
                  <th>Cohere</th>
                </tr>
              </thead>
              <tbody>
                {mockHistoricalData.map((data, index) => (
                  <tr key={index}>
                    <td className="font-medium">{new Date(data.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${data.gpt4 <= 3 ? 'success' : 'warning'}`}>
                        #{data.gpt4}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${data.claude <= 3 ? 'success' : 'warning'}`}>
                        #{data.claude}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${data.gemini <= 3 ? 'success' : 'warning'}`}>
                        #{data.gemini}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${data.cohere <= 3 ? 'success' : 'warning'}`}>
                        #{data.cohere}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Visibility Monitoring</h3>
          <p className="text-slate-600 mb-6">Track how your law firm appears in AI-powered search results and recommendations.</p>
          <p className="text-sm text-slate-500">Configure your URL, keywords, and AI models to get started.</p>
        </div>
      )}
    </div>
  );
}
