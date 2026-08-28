import React from 'react';
import { 
  BarChart2, 
  Star, 
  Zap, 
  Award, 
  TrendingUp, 
  Code2
} from 'lucide-react';

export default function IndividualProfileGraphs({ profile }) {
  if (!profile) return null;

  // Process tracks with scores
  const trackScores = (profile.scores || [])
    .filter(s => (s.practice?.score > 0) || (s.practice?.rank > 0))
    .map(s => {
      const badgeMatch = (profile.badges || []).find(
        b => b.badge_name?.toLowerCase() === s.name?.toLowerCase() || b.badge_type?.toLowerCase() === s.slug?.toLowerCase()
      );
      return {
        name: s.name,
        score: s.practice?.score || 0,
        solved: badgeMatch?.solved || (s.practice?.score ? Math.round(s.practice.score / 10) : 0),
        stars: badgeMatch?.stars || 0,
        rank: s.practice?.rank || 0
      };
    })
    .sort((a, b) => b.score - a.score);

  // Fallback to badges if track scores array empty
  const displayTracks = trackScores.length > 0 ? trackScores : (profile.badges || []).map(b => ({
    name: b.badge_name,
    score: b.current_points || 0,
    solved: b.solved || 0,
    stars: b.stars || 0,
    rank: b.hacker_rank || 0
  }));

  const maxTrackScore = Math.max(...displayTracks.map(t => t.score), 10);

  return (
    <div className="space-y-6">
      
      {/* Individual Domain Mastery Bar Graph */}
      <div className="border border-[#263545] bg-[#121B27] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#263545]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Skill Domain Performance</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#263545] px-2 py-0.5 rounded">
                @{profile.username}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Practice track scores and badge progress across HackerRank topics
            </p>
          </div>
        </div>

        {displayTracks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No track points recorded yet for this peer.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {displayTracks.map((t, idx) => {
              const pct = Math.max(4, Math.round((t.score / maxTrackScore) * 100));

              return (
                <div key={idx} className="p-3 bg-[#0E141E] rounded-lg border border-[#263545] space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{t.name}</span>
                      {t.stars > 0 && (
                        <span className="text-[10px] text-amber-400 font-bold bg-[#121B27] px-1.5 py-0.5 rounded border border-[#263545]">
                          ★ {t.stars}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {t.solved > 0 && <span className="text-slate-400 text-[11px]">{t.solved} solved</span>}
                      <span className="font-bold text-[#00EA64]">{t.score} pts</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-[#121B27] rounded-full overflow-hidden border border-[#263545]/60">
                    <div
                      className="h-full bg-[#00EA64] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {t.rank > 0 && (
                    <div className="text-[10px] text-slate-500 text-right">
                      Global Rank: #{t.rank.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
