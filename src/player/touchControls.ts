import { Vec2 } from '../pathfinding/trail';

export type TouchDirection = 'up' | 'down' | 'left' | 'right';
export type InputControlMode = 'keyboard_mouse' | 'touch';

export interface AnalogStickResult {
  /** Clamped visual knob offset in pixels from center */
  knobX: number;
  knobY: number;
  /** Normalized 360-degree movement vector (-1..1) with magnitude <= 1 */
  normX: number;
  normZ: number;
  /** Current tilt magnitude (0..1) */
  magnitude: number;
  /** Angle in degrees (-180..180) for optional UI feedback */
  angleDeg: number;
}

/**
 * Pure helper that determines whether the mandatory Landscape Lock overlay
 * must be displayed. On any mobile phone or tablet (independent of whether
 * the player selected Keyboard/Mouse or Touch), portrait orientation
 * (height > width) is blocked until the device is rotated to landscape.
 */
export function shouldEnforceLandscapeLock(
  viewportWidth: number,
  viewportHeight: number,
  isMobileOrTabletDevice: boolean
): boolean {
  if (viewportWidth <= 0 || viewportHeight <= 0) return false;
  const isPortrait = viewportHeight > viewportWidth;
  if (!isPortrait) return false;
  const isMobileOrTabletViewport = viewportWidth <= 1024;
  return isMobileOrTabletDevice || isMobileOrTabletViewport;
}

/**
 * Detects whether the current client device is a smartphone or tablet.
 */
export function detectMobileOrTabletClient(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent || '';
  const uaMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
    ua
  );
  const isIPadOS =
    navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  const coarsePointer =
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const shortestSide = Math.min(window.innerWidth || 9999, window.innerHeight || 9999);
  return uaMobileOrTablet || isIPadOS || (coarsePointer && shortestSide <= 1024);
}

/**
 * Returns the most accurate current viewport width and height on mobile browsers,
 * accounting for visualViewport and screen.orientation changes.
 */
export function getEffectiveViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }
  const vv = window.visualViewport;
  let w = vv && vv.width > 0 ? vv.width : window.innerWidth;
  let h = vv && vv.height > 0 ? vv.height : window.innerHeight;

  // Some mobile browsers fire orientationchange and update screen.orientation.type
  // a few frames before window.innerWidth / innerHeight swap.
  const screenOrientationType = (
    window.screen as Screen & { orientation?: { type?: string } }
  )?.orientation?.type;
  if (
    typeof screenOrientationType === 'string' &&
    screenOrientationType.startsWith('landscape') &&
    h > w
  ) {
    const tmp = w;
    w = h;
    h = tmp;
  }
  return { width: w, height: h };
}

/**
 * Attempts to enter Fullscreen and lock screen orientation to landscape on
 * supported mobile/tablet browsers. Returns true if the screen is now in landscape,
 * or false if the browser/iframe restricts programmatic orientation lock.
 */
export async function requestLandscapeOrientationLock(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    if (detectMobileOrTabletClient() && !document.fullscreenElement) {
      if (typeof docEl.requestFullscreen === 'function') {
        await docEl.requestFullscreen().catch(() => {});
      } else if (typeof docEl.webkitRequestFullscreen === 'function') {
        await docEl.webkitRequestFullscreen().catch(() => {});
      }
    }
  } catch {
    // Ignore fullscreen errors
  }

  let locked = false;
  try {
    const orientationApi = (window.screen as Screen & {
      orientation?: { lock?: (orientation: string) => Promise<void> };
    })?.orientation;
    if (orientationApi && typeof orientationApi.lock === 'function') {
      await orientationApi.lock('landscape').then(() => {
        locked = true;
      }).catch(() => {});
    }
  } catch {
    // Ignore orientation lock restriction errors
  }

  const { width, height } = getEffectiveViewportSize();
  return locked || width >= height;
}


/**
 * Shared zero-latency state for mobile touch controls (360° analog joystick + directions).
 * Mutated directly by touch/pointer events so the 60fps Three.js loop
 * reads the analog vector without triggering React re-renders.
 */
const activeTouchDirections = new Set<TouchDirection>();
const analogJoystickVector = { x: 0, z: 0 };
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

export function setAnalogJoystickVector(x: number, z: number): void {
  analogJoystickVector.x = x;
  analogJoystickVector.z = z;
}

export function getAnalogJoystickVector(): Readonly<{ x: number; z: number }> {
  return analogJoystickVector;
}

export function clearAllTouchDirections(): void {
  activeTouchDirections.clear();
  analogJoystickVector.x = 0;
  analogJoystickVector.z = 0;
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
 * Pure helper that converts a pointer offset (deltaX, deltaY in px) relative to
 * the circular joystick center into a clamped visual knob position and a smooth
 * 360-degree normalized movement vector with radial deadzone.
 */
export function computeAnalogStickState(
  deltaX: number,
  deltaY: number,
  maxRadiusPx: number,
  deadzoneRatio = 0.12
): AnalogStickResult {
  const safeRadius = Math.max(10, maxRadiusPx);
  const rawDist = Math.hypot(deltaX, deltaY);

  if (rawDist < 0.0001) {
    return { knobX: 0, knobY: 0, normX: 0, normZ: 0, magnitude: 0, angleDeg: 0 };
  }

  const clampedDist = Math.min(rawDist, safeRadius);
  const unitX = deltaX / rawDist;
  const unitY = deltaY / rawDist;

  const knobX = unitX * clampedDist;
  const knobY = unitY * clampedDist;

  const rawRatio = clampedDist / safeRadius;
  if (rawRatio <= deadzoneRatio) {
    return {
      knobX: Number(knobX.toFixed(2)),
      knobY: Number(knobY.toFixed(2)),
      normX: 0,
      normZ: 0,
      magnitude: 0,
      angleDeg: 0,
    };
  }

  // Smoothly rescale [deadzoneRatio..1] -> [0..1]
  const effectiveMag = Math.min(1, (rawRatio - deadzoneRatio) / (1 - deadzoneRatio));
  const normX = unitX * effectiveMag;
  const normZ = unitY * effectiveMag;
  const angleDeg = (Math.atan2(unitY, unitX) * 180) / Math.PI;

  return {
    knobX: Number(knobX.toFixed(2)),
    knobY: Number(knobY.toFixed(2)),
    normX: Number(normX.toFixed(4)),
    normZ: Number(normZ.toFixed(4)),
    magnitude: Number(effectiveMag.toFixed(4)),
    angleDeg: Number(angleDeg.toFixed(1)),
  };
}

/**
 * Combines keyboard (WASD / Arrow keys), directional inputs, and the 360° mobile
 * analog thumbstick vector into a unified movement intent vector on the XZ plane.
 */
export function computeMovementVector(
  keysHeld: ReadonlySet<string>,
  touchDirs: ReadonlySet<TouchDirection>,
  analogVec: Readonly<{ x: number; z: number }> = analogJoystickVector
): { moveX: number; moveZ: number } {
  let moveX = analogVec.x;
  let moveZ = analogVec.z;

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
