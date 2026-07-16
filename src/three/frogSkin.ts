import * as THREE from 'three';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const frog4 = require('../../assets/refs/frog4.jpg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const frog3 = require('../../assets/refs/frog3.jpg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const frog1 = require('../../assets/refs/frog1.jpg');

function resolveAssetUrl(mod: unknown): string {
  if (typeof mod === 'string') return mod;
  if (mod && typeof mod === 'object') {
    const o = mod as { uri?: string; default?: string };
    if (typeof o.default === 'string') return o.default;
    if (o.uri) return o.uri;
  }
  try {
    // Expo web / RN often expose Asset.fromModule for numeric ids
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Asset } = require('expo-asset');
    const asset = Asset.fromModule(mod as number);
    return asset.uri || asset.localUri || '';
  } catch {
    return '';
  }
}

export const FROG_PHOTO_URLS = {
  player: resolveAssetUrl(frog4),
  playerAlt: resolveAssetUrl(frog3),
  detail: resolveAssetUrl(frog1),
};

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * noise2(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** High-res desert-rain-frog mottling (sand/tan/umber + white grit). */
export function createProceduralFrogMaps(
  size = 1024,
  tint: 'warm' | 'cool' = 'warm',
) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);

  const base =
    tint === 'warm'
      ? ([140, 105, 62] as [number, number, number])
      : ([120, 100, 88] as [number, number, number]);
  const dark =
    tint === 'warm'
      ? ([72, 48, 28] as [number, number, number])
      : ([58, 48, 42] as [number, number, number]);
  const light =
    tint === 'warm'
      ? ([210, 180, 120] as [number, number, number])
      : ([190, 175, 155] as [number, number, number]);
  const speck = [235, 225, 205] as [number, number, number];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n1 = fbm(u * 6, v * 6);
      const n2 = fbm(u * 14 + 3.1, v * 14 - 1.7);
      const n3 = fbm(u * 40, v * 40);
      let col = lerpColor(base, dark, Math.pow(n1, 1.35));
      col = lerpColor(col, light, Math.pow(Math.max(0, n2 - 0.35), 1.2) * 0.85);
      if (n3 > 0.72) {
        const flash = (n3 - 0.72) / 0.28;
        col = lerpColor(col, speck, flash * 0.85);
      }
      const mid = Math.exp(-Math.pow((u - 0.5) * 18, 2)) * 0.12;
      col = lerpColor(col, light, mid);

      const i = (y * size + x) * 4;
      img.data[i] = col[0];
      img.data[i + 1] = col[1];
      img.data[i + 2] = col[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d')!;
  const rough = rctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const lum = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
    const wart = fbm(((i / 4) % size) / size * 50, Math.floor(i / 4 / size) / size * 50);
    const rv = Math.min(255, 140 + (255 - lum) * 0.25 + wart * 50);
    rough.data[i] = rough.data[i + 1] = rough.data[i + 2] = rv;
    rough.data[i + 3] = 255;
  }
  rctx.putImageData(rough, 0, 0);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;

  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const nctx = normCanvas.getContext('2d')!;
  const norm = nctx.createImageData(size, size);
  const heightAt = (x: number, y: number) => {
    const u = x / size;
    const v = y / size;
    return fbm(u * 28, v * 28) * 0.75 + fbm(u * 70, v * 70) * 0.25;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hL = heightAt(x - 1, y);
      const hR = heightAt(x + 1, y);
      const hD = heightAt(x, y - 1);
      const hU = heightAt(x, y + 1);
      const dx = (hL - hR) * 2.8;
      const dy = (hD - hU) * 2.8;
      const dz = 1;
      const len = Math.hypot(dx, dy, dz) || 1;
      const i = (y * size + x) * 4;
      norm.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      norm.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      norm.data[i + 2] = ((dz / len) * 0.5 + 0.5) * 255;
      norm.data[i + 3] = 255;
    }
  }
  nctx.putImageData(norm, 0, 0);
  const normalMap = new THREE.CanvasTexture(normCanvas);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap, normalMap };
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Merge photo rear with procedural wrap so the 3D frog stays photoreal from every angle. */
export async function createPhotoBasedFrogMaps(
  photoUrl: string,
  tint: 'warm' | 'cool' = 'warm',
  size = 1024,
) {
  const procedural = createProceduralFrogMaps(size, tint);
  if (typeof document === 'undefined' || !photoUrl) return procedural;

  try {
    const photo = await loadImage(photoUrl);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      (procedural.map as THREE.CanvasTexture).image as CanvasImageSource,
      0,
      0,
      size,
      size,
    );

    const pad = size * 0.04;
    ctx.drawImage(photo, pad, pad, size - pad * 2, size - pad * 2);

    const data = ctx.getImageData(0, 0, size, size);
    const procCanvas = document.createElement('canvas');
    procCanvas.width = size;
    procCanvas.height = size;
    const pctx = procCanvas.getContext('2d')!;
    pctx.drawImage(
      (procedural.map as THREE.CanvasTexture).image as CanvasImageSource,
      0,
      0,
    );
    const pdata = pctx.getImageData(0, 0, size, size);

    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      const bright = (r + g + b) / 3;
      const whiteish =
        bright > 210 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
      const edge = whiteish ? 1 : Math.max(0, (bright - 185) / 50);
      if (edge > 0.05) {
        data.data[i] = r * (1 - edge) + pdata.data[i] * edge;
        data.data[i + 1] = g * (1 - edge) + pdata.data[i + 1] * edge;
        data.data[i + 2] = b * (1 - edge) + pdata.data[i + 2] * edge;
      }
      if (tint === 'cool') {
        data.data[i] = data.data[i] * 0.92;
        data.data[i + 2] = Math.min(255, data.data[i + 2] * 1.08 + 8);
      }
    }
    ctx.putImageData(data, 0, 0);

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.needsUpdate = true;

    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const nctx = normCanvas.getContext('2d')!;
    const norm = nctx.createImageData(size, size);
    const lum = (x: number, y: number) => {
      const xx = Math.max(0, Math.min(size - 1, x));
      const yy = Math.max(0, Math.min(size - 1, y));
      const i = (yy * size + xx) * 4;
      return (data.data[i] + data.data[i + 1] + data.data[i + 2]) / (3 * 255);
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (lum(x - 1, y) - lum(x + 1, y)) * 3.4;
        const dy = (lum(x, y - 1) - lum(x, y + 1)) * 3.4;
        const dz = 1;
        const len = Math.hypot(dx, dy, dz) || 1;
        const i = (y * size + x) * 4;
        norm.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
        norm.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
        norm.data[i + 2] = ((dz / len) * 0.5 + 0.5) * 255;
        norm.data[i + 3] = 255;
      }
    }
    nctx.putImageData(norm, 0, 0);
    const normalMap = new THREE.CanvasTexture(normCanvas);
    normalMap.needsUpdate = true;

    return {
      map,
      roughnessMap: procedural.roughnessMap,
      normalMap,
    };
  } catch {
    return procedural;
  }
}
