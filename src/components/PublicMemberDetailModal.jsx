import React from 'react';
import { 
  X, 
  ExternalLink, 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  Clock, 
  Calendar, 
  Code2, 
  BookOpen, 
  MapPin, 
  Building, 
  GraduationCap,
  Activity,
  ArrowRight
} from 'lucide-react';
import SubmissionHeatmap from './SubmissionHeatmap';

export default function PublicMemberDetailModal({ 
  profile, 
  isOpen, 
  onClose,
  onOpenFullView 
}) {
  if (!isOpen || !profile) return null;

  const solved = profile.totalSolved ?? 0;
  const stars = profile.totalStars ?? 0;
  const points = Number(profile.totalPoints ?? 0);
  const bestRank = profile.bestRank || profile.scores?.find(s => s.practice?.rank > 0)?.practice?.rank || null;
  const badges = profile.badges || [];
  const activeTracks = profile.activeTracks || profile.scores?.filter(s => s.practice?.score > 0) || [];
  const submissions = profile.submissions || [];
  const heatmap = profile.heatmap || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121B27] border border-[#263545] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-6 p-4 sm:p-6 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#0E141E] hover:bg-[#1F2C3F] text-slate-400 hover:text-white rounded-xl border border-[#263545] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10 pb-4 border-b border-[#263545]">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-slate-800 border-2 border-[#00EA64]/60 shadow-lg shrink-0"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`; }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-white truncate">
                {profile.name || profile.username}
              </h2>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#00EA64]/10 border border-[#00EA64]/30 px-2 py-0.5 rounded-lg">
                @{profile.username}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              {profile.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {profile.country}
                </span>
              )}
              {profile.school && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <GraduationCap className="w-3 h-3 text-slate-500" />
                  {profile.school}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <a
                href={`https://www.hackerrank.com/profile/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00EA64] hover:underline flex items-center gap-1 font-mono font-medium"
              >
                <span>HackerRank Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono font-medium"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 4 Big Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Solved</span>
            <span className="text-xl font-black text-[#00EA64]">{solved}</span>
            <span className="text-[10px] text-slate-500 block">problems</span>
          </div>

          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Stars</span>
            <span className="text-xl font-black text-amber-400">★ {stars}</span>
            <span className="text-[10px] text-slate-500 block">earned</span>
          </div>

          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Track Score</span>
            <span className="text-xl font-black text-sky-400">{points}</span>
            <span className="text-[10px] text-slate-500 block">points</span>
          </div>

          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Best Rank</span>
            <span className="text-xl font-black text-purple-400 truncate block">
              {bestRank ? `#${Number(bestRank).toLocaleString()}` : 'Top 10%'}
            </span>
            <span className="text-[10px] text-slate-500 block">practice</span>
          </div>
        </div>

        {/* Skill Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                Verified Skill Badges ({badges.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              {badges.map((b, idx) => {
                const bStars = b.stars || 0;
                return (
                  <div 
                    key={idx}
                    className="p-3 bg-[#0E141E] border border-[#263545] rounded-xl flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate text-xs">
                        {b.badge_name || b.badge_type}
                      </span>
                      <span className="text-amber-400 font-bold text-xs">
                        {'★'.repeat(Math.min(bStars, 6))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#263545]/60">
                      <span>{b.current_points || b.solved || 0} pts</span>
                      <span className="text-[#00EA64]">{b.solved || 0} solved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Practice Tracks */}
        {activeTracks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                Active Practice Tracks ({activeTracks.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              {activeTracks.map((t, idx) => {
                const score = t.practice?.score || 0;
                const rank = t.practice?.rank || 0;
                return (
                  <div 
                    key={idx}
                    className="p-3 bg-[#0E141E] border border-[#263545] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white block">{t.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {rank > 0 ? `Rank #${rank.toLocaleString()}` : 'Practice Track'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-400 font-bold block">{score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submission Heatmap Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00EA64]" />
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                Submission Activity
              </h3>
            </div>
          </div>
          <div className="p-3 bg-[#0E141E] border border-[#263545] rounded-xl overflow-x-auto">
            <SubmissionHeatmap heatmapData={heatmap} />
          </div>
        </div>

        {/* Footer & Deep-Dive Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#263545] text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Clock className="w-3 h-3 text-[#00EA64]" />
            <span>
              Last Synced: {profile.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleString() : 'Recently'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenFullView(profile.username);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#00EA64] hover:bg-[#2EC866] text-black font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Full Analytics Drilldown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
