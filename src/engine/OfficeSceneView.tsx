import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ALL_NPCS,
  ALL_SECTORS,
  ProblemData,
} from '../problems/validator';
import { createOfficeMaterials } from '../world/materials';
import {
  buildNpcRigMap,
  CharacterRig,
  createCafeteriaInteriorGroup,
  createCharacterRig,
  createPlantGroup,
  createPrinterGroup,
  createSectorAccentProp,
  createWorkstationGroup,
} from '../world/models';
import {
  buildWorldColliders,
  findNearestInteractable,
  isPlayerNearCafeteria,
  NearbyInteraction,
  resolvePlayerMovement,
} from '../player/collision';
import { computeFloorTrail, findContainingSector, Vec2 } from '../pathfinding/trail';
import { initNpcRuntimeStates, updateNpcsFrame } from '../npcs/npcController';
import { soundEngine } from '../audio/soundEngine';
import {
  ALL_OUTFITS,
  DEFAULT_CUSTOMIZATION,
  PlayerCustomization,
} from '../progression/progressionSystem';
import {
  CAFETERIA_NPCS,
  CAFETERIA_SPACE,
  CafeteriaNpc,
  findNearestCafeteriaNpc,
} from '../cafeteria/cafeteriaSystem';
import {
  clampTapTargetToOfficeBounds,
  clearAllTouchDirections,
  computeMovementVector,
  computePinchZoom,
  getActiveTouchDirections,
  registerTouchInteractHandler,
} from '../player/touchControls';

export interface OfficeSceneProps {
  gameState: 'title' | 'loading' | 'story' | 'playing' | 'paused' | 'gameover';
  activeProblem: ProblemData | null;
  queuedSectorIds?: string[];
  playerCustomization?: PlayerCustomization;
  nightShift?: boolean;
  autoWalkTarget: Vec2 | null;
  onClearAutoWalk: () => void;
  onTapFloorWalk?: (target: Vec2) => void;
  onNearbyChange: (
    nearby: NearbyInteraction | null,
    currentSectorName: string,
    nearCafeteria: boolean,
    nearbyCafeteriaNpc: CafeteriaNpc | null
  ) => void;
  onInteractRequest: (nearby: NearbyInteraction) => void;
  onOpenCafeteriaRequest?: () => void;
  onTalkToCafeteriaNpcRequest?: (npc: CafeteriaNpc) => void;
  npcEmotionOverride: { npcId: string; emotion: 'neutral' | 'waiting' | 'satisfied' | 'annoyed' } | null;
  cameraZoom: number;
  onWheelZoom?: (deltaZoom: number) => void;
  onSetZoom?: (nextZoom: number) => void;
}

const MAX_TRAIL_NODES = 80;

