import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogIn, UserPlus, X, CheckCircle2 } from 'lucide-react';

export default function LoginWarningModal({ isOpen, onClose, featureName = 'this feature' }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: location.pathname, feature: featureName } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: location.pathname, feature: featureName } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-sarkari-navy text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight text-white flex items-center gap-1.5">
                Login Required
                <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Citizen Portal
                </span>
              </h3>
              <p className="text-xs text-slate-300">Authentication required to proceed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200/80 rounded-xl p-3.5 text-xs text-orange-900 leading-relaxed">
            <p className="font-semibold text-orange-950 mb-1">
              Namaste Citizen! 🙏
            </p>
            You must be logged in to use <strong className="text-orange-950 font-bold">{featureName}</strong>. Please sign in to your citizen account or create a free account in 30 seconds.
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Why Log In to Sarkari Scheme Finder?
            </p>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Get customized eligibility percentage scores across 500+ welfare schemes</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Chat with our friendly conversational AI Scheme Assistant</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Bookmark & save verified schemes for offline tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Strict privacy guaranteed: Zero collection of Aadhaar or biometric data</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleLogin}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In to Citizen Account
            </button>
            <button
              onClick={handleRegister}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-600" />
              Create Free Citizen Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel & Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
