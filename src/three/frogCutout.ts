import * as THREE from 'three';

// Higher-res rain-frog butt shots (real photos)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const playerPhoto = require('../../assets/refs/frog4b.jpg'); // clean white-bg cheeks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rivalPhoto = require('../../assets/refs/frog3b.jpg'); // gravel cheeks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rivalAlt = require('../../assets/refs/frog1b.jpg');

function resolveAssetUrl(mod: unknown): string {
  if (typeof mod === 'string') return mod;
  if (mod && typeof mod === 'object') {
    const o = mod as { default?: string; uri?: string };
    if (typeof o.default === 'string') return o.default;
    if (o.uri) return o.uri;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Asset } = require('expo-asset');
    const asset = Asset.fromModule(mod as number);
    return asset.uri || asset.localUri || '';
  } catch {
    return '';
  }
}

export const FROG_PHOTOS = {
  player: resolveAssetUrl(playerPhoto),
  rival: resolveAssetUrl(rivalPhoto),
  rivalAlt: resolveAssetUrl(rivalAlt),
};

export type FrogCutout = {
  map: THREE.CanvasTexture;
  aspect: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function bgScore(r: number, g: number, b: number) {
  const bright = (r + g + b) / 3;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  // White / light gray studio or sink porcelain
  if (bright > 232 && chroma < 22) return 1;
  if (bright > 210 && chroma < 14) return 0.85;
  if (bright > 198 && chroma < 10) return 0.55;
  return 0;
}

/**
 * Real frog photo → clean transparent cutout (the character IS the photo).
 */
export async function createFrogCutout(
  url: string,
  opts: { tint?: 'none' | 'cool'; mode?: 'white' | 'ellipse' } = {},
): Promise<FrogCutout> {
  const img = await loadImage(url);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const scale = srcW < 700 ? 2.5 : srcW < 1200 ? 1.5 : 1;
  const w = Math.max(2, Math.round(srcW * scale));
  const h = Math.max(2, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;
  const keep = new Float32Array(w * h);
  const mode = opts.mode ?? 'white';

  if (mode === 'ellipse') {
    const cx = w * 0.5;
    const cy = h * 0.52;
    const rx = w * 0.4;
    const ry = h * 0.46;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        const ell = nx * nx + ny * ny;
        keep[p] = ell >= 1 ? 0 : ell > 0.78 ? 1 - (ell - 0.78) / 0.22 : 1;
      }
    }
  } else {
    for (let p = 0, i = 0; p < keep.length; p++, i += 4) {
      keep[p] = 1 - bgScore(d[i], d[i + 1], d[i + 2]);
    }
  }

  if (opts.tint === 'cool') {
    for (let p = 0, i = 0; p < keep.length; p++, i += 4) {
      if (keep[p] > 0.2) {
        d[i] = Math.round(d[i] * 0.88);
        d[i + 2] = Math.min(255, Math.round(d[i + 2] * 1.12 + 12));
      }
    }
  }

  // Smooth feather
  const soft = new Float32Array(keep);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      let sum = 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          sum += soft[(y + oy) * w + (x + ox)];
        }
      }
      keep[p] = sum / 9;
    }
  }

  for (let p = 0, i = 3; p < keep.length; p++, i += 4) {
    d[i] = Math.round(Math.min(1, Math.max(0, keep[p])) * 255);
  }

  // RGB despill on edges (kills dark/light fringe)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const a = d[p * 4 + 3] / 255;
      if (a <= 0.05 || a >= 0.98) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const q = (y + oy) * w + (x + ox);
          if (d[q * 4 + 3] > 200) {
            r += d[q * 4];
            g += d[q * 4 + 1];
            b += d[q * 4 + 2];
            n++;
          }
        }
      }
      if (n > 0) {
        const i = p * 4;
        d[i] = Math.round(d[i] * a + (r / n) * (1 - a));
        d[i + 1] = Math.round(d[i + 1] * a + (g / n) * (1 - a));
        d[i + 2] = Math.round(d[i + 2] * a + (b / n) * (1 - a));
      }
    }
  }

  // Tight crop to opaque pixels
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 18) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) {
    minX = 0;
    minY = 0;
    maxX = w - 1;
    maxY = h - 1;
  }

  const pad = Math.round(Math.max(w, h) * 0.02);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  ctx.putImageData(image, 0, 0);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d')!;
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);

  const map = new THREE.CanvasTexture(out);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.generateMipmaps = true;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.premultiplyAlpha = false;
  map.needsUpdate = true;

  return { map, aspect: cw / Math.max(1, ch) };
}
