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
  Clock
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
  const [statusMessage, setStatusMessage] = useState(null);
  const [detailModalProfile, setDetailModalProfile] = useState(null);

  // Sync state tracking per member
  const [memberSyncState, setMemberSyncState] = useState({}); // { [username]: { status: 'fetching'|'validating'|'updating'|'done'|'error', text: string } }

  // Live input validation
  const validation = validateHackerRankInput(inputUsername);

  // Handle single profile add with live validation
  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (!validation.isValid) {
      setStatusMessage({ type: 'error', text: validation.error || 'Please enter a valid HackerRank username or URL' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: 'loading', text: `Fetching and validating @${validation.sanitizedUsername} from HackerRank...` });

    try {
      const res = await onAddProfile(inputUsername.trim(), {
        batch: batchTag,
        status: statusTag,
        notes: notesInput || 'Added via Admin Console'
      });

      setStatusMessage({ 
        type: 'success', 
        text: `Successfully added @${res.username} (${res.totalSolved || 0} solved, ★ ${res.totalStars || 0} stars). Published to dashboard.` 
      });

      setInputUsername('');
      setNotesInput('');
      
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2EC866', '#00EA64']
      });

    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch HackerRank profile. Please check username.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle single member manual sync with step-by-step feedback
  const handleSyncSingleMember = async (username) => {
    setMemberSyncState(prev => ({
      ...prev,
      [username]: { status: 'fetching', text: 'Fetching HackerRank data...' }
    }));

    try {
      await new Promise(r => setTimeout(r, 300));
      setMemberSyncState(prev => ({
        ...prev,
        [username]: { status: 'validating', text: 'Validating profile...' }
      }));

      await new Promise(r => setTimeout(r, 300));
      setMemberSyncState(prev => ({
        ...prev,
        [username]: { status: 'updating', text: 'Updating statistics...' }
      }));

      const res = await onSyncProfile(username);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (res?.success === false) {
        setMemberSyncState(prev => ({
          ...prev,
          [username]: { status: 'error', text: `Sync failed: ${res.message || 'Error fetching'}` }
        }));
      } else {
        setMemberSyncState(prev => ({
          ...prev,
          [username]: { status: 'done', text: `Successfully synced at ${timeStr}` }
        }));
      }
    } catch (err) {
      setMemberSyncState(prev => ({
        ...prev,
        [username]: { status: 'error', text: `Sync failed: ${err.message}` }
      }));
    }
  };

  // Handle batch import
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    setIsSubmitting(true);
    setStatusMessage({ type: 'loading', text: 'Importing and validating members...' });
    try {
      await onBatchImport(batchText);
      setShowBatchModal(false);
      setBatchText('');
      setStatusMessage({ type: 'success', text: 'Batch members successfully imported and published!' });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed during batch import' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Username', 'Name', 'Country', 'School', 'Total Stars', 'Total Solved', 'Total Points', 'Group', 'Status', 'Last Synced'];
    const rows = profiles.map(p => [
      p.username,
      `"${p.name || p.username}"`,
      `"${p.country || ''}"`,
      `"${p.school || ''}"`,
      p.totalStars || 0,
      p.totalSolved || 0,
      p.totalPoints || 0,
      `"${p.customMeta?.batch || ''}"`,
      `"${p.customMeta?.status || ''}"`,
      `"${p.lastSyncedAt || p.lastSuccessfulSyncAt || ''}"`
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
      
      {/* 1. Admin Header & Status Bar */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#121B27] border border-[#263545] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Peer Tracker Admin</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                /hacko/admin
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {profiles.length} Tracked Members • Private Management & Live Sync
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3 py-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-lg border border-[#263545] transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00EA64]" />
            <span>Batch Import</span>
          </button>
          
          <button
            onClick={onSyncAll}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-lg border border-[#263545] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00EA64]' : ''}`} />
            <span>Sync All</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#00EA64] hover:bg-[#2EC866] text-black font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Add Member Form Card */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#263545] bg-[#121B27] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#263545]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#00EA64]" />
            <h3 className="text-sm font-bold text-white">Add HackerRank Member</h3>
          </div>
          {inputUsername.trim() && (
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              validation.isValid 
                ? 'bg-[#00EA64]/10 text-[#00EA64] border border-[#00EA64]/30' 
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
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
                placeholder="e.g. atkamat1204 or https://www.hackerrank.com/profile/atkamat1204"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                required
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#00EA64] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Batch / Group Tag */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Cohort / Batch Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Batch 2025"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#00EA64] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
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
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#00EA64] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
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
                Internal Admin Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Preparing for placements"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#00EA64] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || !validation.isValid}
                className="w-full py-2 bg-[#00EA64] hover:bg-[#2EC866] text-black font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Verifying & Adding...' : 'Add Member'}</span>
              </button>
            </div>

          </div>
        </form>

        {/* Status Alerts */}
        {statusMessage && (
          <div className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#00EA64]/10 text-[#00EA64] border-[#00EA64]/30'
              : statusMessage.type === 'error'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* 3. Tracked Member Management Table */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#263545] bg-[#121B27] space-y-4">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263545]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00EA64]" />
            <h3 className="text-sm font-bold text-white">Tracked Peer Members ({filteredProfiles.length})</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Batch Filter */}
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="bg-[#0E141E] border border-[#263545] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none font-mono"
            >
              {availableBatches.map(b => (
                <option key={b} value={b}>Group: {b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#263545]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0E141E] text-slate-400 uppercase text-[10px] border-b border-[#263545]">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-3 py-2.5 text-center">Solved</th>
                <th className="px-3 py-2.5 text-center">Stars</th>
                <th className="px-3 py-2.5">Group</th>
                <th className="px-3 py-2.5">Last Sync Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263545]/60 bg-[#121B27]">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const solved = p.totalSolved ?? 0;
                  const stars = p.totalStars ?? 0;
                  const syncState = memberSyncState[p.username];
                  const syncTime = p.lastSuccessfulSyncAt || p.lastSyncedAt;

                  return (
                    <tr key={p.username} className="hover:bg-[#0E141E] transition-colors group">
                      
                      {/* Member */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatar}
                            alt={p.username}
                            className="w-6 h-6 rounded-md object-cover bg-slate-800 border border-[#263545]"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                          />
                          <div>
                            <p className="font-bold text-white">{p.name || p.username}</p>
                            <p className="text-[10px] text-[#00EA64]">@{p.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Solved */}
                      <td className="px-3 py-2.5 text-center font-bold text-[#00EA64]">
                        {solved}
                      </td>

                      {/* Stars */}
                      <td className="px-3 py-2.5 text-center font-bold text-amber-400">
                        ★ {stars}
                      </td>

                      {/* Group */}
                      <td className="px-3 py-2.5 text-slate-300">
                        {p.customMeta?.batch || 'Core Group'}
                      </td>

                      {/* Last Sync Status / Feedback */}
                      <td className="px-3 py-2.5">
                        {syncState ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {syncState.status === 'done' ? (
                              <span className="text-[#00EA64] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {syncState.text}
                              </span>
                            ) : syncState.status === 'error' ? (
                              <span className="text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {syncState.text}
                              </span>
                            ) : (
                              <span className="text-sky-400 flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                {syncState.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">
                            {syncTime ? new Date(syncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* View Detail Modal */}
                          <button
                            onClick={() => setDetailModalProfile(p)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-white rounded border border-[#263545] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            onClick={() => onEditProfile(p)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 hover:text-[#00EA64] rounded border border-[#263545] transition-colors"
                            title="Edit Meta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Sync Now */}
                          <button
                            onClick={() => handleSyncSingleMember(p.username)}
                            className="p-1.5 bg-[#0E141E] hover:bg-[#1E2A38] text-[#00EA64] rounded border border-[#263545] transition-colors"
                            title="Sync Now"
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
                            className="p-1.5 bg-[#0E141E] hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded border border-[#263545] transition-colors"
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

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121B27] border border-[#263545] rounded-xl max-w-lg w-full p-6 space-y-4 font-mono">
            <h3 className="text-base font-bold text-white">Batch Import HackerRank Usernames</h3>
            <p className="text-xs text-slate-400">
              Enter one username or profile URL per line, or comma-separated.
            </p>
            <textarea
              rows={6}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="atkamat1204&#10;anishparab3_25&#10;https://www.hackerrank.com/profile/gawastanmay373"
              className="w-full bg-[#0E141E] border border-[#263545] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#00EA64]"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-3 py-1.5 bg-[#0E141E] text-slate-400 rounded-lg border border-[#263545]"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchSubmit}
                disabled={isSubmitting || !batchText.trim()}
                className="px-4 py-1.5 bg-[#00EA64] text-black font-bold rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Importing...' : 'Import All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {detailModalProfile && (
        <AdminMemberDetailModal
          profile={detailModalProfile}
          isOpen={Boolean(detailModalProfile)}
          onClose={() => setDetailModalProfile(null)}
          onOpenPublicView={() => {
            onSelectProfile(detailModalProfile.username);
            setDetailModalProfile(null);
          }}
        />
      )}

    </div>
  );
}
