import { StationNode, StationEdge, FloorLevel } from '../types/navigation';

export interface UserPosition {
  x: number;
  y: number;
  floor: FloorLevel;
  currentNodeId: string;
  heading: number; // 0..360 degrees
  segmentIndex: number;
  progressOnSegment: number; // 0 to 1
  remainingDistanceMeters: number;
  remainingSeconds: number;
  isSimulated: boolean;
  status: 'idle' | 'walking' | 'paused' | 'arrived';
}

export type PositionSubscriber = (position: UserPosition) => void;

export interface PositionProvider {
  getCurrentPosition(): UserPosition;
  subscribe(callback: PositionSubscriber): () => void;
  startWalking(routeNodes: StationNode[], totalDistanceMeters: number): void;
  pauseWalking(): void;
  resumeWalking(): void;
  stepNext(): void;
  reset(nodeId?: string): void;
  simulateOffRoute(offRouteNode: StationNode): void;
  destroy(): void;
}

/**
 * SimulatorPositionProvider
 * Implements transparent Demo Indoor Positioning along the calculated graph path.
 */
export class SimulatorPositionProvider implements PositionProvider {
  private subscribers: Set<PositionSubscriber> = new Set();
  private routeNodes: StationNode[] = [];
  private totalDistance: number = 0;
  private currentPosition: UserPosition;
  private animationTimer: number | null = null;
  private junctionTimer: number | null = null;
  private speedFactor: number = 1.0; // 1x, 2x
  private readonly departurePauseDurationMs: number = 3200;
  private readonly junctionPauseDurationMs: number = 2800;

  private segmentDistances: number[] = [];
  private remainingDistances: number[] = [];

  constructor(initialNode: StationNode) {
    this.currentPosition = {
      x: initialNode.x,
      y: initialNode.y,
      floor: initialNode.floor,
      currentNodeId: initialNode.id,
      heading: 270, // Facing North (into the station concourse)
      segmentIndex: 0,
      progressOnSegment: 0,
      remainingDistanceMeters: 0,
      remainingSeconds: 0,
      isSimulated: true,
      status: 'idle',
    };
  }

  public getCurrentPosition(): UserPosition {
    return { ...this.currentPosition };
  }

  public subscribe(callback: PositionSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.getCurrentPosition());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private emit(): void {
    const pos = this.getCurrentPosition();
    this.subscribers.forEach((cb) => cb(pos));
  }

  public setSpeedFactor(factor: number): void {
    this.speedFactor = Math.max(0.25, Math.min(4.0, factor));
  }

  public getSpeedFactor(): number {
    return this.speedFactor;
  }

  public startWalking(routeNodes: StationNode[], totalDistanceMeters: number, routeEdges?: StationEdge[]): void {
    if (routeNodes.length < 2) return;
    this.stopLoop();
    this.routeNodes = routeNodes;
    this.totalDistance = totalDistanceMeters;
    
    this.segmentDistances = new Array(routeNodes.length - 1).fill(25);
    this.remainingDistances = new Array(routeNodes.length).fill(0);
    
    let cumulative = 0;
    for (let i = routeNodes.length - 2; i >= 0; i--) {
      const edgeDist = routeEdges?.[i]?.distanceMeters || 25;
      this.segmentDistances[i] = edgeDist;
      cumulative += edgeDist;
      this.remainingDistances[i] = cumulative;
    }

    const startNode = routeNodes[0];
    const nextNode = routeNodes[1];
    const initialHeading = this.calcHeading(startNode, nextNode);

    this.currentPosition = {
      x: startNode.x,
      y: startNode.y,
      floor: startNode.floor,
      currentNodeId: startNode.id,
      heading: initialHeading,
      segmentIndex: 0,
      progressOnSegment: 0,
      remainingDistanceMeters: this.remainingDistances[0],
      remainingSeconds: Math.round(this.remainingDistances[0] / 1.2),
      isSimulated: true,
      status: 'walking',
    };

    this.emit();

    // Initial Departure Pause: allows the passenger to absorb the initial departure
    // announcement while standing at the origin before walking along the corridor
    const startDelay = Math.max(1200, Math.round(this.departurePauseDurationMs / this.speedFactor));
    this.junctionTimer = window.setTimeout(() => {
      this.junctionTimer = null;
      if (this.currentPosition.status === 'walking') {
        this.startCorridorWalk();
      }
    }, startDelay);
  }

