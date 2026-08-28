import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar, 
  Star, 
  Zap, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminMemberDetailModal({ 
  profile, 
  isOpen, 
  onClose, 
  onSyncProfile, 
  onEditProfile, 
  onDeleteProfile, 
  onOpenPublicView 
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen || !profile) return null;

  const solved = profile.totalSolved ?? (profile.badges?.reduce((s, b) => s + (b.solved || 0), 0) || 0);
  const stars = profile.totalStars ?? (profile.badges?.reduce((s, b) => s + (b.stars || 0), 0) || 0);
  const points = profile.totalPoints ?? (profile.scores?.reduce((s, sc) => s + (sc.practice?.score || 0), 0) || 0);
  const rank = profile.bestRank || profile.scores?.find(s => s.practice?.rank > 0)?.practice?.rank || null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncProfile(profile.username);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-400 hover:text-white rounded-lg border border-[#263545] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Member Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-[#2EC866]/50"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`; }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{profile.name || profile.username}</h2>
              <span className="text-xs font-mono text-[#00EA64] font-bold">@{profile.username}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              HackerRank Member {profile.school && `• ${profile.school}`}
            </p>
          </div>
        </div>

        {/* HackerRank Live Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <p className="text-[10px] uppercase font-mono text-slate-400">Solved</p>
            <p className="text-base font-black text-[#00EA64] font-mono mt-0.5">{solved}</p>
          </div>
          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <p className="text-[10px] uppercase font-mono text-slate-400">Stars</p>
            <p className="text-base font-black text-amber-400 font-mono mt-0.5">★ {stars}</p>
          </div>
          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <p className="text-[10px] uppercase font-mono text-slate-400">Points</p>
            <p className="text-base font-black text-cyan-400 font-mono mt-0.5">{points}</p>
          </div>
          <div className="p-3 bg-[#0E141E] rounded-xl border border-[#263545] text-center">
            <p className="text-[10px] uppercase font-mono text-slate-400">Rank</p>
            <p className="text-base font-black text-white font-mono mt-0.5 truncate">
              {rank ? `#${rank.toLocaleString()}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Internal Admin Metadata */}
        <div className="p-4 bg-[#0E141E] rounded-xl border border-[#263545] space-y-3 text-xs font-mono">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Internal Management Metadata
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">Group / Batch:</span>
              <span className="font-bold text-white">{profile.customMeta?.batch || 'Default Group'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Tracking Status:</span>
              <span className="font-bold text-[#00EA64]">{profile.customMeta?.status || 'Active'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Last Synced:</span>
              <span className="text-slate-300">
                {profile.lastSynced ? new Date(profile.lastSynced).toLocaleString() : 'Recently'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Profile URL:</span>
              <a
                href={`https://www.hackerrank.com/profile/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00EA64] hover:underline truncate block"
              >
                hackerrank.com/profile/{profile.username}
              </a>
            </div>
          </div>

          {profile.customMeta?.notes && (
            <div className="pt-2 border-t border-[#263545]/60">
              <span className="text-slate-500 block text-[10px]">Admin Notes:</span>
              <p className="text-slate-300 text-xs font-sans mt-0.5">{profile.customMeta.notes}</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#263545]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPublicView(profile.username);
              }}
              className="px-3.5 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-200 hover:text-[#00EA64] font-semibold text-xs rounded-xl border border-[#263545] transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open Public View</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEditProfile(profile);
              }}
              className="px-3.5 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-[#263545] transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#00EA64]" />
              <span>Edit Metadata</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-[#263545] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00EA64]' : ''}`} />
              <span>Sync Now</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Remove @${profile.username} from tracking?`)) {
                  onClose();
                  onDeleteProfile(profile.username);
                }
              }}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs rounded-xl border border-red-500/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
