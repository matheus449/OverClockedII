import * as THREE from 'three';
import { OfficeMaterialLibrary } from './materials';
import { NpcData, SectorData } from '../problems/validator';

/**
 * Builds a composite 12-part Workstation & 3D Computer Set (THREE.Group):
 * (1) Oak desktop surface, (2-5) four brushed metal legs with levelers,
 * (6) Desktop PC tower case, (7) PC glass side window + power LED,
 * (8) Monitor base & arm, (9) Monitor bezel, (10) Emissive screen display,
 * (11) Mechanical keyboard with keybed, (12) Mouse + mousepad + ergonomic chair.
 */
export function createWorkstationGroup(
  mats: OfficeMaterialLibrary,
  sectorColor: string
): {
  group: THREE.Group;
  screenMat: THREE.MeshStandardMaterial;
  lampBulbMat: THREE.MeshStandardMaterial;
  deskGlowMesh: THREE.Mesh;
  alertBeacon: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Desk tabletop
  const topGeo = new THREE.BoxGeometry(1.65, 0.06, 0.82);
  const topMesh = new THREE.Mesh(topGeo, mats.oakWood);
  topMesh.position.set(0, 0.74, 0);
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // 2-5. Desk metallic legs
  const legGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.72, 10);
  const legOffsets = [
    [-0.75, 0.36, -0.34],
    [0.75, 0.36, -0.34],
    [-0.75, 0.36, 0.34],
    [0.75, 0.36, 0.34],
  ];
  for (const [lx, ly, lz] of legOffsets) {
    const leg = new THREE.Mesh(legGeo, mats.brushedMetal);
    leg.position.set(lx, ly, lz);
    group.add(leg);
  }

  // 6. Desktop PC Tower Case (on right side of desk)
  const caseGeo = new THREE.BoxGeometry(0.22, 0.44, 0.44);
  const pcCase = new THREE.Mesh(caseGeo, mats.pcCaseMatte);
  pcCase.position.set(0.56, 0.99, -0.05);
  pcCase.castShadow = true;
  group.add(pcCase);

  // 7. PC side glass panel + front power LED
  const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), mats.pcGlassSide);
  sideGlass.rotation.y = -Math.PI / 2;
  sideGlass.position.set(0.448, 0.99, -0.05);
  group.add(sideGlass);

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.8,
  });
  const powerLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), ledMat);
  powerLed.position.set(0.56, 1.16, 0.172);
  group.add(powerLed);

  // 8. Monitor stand base & neck
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.18), mats.brushedMetal);
  standBase.position.set(-0.08, 0.78, -0.18);
  group.add(standBase);

  const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.24, 0.035), mats.brushedMetal);
  standNeck.position.set(-0.08, 0.9, -0.21);
  group.add(standNeck);

  // 9. Monitor bezel
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.39, 0.03), mats.pcCaseMatte);
  bezel.position.set(-0.08, 1.07, -0.19);
  bezel.castShadow = true;
  group.add(bezel);

  // 10. Monitor emissive screen
  const screenMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(sectorColor),
    emissive: new THREE.Color(sectorColor),
    emissiveIntensity: 0.75,
    roughness: 0.15,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.61, 0.34), screenMat);
  screen.position.set(-0.08, 1.07, -0.173);
  group.add(screen);

  // 11. Keyboard & Keybed
  const kbBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.018, 0.14), mats.keyboardPlastic);
  kbBase.position.set(-0.08, 0.78, 0.12);
  group.add(kbBase);

  // 12. Mouse & Mousepad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.006, 0.2), mats.fabricDark);
  pad.position.set(0.24, 0.774, 0.12);
  group.add(pad);

  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.1), mats.pcCaseMatte);
  mouse.position.set(0.24, 0.788, 0.12);
  group.add(mouse);

  // 13. Articulated Architect Desk Lamp on the left side of the desk (glows warmly at night!)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-0.62, 0.77, -0.16);

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.022, 12), mats.pcCaseMatte);
  lampBase.position.y = 0.011;
  lampGroup.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), mats.chromeMetal);
  lampStem.position.set(0, 0.17, -0.02);
  lampStem.rotation.x = 0.18;
  lampGroup.add(lampStem);

  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.095, 0.13, 14, 1, true),
    mats.pcCaseMatte
  );
  lampShade.position.set(0.04, 0.33, 0.05);
  lampShade.rotation.z = -0.35;
  lampShade.rotation.x = 0.25;
  lampGroup.add(lampShade);

  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.2,
    roughness: 0.2,
  });
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), lampBulbMat);
  lampBulb.position.set(0.05, 0.295, 0.06);
  lampGroup.add(lampBulb);
  group.add(lampGroup);

  // Warm desktop light pool (illuminates the desk surface when the desk lamp turns on at night)
  const deskGlowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.58, 20), mats.floorLightPool);
  deskGlowMesh.rotation.x = -Math.PI / 2;
  deskGlowMesh.position.set(-0.34, 0.773, 0.02);
  deskGlowMesh.visible = false;
  group.add(deskGlowMesh);

  // Ergonomic Office Chair positioned in front of desk (+Z)
  const chairGroup = createErgonomicChair(mats);
  chairGroup.position.set(-0.08, 0, 0.62);
  chairGroup.rotation.y = Math.PI;
  group.add(chairGroup);

  // Ticket Alert Floating Beacon (hidden by default, shown when this sector has an active call)
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.6,
    roughness: 0.2,
  });
  const alertBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), beaconMat);
  alertBeacon.position.set(-0.08, 1.75, -0.15);
  alertBeacon.visible = false;
  group.add(alertBeacon);

  return { group, screenMat, lampBulbMat, deskGlowMesh, alertBeacon };
}

