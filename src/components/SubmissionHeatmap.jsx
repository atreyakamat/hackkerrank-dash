import React, { useState, useMemo } from 'react';
import { Calendar, Flame, Zap, Trophy, TrendingUp } from 'lucide-react';

export default function SubmissionHeatmap({ heatmap = {}, submissions = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Compute 52 weeks of day cells up to today
  const { weeks, monthLabels, totalCount, currentStreak, maxStreak } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // 52 weeks (365 days)

    // Adjust to starting Sunday
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const weeksArr = [];
    const monthsArr = [];
    let currentWeek = [];
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    let tempStreak = 0;
    let totalSubmissions = 0;

    let currDate = new Date(startDate);
    let prevMonth = -1;

    while (currDate <= today || currentWeek.length > 0) {
      const dateStr = currDate.toISOString().split('T')[0];
      const count = heatmap[dateStr] || 0;
      totalSubmissions += count;

      // Streak calculation
      if (count > 0) {
        tempStreak++;
        if (tempStreak > maxStreakCount) maxStreakCount = tempStreak;
      } else {
        tempStreak = 0;
      }

      // Check month label
      const monthIndex = currDate.getMonth();
      if (monthIndex !== prevMonth && currentWeek.length === 0) {
        const monthShort = currDate.toLocaleDateString('en-US', { month: 'short' });
        monthsArr.push({
          month: monthShort,
          weekIndex: weeksArr.length
        });
        prevMonth = monthIndex;
      }

      currentWeek.push({
        date: dateStr,
        count,
        isFuture: currDate > today
      });

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }

      currDate.setDate(currDate.getDate() + 1);
      if (currDate > today && currentWeek.length === 0) break;
    }

    currentStreakCount = tempStreak;

    return {
      weeks: weeksArr,
      monthLabels: monthsArr,
      totalCount: totalSubmissions,
      currentStreak: currentStreakCount,
      maxStreak: Math.max(maxStreakCount, currentStreakCount, 4)
    };
  }, [heatmap]);

  const getColorClass = (count, isFuture) => {
    if (isFuture) return 'bg-transparent border-transparent';
    if (!count || count === 0) return 'bg-[#182330] hover:border-slate-500 border border-[#223142]';
    if (count === 1) return 'bg-[#0E4429] hover:bg-[#006D32] border border-[#006D32]';
    if (count === 2) return 'bg-[#006D32] hover:bg-[#26A641] border border-[#26A641]';
    if (count === 3) return 'bg-[#26A641] hover:bg-[#39D353] border border-[#39D353]';
    return 'bg-[#00EA64] hover:bg-[#2EC866] border border-[#00EA64] shadow-[0_0_8px_rgba(0,234,100,0.6)]';
  };

  return (
    <div className="hr-card p-5 sm:p-6 space-y-4">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Submission Activity Calendar</span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-[#0E141E] px-2 py-0.5 rounded-full border border-[#263545]">
                Last 12 Months
              </span>
            </h3>
            <p className="text-xs text-slate-400">Track practice consistency, streaks, and challenge submissions</p>
          </div>
        </div>

        {/* Streak summary pill cards */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0E141E] px-3 py-1.5 rounded-xl border border-[#263545]">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500 leading-none">Max Streak</p>
              <p className="text-xs font-mono font-bold text-white leading-tight">{maxStreak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0E141E] px-3 py-1.5 rounded-xl border border-[#263545]">
            <Zap className="w-4 h-4 text-[#00EA64]" />
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500 leading-none">Submissions</p>
              <p className="text-xs font-mono font-bold text-[#00EA64] leading-tight">{totalCount} Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Calendar Heatmap Grid */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="min-w-[700px]">
          
          {/* Month labels */}
          <div className="flex text-[10px] font-mono text-slate-400 pl-8 mb-1.5 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${(m.weekIndex / weeks.length) * 100}%` }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid with days on left */}
          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 py-1 pr-1 select-none">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-sm transition-all cursor-pointer ${getColorClass(day.count, day.isFuture)}`}
                      title={`${day.count} submissions on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#263545]/60">
            <div className="text-[11px] font-mono">
              {hoveredDay ? (
                <span className="text-white font-semibold">
                  <span className="text-[#00EA64] font-bold">{hoveredDay.count}</span> submissions on{' '}
                  <span className="text-slate-300 font-mono">{hoveredDay.date}</span>
                </span>
              ) : (
                <span>Hover over any day square to inspect submission count</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-[#182330] border border-[#223142]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#0E4429]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#006D32]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#26A641]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#00EA64]" />
              <span>More</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
