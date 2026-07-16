import * as THREE from 'three';

let cached: THREE.CanvasTexture | null = null;

/** Soft filled heart sprite for cheek / clash FX. */
export function getHeartTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2 + 6;
  const s = size * 0.38;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx, cy, cx - s, cy - s * 0.15, cx - s, cy - s * 0.55);
  ctx.bezierCurveTo(cx - s, cy - s * 1.05, cx, cy - s * 0.85, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx, cy - s * 0.85, cx + s, cy - s * 1.05, cx + s, cy - s * 0.55);
  ctx.bezierCurveTo(cx + s, cy - s * 0.15, cx, cy, cx, cy + s * 0.35);
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy - 10, 4, cx, cy, s * 1.2);
  grad.addColorStop(0, '#FFB4D0');
  grad.addColorStop(0.55, '#FF6B9D');
  grad.addColorStop(1, '#E0457A');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();

  cached = new THREE.CanvasTexture(canvas);
  cached.colorSpace = THREE.SRGBColorSpace;
  cached.needsUpdate = true;
  return cached;
}
