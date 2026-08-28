import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Eye, 
  Flame, 
  Award, 
  Crown,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function LeaderboardView({ profiles = [], onSelectProfile }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stars'); // stars, solved, points

  // Sort profiles
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (sortBy === 'stars') return (b.totalStars || 0) - (a.totalStars || 0);
    if (sortBy === 'solved') return (b.totalSolved || 0) - (a.totalSolved || 0);
    if (sortBy === 'points') return (b.totalPoints || 0) - (a.totalPoints || 0);
    return 0;
  });

  const filtered = sortedProfiles.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.school?.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = sortedProfiles.slice(0, 3);

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/40', label: '1st 🥇' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-400/15 border-slate-400/40', label: '2nd 🥈' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-700', bg: 'bg-amber-700/15 border-amber-700/40', label: '3rd 🥉' };
    return { icon: Trophy, color: 'text-slate-500', bg: 'bg-[#0E141E] border-[#263545]', label: `#${rank}` };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cohort Leaderboard & Rankings
            </h1>
            <p className="text-xs text-slate-400">
              Real-time competitive ranking based on HackerRank stars, problem solving volume, and track scores
            </p>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
          <span className="text-[11px] font-mono text-slate-400 pl-2">Rank By:</span>
          {[
            { id: 'stars', label: '★ Stars' },
            { id: 'solved', label: 'Solved' },
            { id: 'points', label: 'Points' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                sortBy === s.id
                  ? 'bg-[#2EC866] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {topThree.map((p, idx) => {
            const rank = idx + 1;
            const rankMeta = getRankBadge(rank);
            const isWinner = rank === 1;

            return (
              <div
                key={p.username}
                onClick={() => onSelectProfile(p.username)}
                className={`cursor-pointer hr-card p-5 relative overflow-hidden transition-all group hover:scale-[1.02] ${
                  isWinner 
                    ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-[#151F2C] to-[#121B27] shadow-glow-gold' 
                    : 'border-[#263545] hover:border-[#2EC866]/50'
                }`}
              >
                {/* Rank Banner */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${rankMeta.bg} ${rankMeta.color}`}>
                    {rankMeta.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {p.customMeta?.batch || 'Batch 2025'}
                  </span>
                </div>

                {/* Candidate details */}
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={p.avatar}
                    alt={p.username}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2EC866]/60 bg-slate-800"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base group-hover:text-[#00EA64] transition-colors truncate">
                      {p.name || p.username}
                    </h3>
                    <p className="text-xs font-mono text-[#00EA64]">@{p.username}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-[#0E141E] p-2.5 rounded-xl border border-[#263545] text-center font-mono">
                  <div>
                    <p className="text-[10px] text-slate-400">STARS</p>
                    <p className="text-sm font-bold text-amber-400">★ {p.totalStars || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">SOLVED</p>
                    <p className="text-sm font-bold text-[#00EA64]">{p.totalSolved || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">POINTS</p>
                    <p className="text-sm font-bold text-white">{p.totalPoints || 0}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{p.school || 'Developer'}</span>
                  <span className="text-[#00EA64] flex items-center gap-1 font-semibold group-hover:underline">
                    <span>View</span>
                    <Eye className="w-3 h-3" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Full Cohort Roster ({filtered.length})</h3>
          
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search leaderboard..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#263545]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E141E] text-slate-400 font-mono uppercase text-[11px] border-b border-[#263545]">
              <tr>
                <th className="px-4 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-3 py-3 text-center">Stars</th>
                <th className="px-3 py-3 text-center">Problems Solved</th>
                <th className="px-3 py-3 text-center">Track Score</th>
                <th className="px-3 py-3">Primary Skills</th>
                <th className="px-4 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263545]/60 bg-[#151F2C]">
              {filtered.map((p, idx) => {
                const rank = idx + 1;
                const rankMeta = getRankBadge(rank);

                return (
                  <tr
                    key={p.username}
                    onClick={() => onSelectProfile(p.username)}
                    className="hover:bg-[#1E2A38] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${rankMeta.bg} ${rankMeta.color}`}>
                        {rankMeta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt={p.username}
                          className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-[#263545]"
                          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                        />
                        <div>
                          <p className="font-bold text-white group-hover:text-[#00EA64] transition-colors">
                            {p.name || p.username}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">@{p.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono font-bold text-amber-400">
                      ★ {p.totalStars || 0}
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono font-bold text-[#00EA64]">
                      {p.totalSolved || 0}
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono text-white">
                      {p.totalPoints || 0}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.badges?.slice(0, 3).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[10px] font-mono bg-[#0E141E] text-slate-300 px-2 py-0.2 rounded border border-[#263545]"
                          >
                            {b.badge_name} ({b.stars}★)
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button className="px-3 py-1 bg-[#2EC866]/10 hover:bg-[#2EC866] text-[#00EA64] hover:text-black font-bold rounded-lg text-xs transition-all border border-[#2EC866]/30">
                        View
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
