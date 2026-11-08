import * as THREE from 'three';
import { OfficeMaterialLibrary } from './materials';
import { createPlantGroup } from './models';

export interface HomeSceneObjects {
  rootGroup: THREE.Group;
  starterBedGroup: THREE.Group;
  furnitureGroups: Record<string, THREE.Group>;
  doorBeacon: THREE.Mesh;
  bedBeacon: THREE.Mesh;
}

/**
 * Builds the 3D Isometric Home ("Casa do Analista") and all 36 purchasable 3D furniture pieces
 * (3 versions for each of the 12 furniture slots) with realistic multi-part geometry and contact shadows.
 */
export function createHomeSceneGroup(mats: OfficeMaterialLibrary): HomeSceneObjects {
  const rootGroup = new THREE.Group();
  const furnitureGroups: Record<string, THREE.Group> = {};

  // Shared PBR materials for realistic home interior & furniture finishes
  const warmWallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.78 });
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55 });
  const walnutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.44, metalness: 0.06 });
  const oakMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.52, metalness: 0.04 });
  const ebonyWoodMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.36, metalness: 0.1 });
  const linenSofaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.74 });
  const navyVelvetMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.58, metalness: 0.08 });
  const cognacLeatherMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.35, metalness: 0.08 });
  const caramelLeatherMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.38, metalness: 0.06 });
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.68 });
  const creamFabricMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.64 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.72, roughness: 0.26 });
  const inoxMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.84, roughness: 0.2 });
  const titaniumBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.22 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.86, roughness: 0.2 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, metalness: 0.88, roughness: 0.18 });
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.22, metalness: 0.05 });

  const contactShadowMat = new THREE.MeshBasicMaterial({
    color: 0x020617,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const addContactShadow = (parent: THREE.Group, w: number, d: number, ox = 0, oz = 0) => {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, d), contactShadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(ox, 0.018, oz);
    parent.add(shadow);
  };

  // 1. Main Apartment Parquet Floor (16.8m x 10.6m)
  const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(16.8, 10.6), mats.parquetFloor);
  mainFloor.rotation.x = -Math.PI / 2;
  mainFloor.position.set(0, 0, 0);
  mainFloor.receiveShadow = true;
  rootGroup.add(mainFloor);

  // Kitchen & Dining Zone Ceramic Floor on the East Wing (x: 2.3..8.2, z: -5.1..5.1)
  const kitchenFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 10.2), mats.corridorFloor);
  kitchenFloor.rotation.x = -Math.PI / 2;
  kitchenFloor.position.set(5.25, 0.015, 0);
  kitchenFloor.receiveShadow = true;
  rootGroup.add(kitchenFloor);

  // Outer Apartment Perimeter Walls + Baseboards
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(16.8, 1.85, 0.18), warmWallMat);
  northWall.position.set(0, 0.925, -5.25);
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  rootGroup.add(northWall);

  const northBaseboard = new THREE.Mesh(new THREE.BoxGeometry(16.82, 0.1, 0.21), baseboardMat);
  northBaseboard.position.set(0, 0.05, -5.25);
  rootGroup.add(northBaseboard);

  // Panoramic Home Window on North Wall
  const homeWindowGlass = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.25, 0.22), mats.windowGlass);
  homeWindowGlass.position.set(-1.2, 1.05, -5.25);
  rootGroup.add(homeWindowGlass);

  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 10.6), warmWallMat);
  westWall.position.set(-8.35, 0.625, 0);
  westWall.castShadow = true;
  rootGroup.add(westWall);

  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 10.6), warmWallMat);
  eastWall.position.set(8.35, 0.625, 0);
  eastWall.castShadow = true;
  rootGroup.add(eastWall);

  // South Curb Wall split for the Front Doorway at x = 0, z = 5.25
  const southWallLeft = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.45, 0.18), warmWallMat);
  southWallLeft.position.set(-4.9, 0.225, 5.25);
  rootGroup.add(southWallLeft);

  const southWallRight = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.45, 0.18), warmWallMat);
  southWallRight.position.set(4.9, 0.225, 5.25);
  rootGroup.add(southWallRight);

  // Interior Room Divider Wall between Bedroom (North-West) and Living Room (South-West)
  const bedroomDivider = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.05, 0.16), warmWallMat);
  bedroomDivider.position.set(-6.35, 0.525, -0.4);
  bedroomDivider.castShadow = true;
  rootGroup.add(bedroomDivider);

  // Front Entrance Door Mat & Architectural Sign
  const doorMat = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.025, 0.85),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
  );
  doorMat.position.set(0, 0.025, 4.65);
  rootGroup.add(doorMat);

  const doorJambL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.45, 0.22), walnutMat);
  doorJambL.position.set(-1.35, 0.725, 5.25);
  rootGroup.add(doorJambL);
  const doorJambR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.45, 0.22), walnutMat);
  doorJambR.position.set(1.35, 0.725, 5.25);
  rootGroup.add(doorJambR);

  if (typeof document !== 'undefined') {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 340;
    signCanvas.height = 68;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 340, 68);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 334, 62);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚪 PORTA · VOLTAR AO EMPREGO [E]', 170, 35);
      const signTex = new THREE.CanvasTexture(signCanvas);
      signTex.colorSpace = THREE.SRGBColorSpace;
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.25, 0.45),
        new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
      );
      signMesh.position.set(0, 1.65, 5.15);
      rootGroup.add(signMesh);
    }

    // Bed Plaque above the Bedroom Bed ("🛏️ CAMA · DORMIR E RECUPERAR [E]")
    const bedSignCanvas = document.createElement('canvas');
    bedSignCanvas.width = 340;
    bedSignCanvas.height = 68;
    const bCtx = bedSignCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#0f172a';
      bCtx.fillRect(0, 0, 340, 68);
      bCtx.strokeStyle = '#10b981';
      bCtx.lineWidth = 6;
      bCtx.strokeRect(3, 3, 334, 62);
      bCtx.fillStyle = '#ecfdf5';
      bCtx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText('🛏️ CAMA · DORMIR (100% ENERGIA) [E]', 170, 35);
      const bedSignTex = new THREE.CanvasTexture(bedSignCanvas);
      bedSignTex.colorSpace = THREE.SRGBColorSpace;
      const bedSignMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.25, 0.45),
        new THREE.MeshBasicMaterial({ map: bedSignTex, side: THREE.DoubleSide })
      );
      bedSignMesh.position.set(-5.3, 1.75, -4.45);
      rootGroup.add(bedSignMesh);
    }
  }

  const doorBeacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      roughness: 0.2,
    })
  );
  doorBeacon.position.set(0, 2.15, 4.85);
  rootGroup.add(doorBeacon);

  const bedBeacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2, 0),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.9,
      roughness: 0.2,
    })
  );
  bedBeacon.position.set(-5.3, 2.22, -3.4);
  rootGroup.add(bedBeacon);

  // Built-in Kitchenette Counter, Faucet & Sink (North-East Kitchen Zone)
  const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.86, 0.72), walnutMat);
  kitchenCounter.position.set(4.4, 0.43, -4.65);
  kitchenCounter.castShadow = true;
  rootGroup.add(kitchenCounter);

  const kitchenTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 0.78), marbleMat);
  kitchenTop.position.set(4.4, 0.88, -4.65);
  rootGroup.add(kitchenTop);

  const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.03, 0.44), inoxMat);
  sinkBasin.position.set(3.4, 0.91, -4.65);
  rootGroup.add(sinkBasin);

  const faucetNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.26, 10), inoxMat);
  faucetNeck.position.set(3.4, 1.03, -4.86);
  rootGroup.add(faucetNeck);
  const faucetSpout = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.18), inoxMat);
  faucetSpout.position.set(3.4, 1.15, -4.78);
  rootGroup.add(faucetSpout);

  // Starter Bed (Shown until the player buys any version of 'cama_quarto')
  const starterBedGroup = new THREE.Group();
  starterBedGroup.position.set(-5.4, 0, -3.5);
  addContactShadow(starterBedGroup, 1.65, 2.25);
  const sFrame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.28, 2.05), oakMat);
  sFrame.position.set(0, 0.14, 0);
  sFrame.castShadow = true;
  starterBedGroup.add(sFrame);
  const sHeadboard = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.78, 0.12), oakMat);
  sHeadboard.position.set(0, 0.42, -0.98);
  starterBedGroup.add(sHeadboard);
  const sMattress = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.22, 1.92), pillowMat);
  sMattress.position.set(0, 0.35, 0.02);
  starterBedGroup.add(sMattress);
  const sBlanket = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.23, 1.25),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 })
  );
  sBlanket.position.set(0, 0.36, 0.34);
  starterBedGroup.add(sBlanket);
  const sPillow = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.11, 0.38), pillowMat);
  sPillow.position.set(0, 0.49, -0.65);
  starterBedGroup.add(sPillow);
  rootGroup.add(starterBedGroup);

  // ============================================================================
  // 36 REALISTIC 3D FURNITURE MODELS (3 VERSIONS PER SLOT)
  // ============================================================================

  // ----------------------------------------------------------------------------
  // SLOT 1: TAPETE DA SALA ('tapete_persa_sala', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['tapete_persa_sala', 1],
    ['tapete_persa_sala_v2', 2],
    ['tapete_persa_sala_v3', 3],
  ] as [string, number][]) {
    const rugGroup = new THREE.Group();
    rugGroup.position.set(-5.6, 0.022, 1.8);
    const outerCol = v === 1 ? 0x0c4a6e : v === 2 ? 0x7c2d12 : 0x1e1b4b;
    const midCol = v === 1 ? 0xe0f2fe : v === 2 ? 0xfef3c7 : 0xfbbf24;
    const innerCol = v === 1 ? 0x0284c7 : v === 2 ? 0xb91c1c : 0x312e81;

    const rugOuter = new THREE.Mesh(
      new THREE.BoxGeometry(3.6 + v * 0.12, 0.02, 2.55 + v * 0.08),
      new THREE.MeshStandardMaterial({ color: outerCol, roughness: v === 3 ? 0.55 : 0.85 })
    );
    rugGroup.add(rugOuter);

    const rugBorder = new THREE.Mesh(
      new THREE.BoxGeometry(3.25 + v * 0.1, 0.024, 2.2 + v * 0.06),
      new THREE.MeshStandardMaterial({ color: midCol, roughness: 0.72, metalness: v === 3 ? 0.35 : 0.05 })
    );
    rugGroup.add(rugBorder);

    const rugInner = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 0.027, 1.8),
      new THREE.MeshStandardMaterial({ color: innerCol, roughness: v === 3 ? 0.5 : 0.8 })
    );
    rugGroup.add(rugInner);

    if (v >= 2) {
      // Central medallion & golden fringes on ends
      const medallion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.031, 20),
        new THREE.MeshStandardMaterial({ color: midCol, metalness: v === 3 ? 0.5 : 0.1, roughness: 0.5 })
      );
      rugGroup.add(medallion);
    }
    if (v === 3) {
      // Imperial gold corner inlays
      for (const [cx, cz] of [
        [-1.3, -0.8],
        [1.3, -0.8],
        [-1.3, 0.8],
        [1.3, 0.8],
      ]) {
        const inlay = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.032, 12), brassMat);
        inlay.position.set(cx, 0, cz);
        rugGroup.add(inlay);
      }
    }

    rugGroup.visible = false;
    furnitureGroups[id] = rugGroup;
    rootGroup.add(rugGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 2: JARDIM INTERNO & VASOS ('kit_plantas_monstera', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['kit_plantas_monstera', 1],
    ['kit_plantas_monstera_v2', 2],
    ['kit_plantas_monstera_v3', 3],
  ] as [string, number][]) {
    const plantsGroup = new THREE.Group();
    const coords: [number, number, number][] = [
      [-7.3, -4.4, 1.15 + v * 0.1],
      [-7.3, 4.2, 1.1 + v * 0.08],
      [7.4, 4.2, 1.15 + v * 0.1],
    ];
    for (const [px, pz, sc] of coords) {
      const p = createPlantGroup(mats);
      p.scale.setScalar(sc);
      p.position.set(px, 0, pz);
      plantsGroup.add(p);

      if (v >= 2) {
        // Brass planter ring stand
        const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 10, 20), brassMat);
        brassRing.rotation.x = Math.PI / 2;
        brassRing.position.set(px, 0.44, pz);
        plantsGroup.add(brassRing);
      }
      if (v === 3) {
        // Zen white river stones & warm LED uplight ring at base
        const ledRing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.45, 0.04, 20),
          new THREE.MeshStandardMaterial({
            color: 0x34d399,
            emissive: 0x10b981,
            emissiveIntensity: 1.6,
          })
        );
        ledRing.position.set(px, 0.02, pz);
        plantsGroup.add(ledRing);
      }
    }
    plantsGroup.visible = false;
    furnitureGroups[id] = plantsGroup;
    rootGroup.add(plantsGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 3: ESTAÇÃO DE CAFÉ ('cafeteira_barista_casa', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['cafeteira_barista_casa', 1],
    ['cafeteira_barista_casa_v2', 2],
    ['cafeteira_barista_casa_v3', 3],
  ] as [string, number][]) {
    const coffeeGroup = new THREE.Group();
    coffeeGroup.position.set(4.7, 0.91, -4.65);

    const bodyMat = v === 1 ? inoxMat : v === 2 ? titaniumBlackMat : copperMat;
    const accentMat = v === 1 ? darkMetalMat : brassMat;

    // Wooden barista mat
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.025, 0.48), walnutMat);
    tray.position.set(-0.05, 0.012, 0);
    coffeeGroup.add(tray);

    // Main Espresso Boiler Chassis
    const espBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.44 + v * 0.05, 0.36 + v * 0.03, 0.36),
      bodyMat
    );
    espBody.position.set(0, 0.19, 0);
    espBody.castShadow = true;
    coffeeGroup.add(espBody);

    // Group head & portafilter handle
    const groupHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 12), accentMat);
    groupHead.position.set(0, 0.22, 0.2);
    coffeeGroup.add(groupHead);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.18, 8), walnutMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, 0.21, 0.31);
    coffeeGroup.add(handle);

    // Conical Burr Grinder on the right
    const grinderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.26, 14), darkMetalMat);
    grinderBase.position.set(0.42, 0.14, 0);
    coffeeGroup.add(grinderBase);

    if (v >= 2) {
      // Transparent Bean Hopper on top of grinder + Steam Wand
      const hopper = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.16, 14),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.25 })
      );
      hopper.rotation.x = Math.PI;
      hopper.position.set(0.42, 0.33, 0);
      coffeeGroup.add(hopper);
    }
    if (v === 3) {
      // Brass pressure gauge dial & top cup warmer rail
      const gauge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
      );
      gauge.rotation.x = Math.PI / 2;
      gauge.position.set(0, 0.31, 0.19);
      coffeeGroup.add(gauge);
    }

    // Mugs on the left
    for (let m = 0; m < 3; m++) {
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.04, 0.1, 12),
        new THREE.MeshStandardMaterial({
          color: m === 0 ? 0xf59e0b : m === 1 ? 0x38bdf8 : 0x10b981,
          roughness: 0.3,
        })
      );
      mug.position.set(-0.38 - m * 0.13, 0.06, 0.06);
      coffeeGroup.add(mug);
    }

    coffeeGroup.visible = false;
    furnitureGroups[id] = coffeeGroup;
    rootGroup.add(coffeeGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 4: ESTANTE & BIBLIOTECA ('estante_livros_geek', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['estante_livros_geek', 1],
    ['estante_livros_geek_v2', 2],
    ['estante_livros_geek_v3', 3],
  ] as [string, number][]) {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-7.65, 0, -1.9);
    addContactShadow(shelfGroup, 0.85, 1.95);

    const frameMat = v === 1 ? oakMat : v === 2 ? walnutMat : ebonyWoodMat;
    const depthZ = 1.65 + (v - 1) * 0.16;

    // Backboard & Side Columns
    const backBoard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.92, depthZ), frameMat);
    backBoard.position.set(-0.22, 0.96, 0);
    backBoard.castShadow = true;
    shelfGroup.add(backBoard);

    for (const sz of [-depthZ * 0.48, depthZ * 0.48]) {
      const sideCol = new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.92, 0.07), frameMat);
      sideCol.position.set(0, 0.96, sz);
      sideCol.castShadow = true;
      shelfGroup.add(sideCol);
    }

    const bookColors = [0x38bdf8, 0xf59e0b, 0xa855f7, 0x10b981, 0xef4444, 0xeab308];
    for (let row = 0; row < 4; row++) {
      const shelfY = 0.12 + row * 0.46;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, depthZ), frameMat);
      plank.position.set(0, shelfY, 0);
      shelfGroup.add(plank);

      for (let b = 0; b < 5; b++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, 0.28, 0.08),
          new THREE.MeshStandardMaterial({
            color: bookColors[(row * 2 + b) % bookColors.length],
            roughness: 0.48,
          })
        );
        book.position.set(0.06, shelfY + 0.165, -0.56 + b * 0.27);
        shelfGroup.add(book);
      }

      if (v === 3) {
        // Warm LED gallery strip under each shelf
        const led = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.02, depthZ - 0.16),
          new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0xa855f7,
            emissiveIntensity: 1.8,
          })
        );
        led.position.set(0.22, shelfY + 0.42, 0);
        shelfGroup.add(led);
      }
    }

    if (v >= 2) {
      // Golden Trophy / Globe on top shelf
      const trophy = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), brassMat);
      trophy.position.set(0.06, 1.72, 0.45);
      shelfGroup.add(trophy);
    }

    shelfGroup.visible = false;
    furnitureGroups[id] = shelfGroup;
    rootGroup.add(shelfGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 5: SOFÁ & MESA DE CENTRO ('sofa_retratil', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['sofa_retratil', 1],
    ['sofa_retratil_v2', 2],
    ['sofa_retratil_v3', 3],
  ] as [string, number][]) {
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-5.6, 0, 2.55);
    addContactShadow(sofaGroup, 3.0, 2.4, 0, -0.35);

    const upholsteryMat = v === 1 ? linenSofaMat : v === 2 ? navyVelvetMat : cognacLeatherMat;
    const widthX = 2.55 + (v - 1) * 0.18;

    // Wooden / Brass Feet
    for (const [fx, fz] of [
      [-widthX * 0.45, -0.38],
      [widthX * 0.45, -0.38],
      [-widthX * 0.45, 0.38],
      [widthX * 0.45, 0.38],
    ]) {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.1, 10),
        v === 3 ? brassMat : walnutMat
      );
      foot.position.set(fx, 0.05, fz);
      sofaGroup.add(foot);
    }

    // Main Seat Deck + 3 Plump Seat Cushions
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(widthX, 0.24, 0.94), upholsteryMat);
    sofaBase.position.set(0, 0.2, 0);
    sofaBase.castShadow = true;
    sofaGroup.add(sofaBase);

    for (let c = -1; c <= 1; c++) {
      const seatCushion = new THREE.Mesh(
        new THREE.BoxGeometry(widthX * 0.3, 0.15, 0.84),
        upholsteryMat
      );
      seatCushion.position.set(c * (widthX * 0.31), 0.38, -0.03);
      seatCushion.castShadow = true;
      sofaGroup.add(seatCushion);
    }

    // Rounded Cylindrical Armrests
    for (const ax of [-widthX * 0.48, widthX * 0.48]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.96), upholsteryMat);
      arm.position.set(ax, 0.38, 0);
      arm.castShadow = true;
      sofaGroup.add(arm);

      const bolster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.94, 14),
        upholsteryMat
      );
      bolster.rotation.x = Math.PI / 2;
      bolster.position.set(ax, 0.62, 0);
      sofaGroup.add(bolster);
    }

    // Backrest & Throw Pillows
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(widthX, 0.56, 0.22), upholsteryMat);
    sofaBack.position.set(0, 0.62, 0.38);
    sofaBack.castShadow = true;
    sofaGroup.add(sofaBack);

    for (const px of [-0.82, 0, 0.82]) {
      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.3, 0.14),
        v === 3 ? brassMat : pillowMat
      );
      cushion.position.set(px, 0.58, 0.22);
      cushion.rotation.x = 0.15;
      sofaGroup.add(cushion);
    }

    // V2 & V3 Extended Chaise Longue
    if (v >= 2) {
      const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.38, 1.58), upholsteryMat);
      sofaChaise.position.set(-0.88, 0.26, -0.34);
      sofaChaise.castShadow = true;
      sofaGroup.add(sofaChaise);
    }

    // Coffee Table in front of Sofa
    const tableTopMat = v === 1 ? oakMat : v === 2 ? walnutMat : marbleMat;
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 0.66), tableTopMat);
    coffeeTable.position.set(0.35, 0.38, -1.06);
    coffeeTable.castShadow = true;
    sofaGroup.add(coffeeTable);

    const tableBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.34, 0.5),
      v === 3 ? brassMat : darkMetalMat
    );
    tableBase.position.set(0.35, 0.17, -1.06);
    sofaGroup.add(tableBase);

    sofaGroup.visible = false;
    furnitureGroups[id] = sofaGroup;
    rootGroup.add(sofaGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 6: POLTRONA DE DESCANSO ('poltrona_massagem', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['poltrona_massagem', 1],
    ['poltrona_massagem_v2', 2],
    ['poltrona_massagem_v3', 3],
  ] as [string, number][]) {
    const reclinerGroup = new THREE.Group();
    reclinerGroup.position.set(-2.25, 0, -4.15);
    addContactShadow(reclinerGroup, 1.4, 1.85, 0.1, 0.2);

    const chairMat = v === 1 ? caramelLeatherMat : v === 2 ? cognacLeatherMat : titaniumBlackMat;

    // Swivel pedestal base
    const basePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, 0.12, 16),
      v === 2 ? walnutMat : darkMetalMat
    );
    basePedestal.position.set(0, 0.06, 0);
    reclinerGroup.add(basePedestal);

    const recSeat = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.34, 0.86), chairMat);
    recSeat.position.set(0, 0.28, 0);
    recSeat.castShadow = true;
    reclinerGroup.add(recSeat);

    const recBack = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.76, 0.22), chairMat);
    recBack.position.set(0, 0.72, -0.32);
    recBack.rotation.x = -0.24;
    recBack.castShadow = true;
    reclinerGroup.add(recBack);

    // Padded Armrests
    for (const ax of [-0.44, 0.44]) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.78),
        v === 2 ? walnutMat : chairMat
      );
      arm.position.set(ax, 0.46, -0.02);
      reclinerGroup.add(arm);
    }

    // Ottoman footrest
    const ottoman = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.32, 0.48), chairMat);
    ottoman.position.set(0, 0.18, 0.78);
    ottoman.castShadow = true;
    reclinerGroup.add(ottoman);

    // Floor Reading Lamp beside the Recliner
    const rLampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 1.62, 12),
      v === 3 ? inoxMat : brassMat
    );
    rLampPole.position.set(0.68, 0.81, -0.25);
    reclinerGroup.add(rLampPole);

    const rLampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.3, 18),
      new THREE.MeshStandardMaterial({
        color: v === 3 ? 0x38bdf8 : 0xfef08a,
        emissive: v === 3 ? 0x0ea5e9 : 0xfbbf24,
        emissiveIntensity: 1.9,
      })
    );
    rLampShade.position.set(0.68, 1.6, -0.25);
    reclinerGroup.add(rLampShade);

    reclinerGroup.visible = false;
    furnitureGroups[id] = reclinerGroup;
    rootGroup.add(reclinerGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 7: CONJUNTO DE JANTAR ('mesa_jantar_madeira', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['mesa_jantar_madeira', 1],
    ['mesa_jantar_madeira_v2', 2],
    ['mesa_jantar_madeira_v3', 3],
  ] as [string, number][]) {
    const diningGroup = new THREE.Group();
    diningGroup.position.set(4.2, 0, 1.5);
    addContactShadow(diningGroup, 2.55, 2.15);

    const topMat = v === 1 ? oakMat : v === 2 ? walnutMat : marbleMat;
    const legMat = v === 3 ? brassMat : darkMetalMat;
    const chairMat = v === 1 ? creamFabricMat : v === 2 ? caramelLeatherMat : navyVelvetMat;

    const dTableTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.15 + (v - 1) * 0.14, 0.08, 1.25 + (v - 1) * 0.06),
      topMat
    );
    dTableTop.position.set(0, 0.76, 0);
    dTableTop.castShadow = true;
    diningGroup.add(dTableTop);

    for (const [lx, lz] of [
      [-0.9, -0.48],
      [0.9, -0.48],
      [-0.9, 0.48],
      [0.9, 0.48],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.74, 12), legMat);
      leg.position.set(lx, 0.37, lz);
      diningGroup.add(leg);
    }

    // Centerpiece bowl / chandelier vase on the table
    const centerpiece = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.12, 0.12, 16),
      v === 3 ? brassMat : marbleMat
    );
    centerpiece.position.set(0, 0.85, 0);
    diningGroup.add(centerpiece);

    // 4 (or 6 for V3) Realistic Dining Chairs with Seat + Backrest + Legs
    const chairCoords: [number, number, number][] = [
      [-0.58, -0.82, 0],
      [0.58, -0.82, 0],
      [-0.58, 0.82, Math.PI],
      [0.58, 0.82, Math.PI],
    ];
    if (v === 3) {
      chairCoords.push([-1.25, 0, Math.PI / 2], [1.25, 0, -Math.PI / 2]);
    }

    for (const [cx, cz, rotY] of chairCoords) {
      const cGroup = new THREE.Group();
      cGroup.position.set(cx, 0, cz);
      cGroup.rotation.y = rotY;

      const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), chairMat);
      cSeat.position.set(0, 0.45, 0);
      cSeat.castShadow = true;
      cGroup.add(cSeat);

      const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.07), chairMat);
      cBack.position.set(0, 0.69, -0.2);
      cBack.castShadow = true;
      cGroup.add(cBack);

      const cPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.16, 0.42, 10), legMat);
      cPedestal.position.set(0, 0.21, 0);
      cGroup.add(cPedestal);

      diningGroup.add(cGroup);
    }

    diningGroup.visible = false;
    furnitureGroups[id] = diningGroup;
    rootGroup.add(diningGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 8: CAMA DO QUARTO ('cama_king_hotel', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['cama_king_hotel', 1],
    ['cama_king_hotel_v2', 2],
    ['cama_king_hotel_v3', 3],
  ] as [string, number][]) {
    const bedGroup = new THREE.Group();
    bedGroup.position.set(-5.3, 0, -3.4);
    addContactShadow(bedGroup, 2.55, 2.65);

    const frameMat = v === 1 ? oakMat : v === 2 ? walnutMat : ebonyWoodMat;
    const duvetCol = v === 1 ? 0x0284c7 : v === 2 ? 0x312e81 : 0x581c87;

    const kBase = new THREE.Mesh(new THREE.BoxGeometry(2.1 + v * 0.08, 0.34, 2.32), frameMat);
    kBase.position.set(0, 0.17, 0);
    kBase.castShadow = true;
    bedGroup.add(kBase);

    const kMattress = new THREE.Mesh(new THREE.BoxGeometry(1.98 + v * 0.06, 0.28, 2.16), pillowMat);
    kMattress.position.set(0, 0.44, 0.04);
    bedGroup.add(kMattress);

    const kDuvet = new THREE.Mesh(
      new THREE.BoxGeometry(2.0 + v * 0.06, 0.3, 1.48),
      new THREE.MeshStandardMaterial({ color: duvetCol, roughness: v === 3 ? 0.45 : 0.68 })
    );
    kDuvet.position.set(0, 0.45, 0.38);
    bedGroup.add(kDuvet);

    const kHeadboard = new THREE.Mesh(
      new THREE.BoxGeometry(2.35 + v * 0.12, 1.1 + v * 0.06, 0.16),
      frameMat
    );
    kHeadboard.position.set(0, 0.56, -1.14);
    kHeadboard.castShadow = true;
    bedGroup.add(kHeadboard);

    if (v >= 2) {
      // Twin Nightstands + Warm Bedside Lamps
      for (const nx of [-1.42, 1.42]) {
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.42), frameMat);
        stand.position.set(nx, 0.24, -0.92);
        bedGroup.add(stand);

        const lamp = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.14, 0.24, 12),
          new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.5,
          })
        );
        lamp.position.set(nx, 0.62, -0.92);
        bedGroup.add(lamp);
      }
    }

    if (v === 3) {
      // Presidential LED Headboard Strip + Foot-of-Bed Recamier Bench
      const kLedStrip = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.06, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0xa855f7,
          emissiveIntensity: 2.4,
        })
      );
      kLedStrip.position.set(0, 1.15, -1.05);
      bedGroup.add(kLedStrip);

      const recamier = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.4, 0.44), cognacLeatherMat);
      recamier.position.set(0, 0.2, 1.38);
      recamier.castShadow = true;
      bedGroup.add(recamier);
    }

    for (const px of [-0.52, 0.52]) {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.42), pillowMat);
      pil.position.set(px, 0.64, -0.72);
      bedGroup.add(pil);
    }

    bedGroup.visible = false;
    furnitureGroups[id] = bedGroup;
    rootGroup.add(bedGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 9: GELADEIRA DA COZINHA ('geladeira_inox_smart', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['geladeira_inox_smart', 1],
    ['geladeira_inox_smart_v2', 2],
    ['geladeira_inox_smart_v3', 3],
  ] as [string, number][]) {
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(7.0, 0, -4.45);
    addContactShadow(fridgeGroup, 1.35, 1.05);

    const chassisMat = v === 3 ? titaniumBlackMat : inoxMat;
    const fBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.08 + v * 0.06, 1.96, 0.84),
      chassisMat
    );
    fBody.position.set(0, 0.98, 0);
    fBody.castShadow = true;
    fridgeGroup.add(fBody);

    // Door handles
    for (const hx of [-0.06, 0.06]) {
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.78, 10),
        v === 3 ? brassMat : darkMetalMat
      );
      handle.position.set(hx, 1.15, 0.44);
      fridgeGroup.add(handle);
    }

    if (v >= 2) {
      const fDispenser = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.03), darkMetalMat);
      fDispenser.position.set(-0.28, 1.18, 0.425);
      fridgeGroup.add(fDispenser);
    }
    if (v === 3) {
      const fScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.6, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x38bdf8,
          emissiveIntensity: 1.5,
        })
      );
      fScreen.position.set(0.28, 1.25, 0.425);
      fridgeGroup.add(fScreen);
    }

    fridgeGroup.visible = false;
    furnitureGroups[id] = fridgeGroup;
    rootGroup.add(fridgeGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 10: HOME THEATER & TV ('tv_oled_65', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['tv_oled_65', 1],
    ['tv_oled_65_v2', 2],
    ['tv_oled_65_v3', 3],
  ] as [string, number][]) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(-5.8, 0, 0.05);
    addContactShadow(tvGroup, 2.65, 0.65);

    const rackMat = v === 1 ? oakMat : v === 2 ? walnutMat : ebonyWoodMat;
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.42, 0.46), rackMat);
    rack.position.set(0, 0.24, 0);
    rack.castShadow = true;
    tvGroup.add(rack);

    const screenW = 1.65 + (v - 1) * 0.22;
    const screenH = 0.92 + (v - 1) * 0.1;

    const tvBezel = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.08, screenH + 0.08, 0.05), darkMetalMat);
    tvBezel.position.set(0, 1.12, 0);
    tvBezel.castShadow = true;
    tvGroup.add(tvBezel);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(screenW, screenH),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: v === 3 ? 0xec4899 : 0x6366f1,
        emissiveIntensity: 1.3 + v * 0.15,
        roughness: 0.12,
      })
    );
    tvScreen.position.set(0, 1.12, 0.028);
    tvGroup.add(tvScreen);

    if (v >= 2) {
      // Dolby Atmos Soundbar on rack
      const soundbar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.12), titaniumBlackMat);
      soundbar.position.set(0, 0.49, 0.12);
      tvGroup.add(soundbar);
    }
    if (v === 3) {
      // Twin Hi-Fi Acoustic Floor Towers flanking the rack
      for (const tx of [-1.42, 1.42]) {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.28, 0.32), ebonyWoodMat);
        tower.position.set(tx, 0.64, 0);
        tower.castShadow = true;
        tvGroup.add(tower);

        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14), brassMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(tx, 0.92, 0.165);
        tvGroup.add(cone);
      }
    }

    tvGroup.visible = false;
    furnitureGroups[id] = tvGroup;
    rootGroup.add(tvGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 11: CABINE DE JOGOS ARCADE ('fliperama_arcade', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['fliperama_arcade', 1],
    ['fliperama_arcade_v2', 2],
    ['fliperama_arcade_v3', 3],
  ] as [string, number][]) {
    const arcadeGroup = new THREE.Group();
    arcadeGroup.position.set(7.35, 0, 1.4);
    arcadeGroup.rotation.y = -Math.PI / 2;
    addContactShadow(arcadeGroup, 1.15, 1.05);

    const cabCol = v === 1 ? 0x311042 : v === 2 ? 0x0f172a : 0x450a0a;
    const cabW = 0.84 + (v - 1) * 0.14;

    const arcBody = new THREE.Mesh(
      new THREE.BoxGeometry(cabW, 1.78, 0.76),
      new THREE.MeshStandardMaterial({ color: cabCol, roughness: 0.4 })
    );
    arcBody.position.set(0, 0.89, 0);
    arcBody.castShadow = true;
    arcadeGroup.add(arcBody);

    // Control deck ledge + joysticks
    const ctrlDeck = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.04, 0.12, 0.32), darkMetalMat);
    ctrlDeck.position.set(0, 0.94, 0.42);
    arcadeGroup.add(ctrlDeck);

    const arcScreen = new THREE.Mesh(
      new THREE.BoxGeometry(cabW - 0.14, 0.54, 0.05),
      new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: v === 3 ? 0x38bdf8 : 0xec4899,
        emissiveIntensity: 1.7,
      })
    );
    arcScreen.position.set(0, 1.25, 0.37);
    arcadeGroup.add(arcScreen);

    const arcMarquee = new THREE.Mesh(
      new THREE.BoxGeometry(cabW - 0.04, 0.22, 0.14),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.0,
      })
    );
    arcMarquee.position.set(0, 1.66, 0.36);
    arcadeGroup.add(arcMarquee);

    if (v >= 2) {
      // Chrome arcade stool in front
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 14), inoxMat);
      stool.position.set(0, 0.275, 0.75);
      arcadeGroup.add(stool);
    }

    arcadeGroup.visible = false;
    furnitureGroups[id] = arcadeGroup;
    rootGroup.add(arcadeGroup);
  }

  // ----------------------------------------------------------------------------
  // SLOT 12: ESTAÇÃO PC & SETUP ('setup_gamer_casa', '_v2', '_v3')
  // ----------------------------------------------------------------------------
  for (const [id, v] of [
    ['setup_gamer_casa', 1],
    ['setup_gamer_casa_v2', 2],
    ['setup_gamer_casa_v3', 3],
  ] as [string, number][]) {
    const gamerGroup = new THREE.Group();
    gamerGroup.position.set(0.6, 0, -4.35);
    addContactShadow(gamerGroup, 2.2, 1.4, 0, 0.2);

    const gDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.95 + (v - 1) * 0.12, 0.07, 0.86),
      v === 1 ? oakMat : darkMetalMat
    );
    gDesk.position.set(0, 0.75, 0);
    gDesk.castShadow = true;
    gamerGroup.add(gDesk);

    for (const lx of [-0.88, 0.88]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.72), darkMetalMat);
      leg.position.set(lx, 0.37, 0);
      gamerGroup.add(leg);
    }

    if (v >= 2) {
      const gRgbStrip = new THREE.Mesh(
        new THREE.BoxGeometry(1.98, 0.03, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: v === 3 ? 0xec4899 : 0x06b6d4,
          emissiveIntensity: 2.2,
        })
      );
      gRgbStrip.position.set(0, 0.73, 0.42);
      gamerGroup.add(gRgbStrip);
    }

    // Monitors (1 Ultrawide on V1, Dual on V2, Triple on V3)
    const monitorConfigs: [number, number, number][] =
      v === 1
        ? [[0, 0, 0.88]]
        : v === 2
        ? [
            [-0.4, 0.18, 0.68],
            [0.32, -0.18, 0.68],
          ]
        : [
            [-0.66, 0.32, 0.58],
            [0, 0, 0.66],
            [0.66, -0.32, 0.58],
          ];

    for (const [mx, rotY, mw] of monitorConfigs) {
      const mon = new THREE.Mesh(
        new THREE.BoxGeometry(mw, 0.4, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: v === 3 ? 0x38bdf8 : 0x0284c7,
          emissiveIntensity: 1.45,
        })
      );
      mon.position.set(mx, 1.08, -0.18);
      mon.rotation.y = rotY;
      gamerGroup.add(mon);
    }

    // RGB PC Tower
    const rgbPc = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.48, 0.46),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: v === 1 ? 0x0284c7 : 0xa855f7,
        emissiveIntensity: 0.95,
      })
    );
    rgbPc.position.set(0.86, 1.02, -0.05);
    gamerGroup.add(rgbPc);

    // Ergonomic Gaming Chair
    const chairCol = v === 1 ? 0x334155 : v === 2 ? 0x0891b2 : 0xe11d48;
    const chairMat = new THREE.MeshStandardMaterial({ color: chairCol, roughness: 0.45 });
    const gChairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.09, 0.52), chairMat);
    gChairSeat.position.set(-0.05, 0.46, 0.68);
    gamerGroup.add(gChairSeat);
    const gChairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.1), chairMat);
    gChairBack.position.set(-0.05, 0.84, 0.9);
    gamerGroup.add(gChairBack);
    const gChairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.24, 0.44, 12), darkMetalMat);
    gChairBase.position.set(-0.05, 0.22, 0.68);
    gamerGroup.add(gChairBase);

    gamerGroup.visible = false;
    furnitureGroups[id] = gamerGroup;
    rootGroup.add(gamerGroup);
  }

  return {
    rootGroup,
    starterBedGroup,
    furnitureGroups,
    doorBeacon,
    bedBeacon,
  };
}
