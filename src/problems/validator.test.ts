import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_PROBLEMS,
  ALL_SECTORS,
  ALL_NPCS,
  getProblemsPool,
  pickNextProblem,
  createInitialWorkstationState,
  applyDiagnosticAction,
  checkProblemResolved,
  DiagnosticAction,
} from './validator';
import { computeFloorTrail } from '../pathfinding/trail';
import { buildWorldColliders, resolvePlayerMovement } from '../player/collision';

test('dataset has 64+ distinct didactic problems across all 15 sectors and 4 categories', () => {
  assert.ok(ALL_PROBLEMS.length >= 64, `Expected >= 64 problems, found ${ALL_PROBLEMS.length}`);
  assert.equal(ALL_SECTORS.length, 15, 'Expected 15 office sectors');
  assert.equal(ALL_NPCS.length, 15, 'Expected 15 sector NPCs');

  const ids = new Set<string>();
  const categories = new Set<string>();
  const sectorIds = new Set(ALL_SECTORS.map((s) => s.id));

  for (const p of ALL_PROBLEMS) {
    assert.ok(!ids.has(p.id), `Duplicate problem id: ${p.id}`);
    ids.add(p.id);
    categories.add(p.categoria);
    assert.ok(sectorIds.has(p.setor), `Problem ${p.id} references unknown sector ${p.setor}`);
    assert.ok(p.etapas.length >= 1, `Problem ${p.id} must have etapas`);
    assert.ok(p.acoesRequeridas.length >= 1, `Problem ${p.id} must have acoesRequeridas`);
    assert.ok(p.falaNpc.length > 5, `Problem ${p.id} must have NPC speech`);
    assert.ok(p.feedbackEducativo.length > 10, `Problem ${p.id} must have educational feedback`);
  }

  assert.ok(categories.has('Hardware'));
  assert.ok(categories.has('Software'));
  assert.ok(categories.has('Redes'));
  assert.ok(categories.has('Pegadinha'));
});

test('difficulty pool filtering and non-repeating distributor work properly', () => {
  const facilPool = getProblemsPool('facil');
  const normalPool = getProblemsPool('normal');
  const dificilPool = getProblemsPool('dificil');

  assert.ok(facilPool.length >= 15);
  assert.ok(normalPool.length > facilPool.length);
  assert.ok(dificilPool.length >= 25);

  const first = pickNextProblem('normal', null, [], 0);
  const second = pickNextProblem('normal', first.id, [first.id], 0);
  assert.notEqual(first.id, second.id, 'Distributor must not repeat the same problem in sequence');
});

test('every single one of the 64 problems is 100% solvable via applyDiagnosticAction', () => {
  for (const problem of ALL_PROBLEMS) {
    let state = createInitialWorkstationState(problem);
    assert.equal(
      checkProblemResolved(state, problem),
      false,
      `Problem ${problem.id} should not start already resolved`
    );

    const actionsToRun: DiagnosticAction[] = [...problem.acoesRequeridas];
    if (
      (actionsToRun.includes('limpar_ventoinha') || actionsToRun.includes('reencaixar_ram')) &&
      !actionsToRun.includes('abrir_gabinete')
    ) {
      actionsToRun.unshift('abrir_gabinete');
    }

    for (const action of actionsToRun) {
      const res = applyDiagnosticAction(state, problem, action);
      assert.equal(
        res.success,
        true,
        `Problem ${problem.id} failed on required action ${action}: ${res.message}`
      );
      state = res.nextState;
    }

    assert.equal(
      checkProblemResolved(state, problem),
      true,
      `Problem ${problem.id} should be resolved after completing all required actions`
    );
  }
});

test('player can physically walk from spawn into all 15 sectors without wall or furniture blockage', () => {
  const spawn = { x: 0, z: 5.5 };
  const colliders = buildWorldColliders(ALL_SECTORS);

  for (const sector of ALL_SECTORS) {
    const trail = computeFloorTrail(spawn, sector, ALL_SECTORS);
    assert.ok(trail.length >= 3, `Trail to sector ${sector.id} must have >= 3 points`);

    // Physically walk the player step-by-step using resolvePlayerMovement along the trail
    let pos = { ...spawn };
    for (let i = 1; i < trail.length; i++) {
      const target = trail[i];
      for (let step = 0; step < 30; step++) {
        const dx = target.x - pos.x;
        const dz = target.z - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.05) break;
        const moveLen = Math.min(dist, 0.18);
        pos = resolvePlayerMovement(
          pos,
          { x: (dx / dist) * moveLen, z: (dz / dist) * moveLen },
          colliders
        );
      }
    }

    const finalGoal = trail[trail.length - 1];
    const remainingDist = Math.hypot(pos.x - finalGoal.x, pos.z - finalGoal.z);
    assert.ok(
      remainingDist < 0.35,
      `Player got blocked walking to sector ${sector.id}: remainingDist=${remainingDist.toFixed(2)} at (${pos.x.toFixed(2)}, ${pos.z.toFixed(2)})`
    );
  }
});

