import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampTapTargetToOfficeBounds,
  computeAnalogStickState,
  computeMovementVector,
  computePinchZoom,
  TouchDirection,
} from './touchControls';

test('computeMovementVector combines WASD keyboard, D-pad, and 360° analog joystick inputs', () => {
  const keys = new Set<string>(['KeyW']);
  const touch = new Set<TouchDirection>(['right']);
  assert.deepEqual(computeMovementVector(keys, touch, { x: 0, z: 0 }), { moveX: 1, moveZ: -1 });

  // Pure 360-degree analog vector (e.g. 30-degree diagonal tilt)
  const analogOnly = computeMovementVector(new Set(), new Set(), { x: 0.5, z: -0.866 });
  assert.equal(analogOnly.moveX, 0.5);
  assert.equal(analogOnly.moveZ, -0.866);
});

test('computeAnalogStickState clamps knob to circle radius and computes 360-degree vector with deadzone', () => {
  // Inside deadzone -> zero movement vector
  const idle = computeAnalogStickState(2, -2, 42, 0.12);
  assert.equal(idle.normX, 0);
  assert.equal(idle.normZ, 0);
  assert.equal(idle.magnitude, 0);

  // Dragged beyond max radius at 45 degrees -> clamped to radius 40, magnitude 1.0
  const diag = computeAnalogStickState(100, -100, 40, 0.12);
  assert.ok(Math.abs(Math.hypot(diag.knobX, diag.knobY) - 40) < 0.05);
  assert.equal(diag.magnitude, 1);
  assert.ok(diag.normX > 0.7 && diag.normZ < -0.7);
});

test('clampTapTargetToOfficeBounds keeps floor taps inside playable office area', () => {
  assert.deepEqual(clampTapTargetToOfficeBounds({ x: 50, z: -40 }), { x: 25.2, z: -16.8 });
  assert.deepEqual(clampTapTargetToOfficeBounds({ x: 4.256, z: -3.104 }), { x: 4.26, z: -3.1 });
});

test('computePinchZoom clamps zoom between 0.75 and 2.2', () => {
  const zoomedIn = computePinchZoom(1.2, 100, 180);
  assert.ok(zoomedIn < 1.2 && zoomedIn >= 0.75);

  const zoomedOutMax = computePinchZoom(2.1, 200, 50);
  assert.equal(zoomedOutMax, 2.2);
});