/**
 * Builds a sleek standing architectural floor lamp + warm radial floor light pool
 * that illuminates sectors and corridors during the automatic nighttime phase.
 */
export function createStandingFloorLampGroup(
  mats: OfficeMaterialLibrary,
  glowColor = 0xfbbf24
): {
  group: THREE.Group;
  bulbMat: THREE.MeshStandardMaterial;
  floorPool: THREE.Mesh;
} {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 14), mats.pcCaseMatte);
  base.position.y = 0.015;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.48, 10), mats.brushedMetal);
  pole.position.y = 0.75;
  group.add(pole);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: glowColor,
    emissiveIntensity: 2.8,
    roughness: 0.25,
  });
  const diffuser = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.34, 16), bulbMat);
  diffuser.position.y = 1.52;
  group.add(diffuser);

  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 14), mats.pcCaseMatte);
  topCap.position.y = 1.7;
  group.add(topCap);

  const floorPool = new THREE.Mesh(new THREE.CircleGeometry(2.15, 24), mats.floorLightPool);
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.y = 0.028;
  group.add(floorPool);

  return { group, bulbMat, floorPool };
}

/**
 * Builds a 6-part Ergonomic Office Chair.
 */
function createErgonomicChair(mats: OfficeMaterialLibrary): THREE.Group {
  const chair = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 5), mats.brushedMetal);
  base.position.y = 0.04;
  chair.add(base);

  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), mats.chromeMetal);
  piston.position.y = 0.24;
  chair.add(piston);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.44), mats.fabricDark);
  seat.position.y = 0.44;
  chair.add(seat);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.06), mats.fabricDark);
  backrest.position.set(0, 0.73, -0.2);
  chair.add(backrest);

  return chair;
}

/**
 * Builds a composite 7-part Multifunction Office Printer for sectors with printer calls.
 */
export function createPrinterGroup(mats: OfficeMaterialLibrary): THREE.Group {
  const printer = new THREE.Group();

  // Stand cabinet
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.55), mats.wallPaint);
  stand.position.y = 0.275;
  stand.castShadow = true;
  printer.add(stand);

  // Main printer body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.52), mats.pcCaseMatte);
  body.position.y = 0.74;
  body.castShadow = true;
  printer.add(body);

  // Top scanner lid
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.5), mats.brushedMetal);
  lid.position.y = 0.955;
  printer.add(lid);

  // Paper tray with white paper stack
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.03, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  );
  paper.position.set(0, 0.62, 0.28);
  printer.add(paper);

  return printer;
}

/**
 * Builds a composite 6-part Potted Indoor Office Plant.
 */
export function createPlantGroup(mats: OfficeMaterialLibrary): THREE.Group {
  const plant = new THREE.Group();

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.36, 12), mats.plantPot);
  pot.position.y = 0.18;
  pot.castShadow = true;
  plant.add(pot);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.55, 8), mats.darkWalnut);
  stem.position.y = 0.52;
  plant.add(stem);

  const crownPositions = [
    [0, 0.85, 0, 0.28],
    [-0.14, 0.74, 0.1, 0.21],
    [0.15, 0.76, -0.08, 0.22],
    [0.06, 0.96, 0.12, 0.19],
  ];
  for (const [cx, cy, cz, r] of crownPositions) {
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mats.plantLeaf);
    foliage.position.set(cx, cy, cz);
    foliage.castShadow = true;
    plant.add(foliage);
  }

  return plant;
}

/**
 * Builds a composite 10-part Humanoid Character (for Player IT Analyst & Sector NPCs)
 * grounded at y=0 with a soft radial contact shadow disc.
 */
export interface CharacterRig {
  group: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
}

