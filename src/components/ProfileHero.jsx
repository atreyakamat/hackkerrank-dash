import React, { useState } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Edit3, 
  Share2, 
  Sparkles, 
  ShieldAlert, 
  Award, 
  Flame, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Inline clean SVG icons for GitHub & LinkedIn
function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}

export default function ProfileHero({ profile, onEditClick, isAdminRoute }) {
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const hrProfileUrl = `https://www.hackerrank.com/profile/${profile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(hrProfileUrl);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2EC866', '#00EA64', '#FFA116']
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'interview ready':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'review':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/30';
    }
  };

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#182535] to-[#121B27] border border-[#263545] p-6 sm:p-8 shadow-2xl">
      
      {/* Background glowing ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2EC866]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#FFA116]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Side: Avatar + Names + Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
          
          {/* Avatar with level badge ring */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-[#2EC866] via-[#00EA64] to-[#FFA116] shadow-xl">
              <img
                src={profile.avatar}
                alt={profile.name || profile.username}
                className="w-full h-full rounded-xl object-cover bg-[#0E141E]"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`;
                }}
              />
            </div>
            {/* HackerRank Verified Badge */}
            <div className="absolute -bottom-2 -right-2 bg-[#0E141E] p-1 rounded-full border border-[#263545] shadow-lg">
              <div className="bg-[#2EC866] text-black rounded-full p-1 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 fill-black text-[#2EC866]" />
              </div>
            </div>
          </div>

          {/* Name & Bio Details */}
          <div className="space-y-2 min-w-0">
            
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.name || profile.username}
              </h1>
              
              {/* Admin status pill */}
              {profile.customMeta?.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(profile.customMeta.status)}`}>
                  {profile.customMeta.status}
                </span>
              )}

              {/* Batch tag */}
              {profile.customMeta?.batch && (
                <span className="bg-[#263545] text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
                  {profile.customMeta.batch}
                </span>
              )}
            </div>

            {/* Username & copy link */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a
                href={hrProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#00EA64] hover:underline flex items-center gap-1 font-semibold group"
              >
                <span>@{profile.username}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>

              <button
                onClick={handleCopyLink}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-[#151F2C] hover:bg-[#1E2A38] px-2 py-1 rounded-md border border-[#263545] transition-all"
                title="Copy HackerRank Profile Link"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#00EA64]" />
                    <span className="text-[#00EA64]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Meta Grid */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
              {profile.country && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.country}</span>
                </div>
              )}
              {profile.school && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{profile.school}</span>
                </div>
              )}
              {profile.job_title && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.job_title}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {memberSince}</span>
              </div>
            </div>

            {/* Social / External Links */}
            <div className="flex items-center gap-2 pt-1">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded-lg border border-[#263545] transition-all"
                  title="GitHub Profile"
                >
                  <GithubIcon />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-300 hover:text-cyan-400 rounded-lg border border-[#263545] transition-all"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon />
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-300 hover:text-[#00EA64] rounded-lg border border-[#263545] transition-all"
                  title="Personal Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Quick Stats Badges & Admin Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto shrink-0">
          
          {/* Quick Level & Score Highlights */}
          <div className="flex items-center gap-2 bg-[#0E141E]/90 p-2.5 rounded-xl border border-[#263545]">
            <div className="px-3 py-1 bg-[#2EC866]/10 border border-[#2EC866]/30 rounded-lg text-center">
              <p className="text-[10px] uppercase font-mono text-slate-400">Total Stars</p>
              <p className="text-lg font-black text-amber-400 font-mono">★ {profile.totalStars || 0}</p>
            </div>
            <div className="px-3 py-1 bg-[#151F2C] border border-[#263545] rounded-lg text-center">
              <p className="text-[10px] uppercase font-mono text-slate-400">Solved</p>
              <p className="text-lg font-black text-[#00EA64] font-mono">{profile.totalSolved || 0}</p>
            </div>
            <div className="px-3 py-1 bg-[#151F2C] border border-[#263545] rounded-lg text-center">
              <p className="text-[10px] uppercase font-mono text-slate-400">Points</p>
              <p className="text-lg font-black text-white font-mono">{profile.totalPoints || 0}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {isAdminRoute && (
              <button
                onClick={() => onEditClick(profile)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-[#263545] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#00EA64]" />
                <span>Edit Metadata</span>
              </button>
            )}
            <a
              href={hrProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg shadow-[#2EC866]/20 transition-all"
            >
              <span>Visit HackerRank</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

      {/* Admin Notes Preview Banner only if admin route is active and notes exist */}
      {isAdminRoute && profile.customMeta?.notes && (
        <div className="mt-5 pt-4 border-t border-[#263545]/60 flex items-start gap-2.5 text-xs text-slate-300 bg-[#0E141E]/50 p-3 rounded-xl border border-[#263545]/40">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400 font-mono text-[11px] uppercase mr-1.5">Admin Note:</span>
            <span>{profile.customMeta.notes}</span>
          </div>
        </div>
      )}

    </div>
  );
}
