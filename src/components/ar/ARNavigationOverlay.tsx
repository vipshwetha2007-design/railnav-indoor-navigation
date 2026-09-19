import React, { useEffect, useRef, useState } from 'react';
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
  Map,
  Camera,
  Volume2,
  VolumeX,
  Compass,
  Navigation,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ARNavigationOverlay: React.FC = () => {
  const {
    isARMode,
    setIsARMode,
    calculatedRoute,
    currentInstructionIndex,
    userPosition,
    destination,
    isVoiceMuted,
    toggleVoiceMuted,
    activeFloor,
    liveGuidance,
  } = useNavigation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Attempt live camera stream if available
  useEffect(() => {
    if (!isARMode) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraActive(true);
            setCameraError(null);
          }
        } else {
          setCameraError('Camera API not accessible in this environment. AR Demo View is active.');
        }
      } catch (err: any) {
        setCameraActive(false);
        setCameraError('Camera access not granted. AR Demo Simulation View is active.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [isARMode]);

  if (!isARMode) return null;

  const currentInstruction =
    calculatedRoute?.instructions[currentInstructionIndex] ||
    calculatedRoute?.instructions[0] || {
      maneuver: 'straight',
      primaryText: 'Continue straight',
      secondaryText: '',
      distanceMeters: 40,
      floor: activeFloor,
      announcement: '',
    };

  const activeManeuver = liveGuidance?.maneuver || currentInstruction.maneuver;
  const activeDistance = liveGuidance
    ? liveGuidance.distanceDisplay
    : currentInstruction.distanceMeters > 0
    ? `${currentInstruction.distanceMeters} m`
    : 'Arrived';
  const activePrimaryText = liveGuidance?.primaryText || currentInstruction.primaryText;
  const activeSecondaryText = liveGuidance?.secondaryText || currentInstruction.secondaryText;
  const isUpcoming = Boolean(liveGuidance?.isUpcomingWarning);

  const remainingMeters = userPosition.remainingDistanceMeters;
  const remainingMins = Math.max(1, Math.ceil(userPosition.remainingSeconds / 60));

  // Render AR 3D-styled Arrow
  const renderARArrow = (maneuver: string) => {
    const size = 64;
    switch (maneuver) {
      case 'straight':
        return <ArrowUp size={size} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />;
      case 'turn_left':
        return <CornerUpLeft size={size} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />;
      case 'turn_right':
        return <CornerUpRight size={size} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />;
      case 'sharp_left':
        return <CornerLeftDown size={size} className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />;
      case 'sharp_right':
        return <CornerRightDown size={size} className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />;
      case 'take_lift':
        return <ArrowUpDown size={size} className="text-teal-300 drop-shadow-[0_0_20px_rgba(20,184,166,0.8)]" />;
      case 'take_stairs':
        return <Footprints size={size} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]" />;
      case 'take_escalator':
        return <ChevronsUp size={size} className="text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]" />;
      case 'destination':
        return <CheckCircle size={size} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />;
      default:
        return <ArrowUp size={size} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background: Live Video or Simulated Indoor AR Station Corridor */}
      <div className="absolute inset-0 z-0">
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Simulated Station Corridor View */
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
            {/* Perspective Grid Floor */}
            <div
              className="absolute inset-x-0 bottom-0 h-3/5 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(300px) rotateX(60deg)',
                transformOrigin: 'bottom center',
              }}
            />

            {/* Corridor Light Stripes */}
            <div className="absolute top-1/4 inset-x-12 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-sm" />
            <div className="absolute top-1/3 inset-x-20 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm" />

            {/* AR Center Crosshair / Horizon line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
              </div>
              <div className="absolute w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              <div className="absolute h-40 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />
            </div>

            {/* AR Floating 3D Waypoint Beacon */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="px-3 py-1 bg-emerald-500/90 text-slate-950 font-black text-xs rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-bounce flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>{destination?.shortName || destination?.name || 'Platform 6'}</span>
              </div>
              <div className="w-1 h-12 bg-gradient-to-b from-emerald-400 to-transparent" />
            </div>
          </div>
        )}

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 pointer-events-none" />
      </div>

      {/* TOP AR HUD: Status & Return Button */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
            <Camera size={13} className="text-cyan-400 animate-pulse" />
            <span>{cameraActive ? 'AR Live Camera' : 'AR Demo Positioning'}</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-semibold backdrop-blur-md">
            Level {activeFloor}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceMuted}
            className="p-2.5 bg-slate-900/80 text-white rounded-xl border border-slate-700 backdrop-blur-md transition-all"
            title={isVoiceMuted ? 'Unmute' : 'Mute'}
          >
            {!isVoiceMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            id="exit-ar-btn"
            onClick={() => setIsARMode(false)}
            className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Map size={15} className="text-cyan-400" />
            <span>2D Map View</span>
          </button>
        </div>
      </div>

      {/* CENTER AR GUIDANCE: Big 3D Directional Arrow and Distance */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 pointer-events-none text-center">
        {/* Glowing Arrow Animation with Upcoming Turn Visual */}
        <div
          className={`w-28 h-28 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-200 ${
            isUpcoming
              ? 'bg-amber-950/80 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.4)] animate-pulse'
              : 'bg-slate-950/70 border border-cyan-500/50'
          }`}
        >
          {renderARArrow(activeManeuver)}
        </div>

        {/* Big Instruction Text */}
        <div className="mt-4 max-w-sm px-4">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
            {activeDistance}
          </div>
          {isUpcoming && (
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-xs font-black text-amber-300 uppercase tracking-wider">
              Upcoming Turn Ahead
            </div>
          )}
          <div className="text-lg sm:text-xl font-extrabold text-cyan-300 mt-1 uppercase tracking-wider drop-shadow-md">
            {activePrimaryText}
          </div>
          {activeSecondaryText && (
            <div className="text-xs sm:text-sm text-slate-300 mt-1 drop-shadow-md">
              {activeSecondaryText}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM AR HUD: Destination, Remaining Metres & ETA Card */}
      <div className="relative z-10 p-4 max-w-md mx-auto w-full">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Compass size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Navigating to</div>
              <div className="text-base font-extrabold text-white">
                {destination?.shortName || destination?.name || 'Platform 6'}
              </div>
              <div className="text-xs text-cyan-300 font-semibold">
                Level {destination?.floor || 1} • Overpass
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-white flex items-center justify-end gap-1">
              <Navigation size={15} className="text-cyan-400" />
              {remainingMeters} m
            </div>
            <div className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1 mt-0.5">
              <Clock size={12} />
              {remainingMins} min left
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