export function createCharacterRig(config: {
  altura: number;
  corCamisa: string;
  corSecundaria?: string;
  corCalca: string;
  corCabelo: string;
  tomPele: string;
  estiloCabelo: string;
  oculos: boolean;
  isPlayer?: boolean;
  genero?: 'masculino' | 'feminino';
  estiloRoupa?: string;
  acessorioId?: string;
}): CharacterRig {
  const group = new THREE.Group();
  const bodyRoot = new THREE.Group();
  bodyRoot.scale.setScalar(config.altura);
  group.add(bodyRoot);

  const isFemale = config.genero === 'feminino';
  const secColor = config.corSecundaria || '#38bdf8';

  // 1. Contact shadow disc flush with floor
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 16),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.015;
  group.add(shadowDisc);

  const skinMat = new THREE.MeshStandardMaterial({ color: config.tomPele, roughness: 0.65 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.corCamisa, roughness: 0.7 });
  const secMat = new THREE.MeshStandardMaterial({ color: secColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: config.corCalca, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: config.corCabelo, roughness: 0.55 });

  // 2-3. Left & Right Legs
  const legGeo = new THREE.BoxGeometry(isFemale ? 0.13 : 0.14, 0.56, 0.15);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.085, 0.28, 0);
  leftLeg.castShadow = true;
  bodyRoot.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.085, 0.28, 0);
  rightLeg.castShadow = true;
  bodyRoot.add(rightLeg);

  // 4. Torso (tailored silhouette for male vs female)
  const torsoWidth = isFemale ? 0.33 : 0.37;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth, 0.52, 0.22), shirtMat);
  torso.position.set(0, 0.82, 0);
  torso.castShadow = true;
  bodyRoot.add(torso);

  if (isFemale) {
    // Subtle waist/peplum tailored flare for female analyst silhouette
    const flare = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.23), shirtMat);
    flare.position.set(0, 0.6, 0);
    bodyRoot.add(flare);
  }

  // Outfit-specific 3D details (blazer inner shirt, cyber neon stripes, lab coat panels, overclocked gold trim)
  if (config.estiloRoupa === 'blazer' || config.estiloRoupa === 'jaleco') {
    const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.23), secMat);
    innerShirt.position.set(0, 0.83, 0.005);
    bodyRoot.add(innerShirt);
    if (config.estiloRoupa === 'jaleco') {
      const coatHem = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth + 0.02, 0.2, 0.23), shirtMat);
      coatHem.position.set(0, 0.48, 0);
      bodyRoot.add(coatHem);
    }
  } else if (config.estiloRoupa === 'cyber' || config.estiloRoupa === 'overclocked') {
    const neonMat = new THREE.MeshStandardMaterial({
      color: secColor,
      emissive: secColor,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth + 0.01, 0.05, 0.23), neonMat);
    chestStripe.position.set(0, 0.92, 0);
    bodyRoot.add(chestStripe);
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.24), neonMat);
    collar.position.set(0, 1.08, 0);
    bodyRoot.add(collar);
  } else if (config.estiloRoupa === 'hoodie') {
    const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.12), secMat);
    hoodBack.position.set(0, 1.07, -0.08);
    bodyRoot.add(hoodBack);
  }

  // 5-6. Left & Right Arms
  const armGeo = new THREE.BoxGeometry(0.11, 0.46, 0.12);
  const armX = isFemale ? 0.225 : 0.245;
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-armX, 0.8, 0);
  leftArm.castShadow = true;
  bodyRoot.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(armX, 0.8, 0);
  rightArm.castShadow = true;
  bodyRoot.add(rightArm);

  // 7. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.24, 0);
  bodyRoot.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.27, 0.26), skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // 8. Eyes & Eyelashes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), eyeMat);
  leftEye.position.set(-0.055, 0.02, 0.132);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), eyeMat);
  rightEye.position.set(0.055, 0.02, 0.132);
  headGroup.add(rightEye);

  if (isFemale) {
    const lashGeo = new THREE.BoxGeometry(0.05, 0.012, 0.02);
    const lLash = new THREE.Mesh(lashGeo, eyeMat);
    lLash.position.set(-0.058, 0.042, 0.133);
    headGroup.add(lLash);
    const rLash = new THREE.Mesh(lashGeo, eyeMat);
    rLash.position.set(0.058, 0.042, 0.133);
    headGroup.add(rLash);
  }

  // 9. Hair style variation (respecting gender and NPC hair style)
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.28), hairMat);
  hairTop.position.set(0, 0.13, -0.01);
  headGroup.add(hairTop);

  if (isFemale || config.estiloCabelo === 'longo') {
    const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.1), hairMat);
    backHair.position.set(0, -0.03, -0.11);
    headGroup.add(backHair);
    const sideLocksL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.14), hairMat);
    sideLocksL.position.set(-0.13, -0.01, 0.02);
    headGroup.add(sideLocksL);
    const sideLocksR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.14), hairMat);
    sideLocksR.position.set(0.13, -0.01, 0.02);
    headGroup.add(sideLocksR);
  } else if (config.estiloCabelo === 'coque') {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
    bun.position.set(0, 0.16, -0.14);
    headGroup.add(bun);
  } else if (config.estiloCabelo === 'cacheado') {
    const curls = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), hairMat);
    curls.position.set(0, 0.1, -0.02);
    headGroup.add(curls);
  } else {
    // Stylized quiff / front fringe for male short hair
    const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.08), hairMat);
    quiff.position.set(0, 0.14, 0.11);
    headGroup.add(quiff);
  }

  // 10. Accessories (NPC glasses or Player 21 3D Accessories)
  const acc = config.acessorioId || (config.oculos ? 'oculos_smart' : '');

  if (config.isPlayer || acc === 'cracha') {
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.11, 0.02),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
      })
    );
    badge.position.set(0.08, 0.86, 0.12);
    bodyRoot.add(badge);
  }

  // ÓCULOS (Glasses & Visors)
  if (config.oculos || acc === 'oculos_smart') {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.7,
      roughness: 0.2,
    });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.05, 0.025), frameMat);
    glasses.position.set(0, 0.02, 0.138);
    headGroup.add(glasses);
  } else if (acc === 'oculos_sol_aviador') {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 });
    const darkLens = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.15, metalness: 0.6 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.025), goldMat);
    bar.position.set(0, 0.045, 0.14);
    headGroup.add(bar);
    const lLens = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.065, 0.025), darkLens);
    lLens.position.set(-0.06, 0.015, 0.138);
    headGroup.add(lLens);
    const rLens = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.065, 0.025), darkLens);
    rLens.position.set(0.06, 0.015, 0.138);
    headGroup.add(rLens);
  } else if (acc === 'oculos_pixel_retro') {
    const pixMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.03), pixMat);
    glasses.position.set(0, 0.02, 0.14);
    headGroup.add(glasses);
  } else if (acc === 'oculos_ar_visor') {
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.075, 0.04), visorMat);
    visor.position.set(0, 0.025, 0.138);
    headGroup.add(visor);
  }

  // FONES & HEADSETS
  if (
    acc === 'headset_pro' ||
    acc === 'fone_estudio_branco' ||
    acc === 'headset_rgb_gamer' ||
    acc === 'headset_gatinho'
  ) {
    const colorHex =
      acc === 'fone_estudio_branco'
        ? 0xf8fafc
        : acc === 'headset_rgb_gamer'
        ? 0xec4899
        : acc === 'headset_gatinho'
        ? 0xf472b6
        : 0x0ea5e9;
    const hsMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: acc === 'headset_rgb_gamer' || acc === 'headset_gatinho' ? colorHex : 0x000000,
      emissiveIntensity: acc === 'headset_rgb_gamer' || acc === 'headset_gatinho' ? 0.45 : 0,
      metalness: 0.5,
      roughness: 0.3,
    });
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.06), hsMat);
    band.position.set(0, 0.18, 0);
    headGroup.add(band);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.11), hsMat);
    earL.position.set(-0.155, 0.01, 0);
    headGroup.add(earL);
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.11), hsMat);
    earR.position.set(0.155, 0.01, 0);
    headGroup.add(earR);

    if (acc === 'headset_gatinho') {
      const catGeo = new THREE.ConeGeometry(0.045, 0.08, 4);
      const catL = new THREE.Mesh(catGeo, hsMat);
      catL.position.set(-0.09, 0.23, 0);
      headGroup.add(catL);
      const catR = new THREE.Mesh(catGeo, hsMat);
      catR.position.set(0.09, 0.23, 0);
      headGroup.add(catR);
    }
  }

  // BONÉS (Caps)
  if (acc === 'bone_tech' || acc === 'bone_aba_reta_preto' || acc === 'bone_para_tras') {
    const capColor =
      acc === 'bone_aba_reta_preto' ? 0x18181b : acc === 'bone_para_tras' ? 0xe11d48 : 0x0284c7;
    const visorColor =
      acc === 'bone_aba_reta_preto' ? 0xf59e0b : acc === 'bone_para_tras' ? 0xfda4af : 0x38bdf8;
    const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.5 });
    const visMat = new THREE.MeshStandardMaterial({ color: visorColor, roughness: 0.4 });
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.095, 0.29), capMat);
    crown.position.set(0, 0.16, 0);
    headGroup.add(crown);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.025, 0.14), visMat);
    visor.position.set(0, 0.125, acc === 'bone_para_tras' ? -0.18 : 0.18);
    headGroup.add(visor);
  }

  // CHAPÉUS, GORROS & CAPACETES
  if (acc === 'gorro_beanie') {
    const beanieMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.75 });
    const dome = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.13, 0.3), beanieMat);
    dome.position.set(0, 0.17, 0);
    headGroup.add(dome);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), beanieMat);
    pom.position.set(0, 0.26, 0);
    headGroup.add(pom);
  } else if (
    acc === 'chapeu_fedora' ||
    acc === 'chapeu_bucket' ||
    acc === 'chapeu_palha' ||
    acc === 'cartola_mago_ti'
  ) {
    const hatColor =
      acc === 'chapeu_fedora'
        ? 0x78350f
        : acc === 'chapeu_bucket'
        ? 0x10b981
        : acc === 'chapeu_palha'
        ? 0xfcd34d
        : 0x111827;
    const ribbonColor =
      acc === 'chapeu_fedora'
        ? 0x1e293b
        : acc === 'chapeu_bucket'
        ? 0xecfdf5
        : acc === 'chapeu_palha'
        ? 0xef4444
        : 0xf59e0b;
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.65 });
    const ribMat = new THREE.MeshStandardMaterial({ color: ribbonColor, roughness: 0.4 });

    const brimRadius = acc === 'chapeu_palha' ? 0.28 : 0.24;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(brimRadius, brimRadius + 0.02, 0.025, 16), hatMat);
    brim.position.set(0, 0.145, 0);
    headGroup.add(brim);

    const crownH = acc === 'cartola_mago_ti' ? 0.24 : 0.13;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, crownH, 16), hatMat);
    crown.position.set(0, 0.145 + crownH / 2, 0);
    headGroup.add(crown);

    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.163, 0.163, 0.03, 16), ribMat);
    ribbon.position.set(0, 0.165, 0);
    headGroup.add(ribbon);
  } else if (acc === 'capacete_obra_ti') {
    const helmMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.2 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), helmMat);
    dome.position.set(0, 0.12, 0);
    headGroup.add(dome);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.12), helmMat);
    visor.position.set(0, 0.13, 0.16);
    headGroup.add(visor);
  }

  // EXTRAS (Copo de Café, Mochila, Coroa Holográfica)
  if (acc === 'copo_cafe') {
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.12, 10), cupMat);
    cup.position.set(0, -0.22, 0.09);
    rightArm.add(cup);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.04, 0.05, 10), sleeveMat);
    sleeve.position.set(0, -0.22, 0.09);
    rightArm.add(sleeve);
  } else if (acc === 'mochila_dev') {
    const packMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.14), packMat);
    pack.position.set(0, 0.82, -0.17);
    bodyRoot.add(pack);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.02), accentMat);
    strip.position.set(0, 0.9, -0.245);
    bodyRoot.add(strip);
  } else if (acc === 'coroa_holo') {
    const holoMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.1,
      metalness: 0.8,
      roughness: 0.2,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 24), holoMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.28, 0);
    headGroup.add(halo);
  }

  return { group, headGroup, leftArm, rightArm, leftLeg, rightLeg };
}

