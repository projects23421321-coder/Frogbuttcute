import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Arena3D } from './Arena3D';
import { DesertRainFrog3D } from './DesertRainFrog3D';
import { ButtAimArrow, ButtClashFX } from './ButtFX';
import type { FrogBody, ImpactBurst } from '../game/types';
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
>;

type Props = {
  player: FrogView;
  rival: FrogView;
  shake: number;
  mode?: 'game' | 'title';
  impacts?: ImpactBurst[];
  aim?: { x: number; y: number } | null;
};

function FollowCamera({ shake, mode }: { shake: number; mode: 'game' | 'title' }) {
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

    const sx = (Math.random() - 0.5) * shake * 0.1;
    const sy = (Math.random() - 0.5) * shake * 0.07;
    camera.position.set(base.x + sx, base.y + sy, base.z);
    camera.lookAt(0, 0.45, 0);
  });

  return null;
}

function FrogActor({
  frog,
  variant,
  height,
}: {
  frog: FrogView;
  variant: 'player' | 'rival';
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
        variant={variant}
        facing={frog.facing}
        squish={frog.squish}
        charge={frog.charge}
        charging={frog.charging}
        flash={frog.hurtFlash}
        height={height}
        dashTrail={frog.dashTrail}
        speed={speed}
      />
    </group>
  );
}

function SceneContents({
  player,
  rival,
  shake,
  mode = 'game',
  impacts = [],
  aim,
}: Props) {
  return (
    <>
      <color attach="background" args={['#FFE8D6']} />
      <fog attach="fog" args={['#FFE8D6', 14, 32]} />

      <ambientLight intensity={0.7} color="#fff5ea" />
      <directionalLight
        castShadow
        position={[4, 9, 5]}
        intensity={2.0}
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

      <Environment preset="sunset" environmentIntensity={0.4} />
      <FollowCamera shake={shake} mode={mode} />

      {mode === 'game' ? (
        <>
          <Arena3D />
          <Sparkles
            count={40}
            scale={[RING_RADIUS * 2.4, 2.2, RING_RADIUS * 2.4]}
            size={3}
            speed={0.25}
            opacity={0.45}
            color="#FFC2D1"
          />
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.35}
            scale={12}
            blur={2.6}
            far={4}
            color="#8B6840"
          />
          <FrogActor frog={player} variant="player" height={1.4} />
          <FrogActor frog={rival} variant="rival" height={1.4} />
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
          <Arena3D />
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
              variant="player"
              height={2.1}
              charging
              charge={0.55}
            />
          </group>
        </>
      )}
    </>
  );
}

export function GameCanvas({
  player,
  rival,
  shake,
  mode = 'game',
  impacts,
  aim,
}: Props) {
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
      <SceneContents
        player={player}
        rival={rival}
        shake={shake}
        mode={mode}
        impacts={impacts}
        aim={aim}
      />
    </Canvas>
  );
}

export function TitleCanvas() {
  const dummy: FrogView = {
    x: 0,
    y: 0,
    facing: 0,
    squish: 0,
    charge: 0.55,
    charging: true,
    hurtFlash: 0,
    vx: 0,
    vy: 0,
    dashTrail: 0,
  };
  return <GameCanvas player={dummy} rival={dummy} shake={0} mode="title" />;
}
