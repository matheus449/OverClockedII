import { SectorData } from '../problems/validator';

export interface Vec2 {
  x: number;
  z: number;
}

/**
 * Checks if a 2D point is inside a sector's room bounds.
 */
export function findContainingSector(pos: Vec2, sectors: SectorData[]): SectorData | null {
  for (const s of sectors) {
    const { x, z, w, d } = s.bounds;
    if (pos.x >= x && pos.x <= x + w && pos.z >= z && pos.z <= z + d) {
      return s;
    }
  }
  return null;
}

/**
 * Computes a wall-respecting waypoint trail from the player's current position
 * to the target workstation, routing cleanly through the two wide East-West avenues
 * (North Avenue z = -5.5, South Avenue z = +5.5) and the wide North-South cross avenues
 * (x = -16, -4.75, +4.75, +16) so the player and trail never clip any wall!
 */
export function computeFloorTrail(
  playerPos: Vec2,
  targetSector: SectorData,
  allSectors: SectorData[],
  targetPosOverride?: Vec2
): Vec2[] {
  const destination: Vec2 = targetPosOverride ?? getWorkstationStandPoint(targetSector);

  const currentSector = findContainingSector(playerPos, allSectors);
  const waypoints: Vec2[] = [{ x: playerPos.x, z: playerPos.z }];

  // If already inside the target sector, walk straight to the workstation stand point
  if (currentSector && currentSector.id === targetSector.id) {
    waypoints.push(destination);
    return subdivideTrail(waypoints, 0.85);
  }

  // Step 1: If inside another room, exit through its doorway onto its avenue
  if (currentSector) {
    waypoints.push(getDoorInteriorPoint(currentSector));
    waypoints.push({ x: currentSector.door.x, z: currentSector.door.z });
    waypoints.push(getDoorHallwayApproach(currentSector));
  } else {
    // Player is in an avenue/corridor: snap to nearest main avenue (z = -5.5 or z = +5.5)
    const nearestAveZ = playerPos.z < 0 ? -5.5 : 5.5;
    if (Math.abs(playerPos.z) < 3.6) {
      // Currently in a N-S cross avenue between -3.5 and +3.5: step straight to the target avenue
      const targetAveZ = getHallwayZForDoor(targetSector);
      waypoints.push({ x: playerPos.x, z: targetAveZ });
    } else if (Math.abs(playerPos.z - nearestAveZ) > 0.3) {
      waypoints.push({ x: playerPos.x, z: nearestAveZ });
    }
  }

  // Step 2: Route between North Avenue (z = -5.5) and South Avenue (z = +5.5) if needed
  const targetAveZ = getHallwayZForDoor(targetSector);
  const lastWp = waypoints[waypoints.length - 1];

  if (Math.abs(lastWp.z - targetAveZ) > 0.6) {
    const crossX = pickBestCrossX(lastWp.x, targetSector.door.x);
    waypoints.push({ x: crossX, z: lastWp.z });
    waypoints.push({ x: crossX, z: targetAveZ });
  }

  // Step 3: Travel along target avenue to target door, enter door, and reach workstation
  const doorApproach = getDoorHallwayApproach(targetSector);
  waypoints.push(doorApproach);
  waypoints.push({ x: targetSector.door.x, z: targetSector.door.z });
  waypoints.push(getDoorInteriorPoint(targetSector));
  waypoints.push(destination);

  return subdivideTrail(waypoints, 0.85);
}

function getWorkstationStandPoint(sector: SectorData): Vec2 {
  // Stand in front of the desk (between the door and the desk)
  const { x, z, rotY } = sector.pcPos;
  const offsetZ = Math.abs(rotY) > 1.5 ? -1.25 : 1.25;
  return { x, z: z + offsetZ };
}

function getHallwayZForDoor(sector: SectorData): number {
  // Doors at z = -7.5 or z = -3.5 open onto North Avenue (z = -5.5)
  // Doors at z = +7.5 or z = +3.5 open onto South Avenue (z = +5.5)
  return sector.door.z < 0 ? -5.5 : 5.5;
}

function getDoorHallwayApproach(sector: SectorData): Vec2 {
  const aveZ = getHallwayZForDoor(sector);
  return { x: sector.door.x, z: aveZ };
}

function getDoorInteriorPoint(sector: SectorData): Vec2 {
  const { x, z, orientation } = sector.door;
  if (orientation === 'north') return { x, z: z + 1.1 };
  if (orientation === 'south') return { x, z: z - 1.1 };
  if (orientation === 'east') return { x: x - 1.1, z };
  return { x: x + 1.1, z };
}

function pickBestCrossX(fromX: number, toX: number): number {
  // Wide unobstructed North-South avenues at x = -17.0, -1.85, +12.25, +19.6
  const crossLanes = [-17.0, -1.85, 12.25, 19.6];
  let best = crossLanes[0];
  let bestDist = Infinity;
  for (const lane of crossLanes) {
    const d = Math.abs(fromX - lane) + Math.abs(toX - lane);
    if (d < bestDist) {
      bestDist = d;
      best = lane;
    }
  }
  return best;
}

/**
 * Subdivides a polyline into evenly spaced breadcrumb points for rendering the 3D floor trail.
 */
export function subdivideTrail(points: Vec2[], spacing = 0.85): Vec2[] {
  if (points.length <= 1) return points;
  const result: Vec2[] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.05) continue;

    const steps = Math.max(1, Math.ceil(dist / spacing));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      result.push({
        x: a.x + dx * t,
        z: a.z + dz * t,
      });
    }
  }

  return result;
}
