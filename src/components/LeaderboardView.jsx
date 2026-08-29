import React, { useState } from 'react';
import LeaderboardSection from './LeaderboardSection';
import PublicMemberDetailModal from './PublicMemberDetailModal';

export default function LeaderboardView({ profiles = [], onSelectProfile }) {
  const [inspectProfile, setInspectProfile] = useState(null);

  const handleInspect = (username) => {
    const found = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setInspectProfile(found);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <LeaderboardSection
        profiles={profiles}
        onSelectPeer={handleInspect}
      />

      {inspectProfile && (
        <PublicMemberDetailModal
          profile={inspectProfile}
          isOpen={Boolean(inspectProfile)}
          onClose={() => setInspectProfile(null)}
          onOpenFullView={(username) => {
            setInspectProfile(null);
            onSelectProfile(username);
          }}
        />
      )}
    </div>
  );
}
