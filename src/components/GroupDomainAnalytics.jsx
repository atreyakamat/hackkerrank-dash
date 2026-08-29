import React from 'react';
import { Code2, Award, Star } from 'lucide-react';

export default function GroupDomainAnalytics({ profiles = [] }) {
  if (!profiles || profiles.length === 0) return null;

  // Dynamically collect all domains with real activity
  const domainMap = {};

  profiles.forEach(p => {
    // 1. From badges
    (p.badges || []).forEach(b => {
      const name = b.badge_name || b.badge_type;
      if (!name) return;
      if (!domainMap[name]) {
        domainMap[name] = { name, points: 0, stars: 0, peers: 0 };
      }
      const pts = b.current_points || 0;
      const stars = b.stars || 0;
      if (pts > 0 || stars > 0) {
        domainMap[name].points += pts;
        domainMap[name].stars += stars;
        domainMap[name].peers += 1;
      }
    });

    // 2. From scores_elo
    (p.scores || []).forEach(s => {
      const name = s.name;
      const score = s.practice?.score || 0;
      if (score > 0 && name) {
        if (!domainMap[name]) {
          domainMap[name] = { name, points: 0, stars: 0, peers: 0 };
        }
        if (domainMap[name].points < score) {
          domainMap[name].points = Math.max(domainMap[name].points, score);
        }
      }
    });
  });

  const domainList = Object.values(domainMap)
    .filter(d => d.points > 0 || d.stars > 0)
    .sort((a, b) => b.points - a.points);

  if (domainList.length === 0) return null;

  const maxPoints = Math.max(...domainList.map(d => d.points), 1);

  return (
    <div className="border border-[#263545] bg-[#121B27] rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#263545]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1F2C3F] border border-[#263545] flex items-center justify-center text-sky-400">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Domain & Skill Mastery
            </h3>
            <p className="text-xs text-slate-400">
              Cumulative practice points and stars across tracks
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#0E141E] px-2.5 py-1 rounded-lg border border-[#263545] shrink-0 self-start sm:self-auto">
          <span>{domainList.length} active domains</span>
        </div>
      </div>

      <div className="space-y-3 pt-1 font-mono">
        {domainList.map(dom => {
          const pct = Math.max(4, Math.round((dom.points / maxPoints) * 100));

          return (
            <div key={dom.name} className="space-y-1.5 text-xs bg-[#0E141E] p-3 rounded-xl border border-[#263545]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold text-white">{dom.name}</span>
                <div className="flex items-center gap-3">
                  {dom.stars > 0 && (
                    <span className="text-amber-400 font-bold">★ {dom.stars} stars</span>
                  )}
                  <span className="text-sky-400 font-bold">{dom.points} pts</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-[#121B27] rounded-full overflow-hidden border border-[#263545]/60">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
