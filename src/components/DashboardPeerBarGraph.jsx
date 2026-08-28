import React, { useState } from 'react';
import { 
  BarChart3, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  Crown, 
  ArrowRight, 
  Users, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function DashboardPeerBarGraph({ 
  profiles = [], 
  activeUsername, 
  onSelectProfile 
}) {
  const [selectedMetric, setSelectedMetric] = useState('solved'); // 'solved', 'stars', 'points', 'badges'

  if (!profiles || profiles.length === 0) return null;

  // Prepare peer list sorted by the selected metric
  const sortedPeers = [...profiles].map(p => ({
    name: p.name || p.username,
    username: p.username,
    solved: p.totalSolved || 0,
    stars: p.totalStars || 0,
    points: p.totalPoints || 0,
    badges: p.badges?.length || 0,
    avatar: p.avatar,
    school: p.school || 'Developer',
    isCurrent: p.username.toLowerCase() === activeUsername?.toLowerCase(),
  })).sort((a, b) => {
    if (selectedMetric === 'solved') return b.solved - a.solved;
    if (selectedMetric === 'stars') return b.stars - a.stars;
    if (selectedMetric === 'points') return b.points - a.points;
    return b.badges - a.badges;
  });

  const maxVal = Math.max(...sortedPeers.map(p => p[selectedMetric]), 1);

  return (
    <div className="hr-card p-5 sm:p-6 space-y-5 bg-gradient-to-b from-[#182535] to-[#121B27] border border-[#263545] shadow-xl">
      
      {/* Header & Metric Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#263545]/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Peer Comparison Bar Graph</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {profiles.length} Peers Added
              </span>
            </h3>
            <p className="text-xs text-slate-400">Live comparative performance across all added HackerRank profiles</p>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
          {[
            { id: 'solved', label: 'Problems Solved', icon: Zap },
            { id: 'stars', label: '★ Stars', icon: Star },
            { id: 'points', label: 'Track Points', icon: Trophy },
            { id: 'badges', label: 'Badges', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                selectedMetric === tab.id
                  ? 'bg-[#2EC866] text-black font-bold shadow-md shadow-[#2EC866]/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#151F2C]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comparative Bar Chart Visualization */}
      <div className="space-y-3 pt-1">
        {sortedPeers.map((peer, idx) => {
          const val = peer[selectedMetric];
          const pct = Math.min(100, Math.round((val / maxVal) * 100));
          const isWinner = idx === 0;

          return (
            <div
              key={peer.username}
              onClick={() => onSelectProfile(peer.username)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                peer.isCurrent
                  ? 'bg-[#2EC866]/10 border-[#2EC866] shadow-[0_0_15px_rgba(46,200,102,0.2)]'
                  : 'bg-[#0E141E] border-[#263545] hover:border-[#384d63] hover:bg-[#151F2C]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-2">
                
                {/* Peer Rank & Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                    isWinner 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                      : 'bg-[#151F2C] text-slate-400 border border-[#263545]'
                  }`}>
                    {isWinner ? '🥇' : `#${idx + 1}`}
                  </div>
                  
                  <img
                    src={peer.avatar}
                    alt={peer.username}
                    className="w-7 h-7 rounded-full object-cover bg-slate-800 border border-[#2EC866]/40 shrink-0"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                  />

                  <div className="truncate">
                    <span className={`font-bold transition-colors mr-2 ${peer.isCurrent ? 'text-[#00EA64]' : 'text-white group-hover:text-[#00EA64]'}`}>
                      {peer.name}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">@{peer.username}</span>
                  </div>
                </div>

                {/* Stat value & Action indicator */}
                <div className="text-right shrink-0 font-mono flex items-center gap-2">
                  <span className={`text-sm font-bold ${peer.isCurrent ? 'text-[#00EA64]' : 'text-white'}`}>
                    {selectedMetric === 'solved' && `${val} Solved`}
                    {selectedMetric === 'stars' && `★ ${val} Stars`}
                    {selectedMetric === 'points' && `${val} pts`}
                    {selectedMetric === 'badges' && `${val} Badges`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00EA64] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Animated Horizontal Progress Bar */}
              <div className="w-full h-3.5 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60 flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    peer.isCurrent 
                      ? 'bg-gradient-to-r from-[#2EC866] via-[#00EA64] to-[#FFFFFF] shadow-[0_0_8px_rgba(0,234,100,0.8)]' 
                      : isWinner
                      ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                      : 'bg-gradient-to-r from-[#2EC866] to-[#00EA64]'
                  }`}
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper caption */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
        <span>Active Peer Highlighted: <span className="text-[#00EA64] font-bold">@{activeUsername}</span></span>
        <span className="hidden sm:inline">Click any peer bar above to switch profile</span>
      </div>

    </div>
  );
}
