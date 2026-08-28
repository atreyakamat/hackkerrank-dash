import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Download, 
  Eye, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Filter, 
  Users, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  FileSpreadsheet,
  ArrowRight,
  Check,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { validateHackerRankInput } from '../services/api';

export default function AdminPanel({ 
  profiles = [], 
  onAddProfile, 
  onBatchImport, 
  onDeleteProfile, 
  onSyncProfile, 
  onSyncAll, 
  onSelectProfile, 
  onEditProfile,
  isLoading
}) {
  const [inputUsername, setInputUsername] = useState('');
  const [batchTag, setBatchTag] = useState('Core Group');
  const [statusTag, setStatusTag] = useState('Active');
  const [notesInput, setNotesInput] = useState('');
  
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchStep, setFetchStep] = useState(null); // 'validating', 'fetching', 'pushing', 'done'
  const [statusMessage, setStatusMessage] = useState(null);
  const [lastAddedProfile, setLastAddedProfile] = useState(null);

  // Live input validation
  const validation = validateHackerRankInput(inputUsername);

  // Handle single profile add with validation and immediate push to frontend
  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (!validation.isValid) {
      setStatusMessage({ type: 'error', text: validation.error || 'Please enter a valid HackerRank username or URL' });
      return;
    }

    setIsSubmitting(true);
    setFetchStep('validating');
    setStatusMessage({ type: 'loading', text: `Validating @${validation.sanitizedUsername}...` });

    try {
      setFetchStep('fetching');
      setStatusMessage({ type: 'loading', text: `Connecting to HackerRank REST API for @${validation.sanitizedUsername}...` });

      const res = await onAddProfile(inputUsername.trim(), {
        batch: batchTag,
        status: statusTag,
        notes: notesInput || 'Added via Admin Console'
      });

      setFetchStep('pushing');
      setStatusMessage({ type: 'loading', text: `Pushing @${res.username} to Frontend State & Database...` });

      setLastAddedProfile(res);
      setStatusMessage({ 
        type: 'success', 
        text: `✅ Successfully fetched & pushed @${res.username} (${res.totalSolved || 0} solved, ★ ${res.totalStars || 0} stars) to frontend!` 
      });

      setInputUsername('');
      setNotesInput('');
      setFetchStep('done');
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2EC866', '#00EA64', '#FFA116']
      });

    } catch (err) {
      setFetchStep(null);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch HackerRank profile. Please check username.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle batch import
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    setIsSubmitting(true);
    try {
      await onBatchImport(batchText);
      setShowBatchModal(false);
      setBatchText('');
      setStatusMessage({ type: 'success', text: 'Batch profiles imported and pushed to frontend!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed during batch import' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Username', 'Name', 'Country', 'School', 'Total Stars', 'Total Solved', 'Total Points', 'Best Rank', 'Batch', 'Status', 'Notes', 'HackerRank URL'];
    const rows = profiles.map(p => [
      p.username,
      `"${p.name || p.username}"`,
      `"${p.country || ''}"`,
      `"${p.school || ''}"`,
      p.totalStars || 0,
      p.totalSolved || 0,
      p.totalPoints || 0,
      p.bestRank || '',
      `"${p.customMeta?.batch || ''}"`,
      `"${p.customMeta?.status || ''}"`,
      `"${(p.customMeta?.notes || '').replace(/"/g, '""')}"`,
      `https://www.hackerrank.com/profile/${p.username}`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hackerrank_peers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableBatches = ['ALL', ...new Set(profiles.map(p => p.customMeta?.batch).filter(Boolean))];
  const availableStatuses = ['ALL', 'Active', 'Interview Ready', 'Review', 'Placed'];

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.username?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.name?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.school?.toLowerCase().includes(tableSearch.toLowerCase());
    
    const matchesBatch = selectedBatchFilter === 'ALL' || p.customMeta?.batch === selectedBatchFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.customMeta?.status === selectedStatusFilter;

    return matchesSearch && matchesBatch && matchesStatus;
  });

  const totalSolvedCohort = profiles.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
  const totalStarsCohort = profiles.reduce((sum, p) => sum + (p.totalStars || 0), 0);
  const avgStars = profiles.length > 0 ? (totalStarsCohort / profiles.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#182535] via-[#151F2C] to-[#121B27] border border-[#263545] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Admin Management Hub</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                /hacko/admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Validate and add HackerRank profiles, push updates directly to the frontend tracker, and manage the peer group.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-[#263545] transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00EA64]" />
            <span>Batch Import</span>
          </button>
          <button
            onClick={onSyncAll}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-[#263545] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00EA64]' : ''}`} />
            <span>Sync All</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="hr-card p-4 text-center">
          <p className="text-[10px] uppercase font-mono text-slate-400">Total Peers</p>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">{profiles.length}</p>
        </div>
        <div className="hr-card p-4 text-center">
          <p className="text-[10px] uppercase font-mono text-slate-400">Group Solved</p>
          <p className="text-xl sm:text-2xl font-black text-[#00EA64] font-mono mt-1">{totalSolvedCohort}</p>
        </div>
        <div className="hr-card p-4 text-center">
          <p className="text-[10px] uppercase font-mono text-slate-400">Average Stars</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">★ {avgStars}</p>
        </div>
        <div className="hr-card p-4 text-center">
          <p className="text-[10px] uppercase font-mono text-slate-400">Active Status</p>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">Synced</p>
        </div>
      </div>

      {/* Add Profile Card Form with Real-Time Validation */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00EA64]" />
            <h2 className="text-base sm:text-lg font-bold text-white">Add Peer Profile & Push to Frontend</h2>
          </div>
          {inputUsername.trim() && (
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              validation.isValid 
                ? 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/40' 
                : 'bg-red-500/15 text-red-400 border-red-500/40'
            }`}>
              {validation.isValid ? `✓ Valid Format: @${validation.sanitizedUsername}` : `✗ ${validation.error}`}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Enter a HackerRank username (e.g. <span className="font-mono text-[#00EA64]">atkamat1204</span>) or full URL (e.g. <span className="font-mono text-slate-300">https://www.hackerrank.com/profile/atkamat1204</span>). Data is validated, fetched from HackerRank REST endpoints, and pushed to the live frontend immediately.
        </p>

        <form onSubmit={handleAddSingle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Username / URL Input */}
            <div className="md:col-span-6">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                HackerRank Username or Profile URL *
              </label>
              <input
                type="text"
                placeholder="e.g. atkamat1204 or https://www.hackerrank.com/profile/atkamat1204"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                required
                className={`w-full bg-[#0E141E] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono ${
                  inputUsername.trim() 
                    ? validation.isValid ? 'border-[#2EC866] focus:border-[#00EA64]' : 'border-red-500 focus:border-red-400'
                    : 'border-[#263545] focus:border-[#2EC866]'
                }`}
              />
            </div>

            {/* Group Tag */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Group / Section
              </label>
              <input
                type="text"
                placeholder="e.g. Core Group"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
              />
            </div>

            {/* Status Select */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Peer Status
              </label>
              <select
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#2EC866]"
              >
                <option value="Active">Active</option>
                <option value="Interview Ready">Interview Ready</option>
                <option value="Review">Review</option>
                <option value="Placed">Placed</option>
              </select>
            </div>

            {/* Notes Input */}
            <div className="md:col-span-9">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Admin Notes / Peer Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on Python & Problem Solving, target: 5 Stars"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || !inputUsername.trim() || !validation.isValid}
                className="w-full py-2.5 bg-[#2EC866] hover:bg-[#24a152] text-black font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-[#2EC866]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating & Pushing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Validate & Push to Live</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Live Validation & Status Banner */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono animate-in fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/40' 
              : statusMessage.type === 'loading'
              ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
              : 'bg-red-500/15 text-red-400 border-red-500/40'
          }`}>
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {statusMessage.type === 'loading' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>

            {/* 1-Click Push/View Action on Success */}
            {statusMessage.type === 'success' && lastAddedProfile && (
              <button
                onClick={() => onSelectProfile(lastAddedProfile.username)}
                className="px-4 py-1.5 bg-[#2EC866] hover:bg-[#00EA64] text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all shrink-0"
              >
                <span>🚀 View on Frontend Dashboard Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Profiles Management Table */}
      <div className="hr-card p-5 sm:p-6 space-y-4">
        
        {/* Table Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00EA64]" />
            <h3 className="text-base font-bold text-white">
              Manage Peer Profiles ({filteredProfiles.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search peers..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
              />
            </div>

            {/* Batch filter */}
            {availableBatches.length > 2 && (
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="bg-[#0E141E] border border-[#263545] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#2EC866]"
              >
                {availableBatches.map(b => (
                  <option key={b} value={b}>Group: {b}</option>
                ))}
              </select>
            )}

            {/* Status filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#0E141E] border border-[#263545] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#2EC866]"
            >
              {availableStatuses.map(s => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-[#263545]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E141E] text-slate-400 font-mono uppercase text-[11px] border-b border-[#263545]">
              <tr>
                <th className="px-4 py-3">Peer Profile</th>
                <th className="px-3 py-3 text-center">Stars & Badges</th>
                <th className="px-3 py-3 text-center">Solved</th>
                <th className="px-3 py-3 text-center">Track Points</th>
                <th className="px-3 py-3">Group Tag</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263545]/60 bg-[#151F2C]">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-mono">
                    No peers found. Add one above!
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  return (
                    <tr key={p.username} className="hover:bg-[#1E2A38] transition-colors group">
                      
                      {/* Peer Name + Username */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatar}
                            alt={p.username}
                            className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-[#2EC866]/40"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                          />
                          <div>
                            <p className="font-bold text-white">{p.name || p.username}</p>
                            <a
                              href={`https://www.hackerrank.com/profile/${p.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[#00EA64] hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <span>@{p.username}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Stars & Badges */}
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          ★ {p.totalStars || 0}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {p.badges?.length || 0} Badges
                        </p>
                      </td>

                      {/* Solved */}
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-white">
                        <span className="text-[#00EA64]">{p.totalSolved || 0}</span>
                      </td>

                      {/* Track Points */}
                      <td className="px-3 py-3.5 text-center font-mono text-slate-300">
                        {p.totalPoints || 0}
                      </td>

                      {/* Group Tag */}
                      <td className="px-3 py-3.5 font-mono text-slate-300">
                        {p.customMeta?.batch || 'Core Group'}
                      </td>

                      {/* Notes */}
                      <td className="px-3 py-3.5 text-slate-400 max-w-xs truncate">
                        {p.customMeta?.notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View on Frontend Dashboard */}
                          <button
                            onClick={() => onSelectProfile(p.username)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#2EC866] hover:text-black text-slate-300 rounded-lg border border-[#263545] transition-all"
                            title="View Peer on Live Dashboard"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Sync Live Profile */}
                          <button
                            onClick={() => onSyncProfile(p.username)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-[#00EA64] rounded-lg border border-[#263545] transition-all"
                            title="Sync with HackerRank"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            onClick={() => onEditProfile(p)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded-lg border border-[#263545] transition-all"
                            title="Edit Peer Meta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove @${p.username} from peer hub?`)) {
                                onDeleteProfile(p.username);
                              }
                            }}
                            className="p-1.5 bg-[#0E141E] hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-[#263545] transition-all"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowBatchModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold bg-[#0E141E] w-8 h-8 rounded-full border border-[#263545] flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Batch Import Peer Profiles</h3>
                <p className="text-xs text-slate-400">Paste multiple usernames or HackerRank URLs (one per line or comma-separated)</p>
              </div>
            </div>

            <form onSubmit={handleBatchSubmit} className="mt-4 space-y-4">
              <textarea
                rows={6}
                placeholder="atkamat1204&#10;https://www.hackerrank.com/profile/saurabh_singh&#10;shashank21j"
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                required
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono leading-relaxed"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 rounded-xl text-xs font-semibold border border-[#263545]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !batchText.trim()}
                  className="px-5 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating & Pushing...</span>
                    </>
                  ) : (
                    <span>Import & Push to Live</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
