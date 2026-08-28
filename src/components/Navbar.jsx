import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  GitCompare, 
  BarChart3, 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  Share2, 
  Check, 
  ShieldCheck, 
  Unlock,
  ExternalLink,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Navbar({ 
  profiles = [], 
  selectedPeerUsername,
  onSelectPeer, 
  activeTab, 
  setActiveTab, 
  isAdminRoute,
  isAdminAuthenticated
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredProfiles = profiles.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customMeta?.batch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pure public analytics navigation
  const publicTabs = [
    { id: 'overview', label: 'Peer Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'compare', label: 'Compare Peers', icon: GitCompare }
  ];

  const tabs = (isAdminRoute && isAdminAuthenticated)
    ? [...publicTabs, { id: 'admin', label: 'Admin Hub', icon: ShieldCheck, badge: profiles.length }]
    : publicTabs;

  // Handle Clean Public Share Link
  const handleShareLink = () => {
    const url = new URL(window.location.origin);
    if (selectedPeerUsername) {
      url.searchParams.set('peer', selectedPeerUsername);
    } else if (activeTab && activeTab !== 'overview' && activeTab !== 'admin') {
      url.searchParams.set('tab', activeTab);
    }

    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.1 },
      colors: ['#2EC866', '#00EA64']
    });
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const currentSelectedProfile = profiles.find(
    p => p.username.toLowerCase() === selectedPeerUsername?.toLowerCase()
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0E141E]/95 backdrop-blur-md border-b border-[#263545] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Platform Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => {
                onSelectPeer(null);
                setActiveTab('overview');
              }} 
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#151F2C] border border-[#2EC866]/40 flex items-center justify-center shadow-md group-hover:border-[#00EA64] transition-all">
                <span className="font-mono font-black text-[#00EA64] text-xl tracking-tighter">[H]</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide uppercase font-sans">
                    HACKER<span className="text-[#00EA64]">RANK</span>
                  </span>
                  <span className="bg-[#2EC866]/15 text-[#00EA64] border border-[#2EC866]/30 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                    PEER ANALYTICS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Performance Intelligence & Group Tracking</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#151F2C] p-1 rounded-xl border border-[#263545]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !selectedPeerUsername;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectPeer(null);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? tab.id === 'admin'
                        ? 'bg-amber-400 text-black font-bold shadow'
                        : 'bg-[#2EC866] text-black shadow-md shadow-[#2EC866]/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#1E2A38]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black/20 text-black' : 'bg-[#263545] text-[#00EA64]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Share Link & Peer Search Filter */}
          <div className="flex items-center gap-2">
            
            {/* Share Tracker Link Button */}
            <button
              onClick={handleShareLink}
              title="Copy shareable link for peer analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151F2C] hover:bg-[#1E2A38] border border-[#263545] hover:border-[#2EC866]/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-[#00EA64] transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00EA64]" />
                  <span className="text-[#00EA64]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Analytics</span>
                </>
              )}
            </button>

            {/* Peer Quick Inspector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-[#151F2C] hover:bg-[#1E2A38] border border-[#263545] hover:border-[#384d63] px-3 py-1.5 rounded-xl transition-all text-left focus:outline-none"
              >
                {currentSelectedProfile ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={currentSelectedProfile.avatar} 
                      alt={currentSelectedProfile.username}
                      className="w-5 h-5 rounded-full bg-slate-800 object-cover border border-[#2EC866]/60"
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentSelectedProfile.username}`; }}
                    />
                    <span className="text-xs font-mono text-[#00EA64] font-bold max-w-[100px] truncate">
                      @{currentSelectedProfile.username}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Inspect Peer ({profiles.length})</span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Peer Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#151F2C] border border-[#263545] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 pb-2 border-b border-[#263545]">
                    <p className="text-[11px] font-bold uppercase text-slate-400 font-mono tracking-wider mb-1.5">
                      Select Peer to Inspect
                    </p>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search peers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0E141E] border border-[#263545] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2EC866]"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredProfiles.map((p) => {
                      const isSelected = selectedPeerUsername?.toLowerCase() === p.username.toLowerCase();
                      return (
                        <button
                          key={p.username}
                          onClick={() => {
                            onSelectPeer(p.username);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1E2A38] transition-colors ${
                            isSelected ? 'bg-[#2EC866]/10 border-l-2 border-[#2EC866]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={p.avatar}
                              alt={p.username}
                              className="w-6 h-6 rounded-full bg-slate-800 object-cover border border-[#263545]"
                              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`; }}
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{p.name || p.username}</p>
                              <p className="text-[10px] font-mono text-slate-400 truncate">@{p.username}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono font-bold text-[#00EA64]">
                              {p.totalSolved || 0} solved
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPeerUsername && (
                    <div className="p-2 border-t border-[#263545] bg-[#0E141E]/50">
                      <button
                        onClick={() => {
                          onSelectPeer(null);
                          setDropdownOpen(false);
                        }}
                        className="w-full py-1 text-center text-xs font-mono text-slate-400 hover:text-white"
                      >
                        ← Back to Group Overview
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-[#151F2C] border border-[#263545] rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#263545] space-y-1 animate-in slide-in-from-top-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !selectedPeerUsername;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectPeer(null);
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2EC866] text-black font-bold'
                      : 'text-slate-300 hover:bg-[#1E2A38]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-black font-bold' : 'bg-[#151F2C] text-[#00EA64]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
