import React, { useState, useEffect } from 'react';
import { 
  api, 
  DEFAULT_PROFILES 
} from './services/api';
import Navbar from './components/Navbar';
import PublicAnalyticsDashboard from './components/PublicAnalyticsDashboard';
import IndividualPeerAnalytics from './components/IndividualPeerAnalytics';
import LeaderboardView from './components/LeaderboardView';
import ComparisonView from './components/ComparisonView';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import EditProfileModal from './components/EditProfileModal';
import { 
  RefreshCw, 
  Unlock, 
  ArrowLeft, 
  LogOut
} from 'lucide-react';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();
  
  // Secret admin route detection: /hacko/admin
  const isDirectAdminUrl = path === '/hacko/admin' || path === '/hacko/admin/' || searchParams.get('admin') === 'true';

  const [isAdminRoute, setIsAdminRoute] = useState(isDirectAdminUrl);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('hr_admin_auth') === 'true'
  );

  // Peer deep-link detection: ?peer=username
  const initialPeerParam = searchParams.get('peer');
  const initialTabParam = isDirectAdminUrl 
    ? 'admin' 
    : (searchParams.get('tab') || 'overview');

  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [selectedPeerUsername, setSelectedPeerUsername] = useState(initialPeerParam);
  const [activeTab, setActiveTab] = useState(initialTabParam); // 'overview', 'leaderboard', 'compare', 'admin'
  const [isLoading, setIsLoading] = useState(true);
  const [editProfileData, setEditProfileData] = useState(null);

  // Sync URL search params cleanly
  useEffect(() => {
    const url = new URL(window.location.href);
    if (isAdminRoute && activeTab === 'admin') {
      window.history.replaceState({}, '', '/hacko/admin');
    } else {
      url.pathname = '/';
      url.searchParams.delete('admin');
      
      if (selectedPeerUsername) {
        url.searchParams.set('peer', selectedPeerUsername);
        url.searchParams.delete('tab');
      } else {
        url.searchParams.delete('peer');
        if (activeTab && activeTab !== 'overview') {
          url.searchParams.set('tab', activeTab);
        } else {
          url.searchParams.delete('tab');
        }
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab, selectedPeerUsername, isAdminRoute]);

  // Load all peer profiles on boot
  useEffect(() => {
    loadAllProfiles(false);

    // Lightweight frontend polling every 60s to retrieve refreshed backend data
    const pollInterval = setInterval(() => {
      loadAllProfiles(true);
    }, 60 * 1000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadAllProfiles = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await api.getProfiles();
      if (Array.isArray(data)) {
        setProfiles(data);
      }
    } catch (e) {
      console.warn('Failed to load profiles:', e.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Peer selection handler
  const handleSelectPeer = (username) => {
    setSelectedPeerUsername(username);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Actions
  const handleAddProfile = async (input, customMeta) => {
    const fresh = await api.addProfile(input, customMeta);
    await loadAllProfiles(true);
    return fresh;
  };

  const handleBatchImport = async (inputs) => {
    const res = await api.batchImport(inputs);
    await loadAllProfiles(true);
    return res;
  };

  const handleDeleteProfile = async (username) => {
    await api.deleteProfile(username);
    await loadAllProfiles(true);
  };

  const handleSaveProfileMeta = async (username, payload) => {
    await api.updateProfileMeta(username, payload);
    await loadAllProfiles(true);
  };

  const handleSyncProfile = async (username) => {
    const res = await api.syncProfile(username);
    await loadAllProfiles(true);
    return res;
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      const res = await api.syncAllProfiles();
      await loadAllProfiles(true);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitAdmin = () => {
    setIsAdminRoute(false);
    setActiveTab('overview');
    setSelectedPeerUsername(null);
    window.history.pushState({}, '', '/');
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('hr_admin_auth');
    localStorage.removeItem('hr_admin_pwd');
    setIsAdminAuthenticated(false);
    handleExitAdmin();
  };

  const selectedProfile = profiles.find(
    p => p.username.toLowerCase() === selectedPeerUsername?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#0E141E] text-slate-100 flex flex-col selection:bg-[#2EC866]/30 selection:text-[#00EA64]">
      
      {/* 1. Admin Authentication Barrier for /hacko/admin */}
      {isAdminRoute && !isAdminAuthenticated && (
        <AdminLoginModal
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onCancel={handleExitAdmin}
        />
      )}

      {/* 2. Admin Mode Active Banner */}
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
              <span>View Public Analytics</span>
            </button>
            <button
              onClick={handleLogoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/40 text-[11px] font-bold transition-all"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Global Navbar */}
      <Navbar
        profiles={profiles}
        selectedPeerUsername={selectedPeerUsername}
        onSelectPeer={handleSelectPeer}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedPeerUsername(null);
          setActiveTab(tab);
        }}
        isAdminRoute={isAdminRoute}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* 4. Main Analytics Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-4 text-[#00EA64] font-mono text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing Peer Group Data...</span>
          </div>
        )}

        {/* PUBLIC VIEW A: Individual Peer Analytics (when ?peer=username or clicked) */}
        {selectedPeerUsername && selectedProfile && (
          <IndividualPeerAnalytics
            profile={selectedProfile}
            onBackToGroup={() => setSelectedPeerUsername(null)}
          />
        )}

        {/* PUBLIC VIEW B: Main Public Peer Analytics Dashboard (Default /) */}
        {!selectedPeerUsername && activeTab === 'overview' && (
          <PublicAnalyticsDashboard
            profiles={profiles}
            selectedPeerUsername={selectedPeerUsername}
            onSelectPeer={handleSelectPeer}
          />
        )}

        {/* PUBLIC VIEW C: Group Leaderboard */}
        {!selectedPeerUsername && activeTab === 'leaderboard' && (
          <LeaderboardView
            profiles={profiles}
            onSelectProfile={handleSelectPeer}
          />
        )}

        {/* PUBLIC VIEW D: Side-by-Side Peer Comparison */}
        {!selectedPeerUsername && activeTab === 'compare' && (
          <ComparisonView
            profiles={profiles}
            defaultUser1={profiles[0]?.username}
            defaultUser2={profiles[1]?.username}
          />
        )}

        {/* ADMIN VIEW: Admin Hub (Only accessible at /hacko/admin) */}
        {isAdminRoute && isAdminAuthenticated && activeTab === 'admin' && (
          <AdminPanel
            profiles={profiles}
            onAddProfile={handleAddProfile}
            onBatchImport={handleBatchImport}
            onDeleteProfile={handleDeleteProfile}
            onSyncProfile={handleSyncProfile}
            onSyncAll={handleSyncAll}
            onSelectProfile={handleSelectPeer}
            onEditProfile={(p) => setEditProfileData(p)}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* 5. Minimal Clean Public Analytics Footer */}
      <footer className="border-t border-[#263545] bg-[#0E141E] py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00EA64] font-black">[H]</span>
            <span className="text-slate-300 font-semibold">HackerRank Peer Analytics Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Visual Performance Intelligence</span>
            <span>•</span>
            <span>Live Peer Cohort Tracking</span>
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

    </div>
  );
}
