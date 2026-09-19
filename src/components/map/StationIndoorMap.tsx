import React, { useState, useRef, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { StationNode, StationEdge, FloorLevel, CrowdLevel } from '../../types/navigation';
import {
  Train,
  Utensils,
  Ticket,
  Armchair,
  Bath,
  CreditCard,
  ArrowUpDown,
  ChevronsUp,
  DoorOpen,
  HelpCircle,
  Footprints,
  Compass,
  Accessibility,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  AlertTriangle,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from 'lucide-react';

export const StationIndoorMap: React.FC = () => {
  const {
    nodes,
    edges,
    activeFloor,
    setActiveFloor,
    userPosition,
    destination,
    selectedPOI,
    setSelectedPOI,
    selectDestination,
    calculatedRoute,
    navigationStatus,
    closedEdgeIds,
    recenterToUser,
  } = useNavigation();

  // Zoom and Pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes & edges for the currently viewed floor
  const floorNodes = useMemo(() => {
    return nodes.filter((n) => n.floor === activeFloor);
  }, [nodes, activeFloor]);

  const floorEdges = useMemo(() => {
    return edges.filter((e) => e.floor === activeFloor || e.floor === 'transition');
  }, [edges, activeFloor]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.25));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Scroll wheel / Trackpad panning & zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((z) => Math.max(0.6, Math.min(2.5, z + delta)));
    } else {
      // Natural scrolling: scrolling down shifts map upward so lower content becomes visible
      setPan((p) => ({
        x: p.x - e.deltaX * 0.8,
        y: p.y - e.deltaY * 0.8,
      }));
    }
  };

  const handlePanStep = (dx: number, dy: number) => {
    setPan((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));
  };

  // Render POI Icon based on category or icon name
  const renderPoiIcon = (node: StationNode) => {
    const size = 15;
    switch (node.iconName) {
      case 'Train':
        return <Train size={size} className="text-cyan-400" />;
      case 'Utensils':
        return <Utensils size={size} className="text-amber-400" />;
      case 'Ticket':
        return <Ticket size={size} className="text-emerald-400" />;
      case 'Armchair':
        return <Armchair size={size} className="text-purple-400" />;
      case 'Bath':
        return <Bath size={size} className="text-sky-400" />;
      case 'CreditCard':
        return <CreditCard size={size} className="text-yellow-400" />;
      case 'ArrowUpDown':
        return <ArrowUpDown size={size} className="text-teal-300" />;
      case 'ChevronsUp':
        return <ChevronsUp size={size} className="text-blue-400" />;
      case 'DoorOpen':
        return <DoorOpen size={size} className="text-emerald-300" />;
      case 'HelpCircle':
        return <HelpCircle size={size} className="text-indigo-300" />;
      case 'Accessibility':
        return <Accessibility size={size} className="text-cyan-300" />;
      default:
        return <Footprints size={size} className="text-slate-300" />;
    }
  };

  // Build SVG Path for calculated route that falls on the active floor
  const activeRouteSegments = useMemo(() => {
    if (!calculatedRoute || calculatedRoute.nodes.length < 2) return [];

    const segments: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isTransition: boolean;
      transitionTo?: FloorLevel;
    }[] = [];

    for (let i = 0; i < calculatedRoute.nodes.length - 1; i++) {
      const n1 = calculatedRoute.nodes[i];
      const n2 = calculatedRoute.nodes[i + 1];

      if (n1.floor === activeFloor && n2.floor === activeFloor) {
        segments.push({
          x1: n1.x,
          y1: n1.y,
          x2: n2.x,
          y2: n2.y,
          isTransition: false,
        });
      } else if (n1.floor === activeFloor && n2.floor !== activeFloor) {
        // Leaving active floor
        segments.push({
          x1: n1.x,
          y1: n1.y,
          x2: n2.x,
          y2: n2.y,
          isTransition: true,
          transitionTo: n2.floor,
        });
      } else if (n1.floor !== activeFloor && n2.floor === activeFloor) {
        // Entering active floor
        segments.push({
          x1: n1.x,
          y1: n1.y,
          x2: n2.x,
          y2: n2.y,
          isTransition: true,
          transitionTo: n1.floor,
        });
      }
    }
    return segments;
  }, [calculatedRoute, activeFloor]);

  // Check if route involves multiple floors
  const hasMultipleFloorsInRoute = calculatedRoute && calculatedRoute.floorsInvolved.length > 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] bg-slate-950 overflow-hidden select-none rounded-2xl border border-slate-800 shadow-2xl flex flex-col"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Controls: Floor Selector & Status */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/70 shadow-lg pointer-events-auto">
          <button
            id="floor-btn-l0"
            onClick={() => setActiveFloor(0)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeFloor === 0
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Level 0 • Concourse
          </button>
          <button
            id="floor-btn-l1"
            onClick={() => setActiveFloor(1)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeFloor === 1
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Level 1 • Footbridge
          </button>
        </div>

        {/* Legend toggle & Floor transition indicator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {hasMultipleFloorsInRoute && (
            <div className="px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-xl flex items-center gap-1.5 backdrop-blur-md">
              <Layers size={13} className="text-amber-400" />
              <span>Multi-Floor Route</span>
            </div>
          )}

          <button
            id="legend-toggle-btn"
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 bg-slate-900/90 text-slate-300 hover:text-white rounded-xl border border-slate-700/70 backdrop-blur-md shadow-md transition-all"
            title="Toggle Map Legend"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Map Canvas (SVG) */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="stationGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
            </pattern>

            {/* Closed corridor stripe pattern */}
            <pattern id="closedStripe" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" strokeWidth="6" strokeOpacity="0.6" />
              <line x1="10" y1="0" x2="10" y2="20" stroke="#f59e0b" strokeWidth="6" strokeOpacity="0.6" />
            </pattern>

            {/* Glowing route filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Radar Pulse Radial Gradient */}
            <radialGradient id="userRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            {/* Heading Cone Forward Beam Gradient */}
            <linearGradient id="headingConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>

            {/* Route Directional Chevron Marker */}
            <marker
              id="routeChevron"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M 2 2 L 6 5 L 2 8" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="700" fill="#030712" />
          <rect width="1000" height="700" fill="url(#stationGrid)" />

          {/* ================= FLOOR ARCHITECTURE / ZONES ================= */}
          {activeFloor === 0 ? (
            /* LEVEL 0 ARCHITECTURE */
            <g id="floor-0-zones" className="transition-opacity duration-300">
              {/* Station Outer Boundary */}
              <rect
                x="80"
                y="80"
                width="840"
                height="540"
                rx="24"
                fill="#0b1329"
                stroke="#1e293b"
                strokeWidth="2.5"
              />

              {/* Concourse Main Hall */}
              <rect x="130" y="160" width="340" height="380" rx="16" fill="#111c38" stroke="#334155" strokeWidth="1" />
              <text x="300" y="340" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="600" letterSpacing="1.5">
                MAIN CONCOURSE PLAZA
              </text>

              {/* Waiting Hall Room */}
              <rect x="140" y="390" width="130" height="130" rx="10" fill="#1e1b4b" fillOpacity="0.4" stroke="#4338ca" strokeWidth="1" strokeDasharray="4 2" />
              <text x="205" y="475" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">
                WAITING HALL
              </text>

              {/* Food Court Zone */}
              <rect x="300" y="470" width="160" height="110" rx="10" fill="#451a03" fillOpacity="0.35" stroke="#b45309" strokeWidth="1" />
              <text x="380" y="525" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">
                FOOD COURT
              </text>

              {/* Ticket Office */}
              <rect x="150" y="180" width="140" height="80" rx="10" fill="#064e3b" fillOpacity="0.3" stroke="#059669" strokeWidth="1" />
              <text x="220" y="245" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="600">
                TICKET COUNTERS
              </text>

              {/* Accessible Ramp Corridor (Highlighted) */}
              <rect x="360" y="150" width="100" height="80" rx="8" fill="#083344" fillOpacity="0.5" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 3" />
              <text x="410" y="180" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">
                ACCESSIBLE RAMP
              </text>

              {/* Corridor B Zone (Can be closed!) */}
              <rect
                x="370"
                y="310"
                width="95"
                height="80"
                rx="8"
                fill={closedEdgeIds.includes('e_concourse_corridor_b') ? 'url(#closedStripe)' : '#1e293b'}
                fillOpacity={closedEdgeIds.includes('e_concourse_corridor_b') ? 0.8 : 0.4}
                stroke={closedEdgeIds.includes('e_concourse_corridor_b') ? '#ef4444' : '#475569'}
                strokeWidth="1.5"
              />
              <text
                x="418"
                y="355"
                textAnchor="middle"
                fill={closedEdgeIds.includes('e_concourse_corridor_b') ? '#fca5a5' : '#94a3b8'}
                fontSize="10"
                fontWeight="700"
              >
                {closedEdgeIds.includes('e_concourse_corridor_b') ? 'CORRIDOR B (CLOSED)' : 'CORRIDOR B'}
              </text>

              {/* Railway Tracks & Platforms 1, 2, 3 */}
              {/* Platform 1 */}
              <rect x="620" y="100" width="240" height="70" rx="8" fill="#132338" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="620" y1="170" x2="860" y2="170" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 4" />
              <text x="740" y="135" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700">
                PLATFORM 1
              </text>
              <text x="740" y="155" textAnchor="middle" fill="#64748b" fontSize="9">
                TRACK 1 • NORTH EXPRESS
              </text>

              {/* Platform 2 */}
              <rect x="620" y="240" width="240" height="70" rx="8" fill="#132338" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="620" y1="310" x2="860" y2="310" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 4" />
              <text x="740" y="275" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700">
                PLATFORM 2
              </text>
              <text x="740" y="295" textAnchor="middle" fill="#64748b" fontSize="9">
                TRACK 2 • INTERCITY REGIONAL
              </text>

              {/* Platform 3 */}
              <rect x="620" y="410" width="240" height="70" rx="8" fill="#132338" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="620" y1="480" x2="860" y2="480" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 4" />
              <text x="740" y="445" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700">
                PLATFORM 3
              </text>
              <text x="740" y="465" textAnchor="middle" fill="#64748b" fontSize="9">
                TRACK 3 • SUBURBAN & MAILS
              </text>
            </g>
          ) : (
            /* LEVEL 1 ARCHITECTURE (FOOTBRIDGE & PLATFORMS 4-6) */
            <g id="floor-1-zones" className="transition-opacity duration-300">
              {/* Elevated Footbridge Structure */}
              <rect x="440" y="120" width="160" height="460" rx="20" fill="#111c38" stroke="#3b82f6" strokeWidth="2" />
              <text x="520" y="320" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700" letterSpacing="1">
                ELEVATED OVERPASS
              </text>

              {/* Executive Lounge */}
              <rect x="290" y="160" width="140" height="90" rx="10" fill="#2e1065" fillOpacity="0.45" stroke="#9333ea" strokeWidth="1" />
              <text x="360" y="210" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="600">
                EXECUTIVE LOUNGE
              </text>

              {/* Level 1 Restrooms */}
              <rect x="310" y="400" width="120" height="70" rx="10" fill="#082f49" fillOpacity="0.45" stroke="#0284c7" strokeWidth="1" />
              <text x="370" y="440" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
                RESTROOMS (L1)
              </text>

              {/* Platform 4 */}
              <rect x="710" y="130" width="220" height="70" rx="8" fill="#132338" stroke="#10b981" strokeWidth="1.5" />
              <line x1="710" y1="200" x2="930" y2="200" stroke="#34d399" strokeWidth="2" strokeDasharray="8 4" />
              <text x="820" y="165" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="700">
                PLATFORM 4
              </text>
              <text x="820" y="185" textAnchor="middle" fill="#64748b" fontSize="9">
                ELEVATED TRACK • RAJDHANI
              </text>

              {/* Platform 5 */}
              <rect x="710" y="290" width="220" height="70" rx="8" fill="#132338" stroke="#10b981" strokeWidth="1.5" />
              <line x1="710" y1="360" x2="930" y2="360" stroke="#34d399" strokeWidth="2" strokeDasharray="8 4" />
              <text x="820" y="325" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="700">
                PLATFORM 5
              </text>
              <text x="820" y="345" textAnchor="middle" fill="#64748b" fontSize="9">
                ELEVATED TRACK • WESTERN EXP
              </text>

              {/* Platform 6 (High-Priority / Express 12345) */}
              <rect x="710" y="460" width="220" height="70" rx="8" fill="#132338" stroke="#10b981" strokeWidth="2" />
              <line x1="710" y1="530" x2="930" y2="530" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 4" />
              <text x="820" y="495" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="800">
                PLATFORM 6 ★
              </text>
              <text x="820" y="515" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="600">
                EXPRESS 12345 • CAPITAL SUPERFAST
              </text>
            </g>
          )}

          {/* ================= WALKABLE EDGES / CORRIDORS ================= */}
          <g id="station-edges">
            {floorEdges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isClosed = edge.isClosed || closedEdgeIds.includes(edge.id);

              // Determine color based on crowd and status
              let strokeColor = '#334155';
              let strokeWidth = 3;
              let strokeDash: string | undefined = undefined;

              if (isClosed) {
                strokeColor = '#ef4444';
                strokeWidth = 4;
                strokeDash = '6 4';
              } else if (edge.crowdLevel === 'HIGH') {
                strokeColor = '#f97316';
                strokeWidth = 4;
              } else if (edge.crowdLevel === 'MEDIUM') {
                strokeColor = '#eab308';
                strokeWidth = 3.5;
              } else if (edge.isAccessible && edge.hasLift) {
                strokeColor = '#06b6d4';
                strokeWidth = 3;
                strokeDash = '4 3';
              }

              return (
                <g key={edge.id}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    strokeLinecap="round"
                    opacity={isClosed ? 0.9 : 0.7}
                  />

                  {/* High Crowd Glow / Caution */}
                  {edge.crowdLevel === 'HIGH' && !isClosed && (
                    <circle
                      cx={(fromNode.x + toNode.x) / 2}
                      cy={(fromNode.y + toNode.y) / 2}
                      r="12"
                      fill="#f97316"
                      fillOpacity="0.25"
                    />
                  )}

                  {/* Closed warning badge on edge */}
                  {isClosed && (
                    <g transform={`translate(${(fromNode.x + toNode.x) / 2}, ${(fromNode.y + toNode.y) / 2})`}>
                      <circle r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                      <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* ================= ACTIVE ROUTE HIGHLIGHT ================= */}
          <g id="active-route" filter="url(#routeGlow)">
            {activeRouteSegments.map((seg, idx) => (
              <g key={`route-seg-${idx}`}>
                {/* Thick background route line */}
                <line
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                {/* Animated dash flow line */}
                <line
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#22d3ee"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="animate-route-flow"
                />

                {/* Transition marker if changing floor */}
                {seg.isTransition && (
                  <g transform={`translate(${seg.x1}, ${seg.y1})`}>
                    <circle r="14" fill="#0891b2" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                      L{seg.transitionTo}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </g>

          {/* ================= POI & NODE PINS ================= */}
          <g id="station-poi-nodes">
            {floorNodes
              .filter((n) => n.isPOI)
              .map((node) => {
                const isSelected = selectedPOI?.id === node.id;
                const isDest = destination?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPOI(node);
                      selectDestination(node);
                    }}
                  >
                    {/* Pulsing ring for destination */}
                    {isDest && (
                      <circle r="22" fill="none" stroke="#10b981" strokeWidth="2.5" className="animate-ping" opacity="0.75" />
                    )}

                    {/* Outer Circle Base */}
                    <circle
                      r={isDest ? 18 : isSelected ? 16 : 13}
                      fill={isDest ? '#059669' : isSelected ? '#0284c7' : '#0f172a'}
                      stroke={isDest ? '#34d399' : isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected || isDest ? 2.5 : 1.5}
                      className="shadow-lg"
                    />

                    {/* Icon container */}
                    <foreignObject x="-9" y="-9" width="18" height="18" className="pointer-events-none">
                      <div className="w-full h-full flex items-center justify-center">
                        {renderPoiIcon(node)}
                      </div>
                    </foreignObject>

                    {/* Label */}
                    <text
                      y={isDest ? 30 : 25}
                      textAnchor="middle"
                      fill={isDest ? '#34d399' : isSelected ? '#38bdf8' : '#cbd5e1'}
                      fontSize="9.5"
                      fontWeight={isDest || isSelected ? '700' : '600'}
                      className="drop-shadow-md select-none pointer-events-none"
                    >
                      {node.shortName || node.name}
                    </text>
                  </g>
                );
              })}
          </g>

          {/* ================= "YOU ARE HERE" PASSENGER POSITION ================= */}
          {userPosition.floor === activeFloor && (
            <g
              id="user-position-marker"
              transform={`translate(${userPosition.x}, ${userPosition.y})`}
              className="transition-all duration-100 ease-linear pointer-events-none"
            >
              {/* Radar pulse ripples */}
              <circle r="36" fill="url(#userRadarGlow)" className="animate-radar" />
              <circle r="20" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />

              {/* Core Position Pin */}
              <circle r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="3" className="shadow-2xl" />

              {/* Directional heading pointer arrow & forward trajectory beam */}
              <g
                transform={`rotate(${userPosition.heading + 90})`}
                className="transition-transform duration-200 ease-out"
              >
                {/* Forward trajectory beam cone */}
                <path
                  d="M 0 0 L -25 -65 L 25 -65 Z"
                  fill="url(#headingConeGrad)"
                />
                {/* Direction pointer arrow */}
                <path
                  d="M 0 -25 L 9 -8 L 0 -13 L -9 -8 Z"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
              </g>

              {/* Pulse center */}
              <circle r="4" fill="#ffffff" />

              {/* Floating label */}
              <rect x="-38" y="-38" width="76" height="17" rx="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="-26" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800" letterSpacing="0.5">
                YOU ARE HERE
              </text>
            </g>
          )}

          {/* If user is on a different floor, show a callout marker pointing to lift/stair */}
          {userPosition.floor !== activeFloor && (
            <g transform="translate(500, 40)" className="pointer-events-none">
              <rect x="-120" y="-15" width="240" height="30" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <text x="0" y="5" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="700">
                You are currently on Level {userPosition.floor}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Quick Scroll Down Map Helper (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <button
          id="scroll-down-map-pill"
          onClick={() => handlePanStep(0, -100)}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all pointer-events-auto"
          title="Scroll down map view"
        >
          <ArrowDown size={14} className="animate-bounce" />
          <span>Scroll Down Map</span>
        </button>
      </div>

      {/* Bottom Floating Map Action Controls (Zoom, Pan Directions, Reset, Recenter) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          id="recenter-map-btn"
          onClick={recenterToUser}
          className="p-2.5 bg-slate-900/90 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg transition-all"
          title="Recenter on current location"
        >
          <Navigation size={18} className="rotate-45" />
        </button>

        {/* Pan / Directional Scroll Controls */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg p-1">
          <button
            id="pan-up-btn"
            onClick={() => handlePanStep(0, 70)}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
            title="Pan / Scroll Up"
          >
            <ChevronUp size={16} />
          </button>
          <div className="flex items-center gap-1">
            <button
              id="pan-left-btn"
              onClick={() => handlePanStep(70, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Pan / Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="reset-view-btn"
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-all"
              title="Reset Center"
            >
              <Maximize2 size={13} />
            </button>
            <button
              id="pan-right-btn"
              onClick={() => handlePanStep(-70, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Pan / Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            id="pan-down-btn"
            onClick={() => handlePanStep(0, -70)}
            className="p-1 text-cyan-400 hover:text-white hover:bg-slate-800 rounded transition-all"
            title="Pan / Scroll Down"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-slate-900/90 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg overflow-hidden">
          <button
            id="zoom-in-btn"
            onClick={handleZoomIn}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800 transition-all"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            id="zoom-out-btn"
            onClick={handleZoomOut}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>

      {/* Map Legend Modal / Panel */}
      {showLegend && (
        <div className="absolute top-14 right-3 z-30 w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs text-slate-300 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-white text-sm">Station Map Key</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-cyan-400 rounded-full" />
              <span>Active Walking Route</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
              <span>You Are Here</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-300" />
              <span>Selected Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-orange-500 rounded-full" />
              <span>High Crowd Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-red-500 rounded-full border border-dashed border-white" />
              <span>Temporarily Closed Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-teal-300" />
              <span>Wheelchair Accessible Lift</span>
            </div>
            <div className="flex items-center gap-2">
              <Accessibility size={14} className="text-cyan-300" />
              <span>Step-Free Ramp Passage</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
