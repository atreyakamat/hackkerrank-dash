import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  ArrowRight, 
  Star, 
  Zap, 
  Trophy, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function TrackedMembersDirectory({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('solved'); // 'solved', 'stars', 'points', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  if (!profiles || profiles.length === 0) return null;

  const filtered = profiles.filter(p => 
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.school && p.school.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortBy === 'solved') {
      valA = a.totalSolved ?? (a.badges?.reduce((sum, b) => sum + (b.solved || 0), 0) || 0);
      valB = b.totalSolved ?? (b.badges?.reduce((sum, b) => sum + (b.solved || 0), 0) || 0);
    } else if (sortBy === 'stars') {
      valA = a.totalStars ?? (a.badges?.reduce((sum, b) => sum + (b.stars || 0), 0) || 0);
      valB = b.totalStars ?? (b.badges?.reduce((sum, b) => sum + (b.stars || 0), 0) || 0);
    } else if (sortBy === 'points') {
      valA = a.totalPoints ?? (a.scores?.reduce((sum, s) => sum + (s.practice?.score || 0), 0) || 0);
      valB = b.totalPoints ?? (b.scores?.reduce((sum, s) => sum + (s.practice?.score || 0), 0) || 0);
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? (a.name || a.username).localeCompare(b.name || b.username)
        : (b.name || b.username).localeCompare(a.name || a.username);
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="hr-card p-5 sm:p-6 space-y-4 border border-[#263545] bg-[#121B27] shadow-xl">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263545]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tracked Member Directory</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {sorted.length} Members
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete index of tracked peers with performance stats and direct analytics link
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono"
          />
        </div>
      </div>

      {/* Compact Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-[#263545]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0E141E] text-slate-400 font-mono uppercase text-[11px] border-b border-[#263545]">
            <tr>
              <th className="px-4 py-3">
                <button 
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1 hover:text-white uppercase"
                >
                  <span>Member</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center">
                <button 
                  onClick={() => toggleSort('solved')}
                  className="flex items-center gap-1 mx-auto hover:text-white uppercase"
                >
                  <span>Solved</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center">
                <button 
                  onClick={() => toggleSort('stars')}
                  className="flex items-center gap-1 mx-auto hover:text-white uppercase"
                >
                  <span>Stars</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center">
                <button 
                  onClick={() => toggleSort('points')}
                  className="flex items-center gap-1 mx-auto hover:text-white uppercase"
                >
                  <span>Track Points</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center">Global Rank</th>
              <th className="px-4 py-3 text-right">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263545]/60 bg-[#121B27]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-mono">
                  No matching members found.
                </td>
              </tr>
            ) : (
              sorted.map((p) => {
                const solved = p.totalSolved ?? (p.badges?.reduce((s, b) => s + (b.solved || 0), 0) || 0);
                const stars = p.totalStars ?? (p.badges?.reduce((s, b) => s + (b.stars || 0), 0) || 0);
                const points = p.totalPoints ?? (p.scores?.reduce((s, sc) => s + (sc.practice?.score || 0), 0) || 0);
                const rank = p.bestRank || p.scores?.find(s => s.practice?.rank > 0)?.practice?.rank || null;

                return (
                  <tr 
                    key={p.username} 
                    onClick={() => onSelectPeer(p.username)}
                    className="hover:bg-[#151F2C] transition-colors cursor-pointer group"
                  >
                    
                    {/* Member Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.username}
                          className="w-8 h-8 rounded-full object-cover bg-slate-800 border border-[#263545]"
                          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                        />
                        <div className="truncate">
                          <p className="font-bold text-white group-hover:text-[#00EA64] transition-colors truncate">
                            {p.name || p.username}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            @{p.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Problems Solved */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-white">
                      <span className="text-[#00EA64]">{solved}</span>
                    </td>

                    {/* Stars */}
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ★ {stars}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-3 py-3 text-center font-mono text-slate-300">
                      {points}
                    </td>

                    {/* Global Rank */}
                    <td className="px-3 py-3 text-center font-mono text-slate-400">
                      {rank ? `#${rank.toLocaleString()}` : '—'}
                    </td>

                    {/* View Member Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPeer(p.username);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#151F2C] hover:bg-[#2EC866] hover:text-black text-slate-300 font-semibold rounded-lg border border-[#263545] transition-all text-xs"
                      >
                        <span>View Analytics</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
