import { NpcData, ProblemData, SectorBounds, SectorData } from '../problems/validator';
import { Vec2 } from '../pathfinding/trail';
import {
  CAFETERIA_SPACE,
  isPlayerInsideCafeteria,
  isPlayerNearCafeteriaCounter,
} from '../cafeteria/cafeteriaSystem';

export interface WallSegment {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const DOOR_HALF_WIDTH = 1.55;
const PLAYER_RADIUS = 0.34;

/**
 * Returns true only when the player is physically inside a sector's room boundaries (not outside in the corridor or behind a wall).
 */
export function isPlayerInsideRoom(
  pos: Vec2,
  bounds: SectorBounds,
  inset = 0.15
): boolean {
  return (
    pos.x >= bounds.x + inset &&
    pos.x <= bounds.x + bounds.w - inset &&
    pos.z >= bounds.z + inset &&
    pos.z <= bounds.z + bounds.d - inset
  );
}

/**
 * Returns true only when the player is physically inside the Cafeteria AND right in front of the Espresso Bar Counter.
 * Standing outside/next to the Cafeteria wall or far from the counter returns false.
 */
export function isPlayerNearCafeteria(pos: Vec2): boolean {
  return isPlayerInsideCafeteria(pos) && isPlayerNearCafeteriaCounter(pos);
}

/**
 * Generates all wall segments and desk obstacle boxes from the 15 sectors + the Cafeteria OverCoffee space,
 * leaving generous 3.1m doorway openings so the player can walk effortlessly in and out of every room.
 */
export function buildWorldColliders(sectors: SectorData[]): {
  walls: WallSegment[];
  boxes: ObstacleBox[];
} {
  const walls: WallSegment[] = [];
  const boxes: ObstacleBox[] = [];

  // Outer building perimeter (-26.5 to 26.5 in X, -18.0 to 18.0 in Z)
  walls.push(
    { x1: -26.5, z1: -18.0, x2: 26.5, z2: -18.0 },
    { x1: -26.5, z1: 18.0, x2: 26.5, z2: 18.0 },
    { x1: -26.5, z1: -18.0, x2: -26.5, z2: 18.0 },
    { x1: 26.5, z1: -18.0, x2: 26.5, z2: 18.0 }
  );

  const allRooms = [...sectors, CAFETERIA_SPACE];

  for (const s of allRooms) {
    const { x, z, w, d } = s.bounds;
    const xMin = x;
    const xMax = x + w;
    const zMin = z;
    const zMax = z + d;

    // North edge (z = zMin)
    if (s.door.orientation === 'north') {
      const dLeft = s.door.x - DOOR_HALF_WIDTH;
      const dRight = s.door.x + DOOR_HALF_WIDTH;
      if (dLeft > xMin) walls.push({ x1: xMin, z1: zMin, x2: dLeft, z2: zMin });
      if (dRight < xMax) walls.push({ x1: dRight, z1: zMin, x2: xMax, z2: zMin });
    } else {
      walls.push({ x1: xMin, z1: zMin, x2: xMax, z2: zMin });
    }

    // South edge (z = zMax)
    if (s.door.orientation === 'south') {
      const dLeft = s.door.x - DOOR_HALF_WIDTH;
      const dRight = s.door.x + DOOR_HALF_WIDTH;
      if (dLeft > xMin) walls.push({ x1: xMin, z1: zMax, x2: dLeft, z2: zMax });
      if (dRight < xMax) walls.push({ x1: dRight, z1: zMax, x2: xMax, z2: zMax });
    } else {
      walls.push({ x1: xMin, z1: zMax, x2: xMax, z2: zMax });
    }

    // West edge (x = xMin)
    if (s.door.orientation === 'west') {
      const dTop = s.door.z - DOOR_HALF_WIDTH;
      const dBot = s.door.z + DOOR_HALF_WIDTH;
      if (dTop > zMin) walls.push({ x1: xMin, z1: zMin, x2: xMin, z2: dTop });
      if (dBot < zMax) walls.push({ x1: xMin, z1: dBot, x2: xMin, z2: zMax });
    } else {
      walls.push({ x1: xMin, z1: zMin, x2: xMin, z2: zMax });
    }

    // East edge (x = xMax)
    if (s.door.orientation === 'east') {
      const dTop = s.door.z - DOOR_HALF_WIDTH;
      const dBot = s.door.z + DOOR_HALF_WIDTH;
      if (dTop > zMin) walls.push({ x1: xMax, z1: zMin, x2: xMax, z2: dTop });
      if (dBot < zMax) walls.push({ x1: xMax, z1: dBot, x2: xMax, z2: zMax });
    } else {
      walls.push({ x1: xMax, z1: zMin, x2: xMax, z2: zMax });
    }

    if (s.id === 'cafeteria') {
      // Main Espresso Bar Counter & Back Prep Bar (center-north of the 11.5m room)
      boxes.push(
        { minX: 3.15, maxX: 7.35, minZ: -3.55, maxZ: -1.1 },
        // Commercial Beverage Fridges (North-East corner)
        { minX: 8.65, maxX: 10.65, minZ: -3.5, maxZ: -2.35 },
        // Water Dispenser & Coffee Roasting Station (North-West corner)
        { minX: -0.25, maxX: 1.55, minZ: -3.5, maxZ: -2.35 },
        // Bistro Table 1 (West-North)
        { minX: 0.25, maxX: 1.25, minZ: -0.85, maxZ: 0.15 },
        // Bistro Table 2 (West-South)
        { minX: 0.25, maxX: 1.25, minZ: 1.25, maxZ: 2.25 },
        // Bistro Table 3 (East-North)
        { minX: 9.25, maxX: 10.25, minZ: -0.85, maxZ: 0.15 },
        // Caramel Leather Lounge Sofa Booth & Coffee Table (East-South)
        { minX: 9.25, maxX: 10.75, minZ: 1.15, maxZ: 2.95 }
      );
    } else {
      // Standard Sector Desk collider
      boxes.push({
        minX: s.pcPos.x - 0.8,
        maxX: s.pcPos.x + 0.8,
        minZ: s.pcPos.z - 0.42,
        maxZ: s.pcPos.z + 0.42,
      });
    }
  }

  return { walls, boxes };
}

function collidesAt(pos: Vec2, walls: WallSegment[], boxes: ObstacleBox[]): boolean {
  for (const b of boxes) {
    if (
      pos.x + PLAYER_RADIUS > b.minX &&
      pos.x - PLAYER_RADIUS < b.maxX &&
      pos.z + PLAYER_RADIUS > b.minZ &&
      pos.z - PLAYER_RADIUS < b.maxZ
    ) {
      return true;
    }
  }

  for (const w of walls) {
    const dist = distancePointToSegment(pos.x, pos.z, w.x1, w.z1, w.x2, w.z2);
    if (dist < PLAYER_RADIUS) {
      return true;
    }
  }

  return false;
}

function distancePointToSegment(
  px: number,
  pz: number,
  x1: number,
  z1: number,
  x2: number,
  z2: number
): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return Math.hypot(px - x1, pz - z1);
  let t = ((px - x1) * dx + (pz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return Math.hypot(px - projX, pz - projZ);
}

/**
 * Resolves player movement with independent X and Z axis sliding against walls and furniture.
 */
export function resolvePlayerMovement(
  currentPos: Vec2,
  delta: Vec2,
  colliders: { walls: WallSegment[]; boxes: ObstacleBox[] }
): Vec2 {
  const nextPos = { x: currentPos.x, z: currentPos.z };

  const candidateX = { x: currentPos.x + delta.x, z: currentPos.z };
  if (!collidesAt(candidateX, colliders.walls, colliders.boxes)) {
    nextPos.x = candidateX.x;
  }

  const candidateZ = { x: nextPos.x, z: currentPos.z + delta.z };
  if (!collidesAt(candidateZ, colliders.walls, colliders.boxes)) {
    nextPos.z = candidateZ.z;
  }

  return nextPos;
}

export interface NearbyInteraction {
  sector: SectorData;
  npc: NpcData;
  distance: number;
  isTicketTarget: boolean;
}

/**
 * Finds the closest NPC/Workstation within interaction range (3.2m) ONLY when the player
 * is physically inside that sector's room (never through walls or from the corridor outside).
 */
export function findNearestInteractable(
  playerPos: Vec2,
  sectors: SectorData[],
  npcs: NpcData[],
  activeProblem: ProblemData | null,
  liveNpcPositions?: Record<string, Vec2>
): NearbyInteraction | null {
  let closest: NearbyInteraction | null = null;
  let minDist = 3.2;

  for (const sector of sectors) {
    // Player MUST be physically inside the sector room to interact or perform actions
    if (!isPlayerInsideRoom(playerPos, sector.bounds)) continue;

    const npc = npcs.find((n) => n.setor === sector.id);
    if (!npc) continue;

    const npcPos = liveNpcPositions?.[npc.id] ?? {
      x: npc.waypoints[0].x,
      z: npc.waypoints[0].z,
    };

    const distToPc = Math.hypot(playerPos.x - sector.pcPos.x, playerPos.z - sector.pcPos.z);
    const distToNpc = Math.hypot(playerPos.x - npcPos.x, playerPos.z - npcPos.z);
    const dist = Math.min(distToPc, distToNpc);

    if (dist < minDist) {
      minDist = dist;
      closest = {
        sector,
        npc,
        distance: dist,
        isTicketTarget: activeProblem ? activeProblem.setor === sector.id : false,
      };
    }
  }

  return closest;
}
