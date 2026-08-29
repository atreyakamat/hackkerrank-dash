import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Zap, 
  Star, 
  Clock, 
  BarChart3, 
  Code2, 
  Layers, 
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import LeaderboardSection from './LeaderboardSection';
import PrimaryPeerBarGraph from './PrimaryPeerBarGraph';
import PeerDistributionHistogram from './PeerDistributionHistogram';
import GroupDomainAnalytics from './GroupDomainAnalytics';
import TrackedMembersDirectory from './TrackedMembersDirectory';
import PublicMemberDetailModal from './PublicMemberDetailModal';
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
  const [inspectProfile, setInspectProfile] = useState(null);

  const selectedProfile = profiles.find(
    p => p.username.toLowerCase() === selectedPeerUsername?.toLowerCase()
  );

  // If a specific peer is deep-linked, render full individual analytics drill-down
  if (selectedPeerUsername && selectedProfile) {
    return (
      <IndividualPeerAnalytics
        profile={selectedProfile}
        onBackToGroup={() => onSelectPeer(null)}
      />
    );
  }

  // Aggregate stats from real Supabase data
  const totalMembers = profiles.length;
  const totalSolved = profiles.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
  const totalStars = profiles.reduce((sum, p) => sum + (p.totalStars || 0), 0);
  const totalPoints = Math.round(profiles.reduce((sum, p) => sum + Number(p.totalPoints || 0), 0));
  const avgSolved = totalMembers > 0 ? (totalSolved / totalMembers).toFixed(1) : '0';

  // Latest sync timestamp across cohort
  const syncDates = profiles
    .map(p => p.lastSuccessfulSyncAt || p.lastSyncedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  const latestSync = syncDates[0] || null;

  const handleInspectPeer = (username) => {
    const found = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setInspectProfile(found);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header & Live Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#263545]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HackkerRank <span className="text-[#00EA64]">Dashboard</span>
          </h1>
        </div>

        {/* Real Sync Metadata Pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#121B27] px-3.5 py-2 rounded-xl border border-[#263545] shrink-0 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-[#00EA64]" />
          <span>Last Synced: <strong className="text-white font-bold">{formatTimeAgo(latestSync)}</strong></span>
        </div>
      </div>

      {/* 2. Compact Group Overview Strip (4 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121B27] border border-[#263545] p-3 sm:p-4 rounded-2xl font-mono text-xs shadow-md">
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Members</span>
          <span className="text-white font-black text-base">{totalMembers}</span>
        </div>
        <div className="flex items-center justify-between px-2 sm:border-l border-[#263545]">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Solved</span>
          <span className="text-[#00EA64] font-black text-base">{totalSolved}</span>
        </div>
        <div className="flex items-center justify-between px-2 border-t sm:border-t-0 sm:border-l border-[#263545] pt-2 sm:pt-0">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Total Stars</span>
          <span className="text-amber-400 font-black text-base">★ {totalStars}</span>
        </div>
        <div className="flex items-center justify-between px-2 border-t sm:border-t-0 sm:border-l border-[#263545] pt-2 sm:pt-0">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Track Score</span>
          <span className="text-sky-400 font-black text-base">{totalPoints}</span>
        </div>
      </div>

      {/* 3. SECTION 1: LIVE LEADERBOARD (The #1 Dominant Feature) */}
      <LeaderboardSection
        profiles={profiles}
        onSelectPeer={handleInspectPeer}
      />

      {/* 4. SECTION 2: PERFORMANCE ANALYTICS & VISUALIZATIONS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pt-2">
          <BarChart3 className="w-4 h-4 text-[#00EA64]" />
          <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
            Analytics & Graphs
          </h2>
        </div>

        {/* Graph A: Comparative Bar Chart */}
        <PrimaryPeerBarGraph
          profiles={profiles}
          onSelectPeer={handleInspectPeer}
        />

        {/* Graph B & C: Distribution Histogram & Domain Mastery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PeerDistributionHistogram
            profiles={profiles}
            onSelectPeer={handleInspectPeer}
          />
          <GroupDomainAnalytics
            profiles={profiles}
          />
        </div>
      </div>

      {/* 5. SECTION 3: TRACKED MEMBERS DIRECTORY */}
      <TrackedMembersDirectory
        profiles={profiles}
        onSelectPeer={handleInspectPeer}
      />

      {/* 6. Interactive Public Member Detail Modal */}
      {inspectProfile && (
        <PublicMemberDetailModal
          profile={inspectProfile}
          isOpen={Boolean(inspectProfile)}
          onClose={() => setInspectProfile(null)}
          onOpenFullView={(username) => {
            setInspectProfile(null);
            onSelectPeer(username);
          }}
        />
      )}

    </div>
  );
}