export const OfficeSceneView: React.FC<OfficeSceneProps> = ({
  gameState,
  activeProblem,
  queuedSectorIds = [],
  playerCustomization = DEFAULT_CUSTOMIZATION,
  nightShift = false,
  autoWalkTarget,
  onClearAutoWalk,
  onTapFloorWalk,
  onNearbyChange,
  onInteractRequest,
  onOpenCafeteriaRequest,
  onTalkToCafeteriaNpcRequest,
  npcEmotionOverride,
  cameraZoom,
  onWheelZoom,
  onSetZoom,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const emotionFloatingRef = useRef<HTMLDivElement | null>(null);

  const propsRef = useRef({
    gameState,
    activeProblem,
    queuedSectorIds,
    playerCustomization,
    nightShift,
    autoWalkTarget,
    onClearAutoWalk,
    onTapFloorWalk,
    onNearbyChange,
    onInteractRequest,
    onOpenCafeteriaRequest,
    onTalkToCafeteriaNpcRequest,
    npcEmotionOverride,
    cameraZoom,
    onWheelZoom,
    onSetZoom,
  });
  useEffect(() => {
    propsRef.current = {
      gameState,
      activeProblem,
      queuedSectorIds,
      playerCustomization,
      nightShift,
      autoWalkTarget,
      onClearAutoWalk,
      onTapFloorWalk,
      onNearbyChange,
      onInteractRequest,
      onOpenCafeteriaRequest,
      onTalkToCafeteriaNpcRequest,
      npcEmotionOverride,
      cameraZoom,
      onWheelZoom,
      onSetZoom,
    };
  }, [
    gameState,
    activeProblem,
    queuedSectorIds,
    playerCustomization,
    nightShift,
    autoWalkTarget,
    onClearAutoWalk,
    onTapFloorWalk,
    onNearbyChange,
    onInteractRequest,
    onOpenCafeteriaRequest,
    onTalkToCafeteriaNpcRequest,
    npcEmotionOverride,
    cameraZoom,
    onWheelZoom,
    onSetZoom,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per threejs skill
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe);
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.0045);

    // 2. Studio PBR Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Isometric 2.5D Perspective Camera
    const aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
    const camera = new THREE.PerspectiveCamera(34, aspect, 0.5, 220);
    camera.position.set(10, 18.5, 19.5);
    camera.lookAt(0, 0.5, 2);

    // 4. Balanced Warm Sunlight Key Light + Cool Hemisphere Fill (Zero redundant ceiling PointLights for 60fps PBR)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x92400e, 1.32);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.88);
    dirLight.position.set(18, 32, 20);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 85;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    // 5. Build Office Floor (54m x 36m), Avenues, Background North/West Glass Windows, and 15 Sectors
    const mats = createOfficeMaterials(renderer, isSoftwareGl);

    const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(54, 36.5), mats.parquetFloor);
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.position.y = 0;
    mainFloor.receiveShadow = true;
    scene.add(mainFloor);

    // North Avenue (z = -5.5) and South Avenue (z = +5.5) runners (offset +0.02m on Y)
    for (const aveZ of [-5.5, 5.5]) {
      const aveFloor = new THREE.Mesh(new THREE.PlaneGeometry(52.5, 3.8), mats.corridorFloor);
      aveFloor.rotation.x = -Math.PI / 2;
      aveFloor.position.set(0, 0.02, aveZ);
      aveFloor.receiveShadow = true;
      scene.add(aveFloor);
    }

    // 4 North-South Cross Avenues (x = -17.0, -1.85, +12.25, +19.6) connecting North & South Avenues
    for (const crossX of [-17.0, -1.85, 12.25, 19.6]) {
      const crossFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 11.0), mats.corridorFloor);
      crossFloor.rotation.x = -Math.PI / 2;
      crossFloor.position.set(crossX, 0.022, 0);
      crossFloor.receiveShadow = true;
      scene.add(crossFloor);
    }

    // Exterior Cityscape Backdrop & Panoramic Glass Window ONLY on the North (-Z) background horizon
    // (Never on the camera-facing South +Z side, so nothing ever blocks the isometric camera!)
    const northCity = new THREE.Mesh(new THREE.PlaneGeometry(68, 12), mats.cityBackdrop);
    northCity.position.set(0, 4.2, -21.5);
    scene.add(northCity);

    const northGlass = new THREE.Mesh(new THREE.BoxGeometry(53.0, 2.3, 0.06), mats.windowGlass);
    northGlass.position.set(0, 1.35, -18.0);
    northGlass.renderOrder = 2;
    scene.add(northGlass);

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(53.2, 0.14, 0.16), mats.windowFrame);
    topRail.position.set(0, 2.52, -18.0);
    scene.add(topRail);

    for (let mx = -26; mx <= 26; mx += 5.2) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.55, 0.14), mats.windowFrame);
      mullion.position.set(mx, 1.3, -18.0);
      scene.add(mullion);
    }

    // Build interior partition walls with generous 3.1m doorways from collider segments
    // Low-cut cutaway walls (1.12m tall) so the isometric camera has 100% visibility into every room!
    const colliders = buildWorldColliders(ALL_SECTORS);
    for (const seg of colliders.walls) {
      // Skip outer North wall where the panoramic glass window sits, and keep South/East outer edge as low architectural curbing
      if (Math.abs(seg.z1 - -18.0) < 0.15 && Math.abs(seg.z2 - -18.0) < 0.15) continue;

      const isSouthOrEastOuter =
        (Math.abs(seg.z1 - 18.0) < 0.15 && Math.abs(seg.z2 - 18.0) < 0.15) ||
        (Math.abs(seg.x1 - 26.5) < 0.15 && Math.abs(seg.x2 - 26.5) < 0.15);

      const length = Math.hypot(seg.x2 - seg.x1, seg.z2 - seg.z1);
      if (length < 0.1) continue;
      const midX = (seg.x1 + seg.x2) * 0.5;
      const midZ = (seg.z1 + seg.z2) * 0.5;
      const angle = Math.atan2(seg.z2 - seg.z1, seg.x2 - seg.x1);

      const wallHeight = isSouthOrEastOuter ? 0.42 : 1.12;
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(length, wallHeight, 0.14), mats.wallPaint);
      wallMesh.position.set(midX, wallHeight * 0.5, midZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      scene.add(wallMesh);

      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(length + 0.02, 0.1, 0.17), mats.wallBaseboard);
      baseMesh.position.set(midX, 0.05, midZ);
      baseMesh.rotation.y = -angle;
      scene.add(baseMesh);
    }

    // Build Workstations, Printers, Plants, and Sector Plaques
    const sectorBeacons: Record<string, THREE.Mesh> = {};

    for (const sector of ALL_SECTORS) {
      if (sector.id === 'servidores' || sector.id === 'redes') {
        const sFloor = new THREE.Mesh(
          new THREE.PlaneGeometry(sector.bounds.w - 0.2, sector.bounds.d - 0.2),
          mats.serverFloor
        );
        sFloor.rotation.x = -Math.PI / 2;
        sFloor.position.set(
          sector.bounds.x + sector.bounds.w * 0.5,
          0.025,
          sector.bounds.z + sector.bounds.d * 0.5
        );
        scene.add(sFloor);
      }

      const ws = createWorkstationGroup(mats, sector.cor);
      ws.group.position.set(sector.pcPos.x, 0, sector.pcPos.z);
      ws.group.rotation.y = sector.pcPos.rotY;
      scene.add(ws.group);
      sectorBeacons[sector.id] = ws.alertBeacon;

      // Architectural Sector Sign Plaque above each workstation
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 256;
      plaqueCanvas.height = 64;
      const pCtx = plaqueCanvas.getContext('2d')!;
      pCtx.fillStyle = '#0f172a';
      pCtx.fillRect(0, 0, 256, 64);
      pCtx.strokeStyle = sector.cor;
      pCtx.lineWidth = 6;
      pCtx.strokeRect(3, 3, 250, 58);
      pCtx.fillStyle = '#f8fafc';
      pCtx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(sector.nome.toUpperCase(), 128, 34);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      plaqueTex.colorSpace = THREE.SRGBColorSpace;
      const plaqueMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.55, 0.38),
        new THREE.MeshBasicMaterial({ map: plaqueTex, side: THREE.DoubleSide })
      );
      plaqueMesh.position.set(sector.pcPos.x, 1.55, sector.pcPos.z);
      scene.add(plaqueMesh);

      if (sector.hasPrinter && sector.printerPos) {
        const printer = createPrinterGroup(mats);
        printer.position.set(sector.printerPos.x, 0, sector.printerPos.z);
        scene.add(printer);
      }

      const plant = createPlantGroup(mats);
      plant.position.set(sector.bounds.x + 0.9, 0, sector.bounds.z + 0.9);
      scene.add(plant);

      const accent = createSectorAccentProp(sector, mats);
      accent.position.set(
        sector.bounds.x + sector.bounds.w * 0.5,
        0,
        sector.bounds.z + sector.bounds.d * 0.5
      );
      scene.add(accent);
    }

    // 5B. Build 3D Cafeteria OverCoffee Interior, Warm Café Lighting, Sign Plaque, Plant, and 4 Cafeteria NPCs
    const cafeteriaInterior = createCafeteriaInteriorGroup(mats);
    scene.add(cafeteriaInterior);

    const cafeWarmLight = new THREE.PointLight(0xfbbf24, 1.45, 14.5, 1.4);
    cafeWarmLight.position.set(5.25, 2.4, -0.4);
    scene.add(cafeWarmLight);

    const cafePlant = createPlantGroup(mats);
    cafePlant.position.set(0.25, 0, -1.75);
    scene.add(cafePlant);

    const cafePlant2 = createPlantGroup(mats);
    cafePlant2.position.set(10.25, 0, -1.75);
    scene.add(cafePlant2);

    const cafeSignCanvas = document.createElement('canvas');
    cafeSignCanvas.width = 320;
    cafeSignCanvas.height = 68;
    const cCtx = cafeSignCanvas.getContext('2d')!;
    cCtx.fillStyle = '#1c1917';
    cCtx.fillRect(0, 0, 320, 68);
    cCtx.strokeStyle = '#f59e0b';
    cCtx.lineWidth = 6;
    cCtx.strokeRect(3, 3, 314, 62);
    cCtx.fillStyle = '#fef3c7';
    cCtx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';
    cCtx.fillText('☕ CAFETERIA OVERCOFFEE', 160, 36);
    const cafeSignTex = new THREE.CanvasTexture(cafeSignCanvas);
    cafeSignTex.colorSpace = THREE.SRGBColorSpace;
    const cafeSignMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.95, 0.42),
      new THREE.MeshBasicMaterial({ map: cafeSignTex, side: THREE.DoubleSide })
    );
    cafeSignMesh.position.set(5.25, 1.72, 3.48);
    scene.add(cafeSignMesh);

    const cafeteriaNpcRigs: { rig: CharacterRig; baseRotY: number; pos: Vec2 }[] = [];
    for (const cNpc of CAFETERIA_NPCS) {
      const cRig = createCharacterRig({
        altura: cNpc.altura,
        corCamisa: cNpc.corCamisa,
        corSecundaria: '#f8fafc',
        corCalca: cNpc.corCalca,
        corCabelo: cNpc.corCabelo,
        tomPele: cNpc.tomPele,
        estiloCabelo: cNpc.estiloCabelo,
        oculos: Boolean(cNpc.oculos),
        genero: cNpc.genero,
        estiloRoupa: cNpc.id === 'npc_barista_leo' ? 'jaqueta' : 'social',
      });
      cRig.group.position.set(cNpc.pos.x, 0, cNpc.pos.z);
      cRig.group.rotation.y = cNpc.rotY;
      scene.add(cRig.group);
      cafeteriaNpcRigs.push({ rig: cRig, baseRotY: cNpc.rotY, pos: cNpc.pos });
    }

    // 6. Luminous Floor Path Trail (InstancedMesh of glowing discs along the floor)
    const trailGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.035, 16);
    const trailInstanced = new THREE.InstancedMesh(trailGeo, mats.trailGlow, MAX_TRAIL_NODES);
    trailInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    trailInstanced.frustumCulled = false;
    scene.add(trailInstanced);

    // 7. Create Player (IT Analyst) at open South Central Avenue (0, 5.5) & 15 Sector NPCs
    const buildPlayerFromCustomization = (cust: PlayerCustomization) => {
      const outfit = ALL_OUTFITS.find((o) => o.id === cust.roupaId) || ALL_OUTFITS[0];
      return createCharacterRig({
        altura: cust.genero === 'feminino' ? 0.99 : 1.03,
        corCamisa: outfit.corCamisa,
        corSecundaria: outfit.corSecundaria,
        corCalca: outfit.corCalca,
        corCabelo: cust.corCabelo,
        tomPele: cust.tomPele,
        estiloCabelo: cust.genero === 'feminino' ? 'longo' : 'curto',
        oculos: cust.acessorioId === 'oculos_smart',
        isPlayer: true,
        genero: cust.genero,
        estiloRoupa: outfit.estilo,
        acessorioId: cust.acessorioId,
      });
    };

    let currentCustKey = JSON.stringify(propsRef.current.playerCustomization);
    let playerRig = buildPlayerFromCustomization(propsRef.current.playerCustomization);
    const playerPos: Vec2 = { x: 0, z: 5.5 };
    let playerRotY = 0;
    playerRig.group.position.set(playerPos.x, 0, playerPos.z);
    scene.add(playerRig.group);

    // Company Manager: Helena Vasconcelos (Gerente Geral de Operações)
    const managerRig = createCharacterRig({
      altura: 1.01,
      corCamisa: '#7c2d12',
      corSecundaria: '#f8fafc',
      corCalca: '#0f172a',
      corCabelo: '#451a03',
      tomPele: '#e0ac69',
      estiloCabelo: 'longo',
      oculos: true,
      genero: 'feminino',
      estiloRoupa: 'blazer',
      acessorioId: 'oculos_smart',
    });
    managerRig.group.position.set(1.45, 0, 5.1);
    managerRig.group.rotation.y = -Math.PI * 0.38;
    scene.add(managerRig.group);

    const npcRigs = buildNpcRigMap(ALL_NPCS, scene);
    const npcStates = initNpcRuntimeStates(ALL_NPCS);

    // Pre-warm shaders on GPU and draw initial frame immediately
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    renderer.render(scene, camera);

    // 8. Input Listeners (WASD/Arrows + Mobile Touch D-Pad + Tap-to-Walk + Pinch/Wheel Zoom)
    const keysHeld = new Set<string>();
    let stepDistanceAccum = 0;

    const executeContextualInteract = () => {
      if (propsRef.current.gameState !== 'playing') return;
      if (isPlayerNearCafeteria(playerPos)) {
        const nearCafeNpc = findNearestCafeteriaNpc(playerPos);
        if (nearCafeNpc && nearCafeNpc.npc.id !== 'npc_barista_leo') {
          propsRef.current.onTalkToCafeteriaNpcRequest?.(nearCafeNpc.npc);
        } else {
          propsRef.current.onOpenCafeteriaRequest?.();
        }
        return;
      }
      const livePositions: Record<string, Vec2> = {};
      for (const k of Object.keys(npcStates)) {
        livePositions[k] = npcStates[k].pos;
      }
      const nearby = findNearestInteractable(
        playerPos,
        ALL_SECTORS,
        ALL_NPCS,
        propsRef.current.activeProblem,
        livePositions
      );
      if (nearby) {
        propsRef.current.onInteractRequest(nearby);
      }
    };

    registerTouchInteractHandler(executeContextualInteract);

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (propsRef.current.gameState !== 'playing') return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (
        code === 'KeyW' ||
        code === 'KeyS' ||
        code === 'KeyA' ||
        code === 'KeyD' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      ) {
        keysHeld.add(code);
        if (propsRef.current.autoWalkTarget) {
          propsRef.current.onClearAutoWalk();
        }
      }

      if ((code === 'KeyE' || code === 'Space') && !e.repeat) {
        e.preventDefault();
        executeContextualInteract();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.code);
    };

    const onBlur = () => {
      keysHeld.clear();
      clearAllTouchDirections();
    };

    const onWheel = (e: WheelEvent) => {
      if (propsRef.current.gameState !== 'playing') return;
      if (propsRef.current.onWheelZoom) {
        propsRef.current.onWheelZoom(e.deltaY > 0 ? 0.18 : -0.18);
      }
    };

    // Tap-to-Walk on the 3D Office Floor (works on both Mobile touch and PC click)
    const floorRaycaster = new THREE.Raycaster();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const floorHitVec = new THREE.Vector3();
    const ndcPointer = new THREE.Vector2();
    let pointerDownPos: { x: number; y: number; time: number } | null = null;
    let activePinchDist = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (propsRef.current.gameState !== 'playing') return;
      if (e.button !== undefined && e.button !== 0) return;
      pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (propsRef.current.gameState !== 'playing' || !pointerDownPos) return;
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const elapsed = performance.now() - pointerDownPos.time;
      pointerDownPos = null;

      // Ignore long drags or multi-touch pinch gestures
      if (moveDist > 14 || elapsed > 550 || activePinchDist > 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ndcPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      floorRaycaster.setFromCamera(ndcPointer, camera);
      const hit = floorRaycaster.ray.intersectPlane(floorPlane, floorHitVec);
      if (hit) {
        const target = clampTapTargetToOfficeBounds({ x: hit.x, z: hit.z });
        propsRef.current.onTapFloorWalk?.(target);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        activePinchDist = Math.hypot(dx, dy);
        pointerDownPos = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (propsRef.current.gameState !== 'playing') return;
      if (e.touches.length === 2 && activePinchDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const nextDist = Math.hypot(dx, dy);
        const nextZoom = computePinchZoom(
          propsRef.current.cameraZoom,
          activePinchDist,
          nextDist
        );
        activePinchDist = nextDist;
        propsRef.current.onSetZoom?.(nextZoom);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        activePinchDist = 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointerup', onPointerUp, { passive: true });
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    const _dummyMatrix = new THREE.Matrix4();
    const _dummyPos = new THREE.Vector3();
    const _dummyScale = new THREE.Vector3();
    const _dummyQuat = new THREE.Quaternion();
    const _camTargetPos = new THREE.Vector3();
    const _camLookAt = new THREE.Vector3(0, 0, 5.5);
    const _projVec = new THREE.Vector3();

    const allSectorsWithCafe = [...ALL_SECTORS, CAFETERIA_SPACE];
    const livePositionsCache: Record<string, Vec2> = {};
    let lastTrailPlayerX = -999;
    let lastTrailPlayerZ = -999;
    let lastTrailTargetKey = '';
    let lastNearbySignature = '';

    let lastTime = performance.now();
    let elapsedTime = 0;
    let hudSyncTimer = 0;
    let frameId = 0;
    let currentTrailWaypoints: Vec2[] = [];
    let autoWalkIdx = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function getCustKey(c: PlayerCustomization): string {
      return `${c.genero}|${c.tomPele}|${c.corCabelo}|${c.roupaId}|${c.acessorioId}`;
    }
    currentCustKey = getCustKey(propsRef.current.playerCustomization);

    function tick() {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const {
        gameState: currentState,
        activeProblem: curProb,
        queuedSectorIds: curQueuedSectors,
        playerCustomization: curCust,
        nightShift: curNightShift,
        autoWalkTarget: curAutoTarget,
        npcEmotionOverride: curEmotion,
        cameraZoom: curZoom,
      } = propsRef.current;

      // Dynamically transition 3D Office Atmosphere between Daytime and Plantão Noturno (Night Shift)
      const isNight = Boolean(curNightShift);
      const bgTargetHex = isNight ? 0x050816 : 0xdbeafe;
      if ((scene.background as THREE.Color).getHex() !== bgTargetHex) {
        (scene.background as THREE.Color).setHex(bgTargetHex);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(bgTargetHex);
          scene.fog.density = isNight ? 0.0068 : 0.0045;
        }
        hemiLight.color.setHex(isNight ? 0x38bdf8 : 0xe0f2fe);
        hemiLight.groundColor.setHex(isNight ? 0x0f172a : 0x92400e);
        hemiLight.intensity = isNight ? 0.65 : 1.32;
        dirLight.color.setHex(isNight ? 0x818cf8 : 0xfff4e0);
        dirLight.intensity = isNight ? 0.88 : 1.88;
        renderer.toneMappingExposure = isNight ? 0.82 : 1.08;
      }

      // Hot-swap 3D Player Character Rig if customization changed
      const nextCustKey = getCustKey(curCust);
      if (nextCustKey !== currentCustKey) {
        currentCustKey = nextCustKey;
        scene.remove(playerRig.group);
        playerRig = buildPlayerFromCustomization(curCust);
        playerRig.group.position.set(playerPos.x, 0, playerPos.z);
        playerRig.group.rotation.y = playerRotY;
        scene.add(playerRig.group);
      }

      if (curEmotion && npcStates[curEmotion.npcId]) {
        npcStates[curEmotion.npcId].emotion = curEmotion.emotion;
        npcStates[curEmotion.npcId].emotionTimer = 4.0;
      }

      if (currentState !== 'paused') {
        elapsedTime += dt;
      }

      // Manager Helena Vasconcelos is only present during the intro/storytelling and disappears once the game starts
      managerRig.group.visible =
        currentState === 'title' || currentState === 'loading' || currentState === 'story';

      // A. Title & Loading Screen Live Camera Tour over the 3D Isometric Office
      if (currentState === 'title' || currentState === 'loading') {
        const tourAngle = elapsedTime * 0.16;
        const tourX = Math.sin(tourAngle) * 14;
        const tourZ = Math.cos(tourAngle) * 5;
        camera.position.set(tourX + 8, 19.5, tourZ + 19.5);
        camera.lookAt(tourX * 0.45, 0.5, tourZ * 0.35);

        updateNpcsFrame(npcStates, npcRigs, playerPos, null, dt, elapsedTime);
      } else if (currentState === 'story') {
        // Storytelling Intro: Camera frames Manager Helena Vasconcelos welcoming the Player
        camera.position.set(4.5, 6.8, 11.4);
        camera.lookAt(-0.4, 0.9, 5.2);
        playerRig.group.rotation.y = Math.PI * 0.42;
        managerRig.rightArm.rotation.x = -Math.PI * 0.55 + Math.sin(elapsedTime * 5.5) * 0.22;
        managerRig.headGroup.rotation.y = Math.sin(elapsedTime * 2.2) * 0.12;
        updateNpcsFrame(npcStates, npcRigs, playerPos, null, dt, elapsedTime);
      } else if (currentState === 'playing') {
        // B. Player Movement (WASD / Arrows / 360° Mobile Analog Joystick or Auto-Walk along Trail)
        const touchHeld = getActiveTouchDirections();
        const { moveX, moveZ } = computeMovementVector(keysHeld, touchHeld);
        if ((moveX !== 0 || moveZ !== 0) && curAutoTarget) {
          propsRef.current.onClearAutoWalk();
        }

        const speed = 6.2;
        if (moveX !== 0 || moveZ !== 0) {
          const len = Math.hypot(moveX, moveZ);
          const analogScale = Math.min(1, len);
          const dx = (moveX / len) * analogScale * speed * dt;
          const dz = (moveZ / len) * analogScale * speed * dt;
          const next = resolvePlayerMovement(playerPos, { x: dx, z: dz }, colliders);
          const movedDist = Math.hypot(next.x - playerPos.x, next.z - playerPos.z);
          playerPos.x = next.x;
          playerPos.z = next.z;

          if (movedDist > 0.0005) {
            const targetAngle = Math.atan2(dx, dz);
            let diff = targetAngle - playerRotY;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            playerRotY += diff * (1 - Math.exp(-14 * dt));

            stepDistanceAccum += movedDist;
            if (stepDistanceAccum > 1.35) {
              stepDistanceAccum = 0;
              soundEngine.playFootstep();
            }
            const swingAmp = 0.48 * Math.max(0.45, analogScale);
            const swing = Math.sin(elapsedTime * 11) * swingAmp;
            playerRig.leftLeg.rotation.x = swing;
            playerRig.rightLeg.rotation.x = -swing;
            playerRig.leftArm.rotation.x = -swing * 0.7;
            playerRig.rightArm.rotation.x = swing * 0.7;
          }
        } else if (curAutoTarget && currentTrailWaypoints.length > 1) {
          if (autoWalkIdx >= currentTrailWaypoints.length) {
            autoWalkIdx = currentTrailWaypoints.length - 1;
          }
          const wp = currentTrailWaypoints[autoWalkIdx];
          const dx = wp.x - playerPos.x;
          const dz = wp.z - playerPos.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.4) {
            if (autoWalkIdx < currentTrailWaypoints.length - 1) {
              autoWalkIdx++;
            } else {
              propsRef.current.onClearAutoWalk();
            }
          } else {
            const step = Math.min(dist, speed * 1.2 * dt);
            const next = resolvePlayerMovement(
              playerPos,
              { x: (dx / dist) * step, z: (dz / dist) * step },
              colliders
            );
            playerPos.x = next.x;
            playerPos.z = next.z;
            playerRotY = Math.atan2(dx, dz);
            const swing = Math.sin(elapsedTime * 12) * 0.48;
            playerRig.leftLeg.rotation.x = swing;
            playerRig.rightLeg.rotation.x = -swing;
            playerRig.leftArm.rotation.x = -swing * 0.7;
            playerRig.rightArm.rotation.x = swing * 0.7;
          }
        } else {
          playerRig.leftLeg.rotation.x = THREE.MathUtils.damp(playerRig.leftLeg.rotation.x, 0, 10, dt);
          playerRig.rightLeg.rotation.x = THREE.MathUtils.damp(playerRig.rightLeg.rotation.x, 0, 10, dt);
          playerRig.leftArm.rotation.x = THREE.MathUtils.damp(playerRig.leftArm.rotation.x, 0, 10, dt);
          playerRig.rightArm.rotation.x = THREE.MathUtils.damp(playerRig.rightArm.rotation.x, 0, 10, dt);
        }

        playerRig.group.position.set(playerPos.x, 0, playerPos.z);
        playerRig.group.rotation.y = playerRotY;

        // C. Smooth Exponential Camera Damping (supports Full Map Overview when curZoom >= 1.9)
        const zoomFactor = curZoom || 1.0;
        const isFullMap = zoomFactor >= 1.9;
        if (isFullMap) {
          // Full Map Overview: centered over (0, 0) high enough to see all 15 sectors at once!
          _camTargetPos.set(0, 56, 38);
          const camAlpha = 1 - Math.exp(-12.0 * dt);
          camera.position.lerp(_camTargetPos, camAlpha);
          _camLookAt.lerp(_dummyPos.set(0, 0, -1), camAlpha);
          camera.lookAt(_camLookAt);
        } else {
          _camTargetPos.set(
            playerPos.x + 6.5 * zoomFactor,
            15.5 * zoomFactor,
            playerPos.z + 13.5 * zoomFactor
          );
          const camAlpha = 1 - Math.exp(-7.5 * dt);
          camera.position.lerp(_camTargetPos, camAlpha);
          _camLookAt.lerp(_dummyPos.set(playerPos.x, 0.65, playerPos.z), camAlpha);
          camera.lookAt(_camLookAt);
        }

        // D. Update NPCs & Cafeteria NPCs
        updateNpcsFrame(
          npcStates,
          npcRigs,
          playerPos,
          curProb ? curProb.setor : null,
          dt,
          elapsedTime
        );

        const nearCafeteriaNow = isPlayerNearCafeteria(playerPos);
        cafeteriaNpcRigs.forEach((item, idx) => {
          const wave = Math.sin(elapsedTime * 2.6 + idx * 1.4);
          item.rig.headGroup.rotation.y = wave * 0.14;
          item.rig.rightArm.rotation.x = nearCafeteriaNow
            ? -0.35 + Math.sin(elapsedTime * 4.5 + idx) * 0.15
            : wave * 0.08;
          if (nearCafeteriaNow) {
            const lookAng = Math.atan2(playerPos.x - item.pos.x, playerPos.z - item.pos.z);
            item.rig.group.rotation.y = THREE.MathUtils.damp(
              item.rig.group.rotation.y,
              lookAng,
              6,
              dt
            );
          } else {
            item.rig.group.rotation.y = THREE.MathUtils.damp(
              item.rig.group.rotation.y,
              item.baseRotY,
              4,
              dt
            );
          }
        });

        // E. Update Luminous Floor Trail & Active Workstation Beacons (including Rush Hour queued sectors)
        const targetSector = curProb
          ? ALL_SECTORS.find((s) => s.id === curProb.setor) || null
          : null;

        for (const sId of Object.keys(sectorBeacons)) {
          const isTarget =
            targetSector?.id === sId || Boolean(curQueuedSectors && curQueuedSectors.includes(sId));
          const beacon = sectorBeacons[sId];
          beacon.visible = isTarget;
          if (isTarget) {
            beacon.rotation.y = elapsedTime * 2.4;
            beacon.position.y = 1.9 + Math.sin(elapsedTime * 4) * 0.08;
          }
        }

        if (curAutoTarget) {
          const trailKey = `auto:${curAutoTarget.x.toFixed(2)},${curAutoTarget.z.toFixed(2)}`;
          const movedSq =
            (playerPos.x - lastTrailPlayerX) ** 2 + (playerPos.z - lastTrailPlayerZ) ** 2;
          if (trailKey !== lastTrailTargetKey || movedSq > 0.04) {
            lastTrailTargetKey = trailKey;
            lastTrailPlayerX = playerPos.x;
            lastTrailPlayerZ = playerPos.z;
            const autoSec =
              findContainingSector(curAutoTarget, allSectorsWithCafe) ||
              targetSector ||
              CAFETERIA_SPACE;
            currentTrailWaypoints = computeFloorTrail(
              playerPos,
              autoSec,
              allSectorsWithCafe,
              curAutoTarget
            );
          }
          const count = Math.min(currentTrailWaypoints.length, MAX_TRAIL_NODES);
          trailInstanced.count = count;
          for (let i = 0; i < count; i++) {
            const pt = currentTrailWaypoints[i];
            const waveScale = 0.82 + 0.22 * Math.sin(elapsedTime * 5 - i * 0.45);
            _dummyPos.set(pt.x, 0.035, pt.z);
            _dummyScale.set(waveScale, 1, waveScale);
            _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
            trailInstanced.setMatrixAt(i, _dummyMatrix);
          }
          trailInstanced.instanceMatrix.needsUpdate = true;
        } else if (targetSector) {
          const trailKey = `sec:${targetSector.id}`;
          const movedSq =
            (playerPos.x - lastTrailPlayerX) ** 2 + (playerPos.z - lastTrailPlayerZ) ** 2;
          if (trailKey !== lastTrailTargetKey || movedSq > 0.04) {
            lastTrailTargetKey = trailKey;
            lastTrailPlayerX = playerPos.x;
            lastTrailPlayerZ = playerPos.z;
            currentTrailWaypoints = computeFloorTrail(playerPos, targetSector, ALL_SECTORS);
          }
          const count = Math.min(currentTrailWaypoints.length, MAX_TRAIL_NODES);
          trailInstanced.count = count;

          for (let i = 0; i < count; i++) {
            const pt = currentTrailWaypoints[i];
            const waveScale = 0.82 + 0.22 * Math.sin(elapsedTime * 5 - i * 0.45);
            _dummyPos.set(pt.x, 0.035, pt.z);
            _dummyScale.set(waveScale, 1, waveScale);
            _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
            trailInstanced.setMatrixAt(i, _dummyMatrix);
          }
          trailInstanced.instanceMatrix.needsUpdate = true;
        } else {
          trailInstanced.count = 0;
          currentTrailWaypoints = [];
          lastTrailTargetKey = '';
          autoWalkIdx = 0;
        }

        // F. Throttled HUD & Proximity Sync (<= 8Hz, deduplicated so React only re-renders on actual state change)
        hudSyncTimer += dt;
        if (hudSyncTimer >= 0.12) {
          hudSyncTimer = 0;
          for (const k of Object.keys(npcStates)) {
            livePositionsCache[k] = npcStates[k].pos;
          }
          const nearby = findNearestInteractable(
            playerPos,
            ALL_SECTORS,
            ALL_NPCS,
            curProb,
            livePositionsCache
          );
          const currentSec = findContainingSector(playerPos, allSectorsWithCafe);
          const nearCafeNpc = nearCafeteriaNow ? findNearestCafeteriaNpc(playerPos) : null;
          const resolvedSectorName = nearCafeteriaNow
            ? 'Cafeteria OverCoffee'
            : currentSec
            ? currentSec.nome
            : 'Corredor Principal';

          const nextSignature = `${nearby?.npc.id || ''}|${nearby?.sector.id || ''}|${
            nearby?.isTicketTarget ? '1' : '0'
          }|${resolvedSectorName}|${nearCafeteriaNow ? '1' : '0'}|${
            nearCafeNpc?.npc.id || ''
          }`;

          if (nextSignature !== lastNearbySignature) {
            lastNearbySignature = nextSignature;
            propsRef.current.onNearbyChange(
              nearby,
              resolvedSectorName,
              nearCafeteriaNow,
              nearCafeNpc ? nearCafeNpc.npc : null
            );
          }

          if (emotionFloatingRef.current) {
            const activeNpcId = nearby?.npc.id || curProb?.npc;
            const st = activeNpcId ? npcStates[activeNpcId] : null;
            if (st && st.emotion !== 'neutral') {
              _projVec.set(st.pos.x, 2.25, st.pos.z);
              _projVec.project(camera);
              if (_projVec.z >= -1 && _projVec.z <= 1) {
                const w = container?.clientWidth || window.innerWidth;
                const h = container?.clientHeight || window.innerHeight;
                const sx = (_projVec.x * 0.5 + 0.5) * w;
                const sy = (-_projVec.y * 0.5 + 0.5) * h;
                emotionFloatingRef.current.style.transform = `translate3d(${Math.round(sx)}px, ${Math.round(sy)}px, 0)`;
                emotionFloatingRef.current.style.opacity = '1';
                emotionFloatingRef.current.textContent =
                  st.emotion === 'satisfied'
                    ? '😊 Resolvido!'
                    : st.emotion === 'annoyed'
                      ? '😟 Ops, tente outra etapa'
                      : '💬 Precisa de suporte';
              } else {
                emotionFloatingRef.current.style.opacity = '0';
              }
            } else {
              emotionFloatingRef.current.style.opacity = '0';
            }
          }
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      registerTouchInteractHandler(null);
      clearAllTouchDirections();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d1117] touch-none">
      <div
        ref={mountRef}
        data-testid="office-3d-canvas"
        className="w-full h-full touch-none"
      />
      {nightShift && (
        <div
          data-testid="night-shift-atmosphere-overlay"
          className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,rgba(15,23,42,0.12)_0%,rgba(2,6,23,0.52)_100%)]"
        />
      )}
      <div
        ref={emotionFloatingRef}
        style={{ opacity: 0, transform: 'translate3d(-999px, -999px, 0)' }}
        className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-md bg-[#0f172a] border border-slate-700 text-xs font-medium text-slate-100 shadow-lg transition-opacity duration-150 z-10 whitespace-nowrap"
      />
    </div>
  );
};
