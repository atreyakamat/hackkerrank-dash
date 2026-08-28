import React, { useState } from 'react';
import { BarChart3, Star, Zap, Trophy, ArrowRight, Users, ChevronRight } from 'lucide-react';

export default function PeerOverviewStrip({ profiles = [], activeUsername, onSelectProfile }) {
  const [metric, setMetric] = useState('solved'); // 'solved' or 'stars'

  if (!profiles || profiles.length === 0) return null;

  const sortedPeers = [...profiles].sort((a, b) => {
    if (metric === 'solved') return (b.totalSolved || 0) - (a.totalSolved || 0);
    return (b.totalStars || 0) - (a.totalStars || 0);
  });

  const maxVal = Math.max(...sortedPeers.map(p => metric === 'solved' ? (p.totalSolved || 0) : (p.totalStars || 0)), 1);

  return (
    <div className="hr-card p-5 space-y-4 bg-gradient-to-b from-[#182535] to-[#121B27] border border-[#263545]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263545]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Peer Group Coding Overview</span>
              <span className="text-[11px] font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.2 rounded-full border border-[#2EC866]/30">
                {profiles.length} Peers Added
              </span>
            </h3>
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 bg-[#0E141E] p-1 rounded-xl border border-[#263545] text-xs font-mono">
          <button
            onClick={() => setMetric('solved')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              metric === 'solved'
                ? 'bg-[#2EC866] text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Problems Solved
          </button>
          <button
            onClick={() => setMetric('stars')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              metric === 'stars'
                ? 'bg-[#2EC866] text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ Stars
          </button>
        </div>
      </div>

      {/* Mini Comparative Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedPeers.map((p, idx) => {
          const val = metric === 'solved' ? (p.totalSolved || 0) : (p.totalStars || 0);
          const pct = Math.min(100, Math.round((val / maxVal) * 100));
          const isCurrent = p.username.toLowerCase() === activeUsername?.toLowerCase();

          return (
            <button
              key={p.username}
              onClick={() => onSelectProfile(p.username)}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 group ${
                isCurrent
                  ? 'bg-[#2EC866]/10 border-[#2EC866] shadow-[0_0_12px_rgba(46,200,102,0.2)]'
                  : 'bg-[#0E141E] border-[#263545] hover:border-[#384d63] hover:bg-[#151F2C]'
              }`}
            >
              <div className="flex items-center justify-between w-full text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={p.avatar}
                    alt={p.username}
                    className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-[#2EC866]/40 shrink-0"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                  />
                  <div className="truncate">
                    <p className={`font-bold leading-tight truncate ${isCurrent ? 'text-[#00EA64]' : 'text-white'}`}>
                      {p.name || p.username}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">@{p.username}</p>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs shrink-0 text-white">
                  {metric === 'solved' ? `${val} solved` : `★ ${val}`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCurrent ? 'bg-[#00EA64]' : 'bg-[#2EC866]'
                  }`}
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
