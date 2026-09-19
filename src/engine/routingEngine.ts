import {
  StationNode,
  StationEdge,
  CalculatedRoute,
  CrowdLevel,
  FloorLevel
} from '../types/navigation';
import { STATION_NODES, STATION_EDGES, getNodeById } from '../data/stationData';
import { generateInstructions } from './instructionEngine';

export interface RoutingOptions {
  accessibilityMode?: boolean; // Avoid stairs, prioritize lifts and ramps
  avoidCrowds?: boolean;       // Penalize crowded corridors
  closedEdgeIds?: string[];    // IDs of edges temporarily closed
  walkingSpeed?: number;       // In meters/sec (default 1.2 m/s)
  initialHeading?: number;     // Starting heading in degrees
}

interface AdjacencyEdge {
  edge: StationEdge;
  neighborId: string;
}

// Build bidirectional graph representation
export class StationGraph {
  private adjacencyList: Map<string, AdjacencyEdge[]> = new Map();
  private nodesMap: Map<string, StationNode> = new Map();

  constructor(nodes: StationNode[], edges: StationEdge[]) {
    nodes.forEach((node) => {
      this.nodesMap.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    });

    edges.forEach((edge) => {
      // Forward direction
      if (this.adjacencyList.has(edge.from)) {
        this.adjacencyList.get(edge.from)!.push({
          edge,
          neighborId: edge.to,
        });
      }
      // Reverse direction (walkways and stairs are bidirectional; escalators can be traversed)
      if (this.adjacencyList.has(edge.to)) {
        this.adjacencyList.get(edge.to)!.push({
          edge,
          neighborId: edge.from,
        });
      }
    });
  }

  public getNode(id: string): StationNode | undefined {
    return this.nodesMap.get(id);
  }

  public getNeighbors(id: string): AdjacencyEdge[] {
    return this.adjacencyList.get(id) || [];
  }
}

// Calculate effective traversal cost for an edge
export function calculateEdgeCost(edge: StationEdge, options: RoutingOptions): number {
  const { accessibilityMode = false, avoidCrowds = false, closedEdgeIds = [] } = options;

  // 1. Closure check: If edge is marked closed or in closedEdgeIds, return Infinity
  if (edge.isClosed || closedEdgeIds.includes(edge.id)) {
    return Infinity;
  }

  // 2. Accessibility check
  if (accessibilityMode) {
    // If user has mobility needs, stairs are strictly forbidden
    if (edge.hasStairs || !edge.isAccessible) {
      return Infinity;
    }
    // Escalators without stairs can be dangerous for wheelchairs
    if (edge.hasEscalator && !edge.isAccessible) {
      return Infinity;
    }
  }

  let cost = edge.distanceMeters;

  // 3. Accessibility incentive for lifts when in accessible mode
  if (accessibilityMode && edge.hasLift) {
    // Encourage lift use
    cost = Math.min(cost, 10);
  }

  // 4. Crowd penalty
  if (avoidCrowds) {
    if (edge.crowdLevel === 'HIGH') {
      // Heavy penalty so 300m high-crowd becomes cost ~660m, losing to a 350m low-crowd alternative
      cost *= 2.2;
    } else if (edge.crowdLevel === 'MEDIUM') {
      cost *= 1.35;
    }
  } else {
    // Slight realistic drag even when avoidCrowds is off
    if (edge.crowdLevel === 'HIGH') cost *= 1.15;
    if (edge.crowdLevel === 'MEDIUM') cost *= 1.05;
  }

  // Small penalty for stairs if not in accessible mode (people prefer flat/escalator unless shorter)
  if (edge.hasStairs && !accessibilityMode) {
    cost += 10;
  }

  return cost;
}

// Euclidean heuristic for A* in meters (normalized ~0.5m per coordinate unit)
function heuristic(nodeA: StationNode, nodeB: StationNode): number {
  const dx = (nodeA.x - nodeB.x) * 0.5;
  const dy = (nodeA.y - nodeB.y) * 0.5;
  const planarDist = Math.sqrt(dx * dx + dy * dy);

  // Floor transition penalty
  const floorDiff = Math.abs(nodeA.floor - nodeB.floor);
  return planarDist + floorDiff * 25;
}

/**
 * A* Pathfinding Algorithm on the Indoor Station Graph
 */
