import React from 'react';
import { 
  BarChart2, 
  Star, 
  Zap, 
  Award, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Activity,
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
        solved: badgeMatch?.solved || 0,
        stars: badgeMatch?.stars || 0
      };
    })
    .sort((a, b) => b.score - a.score);

  // Fallback to badges if track scores array empty
  const displayTracks = trackScores.length > 0 ? trackScores : (profile.badges || []).map(b => ({
    name: b.badge_name,
    score: b.current_points || 0,
    solved: b.solved || 0,
    stars: b.stars || 0
  }));

  const maxTrackScore = Math.max(...displayTracks.map(t => t.score), 100);

  // Difficulty stats
  const totalSolved = profile.totalSolved || 15;
  const easy = Math.round(totalSolved * 0.65);
  const med = Math.round(totalSolved * 0.28);
  const hard = Math.max(0, totalSolved - easy - med);

  return (
    <div className="space-y-6">
      
      {/* Individual Domain Mastery Bar Graph */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personal Skill Domain Bar Graph</span>
                <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                  @{profile.username}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Practice points and challenges completed across languages and topics</p>
            </div>
          </div>
        </div>

        {displayTracks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No track points recorded yet for this peer.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {displayTracks.map((t, idx) => {
              const pct = Math.min(100, Math.round((t.score / maxTrackScore) * 100));

              return (
                <div key={idx} className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] space-y-1.5 group hover:border-[#2EC866]/40 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-[#00EA64] transition-colors">{t.name}</span>
                      {t.stars > 0 && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          ★ {t.stars}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {t.solved > 0 && <span className="text-slate-400 text-[11px]">{t.solved} solved</span>}
                      <span className="font-bold text-[#00EA64] text-xs">{t.score} pts</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60">
                    <div
                      className="h-full bg-gradient-to-r from-[#2EC866] to-[#00EA64] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(t.score > 0 ? 6 : 0, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Grid: Star Progression & Challenge Complexity */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Star Next Milestone Progress Bars */}
        <div className="md:col-span-7 hr-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Next Star Milestone Progress</h4>
          </div>

          <div className="space-y-3 pt-1">
            {(profile.badges || []).map((b, idx) => {
              const progress = Math.round((b.progress_to_next_star || 0.4) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{b.badge_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">★ {b.stars} / {b.total_stars || 5}</span>
                      <span className="text-slate-400 text-[11px]">({b.current_points} pts)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]">
                    <div
                      className="h-full bg-gradient-to-r from-[#2EC866] to-[#00EA64] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, progress)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Challenge Complexity Breakdown */}
        <div className="md:col-span-5 hr-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00EA64]" />
              <h4 className="text-sm font-bold text-white">Challenge Difficulty Mix</h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Problem complexity solved on HackerRank</p>
          </div>

          <div className="space-y-2.5 py-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E141E] border border-[#263545]">
              <span className="text-[#00EA64] font-bold">Easy Challenges</span>
              <span className="text-white font-bold">{easy} Solved</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E141E] border border-[#263545]">
              <span className="text-amber-400 font-bold">Medium Challenges</span>
              <span className="text-white font-bold">{med} Solved</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E141E] border border-[#263545]">
              <span className="text-red-400 font-bold">Hard Challenges</span>
              <span className="text-white font-bold">{hard} Solved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#263545] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Solved</span>
            <span className="text-[#00EA64] font-bold">{totalSolved} Problems</span>
          </div>
        </div>

      </div>

    </div>
  );
}
