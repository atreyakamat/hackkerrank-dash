import React, { useState } from 'react';
import { 
  BarChart3, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  ArrowRight, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PrimaryPeerBarGraph({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [metric, setMetric] = useState('solved'); // 'solved', 'stars', 'points', 'badges'
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPeer, setHoveredPeer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-8 hr-card text-center text-slate-400 font-mono text-xs">
        No peer data available.
      </div>
    );
  }

  // 1. Map real peer data without hardcoding or biasing any user
  const peerList = profiles.map(p => {
    const solved = p.totalSolved ?? (p.badges?.reduce((sum, b) => sum + (b.solved || 0), 0) || 0);
    const stars = p.totalStars ?? (p.badges?.reduce((sum, b) => sum + (b.stars || 0), 0) || 0);
    const points = p.totalPoints ?? (p.scores?.reduce((sum, s) => sum + (s.practice?.score || 0), 0) || 0);
    const badges = p.badges?.length || 0;
    const bestRank = p.bestRank || p.scores?.find(s => s.practice?.rank > 0)?.practice?.rank || null;

    return {
      username: p.username,
      name: p.name || p.username,
      avatar: p.avatar,
      school: p.school || 'Developer',
      country: p.country || '',
      solved,
      stars,
      points,
      badges,
      bestRank,
      domainList: (p.badges || []).map(b => `${b.badge_name} (${b.stars}★)`).slice(0, 4)
    };
  });

  // 2. Filter by search query
  const filtered = peerList.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Strictly sort descending by selected metric
  const sorted = [...filtered].sort((a, b) => b[metric] - a[metric]);

  // Max value calculation for bar relative width
  const maxMetricValue = Math.max(...sorted.map(p => p[metric]), 1);

  // Pagination for large groups
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedPeers = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const metricLabels = {
    solved: { title: 'Problems Solved', unit: 'Solved', icon: Zap, color: 'from-[#2EC866] to-[#00EA64]' },
    stars: { title: 'Total Stars', unit: '★ Stars', icon: Star, color: 'from-amber-500 to-amber-300' },
    points: { title: 'Track Points', unit: 'pts', icon: Trophy, color: 'from-cyan-500 to-emerald-400' },
    badges: { title: 'Skill Badges', unit: 'Badges', icon: Award, color: 'from-purple-500 to-indigo-400' }
  };

  const currentMeta = metricLabels[metric];

  return (
    <div className="hr-card p-5 sm:p-6 space-y-5 border border-[#263545] bg-[#121B27] shadow-xl">
      
      {/* Controls Bar: Metric Selector, Search, & Count */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#263545]/60">
        
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Peer Performance Comparison</span>
                <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2.5 py-0.5 rounded-full border border-[#2EC866]/30">
                  {sorted.length} Peers
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by {currentMeta.title.toLowerCase()} across all tracked group members
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Input */}
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono"
            />
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
            {[
              { id: 'solved', label: 'Solved', icon: Zap },
              { id: 'stars', label: '★ Stars', icon: Star },
              { id: 'points', label: 'Points', icon: Trophy },
              { id: 'badges', label: 'Badges', icon: Award }
            ].map(m => {
              const Icon = m.icon;
              const isActive = metric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMetric(m.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-[#2EC866] text-black font-extrabold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-[#151F2C]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Primary Horizontal Bar Graph Rows */}
      <div className="space-y-2.5 pt-1">
        {paginatedPeers.map((peer, idx) => {
          const globalRankIndex = (currentPage - 1) * itemsPerPage + idx + 1;
          const val = peer[metric];
          const pct = Math.min(100, Math.round((val / maxMetricValue) * 100));
          const isTop3 = globalRankIndex <= 3;
          const rankEmoji = globalRankIndex === 1 ? '🥇' : globalRankIndex === 2 ? '🥈' : globalRankIndex === 3 ? '🥉' : null;

          return (
            <div
              key={peer.username}
              onMouseEnter={() => setHoveredPeer(peer)}
              onMouseLeave={() => setHoveredPeer(null)}
              onClick={() => onSelectPeer(peer.username)}
              className="p-3 sm:p-3.5 rounded-xl border bg-[#0E141E] border-[#263545] hover:border-[#2EC866]/60 hover:bg-[#151F2C] transition-all cursor-pointer group relative"
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-2">
                
                {/* Left: Rank, Avatar, & Peer Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 border ${
                    globalRankIndex === 1
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : globalRankIndex === 2
                      ? 'bg-slate-300/20 text-slate-200 border-slate-400/40'
                      : globalRankIndex === 3
                      ? 'bg-amber-700/20 text-amber-400 border-amber-600/40'
                      : 'bg-[#151F2C] text-slate-400 border-[#263545]'
                  }`}>
                    {rankEmoji || `#${globalRankIndex}`}
                  </div>

                  <img
                    src={peer.avatar}
                    alt={peer.username}
                    className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-[#263545] shrink-0"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                  />

                  <div className="truncate flex items-baseline gap-2">
                    <span className="font-bold text-white group-hover:text-[#00EA64] transition-colors truncate">
                      {peer.name}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] shrink-0">
                      @{peer.username}
                    </span>
                  </div>
                </div>

                {/* Right: Metric Value & Action */}
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-xs sm:text-sm font-black text-white group-hover:text-[#00EA64] transition-colors">
                    {metric === 'solved' && `${val} Solved`}
                    {metric === 'stars' && `★ ${val} Stars`}
                    {metric === 'points' && `${val} pts`}
                    {metric === 'badges' && `${val} Badges`}
                  </span>
                  <div className="p-1 rounded-md bg-[#151F2C] text-slate-500 group-hover:text-[#00EA64] group-hover:bg-[#2EC866]/10 transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/50 flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${currentMeta.color}`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls if > itemsPerPage */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-[#263545]/60 text-xs font-mono text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} peers
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 disabled:opacity-40 rounded-lg border border-[#263545] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 disabled:opacity-40 rounded-lg border border-[#263545] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Micro Analytics Caption */}
      <div className="text-right text-[11px] text-slate-500 font-mono">
        💡 Click on any peer bar to inspect their detailed analytics breakdown
      </div>

    </div>
  );
}
