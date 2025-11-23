import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { analyzeText } from '../services/geminiService';
import { ApiService } from '../services/apiService'; // Replaces storageService
import { ThreatLevel, User } from '../types';
import AlertBanner from '../components/AlertBanner';

interface TextAnalysisProps {
  user: User;
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ level: ThreatLevel, reason: string } | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // 1. Get analysis (Logic can be here or on backend, here we use frontend Gemini)
      const analysis = await analyzeText(input);
      setResult(analysis);

      // 2. Send to Python Backend to save record
      // We are sending it to '/analyze/text' endpoint which saves to DB
      await fetch('http://localhost:5000/api/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: user.id, 
            text: input 
        })
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">NLP Threat Detection</h2>
        <p className="text-gray-400">Enter text below to detect violence or weapon indicators.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-1 shadow-2xl backdrop-blur-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste conversation log, witness statement, or chat report here..."
          className="w-full h-40 bg-gray-900/80 text-white p-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-lg placeholder:text-gray-600"
        />
        <div className="flex justify-end p-4 bg-gray-900/40 rounded-b-xl">
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </div>
      </div>

      <AlertBanner level={result?.level || null} message={result?.reason} />
    </div>
  );
};

export default TextAnalysis;