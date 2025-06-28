import { useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';

export default function SocialMediaLab() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.post('/api/social/generate', { prompt });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      // You could add error state handling here if needed
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div>
      <Breadcrumb pageTitle="Tweet Generator" />

      {/* Input Section */}
      <div className="bg-np-white rounded-lg shadow-md p-6 mb-8">
        <label htmlFor="prompt" className="block text-sm font-medium text-np-black mb-2 font-instrument">
          Enter your prompt
        </label>
        <textarea
          id="prompt"
          className="w-full border border-np-gray rounded-lg p-4 focus:ring-2 focus:ring-np-blue focus:border-transparent resize-none text-np-black"
          rows={4}
          placeholder="e.g., A personal injury lawyer celebrating a big win for their client..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-4 bg-np-blue text-np-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-np-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            'Generate Captions'
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-np-gray rounded-lg p-8 mb-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-np-blue mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-np-black font-medium">Generating your captions...</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-np-black mb-4 font-instrument">Generated Captions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((text, i) => (
              <div key={i} className="bg-np-white rounded-lg shadow-md border border-np-gray p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-np-blue text-xs font-medium px-2.5 py-0.5 rounded">
                    Caption {i + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(text, i)}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedIndex === i
                        ? 'bg-green-100 text-green-600'
                        : 'bg-np-gray text-np-black hover:bg-gray-200'
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
                <p className="text-np-black leading-relaxed">{text}</p>
                <div className="mt-4 pt-4 border-t border-np-gray">
                  <span className="text-sm text-np-gray italic mb-2">
                    {text.length} characters
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && prompt && (
        <div className="bg-np-gray rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-np-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="text-np-black">No captions generated yet. Click "Generate Captions" to get started!</p>
        </div>
      )}
    </div>
  );
}