import {
  ALL_ACCESSORIES,
  ALL_MEDALS,
  ALL_OUTFITS,
  applyErrorPenalty,
  calculateTicketReward,
  computeNextTicketDelaySeconds,
  getMaxSimultaneousTickets,
  isGameCompleted,
} from '../progression/progressionSystem';
import {
  getKokoroVoiceForNpc,
  isFemaleNpc,
  splitIntoSpeechChunks,
} from '../audio/voiceNarrator';
import { phonemizePortugueseSentence } from '../audio/ptBrPhonemizer';

test('progression points, medals, 16 outfits, 21 accessories, negative error penalties, and Rush Hour pacing work properly', () => {
  assert.equal(ALL_OUTFITS.length, 16, 'Expected 16 varied outfits');
  assert.equal(ALL_ACCESSORIES.length, 21, 'Expected 21 varied 3D accessories');
  assert.equal(ALL_MEDALS.length, 8, 'Expected 8 career medals');

  // Verify error penalty allows going negative ("ficar devendo pontos")
  const errPenalty = applyErrorPenalty(0, 'normal');
  assert.equal(errPenalty.penalty, 40);
  assert.equal(errPenalty.nextPoints, -40, 'Player at 0 points should owe -40 points on error');

  // Verify full wardrobe is locked until game completion
  assert.equal(isGameCompleted(0, 0, []), false);
  assert.equal(isGameCompleted(1500, 15, []), true);

  // Verify points & medals on first Rush Hour Hardware solve
  const reward = calculateTicketReward({
    difficulty: 'dificil',
    categoria: 'Hardware',
    errorCount: 0,
    isRushHour: true,
    currentPoints: 0,
    resolvedCountAfter: 1,
    unlockedMedals: [],
  });

  assert.equal(reward.basePoints, 260);
  assert.equal(reward.cleanBonus, 40);
  assert.equal(reward.rushHourBonus, 75);
  assert.ok(reward.newlyUnlockedMedals.some((m) => m.id === 'primeiro_chamado'));
  assert.ok(reward.newlyUnlockedMedals.some((m) => m.id === 'especialista_hardware'));
  assert.ok(reward.newlyUnlockedMedals.some((m) => m.id === 'heroi_pico'));
  assert.ok(reward.totalEarned > 375);

  // Verify pacing intervals and Rush Hour ticket queue limits
  assert.equal(getMaxSimultaneousTickets('facil', false), 1);
  assert.equal(getMaxSimultaneousTickets('normal', false), 2);
  assert.equal(getMaxSimultaneousTickets('dificil', true), 4);

  const facilDelay = computeNextTicketDelaySeconds('facil', false);
  const rushDelay = computeNextTicketDelaySeconds('dificil', true);
  assert.ok(facilDelay >= 14 && facilDelay <= 21);
  assert.ok(rushDelay >= 6 && rushDelay <= 10);

  // Verify female vs male NPC detection and Kokoro voice mapping ('pf_dora' vs 'pm_alex') for all characters
  assert.equal(isFemaleNpc('npc_mariana', 'Mariana Costa'), true);
  assert.equal(isFemaleNpc('npc_carlos', 'Carlos Eduardo'), false);
  assert.equal(getKokoroVoiceForNpc('npc_marketing', 'Beatriz Alencar'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_recepcao', 'Clara Mendes'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_financeiro', 'Helena Vasconcelos'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_rh', 'Marina Costa'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_redes', 'Camila Rocha'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_reunioes', 'Patrícia Duarte'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_convivencia', 'Juliana Moreira'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('cafe_npc_sonia', 'Sônia Abrantes'), 'pf_dora');
  assert.equal(getKokoroVoiceForNpc('npc_administrativo', 'Roberto Prado'), 'pm_alex');
  assert.equal(getKokoroVoiceForNpc('npc_comercial', 'Lucas Nogueira'), 'pm_alex');
  assert.equal(getKokoroVoiceForNpc('npc_desenvolvimento', 'Rafael Akira'), 'pm_alex');
  assert.equal(getKokoroVoiceForNpc('npc_laboratorio', 'Dr. Henrique Silveira'), 'pm_alex');
  assert.equal(getKokoroVoiceForNpc('cafe_npc_leo', 'Léo Batista'), 'pm_alex');
  assert.equal(getKokoroVoiceForNpc('cafe_npc_thiago', 'Thiago Moura'), 'pm_alex');

  // Verify Brazilian Portuguese IPA phonemizer preserves nasal vowels (e\u0303, o\u0303, ɐ\u0303)
  const ipaSample = phonemizePortugueseSentence('Helena Vasconcelos, gerente da empresa e computador.');
  assert.ok(ipaSample.includes('elˈe\u0303nɐ'), `Expected elˈẽnɐ in IPA: ${ipaSample}`);
  assert.ok(ipaSample.includes('ko\u0303putadˈoʁ'), `Expected kõputadˈoʁ in IPA: ${ipaSample}`);

  // Verify clause-level speech chunking splits long sentences for fast Web Worker streaming
  const chunks = splitIntoSpeechChunks(
    'Graças a Deus que você está aqui, Analista! Cada acerto soma pontos para liberar roupas e acessórios, mas cuidado com os erros para não ficar devendo pontos!'
  );
  assert.ok(chunks.length >= 3, `Expected at least 3 chunks, got ${chunks.length}`);
});

import {
  ALL_COFFEES,
  CAFETERIA_NPCS,
  CAFETERIA_SPACE,
  applyErrorEnergyDrain,
  applyTicketEnergyDrain,
  findNearestCafeteriaNpc,
  getCoffeeDynamicPrice,
  pickRandomCafeteriaChat,
  purchaseAndDrinkCoffee,
} from '../cafeteria/cafeteriaSystem';
import {
  DEFAULT_PURCHASED_OUTFITS,
  getDynamicAccessoryPrice,
  getDynamicOutfitPrice,
  purchaseOutfitWithPoints,
} from '../progression/progressionSystem';
import {
  BACKGROUND_AUDIO_SRC,
  FEMALE_YAWN_AUDIO_SRC,
  MALE_YAWN_AUDIO_SRC,
  getYawnAudioSrcForGender,
} from '../audio/soundEngine';
import { isPlayerNearCafeteria } from '../player/collision';

test('Cafeteria OverCoffee space is physically walkable, drains/restores energy with paid coffee types, scales prices with points & difficulty, and detects in-room NPCs', () => {
  assert.equal(ALL_COFFEES.length, 5, 'Expected 5 coffee options');
  assert.equal(CAFETERIA_NPCS.length, 4, 'Expected 4 Cafeteria NPCs');
  assert.ok(CAFETERIA_SPACE.bounds.w >= 11.0, 'Cafeteria room should be enlarged (>= 11m wide)');

  // Verify energy drain ONLY on ticket completion (and not on diagnostic error)
  const nextEnergyAfterTicket = applyTicketEnergyDrain(100, 'normal');
  assert.equal(nextEnergyAfterTicket, 88);
  assert.equal(applyErrorEnergyDrain(80), 80, 'Energy should not drain on diagnostic error');

  // Verify no coffees are free and buying with 0 points fails
  assert.ok(
    ALL_COFFEES.every((c) => c.custoPontos > 0 && getCoffeeDynamicPrice(c, 'normal', 0, 0) > 0),
    'All coffees must cost points (no free coffees)'
  );
  const firstCoffee = ALL_COFFEES[0];
  const zeroPointsRes = purchaseAndDrinkCoffee(50, 0, firstCoffee);
  assert.equal(zeroPointsRes.success, false, 'Should not be able to get coffee with 0 points');

  const paidFirstRes = purchaseAndDrinkCoffee(50, 100, firstCoffee);
  assert.equal(paidFirstRes.success, true);
  assert.equal(paidFirstRes.nextEnergy, 85);
  assert.equal(paidFirstRes.nextPoints, 100 - firstCoffee.custoPontos);

  // Verify paid coffee deducts points and restores energy
  const cappuccino = ALL_COFFEES[2];
  const capRes = purchaseAndDrinkCoffee(20, 100, cappuccino);
  assert.equal(capRes.success, true);
  assert.equal(capRes.nextPoints, 100 - cappuccino.custoPontos);
  assert.equal(capRes.nextEnergy, 95);

  // Verify coffee prices are more expensive on Hard mode ('dificil') and scale with user's points
  const capEasy = getCoffeeDynamicPrice(cappuccino, 'facil', 0, 0);
  const capNormal = getCoffeeDynamicPrice(cappuccino, 'normal', 0, 0);
  const capHard = getCoffeeDynamicPrice(cappuccino, 'dificil', 0, 0);
  const capHardHighPoints = getCoffeeDynamicPrice(cappuccino, 'dificil', 750, 4);
  assert.ok(capNormal > capEasy, 'Normal coffee price should exceed Easy');
  assert.ok(capHard > capNormal, 'Hard mode coffee price must be more expensive than Normal');
  assert.ok(
    capHardHighPoints > capHard,
    'Coffee price must scale up alongside the user point earnings and resolved tickets'
  );

  // Verify accessory and outfit prices also scale with user point earnings and difficulty
  const sampleAcc = ALL_ACCESSORIES[2];
  const accBase = getDynamicAccessoryPrice(sampleAcc, 'facil', 0, 0);
  const accNormal = getDynamicAccessoryPrice(sampleAcc, 'normal', 400, 2);
  const accHard = getDynamicAccessoryPrice(sampleAcc, 'dificil', 800, 5);
  assert.ok(accNormal > accBase && accHard > accNormal, 'Accessory prices must scale with earnings');

  const sampleOutfit = ALL_OUTFITS[3];
  const outfitBase = getDynamicOutfitPrice(sampleOutfit, 'facil', 0, 0);
  const outfitScaled = getDynamicOutfitPrice(sampleOutfit, 'dificil', 700, 4);
  assert.ok(outfitScaled > outfitBase, 'Outfit prices must scale with earnings');

  // Verify outfits cost user points as currency when purchased
  const hoodie = ALL_OUTFITS[1];
  assert.ok(hoodie.pontosNecessarios > 0, 'Casual hoodie should cost points');
  const buyOutfitRes = purchaseOutfitWithPoints({
    outfit: hoodie,
    currentPoints: 200,
    purchasedOutfitIds: DEFAULT_PURCHASED_OUTFITS,
    difficulty: 'facil',
    resolvedCount: 0,
  });
  assert.equal(buyOutfitRes.success, true);
  assert.equal(buyOutfitRes.nextPoints, 200 - hoodie.pontosNecessarios);
  assert.ok(buyOutfitRes.nextPurchasedOutfitIds.includes(hoodie.id));

  // Verify gender yawn audio and background audio paths
  assert.equal(BACKGROUND_AUDIO_SRC, '/assets/aistudio/background_17bc5615.mp3');
  assert.equal(getYawnAudioSrcForGender('masculino'), MALE_YAWN_AUDIO_SRC);
  assert.equal(getYawnAudioSrcForGender('feminino'), FEMALE_YAWN_AUDIO_SRC);

  // Verify in-world 3D Cafeteria NPC proximity detection and random small-talk lines
  for (const npc of CAFETERIA_NPCS) {
    const nearCheck = findNearestCafeteriaNpc({ x: npc.pos.x, z: npc.pos.z + 0.5 });
    assert.ok(nearCheck && nearCheck.npc.id === npc.id, `Should detect ${npc.nome} in 3D Cafeteria`);
    const line1 = pickRandomCafeteriaChat(npc);
    assert.ok(line1.length > 10);
    const line2 = pickRandomCafeteriaChat(npc, line1);
    assert.notEqual(line1, line2, 'Should pick a different random line when chatting again');
  }

  // Verify player can physically walk from spawn (0, 5.5) into the Cafeteria OverCoffee (5.25, 0.2)
  const spawn = { x: 0, z: 5.5 };
  const colliders = buildWorldColliders(ALL_SECTORS);
  const trail = computeFloorTrail(spawn, CAFETERIA_SPACE, [...ALL_SECTORS, CAFETERIA_SPACE], {
    x: 5.25,
    z: 0.2,
  });
  let pos = { ...spawn };
  for (let i = 1; i < trail.length; i++) {
    const target = trail[i];
    for (let step = 0; step < 30; step++) {
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.05) break;
      const moveLen = Math.min(dist, 0.18);
      pos = resolvePlayerMovement(
        pos,
        { x: (dx / dist) * moveLen, z: (dz / dist) * moveLen },
        colliders
      );
    }
  }
  assert.equal(
    isPlayerNearCafeteria(pos),
    true,
    `Player should be inside/near Cafeteria OverCoffee at (${pos.x.toFixed(2)}, ${pos.z.toFixed(2)})`
  );
});