  public pauseWalking(): void {
    if (this.currentPosition.status === 'walking') {
      this.stopLoop();
      this.currentPosition.status = 'paused';
      this.emit();
    }
  }

  public resumeWalking(): void {
    if (this.currentPosition.status === 'paused') {
      this.currentPosition.status = 'walking';
      this.emit();
      this.startCorridorWalk();
    }
  }

  public stepNext(): void {
    if (this.routeNodes.length < 2) return;
    this.stopLoop();
    let { segmentIndex } = this.currentPosition;
    if (segmentIndex < this.routeNodes.length - 1) {
      segmentIndex++;
      this.advanceToSegment(segmentIndex);
      if (this.currentPosition.status === 'walking') {
        const pauseMs = Math.max(1000, Math.round(this.junctionPauseDurationMs / this.speedFactor));
        this.junctionTimer = window.setTimeout(() => {
          this.junctionTimer = null;
          if (this.currentPosition.status === 'walking') {
            this.startCorridorWalk();
          }
        }, pauseMs);
      }
    }
  }

  public reset(nodeId?: string, fallbackNode?: StationNode): void {
    this.stopLoop();
    const node = fallbackNode || this.routeNodes[0];
    if (!node) return;

    this.currentPosition = {
      x: node.x,
      y: node.y,
      floor: node.floor,
      currentNodeId: node.id,
      heading: 270, // Facing North
      segmentIndex: 0,
      progressOnSegment: 0,
      remainingDistanceMeters: 0,
      remainingSeconds: 0,
      isSimulated: true,
      status: 'idle',
    };
    this.emit();
  }

  public simulateOffRoute(offRouteNode: StationNode): void {
    this.stopLoop();
    this.currentPosition = {
      x: offRouteNode.x,
      y: offRouteNode.y,
      floor: offRouteNode.floor,
      currentNodeId: offRouteNode.id,
      heading: (this.currentPosition.heading + 90) % 360,
      segmentIndex: 0,
      progressOnSegment: 0,
      remainingDistanceMeters: 0,
      remainingSeconds: 0,
      isSimulated: true,
      status: 'idle',
    };
    this.emit();
  }

