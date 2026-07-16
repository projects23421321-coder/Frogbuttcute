import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Arena3D } from './Arena3D';
import { DesertRainFrog3D } from './DesertRainFrog3D';
import { ButtAimArrow, ButtClashFX } from './ButtFX';
import type { ArenaId, FighterKit, FrogBody, ImpactBurst } from '../game/types';
import { FIGHTERS } from '../game/types';
import { length } from '../game/physics';
import { RING_RADIUS } from '../game/constants';

type FrogView = Pick<
  FrogBody,
  | 'x'
  | 'y'
  | 'facing'
  | 'squish'
  | 'charge'
  | 'charging'
  | 'hurtFlash'
  | 'vx'
  | 'vy'
  | 'dashTrail'
  | 'style'
  | 'superReady'
  | 'twerk'
>;

type Props = {
  player: FrogView;
  rival: FrogView;
  shake: number;
  cameraPunch?: number;
  mode?: 'game' | 'title';
  impacts?: ImpactBurst[];
  aim?: { x: number; y: number } | null;
  playerKit?: FighterKit;
  rivalKit?: FighterKit;
  arenaId?: ArenaId;
};

const ARENA_BG: Record<ArenaId, string> = {
  candyDohyo: '#FFE8D6',
  bubbleBath: '#D8F0FF',
  discoPond: '#1A1028',
  snackCounter: '#FFF0D6',
  gravelGlam: '#E8DCC8',
};

function FollowCamera({
  shake,
  cameraPunch = 0,
  mode,
}: {
  shake: number;
  cameraPunch?: number;
  mode: 'game' | 'title';
}) {
  const { camera } = useThree();
  const base = useMemo(
    () =>
      mode === 'title'
        ? new THREE.Vector3(0, 1.4, 3.9)
        : new THREE.Vector3(0, 6.8, 7.6),
    [mode],
  );

  useFrame((state) => {
    if (mode === 'title') {
      const t = state.clock.elapsedTime;
      camera.position.set(
        Math.sin(t * 0.2) * 0.35,
        1.35 + Math.sin(t * 0.35) * 0.08,
        3.9,
      );
      camera.lookAt(0, 0.75, 0);
      return;
    }

    const punch = cameraPunch;
    const fov = 36 - punch * 6;
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov;
      camera.updateProjectionMatrix();
    }
    const sx = (Math.random() - 0.5) * shake * 0.1;
    const sy = (Math.random() - 0.5) * shake * 0.07;
    camera.position.set(base.x + sx, base.y + sy - punch * 0.35, base.z - punch * 0.8);
    camera.lookAt(0, 0.45, 0);
  });

  return null;
}

function FrogActor({
  frog,
  kit,
  height,
}: {
  frog: FrogView;
  kit: FighterKit;
  height?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(frog.x, 0, frog.y);
  });

  const speed = length(frog.vx, frog.vy);

  return (
    <group ref={ref}>
      <DesertRainFrog3D
        kit={kit}
        facing={frog.facing}
        squish={frog.squish}
        charge={frog.charge}
        charging={frog.charging}
        flash={frog.hurtFlash}
        height={height}
        dashTrail={frog.dashTrail}
        speed={speed}
        superReady={frog.superReady}
        twerk={frog.twerk}
      />
    </group>
  );
}

function SceneContents({
  player,
  rival,
  shake,
  cameraPunch = 0,
  mode = 'game',
  impacts = [],
  aim,
  playerKit = FIGHTERS[0],
  rivalKit = FIGHTERS[1],
  arenaId = 'candyDohyo',
}: Props) {
  const bg = ARENA_BG[arenaId] ?? ARENA_BG.candyDohyo;
  const sparkleColor = arenaId === 'discoPond' ? '#FF4D8D' : '#FFC2D1';

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 32]} />

      <ambientLight intensity={arenaId === 'discoPond' ? 0.35 : 0.7} color="#fff5ea" />
      <directionalLight
        castShadow
        position={[4, 9, 5]}
        intensity={arenaId === 'discoPond' ? 1.2 : 2.0}
        color="#fff6e0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.55} color="#ffc2d1" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#ffe08a" distance={12} />

      <Environment
        preset={arenaId === 'discoPond' ? 'night' : 'sunset'}
        environmentIntensity={0.4}
      />
      <FollowCamera shake={shake} cameraPunch={cameraPunch} mode={mode} />

      {mode === 'game' ? (
        <>
          <Arena3D arenaId={arenaId} />
          <Sparkles
            count={arenaId === 'discoPond' ? 70 : 40}
            scale={[RING_RADIUS * 2.4, 2.2, RING_RADIUS * 2.4]}
            size={3}
            speed={0.25}
            opacity={0.45}
            color={sparkleColor}
          />
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.35}
            scale={12}
            blur={2.6}
            far={4}
            color="#8B6840"
          />
          <FrogActor frog={player} kit={playerKit} height={1.4} />
          <FrogActor frog={rival} kit={rivalKit} height={1.4} />
          <ButtClashFX bursts={impacts} />
          <ButtAimArrow
            x={player.x}
            y={player.y}
            dirX={aim?.x ?? 0}
            dirY={aim?.y ?? -1}
            charge={player.charge}
            visible={player.charging}
          />
        </>
      ) : (
        <>
          <Arena3D arenaId="candyDohyo" />
          <Sparkles
            count={50}
            scale={6}
            size={3.5}
            speed={0.35}
            opacity={0.5}
            color="#FF8FAB"
          />
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.3}
            scale={6}
            blur={2.8}
            far={3}
            color="#8B6840"
          />
          <group position={[0, 0, 0.3]}>
            <DesertRainFrog3D
              kit={FIGHTERS[0]}
              height={2.1}
              charging
              charge={0.7}
              twerk={0.9}
            />
          </group>
        </>
      )}
    </>
  );
}

export function GameCanvas(props: Props) {
  const { mode = 'game' } = props;
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: mode === 'title' ? [0, 1.4, 3.9] : [0, 6.8, 7.6],
        fov: mode === 'title' ? 40 : 36,
        near: 0.1,
        far: 60,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
        alpha: true,
      }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}

export function TitleCanvas() {
  const dummy: FrogView = {
    x: 0,
    y: 0,
    facing: 0,
    squish: 0,
    charge: 0.7,
    charging: true,
    hurtFlash: 0,
    vx: 0,
    vy: 0,
    dashTrail: 0,
    style: 0,
    superReady: false,
    twerk: 0.9,
  };
  return <GameCanvas player={dummy} rival={dummy} shake={0} mode="title" />;
}