import {
  buildVoicePreloadManifest,
  splitVoiceManifestForFastStart,
} from '../ui/LoadingVoiceOverlay';
import {
  applySleepOnJobPenalty,
  calculateActionStepEnergyDrain,
  getCheapestCoffeePrice,
  isCompanyBankrupt,
  isLowEnergyWarning,
  shouldTriggerLowEnergyAlert,
} from '../cafeteria/cafeteriaSystem';
import {
  buildResetCareerState,
  DEFAULT_PURCHASED_ACCESSORIES,
} from '../progression/progressionSystem';

test('buildVoicePreloadManifest and splitVoiceManifestForFastStart split 1 immediate startup clause from background items', () => {
  const firstProb = ALL_PROBLEMS[0];
  const shiftManifest = buildVoicePreloadManifest('Matheus', 'normal', firstProb, [firstProb], false);
  const fullManifest = buildVoicePreloadManifest('Matheus', 'normal', firstProb, [firstProb], true);

  assert.equal(shiftManifest[0].id, 'helena_intro');
  assert.ok(shiftManifest[0].text.includes('Matheus'));
  assert.ok(shiftManifest.some((item) => item.id === `${firstProb.id}_fala`));
  assert.ok(shiftManifest.some((item) => item.id === 'sector_ok_female'));
  assert.ok(shiftManifest.some((item) => item.id === 'sector_ok_male'));
  assert.ok(fullManifest.length > shiftManifest.length, 'Full manifest should include all 64 problem conversations');
  assert.ok(fullManifest.length >= 135, `Expected >= 135 unique voice items in full manifest, got ${fullManifest.length}`);

  const { immediateItems, backgroundItems } = splitVoiceManifestForFastStart(shiftManifest);
  assert.equal(immediateItems.length, 1, 'Immediate startup pack should only have 1 short item for rapid entry');
  assert.ok(immediateItems[0].text.length < 95, 'Immediate startup chunk should be a single short sentence');
  assert.ok(backgroundItems.length >= shiftManifest.length, 'Remaining clauses and items must be queued for background download');
});

