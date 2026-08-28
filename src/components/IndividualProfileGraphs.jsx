import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid,
  PieChart,
  Pie
} from 'recharts';
import { 
  Activity, 
  BarChart2, 
  TrendingUp, 
  Zap, 
  Star, 
  Award, 
  Layers,
  Code2
} from 'lucide-react';

export default function IndividualProfileGraphs({ profile }) {
  if (!profile) return null;

  // Prepare data for individual score bar chart
  const trackScoresData = (profile.scores || [])
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

  // If no scores recorded, fallback to badge points
  const displayTracks = trackScoresData.length > 0 ? trackScoresData : (profile.badges || []).map(b => ({
    name: b.badge_name,
    score: b.current_points || 0,
    solved: b.solved || 0,
    stars: b.stars || 0
  }));

  // Prepare star progression data
  const starProgressData = (profile.badges || []).map(b => ({
    name: b.badge_name,
    stars: b.stars || 0,
    maxStars: b.total_stars || 5,
    progress: Math.round((b.progress_to_next_star || 0.5) * 100),
    currentPoints: b.current_points || 0,
    totalPoints: b.total_points || 200
  }));

  // Difficulty estimation for donut chart
  const totalSolved = profile.totalSolved || 15;
  const easy = Math.round(totalSolved * 0.65);
  const med = Math.round(totalSolved * 0.28);
  const hard = Math.max(0, totalSolved - easy - med);

  const difficultyData = [
    { name: 'Easy', value: easy, color: '#00EA64' },
    { name: 'Medium', value: med, color: '#FFA116' },
    { name: 'Hard', value: hard, color: '#EF4444' }
  ];

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
              <p className="text-xs text-slate-400">Track practice scores and solved challenge volume across technologies</p>
            </div>
          </div>
        </div>

        {displayTracks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No track points recorded yet for this peer.
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayTracks}
                margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#263545" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false} 
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151F2C', borderColor: '#263545', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#00EA64' }}
                />
                <Bar dataKey="score" fill="#2EC866" radius={[6, 6, 0, 0]} name="Practice Points">
                  {displayTracks.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#00EA64' : '#2EC866'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two Column Grid: Star Progressions & Solved Difficulty Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Star Next Milestone Progress Bars */}
        <div className="md:col-span-7 hr-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Next Star Milestone Progress</h4>
          </div>

          <div className="space-y-3.5 pt-1">
            {starProgressData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">★ {item.stars} / {item.maxStars}</span>
                    <span className="text-slate-400">({item.currentPoints} pts)</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#0E141E] rounded-full overflow-hidden border border-[#263545]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2EC866] to-[#00EA64] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, item.progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Solved Problems by Difficulty */}
        <div className="md:col-span-5 hr-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00EA64]" />
              <h4 className="text-sm font-bold text-white">Challenge Difficulty Mix</h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Problem complexity solved</p>
          </div>

          {/* Difficulty Bars */}
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
