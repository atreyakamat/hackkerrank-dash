import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  ArrowRight, 
  Star, 
  Zap, 
  Trophy, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function TrackedMembersDirectory({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('solved'); // 'solved', 'stars', 'points', 'name'
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...profiles].sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = (a.name || a.username).toLowerCase();
        valB = (b.name || b.username).toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'stars') {
        valA = a.totalStars ?? 0;
        valB = b.totalStars ?? 0;
      } else if (sortField === 'points') {
        valA = Number(a.totalPoints ?? 0);
        valB = Number(b.totalPoints ?? 0);
      } else {
        valA = a.totalSolved ?? 0;
        valB = b.totalSolved ?? 0;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [profiles, sortField, sortAsc]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase().trim();
    return sorted.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.customMeta?.batch?.toLowerCase().includes(q) ||
      p.school?.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!profiles || profiles.length === 0) return null;

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263545]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1F2C3F] border border-[#263545] flex items-center justify-center text-purple-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Member Directory
            </h3>
            <p className="text-xs text-slate-400">
              Complete cohort roster ({profiles.length} tracked members)
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00EA64]"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#263545]/80 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Member</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-2.5 px-3 text-right">
                <button 
                  onClick={() => handleSort('solved')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white transition-colors"
                >
                  <span>Solved</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-2.5 px-3 text-right">
                <button 
                  onClick={() => handleSort('stars')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white transition-colors"
                >
                  <span>Stars</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-2.5 px-3 text-right">
                <button 
                  onClick={() => handleSort('points')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white transition-colors"
                >
                  <span>Points</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">Batch</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263545]/60">
            {filtered.map((peer, idx) => {
              const solved = peer.totalSolved ?? 0;
              const stars = peer.totalStars ?? 0;
              const points = Number(peer.totalPoints ?? 0);

              return (
                <tr
                  key={peer.username}
                  onClick={() => onSelectPeer(peer.username)}
                  className="hover:bg-[#0E141E] transition-colors cursor-pointer group"
                >
                  {/* Member info */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={peer.avatar}
                        alt={peer.username}
                        className="w-7 h-7 rounded-full bg-slate-800 object-cover border border-[#263545] shrink-0"
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white group-hover:text-[#00EA64] transition-colors block truncate max-w-[140px] sm:max-w-[200px]">
                          {peer.name || peer.username}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          @{peer.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Solved */}
                  <td className="py-3 px-3 text-right font-bold text-[#00EA64]">
                    {solved}
                  </td>

                  {/* Stars */}
                  <td className="py-3 px-3 text-right font-bold text-amber-400">
                    ★ {stars}
                  </td>

                  {/* Points */}
                  <td className="py-3 px-3 text-right font-bold text-sky-400">
                    {points}
                  </td>

                  {/* Batch / Meta */}
                  <td className="py-3 px-3 text-right hidden md:table-cell text-slate-400 text-[11px]">
                    {peer.customMeta?.batch || 'Core Group'}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F2C3F] text-slate-300 group-hover:bg-[#00EA64] group-hover:text-black font-bold text-[10px] transition-all">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