  private startCorridorWalk(): void {
    this.stopLoop();
    const tickInterval = 100; // 100ms
    // ~5.5s per corridor segment at 1.0x speed for clear spatial orientation
    const stepIncrement = 0.018 * this.speedFactor;

    this.animationTimer = window.setInterval(() => {
      let { segmentIndex, progressOnSegment } = this.currentPosition;

      if (segmentIndex >= this.routeNodes.length - 1) {
        this.advanceToSegment(segmentIndex);
        return;
      }

      progressOnSegment += stepIncrement;

      // When the passenger reaches the end of the current corridor segment
      if (progressOnSegment >= 1) {
        segmentIndex++;
        progressOnSegment = 0;

        // If arrived at the final destination
        if (segmentIndex >= this.routeNodes.length - 1) {
          this.advanceToSegment(segmentIndex);
          return;
        }

        // Passenger has reached the waypoint/junction node
        const currNode = this.routeNodes[segmentIndex];
        const nextNode = this.routeNodes[segmentIndex + 1];
        const heading = this.calcHeading(currNode, nextNode);

        const remainingMeters = Math.max(0, Math.round(this.remainingDistances[segmentIndex]));
        const remainingSecs = Math.max(0, Math.round(remainingMeters / 1.2));

        // Place avatar precisely at the junction node facing the new direction
        this.currentPosition = {
          x: currNode.x,
          y: currNode.y,
          floor: currNode.floor,
          currentNodeId: currNode.id,
          heading,
          segmentIndex,
          progressOnSegment: 0,
          remainingDistanceMeters: remainingMeters,
          remainingSeconds: remainingSecs,
          isSimulated: true,
          status: 'walking',
        };

        // Halt movement during the junction turn announcement so voice and avatar coincide
        this.stopLoop();
        this.emit();

        // Junction Turn Pause: avatar stays at the turn while voice completes its instruction
        const pauseMs = Math.max(1000, Math.round(this.junctionPauseDurationMs / this.speedFactor));
        this.junctionTimer = window.setTimeout(() => {
          this.junctionTimer = null;
          if (this.currentPosition.status === 'walking') {
            this.startCorridorWalk();
          }
        }, pauseMs);

        return;
      }

      const currNode = this.routeNodes[segmentIndex];
      const nextNode = this.routeNodes[segmentIndex + 1];

      // Interpolate smooth movement along the current corridor
      const interpX = currNode.x + (nextNode.x - currNode.x) * progressOnSegment;
      const interpY = currNode.y + (nextNode.y - currNode.y) * progressOnSegment;
      const heading = this.calcHeading(currNode, nextNode);

      const remainingMeters = Math.max(0, Math.round(this.remainingDistances[segmentIndex] - progressOnSegment * this.segmentDistances[segmentIndex]));
      const remainingSecs = Math.max(0, Math.round(remainingMeters / 1.2));

      this.currentPosition = {
        x: Math.round(interpX),
        y: Math.round(interpY),
        floor: progressOnSegment > 0.5 ? nextNode.floor : currNode.floor,
        currentNodeId: progressOnSegment > 0.5 ? nextNode.id : currNode.id,
        heading,
        segmentIndex,
        progressOnSegment,
        remainingDistanceMeters: remainingMeters,
        remainingSeconds: remainingSecs,
        isSimulated: true,
        status: 'walking',
      };

      this.emit();
    }, tickInterval);
  }

  private advanceToSegment(segIndex: number): void {
    this.stopLoop();
    if (segIndex >= this.routeNodes.length - 1) {
      const finalNode = this.routeNodes[this.routeNodes.length - 1];
      this.currentPosition = {
        x: finalNode.x,
        y: finalNode.y,
        floor: finalNode.floor,
        currentNodeId: finalNode.id,
        heading: this.currentPosition.heading,
        segmentIndex: segIndex,
        progressOnSegment: 1,
        remainingDistanceMeters: 0,
        remainingSeconds: 0,
        isSimulated: true,
        status: 'arrived',
      };
      this.emit();
      return;
    }

    const currNode = this.routeNodes[segIndex];
    const nextNode = this.routeNodes[segIndex + 1];
    const heading = this.calcHeading(currNode, nextNode);

    const remainingMeters = Math.max(0, Math.round(this.remainingDistances[segIndex]));

    this.currentPosition = {
      x: currNode.x,
      y: currNode.y,
      floor: currNode.floor,
      currentNodeId: currNode.id,
      heading,
      segmentIndex: segIndex,
      progressOnSegment: 0,
      remainingDistanceMeters: remainingMeters,
      remainingSeconds: Math.round(remainingMeters / 1.2),
      isSimulated: true,
      status: this.currentPosition.status,
    };
    this.emit();
  }

  private stopLoop(): void {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    if (this.junctionTimer !== null) {
      clearTimeout(this.junctionTimer);
      this.junctionTimer = null;
    }
  }

  private calcHeading(from: { x: number; y: number }, to: { x: number; y: number }): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.round(angle);
  }

  public destroy(): void {
    this.stopLoop();
    this.subscribers.clear();
  }
}
