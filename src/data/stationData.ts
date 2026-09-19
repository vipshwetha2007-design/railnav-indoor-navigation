import { StationNode, StationEdge, FloorLevel } from '../types/navigation';

export interface StationMetadata {
  id: string;
  name: string;
  code: string;
  city: string;
  totalPlatforms: number;
  floors: { level: FloorLevel; name: string; description: string }[];
}

export const DEMO_STATION: StationMetadata = {
  id: 'metro-central',
  name: 'Metro Central Junction',
  code: 'MCJ',
  city: 'Capital City',
  totalPlatforms: 6,
  floors: [
    { level: 0, name: 'Level 0 — Main Concourse', description: 'Ticketing, Waiting Hall, Food Court & Platforms 1-3' },
    { level: 1, name: 'Level 1 — Footbridge & Overpass', description: 'Elevated Overpass, Executive Lounge & Platforms 4-6' },
  ],
};

// All station nodes for Level 0 and Level 1
export const STATION_NODES: StationNode[] = [
  // ================= LEVEL 0 (GROUND CONCOURSE & PLATFORMS 1-3) =================
  {
    id: 'entrance_a',
    name: 'Entrance A (North)',
    shortName: 'Gate A',
    x: 120,
    y: 120,
    floor: 0,
    type: 'entrance',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'entrance_exit',
    iconName: 'DoorOpen',
    description: 'Main North drop-off & metro link'
  },
  {
    id: 'entrance_b',
    name: 'Entrance B (South)',
    shortName: 'Gate B',
    x: 120,
    y: 580,
    floor: 0,
    type: 'entrance',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'entrance_exit',
    iconName: 'DoorOpen',
    description: 'South plaza & taxi terminal'
  },
  {
    id: 'main_concourse',
    name: 'Main Concourse Center',
    shortName: 'Concourse',
    x: 280,
    y: 350,
    floor: 0,
    type: 'concourse',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'Compass',
    description: 'Central station plaza & train display screens'
  },
  {
    id: 'ticket_counter',
    name: 'Ticket Counter & Booking Office',
    shortName: 'Tickets',
    x: 220,
    y: 220,
    floor: 0,
    type: 'ticket_counter',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'Ticket',
    description: 'Manual ticket windows & automatic booking kiosks'
  },
  {
    id: 'help_desk',
    name: 'Passenger Information & Help Desk',
    shortName: 'Help Desk',
    x: 320,
    y: 260,
    floor: 0,
    type: 'help_desk',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'HelpCircle',
    description: 'Station assistance, lost & found, porter service'
  },
  {
    id: 'waiting_hall',
    name: 'Main Waiting Hall',
    shortName: 'Waiting Hall',
    x: 190,
    y: 440,
    floor: 0,
    type: 'waiting_hall',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'facility',
    iconName: 'Armchair',
    description: 'Air-conditioned seating area with charging stations'
  },
  {
    id: 'food_court',
    name: 'Station Food Court',
    shortName: 'Food Court',
    x: 370,
    y: 540,
    floor: 0,
    type: 'food_court',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'food',
    iconName: 'Utensils',
    description: 'Cafes, fast food, bakery & hot beverages'
  },
  {
    id: 'toilet_l0',
    name: 'Restrooms & Accessible Toilet (L0)',
    shortName: 'Restrooms L0',
    x: 160,
    y: 300,
    floor: 0,
    type: 'toilet',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'facility',
    iconName: 'Bath',
    description: 'Restrooms with wheelchair accessibility & baby changing'
  },
  {
    id: 'atm_kiosk',
    name: 'ATM & Currency Kiosk',
    shortName: 'ATM',
    x: 270,
    y: 470,
    floor: 0,
    type: 'atm',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'CreditCard',
    description: 'Multi-bank cash dispensers'
  },
  {
    id: 'exit_east',
    name: 'Exit Gate East',
    shortName: 'Exit East',
    x: 930,
    y: 350,
    floor: 0,
    type: 'exit',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'entrance_exit',
    iconName: 'LogOut',
    description: 'Exit toward East city bus terminal'
  },
  // Level 0 Waypoints & Corridors
  {
    id: 'junction_north',
    name: 'North Concourse Junction',
    x: 260,
    y: 150,
    floor: 0,
    type: 'corridor',
    isAccessible: true,
    isPOI: false
  },
  {
    id: 'junction_south',
    name: 'South Concourse Junction',
    x: 250,
    y: 540,
    floor: 0,
    type: 'corridor',
    isAccessible: true,
    isPOI: false
  },
  {
    id: 'corridor_b_node',
    name: 'Corridor B (Central Walkway)',
    shortName: 'Corridor B',
    x: 420,
    y: 350,
    floor: 0,
    type: 'corridor',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'Footprints',
    description: 'Direct central corridor connecting concourse to platforms'
  },
  {
    id: 'accessible_corridor_node',
    name: 'Accessible Ramp & Wide Corridor',
    shortName: 'Accessible Corridor',
    x: 410,
    y: 190,
    floor: 0,
    type: 'corridor',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'Accessibility',
    description: 'Step-free gentle ramp corridor equipped with tactile flooring'
  },
  // Vertical nodes on Level 0
  {
    id: 'staircase_a_l0',
    name: 'Staircase A (to Footbridge)',
    shortName: 'Stairs A (L0)',
    x: 480,
    y: 290,
    floor: 0,
    type: 'stairs',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'Footprints',
    description: 'Rapid stairs to Footbridge Level 1'
  },
  {
    id: 'staircase_b_l0',
    name: 'Staircase B (South)',
    shortName: 'Stairs B (L0)',
    x: 480,
    y: 430,
    floor: 0,
    type: 'stairs',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'Footprints',
    description: 'Stairs to Level 1 south footbridge'
  },
  {
    id: 'lift_1_l0',
    name: 'Passenger Lift 1 (North - Accessible)',
    shortName: 'Lift 1 (L0)',
    x: 480,
    y: 190,
    floor: 0,
    type: 'lift',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'ArrowUpDown',
    description: 'Priority wheelchair elevator connecting Level 0 and Level 1'
  },
  {
    id: 'escalator_1_l0',
    name: 'Escalator 1 (Up to Footbridge)',
    shortName: 'Escalator (L0)',
    x: 480,
    y: 370,
    floor: 0,
    type: 'escalator',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'ChevronsUp',
    description: 'Upward escalator to Level 1 Overpass'
  },
  // Platforms on Level 0
  {
    id: 'platform_1',
    name: 'Platform 1 (Main Concourse Level)',
    shortName: 'Platform 1',
    x: 640,
    y: 140,
    floor: 0,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Ground-level island platform for express trains'
  },
  {
    id: 'platform_2',
    name: 'Platform 2 (Concourse Level)',
    shortName: 'Platform 2',
    x: 640,
    y: 280,
    floor: 0,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Suburban and regional passenger trains'
  },
  {
    id: 'platform_3',
    name: 'Platform 3 (South Concourse)',
    shortName: 'Platform 3',
    x: 640,
    y: 450,
    floor: 0,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Intercity and high-speed express platform'
  },
  {
    id: 'platform_waypoint_l0',
    name: 'Platform 1-3 Walkway Junction',
    x: 580,
    y: 280,
    floor: 0,
    type: 'waypoint',
    isAccessible: true,
    isPOI: false
  },

  // ================= LEVEL 1 (ELEVATED FOOTBRIDGE & PLATFORMS 4-6) =================
  {
    id: 'footbridge_center',
    name: 'Central Footbridge Overpass',
    shortName: 'Footbridge',
    x: 520,
    y: 330,
    floor: 1,
    type: 'concourse',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'services',
    iconName: 'Footprints',
    description: 'Wide elevated pedestrian overpass spanning all tracks'
  },
  {
    id: 'footbridge_north',
    name: 'North Footbridge Corridor',
    x: 520,
    y: 200,
    floor: 1,
    type: 'corridor',
    isAccessible: true,
    isPOI: false
  },
  {
    id: 'footbridge_south',
    name: 'South Footbridge Corridor',
    x: 520,
    y: 460,
    floor: 1,
    type: 'corridor',
    isAccessible: true,
    isPOI: false
  },
  {
    id: 'staircase_a_l1',
    name: 'Staircase A Landing (L1)',
    shortName: 'Stairs A (L1)',
    x: 480,
    y: 290,
    floor: 1,
    type: 'stairs',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'Footprints',
    description: 'Stairs down to Main Concourse'
  },
  {
    id: 'staircase_b_l1',
    name: 'Staircase B Landing (L1)',
    shortName: 'Stairs B (L1)',
    x: 480,
    y: 430,
    floor: 1,
    type: 'stairs',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'Footprints',
    description: 'Stairs down to South Concourse'
  },
  {
    id: 'lift_1_l1',
    name: 'Passenger Lift 1 Landing (L1)',
    shortName: 'Lift 1 (L1)',
    x: 480,
    y: 190,
    floor: 1,
    type: 'lift',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'ArrowUpDown',
    description: 'Accessible elevator to Concourse'
  },
  {
    id: 'escalator_1_l1',
    name: 'Escalator 1 Landing (L1)',
    shortName: 'Escalator (L1)',
    x: 480,
    y: 370,
    floor: 1,
    type: 'escalator',
    isAccessible: false,
    isPOI: true,
    poiCategory: 'vertical_transit',
    iconName: 'ChevronsUp',
    description: 'Escalator exit from concourse'
  },
  // Platforms on Level 1 (Accessible via Footbridge Overpass)
  {
    id: 'platform_4',
    name: 'Platform 4 (Elevated Track)',
    shortName: 'Platform 4',
    x: 740,
    y: 170,
    floor: 1,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Platform 4 for intercity lines & express arrivals'
  },
  {
    id: 'platform_5',
    name: 'Platform 5 (Island Overpass)',
    shortName: 'Platform 5',
    x: 740,
    y: 330,
    floor: 1,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Platform 5 for long-distance superfast services'
  },
  {
    id: 'platform_6',
    name: 'Platform 6 (Terminal Track)',
    shortName: 'Platform 6',
    x: 740,
    y: 500,
    floor: 1,
    type: 'platform',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'platform',
    iconName: 'Train',
    description: 'Platform 6 for Express 12345 & high-priority trains'
  },
  {
    id: 'exec_lounge',
    name: 'Executive Transit Lounge',
    shortName: 'VIP Lounge',
    x: 370,
    y: 200,
    floor: 1,
    type: 'waiting_hall',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'facility',
    iconName: 'Coffee',
    description: 'Premium lounge with refreshments & workspaces'
  },
  {
    id: 'toilet_l1',
    name: 'Restrooms L1',
    shortName: 'Restrooms L1',
    x: 370,
    y: 430,
    floor: 1,
    type: 'toilet',
    isAccessible: true,
    isPOI: true,
    poiCategory: 'facility',
    iconName: 'Bath',
    description: 'Level 1 passenger restrooms'
  },
];

