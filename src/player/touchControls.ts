import { Vec2 } from '../pathfinding/trail';

export type TouchDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Shared zero-latency Set of currently held virtual D-Pad directions.
 * Mutated directly by touch/pointer events so the 60fps Three.js loop
 * reads held directions without triggering React re-renders.
 */
const activeTouchDirections = new Set<TouchDirection>();
let touchInteractCallback: (() => void) | null = null;

export function getActiveTouchDirections(): ReadonlySet<TouchDirection> {
  return activeTouchDirections;
}

export function setTouchDirectionHeld(dir: TouchDirection, held: boolean): void {
  if (held) {
    activeTouchDirections.add(dir);
  } else {
    activeTouchDirections.delete(dir);
  }
}

export function clearAllTouchDirections(): void {
  activeTouchDirections.clear();
}

export function registerTouchInteractHandler(cb: (() => void) | null): void {
  touchInteractCallback = cb;
}

export function triggerTouchInteract(): void {
  if (touchInteractCallback) {
    touchInteractCallback();
  }
}

/**
 * Combines keyboard (WASD / Arrow keys) and mobile virtual D-Pad touch directions
 * into a unified movement intent vector on the XZ plane.
 */
export function computeMovementVector(
  keysHeld: ReadonlySet<string>,
  touchDirs: ReadonlySet<TouchDirection>
): { moveX: number; moveZ: number } {
  let moveX = 0;
  let moveZ = 0;

  if (keysHeld.has('KeyW') || keysHeld.has('ArrowUp') || touchDirs.has('up')) {
    moveZ -= 1;
  }
  if (keysHeld.has('KeyS') || keysHeld.has('ArrowDown') || touchDirs.has('down')) {
    moveZ += 1;
  }
  if (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft') || touchDirs.has('left')) {
    moveX -= 1;
  }
  if (keysHeld.has('KeyD') || keysHeld.has('ArrowRight') || touchDirs.has('right')) {
    moveX += 1;
  }

  return { moveX, moveZ };
}

/**
 * Clamps a 3D floor raycast tap coordinate to the playable office interior bounds
 * so tap-to-walk on mobile and desktop never targets outside the building walls.
 */
export function clampTapTargetToOfficeBounds(point: Vec2): Vec2 {
  const clampedX = Math.max(-25.2, Math.min(25.2, Number(point.x.toFixed(2))));
  const clampedZ = Math.max(-16.8, Math.min(16.8, Number(point.z.toFixed(2))));
  return { x: clampedX, z: clampedZ };
}

/**
 * Computes the next camera zoom level from a two-finger pinch gesture on mobile.
 * Spreading fingers apart (nextDist > prevDist) zooms in (smaller zoom factor);
 * pinching fingers together zooms out (larger zoom factor, up to full map 2.2).
 */
export function computePinchZoom(
  currentZoom: number,
  prevDistancePx: number,
  nextDistancePx: number
): number {
  if (prevDistancePx <= 8 || nextDistancePx <= 8) {
    return currentZoom;
  }
  const deltaPx = prevDistancePx - nextDistancePx;
  const rawNext = currentZoom + deltaPx * 0.0045;
  return Math.max(0.75, Math.min(2.2, Number(rawNext.toFixed(2))));
}
