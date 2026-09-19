import { StationNode, StationEdge, RouteInstruction, ManeuverType, FloorLevel } from '../types/navigation';

// Compute heading in degrees (0 = East, 90 = South, 180 = West, 270 = North in SVG coordinates)
export function calculateHeading(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return Math.round(angle);
}

// Compute turn angle difference between vector A and vector B (-180 to +180)
export function getAngleDiff(heading1: number, heading2: number): number {
  let diff = heading2 - heading1;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

export function generateInstructions(
  nodes: StationNode[],
  edges: StationEdge[],
  initialHeading?: number
): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];

  if (nodes.length === 0) return instructions;

  if (nodes.length === 1) {
    instructions.push({
      id: 'inst_0',
      maneuver: 'destination',
      primaryText: `You are at ${nodes[0].name}`,
      distanceMeters: 0,
      floor: nodes[0].floor,
      targetNodeId: nodes[0].id,
      iconName: 'CheckCircle',
      announcement: `You are at ${nodes[0].name}.`,
    });
    return instructions;
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    const edge = edges[i];
    const isFirst = i === 0;
    const segmentDist = edge ? edge.distanceMeters : 25;

    // Check for floor transition
    if (curr.floor !== next.floor) {
      const targetFloorName = next.floor === 1 ? 'Level 1 Overpass' : 'Level 0 Concourse';
      if (edge?.hasLift || curr.type === 'lift' || next.type === 'lift') {
        instructions.push({
          id: `inst_${i}`,
          maneuver: 'take_lift',
          primaryText: `Take the lift to ${targetFloorName}`,
          secondaryText: `Elevator ride to Level ${next.floor}`,
          distanceMeters: segmentDist,
          floor: curr.floor,
          targetNodeId: next.id,
          iconName: 'ArrowUpDown',
          announcement: `Take the lift to ${targetFloorName}.`,
        });
      } else if (edge?.hasStairs || curr.type === 'stairs' || next.type === 'stairs') {
        instructions.push({
          id: `inst_${i}`,
          maneuver: 'take_stairs',
          primaryText: `Take the stairs to ${targetFloorName}`,
          secondaryText: `Staircase to Level ${next.floor}`,
          distanceMeters: segmentDist,
          floor: curr.floor,
          targetNodeId: next.id,
          iconName: 'Footprints',
          announcement: `Take the stairs up to ${targetFloorName}.`,
        });
      } else if (edge?.hasEscalator || curr.type === 'escalator' || next.type === 'escalator') {
        instructions.push({
          id: `inst_${i}`,
          maneuver: 'take_escalator',
          primaryText: `Take escalator to ${targetFloorName}`,
          secondaryText: `Moving escalator to Level ${next.floor}`,
          distanceMeters: segmentDist,
          floor: curr.floor,
          targetNodeId: next.id,
          iconName: 'ChevronsUp',
          announcement: `Take the escalator up to ${targetFloorName}.`,
        });
      } else {
        instructions.push({
          id: `inst_${i}`,
          maneuver: 'floor_transition',
          primaryText: `Proceed to ${targetFloorName}`,
          secondaryText: `Transition to Level ${next.floor}`,
          distanceMeters: segmentDist,
          floor: curr.floor,
          targetNodeId: next.id,
          iconName: 'ArrowUp',
          announcement: `Proceed to ${targetFloorName}.`,
        });
      }
      continue;
    }

    // Horizontal movement maneuver determination
    let maneuver: ManeuverType = 'straight';
    let iconName = 'ArrowUp';
    let maneuverText = 'Continue straight';

    if (isFirst) {
      const currHeading = calculateHeading(curr, next);
      if (initialHeading !== undefined) {
        const diff = getAngleDiff(initialHeading, currHeading);
        if (diff > 45 && diff <= 135) {
          maneuver = 'turn_right';
          iconName = 'CornerUpRight';
          maneuverText = `Turn right toward ${next.shortName || next.name}`;
        } else if (diff < -45 && diff >= -135) {
          maneuver = 'turn_left';
          iconName = 'CornerUpLeft';
          maneuverText = `Turn left toward ${next.shortName || next.name}`;
        } else {
          maneuver = 'straight';
          iconName = 'ArrowUp';
          maneuverText = `Head straight toward ${next.shortName || next.name}`;
        }
      } else {
        maneuver = 'straight';
        iconName = 'ArrowUp';
        maneuverText = `Head straight toward ${next.shortName || next.name}`;
      }
    } else {
      const prev = nodes[i - 1];
      const prevHeading = calculateHeading(prev, curr);
      const currHeading = calculateHeading(curr, next);
      const diff = getAngleDiff(prevHeading, currHeading);

      if (Math.abs(diff) <= 30) {
        maneuver = 'straight';
        iconName = 'ArrowUp';
        maneuverText = `Continue straight toward ${next.shortName || next.name}`;
      } else if (diff > 30 && diff <= 110) {
        maneuver = 'turn_right';
        iconName = 'CornerUpRight';
        maneuverText = `Turn right at ${curr.shortName || curr.name} toward ${next.shortName || next.name}`;
      } else if (diff > 110) {
        maneuver = 'sharp_right';
        iconName = 'CornerRightDown';
        maneuverText = `Make a sharp right at ${curr.shortName || curr.name} toward ${next.shortName || next.name}`;
      } else if (diff < -30 && diff >= -110) {
        maneuver = 'turn_left';
        iconName = 'CornerUpLeft';
        maneuverText = `Turn left at ${curr.shortName || curr.name} toward ${next.shortName || next.name}`;
      } else {
        maneuver = 'sharp_left';
        iconName = 'CornerLeftDown';
        maneuverText = `Make a sharp left at ${curr.shortName || curr.name} toward ${next.shortName || next.name}`;
      }
    }

    instructions.push({
      id: `inst_${i}`,
      maneuver,
      primaryText: maneuverText,
      secondaryText: next.description || `Follow corridor for ${segmentDist}m`,
      distanceMeters: segmentDist,
      floor: curr.floor,
      targetNodeId: next.id,
      iconName,
      announcement: `${maneuverText}, continue for ${segmentDist} metres.`,
    });
  }

  // Final destination instruction
  const destinationNode = nodes[nodes.length - 1];
  instructions.push({
    id: `inst_final`,
    maneuver: 'destination',
    primaryText: `Arrive at ${destinationNode.name}`,
    secondaryText: destinationNode.shortName ? `${destinationNode.shortName} reached` : 'Destination reached',
    distanceMeters: 0,
    floor: destinationNode.floor,
    targetNodeId: destinationNode.id,
    iconName: 'CheckCircle',
    announcement: `You have arrived at ${destinationNode.name}. Your journey is complete.`,
  });

  return instructions;
}

