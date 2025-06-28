import { useState } from 'react';
import axios from 'axios';

interface GeneratedContent {
  content: string;
  timestamp: string;
  platform?: string;
  tone?: string;
}

export default function CreativePlayground() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [error, setError] = useState<string | null>(null);

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
  ];

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'informative', name: 'Informative' },
    { id: 'empathetic', name: 'Empathetic' },
    { id: 'authoritative', name: 'Authoritative' },
  ];

  const templates = [
    {
      title: 'Legal Victory Announcement',
      prompt: 'Announce a recent legal victory for a personal injury case, emphasizing client care and successful outcome'
    },
    {
      title: 'Legal Tip of the Day',
      prompt: 'Share a practical legal tip for someone who has been in a car accident'
    },
    {
      title: 'Client Testimonial Feature',
      prompt: 'Create a post featuring a client testimonial about excellent legal representation'
    },
    {
      title: 'Legal Process Explanation',
      prompt: 'Explain the personal injury claim process in simple terms for potential clients'
    },
    {
      title: 'Community Support Post',
      prompt: 'Create a post showing support for the local San Francisco community'
    },
    {
      title: 'Legal News Commentary',
      prompt: 'Comment on a recent change in California personal injury law'
    }
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate content');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const enhancedPrompt = `Create a ${selectedTone} ${selectedPlatform} post for a personal injury law firm: ${prompt}`;
      
      const response = await axios.post(`${API_BASE}/social/generate`, {
        prompt: enhancedPrompt
      });

      if (response.data.success) {
        const newContent: GeneratedContent = {
          content: response.data.content,
          timestamp: new Date().toISOString(),
          platform: selectedPlatform,
          tone: selectedTone
        };
        
        setGeneratedContent(prev => [newContent, ...prev]);
        setPrompt('');
      } else {
        setError(response.data.error || 'Failed to generate content');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Unable to connect to content generation service');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Creative Playground</h1>
        <p className="text-slate-600 mt-1">AI-powered content generation for legal marketing</p>
      </div>

      {/* Content Generation Form */}
      <div className="card">
        <h2 className="section-title">Generate Content</h2>
        
        {/* Platform and Tone Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedPlatform === platform.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
            <select 
              value={selectedTone} 
              onChange={(e) => setSelectedTone(e.target.value)}
              className="select"
            >
              {tones.map(tone => (
                <option key={tone.id} value={tone.id}>{tone.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Content Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the content you want to generate..."
            className="textarea"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateContent}
          disabled={isGenerating || !prompt.trim()}
          className="btn-primary w-full md:w-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Content
            </>
          )}
        </button>
      </div>

      {/* Content Templates */}
      <div className="card">
        <h2 className="section-title">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
              <h3 className="font-medium text-slate-900 mb-2">{template.title}</h3>
              <p className="text-sm text-slate-600 mb-3">{template.prompt}</p>
              <button
                onClick={() => useTemplate(template.prompt)}
                className="btn-ghost text-sm"
              >
                Use Template
              </button>
            </div>
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

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <div className="card">
          <h2 className="section-title">Generated Content</h2>
          <div className="space-y-4">
            {generatedContent.map((content, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">
                      {platforms.find(p => p.id === content.platform)?.icon}
                      {platforms.find(p => p.id === content.platform)?.name}
                    </span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                      {content.tone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{formatTimestamp(content.timestamp)}</span>
                    <button
                      onClick={() => copyToClipboard(content.content)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-slate-800 whitespace-pre-wrap">{content.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedContent.length === 0 && !isGenerating && (
        <div className="card text-center py-12">
          <div className="text-slate-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No content generated yet</h3>
          <p className="text-slate-600">Use a template or write your own prompt to get started.</p>
        </div>
      )}
    </div>
  );
}
