import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createFrogCutout,
  FROG_PHOTOS,
  type FrogCutout,
  type PhotoKey,
} from './frogCutout';
import type { FighterKit } from '../game/types';
import { CheekHeartEmitter } from './CheekHearts';

type Props = {
  kit?: FighterKit;
  /** @deprecated prefer kit */
  variant?: 'player' | 'rival';
  squish?: number;
  charge?: number;
  charging?: boolean;
  flash?: number;
  facing?: number;
  height?: number;
  dashTrail?: number;
  speed?: number;
  superReady?: boolean;
  twerk?: number;
};

export function DesertRainFrog3D({
  kit,
  variant = 'player',
  squish = 0,
  charge = 0,
  charging = false,
  flash = 0,
  height = 1.5,
  dashTrail = 0,
  speed = 0,
  superReady = false,
  twerk = 0,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cheeks = useRef<THREE.Group>(null);
  const leftCheek = useRef<THREE.Mesh>(null);
  const rightCheek = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const t = useRef(0);
  const [cutout, setCutout] = useState<FrogCutout | null>(null);

  const resolved = useMemo(() => {
    if (kit) return kit;
    return {
      frogId: 'peaches',
      name: variant === 'player' ? 'Peaches' : 'Gravelina',
      tagline: '',
      photoKey: (variant === 'player' ? 'peaches' : 'gravelina') as PhotoKey,
      tint: variant === 'player' ? 'pink' : 'cool',
      cutMode: variant === 'player' ? 'white' : 'ellipse',
    } as FighterKit;
  }, [kit, variant]);

  useEffect(() => {
    let alive = true;
    const url = FROG_PHOTOS[resolved.photoKey as PhotoKey];
    createFrogCutout(url, {
      tint: resolved.tint,
      mode: resolved.cutMode,
      cheekBoost: true,
    })
      .then((c) => {
        if (alive) setCutout(c);
      })
      .catch(() => {
        createFrogCutout(FROG_PHOTOS.peaches, { cheekBoost: true }).then((c) => {
          if (alive) setCutout(c);
        });
      });
    return () => {
      alive = false;
    };
  }, [resolved]);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: cutout?.map ?? null,
      transparent: true,
      alphaTest: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: true,
    });
  }, [cutout]);

  const ghostMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: cutout?.map ?? null,
      transparent: true,
      opacity: 0.28,
      alphaTest: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: true,
    });
  }, [cutout]);

  useEffect(() => {
    matRef.current = material;
    if (cutout) {
      material.map = cutout.map;
      ghostMat.map = cutout.map;
      material.needsUpdate = true;
      ghostMat.needsUpdate = true;
    }
  }, [cutout, material, ghostMat]);

  useFrame((_, dt) => {
    t.current += dt;
    if (!root.current || !body.current || !cheeks.current) return;

    root.current.quaternion.copy(camera.quaternion);

    const tw = Math.max(
      twerk,
      charging ? 0.55 + charge * 0.45 : 0,
      Math.min(0.55, speed * 0.08),
      superReady ? 0.35 : 0,
    );

    // Unhinged twerk: opposing cheek bounce + vertical jiggle
    const twerkHz = 14 + tw * 18;
    const wave = Math.sin(t.current * twerkHz);
    const wave2 = Math.sin(t.current * twerkHz * 1.15 + 1.2);
    const jiggleAmp = 0.02 + tw * 0.12 + (charging ? charge * 0.06 : 0);
    const jiggle = wave * jiggleAmp;
    const breathe = 1 + Math.sin(t.current * 2.2) * 0.022;
    const cheekPump = 1 + tw * 0.28 + squish * 0.16;
    const superPulse = superReady ? 1 + Math.sin(t.current * 8) * 0.05 : 1;
    const chargePulse = charging ? 1 + charge * 0.1 : 1;

    const sx = (1 + squish * 0.48) * chargePulse * cheekPump * superPulse;
    const sy =
      (1 - squish * 0.36) *
      breathe *
      (1 + Math.abs(wave) * tw * 0.08);

    body.current.scale.set(sx, sy, 1);
    body.current.position.y = Math.abs(wave) * tw * 0.06;
    body.current.rotation.z = wave * tw * 0.08;

    cheeks.current.scale.set(1 + jiggle * 2.4, 1 - Math.abs(jiggle) * 0.85, 1);
    cheeks.current.position.x = jiggle * 0.55;
    cheeks.current.rotation.z = jiggle * 1.4;

    if (leftCheek.current && rightCheek.current) {
      const bounce = 1 + tw * 0.35;
      leftCheek.current.scale.set(
        bounce * (1 + wave * 0.25),
        bounce * (1 - wave * 0.2),
        1,
      );
      rightCheek.current.scale.set(
        bounce * (1 - wave2 * 0.25),
        bounce * (1 + wave2 * 0.2),
        1,
      );
      leftCheek.current.position.y = wave * tw * 0.08;
      rightCheek.current.position.y = -wave2 * tw * 0.08;
    }

    if (matRef.current) {
      if (flash > 0.05) {
        matRef.current.color.setRGB(1, 1 - flash * 0.12, 1 - flash * 0.22);
      } else if (superReady) {
        matRef.current.color.setRGB(1, 0.9, 0.96);
      } else if (charging) {
        const blush = charge * 0.22;
        matRef.current.color.setRGB(1, 1 - blush * 0.3, 1 - blush * 0.4);
      } else {
        matRef.current.color.setRGB(1, 1, 1);
      }
    }
  });

  if (!cutout) return null;

  const w = height * cutout.aspect;
  const trail = Math.min(1, dashTrail);
  const heartRate =
    (charging ? 0.4 + charge * 0.8 : 0) +
    (superReady ? 0.35 : 0) +
    Math.min(0.4, twerk * 0.5) +
    Math.min(0.25, speed * 0.04);

  return (
    <group ref={root}>
      {trail > 0.05 ? (
        <>
          <mesh
            position={[0, height * 0.5, -0.18]}
            scale={[0.92, 0.92, 1]}
            material={ghostMat}
            renderOrder={1}
          >
            <planeGeometry args={[w, height]} />
          </mesh>
          <mesh
            position={[0, height * 0.5, -0.36]}
            scale={[0.78, 0.78, 1]}
            material={ghostMat}
            renderOrder={0}
          >
            <planeGeometry args={[w, height]} />
          </mesh>
        </>
      ) : null}

      <group ref={body}>
        <mesh position={[0, height * 0.5, 0]} material={material} renderOrder={3}>
          <planeGeometry args={[w, height]} />
        </mesh>
        <group ref={cheeks} position={[0, height * 0.26, 0.02]}>
          <mesh ref={leftCheek} position={[-w * 0.17, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.16, 24]} />
            <meshBasicMaterial
              color={superReady ? '#FF6B9D' : '#ffb7c8'}
              transparent
              opacity={0.28 + (charging ? charge * 0.32 : 0) + (superReady ? 0.22 : 0)}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={rightCheek} position={[w * 0.17, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.16, 24]} />
            <meshBasicMaterial
              color={superReady ? '#FF6B9D' : '#ffb7c8'}
              transparent
              opacity={0.28 + (charging ? charge * 0.32 : 0) + (superReady ? 0.22 : 0)}
              depthWrite={false}
            />
          </mesh>
          <CheekHeartEmitter
            active={heartRate > 0.08}
            intensity={heartRate}
            width={w}
            height={height}
          />
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} renderOrder={1}>
        <circleGeometry args={[Math.max(0.22, w * 0.22), 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {charging && charge > 0.05 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[w * 0.24, w * 0.24 + 0.08 + charge * 0.16, 48]} />
          <meshBasicMaterial
            color={superReady ? '#FF6B9D' : '#ff8fb8'}
            transparent
            opacity={0.4 + charge * 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      {superReady && !charging ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[w * 0.3, w * 0.38, 48]} />
          <meshBasicMaterial
            color="#FF6B9D"
            transparent
            opacity={0.35 + Math.sin(t.current * 8) * 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  );
}
