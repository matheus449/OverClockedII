import * as THREE from 'three';

export interface OfficeMaterialLibrary {
  parquetFloor: THREE.MeshStandardMaterial;
  corridorFloor: THREE.MeshStandardMaterial;
  serverFloor: THREE.MeshStandardMaterial;
  wallPaint: THREE.MeshStandardMaterial;
  wallBaseboard: THREE.MeshStandardMaterial;
  windowGlass: THREE.MeshPhysicalMaterial;
  windowFrame: THREE.MeshStandardMaterial;
  cityBackdrop: THREE.MeshBasicMaterial;
  oakWood: THREE.MeshStandardMaterial;
  darkWalnut: THREE.MeshStandardMaterial;
  brushedMetal: THREE.MeshStandardMaterial;
  chromeMetal: THREE.MeshStandardMaterial;
  pcCaseMatte: THREE.MeshStandardMaterial;
  pcGlassSide: THREE.MeshPhysicalMaterial;
  keyboardPlastic: THREE.MeshStandardMaterial;
  fabricDark: THREE.MeshStandardMaterial;
  plantLeaf: THREE.MeshStandardMaterial;
  plantPot: THREE.MeshStandardMaterial;
  trailGlow: THREE.MeshBasicMaterial;
}

/**
 * Generates a tileable realistic oak parquet wood texture + grayscale bump/roughness map
 * completely in code via HTML5 2D Canvas.
 */
function createParquetTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#8b5e3c';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const plankRows = 8;
  const plankCols = 2;
  const plankH = size / plankRows;
  const plankW = size / plankCols;

  const tones = ['#9c6b43', '#8f5f38', '#a4744b', '#845632', '#96663e', '#ab7b52'];

  for (let r = 0; r < plankRows; r++) {
    const offset = (r % 2) * (plankW * 0.5);
    for (let c = -1; c <= plankCols; c++) {
      const x = c * plankW + offset;
      const y = r * plankH;
      const tone = tones[(r * 3 + c + 10) % tones.length];

      ctx.fillStyle = tone;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Wood grain veins
      ctx.strokeStyle = 'rgba(62, 36, 18, 0.16)';
      ctx.lineWidth = 1.2;
      for (let g = 0; g < 6; g++) {
        const gy = y + ((g + 0.5) / 6) * plankH;
        ctx.beginPath();
        ctx.moveTo(x + 2, gy);
        ctx.bezierCurveTo(
          x + plankW * 0.33,
          gy + ((g % 2 === 0 ? 1 : -1) * 3),
          x + plankW * 0.66,
          gy - ((g % 2 === 0 ? 1 : -1) * 3),
          x + plankW - 2,
          gy
        );
        ctx.stroke();
      }

      // Bump seams
      bCtx.strokeStyle = '#303030';
      bCtx.lineWidth = 2;
      bCtx.strokeRect(x + 1, y + 1, plankW - 2, plankH - 2);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(14, 10);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(14, 10);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Generates an exterior daytime cityscape & sky panorama texture for the glass window vistas.
 */
function createCityVistaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.55, '#bae6fd');
  skyGrad.addColorStop(1, '#fef3c7');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // Distant skyscraper silhouettes
  const buildingColors = ['#64748b', '#475569', '#334155', '#1e293b'];
  for (let i = 0; i < 42; i++) {
    const bw = 18 + ((i * 17) % 34);
    const bh = 55 + ((i * 29) % 130);
    const bx = (i * 25) % 1024;
    const by = 256 - bh;
    ctx.fillStyle = buildingColors[i % buildingColors.length];
    ctx.fillRect(bx, by, bw, bh);

    // Subtle sunlit window rows
    ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
    for (let wy = by + 8; wy < 248; wy += 10) {
      for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
        ctx.fillRect(wx, wy, 3, 5);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createOfficeMaterials(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
): OfficeMaterialLibrary {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const parquet = createParquetTextures(maxAniso);
  const cityTex = createCityVistaTexture();

  return {
    parquetFloor: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: parquet.map,
      bumpMap: parquet.bumpMap,
      bumpScale: 0.015,
      roughness: 0.36,
      metalness: 0.05,
    }),
    corridorFloor: new THREE.MeshStandardMaterial({
      color: 0xf3e5d8,
      map: parquet.map,
      bumpMap: parquet.bumpMap,
      bumpScale: 0.01,
      roughness: 0.28,
      metalness: 0.08,
    }),
    serverFloor: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.32,
      metalness: 0.35,
    }),
    wallPaint: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.78,
      metalness: 0.02,
    }),
    wallBaseboard: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.2,
    }),
    windowGlass: new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.06,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 0.92,
      ior: 1.52,
      reflectivity: 0.9,
      depthWrite: false,
    }),
    windowFrame: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.25,
      metalness: 0.82,
    }),
    cityBackdrop: new THREE.MeshBasicMaterial({
      map: cityTex,
      side: THREE.DoubleSide,
    }),
    oakWood: new THREE.MeshStandardMaterial({
      color: 0xc89b6e,
      roughness: 0.42,
      metalness: 0.04,
    }),
    darkWalnut: new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.38,
      metalness: 0.06,
    }),
    brushedMetal: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.28,
      metalness: 0.85,
    }),
    chromeMetal: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.14,
      metalness: 0.92,
    }),
    pcCaseMatte: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.55,
      metalness: 0.35,
    }),
    pcGlassSide: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
    keyboardPlastic: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.65,
      metalness: 0.12,
    }),
    fabricDark: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.88,
      metalness: 0.02,
    }),
    plantLeaf: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.52,
      metalness: 0.02,
    }),
    plantPot: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.08,
    }),
    trailGlow: new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  };
}
