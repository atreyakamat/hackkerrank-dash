import React from 'react';
import { 
  Code2, 
  Star, 
  Award, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

export default function GroupDomainAnalytics({ profiles = [] }) {
  if (!profiles || profiles.length === 0) return null;

  const standardDomains = [
    { key: 'python', label: 'Python', color: '#38BDF8' },
    { key: 'problem-solving', label: 'Problem Solving', color: '#00EA64' },
    { key: 'cpp', label: 'C++', color: '#60A5FA' },
    { key: 'java', label: 'Java', color: '#FB923C' },
    { key: 'sql', label: 'SQL', color: '#F87171' },
    { key: 'algorithms', label: 'Algorithms', color: '#A78BFA' },
    { key: 'data-structures', label: 'Data Structures', color: '#34D399' },
    { key: 'mathematics', label: 'Mathematics', color: '#FBBF24' }
  ];

  // Aggregate stats across all peers for each domain
  const domainStats = standardDomains.map(dom => {
    let totalStars = 0;
    let totalPoints = 0;
    let activePeers = 0;
    let topScore = 0;
    let topUser = '';

    profiles.forEach(p => {
      // Check badges
      const badge = (p.badges || []).find(
        b => b.badge_type?.toLowerCase() === dom.key ||
             b.badge_name?.toLowerCase().includes(dom.label.toLowerCase())
      );
      
      // Check scores
      const score = (p.scores || []).find(
        s => s.slug?.toLowerCase() === dom.key ||
             s.name?.toLowerCase().includes(dom.label.toLowerCase())
      );

      const stars = badge?.stars || 0;
      const points = score?.practice?.score || badge?.current_points || 0;

      if (stars > 0 || points > 0) {
        activePeers += 1;
        totalStars += stars;
        totalPoints += points;
        if (points > topScore) {
          topScore = points;
          topUser = p.username;
        }
      }
    });

    const avgStars = activePeers > 0 ? (totalStars / activePeers).toFixed(1) : 0;
    const avgPoints = activePeers > 0 ? Math.round(totalPoints / activePeers) : 0;

    return {
      ...dom,
      activePeers,
      totalStars,
      totalPoints,
      avgStars: Number(avgStars),
      avgPoints,
      topScore,
      topUser
    };
  }).filter(d => d.activePeers > 0) // Only display domains where real data exists
    .sort((a, b) => b.totalPoints - a.totalPoints || b.activePeers - a.activePeers);

  if (domainStats.length === 0) return null;

  const maxDomainPoints = Math.max(...domainStats.map(d => d.totalPoints), 1);
  const strongestDomain = domainStats[0];

  return (
    <div className="hr-card p-5 sm:p-6 space-y-5 border border-[#263545] bg-[#121B27] shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263545]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/15 rounded-lg border border-purple-500/30 text-purple-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Group Domain & Language Mastery</span>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                {domainStats.length} Active Domains
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated skill strength, point volume, and star depth across all peers
            </p>
          </div>
        </div>

        {/* Strongest skill badge */}
        {strongestDomain && (
          <div className="px-3 py-1.5 bg-[#0E141E] border border-[#263545] rounded-xl text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Strongest Domain:</span>
            <span className="font-bold text-[#00EA64]">{strongestDomain.label} ({strongestDomain.totalPoints} pts)</span>
          </div>
        )}
      </div>

      {/* Grouped Domain Visual Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {domainStats.map((dom) => {
          const fillPct = Math.min(100, Math.round((dom.totalPoints / maxDomainPoints) * 100));

          return (
            <div
              key={dom.key}
              className="p-4 rounded-xl bg-[#0E141E] border border-[#263545] space-y-2.5 hover:border-[#384d63] transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dom.color }} />
                  <span className="font-bold text-white text-sm">{dom.label}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{dom.activePeers} {dom.activePeers === 1 ? 'Peer' : 'Peers'} Active</span>
                  <span>•</span>
                  <span className="font-bold text-amber-400">★ {dom.totalStars} Total</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#151F2C] rounded-full overflow-hidden border border-[#263545]/60">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(6, fillPct)}%`,
                    backgroundColor: dom.color
                  }}
                />
              </div>

              {/* Detail Metrics */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Group Volume: <strong className="text-white">{dom.totalPoints} pts</strong></span>
                <span>Avg Stars: <strong className="text-amber-400">{dom.avgStars}★</strong></span>
                {dom.topUser && (
                  <span className="truncate max-w-[120px]">Top: <strong className="text-[#00EA64]">@{dom.topUser}</strong></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
