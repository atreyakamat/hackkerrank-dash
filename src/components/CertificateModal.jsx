import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Download, Share2, Printer, ExternalLink } from 'lucide-react';

export default function CertificateModal({ certificate, profile, onClose }) {
  if (!certificate || !profile) return null;

  const certId = certificate.id || `HR-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#0E141E] w-8 h-8 rounded-full border border-[#263545] flex items-center justify-center font-bold text-sm z-20"
        >
          ✕
        </button>

        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-[#2EC866]/40 rounded-xl p-6 sm:p-8 bg-gradient-to-b from-[#0E141E] to-[#121C28] relative shadow-inner">
          
          {/* HackerRank Certificate Header */}
          <div className="flex items-center justify-between border-b border-[#263545] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#151F2C] border border-[#2EC866] flex items-center justify-center font-mono font-black text-[#00EA64]">
                [H]
              </div>
              <div>
                <p className="text-xs font-black tracking-widest uppercase text-white font-sans">HACKERRANK</p>
                <p className="text-[9px] font-mono text-[#00EA64]">CERTIFIED SKILLS</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#2EC866]/15 text-[#00EA64] border border-[#2EC866]/30 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED</span>
            </div>
          </div>

          {/* Certificate Main Body */}
          <div className="text-center py-6 sm:py-8 space-y-3">
            <p className="text-xs uppercase font-mono tracking-widest text-slate-400">
              This certificate is proudly awarded to
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              {profile.name || profile.username}
            </h2>
            <p className="text-xs font-mono text-[#00EA64]">@{profile.username}</p>

            <div className="pt-3 pb-2">
              <p className="text-xs text-slate-300">for successfully demonstrating proficiency in</p>
              <div className="mt-2 inline-block px-5 py-2 rounded-xl bg-[#2EC866]/15 border border-[#2EC866]/50">
                <h3 className="text-lg sm:text-xl font-black text-white">{certificate.title}</h3>
              </div>
            </div>

            {/* Skills validated tags */}
            {certificate.skills && certificate.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {certificate.skills.map((s, idx) => (
                  <span key={idx} className="text-[11px] font-mono bg-[#151F2C] text-slate-300 px-2.5 py-0.5 rounded-full border border-[#263545]">
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certificate Footer with ID and Date */}
          <div className="border-t border-[#263545] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div>
              <p className="text-[10px] text-slate-500">CERTIFICATE ID</p>
              <p className="text-white font-bold">{certId}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-slate-500">ISSUED DATE</p>
              <p className="text-white">{certificate.issuedDate || 'Aug 2024'}</p>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-[#263545] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
          <a
            href={`https://www.hackerrank.com/profile/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg transition-all"
          >
            <span>Verify on HackerRank</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
