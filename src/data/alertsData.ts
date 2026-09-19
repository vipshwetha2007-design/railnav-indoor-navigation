import { StationAlert } from '../types/navigation';

export const INITIAL_STATION_ALERTS: StationAlert[] = [
  {
    id: 'alert_plat_change',
    title: 'Platform Change Notice: Express 12345',
    description: 'Express 12345 to Northern Gateway Terminus will now depart from Platform 6 (previously Platform 3). Please use the overpass or Lift 1.',
    severity: 'urgent',
    timestamp: '2 mins ago',
    affectedArea: 'Platform 6',
    isPlatformChange: true,
    trainNumber: '12345',
    newPlatform: 6,
  },
  {
    id: 'alert_crowd_footbridge',
    title: 'Heavy Passenger Traffic near Staircase A',
    description: 'High commuter congestion on Staircase A and Main Footbridge. Enable "Avoid Crowds" for alternative step-free or south route.',
    severity: 'warning',
    timestamp: '5 mins ago',
    affectedArea: 'Staircase A / Footbridge',
    affectedEdgeId: 'e_vert_stairs_a',
  },
  {
    id: 'alert_corridor_b',
    title: 'Corridor B Maintenance Advisory',
    description: 'Routine floor scrubbing scheduled on Corridor B. Accessible ramp corridor remains fully open and clear.',
    severity: 'info',
    timestamp: '15 mins ago',
    affectedArea: 'Corridor B (Central)',
    affectedEdgeId: 'e_concourse_corridor_b',
  },
  {
    id: 'alert_lift_service',
    title: 'Lift 1 Priority Accessibility Active',
    description: 'Passenger Lift 1 (North) is fully operational for step-free access to Platforms 4, 5, and 6.',
    severity: 'info',
    timestamp: '30 mins ago',
    affectedArea: 'Lift 1 (North)',
  }
];
