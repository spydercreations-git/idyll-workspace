
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { AIInsight, Transaction } from '../types';
import { dbService } from '../services/db';
import { aiService } from '../services/geminiService';

interface InsightsPageProps {
  userId: string;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ userId }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = async (refresh = false) => {
    setLoading(true);
    try {
      const txs = await dbService.getTransactions(userId);
      setTransactions(txs);
      const aiInsights = await aiService.generateInsights(txs);
      setInsights(aiInsights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-slate-400">Intelligent analysis of your freelance finance in INR.</p>
          </div>
        </div>
        <button 
          onClick={() => loadData(true)}
          disabled={loading}
          className="px-6 py-3 bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> Refresh Intelligence
        </button>
      </header>

      {transactions.length < 5 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Sparkles className="mx-auto text-indigo-400 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Not enough data yet</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Our AI needs at least 5 transactions to start providing accurate financial insights and suggestions. Keep tracking!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02] ${
                insight.type === 'TIP' ? 'bg-emerald-500/10 border-emerald-500/20' :
                insight.type === 'WARNING' ? 'bg-rose-500/10 border-rose-500/20' :
                'bg-indigo-500/10 border-indigo-500/20'
              }`}
            >
              <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${
                insight.type === 'TIP' ? 'bg-emerald-500 text-white' :
                insight.type === 'WARNING' ? 'bg-rose-500 text-white' :
                'bg-indigo-500 text-white'
              }`}>
                {insight.type === 'TIP' && <Lightbulb size={24} />}
                {insight.type === 'WARNING' && <AlertCircle size={24} />}
                {insight.type === 'PREDICTION' && <TrendingUp size={24} />}
              </div>
              
              <h3 className="text-lg font-bold mb-3">
                {insight.type === 'TIP' ? 'Strategy Suggestion' :
                 insight.type === 'WARNING' ? 'Risk Alert' :
                 'Market Prediction'}
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                {insight.message}
              </p>

              {insight.value && (
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Projected</span>
                  <span className={`text-xl font-black ${
                    insight.type === 'TIP' ? 'text-emerald-400' :
                    insight.type === 'WARNING' ? 'text-rose-400' :
                    'text-indigo-400'
                  }`}>
                    {insight.value}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Monthly Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-400" />
            Profit Optimization
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 shrink-0 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">1</div>
              <p className="text-sm text-slate-300">Based on your editing time, you could increase rates by 15% for long-form video clients.</p>
            </li>
            <li className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 shrink-0 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">2</div>
              <p className="text-sm text-slate-300">You have 3 software subscriptions. Consider switching to annual billing to save ₹10,000/year.</p>
            </li>
          </ul>
        </div>
        
        <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 rounded-3xl">
          <h3 className="text-xl font-bold mb-6">Upcoming Trends</h3>
          <p className="text-slate-400 text-sm mb-6">Gemini has analyzed market demand in your sector (Thumbnail Design).</p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>YouTube CTR Focused Design</span>
                <span className="text-indigo-400">High Demand</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[90%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Vertical Video Editing</span>
                <span className="text-indigo-400">Increasing</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
