import React, { useState } from 'react';
import { 
  BarChart3, 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Layers, 
  Users, 
  ExternalLink,
  Award,
  Filter,
  Sparkles,
  Flame,
  Crown
} from 'lucide-react';

export default function PeerAnalyticsGraphs({ profiles = [], onSelectProfile, activeUsername }) {
  const [selectedMetric, setSelectedMetric] = useState('solved'); // solved, stars, points, badges
  const [tagFilter, setTagFilter] = useState('ALL');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Filter profiles by tag/batch if any
  const availableTags = ['ALL', ...new Set(profiles.map(p => p.customMeta?.batch).filter(Boolean))];
  
  const filteredProfiles = profiles.filter(p => 
    tagFilter === 'ALL' || p.customMeta?.batch === tagFilter
  );

  // Prepare data for Bar Graph: Solved Challenges across peers
  const peerData = filteredProfiles.map(p => ({
    name: p.name || p.username,
    username: p.username,
    solved: p.totalSolved || 0,
    stars: p.totalStars || 0,
    points: p.totalPoints || 0,
    badges: p.badges?.length || 0,
    avatar: p.avatar,
    isCurrent: p.username.toLowerCase() === activeUsername?.toLowerCase(),
    domainStars: {
      python: p.badges?.find(b => b.badge_type === 'python' || b.badge_name?.toLowerCase().includes('python'))?.stars || 0,
      cpp: p.badges?.find(b => b.badge_type === 'cpp' || b.badge_name?.toLowerCase().includes('c++'))?.stars || 0,
      java: p.badges?.find(b => b.badge_type === 'java' || b.badge_name?.toLowerCase().includes('java'))?.stars || 0,
      ps: p.badges?.find(b => b.badge_type === 'problem-solving' || b.badge_name?.toLowerCase().includes('problem'))?.stars || 0,
      sql: p.badges?.find(b => b.badge_type === 'sql' || b.badge_name?.toLowerCase().includes('sql'))?.stars || 0,
    }
  })).sort((a, b) => {
    if (selectedMetric === 'solved') return b.solved - a.solved;
    if (selectedMetric === 'stars') return b.stars - a.stars;
    if (selectedMetric === 'points') return b.points - a.points;
    return b.badges - a.badges;
  });

  const maxValue = Math.max(...peerData.map(p => p[selectedMetric]), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Peer Comparison & Visual Bar Graphs
            </h1>
            <p className="text-xs text-slate-400">
              Interactive bar graphs comparing coding problem volume, badge stars, and track scores across peers
            </p>
          </div>
        </div>

        {/* Group / Tag filter */}
        {availableTags.length > 2 && (
          <div className="flex items-center gap-2 bg-[#0E141E] p-1.5 rounded-xl border border-[#263545]">
            <span className="text-[11px] font-mono text-slate-400 pl-2">Filter Group:</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-[#151F2C] text-xs font-semibold text-white px-2.5 py-1 rounded-lg border border-[#263545] focus:outline-none focus:border-[#2EC866]"
            >
              {availableTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Comparative Bar Graph Card */}
      <div className="hr-card p-5 sm:p-6 space-y-5">
        
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#263545]/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Peer Benchmarking Bar Graph</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {peerData.length} Peers Tracked
              </span>
            </h3>
            <p className="text-xs text-slate-400">Click any peer bar to inspect their full individual profile and dashboard</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
            {[
              { id: 'solved', label: 'Problems Solved', icon: Zap },
              { id: 'stars', label: '★ Total Stars', icon: Star },
              { id: 'points', label: 'Track Points', icon: Trophy },
              { id: 'badges', label: 'Skill Badges', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedMetric === tab.id
                    ? 'bg-[#2EC866] text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-[#151F2C]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Horizontal / Vertical Bar Chart */}
        <div className="space-y-3.5 pt-2">
          {peerData.map((peer, idx) => {
            const val = peer[selectedMetric];
            const pct = Math.min(100, Math.round((val / maxValue) * 100));
            const isWinner = idx === 0;
            const isHovered = hoveredBar === peer.username;

            return (
              <div
                key={peer.username}
                onClick={() => onSelectProfile(peer.username)}
                onMouseEnter={() => setHoveredBar(peer.username)}
                onMouseLeave={() => setHoveredBar(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  peer.isCurrent
                    ? 'bg-[#2EC866]/10 border-[#2EC866] shadow-[0_0_15px_rgba(46,200,102,0.15)]'
                    : 'bg-[#0E141E] border-[#263545] hover:border-[#384d63] hover:bg-[#151F2C]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-2">
                  
                  {/* Peer Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#151F2C] border border-[#263545] flex items-center justify-center font-mono font-bold text-[11px] text-slate-300 shrink-0">
                      {isWinner ? '🥇' : `#${idx + 1}`}
                    </div>
                    <img
                      src={peer.avatar}
                      alt={peer.username}
                      className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-[#2EC866]/40 shrink-0"
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                    />
                    <div className="truncate">
                      <span className="font-bold text-white group-hover:text-[#00EA64] transition-colors mr-2">
                        {peer.name}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">@{peer.username}</span>
                    </div>
                  </div>

                  {/* Metric Value Label */}
                  <div className="text-right shrink-0 font-mono">
                    <span className={`text-sm font-bold ${peer.isCurrent ? 'text-[#00EA64]' : 'text-white'}`}>
                      {selectedMetric === 'solved' && `${val} Solved`}
                      {selectedMetric === 'stars' && `★ ${val} Stars`}
                      {selectedMetric === 'points' && `${val} pts`}
                      {selectedMetric === 'badges' && `${val} Badges`}
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div className="w-full h-3 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60 flex">
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

        {/* Active Highlight Banner */}
        {activeUsername && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E141E] border border-[#263545] text-xs font-mono">
            <span className="text-slate-400">
              Active Peer: <span className="text-[#00EA64] font-bold">@{activeUsername}</span>
            </span>
            <span className="text-slate-400">
              Click any bar to switch profile
            </span>
          </div>
        )}

      </div>

      {/* Second Card: Domain Star Mastery Breakdown Bar Graph */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 rounded-lg border border-amber-500/30 text-amber-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Domain Star Depth across Peers (Python, C++, Java, Problem Solving, SQL)
              </h3>
              <p className="text-xs text-slate-400">Breakdown of domain star achievements for each peer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {peerData.map((peer) => (
            <div
              key={peer.username}
              onClick={() => onSelectProfile(peer.username)}
              className="p-4 rounded-xl bg-[#0E141E] border border-[#263545] hover:border-[#2EC866]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={peer.avatar}
                    alt={peer.username}
                    className="w-6 h-6 rounded-full bg-slate-800 border border-[#263545]"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                  />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#00EA64] transition-colors">{peer.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">@{peer.username}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ★ {peer.stars} Total
                </span>
              </div>

              {/* Star Domains Bars */}
              <div className="space-y-2 text-[11px] font-mono">
                {[
                  { label: 'Python', stars: peer.domainStars.python, max: 5, color: 'bg-sky-400' },
                  { label: 'C++', stars: peer.domainStars.cpp, max: 5, color: 'bg-blue-400' },
                  { label: 'Java', stars: peer.domainStars.java, max: 5, color: 'bg-orange-400' },
                  { label: 'Problem Solving', stars: peer.domainStars.ps, max: 6, color: 'bg-[#00EA64]' },
                  { label: 'SQL', stars: peer.domainStars.sql, max: 5, color: 'bg-red-400' }
                ].map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 w-24 truncate">{d.label}</span>
                    <div className="flex-1 h-2 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/40">
                      <div
                        className={`h-full ${d.color} rounded-full`}
                        style={{ width: `${(d.stars / d.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-amber-400 font-bold w-8 text-right">
                      {d.stars > 0 ? `${d.stars}★` : '—'}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
