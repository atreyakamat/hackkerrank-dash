import React, { useState } from 'react';
import { Edit3, Save, X, ShieldAlert, Check } from 'lucide-react';

export default function EditProfileModal({ profile, isOpen, onClose, onSave }) {
  if (!isOpen || !profile) return null;

  const [name, setName] = useState(profile.name || profile.username);
  const [country, setCountry] = useState(profile.country || '');
  const [school, setSchool] = useState(profile.school || '');
  const [jobTitle, setJobTitle] = useState(profile.job_title || '');
  const [batch, setBatch] = useState(profile.customMeta?.batch || 'Batch 2025');
  const [status, setStatus] = useState(profile.customMeta?.status || 'Active');
  const [notes, setNotes] = useState(profile.customMeta?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(profile.username, {
        name,
        country,
        school,
        job_title: jobTitle,
        customMeta: {
          batch,
          status,
          notes
        }
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold bg-[#0E141E] w-8 h-8 rounded-full border border-[#263545] flex items-center justify-center"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#2EC866]/15 rounded-xl border border-[#2EC866]/30 text-[#00EA64]">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Edit Candidate Metadata</h3>
            <p className="text-xs font-mono text-[#00EA64]">@{profile.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Batch / Section</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Candidate Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
              >
                <option value="Active">Active</option>
                <option value="Interview Ready">Interview Ready</option>
                <option value="Review">Review</option>
                <option value="Placed">Placed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">School / University</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0E141E] border border-[#263545] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2EC866]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Internal Admin Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review feedback, interview notes, or recommendations..."
              className="w-full bg-[#0E141E] border border-[#263545] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#2EC866]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-300 rounded-xl text-xs font-semibold border border-[#263545]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2EC866] hover:bg-[#24a152] text-black font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
