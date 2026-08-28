import React, { useState } from 'react';
import { 
  Star, 
  Award, 
  Sparkles, 
  CheckCircle, 
  ExternalLink, 
  Trophy, 
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function BadgesSection({ badges = [], username }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (!badges || badges.length === 0) {
    return (
      <div className="hr-card p-6 text-center">
        <Award className="w-12 h-12 text-slate-500 mx-auto mb-2" />
        <h4 className="text-base font-bold text-white">No Badges Yet</h4>
        <p className="text-xs text-slate-400">Complete domain challenges on HackerRank to unlock badges.</p>
      </div>
    );
  }

  // Get badge icon / color styling based on badge type
  const getBadgeMeta = (badge) => {
    const type = (badge.badge_type || badge.badge_name || '').toLowerCase();
    
    if (type.includes('python')) {
      return {
        themeColor: '#3776AB',
        accent: 'text-[#38BDF8]',
        border: 'border-[#38BDF8]/40',
        bg: 'from-[#3776AB]/20 to-[#151F2C]',
        starColor: 'text-amber-400 fill-amber-400',
        iconLetter: 'PY'
      };
    }
    if (type.includes('cpp') || type.includes('c++')) {
      return {
        themeColor: '#00599C',
        accent: 'text-[#60A5FA]',
        border: 'border-[#60A5FA]/40',
        bg: 'from-[#00599C]/20 to-[#151F2C]',
        starColor: 'text-amber-400 fill-amber-400',
        iconLetter: 'C++'
      };
    }
    if (type.includes('java')) {
      return {
        themeColor: '#F89820',
        accent: 'text-[#FB923C]',
        border: 'border-[#FB923C]/40',
        bg: 'from-[#F89820]/20 to-[#151F2C]',
        starColor: 'text-amber-400 fill-amber-400',
        iconLetter: 'JV'
      };
    }
    if (type.includes('problem') || type.includes('algorithm')) {
      return {
        themeColor: '#2EC866',
        accent: 'text-[#00EA64]',
        border: 'border-[#2EC866]/50',
        bg: 'from-[#2EC866]/20 to-[#151F2C]',
        starColor: 'text-[#00EA64] fill-[#00EA64]',
        iconLetter: 'PS'
      };
    }
    if (type.includes('sql') || type.includes('database')) {
      return {
        themeColor: '#E25555',
        accent: 'text-[#F87171]',
        border: 'border-[#F87171]/40',
        bg: 'from-[#E25555]/20 to-[#151F2C]',
        starColor: 'text-amber-400 fill-amber-400',
        iconLetter: 'SQL'
      };
    }
    return {
      themeColor: '#2EC866',
      accent: 'text-[#00EA64]',
      border: 'border-[#2EC866]/30',
      bg: 'from-[#2EC866]/10 to-[#151F2C]',
      starColor: 'text-amber-400 fill-amber-400',
      iconLetter: 'HR'
    };
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>HackerRank Badges</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {badges.length} Earned
              </span>
            </h2>
            <p className="text-xs text-slate-400">Skill proficiency stars verified by HackerRank</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, idx) => {
          const meta = getBadgeMeta(badge);
          const stars = badge.stars || 0;
          const maxStars = badge.total_stars || 5;
          const currentPts = badge.current_points || 0;
          const totalPts = badge.total_points || 200;
          const solved = badge.solved || 0;
          const totalChallenges = badge.total_challenges || 50;
          const progressPercent = Math.min(100, Math.round((currentPts / Math.max(totalPts, 1)) * 100)) || Math.round((badge.progress_to_next_star || 0) * 100);

          return (
            <div
              key={idx}
              onClick={() => setSelectedBadge(badge)}
              className={`cursor-pointer hr-card p-5 relative overflow-hidden bg-gradient-to-b ${meta.bg} border ${meta.border} hover:border-[#00EA64] hover:shadow-glow-green transition-all duration-300 group`}
            >
              {/* Top Row: Icon badge & Stars */}
              <div className="flex items-start justify-between">
                
                {/* Badge emblem */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#0E141E] border border-[#263545] p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#151F2C] to-[#1E2A38] flex flex-col items-center justify-center">
                      <span className={`font-mono font-black text-sm tracking-wider ${meta.accent}`}>
                        {meta.iconLetter}
                      </span>
                    </div>
                  </div>
                  {/* Star count pill */}
                  <div className="absolute -bottom-1.5 -right-1.5 bg-[#0E141E] px-1.5 py-0.5 rounded-full border border-[#263545] flex items-center gap-0.5 shadow">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-mono font-bold text-white">{stars}★</span>
                  </div>
                </div>

                {/* Stars Render */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 bg-[#0E141E]/80 px-2 py-1 rounded-lg border border-[#263545]">
                    {[...Array(maxStars)].map((_, sIdx) => {
                      const isEarned = sIdx < stars;
                      return (
                        <Star
                          key={sIdx}
                          className={`w-3.5 h-3.5 ${
                            isEarned
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                              : 'text-slate-600 fill-slate-800/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">
                    {stars} of {maxStars} Stars
                  </span>
                </div>
              </div>

              {/* Badge Title & Category */}
              <div className="mt-4">
                <h3 className="text-base font-bold text-white group-hover:text-[#00EA64] transition-colors flex items-center justify-between">
                  <span>{badge.badge_name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {badge.category_name || 'Proficiency Badge'}
                </p>
              </div>

              {/* Progress to Next Star / Points */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Score Progress</span>
                  <span className="text-white font-semibold">{currentPts} / {totalPts} pts</span>
                </div>
                <div className="w-full h-2 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2EC866] to-[#00EA64] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Solved and Rank footer */}
              <div className="mt-4 pt-3 border-t border-[#263545]/60 flex items-center justify-between text-xs text-slate-400">
                <span>{solved} Challenges Solved</span>
                {badge.hacker_rank && (
                  <span className="font-mono text-[11px] text-slate-300">
                    Rank #{badge.hacker_rank.toLocaleString()}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Badge Details Modal Popup */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold bg-[#0E141E] w-8 h-8 rounded-full border border-[#263545] flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedBadge.badge_name}</h3>
                <p className="text-xs text-slate-400">{selectedBadge.category_name || 'HackerRank Domain'}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 bg-[#0E141E] p-4 rounded-xl border border-[#263545] font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#263545]">
                <span className="text-slate-400">Stars Earned:</span>
                <span className="text-amber-400 font-bold">★ {selectedBadge.stars} / {selectedBadge.total_stars}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263545]">
                <span className="text-slate-400">Current Points:</span>
                <span className="text-white font-bold">{selectedBadge.current_points} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263545]">
                <span className="text-slate-400">Points Target:</span>
                <span className="text-white">{selectedBadge.total_points || 'Max'} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263545]">
                <span className="text-slate-400">Challenges Solved:</span>
                <span className="text-[#00EA64] font-bold">{selectedBadge.solved} / {selectedBadge.total_challenges || 'All'}</span>
              </div>
              {selectedBadge.hacker_rank && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Track Ranking:</span>
                  <span className="text-purple-400 font-bold">#{selectedBadge.hacker_rank.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href={selectedBadge.url ? `https://www.hackerrank.com${selectedBadge.url}` : `https://www.hackerrank.com/profile/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Practice {selectedBadge.badge_name} Challenges</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
