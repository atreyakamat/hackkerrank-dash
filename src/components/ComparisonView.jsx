import React, { useState } from 'react';
import { 
  GitCompare, 
  Users, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Zap, 
  ExternalLink, 
  ArrowRight, 
  Award,
  Crown,
  ChevronDown
} from 'lucide-react';

export default function ComparisonView({ profiles = [], defaultUser1, defaultUser2 }) {
  const [user1Key, setUser1Key] = useState(defaultUser1 || profiles[0]?.username || '');
  const [user2Key, setUser2Key] = useState(defaultUser2 || profiles[1]?.username || profiles[0]?.username || '');

  const user1 = profiles.find(p => p.username === user1Key) || profiles[0];
  const user2 = profiles.find(p => p.username === user2Key) || profiles[1] || profiles[0];

  if (!user1 || !user2) return null;

  // Comparison metrics
  const metrics = [
    {
      title: 'Total Stars Earned',
      val1: user1.totalStars || 0,
      val2: user2.totalStars || 0,
      format: (v) => `★ ${v}`,
      color: 'text-amber-400'
    },
    {
      title: 'Problems Solved',
      val1: user1.totalSolved || 0,
      val2: user2.totalSolved || 0,
      format: (v) => `${v} Solved`,
      color: 'text-[#00EA64]'
    },
    {
      title: 'Total Track Points',
      val1: user1.totalPoints || 0,
      val2: user2.totalPoints || 0,
      format: (v) => `${v} pts`,
      color: 'text-cyan-400'
    },
    {
      title: 'Active Skill Badges',
      val1: user1.badges?.length || 0,
      val2: user2.badges?.length || 0,
      format: (v) => `${v} Badges`,
      color: 'text-purple-400'
    }
  ];

  // Combined unique badge names across both
  const allBadgeNames = Array.from(new Set([
    ...(user1.badges || []).map(b => b.badge_name),
    ...(user2.badges || []).map(b => b.badge_name)
  ])).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
            <GitCompare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Side-by-Side Candidate Comparison
            </h1>
            <p className="text-xs text-slate-400">
              Benchmark coding performance, badge mastery, and skill depth between two candidates
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Selectors Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Candidate 1 */}
        <div className="hr-card p-5 border-l-4 border-l-[#2EC866]">
          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Candidate 1</label>
          <select
            value={user1Key}
            onChange={(e) => setUser1Key(e.target.value)}
            className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#2EC866]"
          >
            {profiles.map(p => (
              <option key={p.username} value={p.username}>
                {p.name || p.username} (@{p.username}) - ★ {p.totalStars || 0}
              </option>
            ))}
          </select>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={user1.avatar}
              alt={user1.username}
              className="w-12 h-12 rounded-xl object-cover border border-[#2EC866] bg-slate-800"
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user1.username}`; }}
            />
            <div>
              <h3 className="text-base font-bold text-white">{user1.name || user1.username}</h3>
              <p className="text-xs font-mono text-[#00EA64]">@{user1.username}</p>
              <p className="text-[11px] text-slate-400">{user1.school || 'Developer'}</p>
            </div>
          </div>
        </div>

        {/* Candidate 2 */}
        <div className="hr-card p-5 border-l-4 border-l-cyan-400">
          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Candidate 2</label>
          <select
            value={user2Key}
            onChange={(e) => setUser2Key(e.target.value)}
            className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
          >
            {profiles.map(p => (
              <option key={p.username} value={p.username}>
                {p.name || p.username} (@{p.username}) - ★ {p.totalStars || 0}
              </option>
            ))}
          </select>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={user2.avatar}
              alt={user2.username}
              className="w-12 h-12 rounded-xl object-cover border border-cyan-400 bg-slate-800"
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user2.username}`; }}
            />
            <div>
              <h3 className="text-base font-bold text-white">{user2.name || user2.username}</h3>
              <p className="text-xs font-mono text-cyan-400">@{user2.username}</p>
              <p className="text-[11px] text-slate-400">{user2.school || 'Developer'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Metrics Head-to-Head Comparison Bars */}
      <div className="hr-card p-5 sm:p-6 space-y-5">
        <h3 className="text-base font-bold text-white">Comparative Performance</h3>

        <div className="space-y-4">
          {metrics.map((m, idx) => {
            const total = Math.max(m.val1 + m.val2, 1);
            const p1 = Math.round((m.val1 / total) * 100);
            const p2 = 100 - p1;
            const u1Wins = m.val1 > m.val2;
            const u2Wins = m.val2 > m.val1;

            return (
              <div key={idx} className="bg-[#0E141E] p-4 rounded-xl border border-[#263545]">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-1.5">
                    {u1Wins && <Crown className="w-3.5 h-3.5 text-[#00EA64]" />}
                    <span className={`font-bold ${u1Wins ? 'text-[#00EA64]' : 'text-slate-300'}`}>
                      {m.format(m.val1)}
                    </span>
                  </div>

                  <span className="text-slate-400 font-sans font-semibold">{m.title}</span>

                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${u2Wins ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {m.format(m.val2)}
                    </span>
                    {u2Wins && <Crown className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>

                {/* Diff progress bar */}
                <div className="w-full h-3 bg-[#151F2C] rounded-full overflow-hidden flex border border-[#263545]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2EC866] to-[#00EA64] transition-all duration-500"
                    style={{ width: `${Math.max(5, p1)}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-500"
                    style={{ width: `${Math.max(5, p2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Stars Side-by-Side Breakdown Table */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Domain & Badge Mastery Comparison</h3>

        <div className="overflow-x-auto rounded-xl border border-[#263545]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E141E] text-slate-400 font-mono uppercase text-[11px] border-b border-[#263545]">
              <tr>
                <th className="px-4 py-3 text-left">Skill / Badge Domain</th>
                <th className="px-4 py-3 text-center text-[#00EA64]">@{user1.username}</th>
                <th className="px-4 py-3 text-center text-cyan-400">@{user2.username}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263545]/60 bg-[#151F2C]">
              {allBadgeNames.map((badgeName) => {
                const b1 = user1.badges?.find(b => b.badge_name === badgeName);
                const b2 = user2.badges?.find(b => b.badge_name === badgeName);

                return (
                  <tr key={badgeName} className="hover:bg-[#1E2A38] transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {badgeName}
                    </td>

                    {/* User 1 Badge */}
                    <td className="px-4 py-3 text-center font-mono">
                      {b1 ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#0E141E] px-2.5 py-1 rounded-lg border border-[#2EC866]/30">
                          <span className="text-amber-400 font-bold">★ {b1.stars}</span>
                          <span className="text-[10px] text-slate-400">({b1.solved || 0} solved)</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* User 2 Badge */}
                    <td className="px-4 py-3 text-center font-mono">
                      {b2 ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#0E141E] px-2.5 py-1 rounded-lg border border-cyan-500/30">
                          <span className="text-amber-400 font-bold">★ {b2.stars}</span>
                          <span className="text-[10px] text-slate-400">({b2.solved || 0} solved)</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
