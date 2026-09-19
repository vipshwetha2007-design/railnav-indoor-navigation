export type FloorLevel = 0 | 1;

export type NodeType =
  | 'entrance'
  | 'concourse'
  | 'corridor'
  | 'platform'
  | 'stairs'
  | 'lift'
  | 'escalator'
  | 'ticket_counter'
  | 'help_desk'
  | 'waiting_hall'
  | 'food_court'
  | 'toilet'
  | 'atm'
  | 'exit'
  | 'waypoint';

export type POICategory =
  | 'platform'
  | 'facility'
  | 'transport'
  | 'food'
  | 'services'
  | 'entrance_exit'
  | 'vertical_transit';

export type CrowdLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StationNode {
  id: string;
  name: string;
  shortName?: string;
  x: number; // 0 to 1000 coordinate space
  y: number; // 0 to 700 coordinate space
  floor: FloorLevel;
  type: NodeType;
  isAccessible: boolean;
  isPOI: boolean;
  poiCategory?: POICategory;
  iconName?: string;
  description?: string;
}

export interface StationEdge {
  id: string;
  from: string; // node id
  to: string;   // node id
  distanceMeters: number;
  isAccessible: boolean;
  hasStairs: boolean;
  hasLift: boolean;
  hasEscalator: boolean;
  isClosed?: boolean;
  closureReason?: string;
  crowdLevel: CrowdLevel;
  floor: FloorLevel | 'transition';
  name?: string;
}

export type ManeuverType =
  | 'straight'
  | 'turn_left'
  | 'turn_right'
  | 'sharp_left'
  | 'sharp_right'
  | 'take_lift'
  | 'take_stairs'
  | 'take_escalator'
  | 'floor_transition'
  | 'destination';

export interface RouteInstruction {
  id: string;
  maneuver: ManeuverType;
  primaryText: string;
  secondaryText?: string;
  distanceMeters: number;
  floor: FloorLevel;
  targetNodeId: string;
  iconName: string;
  announcement: string;
}

export interface CalculatedRoute {
  pathNodeIds: string[];
  edges: StationEdge[];
  nodes: StationNode[];
  totalDistanceMeters: number;
  totalTimeSeconds: number; // estimated at 1.2 m/s
  instructions: RouteInstruction[];
  floorsInvolved: FloorLevel[];
  hasStairs: boolean;
  hasLift: boolean;
  averageCrowd: CrowdLevel;
  isAccessible: boolean;
}

export interface TrainInfo {
  id: string;
  trainNumber: string;
  name: string;
  origin: string;
  destination: string;
  scheduledTime: string;
  expectedTime: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Platform Changed';
  platform: number;
  coachCount: number;
}

export interface StationAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'urgent';
  timestamp: string;
  affectedArea?: string;
  affectedEdgeId?: string;
  isPlatformChange?: boolean;
  trainNumber?: string;
  newPlatform?: number;
}

export interface UserPreferences {
  passengerName: string;
  passengerEmail: string;
  isLoggedIn: boolean;
  accessibilityMode: boolean; // avoid stairs, use lifts
  avoidCrowds: boolean;
  voiceGuidance: boolean;
  reducedMotion: boolean;
  walkingSpeed: number; // m/s, default 1.2
}
