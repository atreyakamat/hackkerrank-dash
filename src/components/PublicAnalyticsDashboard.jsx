import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Star, 
  Trophy, 
  ArrowRight,
  Clock,
  Activity
} from 'lucide-react';
import PrimaryPeerBarGraph from './PrimaryPeerBarGraph';
import PeerDistributionHistogram from './PeerDistributionHistogram';
import GroupDomainAnalytics from './GroupDomainAnalytics';
import TrackedMembersDirectory from './TrackedMembersDirectory';
import IndividualPeerAnalytics from './IndividualPeerAnalytics';

function formatTimeAgo(isoString) {
  if (!isoString) return 'recently';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export default function PublicAnalyticsDashboard({ 
  profiles = [], 
  selectedPeerUsername,
  onSelectPeer 
}) {
  const selectedProfile = profiles.find(
    p => p.username.toLowerCase() === selectedPeerUsername?.toLowerCase()
  );

  // If a specific peer is selected, render individual analytics view
  if (selectedPeerUsername && selectedProfile) {
    return (
      <IndividualPeerAnalytics
        profile={selectedProfile}
        onBackToGroup={() => onSelectPeer(null)}
      />
    );
  }

  // Real data calculations
  const totalPeers = profiles.length;
  const totalSolved = profiles.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
  const totalStars = profiles.reduce((sum, p) => sum + (p.totalStars || 0), 0);
  const totalPoints = Math.round(profiles.reduce((sum, p) => sum + (p.totalPoints || 0), 0));
  const avgSolved = totalPeers > 0 ? (totalSolved / totalPeers).toFixed(1) : '0';

  // Latest sync timestamp across cohort
  const syncDates = profiles
    .map(p => p.lastSuccessfulSyncAt || p.lastSyncedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  const latestSync = syncDates[0] || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#263545]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Peer Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            HackerRank performance across the tracked cohort
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#121B27] px-3 py-1.5 rounded-lg border border-[#263545]">
          <Clock className="w-3.5 h-3.5 text-[#00EA64]" />
          <span>Updated {formatTimeAgo(latestSync)}</span>
        </div>
      </div>

      {/* 2. Section 1 — Compact Minimal Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121B27] border border-[#263545] p-3.5 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-2.5 px-2">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Peers</span>
          <span className="text-white font-bold text-sm ml-auto">{totalPeers}</span>
        </div>
        <div className="flex items-center gap-2.5 px-2 sm:border-l border-[#263545]">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Problems</span>
          <span className="text-[#00EA64] font-bold text-sm ml-auto">{totalSolved}</span>
        </div>
        <div className="flex items-center gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-[#263545] pt-2 sm:pt-0">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Stars</span>
          <span className="text-amber-400 font-bold text-sm ml-auto">★ {totalStars}</span>
        </div>
        <div className="flex items-center gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-[#263545] pt-2 sm:pt-0">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Avg Problems</span>
          <span className="text-sky-400 font-bold text-sm ml-auto">{avgSolved}</span>
        </div>
      </div>

      {/* 3. Section 2 — Main Graph: Peer Performance (Dominant Visual) */}
      <PrimaryPeerBarGraph
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

      {/* 4. Section 3 — Peer Distribution Histogram */}
      <PeerDistributionHistogram
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

      {/* 5. Section 4 — Skill Performance / Domain Analytics */}
      <GroupDomainAnalytics
        profiles={profiles}
      />

      {/* 6. Section 5 — Tracked Members Directory (Secondary Compact List) */}
      <TrackedMembersDirectory
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

    </div>
  );
}
