import React from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  BarChart2, 
  Flame, 
  Clock, 
  Code2,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import IndividualProfileGraphs from './IndividualProfileGraphs';
import BadgesSection from './BadgesSection';
import SubmissionHeatmap from './SubmissionHeatmap';
import SkillsTrackSection from './SkillsTrackSection';
import RecentSubmissions from './RecentSubmissions';
import CertificationsSection from './CertificationsSection';

export default function IndividualPeerAnalytics({ 
  profile, 
  onBackToGroup 
}) {
  if (!profile) return null;

  const solved = profile.totalSolved ?? (profile.badges?.reduce((sum, b) => sum + (b.solved || 0), 0) || 0);
  const stars = profile.totalStars ?? (profile.badges?.reduce((sum, b) => sum + (b.stars || 0), 0) || 0);
  const points = profile.totalPoints ?? (profile.scores?.reduce((sum, s) => sum + (s.practice?.score || 0), 0) || 0);
  const bestRank = profile.bestRank || profile.scores?.find(s => s.practice?.rank > 0)?.practice?.rank || null;

  const handleSharePeerLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('peer', profile.username);
    navigator.clipboard.writeText(url.toString());
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.2 },
      colors: ['#2EC866', '#00EA64']
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263545]/60">
        <button
          onClick={onBackToGroup}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-[#00EA64] font-mono text-xs font-bold rounded-xl border border-[#263545] transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4 text-[#00EA64]" />
          <span>Back to Peer Analytics</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSharePeerLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded-xl border border-[#263545] text-xs font-mono transition-all"
            title="Copy shareable link for this peer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
          
          <a
            href={`https://www.hackerrank.com/profile/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow transition-all"
          >
            <span>HackerRank Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Peer Performance Analytics Hero Header */}
      <div className="hr-card p-5 sm:p-6 bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Avatar & Username */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-slate-800 border-2 border-[#2EC866]/50 shadow-md"
                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`; }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00EA64] text-black rounded-full flex items-center justify-center text-[10px] font-black shadow">
                ✓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {profile.name || profile.username}
                </h1>
                <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2.5 py-0.5 rounded-full border border-[#2EC866]/30">
                  @{profile.username}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {profile.school || profile.job_title || 'Peer Analytics Profile'} {profile.country && `• ${profile.country}`}
              </p>
            </div>
          </div>

          {/* Right: Key Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0E141E] p-3 rounded-2xl border border-[#263545]">
            <div className="text-center px-3 py-1">
              <p className="text-[10px] uppercase font-mono text-slate-400">Solved</p>
              <p className="text-lg font-black text-[#00EA64] font-mono">{solved}</p>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#263545]">
              <p className="text-[10px] uppercase font-mono text-slate-400">Stars</p>
              <p className="text-lg font-black text-amber-400 font-mono">★ {stars}</p>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#263545]">
              <p className="text-[10px] uppercase font-mono text-slate-400">Points</p>
              <p className="text-lg font-black text-cyan-400 font-mono">{points}</p>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#263545]">
              <p className="text-[10px] uppercase font-mono text-slate-400">Rank</p>
              <p className="text-lg font-black text-white font-mono truncate">
                {bestRank ? `#${bestRank.toLocaleString()}` : 'N/A'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Visual Analytics Graphs First */}
      <IndividualProfileGraphs profile={profile} />

      {/* Badges & Stars Visual Grid */}
      <BadgesSection badges={profile.badges} username={profile.username} />

      {/* 365-Day Activity Heatmap */}
      <SubmissionHeatmap heatmap={profile.heatmap} submissions={profile.submissions} />

      {/* Two-Column Domain Track Scores & Verified Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <SkillsTrackSection scores={profile.scores} badges={profile.badges} username={profile.username} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <CertificationsSection certifications={profile.certifications} profile={profile} />
        </div>
      </div>

      {/* Recently Solved Challenges */}
      <RecentSubmissions submissions={profile.submissions} username={profile.username} />

    </div>
  );
}
