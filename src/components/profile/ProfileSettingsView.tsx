import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { voiceGuidance } from '../../engine/voiceGuidance';
import {
  User,
  Accessibility,
  Users,
  Volume2,
  Gauge,
  LogOut,
  Check,
  ShieldCheck,
  Smartphone,
  Sliders,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onLogout: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onLogout }) => {
  const { userPreferences, updateUserPreferences } = useNavigation();

  const handleTestVoice = () => {
    voiceGuidance.speak('RailNav AI voice guidance is ready. Turn right in 20 metres.', true);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 space-y-4 pb-36 sm:pb-32">
      {/* Profile Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 shadow-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
          {userPreferences.passengerName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white truncate">
              {userPreferences.passengerName}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Verified Passenger
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{userPreferences.passengerEmail}</p>
          <div className="text-[11px] text-cyan-400 font-medium mt-1">
            Station Pass #MCJ-2026-8841
          </div>
        </div>
      </div>

      {/* Accessibility & Mobility Preferences */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Accessibility size={18} className="text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Accessibility & Mobility
          </h3>
        </div>

        {/* Accessible Route Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">Step-Free / Accessible Routes</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly avoid staircases. Prioritize elevators, escalators, and wide ramp corridors.
            </p>
          </div>
          <button
            onClick={() =>
              updateUserPreferences({ accessibilityMode: !userPreferences.accessibilityMode })
            }
            className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
              userPreferences.accessibilityMode ? 'bg-teal-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Avoid Crowds Toggle */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Avoid Heavy Crowds by Default</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculate alternative pathways to bypass passenger bottlenecks on main overpass.
            </p>
          </div>
          <button
            onClick={() =>
              updateUserPreferences({ avoidCrowds: !userPreferences.avoidCrowds })
            }
            className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
              userPreferences.avoidCrowds ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Navigation & Audio Preferences */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Volume2 size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Audio & Navigation Guidance
          </h3>
        </div>

        {/* Voice Guidance Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">Voice Guidance (Speech Synthesis)</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Read out turn instructions and platform announcements automatically.
            </p>
          </div>
          <button
            onClick={() =>
              updateUserPreferences({ voiceGuidance: !userPreferences.voiceGuidance })
            }
            className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
              userPreferences.voiceGuidance ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Test Voice Button */}
        {userPreferences.voiceGuidance && (
          <div className="pt-2">
            <button
              onClick={handleTestVoice}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 py-1.5 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
            >
              <Volume2 size={13} />
              <span>Test Audio Guidance Sample</span>
            </button>
          </div>
        )}

        {/* Walking Speed Adjuster */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-white">Walking Speed</span>
            <span className="text-cyan-400 font-semibold">{userPreferences.walkingSpeed} m/s (~{(userPreferences.walkingSpeed * 3.6).toFixed(1)} km/h)</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.8"
            step="0.1"
            value={userPreferences.walkingSpeed}
            onChange={(e) =>
              updateUserPreferences({ walkingSpeed: parseFloat(e.target.value) })
            }
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Relaxed (0.8 m/s)</span>
            <span>Standard (1.2 m/s)</span>
            <span>Brisk (1.8 m/s)</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <LogOut size={16} />
          <span>Sign Out of Passenger Account</span>
        </button>
      </div>
    </div>
  );
};
