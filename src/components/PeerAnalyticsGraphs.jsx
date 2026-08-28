import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Layers, 
  Users, 
  ExternalLink,
  Award,
  Filter,
  Sparkles,
  Flame
} from 'lucide-react';

export default function PeerAnalyticsGraphs({ profiles = [], onSelectProfile, activeUsername }) {
  const [selectedMetric, setSelectedMetric] = useState('solved'); // solved, stars, points, badges
  const [tagFilter, setTagFilter] = useState('ALL');

  // Filter profiles by tag/batch if any
  const availableTags = ['ALL', ...new Set(profiles.map(p => p.customMeta?.batch).filter(Boolean))];
  
  const filteredProfiles = profiles.filter(p => 
    tagFilter === 'ALL' || p.customMeta?.batch === tagFilter
  );

  // Prepare data for Bar Graph 1: Solved Challenges across peers
  const solvedData = filteredProfiles.map(p => ({
    name: p.name || p.username,
    username: p.username,
    solved: p.totalSolved || 0,
    stars: p.totalStars || 0,
    points: p.totalPoints || 0,
    badges: p.badges?.length || 0,
    avatar: p.avatar,
    isCurrent: p.username.toLowerCase() === activeUsername?.toLowerCase()
  })).sort((a, b) => {
    if (selectedMetric === 'solved') return b.solved - a.solved;
    if (selectedMetric === 'stars') return b.stars - a.stars;
    if (selectedMetric === 'points') return b.points - a.points;
    return b.badges - a.badges;
  });

  // Prepare data for Bar Graph 2: Language & Core Domain Star breakdown across peers
  const domainComparisonData = filteredProfiles.map(p => {
    const py = p.badges?.find(b => b.badge_type === 'python' || b.badge_name?.toLowerCase().includes('python'))?.stars || 0;
    const cpp = p.badges?.find(b => b.badge_type === 'cpp' || b.badge_name?.toLowerCase().includes('c++'))?.stars || 0;
    const java = p.badges?.find(b => b.badge_type === 'java' || b.badge_name?.toLowerCase().includes('java'))?.stars || 0;
    const ps = p.badges?.find(b => b.badge_type === 'problem-solving' || b.badge_name?.toLowerCase().includes('problem'))?.stars || 0;
    const sql = p.badges?.find(b => b.badge_type === 'sql' || b.badge_name?.toLowerCase().includes('sql'))?.stars || 0;

    return {
      name: p.name ? p.name.split(' ')[0] : p.username,
      username: p.username,
      Python: py,
      'C++': cpp,
      Java: java,
      'Problem Solving': ps,
      SQL: sql,
      totalStars: p.totalStars || 0
    };
  });

  // Prepare custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#151F2C] border border-[#263545] p-3 rounded-xl shadow-2xl text-xs font-mono">
          <p className="font-bold text-white text-sm mb-1">{data.name || label}</p>
          <p className="text-[#00EA64] font-bold">
            {selectedMetric === 'solved' && `${data.solved} Problems Solved`}
            {selectedMetric === 'stars' && `★ ${data.stars} Total Stars`}
            {selectedMetric === 'points' && `${data.points} Track Points`}
            {selectedMetric === 'badges' && `${data.badges} Skill Badges`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Click bar to open peer profile</p>
        </div>
      );
    }
    return null;
  };

  const topPeer = solvedData[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Peer Comparison & Visual Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Interactive bar charts comparing coding volume, badge mastery, and skill progression across all peers
            </p>
          </div>
        </div>

        {/* Group / Tag filter */}
        {availableTags.length > 2 && (
          <div className="flex items-center gap-2 bg-[#0E141E] p-1.5 rounded-xl border border-[#263545]">
            <span className="text-[11px] font-mono text-slate-400 pl-2">Filter Group:</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-[#151F2C] text-xs font-semibold text-white px-2.5 py-1 rounded-lg border border-[#263545] focus:outline-none focus:border-[#2EC866]"
            >
              {availableTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Bar Chart Card: Peer Ranking & Comparison */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263545]/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Peer Benchmarking Bar Graph</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {solvedData.length} Peers Tracked
              </span>
            </h3>
            <p className="text-xs text-slate-400">Click any peer bar to inspect their full individual profile and dashboard</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#0E141E] p-1 rounded-xl border border-[#263545]">
            {[
              { id: 'solved', label: 'Problems Solved', icon: Zap },
              { id: 'stars', label: '★ Total Stars', icon: Star },
              { id: 'points', label: 'Track Points', icon: Trophy },
              { id: 'badges', label: 'Skill Badges', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedMetric === tab.id
                    ? 'bg-[#2EC866] text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-[#151F2C]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-80 sm:h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={solvedData}
              margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  onSelectProfile(e.activePayload[0].payload.username);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#263545" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={selectedMetric} 
                radius={[8, 8, 0, 0]}
                cursor="pointer"
              >
                {solvedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isCurrent ? '#00EA64' : '#2EC866'} 
                    opacity={entry.isCurrent ? 1 : 0.75}
                    stroke={entry.isCurrent ? '#FFFFFF' : '#2EC866'}
                    strokeWidth={entry.isCurrent ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Highlight Banner for active peer */}
        {activeUsername && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E141E] border border-[#263545] text-xs font-mono">
            <span className="text-slate-400">
              Active Highlight: <span className="text-[#00EA64] font-bold">@{activeUsername}</span>
            </span>
            <span className="text-slate-400">
              Click any bar to instantly switch view
            </span>
          </div>
        )}

      </div>

      {/* Second Card: Domain Stars Comparison Across Peers */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 rounded-lg border border-amber-500/30 text-amber-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Domain Star Mastery Comparison (Python, C++, Java, Problem Solving, SQL)
              </h3>
              <p className="text-xs text-slate-400">Side-by-side star depth for each tracked peer across key domains</p>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={domainComparisonData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#263545" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5, 6]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151F2C', borderColor: '#263545', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Python" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="C++" fill="#818CF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Java" fill="#FB923C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Problem Solving" fill="#00EA64" radius={[4, 4, 0, 0]} />
              <Bar dataKey="SQL" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
