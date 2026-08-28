import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, ExternalLink, Sparkles, Eye } from 'lucide-react';
import CertificateModal from './CertificateModal';

export default function CertificationsSection({ certifications = [], profile }) {
  const [activeCert, setActiveCert] = useState(null);

  if (!certifications || certifications.length === 0) {
    return (
      <div className="hr-card p-6 text-center">
        <Award className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white">No Certifications Yet</h4>
        <p className="text-xs text-slate-400">Complete HackerRank Skill Certifications to earn credentials.</p>
      </div>
    );
  }

  return (
    <div className="hr-card p-5 sm:p-6 space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2EC866]/15 rounded-lg border border-[#2EC866]/30 text-[#00EA64]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>HackerRank Verified Certifications</span>
              <span className="text-xs font-mono font-bold text-[#00EA64] bg-[#2EC866]/15 px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                {certifications.length} Certified
              </span>
            </h3>
            <p className="text-xs text-slate-400">Industry-recognized skill assessments and role certificates</p>
          </div>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {certifications.map((cert, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#0E141E] border border-[#263545] hover:border-[#2EC866]/60 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#151F2C] to-[#2EC866]/20 border border-[#2EC866]/40 flex items-center justify-center text-[#00EA64] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00EA64] transition-colors">
                      {cert.title}
                    </h4>
                    <p className="text-xs text-slate-400">{cert.issuer || 'HackerRank Certified'}</p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-mono font-bold bg-[#2EC866]/15 text-[#00EA64] px-2 py-0.5 rounded-full border border-[#2EC866]/30">
                  {cert.status || 'Verified'}
                </span>
              </div>

              {/* Skills */}
              {cert.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cert.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-mono bg-[#151F2C] text-slate-300 px-2 py-0.5 rounded border border-[#263545]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with view button */}
            <div className="mt-4 pt-3 border-t border-[#1E2A38] flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Issued {cert.issuedDate || 'Verified'}</span>
              <button
                onClick={() => setActiveCert(cert)}
                className="flex items-center gap-1 text-[#00EA64] hover:text-white font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          profile={profile}
          onClose={() => setActiveCert(null)}
        />
      )}

    </div>
  );
}
