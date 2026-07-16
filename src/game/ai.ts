import {
  AI_THINK_MAX,
  AI_THINK_MIN,
  CHARGE_RATE,
  DASH_POWER,
  MIN_CHARGE,
  POST_DASH_COOLDOWN,
  STYLE_PER_DASH,
  SUPER_DASH_POWER,
} from './constants';
import { addStyle, applyDash, consumeSuper, length, normalize } from './physics';
import type { FrogBody } from './types';

export type AiBrain = {
  thinkTimer: number;
  targetCharge: number;
  aimX: number;
  aimY: number;
  winding: boolean;
};

export function createAiBrain(): AiBrain {
  return {
    thinkTimer: 0.35,
    targetCharge: 0.6,
    aimX: 0,
    aimY: 1,
    winding: false,
  };
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function updateAi(
  brain: AiBrain,
  rival: FrogBody,
  player: FrogBody,
  ringCx: number,
  ringCy: number,
  ringRadius: number,
  dt: number,
) {
  if (rival.cooldown > 0) {
    rival.charging = false;
    rival.charge = 0;
    brain.winding = false;
    return;
  }

  brain.thinkTimer -= dt;

  if (!brain.winding && brain.thinkTimer <= 0) {
    const toPlayerX = player.x - rival.x;
    const toPlayerY = player.y - rival.y;
    const [towardX, towardY] = normalize(toPlayerX, toPlayerY);

    const playerFromCenterX = player.x - ringCx;
    const playerFromCenterY = player.y - ringCy;
    const edgeDist = length(playerFromCenterX, playerFromCenterY);
    const edgeFactor = clamp01(edgeDist / ringRadius);
    const [outX, outY] = normalize(playerFromCenterX, playerFromCenterY);

    const mix = 0.55 + edgeFactor * 0.35;
    const [aimX, aimY] = normalize(
      towardX * (1 - mix * 0.4) + outX * mix,
      towardY * (1 - mix * 0.4) + outY * mix,
    );

    brain.aimX = aimX;
    brain.aimY = aimY;
    brain.targetCharge = rival.superReady ? rand(0.7, 1) : rand(0.4, 0.95);
    brain.winding = true;
    rival.charging = true;
    rival.charge = 0;
  }

  if (brain.winding) {
    rival.charging = true;
    rival.charge = Math.min(1, rival.charge + CHARGE_RATE * dt);
    rival.facing = Math.atan2(brain.aimY, brain.aimX);

    if (rival.charge >= brain.targetCharge) {
      if (rival.charge >= MIN_CHARGE) {
        const useSuper =
          rival.superReady && rival.charge > 0.6 && Math.random() > 0.35;
        const power =
          (useSuper ? SUPER_DASH_POWER : DASH_POWER) *
          (0.85 + Math.random() * 0.2);
        applyDash(rival, brain.aimX, brain.aimY, rival.charge, power);
        rival.cooldown = POST_DASH_COOLDOWN;
        addStyle(rival, STYLE_PER_DASH);
        if (useSuper) consumeSuper(rival);
      }
      brain.winding = false;
      brain.thinkTimer = rand(AI_THINK_MIN, AI_THINK_MAX);
      rival.charging = false;
      rival.charge = 0;
    }
  }
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
