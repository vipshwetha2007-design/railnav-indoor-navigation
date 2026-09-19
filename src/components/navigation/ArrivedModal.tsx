import React, { useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Train,
  Clock,
  Navigation,
  Sparkles,
  ArrowRight,
  Share2,
  ThumbsUp,
} from 'lucide-react';

export const ArrivedModal: React.FC = () => {
  const {
    navigationStatus,
    destination,
    activeTrain,
    calculatedRoute,
    stopNavigation,
    resetDemoPosition,
  } = useNavigation();

  useEffect(() => {
    if (navigationStatus === 'arrived') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch (e) {}
    }
  }, [navigationStatus]);

  if (navigationStatus !== 'arrived') return null;

  const totalDist = calculatedRoute ? calculatedRoute.totalDistanceMeters : 180;
  const isTrainPlatform = destination?.type === 'platform';

  const handleFinish = () => {
    stopNavigation();
    resetDemoPosition('entrance_a');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Checkmark */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
          <CheckCircle size={44} className="text-emerald-400" />
        </div>

        <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
          DESTINATION REACHED
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-1">
          YOU'VE ARRIVED!
        </h2>

        <p className="text-base font-bold text-cyan-300">
          {destination?.name || 'Platform 6'}
        </p>

        {/* Train Card if Platform arrival */}
        {isTrainPlatform && activeTrain && (
          <div className="my-5 p-4 rounded-2xl bg-slate-800/80 border border-cyan-500/30 text-left flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Train size={22} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Ready for departure</div>
                <div className="text-sm font-black text-white">{activeTrain.name}</div>
                <div className="text-xs text-emerald-400 font-bold">
                  Departs {activeTrain.scheduledTime} • On Time
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Track</span>
              <div className="text-xl font-black text-cyan-400">P{destination?.shortName?.replace('Platform ', '') || activeTrain.platform}</div>
            </div>
          </div>
        )}

        {/* Journey Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Navigation size={12} className="text-cyan-400" /> Walked
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">{totalDist} m</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Clock size={12} className="text-emerald-400" /> Time Taken
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">~3 mins</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="finish-trip-btn"
          onClick={handleFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>Complete Journey</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
