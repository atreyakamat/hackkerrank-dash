import React, { useState } from 'react';
import { 
  BarChart3, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function PrimaryPeerBarGraph({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [metric, setMetric] = useState('solved'); // 'solved', 'stars', 'points', 'badges'
  const [hoveredPeer, setHoveredPeer] = useState(null);

  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs border border-[#263545] rounded-xl bg-[#121B27]">
        No peer data available. Tracked profiles will appear here once added.
      </div>
    );
  }

  // 1. Map real peer data without hardcoding or biasing any user
  const peerList = profiles.map(p => {
    const solved = p.totalSolved ?? 0;
    const stars = p.totalStars ?? 0;
    const points = p.totalPoints ?? 0;
    const badges = p.badges?.length ?? 0;

    return {
      username: p.username,
      name: p.name || p.username,
      avatar: p.avatar,
      solved,
      stars,
      points,
      badges,
      lastSyncedAt: p.lastSyncedAt || p.lastSuccessfulSyncAt
    };
  });

  // 2. Strictly sort descending by selected metric
  const sorted = [...peerList].sort((a, b) => b[metric] - a[metric]);

  // Max value calculation for bar relative width
  const maxMetricValue = Math.max(...sorted.map(p => p[metric]), 1);

  const metricsConfig = [
    { id: 'solved', label: 'Problems Solved', short: 'Solved', unit: 'solved', icon: Zap, barColor: 'bg-[#00EA64]' },
    { id: 'stars', label: 'Stars', short: 'Stars', unit: '★', icon: Star, barColor: 'bg-amber-400' },
    { id: 'points', label: 'Track Score', short: 'Track Score', unit: 'pts', icon: Trophy, barColor: 'bg-sky-400' },
    { id: 'badges', label: 'Badges', short: 'Badges', unit: 'badges', icon: Award, barColor: 'bg-purple-400' }
  ];

  const currentConfig = metricsConfig.find(m => m.id === metric) || metricsConfig[0];

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-xl p-5 sm:p-6 space-y-6">
      
      {/* Graph Header with Title & Minimal Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#263545]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Peer Performance</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              — {currentConfig.label}
            </span>
          </h2>
        </div>

        {/* Minimal Metric Selector */}
        <div className="flex items-center gap-1 bg-[#0E141E] p-1 rounded-lg border border-[#263545] text-xs font-mono">
          {metricsConfig.map(m => {
            const isActive = metric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-3 py-1 rounded transition-colors ${
                  isActive
                    ? 'bg-[#263545] text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Bar Graph */}
      <div className="space-y-3 pt-1">
        {sorted.map((peer, idx) => {
          const rank = idx + 1;
          const val = peer[metric];
          const pct = Math.max(3, Math.round((val / maxMetricValue) * 100));
          const isHovered = hoveredPeer?.username === peer.username;

          return (
            <div
              key={peer.username}
              onMouseEnter={() => setHoveredPeer(peer)}
              onMouseLeave={() => setHoveredPeer(null)}
              onClick={() => onSelectPeer(peer.username)}
              className="group cursor-pointer rounded-lg p-2 hover:bg-[#0E141E] transition-colors relative"
            >
              {/* Row Header: Rank, Username, & Value */}
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-5 text-right font-semibold">
                    {rank}.
                  </span>
                  <span className="text-slate-200 group-hover:text-[#00EA64] font-medium transition-colors">
                    @{peer.username}
                  </span>
                  {peer.name && peer.name !== peer.username && (
                    <span className="text-slate-500 text-[11px] hidden sm:inline truncate max-w-[140px]">
                      ({peer.name})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span className={metric === 'stars' ? 'text-amber-400' : metric === 'points' ? 'text-sky-400' : 'text-[#00EA64]'}>
                    {metric === 'stars' && '★ '}
                    {val}
                  </span>
                  <span className="text-slate-500 text-[11px] font-normal">
                    {currentConfig.unit}
                  </span>
                </div>
              </div>

              {/* Bar Fill Track */}
              <div className="w-full h-3 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${currentConfig.barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Hover Tooltip Card */}
              {isHovered && (
                <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-16 bg-[#0E141E] border border-[#263545] shadow-2xl rounded-lg px-3 py-2 text-[11px] font-mono whitespace-nowrap pointer-events-none flex items-center gap-3">
                  <span className="font-bold text-white">@{peer.username}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#00EA64]">{peer.solved} solved</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-400">★ {peer.stars} stars</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sky-400">{peer.points} score</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
