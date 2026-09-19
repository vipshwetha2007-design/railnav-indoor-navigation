import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  CornerLeftDown,
  CornerRightDown,
  ArrowUpDown,
  Footprints,
  ChevronsUp,
  CheckCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Eye,
  X,
  Layers,
  Clock,
  Navigation,
  Radio,
  List,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const TurnByTurnBanner: React.FC = () => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const {
    calculatedRoute,
    currentInstructionIndex,
    userPosition,
    destination,
    stopNavigation,
    isVoiceMuted,
    toggleVoiceMuted,
    isVoiceSpeaking,
    replayCurrentInstruction,
    isSimulatorWalking,
    pauseWalking,
    resumeWalking,
    stepNext,
    simulatorSpeed,
    setSimulatorSpeed,
    setIsARMode,
    activeFloor,
    liveGuidance,
  } = useNavigation();

  if (!calculatedRoute || calculatedRoute.instructions.length === 0) return null;

  const currentInstruction =
    calculatedRoute.instructions[currentInstructionIndex] ||
    calculatedRoute.instructions[0];

  const nextInstruction =
    calculatedRoute.instructions[currentInstructionIndex + 1];

  // Dynamic live guidance values based on exact user position along the corridor
  const activeManeuver = liveGuidance ? liveGuidance.maneuver : currentInstruction.maneuver;
  const activeDistance = liveGuidance
    ? liveGuidance.distanceDisplay
    : currentInstruction.distanceMeters > 0
    ? `${currentInstruction.distanceMeters} m`
    : 'Here';
  const activePrimaryText = liveGuidance ? liveGuidance.primaryText : currentInstruction.primaryText;
  const activeSecondaryText = liveGuidance ? liveGuidance.secondaryText : currentInstruction.secondaryText;
  const isUpcoming = Boolean(liveGuidance?.isUpcomingWarning);

  // Render Maneuver Icon
  const renderManeuverIcon = (maneuver: string, size = 32) => {
    switch (maneuver) {
      case 'straight':
        return <ArrowUp size={size} className="text-cyan-400" />;
      case 'turn_left':
        return <CornerUpLeft size={size} className="text-cyan-400" />;
      case 'turn_right':
        return <CornerUpRight size={size} className="text-cyan-400" />;
      case 'sharp_left':
        return <CornerLeftDown size={size} className="text-amber-400" />;
      case 'sharp_right':
        return <CornerRightDown size={size} className="text-amber-400" />;
      case 'take_lift':
        return <ArrowUpDown size={size} className="text-teal-300" />;
      case 'take_stairs':
        return <Footprints size={size} className="text-blue-400" />;
      case 'take_escalator':
        return <ChevronsUp size={size} className="text-indigo-400" />;
      case 'destination':
        return <CheckCircle size={size} className="text-emerald-400" />;
      default:
        return <ArrowUp size={size} className="text-cyan-400" />;
    }
  };

  const remainingMeters = userPosition.remainingDistanceMeters;
  const remainingSeconds = userPosition.remainingSeconds;
  const remainingMins = Math.ceil(remainingSeconds / 60);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl transition-all">
      {/* Top Banner: Primary Turn Instruction */}
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Large Turn Arrow Box - synchronizes with current or upcoming maneuver */}
          <div
            className={`w-13 h-13 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl border flex items-center justify-center shadow-lg relative group transition-all duration-200 ${
              isUpcoming
                ? 'bg-amber-500/20 border-amber-500/60 shadow-amber-500/20 ring-2 ring-amber-400/40 animate-pulse'
                : 'bg-slate-800/90 border-cyan-500/40 shadow-cyan-500/10'
            }`}
          >
            {renderManeuverIcon(activeManeuver, 32)}
            {isVoiceSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            )}
            {isUpcoming && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-md uppercase tracking-tight shadow">
                Next
              </span>
            )}
          </div>

          {/* Primary Text & Secondary Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeDistance}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-semibold border border-cyan-500/20">
                Level {currentInstruction.floor}
              </span>

              {isUpcoming && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                  Upcoming Turn
                </span>
              )}

              {isVoiceSpeaking && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 animate-pulse">
                  <Radio size={12} className="animate-spin text-cyan-400" />
                  <span>Voice Active</span>
                </div>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate leading-snug">
              {activePrimaryText}
            </h2>
            {activeSecondaryText && (
              <p className="text-xs text-slate-400 truncate">
                {activeSecondaryText}
              </p>
            )}
          </div>

          {/* Right Action Controls: Replay Voice, Mute, AR, and Stop */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Replay Current Instruction Voice Button */}
            <button
              id="replay-voice-btn"
              onClick={replayCurrentInstruction}
              className={`p-2.5 rounded-xl border transition-all ${
                isVoiceSpeaking
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/90 text-cyan-400 hover:text-white hover:bg-slate-700 border-slate-700'
              }`}
              title="Replay current voice instruction"
            >
              <RotateCcw size={17} className={isVoiceSpeaking ? 'animate-spin' : ''} />
            </button>

            {/* Voice guidance toggle */}
            <button
              id="voice-toggle-btn"
              onClick={toggleVoiceMuted}
              className={`p-2.5 rounded-xl border transition-all ${
                !isVoiceMuted
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-500 border-slate-700'
              }`}
              title={isVoiceMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
            >
              {!isVoiceMuted ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            {/* AR View Switch */}
            <button
              id="ar-mode-btn"
              onClick={() => setIsARMode(true)}
              className="px-2.5 py-2 sm:px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl border border-cyan-400/40 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
              title="Open AR Camera View"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">AR View</span>
              <span className="sm:hidden">AR</span>
            </button>

            {/* Stop Navigation */}
            <button
              id="stop-nav-btn"
              onClick={stopNavigation}
              className="p-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-xl border border-red-500/30 transition-all"
              title="Exit navigation"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Secondary Banner: Upcoming Maneuver Preview, Remaining Status & Walking Pacing Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[240px] sm:max-w-xs">
            {nextInstruction ? (
              <>
                <span className="text-slate-500 font-medium">Then:</span>
                <span className="font-semibold text-slate-300 truncate">
                  {nextInstruction.primaryText}
                </span>
              </>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle size={13} /> Arriving at {destination?.shortName || destination?.name}
              </span>
            )}
          </div>

          {/* Walking Pace & Step Controls Toolbar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80">
              {/* Pause / Resume button */}
              <button
                onClick={isSimulatorWalking ? pauseWalking : resumeWalking}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isSimulatorWalking
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
                title={isSimulatorWalking ? 'Pause walk' : 'Resume walk'}
              >
                {isSimulatorWalking ? <Pause size={11} /> : <Play size={11} />}
                <span>{isSimulatorWalking ? 'Pause' : 'Walk'}</span>
              </button>

              {/* Step Next */}
              <button
                onClick={stepNext}
                className="px-1.5 py-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 rounded text-[11px] font-semibold flex items-center gap-0.5 transition-all"
                title="Step forward to next waypoint"
              >
                <SkipForward size={11} />
                <span className="hidden sm:inline">Step</span>
              </button>
            </div>

            {/* Speed Selector */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-[11px] font-bold">
              {[
                { label: '0.5x', val: 0.5 },
                { label: '1x', val: 1.0 },
                { label: '2x', val: 2.0 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setSimulatorSpeed(s.val)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    simulatorSpeed === s.val
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Set walking simulation speed to ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Distance & Time */}
            <div className="flex items-center gap-2 flex-shrink-0 font-medium text-slate-300 pl-1 border-l border-slate-800">
              <span className="flex items-center gap-1">
                <Navigation size={12} className="text-cyan-400" />
                {remainingMeters} m
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-emerald-400" />
                {remainingMins} min
              </span>
            </div>

            {/* Scroll Down All Steps Toggle Button */}
            <button
              id="toggle-steps-list-btn"
              onClick={() => setShowAllSteps(!showAllSteps)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-[11px] border border-cyan-500/30 transition-all ml-1"
              title={showAllSteps ? 'Hide steps' : 'Scroll down to see all route steps'}
            >
              <List size={12} />
              <span>{showAllSteps ? 'Hide' : `Steps (${calculatedRoute.instructions.length})`}</span>
              {showAllSteps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Step-by-Step Route Directions (Scroll down to see all steps) */}
      {showAllSteps && (
        <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <List size={14} className="text-cyan-400" />
                <span>Full Route Guidance ({calculatedRoute.instructions.length} steps)</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-medium">
                ↓ Scroll down to view all upcoming turns & destination
              </span>
            </div>

            <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-850">
              {calculatedRoute.instructions.map((inst, idx) => {
                const isCurrent = idx === currentInstructionIndex;
                const isPassed = idx < currentInstructionIndex;

                return (
                  <div
                    key={inst.id || idx}
                    className={`pt-2 flex items-start gap-3 p-2.5 rounded-2xl transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : isPassed
                        ? 'opacity-40 bg-slate-900/40'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {renderManeuverIcon(inst.maneuver, 20)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {inst.primaryText}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse">
                              Current Step
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-cyan-400 flex-shrink-0">
                          {inst.distanceMeters > 0 ? `${inst.distanceMeters} m` : 'Destination'}
                        </span>
                      </div>

                      {inst.secondaryText && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                          {inst.secondaryText}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          Floor Level {inst.floor}
                        </span>
                        {isCurrent && isVoiceSpeaking && (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <Volume2 size={11} className="animate-pulse" />
                            <span>Speaking instruction</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