export function calculateRoute(
  startNodeId: string,
  targetNodeId: string,
  options: RoutingOptions = {},
  customNodes: StationNode[] = STATION_NODES,
  customEdges: StationEdge[] = STATION_EDGES
): CalculatedRoute | null {
  if (startNodeId === targetNodeId) {
    const startNode = customNodes.find((n) => n.id === startNodeId);
    if (!startNode) return null;
    return {
      pathNodeIds: [startNodeId],
      edges: [],
      nodes: [startNode],
      totalDistanceMeters: 0,
      totalTimeSeconds: 0,
      instructions: [
        {
          id: 'inst_arrived',
          maneuver: 'destination',
          primaryText: `You have arrived at ${startNode.name}`,
          distanceMeters: 0,
          floor: startNode.floor,
          targetNodeId: startNode.id,
          iconName: 'CheckCircle',
          announcement: `You are at ${startNode.name}.`,
        },
      ],
      floorsInvolved: [startNode.floor],
      hasStairs: false,
      hasLift: false,
      averageCrowd: 'LOW',
      isAccessible: true,
    };
  }

  const graph = new StationGraph(customNodes, customEdges);
  const startNode = graph.getNode(startNodeId);
  const targetNode = graph.getNode(targetNodeId);

  if (!startNode || !targetNode) {
    return null;
  }

  // A* open set, gScore, fScore
  const openSet = new Set<string>([startNodeId]);
  const cameFromNode = new Map<string, string>();
  const cameFromEdge = new Map<string, StationEdge>();

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  customNodes.forEach((n) => {
    gScore.set(n.id, Infinity);
    fScore.set(n.id, Infinity);
  });

  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(startNode, targetNode));

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let currentId = '';
    let lowestF = Infinity;
    openSet.forEach((nodeId) => {
      const f = fScore.get(nodeId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentId = nodeId;
      }
    });

    if (currentId === targetNodeId) {
      // Reconstruct path
      return reconstructPath(currentId, cameFromNode, cameFromEdge, options, graph);
    }

    openSet.delete(currentId);
    const currentNode = graph.getNode(currentId)!;
    const currentG = gScore.get(currentId) ?? Infinity;

    const neighbors = graph.getNeighbors(currentId);
    for (const { edge, neighborId } of neighbors) {
      const neighborNode = graph.getNode(neighborId);
      if (!neighborNode) continue;

      const edgeCost = calculateEdgeCost(edge, options);
      if (edgeCost === Infinity) continue; // Closed or inaccessible

      const tentativeG = currentG + edgeCost;
      const neighborG = gScore.get(neighborId) ?? Infinity;

      if (tentativeG < neighborG) {
        cameFromNode.set(neighborId, currentId);
        cameFromEdge.set(neighborId, edge);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, tentativeG + heuristic(neighborNode, targetNode));
        openSet.add(neighborId);
      }
    }
  }

  // No valid path found
  return null;
}

// Reconstruct path from cameFrom maps
function reconstructPath(
  endNodeId: string,
  cameFromNode: Map<string, string>,
  cameFromEdge: Map<string, StationEdge>,
  options: RoutingOptions,
  graph: StationGraph
): CalculatedRoute {
  const pathNodeIds: string[] = [endNodeId];
  const edges: StationEdge[] = [];

  let curr = endNodeId;
  while (cameFromNode.has(curr)) {
    const prev = cameFromNode.get(curr)!;
    const edge = cameFromEdge.get(curr)!;
    edges.unshift(edge);
    pathNodeIds.unshift(prev);
    curr = prev;
  }

  const nodes: StationNode[] = pathNodeIds.map((id) => graph.getNode(id)!);

  let totalDistanceMeters = 0;
  let hasStairs = false;
  let hasLift = false;
  let highCrowdCount = 0;
  let medCrowdCount = 0;

  edges.forEach((edge) => {
    totalDistanceMeters += edge.distanceMeters;
    if (edge.hasStairs) hasStairs = true;
    if (edge.hasLift) hasLift = true;
    if (edge.crowdLevel === 'HIGH') highCrowdCount++;
    if (edge.crowdLevel === 'MEDIUM') medCrowdCount++;
  });

  const speed = options.walkingSpeed || 1.2; // 1.2 m/s
  // Lift or stairs add transit time
  const verticalDelaySeconds = (hasLift ? 25 : 0) + (hasStairs ? 15 : 0);
  const totalTimeSeconds = Math.round(totalDistanceMeters / speed + verticalDelaySeconds);

  const floorsInvolved = Array.from(new Set(nodes.map((n) => n.floor))) as FloorLevel[];

  let averageCrowd: CrowdLevel = 'LOW';
  if (edges.length > 0) {
    if (highCrowdCount / edges.length > 0.3) {
      averageCrowd = 'HIGH';
    } else if (medCrowdCount / edges.length > 0.35 || highCrowdCount > 0) {
      averageCrowd = 'MEDIUM';
    }
  }

  const instructions = generateInstructions(nodes, edges, options.initialHeading);

  return {
    pathNodeIds,
    edges,
    nodes,
    totalDistanceMeters,
    totalTimeSeconds,
    instructions,
    floorsInvolved,
    hasStairs,
    hasLift,
    averageCrowd,
    isAccessible: !hasStairs && (options.accessibilityMode ? true : true),
  };
}
