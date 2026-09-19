import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StationNode,
  StationEdge,
  CalculatedRoute,
  FloorLevel,
  CrowdLevel,
  TrainInfo,
  StationAlert,
  UserPreferences,
} from '../types/navigation';
import { STATION_NODES, STATION_EDGES, getNodeById } from '../data/stationData';
import { DEMO_TRAINS } from '../data/trainData';
import { INITIAL_STATION_ALERTS } from '../data/alertsData';
import { calculateRoute } from '../engine/routingEngine';
import { SimulatorPositionProvider, UserPosition } from '../engine/positionProvider';
import { voiceGuidance } from '../engine/voiceGuidance';
import { computeLiveGuidance, LiveGuidanceState } from '../engine/instructionEngine';

export type NavigationStatus = 'idle' | 'destination_selected' | 'navigating' | 'arrived';

export interface DynamicNotice {
  id: string;
  type: 'reroute' | 'closure' | 'platform_change' | 'crowd' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface NavigationContextType {
  // Station data
  nodes: StationNode[];
  edges: StationEdge[];
  trains: TrainInfo[];
  alerts: StationAlert[];

  // Navigation Core State
  userPosition: UserPosition;
  activeFloor: FloorLevel;
  setActiveFloor: (floor: FloorLevel) => void;
  destination: StationNode | null;
  selectedPOI: StationNode | null;
  setSelectedPOI: (poi: StationNode | null) => void;
  calculatedRoute: CalculatedRoute | null;
  navigationStatus: NavigationStatus;
  currentInstructionIndex: number;
  liveGuidance: LiveGuidanceState | null;

  // Options & Filters
  accessibilityMode: boolean;
  setAccessibilityMode: (enabled: boolean) => void;
  avoidCrowds: boolean;
  setAvoidCrowds: (avoid: boolean) => void;
  closedEdgeIds: string[];

  // Dynamic state & notices
  activeNotice: DynamicNotice | null;
  clearNotice: () => void;
  activeTrain: TrainInfo | null;
  setActiveTrain: (train: TrainInfo | null) => void;

  // AR & View Mode
  isARMode: boolean;
  setIsARMode: (ar: boolean) => void;
  isVoiceMuted: boolean;
  toggleVoiceMuted: () => void;
  isVoiceSpeaking: boolean;
  replayCurrentInstruction: () => void;

  // Simulator Speed Control
  simulatorSpeed: number;
  setSimulatorSpeed: (speed: number) => void;

  // User Profile
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;

  // Actions
  selectDestination: (node: StationNode) => void;
  clearDestination: () => void;
  navigateToTrain: (train: TrainInfo) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  recenterToUser: () => void;

  // Demo Walk Simulator Controls
  isSimulatorWalking: boolean;
  startWalking: () => void;
  pauseWalking: () => void;
  resumeWalking: () => void;
  stepNext: () => void;
  resetDemoPosition: (startNodeId?: string) => void;

  // Demo Scenarios for Judges
  demoCloseCorridorB: () => void;
  demoRestoreCorridors: () => void;
  demoSimulateCrowdSpike: () => void;
  demoSimulatePlatformChange: () => void;
  demoSimulateOffRoute: () => void;
  demoResetAll: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Nodes, Edges, Trains state
  const [nodes, setNodes] = useState<StationNode[]>(STATION_NODES);
  const [edges, setEdges] = useState<StationEdge[]>(STATION_EDGES);
  const [trains, setTrains] = useState<TrainInfo[]>(DEMO_TRAINS);
  const [alerts, setAlerts] = useState<StationAlert[]>(INITIAL_STATION_ALERTS);

  // Active Floor view
  const [activeFloor, setActiveFloor] = useState<FloorLevel>(0);

  // Route & Destination
  const [destination, setDestination] = useState<StationNode | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<StationNode | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<CalculatedRoute | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatus>('idle');
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<number>(0);

  // Options
  const [accessibilityMode, setAccessibilityModeState] = useState<boolean>(false);
  const [avoidCrowds, setAvoidCrowdsState] = useState<boolean>(false);
  const [closedEdgeIds, setClosedEdgeIds] = useState<string[]>([]);

  // User Preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('railnav_preferences');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      passengerName: 'Alex Rivera',
      passengerEmail: 'alex.rivera@railnav.io',
      isLoggedIn: true,
      accessibilityMode: false,
      avoidCrowds: false,
      voiceGuidance: true,
      reducedMotion: false,
      walkingSpeed: 1.2,
    };
  });

  // Dynamic Notice (banners for reroute, closure, platform change)
  const [activeNotice, setActiveNotice] = useState<DynamicNotice | null>(null);

  // Active Train
  const [activeTrain, setActiveTrain] = useState<TrainInfo | null>(trains[0]); // Express 12345

  // Voice & AR
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [isARMode, setIsARMode] = useState<boolean>(false);
  const [simulatorSpeed, setSimulatorSpeedState] = useState<number>(1.0);

  // Position Provider (default starts at Entrance A)
  const startNode = useMemo(() => getNodeById('entrance_a') || nodes[0], [nodes]);
  const positionProviderRef = useRef<SimulatorPositionProvider>(
    new SimulatorPositionProvider(startNode)
  );

  const [userPosition, setUserPosition] = useState<UserPosition>(
    positionProviderRef.current.getCurrentPosition()
  );

  // Track active instruction announcement to prevent cutoffs & duplicate rapid-fire speech
  const lastAnnouncedInstructionRef = useRef<number | null>(null);

  // Subscribe to voice guidance active state
  useEffect(() => {
    const unsubVoice = voiceGuidance.subscribe((speaking) => {
      setIsVoiceSpeaking(speaking);
    });
    return () => unsubVoice();
  }, []);

  // Simulator Speed adjustment
  const setSimulatorSpeed = useCallback((speed: number) => {
    setSimulatorSpeedState(speed);
    positionProviderRef.current.setSpeedFactor(speed);
  }, []);

  // Subscribe to position updates
  useEffect(() => {
    const unsubscribe = positionProviderRef.current.subscribe((pos) => {
      setUserPosition(pos);

      // Automatically sync floor when walking across floors
      if (pos.status === 'walking') {
        setActiveFloor(pos.floor);
      }

      // Check arrival - announce destination completion cleanly without duplicate triggers
      if (pos.status === 'arrived' && navigationStatus === 'navigating') {
        setNavigationStatus('arrived');
        const destName = destination ? (destination.shortName || destination.name) : 'your destination';
        voiceGuidance.speak(`You have arrived at ${destName}. Your journey is complete.`, {
          priority: 'urgent',
          force: true,
        });
      }
    });

    return () => unsubscribe();
  }, [navigationStatus, destination]);

  // Route recalculation function
  const recalculateCurrentRoute = useCallback(
    (
      currentStartNodeId: string,
      targetNode: StationNode | null,
      opts: {
        acc: boolean;
        crowds: boolean;
        closed: string[];
        customEdges?: StationEdge[];
        initialHeading?: number;
      }
    ) => {
      if (!targetNode) {
        setCalculatedRoute(null);
        return null;
      }

      const route = calculateRoute(
        currentStartNodeId,
        targetNode.id,
        {
          accessibilityMode: opts.acc,
          avoidCrowds: opts.crowds,
          closedEdgeIds: opts.closed,
          walkingSpeed: userPreferences.walkingSpeed,
          initialHeading: opts.initialHeading,
        },
        nodes,
        opts.customEdges || edges
      );

      setCalculatedRoute(route);
      return route;
    },
    [nodes, edges, userPreferences.walkingSpeed]
  );

  // Use ref to access latest user position without triggering re-renders
  const latestPositionRef = useRef(userPosition);
  useEffect(() => {
    latestPositionRef.current = userPosition;
  }, [userPosition]);

  // Re-calculate route when options or destination change
  useEffect(() => {
    if (destination) {
      const newRoute = recalculateCurrentRoute(latestPositionRef.current.currentNodeId, destination, {
        acc: accessibilityMode,
        crowds: avoidCrowds,
        closed: closedEdgeIds,
        initialHeading: latestPositionRef.current.heading,
      });
      
      // If we are currently navigating, immediately apply the new route to the position simulator
      if (navigationStatus === 'navigating' && newRoute) {
        positionProviderRef.current.startWalking(
          newRoute.nodes,
          newRoute.totalDistanceMeters,
          newRoute.edges
        );
      }
    }
  }, [destination, accessibilityMode, avoidCrowds, closedEdgeIds, recalculateCurrentRoute, navigationStatus]);

  // Compute live, location-aware navigation guidance (maneuver, distance, upcoming turn preview)
  const liveGuidance = useMemo(() => {
    if (!calculatedRoute || calculatedRoute.instructions.length === 0) return null;
    return computeLiveGuidance(
      calculatedRoute,
      userPosition.segmentIndex,
      userPosition.progressOnSegment,
      userPosition.status
    );
  }, [calculatedRoute, userPosition.segmentIndex, userPosition.progressOnSegment, userPosition.status]);

  // Track the last spoken phase key to synchronize voice with live position
  const lastSpokenPhaseKeyRef = useRef<string>('');

  // Location-based speech synchronization: triggers commands exactly based on where user is
  useEffect(() => {
    if (!calculatedRoute || navigationStatus !== 'navigating' || !liveGuidance) {
      return;
    }

    const idx = Math.min(userPosition.segmentIndex, calculatedRoute.instructions.length - 1);
    setCurrentInstructionIndex(idx);

    // Build unique stage key based on current stage and segment index
    const stageKey =
      userPosition.status === 'arrived' || liveGuidance.stage === 'arrived'
        ? 'arrived'
        : `${liveGuidance.stage}_${userPosition.segmentIndex}`;

    if (lastSpokenPhaseKeyRef.current !== stageKey) {
      lastSpokenPhaseKeyRef.current = stageKey;

      if (!isVoiceMuted && userPosition.status !== 'idle') {
        voiceGuidance.speak(liveGuidance.spokenCommand, { force: true });
      }
    }
  }, [
    userPosition.segmentIndex,
    userPosition.status,
    userPosition.progressOnSegment,
    calculatedRoute,
    navigationStatus,
    isVoiceMuted,
    liveGuidance,
  ]);

  // Destination Selection
  const selectDestination = useCallback(
    (node: StationNode) => {
      setDestination(node);
      setSelectedPOI(node);
      setNavigationStatus('destination_selected');
      // Recalculate route immediately from current position
      recalculateCurrentRoute(latestPositionRef.current.currentNodeId, node, {
        acc: accessibilityMode,
        crowds: avoidCrowds,
        closed: closedEdgeIds,
        initialHeading: latestPositionRef.current.heading,
      });
    },
    [accessibilityMode, avoidCrowds, closedEdgeIds, recalculateCurrentRoute]
  );

  const clearDestination = useCallback(() => {
    setDestination(null);
    setSelectedPOI(null);
    setCalculatedRoute(null);
    setNavigationStatus('idle');
  }, []);

  // Navigate to Train
  const navigateToTrain = useCallback(
    (train: TrainInfo) => {
      setActiveTrain(train);
      const platNodeId = `platform_${train.platform}`;
      const platNode = getNodeById(platNodeId);
      if (platNode) {
        selectDestination(platNode);
      }
    },
    [selectDestination]
  );

  // Start Navigation
  const startNavigation = useCallback(() => {
    if (!destination || !calculatedRoute) return;

    setNavigationStatus('navigating');
    // Ensure active floor matches start floor
    setActiveFloor(userPosition.floor);

    // Reset spoken key to departure_0 so start announcement is clear
    lastSpokenPhaseKeyRef.current = 'departure_0';

    // Initial departure announcement
    if (!isVoiceMuted && calculatedRoute.instructions[0]) {
      voiceGuidance.speak(
        `Starting navigation to ${destination.name}. ${calculatedRoute.instructions[0].announcement}`,
        { force: true }
      );
    }

    // Automatically trigger walking simulator
    positionProviderRef.current.startWalking(
      calculatedRoute.nodes,
      calculatedRoute.totalDistanceMeters,
      calculatedRoute.edges
    );
  }, [destination, calculatedRoute, userPosition.floor, isVoiceMuted]);

  // Stop Navigation
  const stopNavigation = useCallback(() => {
    positionProviderRef.current.pauseWalking();
    lastSpokenPhaseKeyRef.current = '';
    setNavigationStatus(destination ? 'destination_selected' : 'idle');
    voiceGuidance.stop();
  }, [destination]);

  // Replay Current Instruction on demand based on live position
  const replayCurrentInstruction = useCallback(() => {
    if (liveGuidance && !isVoiceMuted) {
      voiceGuidance.speak(liveGuidance.spokenCommand, { force: true });
    } else if (calculatedRoute && calculatedRoute.instructions[currentInstructionIndex]) {
      const instruction = calculatedRoute.instructions[currentInstructionIndex];
      voiceGuidance.speak(instruction.announcement, { force: true });
    }
  }, [liveGuidance, calculatedRoute, currentInstructionIndex, isVoiceMuted]);

  // Recenter map
  const recenterToUser = useCallback(() => {
    setActiveFloor(userPosition.floor);
  }, [userPosition.floor]);

  // Simulator controls
  const startWalking = useCallback(() => {
    if (calculatedRoute) {
      positionProviderRef.current.startWalking(
        calculatedRoute.nodes,
        calculatedRoute.totalDistanceMeters,
        calculatedRoute.edges
      );
    }
  }, [calculatedRoute]);

  const pauseWalking = useCallback(() => {
    positionProviderRef.current.pauseWalking();
  }, []);

  const resumeWalking = useCallback(() => {
    positionProviderRef.current.resumeWalking();
  }, []);

  const stepNext = useCallback(() => {
    positionProviderRef.current.stepNext();
  }, []);

  const resetDemoPosition = useCallback(
    (nodeId?: string) => {
      const node = nodeId ? getNodeById(nodeId) : startNode;
      if (node) {
        positionProviderRef.current.reset(node.id, node);
        setActiveFloor(node.floor);
      }
    },
    [startNode]
  );

  // User preferences update
  const updateUserPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      try {
        localStorage.setItem('railnav_preferences', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (prefs.accessibilityMode !== undefined) {
      setAccessibilityModeState(prefs.accessibilityMode);
    }
    if (prefs.avoidCrowds !== undefined) {
      setAvoidCrowdsState(prefs.avoidCrowds);
    }
    if (prefs.voiceGuidance !== undefined) {
      setIsVoiceMuted(!prefs.voiceGuidance);
    }
  }, []);

  const setAccessibilityMode = useCallback((enabled: boolean) => {
    setAccessibilityModeState(enabled);
    setUserPreferences((prev) => ({ ...prev, accessibilityMode: enabled }));
    setActiveNotice({
      id: `acc_${Date.now()}`,
      type: 'info',
      title: enabled ? 'Accessible Route Enabled' : 'Standard Route Active',
      message: enabled
        ? 'Stairs avoided. Elevators, ramps and step-free passages prioritized.'
        : 'Stairs and fast paths enabled.',
      timestamp: Date.now(),
    });
  }, []);

  const setAvoidCrowds = useCallback((avoid: boolean) => {
    setAvoidCrowdsState(avoid);
    setUserPreferences((prev) => ({ ...prev, avoidCrowds: avoid }));
    setActiveNotice({
      id: `crowd_${Date.now()}`,
      type: 'crowd',
      title: avoid ? 'Crowd-Aware Routing ON' : 'Direct Routing ON',
      message: avoid
        ? 'Route recalculated to bypass congested station corridors and footbridge choke-points.'
        : 'Route optimized strictly for shortest distance.',
      timestamp: Date.now(),
    });
  }, []);

  const toggleVoiceMuted = useCallback(() => {
    setIsVoiceMuted((prev) => {
      const next = !prev;
      voiceGuidance.setMuted(next);
      return next;
    });
  }, []);

  const clearNotice = useCallback(() => {
    setActiveNotice(null);
  }, []);

  // ================= DEMO CONTROLS FOR HACKATHON JUDGES =================

  // 1. Dynamic Corridor Closure (Corridor B)
  const demoCloseCorridorB = useCallback(() => {
    const corridorBId = 'e_concourse_corridor_b';
    setClosedEdgeIds((prev) => (prev.includes(corridorBId) ? prev : [...prev, corridorBId]));
    setEdges((prev) =>
      prev.map((e) =>
        e.id === corridorBId
          ? { ...e, isClosed: true, closureReason: 'Sanitization & Floor Maintenance' }
          : e
      )
    );

    setActiveNotice({
      id: `closure_${Date.now()}`,
      type: 'closure',
      title: 'Route Updated: Station Closure',
      message: 'Corridor B (Central) closed for maintenance. Route immediately rerouted via North Concourse & Ramp.',
      timestamp: Date.now(),
    });

    if (!isVoiceMuted) {
      voiceGuidance.speak('Caution: Corridor B is closed. Recalculating route.');
    }
  }, [isVoiceMuted]);

  // 2. Restore Corridors
  const demoRestoreCorridors = useCallback(() => {
    setClosedEdgeIds([]);
    setEdges((prev) => prev.map((e) => ({ ...e, isClosed: false, closureReason: undefined })));
    setActiveNotice({
      id: `restore_${Date.now()}`,
      type: 'info',
      title: 'Station Corridors Reopened',
      message: 'All corridors and passages are now open for transit.',
      timestamp: Date.now(),
    });
  }, []);

  // 3. Crowd Spike Simulation (Staircase A & Footbridge)
  const demoSimulateCrowdSpike = useCallback(() => {
    setEdges((prev) =>
      prev.map((e) => {
        if (e.id === 'e_vert_stairs_a' || e.id === 'e_stairs_a_fb_center') {
          return { ...e, crowdLevel: 'HIGH' };
        }
        return e;
      })
    );
    setAvoidCrowdsState(true);

    setActiveNotice({
      id: `crowd_spike_${Date.now()}`,
      type: 'crowd',
      title: 'High Crowd Detected on Staircase A',
      message: 'Severe commuter bottleneck detected. Avoid Crowds activated: rerouting via Lift 1 and North Gangway.',
      timestamp: Date.now(),
    });

    if (!isVoiceMuted) {
      voiceGuidance.speak('High crowd detected on Staircase A. Rerouting via clear passage.');
    }
  }, [isVoiceMuted]);

  // 4. Platform Change Demo (Express 12345 moves to Platform 6)
  const demoSimulatePlatformChange = useCallback(() => {
    setTrains((prev) =>
      prev.map((t) =>
        t.trainNumber === '12345'
          ? { ...t, platform: 6, status: 'Platform Changed' as const }
          : t
      )
    );

    const p6Node = getNodeById('platform_6');
    if (p6Node) {
      setDestination(p6Node);
      setSelectedPOI(p6Node);

      setActiveNotice({
        id: `plat_chg_${Date.now()}`,
        type: 'platform_change',
        title: 'Platform Change: Express 12345',
        message: 'Express 12345 now departing from Platform 6 (previously Platform 3). Route dynamically updated!',
        timestamp: Date.now(),
      });

      if (!isVoiceMuted) {
        voiceGuidance.speak('Attention: Express 12345 departure platform changed to Platform 6. Rerouting.');
      }

      // If active navigation is underway, recalculate route to P6
      const newRoute = recalculateCurrentRoute(latestPositionRef.current.currentNodeId, p6Node, {
        acc: accessibilityMode,
        crowds: avoidCrowds,
        closed: closedEdgeIds,
        initialHeading: latestPositionRef.current.heading,
      });

      if (navigationStatus === 'navigating' && newRoute) {
        positionProviderRef.current.startWalking(
          newRoute.nodes,
          newRoute.totalDistanceMeters,
          newRoute.edges
        );
      }
    }
  }, [accessibilityMode, avoidCrowds, closedEdgeIds, isVoiceMuted, recalculateCurrentRoute, navigationStatus]);

  // 5. Off Route Simulation
  const demoSimulateOffRoute = useCallback(() => {
    // Teleport user to Waiting Hall
    const offNode = getNodeById('waiting_hall') || nodes[2];
    positionProviderRef.current.simulateOffRoute(offNode);

    setActiveNotice({
      id: `off_route_${Date.now()}`,
      type: 'reroute',
      title: 'Passenger Moved Off Route',
      message: 'Detected deviation from planned path near Waiting Hall. Recalculating new nearest valid route…',
      timestamp: Date.now(),
    });

    if (!isVoiceMuted) {
      voiceGuidance.speak('Off route. Recalculating.');
    }

    if (destination) {
      const newRoute = recalculateCurrentRoute(offNode.id, destination, {
        acc: accessibilityMode,
        crowds: avoidCrowds,
        closed: closedEdgeIds,
        initialHeading: positionProviderRef.current.getCurrentPosition().heading,
      });

      if (navigationStatus === 'navigating' && newRoute) {
        positionProviderRef.current.startWalking(
          newRoute.nodes,
          newRoute.totalDistanceMeters,
          newRoute.edges
        );
      }
    }
  }, [destination, accessibilityMode, avoidCrowds, closedEdgeIds, isVoiceMuted, nodes, recalculateCurrentRoute, navigationStatus]);

  // 6. Reset All Demo
  const demoResetAll = useCallback(() => {
    positionProviderRef.current.destroy();
    const entranceA = getNodeById('entrance_a') || nodes[0];
    positionProviderRef.current = new SimulatorPositionProvider(entranceA);
    setUserPosition(positionProviderRef.current.getCurrentPosition());

    setNodes(STATION_NODES);
    setEdges(STATION_EDGES);
    setTrains(DEMO_TRAINS);
    setAlerts(INITIAL_STATION_ALERTS);
    setClosedEdgeIds([]);
    setAccessibilityModeState(false);
    setAvoidCrowdsState(false);
    setActiveFloor(0);
    setDestination(null);
    setSelectedPOI(null);
    setCalculatedRoute(null);
    setNavigationStatus('idle');
    setIsARMode(false);
    voiceGuidance.stop();

    setActiveNotice({
      id: `reset_${Date.now()}`,
      type: 'info',
      title: 'Demo Environment Reset',
      message: 'Station map, positioning, trains and routing restored to default state at Entrance A.',
      timestamp: Date.now(),
    });
  }, [nodes]);

  const isSimulatorWalking = userPosition.status === 'walking';

  return (
    <NavigationContext.Provider
      value={{
        nodes,
        edges,
        trains,
        alerts,
        userPosition,
        activeFloor,
        setActiveFloor,
        destination,
        selectedPOI,
        setSelectedPOI,
        calculatedRoute,
        navigationStatus,
        currentInstructionIndex,
        liveGuidance,
        accessibilityMode,
        setAccessibilityMode,
        avoidCrowds,
        setAvoidCrowds,
        closedEdgeIds,
        activeNotice,
        clearNotice,
        activeTrain,
        setActiveTrain,
        isARMode,
        setIsARMode,
        isVoiceMuted,
        toggleVoiceMuted,
        isVoiceSpeaking,
        replayCurrentInstruction,
        simulatorSpeed,
        setSimulatorSpeed,
        userPreferences,
        updateUserPreferences,
        selectDestination,
        clearDestination,
        navigateToTrain,
        startNavigation,
        stopNavigation,
        recenterToUser,
        isSimulatorWalking,
        startWalking,
        pauseWalking,
        resumeWalking,
        stepNext,
        resetDemoPosition,
        demoCloseCorridorB,
        demoRestoreCorridors,
        demoSimulateCrowdSpike,
        demoSimulatePlatformChange,
        demoSimulateOffRoute,
        demoResetAll,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
