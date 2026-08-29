import React, { useState } from 'react';
import { 
  BarChart3, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function PrimaryPeerBarGraph({ 
  profiles = [], 
  onSelectPeer 
}) {
  const [metric, setMetric] = useState('solved'); // 'solved', 'stars', 'points', 'badges'
  const [hoveredPeer, setHoveredPeer] = useState(null);

  if (!profiles || profiles.length === 0) {
    return null;
  }

  // 1. Map real peer data without hardcoding or biasing any user
  const peerList = profiles.map(p => {
    const solved = p.totalSolved ?? 0;
    const stars = p.totalStars ?? 0;
    const points = Number(p.totalPoints ?? 0);
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
    { id: 'solved', label: 'Problems Solved', short: 'Solved', unit: 'solved', icon: Zap, barColor: 'bg-[#00EA64]', textColor: 'text-[#00EA64]' },
    { id: 'stars', label: 'Stars', short: 'Stars', unit: '★', icon: Star, barColor: 'bg-amber-400', textColor: 'text-amber-400' },
    { id: 'points', label: 'Track Score', short: 'Track Score', unit: 'pts', icon: Trophy, barColor: 'bg-sky-400', textColor: 'text-sky-400' },
    { id: 'badges', label: 'Badges', short: 'Badges', unit: 'badges', icon: Award, barColor: 'bg-purple-400', textColor: 'text-purple-400' }
  ];

  const currentConfig = metricsConfig.find(m => m.id === metric) || metricsConfig[0];

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-2xl p-4 sm:p-6 space-y-5">
      
      {/* Header with Title & Minimal Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#263545]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1F2C3F] border border-[#263545] flex items-center justify-center text-[#00EA64]">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Member Performance Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparative cohort breakdown by {currentConfig.label.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center bg-[#0E141E] p-1 rounded-xl border border-[#263545] text-xs font-mono self-start sm:self-auto">
          {metricsConfig.map(m => {
            const isActive = metric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#1F2C3F] text-white font-bold border border-[#263545]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Comparative Bar Chart */}
      <div className="space-y-3 pt-1">
        {sorted.map((peer, idx) => {
          const rank = idx + 1;
          const val = peer[metric];
          const pct = Math.max(3, Math.round((val / maxMetricValue) * 100));

          return (
            <div
              key={peer.username}
              onMouseEnter={() => setHoveredPeer(peer)}
              onMouseLeave={() => setHoveredPeer(null)}
              onClick={() => onSelectPeer(peer.username)}
              className="group cursor-pointer rounded-xl p-2.5 sm:p-3 hover:bg-[#0E141E] border border-transparent hover:border-[#263545] transition-all relative font-mono"
            >
              {/* Top Row: Rank, Username, Metric Value */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-slate-500 w-5 text-right font-bold text-xs">
                    {rank}.
                  </span>
                  <img
                    src={peer.avatar}
                    alt={peer.username}
                    className="w-5 h-5 rounded-full bg-slate-800 object-cover border border-[#263545] shrink-0"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`; }}
                  />
                  <span className="text-slate-200 group-hover:text-[#00EA64] font-medium transition-colors truncate max-w-[140px] sm:max-w-[200px]">
                    @{peer.username}
                  </span>
                  {peer.name && peer.name !== peer.username && (
                    <span className="text-slate-500 text-[11px] hidden sm:inline truncate max-w-[120px]">
                      ({peer.name})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-bold shrink-0">
                  <span className={currentConfig.textColor}>
                    {metric === 'stars' && '★ '}
                    {val}
                  </span>
                  <span className="text-slate-500 text-[10px] font-normal">
                    {currentConfig.unit}
                  </span>
                </div>
              </div>

              {/* Bar Fill Track */}
              <div className="w-full h-3 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]/60 p-0.5 flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${currentConfig.barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
