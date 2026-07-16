import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createFrogCutout,
  FROG_PHOTOS,
  type FrogCutout,
} from './frogCutout';
import type { FighterKit } from '../game/types';

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
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cheeks = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const t = useRef(0);
  const [cutout, setCutout] = useState<FrogCutout | null>(null);

  const resolved = useMemo(() => {
    if (kit) return kit;
    return {
      frogId: variant === 'player' ? 'sandy' : 'pebble',
      name: variant === 'player' ? 'Sandy' : 'Pebble',
      tagline: '',
      photoKey: variant === 'player' ? 'player' : 'rival',
      tint: variant === 'player' ? 'none' : 'cool',
      cutMode: variant === 'player' ? 'white' : 'ellipse',
    } as FighterKit;
  }, [kit, variant]);

  useEffect(() => {
    let alive = true;
    const url = FROG_PHOTOS[resolved.photoKey];
    createFrogCutout(url, {
      tint: resolved.tint,
      mode: resolved.cutMode,
    })
      .then((c) => {
        if (alive) setCutout(c);
      })
      .catch(() => {
        createFrogCutout(FROG_PHOTOS.rivalAlt).then((c) => {
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

    const jiggleSpeed = charging ? 16 : speed > 2 ? 20 : 6;
    const jiggleAmp = charging
      ? 0.045 + charge * 0.09
      : 0.02 + Math.min(0.07, speed * 0.012);
    const jiggle = Math.sin(t.current * jiggleSpeed) * jiggleAmp;
    const breathe = 1 + Math.sin(t.current * 2.2) * 0.022;
    const cheekPump = charging ? 1 + charge * 0.24 : 1 + squish * 0.16;
    const superPulse = superReady ? 1 + Math.sin(t.current * 8) * 0.04 : 1;
    const chargePulse = charging ? 1 + charge * 0.09 : 1;

    const sx = (1 + squish * 0.48) * chargePulse * cheekPump * superPulse;
    const sy = (1 - squish * 0.36) * breathe;

    body.current.scale.set(sx, sy, 1);
    cheeks.current.scale.set(1 + jiggle * 2, 1 - Math.abs(jiggle) * 0.7, 1);
    cheeks.current.position.x = jiggle * 0.4;
    cheeks.current.rotation.z = jiggle * 1.1;

    if (matRef.current) {
      if (flash > 0.05) {
        matRef.current.color.setRGB(1, 1 - flash * 0.12, 1 - flash * 0.22);
      } else if (superReady) {
        matRef.current.color.setRGB(1, 0.92, 0.98);
      } else if (charging) {
        const blush = charge * 0.2;
        matRef.current.color.setRGB(1, 1 - blush * 0.28, 1 - blush * 0.38);
      } else {
        matRef.current.color.setRGB(1, 1, 1);
      }
    }
  });

  if (!cutout) return null;

  const w = height * cutout.aspect;
  const trail = Math.min(1, dashTrail);

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
        <group ref={cheeks} position={[0, height * 0.28, 0.02]}>
          <mesh position={[-w * 0.16, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.15, 24]} />
            <meshBasicMaterial
              color={superReady ? '#FF6B9D' : '#ffb7c8'}
              transparent
              opacity={0.24 + (charging ? charge * 0.28 : 0) + (superReady ? 0.2 : 0)}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[w * 0.16, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.15, 24]} />
            <meshBasicMaterial
              color={superReady ? '#FF6B9D' : '#ffb7c8'}
              transparent
              opacity={0.24 + (charging ? charge * 0.28 : 0) + (superReady ? 0.2 : 0)}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} renderOrder={1}>
        <circleGeometry args={[Math.max(0.22, w * 0.22), 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {charging && charge > 0.05 ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[w * 0.24, w * 0.24 + 0.08 + charge * 0.16, 48]} />
            <meshBasicMaterial
              color={superReady ? '#FF6B9D' : '#ff8fb8'}
              transparent
              opacity={0.4 + charge * 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
          {[0, 1, 2].map((i) => {
            const a = t.current * 2.8 + i * 2.1;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * (0.38 + charge * 0.22),
                  0.55 + Math.sin(a * 1.3) * 0.28 + i * 0.08,
                  Math.sin(a) * (0.38 + charge * 0.22),
                ]}
                renderOrder={5}
              >
                <planeGeometry args={[0.13, 0.13]} />
                <meshBasicMaterial
                  color="#ff6b9d"
                  transparent
                  opacity={0.45 + charge * 0.5}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </>
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
