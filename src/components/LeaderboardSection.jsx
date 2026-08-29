import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Zap, 
  Star, 
  Award, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Medal,
  ChevronRight
} from 'lucide-react';

export default function LeaderboardSection({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [activeMetric, setActiveMetric] = useState('solved'); // 'solved', 'stars', 'points'
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredUser, setHoveredUser] = useState(null);

  // 1. Process & strictly sort by selected metric dynamically
  const sortedProfiles = useMemo(() => {
    const list = profiles.map(p => {
      const solved = p.totalSolved ?? 0;
      const stars = p.totalStars ?? 0;
      const points = Number(p.totalPoints ?? 0);
      const badgesCount = p.badges?.length ?? 0;
      const activeTracksCount = p.activeTracks?.length ?? 0;

      return {
        ...p,
        solved,
        stars,
        points,
        badgesCount,
        activeTracksCount
      };
    });

    return list.sort((a, b) => {
      if (activeMetric === 'solved') {
        if (b.solved !== a.solved) return b.solved - a.solved;
        if (b.stars !== a.stars) return b.stars - a.stars;
        return b.points - a.points;
      }
      if (activeMetric === 'stars') {
        if (b.stars !== a.stars) return b.stars - a.stars;
        if (b.solved !== a.solved) return b.solved - a.solved;
        return b.points - a.points;
      }
      if (activeMetric === 'points') {
        if (b.points !== a.points) return b.points - a.points;
        if (b.solved !== a.solved) return b.solved - a.solved;
        return b.stars - a.stars;
      }
      return 0;
    });
  }, [profiles, activeMetric]);

  // Filter based on search
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return sortedProfiles;
    const q = searchQuery.toLowerCase().trim();
    return sortedProfiles.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.customMeta?.batch?.toLowerCase().includes(q)
    );
  }, [sortedProfiles, searchQuery]);

  // Metric configurations
  const metricConfigs = [
    { 
      id: 'solved', 
      label: 'Problems Solved', 
      short: 'Solved', 
      unit: 'problems', 
      icon: Zap, 
      color: 'text-[#00EA64]', 
      barColor: 'bg-[#00EA64]', 
      badgeBg: 'bg-[#00EA64]/10 border-[#00EA64]/30 text-[#00EA64]' 
    },
    { 
      id: 'stars', 
      label: 'Total Stars', 
      short: 'Stars', 
      unit: 'stars', 
      icon: Star, 
      color: 'text-amber-400', 
      barColor: 'bg-amber-400', 
      badgeBg: 'bg-amber-400/10 border-amber-400/30 text-amber-400' 
    },
    { 
      id: 'points', 
      label: 'Track Score', 
      short: 'Points', 
      unit: 'pts', 
      icon: Trophy, 
      color: 'text-sky-400', 
      barColor: 'bg-sky-400', 
      badgeBg: 'bg-sky-400/10 border-sky-400/30 text-sky-400' 
    }
  ];

  const currentMetric = metricConfigs.find(m => m.id === activeMetric) || metricConfigs[0];
  const maxMetricVal = Math.max(...sortedProfiles.map(p => p[activeMetric]), 1);

  // Top 3 Podium Winners
  const top1 = sortedProfiles[0];
  const top2 = sortedProfiles[1];
  const top3 = sortedProfiles[2];

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-2xl p-4 sm:p-6 lg:p-7 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00EA64]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#263545]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F2C3F] border border-[#00EA64]/40 flex items-center justify-center text-[#00EA64]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Live Cohort Leaderboard</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ranked dynamically by verified HackerRank {currentMetric.label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Metric Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Metric Switcher Tabs */}
          <div className="flex items-center bg-[#0E141E] p-1 rounded-xl border border-[#263545] text-xs font-mono">
            {metricConfigs.map(m => {
              const Icon = m.icon;
              const isActive = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all touch-manipulation ${
                    isActive
                      ? 'bg-[#1F2C3F] text-white shadow-sm border border-[#263545]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? m.color : 'text-slate-500'}`} />
                  <span>{m.short}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00EA64] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Top 3 Podium Highlights (Minimalist, Responsive) */}
      {!searchQuery && sortedProfiles.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 1st Place */}
          {top1 && (
            <div 
              onClick={() => onSelectPeer(top1.username)}
              className="group cursor-pointer bg-gradient-to-b from-amber-500/10 via-[#151F2C] to-[#121B27] border border-amber-500/30 hover:border-amber-400/60 rounded-xl p-4 transition-all relative overflow-hidden flex items-center justify-between sm:flex-col sm:items-center sm:text-center sm:order-2"
            >
              <div className="absolute top-2 right-2 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center gap-1">
                <span>🥇 1st</span>
              </div>
              <div className="flex items-center sm:flex-col gap-3">
                <img 
                  src={top1.avatar} 
                  alt={top1.username}
                  className="w-12 h-12 rounded-full border-2 border-amber-400 bg-slate-800 object-cover"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${top1.username}`; }}
                />
                <div className="text-left sm:text-center">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[140px]">
                    {top1.name || top1.username}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">@{top1.username}</p>
                </div>
              </div>
              <div className="text-right sm:text-center mt-0 sm:mt-2.5">
                <div className="text-base font-black text-amber-400 font-mono">
                  {activeMetric === 'stars' && '★ '}
                  {top1[activeMetric]} <span className="text-xs font-normal text-slate-400">{currentMetric.unit}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {top1.solved} solved • ★{top1.stars} • {top1.points} pts
                </div>
              </div>
            </div>
          )}

          {/* 2nd Place */}
          {top2 && (
            <div 
              onClick={() => onSelectPeer(top2.username)}
              className="group cursor-pointer bg-gradient-to-b from-slate-400/10 via-[#151F2C] to-[#121B27] border border-slate-400/30 hover:border-slate-300/60 rounded-xl p-4 transition-all relative overflow-hidden flex items-center justify-between sm:flex-col sm:items-center sm:text-center sm:order-1"
            >
              <div className="absolute top-2 right-2 text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-400/10 border border-slate-400/30 rounded-full flex items-center gap-1">
                <span>🥈 2nd</span>
              </div>
              <div className="flex items-center sm:flex-col gap-3">
                <img 
                  src={top2.avatar} 
                  alt={top2.username}
                  className="w-11 h-11 rounded-full border-2 border-slate-400 bg-slate-800 object-cover"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${top2.username}`; }}
                />
                <div className="text-left sm:text-center">
                  <h4 className="text-sm font-bold text-white group-hover:text-slate-300 transition-colors truncate max-w-[140px]">
                    {top2.name || top2.username}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">@{top2.username}</p>
                </div>
              </div>
              <div className="text-right sm:text-center mt-0 sm:mt-2.5">
                <div className="text-base font-black text-slate-200 font-mono">
                  {activeMetric === 'stars' && '★ '}
                  {top2[activeMetric]} <span className="text-xs font-normal text-slate-400">{currentMetric.unit}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {top2.solved} solved • ★{top2.stars} • {top2.points} pts
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div 
              onClick={() => onSelectPeer(top3.username)}
              className="group cursor-pointer bg-gradient-to-b from-amber-700/10 via-[#151F2C] to-[#121B27] border border-amber-700/30 hover:border-amber-600/60 rounded-xl p-4 transition-all relative overflow-hidden flex items-center justify-between sm:flex-col sm:items-center sm:text-center sm:order-3"
            >
              <div className="absolute top-2 right-2 text-amber-600 font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-700/10 border border-amber-700/30 rounded-full flex items-center gap-1">
                <span>🥉 3rd</span>
              </div>
              <div className="flex items-center sm:flex-col gap-3">
                <img 
                  src={top3.avatar} 
                  alt={top3.username}
                  className="w-11 h-11 rounded-full border-2 border-amber-700 bg-slate-800 object-cover"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${top3.username}`; }}
                />
                <div className="text-left sm:text-center">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors truncate max-w-[140px]">
                    {top3.name || top3.username}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">@{top3.username}</p>
                </div>
              </div>
              <div className="text-right sm:text-center mt-0 sm:mt-2.5">
                <div className="text-base font-black text-amber-500 font-mono">
                  {activeMetric === 'stars' && '★ '}
                  {top3[activeMetric]} <span className="text-xs font-normal text-slate-400">{currentMetric.unit}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {top3.solved} solved • ★{top3.stars} • {top3.points} pts
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Full Roster Leaderboard Table with Integrated Visual Bars */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between px-3 pb-2 border-b border-[#263545]/60 uppercase tracking-wider text-[11px]">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Member</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-12">
            <span className="hidden sm:inline w-24 text-right">Progress</span>
            <span className="w-20 text-right">Score / Rank</span>
            <span className="w-6 text-right hidden sm:inline"></span>
          </div>
        </div>

        {filteredProfiles.map((peer, idx) => {
          const rank = idx + 1;
          const val = peer[activeMetric];
          const pct = Math.max(4, Math.round((val / maxMetricVal) * 100));
          const isTop3 = rank <= 3;
          const isHovered = hoveredUser === peer.username;

          const rankBadge = 
            rank === 1 ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' :
            rank === 2 ? 'bg-slate-300/20 text-slate-200 border-slate-300/40' :
            rank === 3 ? 'bg-amber-700/20 text-amber-500 border-amber-700/40' :
            'bg-[#1F2C3F] text-slate-400 border-[#263545]';

          return (
            <div
              key={peer.username}
              onMouseEnter={() => setHoveredUser(peer.username)}
              onMouseLeave={() => setHoveredUser(null)}
              onClick={() => onSelectPeer(peer.username)}
              className="group cursor-pointer rounded-xl p-3 sm:p-3.5 bg-[#0E141E] hover:bg-[#151F2C] border border-[#263545] hover:border-[#00EA64]/50 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 font-mono">
                
                {/* Left: Rank, Avatar, Name, Username */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${rankBadge}`}>
                    {rank}
                  </span>

                  <img
                    src={peer.avatar}
                    alt={peer.username}
                    className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-[#263545] shrink-0"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00EA64] transition-colors truncate">
                        {peer.name || peer.username}
                      </span>
                      {peer.customMeta?.batch && (
                        <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-[#1F2C3F] text-slate-400 border border-[#263545]">
                          {peer.customMeta.batch}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      @{peer.username}
                    </p>
                  </div>
                </div>

                {/* Center: Inline Visual Comparison Bar (Tablet / Desktop) */}
                <div className="hidden sm:flex items-center gap-3 w-40 md:w-56 shrink-0">
                  <div className="w-full h-2.5 bg-[#1F2C3F] rounded-full overflow-hidden border border-[#263545]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${currentMetric.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 w-8 text-right shrink-0">
                    {pct}%
                  </span>
                </div>

                {/* Right: Key Values & Action */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <div className={`text-sm sm:text-base font-black ${currentMetric.color}`}>
                      {activeMetric === 'stars' && '★ '}
                      {val}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1.5">
                      <span>{peer.solved} slv</span>
                      <span>•</span>
                      <span>★{peer.stars}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{peer.points} pts</span>
                    </div>
                  </div>

                  <div className="w-6 flex justify-end text-slate-500 group-hover:text-[#00EA64] group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>

              {/* Mobile Visual Bar (Below row on small screens) */}
              <div className="sm:hidden mt-2.5 pt-2 border-t border-[#263545]/60 flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#1F2C3F] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${currentMetric.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{pct}%</span>
              </div>

            </div>
          );
        })}

        {filteredProfiles.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-mono text-xs border border-[#263545] rounded-xl bg-[#0E141E]">
            No members match your search filter.
          </div>
        )}
      </div>

    </div>
  );
}