/**
 * Computes live, location-aware navigation guidance and upcoming prompts
 * based on WHERE the user currently is along the route.
 */
export interface LiveGuidanceState {
  stage: 'departure' | 'along_corridor' | 'approaching_turn' | 'at_junction' | 'arrived';
  maneuver: ManeuverType;
  primaryText: string;
  secondaryText: string;
  distanceDisplay: string;
  distanceNumberMeters: number;
  spokenCommand: string;
  isUpcomingWarning: boolean;
}

export function computeLiveGuidance(
  route: { instructions: RouteInstruction[]; nodes: StationNode[]; edges: StationEdge[] },
  segmentIndex: number,
  progressOnSegment: number,
  status: string
): LiveGuidanceState {
  const totalInstructions = route.instructions.length;
  const currentInst = route.instructions[segmentIndex] || route.instructions[0];
  const nextInst = route.instructions[segmentIndex + 1];

  if (status === 'arrived' || segmentIndex >= totalInstructions - 1) {
    const finalInst = route.instructions[totalInstructions - 1] || currentInst;
    return {
      stage: 'arrived',
      maneuver: 'destination',
      primaryText: finalInst.primaryText,
      secondaryText: finalInst.secondaryText || 'Destination reached',
      distanceDisplay: 'Arrived',
      distanceNumberMeters: 0,
      spokenCommand: finalInst.announcement,
      isUpcomingWarning: false,
    };
  }

  const edge = route.edges[segmentIndex];
  const segDist = edge ? edge.distanceMeters : currentInst.distanceMeters || 25;
  const remainingInSeg = Math.max(0, Math.round(segDist * (1 - progressOnSegment)));

  const currNode = route.nodes[segmentIndex];
  const nextNode = route.nodes[segmentIndex + 1];

  // 1. AT JUNCTION: exactly when avatar starts the segment (progress is 0)
  // We are physically at `currNode` making the turn `currentInst`.
  if (progressOnSegment === 0 || progressOnSegment > 0.98) {
    // If progress > 0.98, we are arriving at the NEXT junction, so use nextInst
    // Wait, if progress > 0.98, positionProvider will snap it to 1.0, which advances segmentIndex to next and progress to 0.
    // So progress === 0 is the true junction state for the NEW segment.
    const instToUse = progressOnSegment > 0.98 && nextInst ? nextInst : currentInst;
    return {
      stage: progressOnSegment === 0 && segmentIndex === 0 ? 'departure' : 'at_junction',
      maneuver: instToUse.maneuver,
      primaryText: instToUse.primaryText,
      secondaryText: instToUse.secondaryText || `Follow path toward ${nextNode?.shortName || nextNode?.name}`,
      distanceDisplay: 'Now',
      distanceNumberMeters: 0,
      spokenCommand: instToUse.announcement,
      isUpcomingWarning: false,
    };
  }

  // 2. APPROACHING TURN
  const hasUpcomingTurn =
    nextInst &&
    nextInst.maneuver !== 'straight' &&
    nextInst.maneuver !== 'destination' &&
    segmentIndex < totalInstructions - 2;

  if (hasUpcomingTurn && remainingInSeg <= 12 && progressOnSegment >= 0.55) {
    return {
      stage: 'approaching_turn',
      maneuver: nextInst.maneuver,
      primaryText: `In ${remainingInSeg} m, ${nextInst.primaryText.toLowerCase()}`,
      secondaryText: `Prepare for turn at ${nextNode?.shortName || nextNode?.name}`,
      distanceDisplay: `${remainingInSeg} m`,
      distanceNumberMeters: remainingInSeg,
      spokenCommand: `In ${remainingInSeg} metres, prepare to ${nextInst.primaryText.toLowerCase()}.`,
      isUpcomingWarning: true,
    };
  }

  // 3. ALONG CORRIDOR
  // While walking, the arrow should point straight unless taking a vertical transit
  const isVertical = currentInst.maneuver === 'take_lift' || currentInst.maneuver === 'take_stairs' || currentInst.maneuver === 'take_escalator' || currentInst.maneuver === 'floor_transition';
  
  const activeManeuver = isVertical ? currentInst.maneuver : 'straight';
  const activePrimaryText = isVertical ? currentInst.primaryText : `Continue straight toward ${nextNode?.shortName || nextNode?.name}`;

  return {
    stage: 'along_corridor',
    maneuver: activeManeuver,
    primaryText: activePrimaryText,
    secondaryText: currentInst.secondaryText || `Follow path toward ${nextNode?.shortName || nextNode?.name}`,
    distanceDisplay: `${remainingInSeg} m`,
    distanceNumberMeters: remainingInSeg,
    spokenCommand: currentInst.announcement, // This was already spoken at the junction, but kept for state consistency
    isUpcomingWarning: false,
  };
}