/**
 * Adds sector-specific architectural furniture (Server racks, Reception desk, Lounge sofa, Meeting table, Storage shelves).
 */
export function createSectorAccentProp(
  sector: SectorData,
  mats: OfficeMaterialLibrary
): THREE.Group {
  const prop = new THREE.Group();

  if (sector.propType === 'servers' || sector.propType === 'network_lab') {
    // Server rack with glowing LED blades
    for (let i = 0; i < 2; i++) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.95, 0.75), mats.pcCaseMatte);
      rack.position.set((i - 0.5) * 1.1, 0.975, 0);
      rack.castShadow = true;
      prop.add(rack);

      for (let b = 0; b < 5; b++) {
        const bladeLed = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.03, 0.02),
          new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 1.4,
          })
        );
        bladeLed.position.set((i - 0.5) * 1.1, 0.45 + b * 0.28, 0.38);
        prop.add(bladeLed);
      }
    }
  } else if (sector.propType === 'lounge') {
    // Cozy sofa + coffee table
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.36, 0.68), mats.fabricDark);
    sofaSeat.position.set(-1.3, 0.22, 0.4);
    prop.add(sofaSeat);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.18), mats.fabricDark);
    sofaBack.position.set(-1.3, 0.52, 0.65);
    prop.add(sofaBack);
  } else if (sector.propType === 'storage') {
    // Metal storage shelving with hardware boxes
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.65, 0.48), mats.brushedMetal);
    shelf.position.set(-1.1, 0.825, 0);
    prop.add(shelf);
  }

  return prop;
}

