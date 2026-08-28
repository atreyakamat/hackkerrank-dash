import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  Layers, 
  HelpCircle, 
  TrendingUp,
  PieChart
} from 'lucide-react';

export default function PeerDistributionHistogram({ 
  profiles = [],
  onSelectPeer
}) {
  const [hoveredBin, setHoveredBin] = useState(null);

  if (!profiles || profiles.length === 0) return null;

  // Extract solved problems for all peers
  const solvedValues = profiles.map(p => ({
    username: p.username,
    name: p.name || p.username,
    solved: p.totalSolved ?? (p.badges?.reduce((s, b) => s + (b.solved || 0), 0) || 0),
    avatar: p.avatar
  }));

  const maxSolved = Math.max(...solvedValues.map(p => p.solved), 50);

  // Dynamic Bucket Generation based on data range
  const createBuckets = () => {
    if (maxSolved <= 30) {
      return [
        { label: '0–5 Solved', min: 0, max: 5 },
        { label: '6–10 Solved', min: 6, max: 10 },
        { label: '11–20 Solved', min: 11, max: 20 },
        { label: '21–30 Solved', min: 21, max: 30 },
        { label: '31+ Solved', min: 31, max: Infinity }
      ];
    } else if (maxSolved <= 100) {
      return [
        { label: '0–15 Solved', min: 0, max: 15 },
        { label: '16–30 Solved', min: 16, max: 30 },
        { label: '31–50 Solved', min: 31, max: 50 },
        { label: '51–75 Solved', min: 51, max: 75 },
        { label: '76+ Solved', min: 76, max: Infinity }
      ];
    } else if (maxSolved <= 300) {
      return [
        { label: '0–50 Solved', min: 0, max: 50 },
        { label: '51–100 Solved', min: 51, max: 100 },
        { label: '101–150 Solved', min: 101, max: 150 },
        { label: '151–200 Solved', min: 151, max: 200 },
        { label: '201+ Solved', min: 201, max: Infinity }
      ];
    } else {
      return [
        { label: '0–50 Solved', min: 0, max: 50 },
        { label: '51–150 Solved', min: 51, max: 150 },
        { label: '151–300 Solved', min: 151, max: 300 },
        { label: '301–500 Solved', min: 301, max: 500 },
        { label: '501+ Solved', min: 501, max: Infinity }
      ];
    }
  };

  const rawBuckets = createBuckets();
  const bucketData = rawBuckets.map(b => {
    const matchingPeers = solvedValues.filter(p => p.solved >= b.min && p.solved <= b.max);
    return {
      ...b,
      count: matchingPeers.length,
      percentage: Math.round((matchingPeers.length / solvedValues.length) * 100),
      peers: matchingPeers
    };
  });

  const maxCount = Math.max(...bucketData.map(b => b.count), 1);
  const dominantBucket = [...bucketData].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="hr-card p-5 sm:p-6 space-y-5 border border-[#263545] bg-[#121B27] shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#263545]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/15 rounded-lg border border-sky-500/30 text-sky-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Peer Distribution Histogram</span>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                Problems Solved Frequency
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribution curve showing where the majority of the peer group stands
            </p>
          </div>
        </div>

        {/* Analytical Insight Pill */}
        {dominantBucket && (
          <div className="px-3 py-1.5 bg-[#0E141E] border border-[#263545] rounded-xl text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Cohort Peak:</span>
            <span className="font-bold text-[#00EA64]">{dominantBucket.label} ({dominantBucket.percentage}%)</span>
          </div>
        )}
      </div>

      {/* Histogram Bars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {bucketData.map((bin, idx) => {
          const heightPct = Math.max(12, Math.round((bin.count / maxCount) * 100));
          const isPeak = dominantBucket?.label === bin.label && bin.count > 0;
          const isHovered = hoveredBin?.label === bin.label;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredBin(bin)}
              onMouseLeave={() => setHoveredBin(null)}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all relative ${
                isHovered
                  ? 'bg-[#151F2C] border-[#00EA64] shadow-lg shadow-[#00EA64]/10'
                  : isPeak
                  ? 'bg-[#0E141E] border-sky-500/40'
                  : 'bg-[#0E141E] border-[#263545]'
              }`}
            >
              {/* Top: Bin Range */}
              <div className="text-center pb-2">
                <span className="text-[11px] font-mono font-bold text-slate-300 block truncate">
                  {bin.label}
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {bin.count} {bin.count === 1 ? 'Peer' : 'Peers'}
                </span>
              </div>

              {/* Center: Vertical Fill Bar */}
              <div className="h-28 w-full bg-[#151F2C] rounded-lg p-1 flex items-end justify-center border border-[#263545]/50">
                <div
                  className={`w-full rounded-md transition-all duration-700 flex items-center justify-center ${
                    isPeak
                      ? 'bg-gradient-to-t from-sky-600 via-sky-400 to-[#00EA64]'
                      : 'bg-gradient-to-t from-[#263545] to-[#2EC866]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                >
                  {bin.count > 0 && (
                    <span className="text-[10px] font-mono font-bold text-black px-1">
                      {bin.percentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Peer Avatars Preview */}
              <div className="pt-2 flex items-center justify-center -space-x-1.5 overflow-hidden min-h-[26px]">
                {bin.peers.slice(0, 4).map(p => (
                  <img
                    key={p.username}
                    src={p.avatar}
                    alt={p.username}
                    title={`@${p.username} (${p.solved} solved)`}
                    onClick={() => onSelectPeer(p.username)}
                    className="w-5 h-5 rounded-full border border-[#0E141E] object-cover cursor-pointer hover:scale-125 transition-transform"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                  />
                ))}
                {bin.peers.length > 4 && (
                  <span className="text-[9px] font-mono font-bold text-slate-400 pl-1">
                    +{bin.peers.length - 4}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Detail Panel */}
      {hoveredBin && hoveredBin.peers.length > 0 && (
        <div className="p-3.5 bg-[#0E141E] rounded-xl border border-[#263545] text-xs font-mono space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Peers in range <strong className="text-white">{hoveredBin.label}</strong> ({hoveredBin.peers.length}):</span>
            <span className="text-[#00EA64] font-bold">{hoveredBin.percentage}% of cohort</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {hoveredBin.peers.map(p => (
              <button
                key={p.username}
                onClick={() => onSelectPeer(p.username)}
                className="px-2.5 py-1 bg-[#151F2C] hover:bg-[#2EC866] hover:text-black rounded-lg border border-[#263545] text-white transition-all flex items-center gap-1.5"
              >
                <span>@{p.username}</span>
                <span className="text-[10px] text-slate-400 font-bold">({p.solved} solved)</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
