import React from 'react';
import { Code2 } from 'lucide-react';

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
        // If domain already existed from badge, ensure points aren't duplicated if already counted
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
    <div className="border border-[#263545] bg-[#121B27] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#263545]">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Skill Performance
          </h2>
          <p className="text-xs text-slate-400">
            Total track score across tracked cohort
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {domainList.map(dom => {
          const pct = Math.max(4, Math.round((dom.points / maxPoints) * 100));

          return (
            <div key={dom.name} className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">{dom.name}</span>
                <div className="flex items-center gap-2">
                  {dom.stars > 0 && (
                    <span className="text-amber-400">★ {dom.stars}</span>
                  )}
                  <span className="text-white font-bold">{dom.points} pts</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]/60">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-300"
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
