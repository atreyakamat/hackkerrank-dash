import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Code2, 
  ExternalLink, 
  Search, 
  Filter, 
  Sparkles,
  Calendar,
  Clock,
  Check
} from 'lucide-react';

export default function RecentSubmissions({ submissions = [], username }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('ALL');

  if (!submissions || submissions.length === 0) {
    return (
      <div className="hr-card p-6 text-center">
        <Code2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white">No Recent Submissions</h4>
        <p className="text-xs text-slate-400">Solved challenges will appear here once submitted on HackerRank.</p>
      </div>
    );
  }

  // Extract unique languages/badges for filter
  const languages = ['ALL', ...new Set(submissions.map(s => s.badge_name || s.language || 'Python').filter(Boolean))];

  const filtered = submissions.filter(sub => {
    const title = sub.name || sub.challenge_name || '';
    const lang = sub.badge_name || sub.language || 'Python';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'ALL' || lang.toLowerCase() === langFilter.toLowerCase();
    return matchesSearch && matchesLang;
  });

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/30';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="hr-card p-5 sm:p-6 space-y-4">
      
      {/* Header with Search and Language Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Recently Solved Challenges</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {submissions.length} Recorded
              </span>
            </h3>
            <p className="text-xs text-slate-400">Verified solutions and coding submissions on HackerRank</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
          />
        </div>
      </div>

      {/* Language filter pills */}
      {languages.length > 2 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                langFilter === lang
                  ? 'bg-[#2EC866] text-black font-bold'
                  : 'bg-[#0E141E] text-slate-400 hover:text-white border border-[#263545]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {/* Submissions List */}
      <div className="divide-y divide-[#263545]/60 bg-[#0E141E] rounded-xl border border-[#263545] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No challenges matching "{searchTerm}"
          </div>
        ) : (
          filtered.map((item, idx) => {
            const title = item.name || item.challenge_name || `Challenge #${idx + 1}`;
            const slug = item.ch_slug || item.url?.split('/').filter(Boolean).pop() || '';
            const problemUrl = slug 
              ? `https://www.hackerrank.com/challenges/${slug}`
              : (item.url ? `https://www.hackerrank.com${item.url}` : `https://www.hackerrank.com/profile/${username}`);
            const language = item.badge_name || item.language || 'Python';
            const difficulty = item.difficulty || 'Easy';
            const dateDisplay = formatDate(item.created_at || item.date);

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#151F2C] transition-colors group"
              >
                {/* Problem Info */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-1.5 bg-[#2EC866]/10 text-[#00EA64] rounded-lg border border-[#2EC866]/30 shrink-0 mt-0.5 sm:mt-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <a
                      href={problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-white group-hover:text-[#00EA64] flex items-center gap-1.5 transition-colors"
                    >
                      <span>{title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-slate-400 bg-[#151F2C] px-2 py-0.5 rounded border border-[#263545]">
                        {language}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateDisplay}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00EA64] bg-[#2EC866]/10 px-2 py-0.5 rounded border border-[#2EC866]/20">
                    Accepted
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
