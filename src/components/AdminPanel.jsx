import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Eye, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  FileSpreadsheet,
  ArrowRight,
  Send,
  Filter,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { validateHackerRankInput } from '../services/api';
import AdminMemberDetailModal from './AdminMemberDetailModal';

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
  const [fetchStep, setFetchStep] = useState(null); // 'validating', 'fetching', 'processing', 'done'
  const [statusMessage, setStatusMessage] = useState(null);
  const [detailModalProfile, setDetailModalProfile] = useState(null);

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
      setStatusMessage({ type: 'loading', text: `Fetching profile data from HackerRank API for @${validation.sanitizedUsername}...` });

      setFetchStep('processing');
      const res = await onAddProfile(inputUsername.trim(), {
        batch: batchTag,
        status: statusTag,
        notes: notesInput || 'Added via Admin Console'
      });

      setStatusMessage({ 
        type: 'success', 
        text: `✅ Added @${res.username} successfully (${res.totalSolved || 0} solved, ★ ${res.totalStars || 0} stars)! Pushed to live public dashboard.` 
      });

      setInputUsername('');
      setNotesInput('');
      setFetchStep('done');
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2EC866', '#00EA64']
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
      setStatusMessage({ type: 'success', text: 'Batch members successfully imported and published!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed during batch import' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Username', 'Name', 'Country', 'School', 'Total Stars', 'Total Solved', 'Total Points', 'Best Rank', 'Group', 'Status', 'Notes', 'HackerRank URL'];
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
    link.setAttribute('download', `peer_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableBatches = ['ALL', ...new Set(profiles.map(p => p.customMeta?.batch).filter(Boolean))];
  const availableStatuses = ['ALL', 'Active', 'Watching', 'Review', 'Completed'];

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.username?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.name?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.school?.toLowerCase().includes(tableSearch.toLowerCase());
    
    const matchesBatch = selectedBatchFilter === 'ALL' || p.customMeta?.batch === selectedBatchFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.customMeta?.status === selectedStatusFilter;

    return matchesSearch && matchesBatch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Admin Header & Minimal Status Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121B27] border border-[#263545] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Peer Tracker Admin</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                /hacko/admin
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {profiles.length} Tracked Members • Private Management & Live Sync
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-[#263545] transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00EA64]" />
            <span>Batch Import</span>
          </button>
          
          <button
            onClick={onSyncAll}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#151F2C] hover:bg-[#1E2A38] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-[#263545] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00EA64]' : ''}`} />
            <span>Sync All Members</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Add Member Form Card */}
      <div className="hr-card p-5 sm:p-6 space-y-4 border border-[#263545] bg-[#121B27]">
        <div className="flex items-center justify-between pb-2 border-b border-[#263545]/60">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#00EA64]" />
            <h3 className="text-sm sm:text-base font-bold text-white">Add HackerRank Member</h3>
          </div>
          {inputUsername.trim() && (
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              validation.isValid 
                ? 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/40' 
                : 'bg-red-500/15 text-red-400 border-red-500/40'
            }`}>
              {validation.isValid ? `✓ Format Valid: @${validation.sanitizedUsername}` : `✗ ${validation.error}`}
            </span>
          )}
        </div>

        <form onSubmit={handleAddSingle} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Input Username/URL */}
            <div className="md:col-span-6">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Username or Profile URL *
              </label>
              <input
                type="text"
                placeholder="e.g. atkamat1204 or https://www.hackerrank.com/profile/username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                required
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#2EC866] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Group */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Group / Batch
              </label>
              <input
                type="text"
                placeholder="e.g. Core Group"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#2EC866] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Status
              </label>
              <select
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#2EC866] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              >
                <option value="Active">Active</option>
                <option value="Watching">Watching</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-9">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Admin Notes (Internal only)
              </label>
              <input
                type="text"
                placeholder="Optional internal remarks..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#2EC866] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || !inputUsername.trim() || !validation.isValid}
                className="w-full py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-extrabold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>+ Add & Push to Hub</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Live Feedback */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-mono animate-in fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-[#2EC866]/15 text-[#00EA64] border-[#2EC866]/40' 
              : statusMessage.type === 'loading'
              ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
              : 'bg-red-500/15 text-red-400 border-red-500/40'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'loading' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

      </div>

      {/* 3. Member Management Table */}
      <div className="hr-card p-5 sm:p-6 space-y-4 border border-[#263545] bg-[#121B27]">
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#263545]/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00EA64]" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Manage Tracked Members ({filteredProfiles.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono"
              />
            </div>

            {/* Group Filter */}
            {availableBatches.length > 2 && (
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="bg-[#0E141E] border border-[#263545] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none font-mono"
              >
                {availableBatches.map(b => (
                  <option key={b} value={b}>Group: {b}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#0E141E] border border-[#263545] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none font-mono"
            >
              {availableStatuses.map(s => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Management Table */}
        <div className="overflow-x-auto rounded-xl border border-[#263545]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E141E] text-slate-400 font-mono uppercase text-[10px] border-b border-[#263545]">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-3 py-3 text-center">Solved</th>
                <th className="px-3 py-3 text-center">Stars</th>
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last Sync</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263545]/60 bg-[#121B27]">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-mono">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const solved = p.totalSolved ?? (p.badges?.reduce((s, b) => s + (b.solved || 0), 0) || 0);
                  const stars = p.totalStars ?? (p.badges?.reduce((s, b) => s + (b.stars || 0), 0) || 0);

                  return (
                    <tr key={p.username} className="hover:bg-[#151F2C] transition-colors group">
                      
                      {/* Member */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatar}
                            alt={p.username}
                            className="w-7 h-7 rounded-full object-cover bg-slate-800 border border-[#263545]"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                          />
                          <div>
                            <p className="font-bold text-white">{p.name || p.username}</p>
                            <p className="text-[10px] font-mono text-[#00EA64]">@{p.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Solved */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-white">
                        <span className="text-[#00EA64]">{solved}</span>
                      </td>

                      {/* Stars */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-amber-400">
                        ★ {stars}
                      </td>

                      {/* Group */}
                      <td className="px-3 py-3 font-mono text-slate-300">
                        {p.customMeta?.batch || 'Core Group'}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#151F2C] text-slate-300 border border-[#263545]">
                          {p.customMeta?.status || 'Active'}
                        </span>
                      </td>

                      {/* Last Sync */}
                      <td className="px-3 py-3 font-mono text-slate-400 text-[10px]">
                        {p.lastSynced ? new Date(p.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* View Detail Modal */}
                          <button
                            onClick={() => setDetailModalProfile(p)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded-lg border border-[#263545] transition-colors"
                            title="View Member Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            onClick={() => onEditProfile(p)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-[#00EA64] rounded-lg border border-[#263545] transition-colors"
                            title="Edit Metadata"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Sync Now */}
                          <button
                            onClick={() => onSyncProfile(p.username)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded-lg border border-[#263545] transition-colors"
                            title="Sync HackerRank Data"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove @${p.username} from tracking?`)) {
                                onDeleteProfile(p.username);
                              }
                            }}
                            className="p-1.5 bg-[#0E141E] hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-[#263545] transition-colors"
                            title="Delete Member"
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

      {/* Detail Modal */}
      {detailModalProfile && (
        <AdminMemberDetailModal
          profile={detailModalProfile}
          isOpen={Boolean(detailModalProfile)}
          onClose={() => setDetailModalProfile(null)}
          onSyncProfile={onSyncProfile}
          onEditProfile={onEditProfile}
          onDeleteProfile={onDeleteProfile}
          onOpenPublicView={onSelectProfile}
        />
      )}

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowBatchModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Batch Import Members</h3>
                <p className="text-xs text-slate-400">Paste multiple usernames or HackerRank URLs (comma or newline separated)</p>
              </div>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <textarea
                rows={6}
                placeholder="atkamat1204&#10;https://www.hackerrank.com/profile/saurabh_singh&#10;username3"
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                required
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2.5">
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
                  className="px-4 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-extrabold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import & Publish</span>
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
