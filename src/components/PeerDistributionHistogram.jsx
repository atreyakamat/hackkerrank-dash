import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function PeerDistributionHistogram({ 
  profiles = [],
  onSelectPeer
}) {
  if (!profiles || profiles.length === 0) return null;

  const solvedValues = profiles.map(p => ({
    username: p.username,
    solved: p.totalSolved ?? 0
  }));

  const maxSolved = Math.max(...solvedValues.map(p => p.solved), 10);

  // Determine intuitive bucket ranges based on data
  let buckets = [];
  if (maxSolved <= 30) {
    buckets = [
      { label: '0–5', min: 0, max: 5 },
      { label: '6–10', min: 6, max: 10 },
      { label: '11–20', min: 11, max: 20 },
      { label: '21+', min: 21, max: Infinity }
    ];
  } else if (maxSolved <= 100) {
    buckets = [
      { label: '0–20', min: 0, max: 20 },
      { label: '21–50', min: 21, max: 50 },
      { label: '51–80', min: 51, max: 80 },
      { label: '81+', min: 81, max: Infinity }
    ];
  } else {
    buckets = [
      { label: '0–50', min: 0, max: 50 },
      { label: '51–100', min: 51, max: 100 },
      { label: '101–150', min: 101, max: 150 },
      { label: '151+', min: 151, max: Infinity }
    ];
  }

  const bucketData = buckets.map(b => {
    const matching = solvedValues.filter(p => p.solved >= b.min && p.solved <= b.max);
    return {
      ...b,
      count: matching.length,
      peers: matching
    };
  });

  const maxCount = Math.max(...bucketData.map(b => b.count), 1);

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#263545]">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Peer Distribution
          </h2>
          <p className="text-xs text-slate-400">
            Cohort concentration by problems solved
          </p>
        </div>
      </div>

      {/* Histogram Visualization */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        {bucketData.map((bin, idx) => {
          const heightPct = Math.max(8, Math.round((bin.count / maxCount) * 100));
          return (
            <div key={idx} className="flex flex-col items-center gap-2 font-mono">
              <div className="text-xs font-bold text-white">
                {bin.count} {bin.count === 1 ? 'peer' : 'peers'}
              </div>

              {/* Vertical Bar Container */}
              <div className="h-24 w-full bg-[#0E141E] rounded border border-[#263545] p-1 flex items-end justify-center">
                <div
                  className="w-full bg-[#00EA64] rounded transition-all duration-300"
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Bucket Label */}
              <div className="text-[11px] text-slate-400 font-semibold">
                {bin.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
