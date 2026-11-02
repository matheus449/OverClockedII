import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampTapTargetToOfficeBounds,
  computeMovementVector,
  computePinchZoom,
  TouchDirection,
} from './touchControls';

test('computeMovementVector combines WASD keyboard and mobile touch D-pad inputs', () => {
  const noInput = computeMovementVector(new Set(), new Set());
  assert.deepEqual(noInput, { moveX: 0, moveZ: 0 });

  const touchUpRight = computeMovementVector(
    new Set(),
    new Set<TouchDirection>(['up', 'right'])
  );
  assert.deepEqual(touchUpRight, { moveX: 1, moveZ: -1 });

  const keyLeftTouchDown = computeMovementVector(
    new Set(['KeyA']),
    new Set<TouchDirection>(['down'])
  );
  assert.deepEqual(keyLeftTouchDown, { moveX: -1, moveZ: 1 });
});

test('clampTapTargetToOfficeBounds keeps floor taps inside playable office area', () => {
  const inside = clampTapTargetToOfficeBounds({ x: 5.25, z: 0.4 });
  assert.deepEqual(inside, { x: 5.25, z: 0.4 });

  const outside = clampTapTargetToOfficeBounds({ x: -45, z: 30 });
  assert.deepEqual(outside, { x: -25.2, z: 16.8 });
});

test('computePinchZoom clamps zoom between 0.75 and 2.2', () => {
  // Pinching fingers together (distance decreases) zooms out (increases factor)
  const zoomedOut = computePinchZoom(1.0, 200, 100);
  assert.equal(zoomedOut > 1.0, true);

  // Spreading fingers apart (distance increases) zooms in (decreases factor)
  const zoomedIn = computePinchZoom(1.2, 100, 200);
  assert.equal(zoomedIn < 1.2, true);

  // Clamping boundaries
  assert.equal(computePinchZoom(2.15, 200, 50), 2.2);
  assert.equal(computePinchZoom(0.8, 50, 250), 0.75);
});
