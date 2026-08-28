import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminLoginModal({ onLoginSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      if (password === 'Nanami@1304') {
        sessionStorage.setItem('hr_admin_auth', 'true');
        localStorage.setItem('hr_admin_pwd', password);
        
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#2EC866', '#00EA64', '#FFA116']
        });

        onLoginSuccess();
      } else {
        setErrorMessage('Incorrect admin password. Please try again.');
        setIsVerifying(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#151F2C] border border-[#263545] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* HackerRank Icon & Security Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Admin Authentication
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            This area is restricted. Enter the master admin password to access the Peer Management Console.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-slate-400">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                required
                autoFocus
                className="w-full bg-[#0E141E] border border-[#263545] focus:border-[#00EA64] rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs font-mono text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full py-2.5 bg-[#2EC866] hover:bg-[#24a152] text-black font-extrabold rounded-xl text-sm shadow-lg shadow-[#2EC866]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Unlock className="w-4 h-4 animate-bounce" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Hub</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 bg-[#0E141E] hover:bg-[#1E2A38] text-slate-400 hover:text-slate-200 font-semibold rounded-xl text-xs border border-[#263545] transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Tracker</span>
            </button>
          </div>
        </form>

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-[#263545]/60 text-center text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00EA64]" />
          <span>Protected Route: /hacko/admin</span>
        </div>

      </div>
    </div>
  );
}
