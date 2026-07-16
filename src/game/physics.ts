import {
  BOUNCE,
  FRICTION,
  FROG_RADIUS,
  MAX_SPEED,
} from './constants';
import type { FrogBody } from './types';

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function length(x: number, y: number) {
  return Math.hypot(x, y);
}

export function normalize(x: number, y: number): [number, number] {
  const len = length(x, y);
  if (len < 0.0001) return [0, 0];
  return [x / len, y / len];
}

export function createFrog(
  id: FrogBody['id'],
  x: number,
  y: number,
  facing: number,
): FrogBody {
  return {
    id,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: FROG_RADIUS,
    mass: 1,
    facing,
    charge: 0,
    charging: false,
    cooldown: 0,
    squish: 0,
    hurtFlash: 0,
    dashTrail: 0,
    style: 0,
    superReady: false,
    twerk: 0,
  };
}

function limitSpeed(frog: FrogBody) {
  const speed = length(frog.vx, frog.vy);
  if (speed > MAX_SPEED) {
    const s = MAX_SPEED / speed;
    frog.vx *= s;
    frog.vy *= s;
  }
}

export function addStyle(frog: FrogBody, amount: number) {
  frog.style = clamp(frog.style + amount, 0, 1);
  frog.superReady = frog.style >= 0.999;
}

export function consumeSuper(frog: FrogBody) {
  frog.style = 0;
  frog.superReady = false;
}

export function applyDash(
  frog: FrogBody,
  dirX: number,
  dirY: number,
  charge: number,
  power: number,
) {
  const [nx, ny] = normalize(dirX, dirY);
  if (nx === 0 && ny === 0) return;
  frog.vx += nx * charge * power;
  frog.vy += ny * charge * power;
  frog.facing = Math.atan2(ny, nx);
  frog.squish = 0.78;
  frog.charge = 0;
  frog.charging = false;
  frog.dashTrail = 0.5 + charge * 0.4;
  limitSpeed(frog);
}

export function integrateFrog(frog: FrogBody, dt: number) {
  frog.x += frog.vx * dt;
  frog.y += frog.vy * dt;
  frog.vx *= Math.pow(FRICTION, dt * 60);
  frog.vy *= Math.pow(FRICTION, dt * 60);

  if (length(frog.vx, frog.vy) > 0.35) {
    frog.facing = Math.atan2(frog.vy, frog.vx);
  }

  frog.cooldown = Math.max(0, frog.cooldown - dt);
  frog.squish = Math.max(0, frog.squish - dt * 2.4);
  frog.hurtFlash = Math.max(0, frog.hurtFlash - dt * 3.5);
  frog.dashTrail = Math.max(0, frog.dashTrail - dt);

  const speed = length(frog.vx, frog.vy);
  const targetTwerk = frog.charging
    ? 0.55 + frog.charge * 0.45
    : frog.superReady
      ? 0.4
      : Math.min(0.65, speed * 0.09 + frog.dashTrail * 0.35);
  frog.twerk += (targetTwerk - frog.twerk) * Math.min(1, dt * 8);
}

export function resolveCollision(a: FrogBody, b: FrogBody): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = length(dx, dy);
  const minDist = a.radius + b.radius;

  if (dist === 0 || dist >= minDist) return 0;

  const [nx, ny] = normalize(dx, dy);
  const overlap = minDist - dist;
  const totalMass = a.mass + b.mass;
  a.x -= (nx * overlap * b.mass) / totalMass;
  a.y -= (ny * overlap * b.mass) / totalMass;
  b.x += (nx * overlap * a.mass) / totalMass;
  b.y += (ny * overlap * a.mass) / totalMass;

  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal > 0) return 0;

  const impulse = (-(1 + BOUNCE) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
  a.vx -= (impulse * nx) / a.mass;
  a.vy -= (impulse * ny) / a.mass;
  b.vx += (impulse * nx) / b.mass;
  b.vy += (impulse * ny) / b.mass;

  const impact = Math.abs(impulse);
  a.squish = Math.min(0.95, a.squish + impact * 0.14);
  b.squish = Math.min(0.95, b.squish + impact * 0.14);
  a.hurtFlash = Math.min(1, impact * 0.22);
  b.hurtFlash = Math.min(1, impact * 0.22);
  a.dashTrail = Math.max(a.dashTrail, 0.2);
  b.dashTrail = Math.max(b.dashTrail, 0.2);

  return impact;
}

export function isOutsideRing(
  frog: FrogBody,
  cx: number,
  cy: number,
  ringRadius: number,
) {
  const d = length(frog.x - cx, frog.y - cy);
  return d > ringRadius - frog.radius * 0.25;
}

/** Both dashing into each other within a short window = perfect clash. */
export function isPerfectClash(a: FrogBody, b: FrogBody) {
  const aDash = a.dashTrail > 0.15;
  const bDash = b.dashTrail > 0.15;
  const closing =
    (b.x - a.x) * (a.vx - b.vx) + (b.y - a.y) * (a.vy - b.vy) > 0;
  return aDash && bDash && closing;
}
