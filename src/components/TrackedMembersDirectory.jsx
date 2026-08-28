import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function TrackedMembersDirectory({ 
  profiles = [], 
  onSelectPeer 
}) {
  if (!profiles || profiles.length === 0) return null;

  // Sort descending by solved count by default
  const sorted = [...profiles].sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#263545]">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Tracked Members
          </h2>
          <p className="text-xs text-slate-400">
            {sorted.length} peers in this analytics group
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#263545]/60">
        {sorted.map(peer => {
          const solved = peer.totalSolved ?? 0;
          const stars = peer.totalStars ?? 0;
          const points = peer.totalPoints ?? 0;

          return (
            <div
              key={peer.username}
              onClick={() => onSelectPeer(peer.username)}
              className="py-3 flex items-center justify-between gap-4 font-mono text-xs hover:bg-[#0E141E] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-slate-200 group-hover:text-[#00EA64] font-medium transition-colors">
                  @{peer.username}
                </span>
                {peer.name && peer.name !== peer.username && (
                  <span className="text-slate-500 text-[11px] hidden sm:inline truncate">
                    ({peer.name})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                <span className="text-slate-300">
                  <strong className="text-[#00EA64]">{solved}</strong> solved
                </span>
                <span className="text-slate-300 hidden sm:inline">
                  <strong className="text-amber-400">★ {stars}</strong> stars
                </span>
                <span className="text-slate-300 hidden md:inline">
                  <strong className="text-sky-400">{points}</strong> pts
                </span>
                <span className="text-[#00EA64] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
