import React, { useState, useEffect } from 'react';
import { BarChart3, X, RefreshCw } from 'lucide-react';
import type { AnalyticsData } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesEscapeCount: number;
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalVisitors: 42,
  totalWasteAttempts: 38,
  totalRejectedWaste: 38,
  successfulClaims: 0,
  failedClaims: 38,
  averageUserPatienceSec: 4.2,
  yesButtonEscapes: 129,
};

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, yesEscapeCount }) => {
  const [data, setData] = useState<AnalyticsData>(DEFAULT_ANALYTICS);

  useEffect(() => {
    const stored = localStorage.getItem('useless_waste_analytics');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({
          ...parsed,
          yesButtonEscapes: parsed.yesButtonEscapes + yesEscapeCount
        });
      } catch {
        // fallback default
      }
    }
  }, [yesEscapeCount, isOpen]);

  const handleReset = () => {
    localStorage.removeItem('useless_waste_analytics');
    setData(DEFAULT_ANALYTICS);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border-4 border-slate-900 rounded-3xl shadow-cartoon-xl overflow-hidden font-mono">
        
        {/* Header */}
        <div className="px-6 py-4 bg-yellow-300 border-b-4 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-mono font-black text-slate-950 uppercase tracking-wider">
            <BarChart3 className="w-5 h-5 text-slate-950" />
            <span>UNNECESSARY COMIC SYSTEM ANALYTICS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-950 hover:bg-yellow-400 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            
            <div className="bg-amber-100 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">Total Visitors</span>
              <div className="text-3xl font-black text-slate-950 mt-1">{data.totalVisitors}</div>
            </div>

            <div className="bg-yellow-200 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">Waste Attempts</span>
              <div className="text-3xl font-black text-slate-950 mt-1">{data.totalWasteAttempts}</div>
            </div>

            <div className="bg-red-200 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">Total Rejected</span>
              <div className="text-3xl font-black text-red-600 mt-1">{data.totalRejectedWaste}</div>
            </div>

            <div className="bg-emerald-100 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">Successful Claims</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{data.successfulClaims}</div>
              <span className="text-[9px] text-slate-600 font-bold block">Always 0%</span>
            </div>

            <div className="bg-pink-100 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">Failed Claims</span>
              <div className="text-3xl font-black text-pink-600 mt-1">{data.failedClaims}</div>
            </div>

            <div className="bg-cyan-100 p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon-sm">
              <span className="text-[10px] text-slate-700 font-black uppercase">YES Button Escapes</span>
              <div className="text-3xl font-black text-cyan-600 mt-1">{data.yesButtonEscapes}</div>
            </div>

          </div>

          {/* Comedic Disclaimer */}
          <div className="p-3 bg-yellow-300 border-3 border-slate-900 rounded-2xl text-center text-xs text-slate-950 font-black italic shadow-cartoon-sm">
            "These statistics are completely unnecessary & officially audited by the Bin Tribunal."
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t-3 border-slate-900">
            <button
              onClick={handleReset}
              className="text-xs text-slate-700 hover:text-slate-950 font-black flex items-center gap-1 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reset Stats
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-slate-950 text-xs font-black rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