test('20% low energy warning and 0% sleep-on-the-job penalty recover 10% energy properly across difficulties', () => {
  assert.equal(isLowEnergyWarning(25), false);
  assert.equal(isLowEnergyWarning(20), true);
  assert.equal(isLowEnergyWarning(10), true);
  assert.equal(isLowEnergyWarning(0), false);

  assert.equal(shouldTriggerLowEnergyAlert(28, 20), true);
  assert.equal(shouldTriggerLowEnergyAlert(22, 14), true);
  assert.equal(shouldTriggerLowEnergyAlert(18, 10), false, 'Already below 20%, should not re-trigger crossing alert');
  assert.equal(shouldTriggerLowEnergyAlert(10, 0), false, 'At 0% triggers sleep blackout instead of low energy alert');

  const easySleep = applySleepOnJobPenalty(200, 'facil');
  assert.equal(easySleep.penalty, 120);
  assert.equal(easySleep.nextPoints, 80);
  assert.equal(easySleep.recoveredEnergy, 10);

  const normalSleep = applySleepOnJobPenalty(100, 'normal');
  assert.equal(normalSleep.penalty, 180);
  assert.equal(normalSleep.nextPoints, -80, 'Player can go into negative points when sleeping on the job');
  assert.equal(normalSleep.recoveredEnergy, 10);

  const hardSleep = applySleepOnJobPenalty(0, 'dificil');
  assert.equal(hardSleep.penalty, 250);
  assert.equal(hardSleep.nextPoints, -250);
  assert.equal(hardSleep.recoveredEnergy, 10);
});

