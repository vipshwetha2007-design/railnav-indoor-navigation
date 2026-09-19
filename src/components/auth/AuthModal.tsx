import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  Compass,
  Train,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

type AuthTab = 'welcome' | 'signin' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const { updateUserPreferences } = useNavigation();
  const [tab, setTab] = useState<AuthTab>('welcome');
  const [email, setEmail] = useState<string>('alex.rivera@railnav.io');
  const [password, setPassword] = useState<string>('passenger123');
  const [name, setName] = useState<string>('Alex Rivera');
  const [isResetSent, setIsResetSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDemoPassengerLogin = () => {
    updateUserPreferences({
      passengerName: 'Alex Rivera (Demo Passenger)',
      passengerEmail: 'alex.rivera@railnav.io',
      isLoggedIn: true,
    });
    onSuccess();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences({
      passengerName: name || 'Station Passenger',
      passengerEmail: email,
      isLoggedIn: true,
    });
    onSuccess();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetSent(true);
    setTimeout(() => {
      setIsResetSent(false);
      setTab('signin');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 mb-3">
            <Train size={32} className="text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RailNav <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            “From knowing WHERE to go, to knowing HOW to get there.”
          </p>
        </div>

        {/* TAB 1: Welcome Screen */}
        {tab === 'welcome' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Quick Demo Passenger Button */}
            <button
              id="continue-demo-btn"
              onClick={handleDemoPassengerLogin}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles size={17} className="fill-slate-950" />
              <span>Continue as Demo Passenger</span>
              <ArrowRight size={17} />
            </button>

            <div className="flex items-center gap-3 my-2 text-slate-500 text-xs">
              <div className="h-[1px] flex-1 bg-slate-800" />
              <span>or sign in with credentials</span>
              <div className="h-[1px] flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setTab('signin')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleCustomLogin} className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Sign In to Passenger Portal
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('welcome')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to welcome options
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Sign Up */}
        {tab === 'signup' && (
          <form onSubmit={handleCustomLogin} className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Create Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Create Account & Enter Station
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('welcome')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to welcome options
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: Forgot Password */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 animate-in fade-in duration-150">
            {isResetSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs text-emerald-300">
                <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400" />
                Password reset link sent to your email.
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Enter your registered passenger email and we'll send a one-time verification link.
                </p>
                <div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Send Reset Link
                </button>
              </>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
