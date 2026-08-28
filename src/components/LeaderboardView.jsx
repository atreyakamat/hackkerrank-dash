import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  ArrowRight,
  Zap,
  Star,
  Award
} from 'lucide-react';

export default function LeaderboardView({ profiles = [], onSelectProfile }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('solved'); // 'solved', 'stars', 'points'

  const sortedProfiles = [...profiles].sort((a, b) => {
    if (sortBy === 'stars') return (b.totalStars || 0) - (a.totalStars || 0);
    if (sortBy === 'solved') return (b.totalSolved || 0) - (a.totalSolved || 0);
    if (sortBy === 'points') return (b.totalPoints || 0) - (a.totalPoints || 0);
    return 0;
  });

  const filtered = sortedProfiles.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#263545]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Peer Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cohort rankings based on verified HackerRank statistics
          </p>
        </div>

        {/* Sort Selector & Search */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1 bg-[#121B27] p-1 rounded-lg border border-[#263545]">
            {[
              { id: 'solved', label: 'Solved' },
              { id: 'stars', label: 'Stars' },
              { id: 'points', label: 'Points' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-3 py-1 rounded transition-colors ${
                  sortBy === s.id
                    ? 'bg-[#263545] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[140px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121B27] border border-[#263545] rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Clean Rank Rows */}
      <div className="border border-[#263545] bg-[#121B27] rounded-xl divide-y divide-[#263545]/60 font-mono text-xs">
        {filtered.map((p, idx) => {
          const rank = idx + 1;
          const solved = p.totalSolved ?? 0;
          const stars = p.totalStars ?? 0;
          const points = p.totalPoints ?? 0;

          return (
            <div
              key={p.username}
              onClick={() => onSelectProfile(p.username)}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#0E141E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-slate-500 font-bold w-6 text-right">
                  {rank}.
                </span>
                <span className="text-slate-200 group-hover:text-[#00EA64] font-medium transition-colors">
                  @{p.username}
                </span>
                {p.name && p.name !== p.username && (
                  <span className="text-slate-500 text-[11px] hidden sm:inline truncate">
                    ({p.name})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                <span className="text-slate-300">
                  <strong className="text-[#00EA64]">{solved}</strong> solved
                </span>
                <span className="text-slate-300">
                  <strong className="text-amber-400">★ {stars}</strong> stars
                </span>
                <span className="text-slate-300 hidden sm:inline">
                  <strong className="text-sky-400">{points}</strong> pts
                </span>
                <span className="text-[#00EA64] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
