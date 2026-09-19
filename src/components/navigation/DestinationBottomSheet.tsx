import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  Navigation,
  Clock,
  Accessibility,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  Train,
  CheckCircle,
  X,
  Footprints,
} from 'lucide-react';

export const DestinationBottomSheet: React.FC = () => {
  const {
    destination,
    selectedPOI,
    setSelectedPOI,
    clearDestination,
    calculatedRoute,
    startNavigation,
    accessibilityMode,
    setAccessibilityMode,
    avoidCrowds,
    setAvoidCrowds,
    navigationStatus,
  } = useNavigation();

  // Show only when destination or POI is selected and not actively navigating
  if (!destination || navigationStatus === 'navigating' || navigationStatus === 'arrived') {
    return null;
  }

  const targetNode = destination || selectedPOI;
  if (!targetNode) return null;

  const totalDist = calculatedRoute ? calculatedRoute.totalDistanceMeters : 120;
  const totalSecs = calculatedRoute ? calculatedRoute.totalTimeSeconds : 90;
  const walkingMins = Math.max(1, Math.ceil(totalSecs / 60));
  const crowdLevel = calculatedRoute?.averageCrowd || 'LOW';

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-0 right-0 z-40 max-w-lg mx-auto px-3 sm:px-4 pointer-events-none animate-in slide-in-from-bottom-6 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl pointer-events-auto max-h-[calc(100vh-130px)] overflow-y-auto">
        {/* Header: Destination Name, Floor and Close */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                Level {targetNode.floor} • {targetNode.floor === 0 ? 'Concourse' : 'Footbridge'}
              </span>
              {targetNode.type === 'platform' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1">
                  <Train size={11} /> Platform
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">
              {targetNode.name}
            </h3>
            {targetNode.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {targetNode.description}
              </p>
            )}
          </div>

          <button
            onClick={clearDestination}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all flex-shrink-0"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {/* Route Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 my-3 py-2 bg-slate-800/50 rounded-2xl border border-slate-800/80 px-3">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Navigation size={12} className="text-cyan-400" /> Distance
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              {totalDist} m
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center border-x border-slate-700/50">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock size={12} className="text-emerald-400" /> Walk Time
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              ~{walkingMins} min
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Users size={12} className="text-amber-400" /> Traffic
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                crowdLevel === 'HIGH'
                  ? 'bg-red-500/20 text-red-300'
                  : crowdLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {crowdLevel}
            </span>
          </div>
        </div>

        {/* Routing Options Quick Toggles */}
        <div className="flex items-center justify-between gap-2 mb-4 text-xs">
          {/* Accessible Mode Toggle */}
          <button
            id="sheet-accessible-toggle"
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border font-semibold transition-all ${
              accessibilityMode
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Accessibility size={14} className={accessibilityMode ? 'text-teal-300' : 'text-slate-400'} />
            <span className="truncate">Step-Free Route</span>
          </button>

          {/* Avoid Crowds Toggle */}
          <button
            id="sheet-crowd-toggle"
            onClick={() => setAvoidCrowds(!avoidCrowds)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border font-semibold transition-all ${
              avoidCrowds
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Users size={14} className={avoidCrowds ? 'text-amber-300' : 'text-slate-400'} />
            <span className="truncate">Avoid Crowds</span>
          </button>
        </div>

        {/* Big Start Navigation CTA */}
        <button
          id="start-nav-cta-btn"
          onClick={startNavigation}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          <Navigation size={20} className="fill-slate-950" />
          <span>START WALKING NAVIGATION</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
