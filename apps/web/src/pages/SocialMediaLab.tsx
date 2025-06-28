import { useState } from 'react';
import axios from 'axios';

export default function SocialMediaLab() {
  const [platform, setPlatform] = useState('twitter');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏', charLimit: 280 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', charLimit: 3000 },
    { id: 'facebook', name: 'Facebook', icon: '📘', charLimit: 2000 },
    { id: 'instagram', name: 'Instagram', icon: '📸', charLimit: 2200 }
  ];

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Formal and authoritative' },
    { id: 'conversational', name: 'Conversational', description: 'Approachable and friendly' },
    { id: 'empathetic', name: 'Empathetic', description: 'Compassionate and understanding' },
    { id: 'confident', name: 'Confident', description: 'Strong and assertive' }
  ];

  const templatePrompts = [
    "Personal injury lawyer celebrating a big win for their client",
    "Law firm sharing important legal updates about workers' rights",
    "Attorney providing tips for accident victims about what to do first",
    "Highlighting the importance of seeking immediate medical attention after an injury",
    "Explaining why you shouldn't accept the first insurance offer"
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.post('/api/social/generate', { 
        platform,
        topic,
        tone 
      });
      setResults(res.data);
    } catch (err) {
      console.error('Error generating content:', err);
      setResults(['Error generating content. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === platform);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Social Media Content Generator</h1>
        <p className="page-subtitle">Create engaging, professional social media content for your legal practice</p>
      </div>

      {/* Configuration Panel */}
      <div className="card">
        <div className="card-header">
          <h3 className="section-title">Content Configuration</h3>
          <p className="section-subtitle">Customize your content generation settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Platform</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    platform === p.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{p.charLimit} chars</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Tone</label>
            <div className="space-y-2">
              {tones.map((t) => (
                <label key={t.id} className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tone"
                    value={t.id}
                    checked={tone === t.id}
                    onChange={(e) => setTone(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-600">{t.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-3">
            Content Topic or Message
          </label>
          <textarea
            id="topic"
            className="textarea"
            rows={4}
            placeholder="Describe what you want to post about..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          
          {/* Template Prompts */}
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {templatePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(prompt)}
                  className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center text-sm text-slate-600">
              <span className="mr-2">📱</span>
              Optimized for {selectedPlatform?.name} ({selectedPlatform?.charLimit} character limit)
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="card text-center py-12">
          <div className="loading-spinner mx-auto mb-4 w-8 h-8"></div>
          <p className="text-slate-600">Creating engaging content for {selectedPlatform?.name}...</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Generated Content</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="status-badge success">{results.length} posts generated</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((text, i) => (
              <div key={i} className="card-elevated">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{selectedPlatform?.icon}</span>
                    <span className="status-badge info">Post {i + 1}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(text, i)}
                    className={`btn-ghost p-2 ${
                      copiedIndex === i ? 'text-emerald-600' : ''
                    }`}
                    title={copiedIndex === i ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {copiedIndex === i ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className={`${
                      text.length <= selectedPlatform!.charLimit ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {text.length} / {selectedPlatform?.charLimit} chars
                    </span>
                    <span className="text-slate-500">
                      {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="btn-ghost text-xs py-1 px-2">
                      Edit
                    </button>
                    <button className="btn-ghost text-xs py-1 px-2">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Create Content</h3>
          <p className="text-slate-600 mb-6">Choose your platform, set your tone, and describe what you want to post about.</p>
          <p className="text-sm text-slate-500">Your content will be optimized for engagement and professional legal communication.</p>
        </div>
      )}
    </div>
  );
}
