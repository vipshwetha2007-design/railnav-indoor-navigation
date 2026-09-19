import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  AlertTriangle,
  Users,
  Accessibility,
  Train,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Sliders,
  Check,
  XCircle,
} from 'lucide-react';

export const DemoControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    navigationStatus,
    isSimulatorWalking,
    startNavigation,
    pauseWalking,
    resumeWalking,
    stepNext,
    resetDemoPosition,
    accessibilityMode,
    setAccessibilityMode,
    avoidCrowds,
    setAvoidCrowds,
    closedEdgeIds,
    simulatorSpeed,
    setSimulatorSpeed,
    demoCloseCorridorB,
    demoRestoreCorridors,
    demoSimulateCrowdSpike,
    demoSimulatePlatformChange,
    demoSimulateOffRoute,
    demoResetAll,
  } = useNavigation();

  const isCorridorClosed = closedEdgeIds.includes('e_concourse_corridor_b');

  return (
    <div className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg pointer-events-none">
      {/* Collapsed Pill Trigger */}
      <div className="flex justify-center pointer-events-auto">
        <button
          id="demo-controls-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-900/95 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
        >
          <Sliders size={14} className="text-cyan-400" />
          <span>Hackathon Demo Simulator</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Expanded Simulator Console */}
      {isOpen && (
        <div className="mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto text-slate-100 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Judge Simulation Console</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Demo Tools
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Test indoor positioning, crowd bypass, elevator routing & platform changes
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Section 1: Positioning & Walking Simulator */}
          <div className="my-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Indoor Positioning Simulator</span>
              <span className="text-cyan-400 text-[11px] font-semibold">
                Status: {navigationStatus}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* Start / Resume */}
              {!isSimulatorWalking ? (
                <button
                  id="demo-walk-btn"
                  onClick={() => {
                    if (navigationStatus === 'idle') {
                      // Automatically start a demo walk to Platform 6 if idle
                      demoSimulatePlatformChange();
                      // Wait a tiny bit for state to settle, then start
                      setTimeout(() => {
                        const evt = document.getElementById('demo-walk-btn');
                        if (evt) evt.click();
                      }, 100);
                    } else if (navigationStatus === 'destination_selected') {
                      startNavigation();
                    } else {
                      resumeWalking();
                    }
                  }}
                  className="py-2 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                  title="Start or resume simulated passenger walk"
                >
                  <Play size={15} className="fill-slate-950" />
                  <span>Start Walk</span>
                </button>
              ) : (
                <button
                  id="demo-pause-btn"
                  onClick={pauseWalking}
                  className="py-2 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                  title="Pause walking simulator"
                >
                  <Pause size={15} className="fill-slate-950" />
                  <span>Pause</span>
                </button>
              )}

              {/* Next Step */}
              <button
                id="demo-step-btn"
                onClick={() => {
                  if (navigationStatus === 'idle') {
                    // Auto-start demo walk if idle, same as Start Walk
                    demoSimulatePlatformChange();
                    setTimeout(() => {
                      const evt = document.getElementById('demo-step-btn');
                      if (evt) evt.click();
                    }, 100);
                  } else if (navigationStatus === 'destination_selected') {
                    startNavigation();
                  } else {
                    stepNext();
                  }
                }}
                className="py-2 px-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                title="Advance to next route segment"
              >
                <SkipForward size={15} />
                <span>Next Step</span>
              </button>

              {/* Reset to Entrance A */}
              <button
                id="demo-reset-pos-btn"
                onClick={() => resetDemoPosition('entrance_a')}
                className="py-2 px-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                title="Reset passenger position to Entrance A"
              >
                <RotateCcw size={15} />
                <span>Reset Pos</span>
              </button>

              {/* Off Route Simulation */}
              <button
                id="demo-off-route-btn"
                onClick={demoSimulateOffRoute}
                className="py-2 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                title="Simulate passenger deviating to Waiting Hall"
              >
                <Shuffle size={15} />
                <span>Off Route</span>
              </button>
            </div>

            {/* Walking Pacing Selector */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Walking Pacing:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '0.5x Walk', val: 0.5 },
                  { label: '1.0x Normal', val: 1.0 },
                  { label: '2.0x Fast', val: 2.0 },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setSimulatorSpeed(s.val)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      simulatorSpeed === s.val
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Conditions & Route Triggers */}
          <div className="space-y-2 mb-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dynamic Real-Time Scenarios
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Corridor B Closure Toggle */}
              {!isCorridorClosed ? (
                <button
                  id="demo-close-corridor-btn"
                  onClick={demoCloseCorridorB}
                  className="p-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 rounded-xl text-left text-xs font-semibold flex items-start gap-2 transition-all"
                >
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white">Close Corridor B</div>
                    <div className="text-[11px] text-red-300/80">Forces North Ramp Reroute</div>
                  </div>
                </button>
              ) : (
                <button
                  id="demo-restore-corridor-btn"
                  onClick={demoRestoreCorridors}
                  className="p-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl text-left text-xs font-semibold flex items-start gap-2 transition-all"
                >
                  <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white">Reopen Corridor B</div>
                    <div className="text-[11px] text-emerald-300/80">Restore Central Artery</div>
                  </div>
                </button>
              )}

              {/* Crowd Spike Toggle */}
              <button
                id="demo-crowd-spike-btn"
                onClick={demoSimulateCrowdSpike}
                className="p-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl text-left text-xs font-semibold flex items-start gap-2 transition-all"
              >
                <Users size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-white">Spike Crowd</div>
                  <div className="text-[11px] text-amber-300/80">Stairs A Crowd Chokepoint</div>
                </div>
              </button>

              {/* Accessibility Route Toggle */}
              <button
                id="demo-acc-toggle-btn"
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className={`p-2.5 border rounded-xl text-left text-xs font-semibold flex items-start gap-2 transition-all ${
                  accessibilityMode
                    ? 'bg-teal-500/25 border-teal-500/50 text-teal-200'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Accessibility size={16} className={accessibilityMode ? 'text-teal-300' : 'text-slate-400'} />
                <div>
                  <div className="font-bold text-white">
                    {accessibilityMode ? 'Accessible: Active' : 'Enable Accessible'}
                  </div>
                  <div className="text-[11px] text-slate-400">Avoids Stairs • Uses Lift 1</div>
                </div>
              </button>

              {/* Platform Change (Express 12345 to Platform 6) */}
              <button
                id="demo-plat-change-btn"
                onClick={demoSimulatePlatformChange}
                className="p-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-xl text-left text-xs font-semibold flex items-start gap-2 transition-all"
              >
                <Train size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-white">Platform Change</div>
                  <div className="text-[11px] text-cyan-300/80">Exp 12345: P3 → P6</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Master Reset */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Restore default demo conditions</span>
            <button
              id="demo-reset-all-btn"
              onClick={demoResetAll}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw size={13} />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
