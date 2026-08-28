import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Star, 
  Trophy, 
  Crown, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  GitCompare,
  Activity
} from 'lucide-react';
import PrimaryPeerBarGraph from './PrimaryPeerBarGraph';
import PeerDistributionHistogram from './PeerDistributionHistogram';
import GroupDomainAnalytics from './GroupDomainAnalytics';
import TrackedMembersDirectory from './TrackedMembersDirectory';
import IndividualPeerAnalytics from './IndividualPeerAnalytics';

export default function PublicAnalyticsDashboard({ 
  profiles = [], 
  selectedPeerUsername,
  onSelectPeer,
  activePublicView = 'overview',
  setActivePublicView
}) {
  const selectedProfile = profiles.find(
    p => p.username.toLowerCase() === selectedPeerUsername?.toLowerCase()
  );

  // If a specific peer is selected, render their individual analytics view
  if (selectedPeerUsername && selectedProfile) {
    return (
      <IndividualPeerAnalytics
        profile={selectedProfile}
        onBackToGroup={() => onSelectPeer(null)}
      />
    );
  }

  // Group-wide calculated statistics
  const totalPeers = profiles.length;
  const totalSolved = profiles.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
  const avgSolved = totalPeers > 0 ? (totalSolved / totalPeers).toFixed(1) : 0;
  const totalStars = profiles.reduce((sum, p) => sum + (p.totalStars || 0), 0);
  
  // Find highest performer strictly dynamically based on solved count
  const sortedBySolved = [...profiles].sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
  const topPeer = sortedBySolved[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Compact Analytical Overview KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Tracked Peers */}
        <div className="p-4 rounded-xl bg-[#121B27] border border-[#263545] text-left space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Tracked Peers</span>
            <Users className="w-3.5 h-3.5 text-[#00EA64]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {totalPeers}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Group Members</p>
        </div>

        {/* Total Problems Solved */}
        <div className="p-4 rounded-xl bg-[#121B27] border border-[#263545] text-left space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Group Solved</span>
            <Zap className="w-3.5 h-3.5 text-[#00EA64]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#00EA64] font-mono">
            {totalSolved}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Problems Completed</p>
        </div>

        {/* Average Solved */}
        <div className="p-4 rounded-xl bg-[#121B27] border border-[#263545] text-left space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Average Solved</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
            {avgSolved}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Per Peer Member</p>
        </div>

        {/* Total Stars */}
        <div className="p-4 rounded-xl bg-[#121B27] border border-[#263545] text-left space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Group Stars</span>
            <Star className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            ★ {totalStars}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Badge Stars Earned</p>
        </div>

        {/* Highest Performer */}
        <div 
          onClick={() => topPeer && onSelectPeer(topPeer.username)}
          className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-[#121B27] border border-[#263545] text-left space-y-1 hover:border-amber-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Top Solver</span>
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-sm sm:text-base font-black text-amber-300 font-mono truncate group-hover:text-[#00EA64] transition-colors">
            {topPeer ? `@${topPeer.username}` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {topPeer ? `${topPeer.totalSolved || 0} Solved` : 'No data'}
          </p>
        </div>

      </div>

      {/* 2. Primary Horizontal Peer Comparison Bar Graph */}
      <PrimaryPeerBarGraph
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

      {/* 3. Peer Distribution Histogram */}
      <PeerDistributionHistogram
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

      {/* 4. Group Domain & Language Analytics */}
      <GroupDomainAnalytics
        profiles={profiles}
      />

      {/* 5. Tracked Member Directory */}
      <TrackedMembersDirectory
        profiles={profiles}
        onSelectPeer={onSelectPeer}
      />

    </div>
  );
}
