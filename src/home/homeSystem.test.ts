import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_FURNITURE_SLOTS,
  ALL_HOME_FURNITURE,
  advanceHomeStayTimer,
  calculateHomeComfortScore,
  canReturnToOfficeFromHome,
  equipHomeFurnitureVersion,
  getActiveFurnitureIdForSlot,
  HOME_STAY_DURATION_SECONDS,
  purchaseHomeFurniture,
  resolveHomePlayerMovement,
  resolveNightfallChoice,
  sleepInHomeBed,
} from './homeSystem';

test('catalog contains 12 slots with 3 versions each (36 items) and calibrated prices', () => {
  assert.equal(ALL_FURNITURE_SLOTS.length, 12);
  assert.equal(ALL_HOME_FURNITURE.length, 36);

  for (const slot of ALL_FURNITURE_SLOTS) {
    const versions = ALL_HOME_FURNITURE.filter((item) => item.slotId === slot.slotId);
    assert.equal(versions.length, 3, `Expected 3 versions for slot ${slot.slotId}`);
    assert.deepEqual(
      versions.map((v) => v.versao),
      [1, 2, 3]
    );
    assert.ok(versions[0].preco >= 110, 'V1 should have moderately challenging price');
    assert.ok(versions[1].preco > versions[0].preco, 'V2 price > V1 price');
    assert.ok(versions[2].preco > versions[1].preco, 'V3 price > V2 price');
  }
});

test('resolveNightfallChoice sets 3-min home timer and requires sleeping in bed to restore energy', () => {
  const nightOutcome = resolveNightfallChoice('night_shift', 54, 180, 120);
  assert.equal(nightOutcome.nextLocation, 'office');
  assert.equal(nightOutcome.isNightShift, true);
  assert.equal(nightOutcome.nextEnergy, 54);
  assert.equal(nightOutcome.nextCycleSeconds, 120);

  const homeOutcome = resolveNightfallChoice('go_home', 32, 180, 120);
  assert.equal(homeOutcome.nextLocation, 'home');
  assert.equal(homeOutcome.isNightShift, false);
  // Energy remains 32 until the player walks to the bed and clicks to sleep!
  assert.equal(homeOutcome.nextEnergy, 32);
  assert.equal(homeOutcome.homeStaySeconds, HOME_STAY_DURATION_SECONDS);
  assert.equal(homeOutcome.hasSleptAtHome, false);

  // Cannot return to office before sleeping in bed
  const beforeSleepCheck = canReturnToOfficeFromHome(homeOutcome.hasSleptAtHome);
  assert.equal(beforeSleepCheck.allowed, false);
  assert.ok(beforeSleepCheck.reason);

  // Sleeping in bed restores energy to 100% and unlocks returning to office
  const bedSleep = sleepInHomeBed();
  assert.equal(bedSleep.nextEnergy, 100);
  assert.equal(bedSleep.hasSleptAtHome, true);

  const afterSleepCheck = canReturnToOfficeFromHome(bedSleep.hasSleptAtHome);
  assert.equal(afterSleepCheck.allowed, true);
});

test('advanceHomeStayTimer counts down 3 minutes and checks sleep state at 0', () => {
  const tick1 = advanceHomeStayTimer(180, false);
  assert.equal(tick1.nextRemainingSeconds, 179);
  assert.equal(tick1.shouldAutoReturnToOffice, false);

  const expireUnslept = advanceHomeStayTimer(1, false);
  assert.equal(expireUnslept.nextRemainingSeconds, 0);
  assert.equal(expireUnslept.shouldAutoReturnToOffice, false);
  assert.equal(expireUnslept.shouldPromptMustSleep, true);

  const expireSlept = advanceHomeStayTimer(1, true);
  assert.equal(expireSlept.nextRemainingSeconds, 0);
  assert.equal(expireSlept.shouldAutoReturnToOffice, true);
  assert.equal(expireSlept.shouldPromptMustSleep, false);
});

test('purchaseHomeFurniture & equipHomeFurnitureVersion manage active slot versions', () => {
  const sofaV1 = ALL_HOME_FURNITURE.find((f) => f.id === 'sofa_retratil')!;
  const sofaV2 = ALL_HOME_FURNITURE.find((f) => f.id === 'sofa_retratil_v2')!;

  const res1 = purchaseHomeFurniture({
    furnitureId: sofaV1.id,
    currentPoints: 600,
    purchasedFurnitureIds: [],
  });
  assert.equal(res1.success, true);
  assert.equal(getActiveFurnitureIdForSlot('sofa_sala', res1.nextPurchasedFurnitureIds), sofaV1.id);

  const res2 = purchaseHomeFurniture({
    furnitureId: sofaV2.id,
    currentPoints: res1.nextPoints,
    purchasedFurnitureIds: res1.nextPurchasedFurnitureIds,
  });
  assert.equal(res2.success, true);
  assert.equal(getActiveFurnitureIdForSlot('sofa_sala', res2.nextPurchasedFurnitureIds), sofaV2.id);

  // Equipping V1 again makes V1 the active 3D model
  const reEquipped = equipHomeFurnitureVersion(sofaV1.id, res2.nextPurchasedFurnitureIds);
  assert.equal(getActiveFurnitureIdForSlot('sofa_sala', reEquipped), sofaV1.id);
});

test('resolveHomePlayerMovement enforces collision physics on bed, walls, and purchased furniture', () => {
  // Starter bed is at x: -6.15..-4.65, z: -4.55..-2.45; walking west into the bed from x = -4.2 should stop at collider edge
  const intoBed = resolveHomePlayerMovement({ x: -4.2, z: -3.4 }, { x: -0.6, z: 0 }, []);
  assert.equal(intoBed.x, -4.2);

  // Dining area at (3.5, 1.5) is walkable when mesa_jantar is NOT purchased
  const walkEmptyDining = resolveHomePlayerMovement({ x: 2.6, z: 1.5 }, { x: 0.5, z: 0 }, []);
  assert.ok(walkEmptyDining.x > 3.0, 'Should walk freely when dining table is not installed');

  // Once mesa_jantar_madeira is purchased, walking into (3.1, 1.5) is physically blocked by the table collider
  const walkBlockedDining = resolveHomePlayerMovement(
    { x: 2.6, z: 1.5 },
    { x: 0.5, z: 0 },
    ['mesa_jantar_madeira']
  );
  assert.equal(walkBlockedDining.x, 2.6, 'Dining table collider must block player movement');
});

test('calculateHomeComfortScore computes comfort total and level titles', () => {
  const empty = calculateHomeComfortScore([]);
  assert.equal(empty.ownedCount, 0);
  assert.equal(empty.totalComfort, 0);
  assert.equal(empty.levelTitle, 'Quitinete Inicial');

  const threeItems = calculateHomeComfortScore([
    'tapete_persa_sala',
    'kit_plantas_monstera',
    'cafeteira_barista_casa',
  ]);
  assert.equal(threeItems.ownedCount, 3);
  assert.equal(threeItems.ownedSlotsCount, 3);
  assert.ok(threeItems.totalComfort >= 40);
  assert.equal(threeItems.levelTitle, 'Apartamento Aconchegante');
});
