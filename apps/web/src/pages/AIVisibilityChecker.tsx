// src/pages/AIVisibilityChecker.tsx
import Breadcrumb from '../components/Breadcrumb';

export default function AIVisibilityChecker() {
  return (
    <div>
      <Breadcrumb pageTitle="AI Ranking Monitor" />
      
      <div className="card">
        <h2 className="section-title">AI Model Rankings</h2>
        <p className="text-np-black mb-4">
          Track how Northpoint Trial Law ranks across different AI models when users ask about personal injury lawyers in San Francisco.
        </p>
        
        <div className="bg-np-gray rounded-lg p-4">
          <p className="text-sm text-np-black">
            <strong>Feature:</strong> This tool will automatically query multiple AI models (GPT-4, Claude, Gemini, Cohere) and track Northpoint's ranking position.
          </p>
          <p className="text-sm text-np-gray italic mt-2">
            Coming soon - AI ranking data visualization and alerts
          </p>
        </div>
      </div>
    </div>
  );
}
