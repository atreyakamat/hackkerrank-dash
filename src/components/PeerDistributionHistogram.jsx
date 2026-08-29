import React, { useMemo } from 'react';
import { BarChart2, Users, Layers } from 'lucide-react';

export default function PeerDistributionHistogram({ 
  profiles = [],
  onSelectPeer
}) {
  if (!profiles || profiles.length === 0) return null;

  const solvedValues = useMemo(() => {
    return profiles.map(p => ({
      username: p.username,
      name: p.name || p.username,
      solved: p.totalSolved ?? 0
    }));
  }, [profiles]);

  const maxSolved = Math.max(...solvedValues.map(p => p.solved), 1);

  // Dynamically calculate proportional buckets based on maximum problem count
  const bucketData = useMemo(() => {
    let buckets = [];

    if (maxSolved <= 25) {
      buckets = [
        { label: '0–5', min: 0, max: 5 },
        { label: '6–10', min: 6, max: 10 },
        { label: '11–15', min: 11, max: 15 },
        { label: '16–20', min: 16, max: 20 },
        { label: '21+', min: 21, max: Infinity }
      ];
    } else if (maxSolved <= 60) {
      buckets = [
        { label: '0–10', min: 0, max: 10 },
        { label: '11–25', min: 11, max: 25 },
        { label: '26–40', min: 26, max: 40 },
        { label: '41–60', min: 41, max: 60 },
        { label: '61+', min: 61, max: Infinity }
      ];
    } else {
      const step = Math.ceil(maxSolved / 4);
      buckets = [
        { label: `0–${step}`, min: 0, max: step },
        { label: `${step + 1}–${step * 2}`, min: step + 1, max: step * 2 },
        { label: `${step * 2 + 1}–${step * 3}`, min: step * 2 + 1, max: step * 3 },
        { label: `${step * 3 + 1}+`, min: step * 3 + 1, max: Infinity }
      ];
    }

    return buckets.map(b => {
      const matching = solvedValues.filter(p => p.solved >= b.min && p.solved <= b.max);
      return {
        ...b,
        count: matching.length,
        peers: matching,
        pct: Math.round((matching.length / (solvedValues.length || 1)) * 100)
      };
    });
  }, [solvedValues, maxSolved]);

  const maxCount = Math.max(...bucketData.map(b => b.count), 1);

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#263545]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1F2C3F] border border-[#263545] flex items-center justify-center text-[#00EA64]">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Cohort Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Concentration of members across problem brackets
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#0E141E] px-2.5 py-1 rounded-lg border border-[#263545] shrink-0 self-start sm:self-auto">
          <span>{profiles.length} total peers</span>
        </div>
      </div>

      {/* Histogram Bars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3 pt-2">
        {bucketData.map((bin, idx) => {
          const heightPct = Math.max(10, Math.round((bin.count / maxCount) * 100));
          return (
            <div 
              key={idx} 
              className="bg-[#0E141E] border border-[#263545] rounded-xl p-3 flex flex-col items-center justify-between space-y-2 font-mono"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{bin.count}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({bin.pct}%)
                </span>
              </div>

              {/* Vertical Bar Container */}
              <div className="h-20 sm:h-24 w-full bg-[#121B27] rounded-lg border border-[#263545]/60 p-1 flex items-end justify-center">
                <div
                  className="w-full bg-gradient-to-t from-[#00EA64]/40 to-[#00EA64] rounded transition-all duration-500"
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Range Bracket Label */}
              <div className="text-[11px] text-slate-300 font-bold text-center">
                {bin.label} <span className="text-[9px] text-slate-500 font-normal block">problems</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
