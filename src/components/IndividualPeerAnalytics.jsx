import React from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  Clock
} from 'lucide-react';
import IndividualProfileGraphs from './IndividualProfileGraphs';
import SubmissionHeatmap from './SubmissionHeatmap';
import BadgesSection from './BadgesSection';

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

export default function IndividualPeerAnalytics({ 
  profile, 
  onBackToGroup 
}) {
  if (!profile) return null;

  const solved = profile.totalSolved ?? 0;
  const stars = profile.totalStars ?? 0;
  const points = profile.totalPoints ?? 0;
  const badgesCount = profile.badges?.length ?? 0;
  const syncTime = profile.lastSuccessfulSyncAt || profile.lastSyncedAt;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263545]">
        <button
          onClick={onBackToGroup}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#121B27] hover:bg-[#1E2A38] text-slate-200 hover:text-[#00EA64] font-mono text-xs font-semibold rounded-lg border border-[#263545] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 text-[#00EA64]" />
          <span>Back to Peer Group Analytics</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#00EA64]" />
            <span>Last synced: {formatTimeAgo(syncTime)}</span>
          </div>

          <a
            href={`https://www.hackerrank.com/profile/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#00EA64] hover:bg-[#2EC866] text-black font-mono font-bold rounded-lg text-xs transition-colors"
          >
            <span>HackerRank Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#121B27] border border-[#263545]">
        <div className="flex items-center gap-3.5">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-[#263545]"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`; }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {profile.name || profile.username}
              </h1>
              <span className="text-xs font-mono text-[#00EA64]">
                @{profile.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {profile.school || profile.job_title || 'Peer Member'} {profile.country && `• ${profile.country}`}
            </p>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="bg-[#0E141E] p-2.5 rounded-lg border border-[#263545] text-center">
            <span className="text-[10px] uppercase text-slate-500 block">Solved</span>
            <strong className="text-sm font-bold text-[#00EA64]">{solved}</strong>
          </div>
          <div className="bg-[#0E141E] p-2.5 rounded-lg border border-[#263545] text-center">
            <span className="text-[10px] uppercase text-slate-500 block">Stars</span>
            <strong className="text-sm font-bold text-amber-400">★ {stars}</strong>
          </div>
          <div className="bg-[#0E141E] p-2.5 rounded-lg border border-[#263545] text-center">
            <span className="text-[10px] uppercase text-slate-500 block">Points</span>
            <strong className="text-sm font-bold text-sky-400">{points}</strong>
          </div>
          <div className="bg-[#0E141E] p-2.5 rounded-lg border border-[#263545] text-center">
            <span className="text-[10px] uppercase text-slate-500 block">Badges</span>
            <strong className="text-sm font-bold text-purple-400">{badgesCount}</strong>
          </div>
        </div>
      </div>

      {/* Domain Performance Graphs */}
      <IndividualProfileGraphs profile={profile} />

      {/* Badges Section */}
      {profile.badges && profile.badges.length > 0 && (
        <BadgesSection badges={profile.badges} />
      )}

      {/* 365-day Submission Heatmap (Real data from submission_histories) */}
      <SubmissionHeatmap heatmap={profile.heatmap || {}} />

    </div>
  );
}
