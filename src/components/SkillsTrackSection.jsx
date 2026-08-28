import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Database, 
  Cpu, 
  Binary, 
  TrendingUp, 
  Search, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function SkillsTrackSection({ scores = [], badges = [], username }) {
  const [filter, setFilter] = useState('all'); // all, active, languages, core
  const [search, setSearch] = useState('');

  // Map known tracks with friendly icon, domain category and max baseline
  const getTrackMeta = (track) => {
    const name = track.name || track.slug || '';
    const nameLower = name.toLowerCase();

    if (nameLower.includes('python') || nameLower.includes('cpp') || nameLower.includes('c++') || nameLower.includes('java') || nameLower.includes('ruby') || nameLower.includes('c')) {
      return {
        category: 'Language Proficiency',
        icon: Code2,
        color: 'text-sky-400',
        barColor: 'from-sky-500 to-emerald-400',
        maxEstimate: 250
      };
    }
    if (nameLower.includes('sql') || nameLower.includes('database')) {
      return {
        category: 'Data & Databases',
        icon: Database,
        color: 'text-amber-400',
        barColor: 'from-amber-500 to-orange-400',
        maxEstimate: 300
      };
    }
    if (nameLower.includes('algorithm') || nameLower.includes('data structure') || nameLower.includes('math') || nameLower.includes('problem')) {
      return {
        category: 'Core CS & Problem Solving',
        icon: Binary,
        color: 'text-[#00EA64]',
        barColor: 'from-[#2EC866] to-[#00EA64]',
        maxEstimate: 500
      };
    }
    return {
      category: 'Specialized Domains',
      icon: Terminal,
      color: 'text-purple-400',
      barColor: 'from-purple-500 to-indigo-400',
      maxEstimate: 200
    };
  };

  const processedTracks = scores.map(track => {
    const meta = getTrackMeta(track);
    const score = track.practice?.score || 0;
    const rank = track.practice?.rank;
    const badgeMatch = badges.find(b => b.badge_name?.toLowerCase() === track.name?.toLowerCase() || b.badge_type?.toLowerCase() === track.slug?.toLowerCase());

    return {
      ...track,
      meta,
      score,
      rank,
      stars: badgeMatch?.stars || 0,
      solved: badgeMatch?.solved || 0,
      isActive: score > 0 || (rank && rank > 0) || (badgeMatch && badgeMatch.stars > 0)
    };
  });

  const filtered = processedTracks.filter(t => {
    // Search query
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase())) return false;

    if (filter === 'active') return t.isActive;
    if (filter === 'languages') return t.meta.category === 'Language Proficiency';
    if (filter === 'core') return t.meta.category === 'Core CS & Problem Solving';
    return true;
  });

  return (
    <div className="hr-card p-5 sm:p-6 space-y-4">
      
      {/* Header with Search and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Skills & Domain Breakdown</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {processedTracks.filter(t => t.isActive).length} Active Tracks
              </span>
            </h3>
            <p className="text-xs text-slate-400">HackerRank practice scores and global leaderboard rankings</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
          {[
            { id: 'all', label: 'All Domains' },
            { id: 'active', label: 'Active Only' },
            { id: 'languages', label: 'Languages' },
            { id: 'core', label: 'Core CS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === tab.id
                  ? 'bg-[#2EC866] text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#151F2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {filtered.map((track, idx) => {
          const Icon = track.meta.icon;
          const pct = Math.min(100, Math.round((track.score / track.meta.maxEstimate) * 100));

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-[#0E141E] border ${
                track.isActive ? 'border-[#263545] hover:border-[#2EC866]/50' : 'border-[#1E2A38] opacity-70'
              } transition-all duration-200 group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-[#151F2C] border border-[#263545] ${track.meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00EA64] transition-colors flex items-center gap-2">
                        <span>{track.name}</span>
                        {track.stars > 0 && (
                          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            ★ {track.stars}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{track.meta.category}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      {track.score} pts
                    </span>
                    {track.rank && (
                      <p className="text-[10px] font-mono text-slate-400">
                        Rank #{track.rank.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="w-full h-1.5 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60">
                    <div
                      className={`h-full bg-gradient-to-r ${track.meta.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(track.score > 0 ? 8 : 0, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1E2A38] flex items-center justify-between text-[11px] text-slate-400">
                <span>{track.solved > 0 ? `${track.solved} challenges solved` : 'Skill Track'}</span>
                <a
                  href={`https://www.hackerrank.com/domains/${track.slug || track.name.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#00EA64] flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Practice</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
