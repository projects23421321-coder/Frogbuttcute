import * as THREE from 'three';

/* eslint-disable @typescript-eslint/no-require-imports */
const photos = {
  peaches: require('../../assets/refs/frog5.jpg'),
  gravelina: require('../../assets/refs/frog6.jpg'),
  sinko: require('../../assets/refs/frog7.jpg'),
  marmalade: require('../../assets/refs/frog4b.jpg'),
  pebble: require('../../assets/refs/frog3b.jpg'),
  blobbo: require('../../assets/refs/frog1b.jpg'),
  sandy: require('../../assets/refs/frog4b.jpg'),
  dusk: require('../../assets/refs/frog21.jpg'),
  grump: require('../../assets/refs/frog17.jpg'),
  potato: require('../../assets/refs/frog15.jpg'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

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

export type PhotoKey = keyof typeof photos;

export const FROG_PHOTOS: Record<PhotoKey, string> = Object.fromEntries(
  Object.entries(photos).map(([k, v]) => [k, resolveAssetUrl(v)]),
) as Record<PhotoKey, string>;

/** RN Image sources for select screen */
export const FROG_PHOTO_MODULES = photos;

export type FrogCutout = {
  map: THREE.CanvasTexture;
  aspect: number;
  /** Sampled lower-cheek skin color for 3D bubble meshes */
  cheekColor: string;
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
  if (bright > 232 && chroma < 22) return 1;
  if (bright > 210 && chroma < 14) return 0.85;
  if (bright > 198 && chroma < 10) return 0.55;
  return 0;
}

/**
 * Cut out frog + amend: warm blush boost on lower cheeks (bubble-butt zone).
 */
export async function createFrogCutout(
  url: string,
  opts: {
    tint?: 'none' | 'cool' | 'warm' | 'pink' | 'gold';
    mode?: 'white' | 'ellipse';
    cheekBoost?: boolean;
  } = {},
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

  // Tint + cheek blush amend (lower third gets peachy warmth)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (keep[p] < 0.15) continue;
      const i = p * 4;
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (opts.tint === 'cool') {
        r = Math.round(r * 0.88);
        b = Math.min(255, Math.round(b * 1.12 + 12));
      } else if (opts.tint === 'warm') {
        r = Math.min(255, Math.round(r * 1.08 + 8));
        g = Math.round(g * 0.98);
        b = Math.round(b * 0.9);
      } else if (opts.tint === 'pink') {
        r = Math.min(255, Math.round(r * 1.05 + 18));
        g = Math.round(g * 0.92);
        b = Math.min(255, Math.round(b * 1.05 + 10));
      } else if (opts.tint === 'gold') {
        r = Math.min(255, Math.round(r * 1.1 + 12));
        g = Math.min(255, Math.round(g * 1.05 + 6));
        b = Math.round(b * 0.85);
      }

      if (opts.cheekBoost !== false) {
        const lower = Math.max(0, (y / h - 0.45) / 0.55);
        const centerX = 1 - Math.abs(x / w - 0.5) * 1.6;
        const cheek = lower * Math.max(0, centerX) * 0.22;
        r = Math.min(255, Math.round(r + cheek * 55));
        g = Math.min(255, Math.round(g + cheek * 18));
        b = Math.min(255, Math.round(b + cheek * 28));
      }

      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  }

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

  // Despill
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

  // Sample cheek skin from lower-center opaque pixels (pre-crop coords)
  let cr = 0;
  let cg = 0;
  let cb = 0;
  let cn = 0;
  const sampleY0 = Math.floor(minY + (maxY - minY) * 0.55);
  const sampleY1 = maxY;
  const sampleX0 = Math.floor(minX + (maxX - minX) * 0.28);
  const sampleX1 = Math.floor(minX + (maxX - minX) * 0.72);
  for (let y = sampleY0; y <= sampleY1; y += 2) {
    for (let x = sampleX0; x <= sampleX1; x += 2) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 120) continue;
      cr += d[i];
      cg += d[i + 1];
      cb += d[i + 2];
      cn++;
    }
  }
  if (cn === 0) {
    cr = 210;
    cg = 170;
    cb = 150;
    cn = 1;
  }
  // Push toward peachy blush for bubble-butt read
  cr = Math.min(255, Math.round(cr / cn + 28));
  cg = Math.min(255, Math.round(cg / cn + 8));
  cb = Math.min(255, Math.round(cb / cn + 18));
  const cheekColor = `rgb(${cr},${cg},${cb})`;

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

  return { map, aspect: cw / Math.max(1, ch), cheekColor };
}