/**
 * Builds the complete 3D interior room of the Cafeteria OverCoffee at (x: 2.0..8.5, z: -3.5..3.5):
 * - Custom warm bistro ceramic tile floor + entrance welcome mat
 * - Back preparation counter (stainless sink, microwave, electric oven, thermal carafes)
 * - Illuminated Wall Menu Board ("CARDÁPIO OVERCOFFEE") + upper shelves with bean canisters
 * - Slatted walnut & Carrara marble Espresso Bar Counter with brass foot rail & amber LED
 * - Dual-group Chrome Italian Espresso Machine + Commercial Coffee Grinder + POS Cash Register
 * - 2-Tier Glass Pastry Display Case with Pães de Queijo, Croissants & Chocolate Cake
 * - Tall Illuminated Commercial Glass-Door Beverage Fridge stocked with drinks
 * - Water Cooler Dispenser + Stainless Recycling Bin
 * - 3 Round Bistro Tables with 9 Bistro Chairs, Coffee Mugs, Saucers & Plates
 * - Caramel Leather Upholstered Lounge Sofa Booth + Coffee Table
 * - 3 Suspended Warm Brass Café Pendant Lamps
 */
export function createCafeteriaInteriorGroup(mats: OfficeMaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // 0. Custom Warm Bistro Ceramic Tile Floor (11.34m x 7.04m covering x: -0.42..10.92, z: -3.52..3.52)
  if (typeof document !== 'undefined') {
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tCtx = tileCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#e7ddd3';
      tCtx.fillRect(0, 0, 512, 512);
      const cells = 8;
      const cellSize = 512 / cells;
      for (let r = 0; r < cells; r++) {
        for (let c = 0; c < cells; c++) {
          const isAlt = (r + c) % 2 === 0;
          tCtx.fillStyle = isAlt ? '#f5ebe0' : '#d5bdaf';
          tCtx.fillRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4);
          tCtx.fillStyle = '#b08968';
          tCtx.fillRect(c * cellSize - 3, r * cellSize - 3, 6, 6);
        }
      }
      const tileTex = new THREE.CanvasTexture(tileCanvas);
      tileTex.wrapS = THREE.RepeatWrapping;
      tileTex.wrapT = THREE.RepeatWrapping;
      tileTex.repeat.set(6.2, 3.9);
      tileTex.colorSpace = THREE.SRGBColorSpace;

      const cafeFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(11.34, 7.04),
        new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.45, metalness: 0.05 })
      );
      cafeFloor.rotation.x = -Math.PI / 2;
      cafeFloor.position.set(5.25, 0.025, 0.0);
      cafeFloor.receiveShadow = true;
      group.add(cafeFloor);
    }
  }

  // Welcome Mat at South Entrance Doorway (x=5.25, z=3.12)
  const welcomeMat = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.018, 0.78),
    new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
  );
  welcomeMat.position.set(5.25, 0.028, 3.12);
  welcomeMat.receiveShadow = true;
  group.add(welcomeMat);

  const welcomeMatBorder = new THREE.Mesh(
    new THREE.BoxGeometry(2.18, 0.02, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
  );
  welcomeMatBorder.position.set(5.25, 0.03, 3.12);
  group.add(welcomeMatBorder);

  // Materials for Cafeteria Furniture
  const walnutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.52 });
  const darkWalnutMat = new THREE.MeshStandardMaterial({ color: 0x271206, roughness: 0.6 });
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.22, metalness: 0.08 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.18 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.78, roughness: 0.25 });
  const caramelLeatherMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.42 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.35 });
  const ceramicWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

  // 1. Back Preparation Counter against North Wall (x=3.0..7.5, z=-3.15)
  const backCounterBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.88, 0.62), darkWalnutMat);
  backCounterBase.position.set(5.25, 0.44, -3.15);
  backCounterBase.castShadow = true;
  backCounterBase.receiveShadow = true;
  group.add(backCounterBase);

  const backCounterTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 0.68), marbleMat);
  backCounterTop.position.set(5.25, 0.9, -3.15);
  backCounterTop.castShadow = true;
  group.add(backCounterTop);

  // Stainless Steel Sink & Gooseneck Faucet on Back Counter (x=3.65, z=-3.15)
  const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.44), chromeMat);
  sinkBasin.position.set(3.65, 0.92, -3.15);
  group.add(sinkBasin);
  const faucetNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 8), chromeMat);
  faucetNeck.position.set(3.65, 1.06, -3.32);
  group.add(faucetNeck);

  // Digital Microwave Oven on Back Counter (x=4.65, z=-3.15)
  const microwaveBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.32, 0.38), darkMetalMat);
  microwaveBody.position.set(4.65, 1.09, -3.15);
  microwaveBody.castShadow = true;
  group.add(microwaveBody);
  const microwaveWin = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
  );
  microwaveWin.position.set(4.59, 1.09, -2.95);
  group.add(microwaveWin);

  // Electric Toaster Oven & Thermal Coffee Carafes on Back Counter (x=5.65..6.85, z=-3.15)
  const toasterBody = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.32), chromeMat);
  toasterBody.position.set(5.65, 1.06, -3.15);
  group.add(toasterBody);

  for (let c = 0; c < 3; c++) {
    const carafe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.28, 12), chromeMat);
    carafe.position.set(6.35 + c * 0.28, 1.07, -3.15);
    group.add(carafe);
    const carafeTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: c === 0 ? 0xdc2626 : c === 1 ? 0x16a34a : 0xd97706 })
    );
    carafeTop.position.set(6.35 + c * 0.28, 1.23, -3.15);
    group.add(carafeTop);
  }

  // Illuminated Wall Menu Board mounted above Back Counter (x=5.25, y=1.55, z=-3.45)
  const menuFrame = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.62, 0.06), darkMetalMat);
  menuFrame.position.set(5.25, 1.55, -3.45);
  group.add(menuFrame);

  if (typeof document !== 'undefined') {
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 512;
    mCanvas.height = 128;
    const mCtx = mCanvas.getContext('2d');
    if (mCtx) {
      mCtx.fillStyle = '#1c1917';
      mCtx.fillRect(0, 0, 512, 128);
      mCtx.strokeStyle = '#f59e0b';
      mCtx.lineWidth = 4;
      mCtx.strokeRect(4, 4, 504, 120);
      mCtx.fillStyle = '#fbbf24';
      mCtx.font = 'bold 20px sans-serif';
      mCtx.fillText('☕ CARDÁPIO OVERCOFFEE · BALCÃO DE ENERGIA', 18, 32);
      mCtx.fillStyle = '#f8fafc';
      mCtx.font = 'bold 15px monospace';
      mCtx.fillText('• CAFÉ COADO DA CASA   • EXPRESSO DUPLO CURTO', 18, 66);
      mCtx.fillText('• CAPPUCCINO CREMOSO   • COMBO + PÃO DE QUEIJO', 18, 98);
      const mTex = new THREE.CanvasTexture(mCanvas);
      mTex.colorSpace = THREE.SRGBColorSpace;
      const menuScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(3.15, 0.54),
        new THREE.MeshBasicMaterial({ map: mTex })
      );
      menuScreen.position.set(5.25, 1.55, -3.41);
      group.add(menuScreen);
    }
  }

  // 2. Grand Main Espresso Bar Counter (centered at x=5.25, z=-1.55, width 3.85m)
  const counterBase = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.92, 0.82), walnutMat);
  counterBase.position.set(5.25, 0.46, -1.55);
  counterBase.castShadow = true;
  counterBase.receiveShadow = true;
  group.add(counterBase);

  for (let sx = 3.45; sx <= 7.05; sx += 0.18) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.82, 0.03), brassMat);
    slat.position.set(sx, 0.45, -1.13);
    group.add(slat);
  }

  const footRail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.7, 10), brassMat);
  footRail.rotation.z = Math.PI / 2;
  footRail.position.set(5.25, 0.14, -1.0);
  group.add(footRail);

  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.98, 0.08, 0.94), marbleMat);
  counterTop.position.set(5.25, 0.94, -1.55);
  counterTop.castShadow = true;
  group.add(counterTop);

  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.04, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    })
  );
  ledStrip.position.set(5.25, 0.86, -1.09);
  group.add(ledStrip);

  // 3. Dual-Group Chrome Italian Espresso Machine + Coffee Grinder + POS Cash Register
  const machineBody = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.46, 0.46), chromeMat);
  machineBody.position.set(4.05, 1.21, -1.55);
  machineBody.castShadow = true;
  group.add(machineBody);

  const machineAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.08, 0.48),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.32 })
  );
  machineAccent.position.set(4.05, 1.4, -1.55);
  group.add(machineAccent);

  for (let g = 0; g < 2; g++) {
    const pf = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), darkMetalMat);
    pf.rotation.x = Math.PI / 2;
    pf.position.set(3.88 + g * 0.34, 1.15, -1.26);
    group.add(pf);

    const cupStack = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.15, 10), ceramicWhiteMat);
    cupStack.position.set(3.88 + g * 0.34, 1.5, -1.55);
    group.add(cupStack);
  }

  // Commercial Coffee Bean Grinder next to Espresso Machine (x=4.75, z=-1.55)
  const grinderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.34, 12), darkMetalMat);
  grinderBase.position.set(4.75, 1.15, -1.55);
  group.add(grinderBase);
  const grinderHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.075, 0.24, 12),
    new THREE.MeshStandardMaterial({ color: 0x78350f, transparent: true, opacity: 0.85 })
  );
  grinderHopper.position.set(4.75, 1.4, -1.55);
  group.add(grinderHopper);

  // POS Touchscreen Register & Card Terminal (x=5.3, z=-1.42)
  const posStand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), darkMetalMat);
  posStand.position.set(5.3, 1.06, -1.42);
  group.add(posStand);
  const posScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.22, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x0284c7, emissiveIntensity: 0.6 })
  );
  posScreen.rotation.x = -0.35;
  posScreen.position.set(5.3, 1.19, -1.4);
  group.add(posScreen);

  // 4. Wide 2-Tier Glass Pastry Vitrine (Pães de Queijo, Croissants & Chocolate Cake) at x=6.35, z=-1.5
  const vitrineBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 0.5), darkMetalMat);
  vitrineBase.position.set(6.35, 1.03, -1.5);
  group.add(vitrineBase);

  const vitrineGlass = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.44, 0.48), mats.windowGlass);
  vitrineGlass.position.set(6.35, 1.29, -1.5);
  group.add(vitrineGlass);

  const vitrineShelf = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.02, 0.42), chromeMat);
  vitrineShelf.position.set(6.35, 1.27, -1.5);
  group.add(vitrineShelf);

  const pastryMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.55 });
  const croissantMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), pastryMat);
    bun.position.set(5.92 + i * 0.2, 1.13, -1.5);
    group.add(bun);

    const croissant = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.06, 0.075), croissantMat);
    croissant.position.set(5.92 + i * 0.2, 1.32, -1.5);
    group.add(croissant);
  }

  const cakeBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.11, 14),
    new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.45 })
  );
  cakeBody.position.set(6.72, 1.14, -1.5);
  group.add(cakeBody);

  // 5. TWO Tall Commercial Glass-Door Beverage Fridges / Drink Coolers (North-East Corner x=9.15 & x=10.15, z=-2.95)
  for (const fx of [9.15, 10.15]) {
    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.92, 0.74), darkMetalMat);
    fridgeBody.position.set(fx, 0.96, -2.95);
    fridgeBody.castShadow = true;
    fridgeBody.receiveShadow = true;
    group.add(fridgeBody);

    const fridgeInteriorGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 1.66, 0.58),
      new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.45,
        roughness: 0.3,
      })
    );
    fridgeInteriorGlow.position.set(fx, 0.98, -2.92);
    group.add(fridgeInteriorGlow);

    const fridgeGlassDoor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.7, 0.04), mats.windowGlass);
    fridgeGlassDoor.position.set(fx, 0.98, -2.56);
    group.add(fridgeGlassDoor);

    const canColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6];
    for (let shelf = 0; shelf < 4; shelf++) {
      const sy = 0.38 + shelf * 0.39;
      const shelfPlate = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.02, 0.54), chromeMat);
      shelfPlate.position.set(fx, sy, -2.78);
      group.add(shelfPlate);

      const canMat = new THREE.MeshStandardMaterial({
        color: canColors[shelf % canColors.length],
        metalness: 0.5,
        roughness: 0.25,
      });
      for (let c = 0; c < 4; c++) {
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.14, 8), canMat);
        can.position.set(fx - 0.24 + c * 0.16, sy + 0.08, -2.72);
        group.add(can);
      }
    }
  }

  // 6. Coffee Roasting Sideboard & Water Cooler Dispenser (North-West Corner x=0.15..1.35, z=-2.95)
  const coffeeRack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.55, 0.54), walnutMat);
  coffeeRack.position.set(0.35, 0.775, -2.95);
  coffeeRack.castShadow = true;
  group.add(coffeeRack);

  const coolerBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.96, 0.42), ceramicWhiteMat);
  coolerBase.position.set(1.18, 0.48, -2.95);
  coolerBase.castShadow = true;
  group.add(coolerBase);

  const waterGallon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.45, 14),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.15,
    })
  );
  waterGallon.position.set(1.18, 1.18, -2.95);
  group.add(waterGallon);

  // Stainless Recycling / Trash Bin near Entrance (x=0.15, z=3.05)
  const trashBin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.72, 14), chromeMat);
  trashBin.position.set(0.15, 0.36, 3.05);
  trashBin.castShadow = true;
  group.add(trashBin);

  // 7. Three Spacious Round Bistro Dining Sets with 3 Bistro Chairs each, Coffee Cups & Plates
  const bistroTables = [
    { x: 0.75, z: -0.35 },
    { x: 0.75, z: 1.75 },
    { x: 9.75, z: -0.35 },
  ];

  for (const tp of bistroTables) {
    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 16), darkMetalMat);
    baseDisc.position.set(tp.x, 0.04, tp.z);
    group.add(baseDisc);

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 12), darkMetalMat);
    ped.position.set(tp.x, 0.38, tp.z);
    group.add(ped);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 24), walnutMat);
    top.position.set(tp.x, 0.75, tp.z);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const chairAngles = [0.4, 2.3, 4.3];
    for (const ang of chairAngles) {
      const cx = tp.x + Math.cos(ang) * 0.72;
      const cz = tp.z + Math.sin(ang) * 0.72;
      const chairGroup = new THREE.Group();
      chairGroup.position.set(cx, 0, cz);
      chairGroup.rotation.y = Math.atan2(tp.x - cx, tp.z - cz);

      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 14), caramelLeatherMat);
      seat.position.set(0, 0.45, 0);
      seat.castShadow = true;
      chairGroup.add(seat);

      const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.16, 0.44, 10), darkMetalMat);
      chairStem.position.set(0, 0.22, 0);
      chairGroup.add(chairStem);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.05), walnutMat);
      backrest.position.set(0, 0.66, -0.18);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      group.add(chairGroup);
    }

    for (let m = 0; m < 2; m++) {
      const mx = tp.x + (m === 0 ? -0.19 : 0.19);
      const mz = tp.z + (m === 0 ? -0.1 : 0.12);
      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.015, 12), ceramicWhiteMat);
      saucer.position.set(mx, 0.785, mz);
      group.add(saucer);

      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.1, 12), ceramicWhiteMat);
      mug.position.set(mx, 0.835, mz);
      group.add(mug);
    }
  }

  // 8. Cozy Caramel-Leather Lounge Sofa Booth & Low Coffee Table (East-South Corner x=10.1, z=2.05)
  const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.42, 1.75), caramelLeatherMat);
  sofaSeat.position.set(10.22, 0.24, 2.05);
  sofaSeat.castShadow = true;
  sofaSeat.receiveShadow = true;
  group.add(sofaSeat);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.54, 1.75), caramelLeatherMat);
  sofaBack.position.set(10.52, 0.68, 2.05);
  sofaBack.castShadow = true;
  group.add(sofaBack);

  const sofaArmN = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.24, 0.16), walnutMat);
  sofaArmN.position.set(10.22, 0.54, 1.25);
  group.add(sofaArmN);

  const sofaArmS = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.24, 0.16), walnutMat);
  sofaArmS.position.set(10.22, 0.54, 2.85);
  group.add(sofaArmS);

  const loungeTableTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 1.05), walnutMat);
  loungeTableTop.position.set(9.45, 0.44, 2.05);
  loungeTableTop.castShadow = true;
  group.add(loungeTableTop);

  const loungeTableBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.78), darkMetalMat);
  loungeTableBase.position.set(9.45, 0.21, 2.05);
  group.add(loungeTableBase);

  // 9. Four Warm Brass Café Pendant Lamps suspended over the Espresso Bar Counter
  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
  });
  for (const lx of [3.75, 4.75, 5.75, 6.75]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 6), darkMetalMat);
    cord.position.set(lx, 2.28, -1.55);
    group.add(cord);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.22, 14), brassMat);
    shade.position.set(lx, 1.95, -1.55);
    group.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), lampGlowMat);
    bulb.position.set(lx, 1.86, -1.55);
    group.add(bulb);
  }

  return group;
}

export function buildNpcRigMap(
  npcs: NpcData[],
  scene: THREE.Scene
): Record<string, CharacterRig> {
  const map: Record<string, CharacterRig> = {};
  for (const npc of npcs) {
    const rig = createCharacterRig({
      altura: npc.altura,
      corCamisa: npc.corCamisa,
      corCalca: npc.corCalca,
      corCabelo: npc.corCabelo,
      tomPele: npc.tomPele,
      estiloCabelo: npc.estiloCabelo,
      oculos: npc.oculos,
    });
    const wp0 = npc.waypoints[0];
    rig.group.position.set(wp0.x, 0, wp0.z);
    scene.add(rig.group);
    map[npc.id] = rig;
  }
  return map;
}
