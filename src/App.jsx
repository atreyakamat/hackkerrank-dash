import React, { useState, useEffect } from 'react';
import { 
  api, 
  DEFAULT_PROFILES, 
  extractUsername 
} from './services/api';
import Navbar from './components/Navbar';
import ProfileHero from './components/ProfileHero';
import PeerOverviewStrip from './components/PeerOverviewStrip';
import DashboardPeerBarGraph from './components/DashboardPeerBarGraph';
import MetricsCards from './components/MetricsCards';
import BadgesSection from './components/BadgesSection';
import SubmissionHeatmap from './components/SubmissionHeatmap';
import SkillsTrackSection from './components/SkillsTrackSection';
import RecentSubmissions from './components/RecentSubmissions';
import CertificationsSection from './components/CertificationsSection';
import PeerAnalyticsGraphs from './components/PeerAnalyticsGraphs';
import IndividualProfileGraphs from './components/IndividualProfileGraphs';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import LeaderboardView from './components/LeaderboardView';
import ComparisonView from './components/ComparisonView';
import EditProfileModal from './components/EditProfileModal';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  Trophy, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Plus,
  BarChart3,
  Share2,
  Lock,
  Unlock,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();
  
  // Check if accessing the secret /hacko/admin route
  const isDirectAdminUrl = path === '/hacko/admin' || path === '/hacko/admin/' || searchParams.get('admin') === 'true';

  const [isAdminRoute, setIsAdminRoute] = useState(isDirectAdminUrl);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('hr_admin_auth') === 'true'
  );
  
  const initialPeer = searchParams.get('peer') || 'atkamat1204';
  
  // DEFAULT TO 'dashboard' FOR CLEAN INITIAL VIEW
  const initialTab = isDirectAdminUrl 
    ? (searchParams.get('tab') || 'admin')
    : (searchParams.get('tab') || 'dashboard');

  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [activeUsername, setActiveUsername] = useState(initialPeer);
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard (default clean), analytics, leaderboard, compare, admin
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Modal states
  const [editProfileData, setEditProfileData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [quickAddBatch, setQuickAddBatch] = useState('Core Group');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Sync URL when tab/peer changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (isAdminRoute && activeTab === 'admin') {
      window.history.replaceState({}, '', '/hacko/admin');
    } else {
      url.searchParams.set('tab', activeTab);
      if (activeUsername) {
        url.searchParams.set('peer', activeUsername);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab, activeUsername, isAdminRoute]);

  // Initial load
  useEffect(() => {
    loadAllProfiles();
  }, []);

  const loadAllProfiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getProfiles();
      if (Array.isArray(data) && data.length > 0) {
        setProfiles(data);
        
        const exists = data.find(p => p.username.toLowerCase() === activeUsername.toLowerCase());
        if (!exists && initialPeer) {
          try {
            const fetched = await api.getProfile(initialPeer);
            setProfiles(prev => [fetched, ...prev]);
            setActiveUsername(fetched.username);
          } catch {
            if (data[0]) setActiveUsername(data[0].username);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
      setErrorMessage('Using cached profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentProfile = profiles.find(
    p => p.username.toLowerCase() === activeUsername.toLowerCase()
  ) || profiles[0];

  // Select profile
  const handleSelectProfile = (username) => {
    setActiveUsername(username);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync current active profile with live HackerRank API
  const handleSyncCurrent = async () => {
    if (!currentProfile) return;
    setIsSyncing(true);
    try {
      const fresh = await api.getProfile(currentProfile.username, true);
      setProfiles(prev => prev.map(p => p.username.toLowerCase() === fresh.username.toLowerCase() ? fresh : p));
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#2EC866', '#00EA64']
      });
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all profiles
  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      await api.syncAllProfiles();
      await loadAllProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  // Add profile (single) & push to frontend
  const handleAddProfile = async (input, customMeta) => {
    const fresh = await api.addProfile(input, customMeta);
    setProfiles(prev => {
      const existsIdx = prev.findIndex(p => p.username.toLowerCase() === fresh.username.toLowerCase());
      if (existsIdx >= 0) {
        const next = [...prev];
        next[existsIdx] = fresh;
        return next;
      }
      return [fresh, ...prev];
    });
    setActiveUsername(fresh.username);
    await loadAllProfiles(); // reload to confirm persistent sync
    return fresh;
  };

  // Batch import
  const handleBatchImport = async (inputs) => {
    await api.batchImport(inputs);
    await loadAllProfiles();
  };

  // Delete profile
  const handleDeleteProfile = async (username) => {
    await api.deleteProfile(username);
    const remaining = profiles.filter(p => p.username.toLowerCase() !== username.toLowerCase());
    setProfiles(remaining);
    if (activeUsername.toLowerCase() === username.toLowerCase()) {
      if (remaining.length > 0) {
        setActiveUsername(remaining[0].username);
      }
    }
    await loadAllProfiles();
  };

  // Save metadata
  const handleSaveProfileMeta = async (username, payload) => {
    const res = await api.updateProfileMeta(username, payload);
    if (res?.data) {
      setProfiles(prev => prev.map(p => p.username.toLowerCase() === username.toLowerCase() ? { ...p, ...res.data } : p));
    }
    await loadAllProfiles();
  };

  // Quick add submit handler
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickAddInput.trim()) return;
    setIsQuickAdding(true);
    try {
      const added = await handleAddProfile(quickAddInput.trim(), {
        batch: quickAddBatch,
        status: 'Active',
        notes: 'Added to peer tracking list'
      });
      setShowAddModal(false);
      setQuickAddInput('');
      setActiveTab('dashboard');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#2EC866', '#00EA64']
      });
    } catch (err) {
      alert(err.message || 'Failed to fetch HackerRank user');
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Exit admin mode back to public tracker
  const handleExitAdmin = () => {
    setIsAdminRoute(false);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
  };

  // Lock / Logout Admin
  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('hr_admin_auth');
    localStorage.removeItem('hr_admin_pwd');
    setIsAdminAuthenticated(false);
    handleExitAdmin();
  };

  return (
    <div className="min-h-screen bg-[#0E141E] text-slate-100 flex flex-col selection:bg-[#2EC866]/30 selection:text-[#00EA64]">
      
      {/* Admin Password Authentication Screen for /hacko/admin */}
      {isAdminRoute && !isAdminAuthenticated && (
        <AdminLoginModal
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onCancel={handleExitAdmin}
        />
      )}

      {/* Secret Admin Banner when accessed at /hacko/admin and authenticated */}
      {isAdminRoute && isAdminAuthenticated && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border-b border-amber-500/30 px-4 py-2 text-xs font-mono flex items-center justify-between text-amber-300">
          <div className="flex items-center gap-2">
            <Unlock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">ADMIN CONSOLE ACTIVE (/hacko/admin)</span>
            <span className="hidden md:inline text-slate-400">• Password verified. Changes persist live on Netlify & public hub.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitAdmin}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg border border-amber-500/40 text-[11px] font-bold transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>View Public Hub</span>
            </button>
            <button
              onClick={handleLogoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/40 text-[11px] font-bold transition-all"
              title="Lock Admin Console"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSyncCurrent={handleSyncCurrent}
        isSyncing={isSyncing}
        openAddModal={() => setShowAddModal(true)}
        isAdminRoute={isAdminRoute && isAdminAuthenticated}
        onExitAdmin={handleExitAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Loading status */}
        {isLoading && (
          <div className="flex items-center justify-center p-6 text-[#00EA64] font-mono text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing Peer Profiles from HackerRank...</span>
          </div>
        )}

        {/* DEFAULT TAB 1: CLEAN PEER DASHBOARD (INITIAL VIEW) */}
        {activeTab === 'dashboard' && currentProfile && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Prominent Peer Comparison Bar Graph */}
            <DashboardPeerBarGraph
              profiles={profiles}
              activeUsername={activeUsername}
              onSelectProfile={handleSelectProfile}
            />

            {/* Profile Hero Header */}
            <ProfileHero
              profile={currentProfile}
              onEditClick={(p) => setEditProfileData(p)}
              isAdminRoute={isAdminRoute && isAdminAuthenticated}
            />

            {/* Key Metrics Overview Bar */}
            <MetricsCards profile={currentProfile} />

            {/* Individual Profile Visual Graphs */}
            <IndividualProfileGraphs profile={currentProfile} />

            {/* Badges & Stars Showcase */}
            <BadgesSection
              badges={currentProfile.badges}
              username={currentProfile.username}
            />

            {/* 365-Day Submission Contribution Heatmap */}
            <SubmissionHeatmap
              heatmap={currentProfile.heatmap}
              submissions={currentProfile.submissions}
            />

            {/* Two-Column Layout: Skills Domain Breakdown & Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-7 space-y-6">
                <SkillsTrackSection
                  scores={currentProfile.scores}
                  badges={currentProfile.badges}
                  username={currentProfile.username}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <CertificationsSection
                  certifications={currentProfile.certifications}
                  profile={currentProfile}
                />
              </div>

            </div>

            {/* Recently Solved Coding Submissions */}
            <RecentSubmissions
              submissions={currentProfile.submissions}
              username={currentProfile.username}
            />

          </div>
        )}

        {/* TAB 2: Full Multi-Peer Comparative Bar Graphs */}
        {activeTab === 'analytics' && (
          <PeerAnalyticsGraphs
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            activeUsername={activeUsername}
            onAddProfile={handleAddProfile}
            openAddModal={() => setShowAddModal(true)}
            isAdminRoute={isAdminRoute && isAdminAuthenticated}
          />
        )}

        {/* TAB 3: Peer Group Leaderboard */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {/* TAB 4: Side-by-Side Peer Comparison */}
        {activeTab === 'compare' && (
          <ComparisonView
            profiles={profiles}
            defaultUser1={currentProfile?.username}
            defaultUser2={profiles.find(p => p.username !== currentProfile?.username)?.username}
          />
        )}

        {/* TAB 5: Admin Hub (Add Peer Profiles & Manage - ONLY AT /hacko/admin & AUTHENTICATED) */}
        {activeTab === 'admin' && isAdminRoute && isAdminAuthenticated && (
          <AdminPanel
            profiles={profiles}
            onAddProfile={handleAddProfile}
            onBatchImport={handleBatchImport}
            onDeleteProfile={handleDeleteProfile}
            onSyncProfile={(u) => api.getProfile(u, true).then(loadAllProfiles)}
            onSyncAll={handleSyncAll}
            onSelectProfile={handleSelectProfile}
            onEditProfile={(p) => setEditProfileData(p)}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#263545] bg-[#0E141E] py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00EA64] font-black">[H]</span>
            <span className="text-slate-300 font-semibold">HackerRank Peer Tracker Hub</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Shareable Public Links</span>
            <span>•</span>
            <span>Comparative Bar Graphs</span>
            <span>•</span>
            <a
              href="https://www.hackerrank.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00EA64] hover:underline"
            >
              HackerRank Official
            </a>
          </div>
        </div>
      </footer>

      {/* Edit Profile Metadata Modal (Admin Only) */}
      {editProfileData && isAdminRoute && isAdminAuthenticated && (
        <EditProfileModal
          profile={editProfileData}
          isOpen={Boolean(editProfileData)}
          onClose={() => setEditProfileData(null)}
          onSave={handleSaveProfileMeta}
        />
      )}

      {/* Quick Add Modal (Admin Only) */}
      {showAddModal && isAdminRoute && isAdminAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold bg-[#0E141E] w-8 h-8 rounded-full border border-[#263545] flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add Peer Profile</h3>
                <p className="text-xs text-slate-400">Add friends or classmates to your tracking hub</p>
              </div>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Peer Username or Profile URL *
                </label>
                <input
                  type="text"
                  placeholder="e.g. atkamat1204 or https://www.hackerrank.com/profile/atkamat1204"
                  value={quickAddInput}
                  onChange={(e) => setQuickAddInput(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Group / Tag
                </label>
                <input
                  type="text"
                  value={quickAddBatch}
                  onChange={(e) => setQuickAddBatch(e.target.value)}
                  className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 rounded-xl text-xs font-semibold border border-[#263545]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isQuickAdding || !quickAddInput.trim()}
                  className="px-5 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isQuickAdding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Add Peer</span>
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