// Reusable station edges forming the walking graph
export const STATION_EDGES: StationEdge[] = [
  // ================= LEVEL 0 HORIZONTAL CONNECTIONS =================
  // Entrance A to North Junction
  {
    id: 'e_in_a_jnc_n',
    from: 'entrance_a',
    to: 'junction_north',
    distanceMeters: 45,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'North Entrance Hall'
  },
  // North Junction to Ticket Counter
  {
    id: 'e_jnc_n_tickets',
    from: 'junction_north',
    to: 'ticket_counter',
    distanceMeters: 25,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Booking Office Approach'
  },
  // Ticket Counter to Main Concourse
  {
    id: 'e_tickets_concourse',
    from: 'ticket_counter',
    to: 'main_concourse',
    distanceMeters: 40,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Concourse Walkway'
  },
  // Main Concourse to Help Desk
  {
    id: 'e_concourse_help',
    from: 'main_concourse',
    to: 'help_desk',
    distanceMeters: 30,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Information Hub Path'
  },
  // Entrance B to South Junction
  {
    id: 'e_in_b_jnc_s',
    from: 'entrance_b',
    to: 'junction_south',
    distanceMeters: 40,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'South Entrance Hall'
  },
  // South Junction to Waiting Hall
  {
    id: 'e_jnc_s_waiting',
    from: 'junction_south',
    to: 'waiting_hall',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Waiting Lounge Corridor'
  },
  // Waiting Hall to Concourse
  {
    id: 'e_waiting_concourse',
    from: 'waiting_hall',
    to: 'main_concourse',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Concourse Passage'
  },
  // South Junction to Food Court
  {
    id: 'e_jnc_s_food',
    from: 'junction_south',
    to: 'food_court',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Food Court Plaza'
  },
  // Food Court to Concourse
  {
    id: 'e_food_concourse',
    from: 'food_court',
    to: 'main_concourse',
    distanceMeters: 55,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Dining Walkway'
  },
  // Concourse to Toilet L0
  {
    id: 'e_concourse_toilet',
    from: 'main_concourse',
    to: 'toilet_l0',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Facilities Corridor'
  },
  // Concourse to ATM
  {
    id: 'e_concourse_atm',
    from: 'main_concourse',
    to: 'atm_kiosk',
    distanceMeters: 30,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'ATM Alcove'
  },

  // ================= CORRIDOR B vs ACCESSIBLE CORRIDOR =================
  // Main Concourse to Corridor B (Central Walkway) - this can be closed for maintenance demo!
  {
    id: 'e_concourse_corridor_b',
    from: 'main_concourse',
    to: 'corridor_b_node',
    distanceMeters: 40,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'HIGH', // normally crowded central artery
    floor: 0,
    name: 'Corridor B (Central Corridor)'
  },
  // Help Desk to Accessible Corridor Node
  {
    id: 'e_help_acc_corridor',
    from: 'help_desk',
    to: 'accessible_corridor_node',
    distanceMeters: 30,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Accessible Ramp Way'
  },
  // North Junction to Accessible Corridor Node
  {
    id: 'e_jnc_n_acc_corridor',
    from: 'junction_north',
    to: 'accessible_corridor_node',
    distanceMeters: 50,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'North Ramp Connector'
  },
  // Accessible Corridor to Lift 1 L0
  {
    id: 'e_acc_corridor_lift_1',
    from: 'accessible_corridor_node',
    to: 'lift_1_l0',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Elevator Approach'
  },

  // Corridor B connections to Stairs A, Escalator 1, and Platform Waypoint
  {
    id: 'e_corridor_b_stairs_a',
    from: 'corridor_b_node',
    to: 'staircase_a_l0',
    distanceMeters: 25,
    isAccessible: true, // flat path to the stair base
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Staircase A Entrance'
  },
  {
    id: 'e_corridor_b_escalator',
    from: 'corridor_b_node',
    to: 'escalator_1_l0',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Escalator 1 Base'
  },
  {
    id: 'e_corridor_b_stairs_b',
    from: 'corridor_b_node',
    to: 'staircase_b_l0',
    distanceMeters: 30,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Stairs B South Way'
  },
  {
    id: 'e_corridor_b_plat_waypoint',
    from: 'corridor_b_node',
    to: 'platform_waypoint_l0',
    distanceMeters: 45,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Ground Platform Arterial'
  },

  // Connections to Ground Platforms (1, 2, 3)
  {
    id: 'e_plat_waypoint_p1',
    from: 'platform_waypoint_l0',
    to: 'platform_1',
    distanceMeters: 40,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Platform 1 Walk'
  },
  {
    id: 'e_plat_waypoint_p2',
    from: 'platform_waypoint_l0',
    to: 'platform_2',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 0,
    name: 'Platform 2 Walk'
  },
  {
    id: 'e_plat_waypoint_p3',
    from: 'platform_waypoint_l0',
    to: 'platform_3',
    distanceMeters: 45,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'Platform 3 Walk'
  },
  {
    id: 'e_plat_waypoint_exit',
    from: 'platform_waypoint_l0',
    to: 'exit_east',
    distanceMeters: 85,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 0,
    name: 'East Exit Concourse'
  },

  // ================= VERTICAL CONNECTIONS (LEVEL 0 <-> LEVEL 1) =================
  // Lift 1 (Vertical - Accessible)
  {
    id: 'e_vert_lift_1',
    from: 'lift_1_l0',
    to: 'lift_1_l1',
    distanceMeters: 15,
    isAccessible: true,
    hasStairs: false,
    hasLift: true,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 'transition',
    name: 'Passenger Lift 1 (North)'
  },
  // Staircase A (Vertical - NOT Accessible)
  {
    id: 'e_vert_stairs_a',
    from: 'staircase_a_l0',
    to: 'staircase_a_l1',
    distanceMeters: 25,
    isAccessible: false,
    hasStairs: true,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'HIGH', // common choke point
    floor: 'transition',
    name: 'Staircase A (to Footbridge)'
  },
  // Staircase B (Vertical - NOT Accessible)
  {
    id: 'e_vert_stairs_b',
    from: 'staircase_b_l0',
    to: 'staircase_b_l1',
    distanceMeters: 25,
    isAccessible: false,
    hasStairs: true,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 'transition',
    name: 'Staircase B (South Overpass)'
  },
  // Escalator 1 (Vertical - Upward)
  {
    id: 'e_vert_escalator_1',
    from: 'escalator_1_l0',
    to: 'escalator_1_l1',
    distanceMeters: 20,
    isAccessible: false,
    hasStairs: false,
    hasLift: false,
    hasEscalator: true,
    crowdLevel: 'MEDIUM',
    floor: 'transition',
    name: 'Escalator 1 (Upward)'
  },

  // ================= LEVEL 1 CONNECTIONS (FOOTBRIDGE & PLATFORMS 4-6) =================
  // Lift 1 Landing to North Footbridge
  {
    id: 'e_lift1_fb_north',
    from: 'lift_1_l1',
    to: 'footbridge_north',
    distanceMeters: 15,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Lift 1 Footbridge Corridor'
  },
  // North Footbridge to Executive Lounge
  {
    id: 'e_fb_north_lounge',
    from: 'footbridge_north',
    to: 'exec_lounge',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'VIP Lounge Entry'
  },
  // Staircase A L1 to Footbridge Center
  {
    id: 'e_stairs_a_fb_center',
    from: 'staircase_a_l1',
    to: 'footbridge_center',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'HIGH',
    floor: 1,
    name: 'Stair A Landing Bridge'
  },
  // Escalator 1 L1 to Footbridge Center
  {
    id: 'e_escalator_fb_center',
    from: 'escalator_1_l1',
    to: 'footbridge_center',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 1,
    name: 'Escalator Overpass Landing'
  },
  // North Footbridge to Footbridge Center
  {
    id: 'e_fb_north_fb_center',
    from: 'footbridge_north',
    to: 'footbridge_center',
    distanceMeters: 35,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'North-Central Bridge Spine'
  },
  // Footbridge Center to South Footbridge
  {
    id: 'e_fb_center_fb_south',
    from: 'footbridge_center',
    to: 'footbridge_south',
    distanceMeters: 40,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 1,
    name: 'South Bridge Spine'
  },
  // Staircase B L1 to South Footbridge
  {
    id: 'e_stairs_b_fb_south',
    from: 'staircase_b_l1',
    to: 'footbridge_south',
    distanceMeters: 20,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Stairs B Overpass Landing'
  },
  // South Footbridge to Toilet L1
  {
    id: 'e_fb_south_toilet',
    from: 'footbridge_south',
    to: 'toilet_l1',
    distanceMeters: 30,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Level 1 Restrooms'
  },

  // Overpass to Elevated Platforms (4, 5, 6)
  // North Footbridge to Platform 4
  {
    id: 'e_fb_north_p4',
    from: 'footbridge_north',
    to: 'platform_4',
    distanceMeters: 55,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Platform 4 Ramp Bridge'
  },
  // Footbridge Center to Platform 5
  {
    id: 'e_fb_center_p5',
    from: 'footbridge_center',
    to: 'platform_5',
    distanceMeters: 50,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'MEDIUM',
    floor: 1,
    name: 'Platform 5 Overpass Ramp'
  },
  // Footbridge Center to Platform 6
  {
    id: 'e_fb_center_p6',
    from: 'footbridge_center',
    to: 'platform_6',
    distanceMeters: 60,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Platform 6 Overpass Corridor'
  },
  // South Footbridge to Platform 6 (alternative access!)
  {
    id: 'e_fb_south_p6',
    from: 'footbridge_south',
    to: 'platform_6',
    distanceMeters: 55,
    isAccessible: true,
    hasStairs: false,
    hasLift: false,
    hasEscalator: false,
    crowdLevel: 'LOW',
    floor: 1,
    name: 'Platform 6 South Gangway'
  }
];

// Helper to get node by ID
export function getNodeById(id: string): StationNode | undefined {
  return STATION_NODES.find((node) => node.id === id);
}

// Get all POIs
export function getStationPOIs(): StationNode[] {
  return STATION_NODES.filter((n) => n.isPOI);
}

// Get nodes by floor
export function getNodesByFloor(floor: FloorLevel): StationNode[] {
  return STATION_NODES.filter((n) => n.floor === floor);
}

// Get edges by floor (or transition)
export function getEdgesByFloor(floor: FloorLevel): StationEdge[] {
  return STATION_EDGES.filter((e) => e.floor === floor || e.floor === 'transition');
}