test('Company Bankruptcy (Game Over) detection, step energy drain, and Full Reset (buildResetCareerState) wipe all clothes purchases, medals, and restore 100% energy and 0 points', () => {
  const minEasyCoffee = getCheapestCoffeePrice('facil', 0, 0);
  assert.equal(minEasyCoffee, 15);

  // Verify step energy drain across a 2-step Normal ticket sums to 12%
  const step1 = calculateActionStepEnergyDrain('normal', 2, false, 0);
  const step2 = calculateActionStepEnergyDrain('normal', 2, true, 1);
  assert.equal(step1, 6);
  assert.equal(step2, 6);
  assert.equal(step1 + step2, 12);

  // Bankrupt when energy is 0% and points are negative or below cheapest coffee price
  assert.equal(isCompanyBankrupt(0, -120, 'normal', 2), true);
  assert.equal(isCompanyBankrupt(0, 0, 'facil', 0), true);
  assert.equal(isCompanyBankrupt(0, 10, 'facil', 0), true);

  // Bankrupt when in debt (< 0 pts) at exhaustion recovery energy (<= 10%)
  assert.equal(isCompanyBankrupt(10, -40, 'normal', 1), true);

  // Not bankrupt when energy is 0% but player still has enough points to buy coffee after penalty
  assert.equal(isCompanyBankrupt(0, 120, 'normal', 0), false);

  // Not bankrupt when player is in debt (< 0 pts) but still has sufficient energy (> 10%) to work and recover
  assert.equal(isCompanyBankrupt(65, -40, 'normal', 1), false);

  // Verify full reset wipes all purchased outfits, accessories, points, and medals while preserving gender
  const resetState = buildResetCareerState({
    genero: 'feminino',
    roupaId: 'jaqueta_cyber',
    acessorioId: 'fone_neon',
    corCabelo: '#78350f',
    tomPele: '#f1c27d',
  });

  assert.equal(resetState.points, 0);
  assert.equal(resetState.energy, 100);
  assert.equal(resetState.resolvedCount, 0);
  assert.deepEqual(resetState.unlockedMedals, []);
  assert.deepEqual(resetState.purchasedOutfitIds, DEFAULT_PURCHASED_OUTFITS);
  assert.deepEqual(resetState.purchasedAccessoryIds, DEFAULT_PURCHASED_ACCESSORIES);
  assert.equal(resetState.playerCustomization.genero, 'feminino');
  assert.equal(resetState.playerCustomization.roupaId, 'uniforme_ti');

  // Verify Plantão Noturno (Night Shift) increases energy drain, coffee prices (+50%), and ticket point rewards (+50% base points)
  const dayStep1 = calculateActionStepEnergyDrain('normal', 2, false, 0, false);
  const dayStep2 = calculateActionStepEnergyDrain('normal', 2, true, 1, false);
  const nightStep1 = calculateActionStepEnergyDrain('normal', 2, false, 0, true);
  const nightStep2 = calculateActionStepEnergyDrain('normal', 2, true, 1, true);
  assert.equal(dayStep1 + dayStep2, 12, 'Daytime Normal ticket should drain 12% energy');
  assert.equal(nightStep1 + nightStep2, 20, 'Night Shift Normal ticket should drain 20% energy');

  const dayCoffeePrice = getCoffeeDynamicPrice(ALL_COFFEES[1], 'normal', 0, 0, false);
  const nightCoffeePrice = getCoffeeDynamicPrice(ALL_COFFEES[1], 'normal', 0, 0, true);
  assert.ok(
    nightCoffeePrice > dayCoffeePrice,
    `Night Shift coffee price (${nightCoffeePrice}) must be higher than daytime (${dayCoffeePrice})`
  );

  const dayReward = calculateTicketReward({
    difficulty: 'normal',
    categoria: 'Software',
    errorCount: 0,
    isRushHour: false,
    isNightShift: false,
    currentPoints: 0,
    resolvedCountAfter: 1,
    unlockedMedals: ['primeiro_chamado', 'mestre_overos', 'olho_clinico'],
  });
  const nightReward = calculateTicketReward({
    difficulty: 'normal',
    categoria: 'Software',
    errorCount: 0,
    isRushHour: false,
    isNightShift: true,
    currentPoints: 0,
    resolvedCountAfter: 1,
    unlockedMedals: ['primeiro_chamado', 'mestre_overos', 'olho_clinico'],
  });
  assert.equal(dayReward.nightShiftBonus, 0);
  assert.equal(nightReward.nightShiftBonus, 90, 'Normal Night Shift bonus should be +90 pts (+50% of 180)');
  assert.equal(nightReward.totalEarned, dayReward.totalEarned + 90);
});



