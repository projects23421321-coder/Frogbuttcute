import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChargePad } from '../components/ChargePad';
import { createAiBrain, updateAi, type AiBrain } from '../game/ai';
import {
  CHARGE_RATE,
  DASH_POWER,
  IMPACT_SHAKE_THRESHOLD,
  MIN_CHARGE,
  POST_DASH_COOLDOWN,
  RING_RADIUS,
  ROUND_WINS_NEEDED,
} from '../game/constants';
import {
  applyDash,
  createFrog,
  integrateFrog,
  isOutsideRing,
  length,
  normalize,
  resolveCollision,
} from '../game/physics';
import type { FrogBody, ImpactBurst, MatchPhase, Side } from '../game/types';
import { pickClashLabel } from '../three/ButtFX';
import { GameCanvas } from '../three/GameCanvas';
import { colors, fonts } from '../theme';

type Props = {
  onExit: () => void;
};

type Floater = { id: number; text: string };

export function GameScreen({ onExit }: Props) {
  const insets = useSafeAreaInsets();
  const cx = 0;
  const cy = 0;

  const [phase, setPhase] = useState<MatchPhase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [playerRounds, setPlayerRounds] = useState(0);
  const [rivalRounds, setRivalRounds] = useState(0);
  const [message, setMessage] = useState('Butts ready');
  const [shake, setShake] = useState(0);
  const [impacts, setImpacts] = useState<ImpactBurst[]>([]);
  const [floater, setFloater] = useState<Floater | null>(null);
  const [aim, setAim] = useState<{ x: number; y: number }>({ x: 0, y: -1 });
  const [, setTick] = useState(0);

  const playerRef = useRef<FrogBody>(
    createFrog('player', 0, RING_RADIUS * 0.42, -Math.PI / 2),
  );
  const rivalRef = useRef<FrogBody>(
    createFrog('rival', 0, -RING_RADIUS * 0.42, Math.PI / 2),
  );
  const aimRef = useRef({ x: 0, y: -1 });
  const aiRef = useRef<AiBrain>(createAiBrain());
  const phaseRef = useRef<MatchPhase>('countdown');
  const roundLock = useRef(false);
  const lastTs = useRef<number | null>(null);
  const impactId = useRef(0);
  const floaterId = useRef(0);

  const showFloater = useCallback((text: string) => {
    const id = ++floaterId.current;
    setFloater({ id, text });
    setTimeout(() => {
      setFloater((f) => (f?.id === id ? null : f));
    }, 900);
  }, []);

  const resetPositions = useCallback(() => {
    playerRef.current = createFrog(
      'player',
      0,
      RING_RADIUS * 0.42,
      -Math.PI / 2,
    );
    rivalRef.current = createFrog(
      'rival',
      0,
      -RING_RADIUS * 0.42,
      Math.PI / 2,
    );
    aiRef.current = createAiBrain();
    aimRef.current = { x: 0, y: -1 };
    setAim({ x: 0, y: -1 });
    roundLock.current = false;
    setImpacts([]);
  }, []);

  const startCountdown = useCallback(
    (label: string) => {
      setMessage(label);
      setCountdown(3);
      setPhase('countdown');
      phaseRef.current = 'countdown';
      resetPositions();
    },
    [resetPositions],
  );

  useEffect(() => {
    startCountdown('Round 1 — cheek to cheek');
  }, [startCountdown]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('fighting');
      phaseRef.current = 'fighting';
      setMessage('BUTT BUMP!');
      showFloater('GO CHEEKS GO!');
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(id);
  }, [phase, countdown, showFloater]);

  const endRound = useCallback(
    (winner: Side) => {
      if (roundLock.current) return;
      roundLock.current = true;

      const nextPlayer = winner === 'player' ? playerRounds + 1 : playerRounds;
      const nextRival = winner === 'rival' ? rivalRounds + 1 : rivalRounds;
      setPlayerRounds(nextPlayer);
      setRivalRounds(nextRival);

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(
          winner === 'player'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }

      if (nextPlayer >= ROUND_WINS_NEEDED || nextRival >= ROUND_WINS_NEEDED) {
        setMessage(
          winner === 'player' ? 'BUTT SUPREME!' : 'OUT-CHEEKED…',
        );
        setPhase('matchOver');
        phaseRef.current = 'matchOver';
        showFloater(winner === 'player' ? 'THICC VICTORY' : 'RIVAL RUMP');
        return;
      }

      setMessage(
        winner === 'player' ? 'You butt-bumped them out!' : 'Your cheeks got yeeted!',
      );
      setPhase('roundOver');
      phaseRef.current = 'roundOver';
    },
    [playerRounds, rivalRounds, showFloater],
  );

  useEffect(() => {
    let raf = 0;
    const loop = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      let dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      dt = Math.min(0.033, Math.max(0.008, dt));

      const player = playerRef.current;
      const rival = rivalRef.current;

      if (phaseRef.current === 'fighting') {
        if (player.charging) {
          player.charge = Math.min(1, player.charge + CHARGE_RATE * dt);
          const [fx, fy] = normalize(aimRef.current.x, aimRef.current.y);
          if (fx !== 0 || fy !== 0) player.facing = Math.atan2(fy, fx);
        }

        // Idle frogs face each other butt-to-butt (hilarious standoff)
        if (!player.charging && length(player.vx, player.vy) < 0.3) {
          player.facing = Math.atan2(rival.y - player.y, rival.x - player.x);
        }
        if (!rival.charging && length(rival.vx, rival.vy) < 0.3) {
          rival.facing = Math.atan2(player.y - rival.y, player.x - rival.x);
        }

        updateAi(aiRef.current, rival, player, cx, cy, RING_RADIUS, dt);
        integrateFrog(player, dt);
        integrateFrog(rival, dt);

        const impact = resolveCollision(player, rival);
        if (impact > IMPACT_SHAKE_THRESHOLD) {
          setShake(Math.min(14, impact * 2.8));
          const id = ++impactId.current;
          const label = pickClashLabel();
          const midX = (player.x + rival.x) * 0.5;
          const midY = (player.y + rival.y) * 0.5;
          setImpacts((prev) =>
            [...prev, { id, x: midX, y: midY, power: impact, label }].slice(-4),
          );
          showFloater(label);
          setTimeout(() => {
            setImpacts((prev) => prev.filter((b) => b.id !== id));
          }, 1000);
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }

        if (isOutsideRing(player, cx, cy, RING_RADIUS)) {
          endRound('rival');
        } else if (isOutsideRing(rival, cx, cy, RING_RADIUS)) {
          endRound('player');
        }
      } else {
        integrateFrog(player, dt * 0.15);
        integrateFrog(rival, dt * 0.15);
      }

      setShake((s) => Math.max(0, s - dt * 18));
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lastTs.current = null;
    };
  }, [endRound, showFloater]);

  const onChargeStart = useCallback(() => {
    if (phaseRef.current !== 'fighting') return;
    const p = playerRef.current;
    if (p.cooldown > 0) return;
    p.charging = true;
    p.charge = 0;
  }, []);

  const onChargeAim = useCallback((x: number, y: number) => {
    if (length(x, y) < 6) return;
    aimRef.current = { x, y };
    setAim({ x, y });
  }, []);

  const onChargeRelease = useCallback((x: number, y: number) => {
    if (phaseRef.current !== 'fighting') return;
    const p = playerRef.current;
    if (!p.charging) return;

    let dx = x;
    let dy = y;
    if (length(dx, dy) < 8) {
      dx = aimRef.current.x;
      dy = aimRef.current.y;
    }
    if (length(dx, dy) < 4) {
      dx = 0;
      dy = -1;
    }

    if (p.charge >= MIN_CHARGE && p.cooldown <= 0) {
      applyDash(p, dx, dy, p.charge, DASH_POWER);
      p.cooldown = POST_DASH_COOLDOWN;
      showFloater(p.charge > 0.75 ? 'MAXIMUM RUMP!' : 'BUTT ROCKET!');
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } else {
      p.charging = false;
      p.charge = 0;
    }
  }, [showFloater]);

  const continueMatch = () => {
    const roundNum = playerRounds + rivalRounds + 1;
    startCountdown(`Round ${roundNum} — more cheeks`);
  };

  const rematch = () => {
    setPlayerRounds(0);
    setRivalRounds(0);
    startCountdown('Round 1 — cheek to cheek');
  };

  const player = playerRef.current;
  const rival = rivalRef.current;

  return (
    <View style={styles.root}>
      <View style={styles.canvasWrap}>
        <GameCanvas
          player={player}
          rival={rival}
          shake={shake}
          mode="game"
          impacts={impacts}
          aim={aim}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.hud, { paddingTop: Math.max(12, insets.top + 4) }]}
      >
        <View style={styles.topRow}>
          <Pressable onPress={onExit} hitSlop={12}>
            <Text style={styles.back}>← Menu</Text>
          </Pressable>
          <Text style={styles.score}>
            {playerRounds} — {rivalRounds}
          </Text>
          <Text style={styles.best}>best of {ROUND_WINS_NEEDED * 2 - 1}</Text>
        </View>

        {floater ? (
          <View pointerEvents="none" style={styles.floaterWrap}>
            <Text style={styles.floater}>{floater.text}</Text>
          </View>
        ) : null}

        {phase === 'countdown' ? (
          <View style={styles.banner}>
            <Text style={styles.countdown}>
              {countdown > 0 ? countdown : 'CLAP!'}
            </Text>
            <Text style={styles.bannerSub}>{message}</Text>
          </View>
        ) : null}

        {phase === 'fighting' && !floater ? (
          <Text style={styles.fightHint}>Aim the rump · release to slam</Text>
        ) : null}

        {phase === 'roundOver' || phase === 'matchOver' ? (
          <View style={styles.banner}>
            <Text style={styles.resultTitle}>{message}</Text>
            <Pressable
              onPress={phase === 'matchOver' ? rematch : continueMatch}
              style={styles.resultBtn}
            >
              <Text style={styles.resultBtnText}>
                {phase === 'matchOver' ? 'Rematch those cheeks' : 'Next butt round'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.controls,
          { paddingBottom: Math.max(18, insets.bottom + 10) },
        ]}
      >
        <ChargePad
          charge={player.charge}
          disabled={phase !== 'fighting'}
          onChargeStart={onChargeStart}
          onChargeAim={onChargeAim}
          onChargeRelease={onChargeRelease}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyCute,
  },
  canvasWrap: {
    ...StyleSheet.absoluteFill,
  },
  hud: {
    ...StyleSheet.absoluteFill,
  },
  topRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    fontFamily: fonts.body,
    color: colors.ink,
    opacity: 0.75,
    fontSize: 15,
    width: 72,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
  },
  best: {
    fontFamily: fonts.body,
    color: colors.ink,
    opacity: 0.5,
    fontSize: 12,
    width: 72,
    textAlign: 'right',
  },
  floaterWrap: {
    marginTop: 36,
    alignSelf: 'center',
  },
  floater: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.blush,
    textAlign: 'center',
    textShadowColor: 'rgba(255,248,240,0.9)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 2 },
  },
  fightHint: {
    marginTop: 18,
    alignSelf: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.55,
    backgroundColor: 'rgba(255,248,240,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    marginTop: 28,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,248,240,0.88)',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 22,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.blushSoft,
  },
  countdown: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.blush,
  },
  bannerSub: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  resultBtn: {
    marginTop: 8,
    backgroundColor: colors.blush,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
  },
  resultBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.cream,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
});
