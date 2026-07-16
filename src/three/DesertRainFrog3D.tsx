import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createFrogCutout,
  FROG_PHOTOS,
  type FrogCutout,
} from './frogCutout';

type Props = {
  variant?: 'player' | 'rival';
  squish?: number;
  charge?: number;
  charging?: boolean;
  flash?: number;
  facing?: number;
  height?: number;
  /** Butt-dash afterimage intensity 0..1 */
  dashTrail?: number;
  speed?: number;
};

/**
 * Real rain-frog butt photo with exaggerated cute cheek jiggle.
 * Always billboards so those cheeks stay the weapon and the joke.
 */
export function DesertRainFrog3D({
  variant = 'player',
  squish = 0,
  charge = 0,
  charging = false,
  flash = 0,
  height = 1.5,
  dashTrail = 0,
  speed = 0,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cheeks = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const t = useRef(0);
  const [cutout, setCutout] = useState<FrogCutout | null>(null);

  useEffect(() => {
    let alive = true;
    const url = variant === 'player' ? FROG_PHOTOS.player : FROG_PHOTOS.rival;
    createFrogCutout(url, {
      tint: variant === 'rival' ? 'cool' : 'none',
      mode: variant === 'rival' ? 'ellipse' : 'white',
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
  }, [variant]);

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

    // Cute idle: soft bounce + cheek wobble. Charge = cheeks inflate.
    const jiggleSpeed = charging ? 14 : speed > 2 ? 18 : 5.5;
    const jiggleAmp = charging
      ? 0.04 + charge * 0.08
      : 0.018 + Math.min(0.06, speed * 0.01);
    const jiggle = Math.sin(t.current * jiggleSpeed) * jiggleAmp;
    const breathe = 1 + Math.sin(t.current * 2.1) * 0.02;
    const cheekPump = charging ? 1 + charge * 0.22 : 1 + squish * 0.15;
    const chargePulse = charging ? 1 + charge * 0.08 : 1;

    const sx = (1 + squish * 0.45) * chargePulse * cheekPump;
    const sy = (1 - squish * 0.34) * breathe;

    body.current.scale.set(sx, sy, 1);
    // Independent cheek sway — reads as cute butt jiggle
    cheeks.current.scale.set(1 + jiggle * 1.8, 1 - Math.abs(jiggle) * 0.6, 1);
    cheeks.current.position.x = jiggle * 0.35;
    cheeks.current.rotation.z = jiggle * 0.9;

    if (matRef.current) {
      if (flash > 0.05) {
        matRef.current.color.setRGB(1, 1 - flash * 0.12, 1 - flash * 0.22);
      } else if (charging) {
        // Soft blush while winding up the butt slam
        const blush = charge * 0.18;
        matRef.current.color.setRGB(1, 1 - blush * 0.25, 1 - blush * 0.35);
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
      {/* Dash afterimages — butt rocket trail */}
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
            scale={[0.8, 0.8, 1]}
            material={ghostMat}
            renderOrder={0}
          >
            <planeGeometry args={[w, height]} />
          </mesh>
        </>
      ) : null}

      <group ref={body}>
        <mesh
          position={[0, height * 0.5, 0]}
          material={material}
          renderOrder={3}
        >
          <planeGeometry args={[w, height]} />
        </mesh>

        {/* Soft cheek highlight discs — sell the cute butt */}
        <group ref={cheeks} position={[0, height * 0.28, 0.02]}>
          <mesh position={[-w * 0.16, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.14, 24]} />
            <meshBasicMaterial
              color="#ffb7c8"
              transparent
              opacity={0.22 + (charging ? charge * 0.25 : 0)}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[w * 0.16, 0, 0]} renderOrder={4}>
            <circleGeometry args={[w * 0.14, 24]} />
            <meshBasicMaterial
              color="#ffb7c8"
              transparent
              opacity={0.22 + (charging ? charge * 0.25 : 0)}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      {/* Ground shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        renderOrder={1}
      >
        <circleGeometry args={[Math.max(0.22, w * 0.22), 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {/* Charge ring = powering up the butt */}
      {charging && charge > 0.05 ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry
              args={[w * 0.24, w * 0.24 + 0.08 + charge * 0.14, 48]}
            />
            <meshBasicMaterial
              color="#ff8fb8"
              transparent
              opacity={0.35 + charge * 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Tiny floating hearts while charging */}
          {[0, 1, 2].map((i) => {
            const a = t.current * 2.5 + i * 2.1;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * (0.35 + charge * 0.2),
                  0.55 + Math.sin(a * 1.3) * 0.25 + i * 0.08,
                  Math.sin(a) * (0.35 + charge * 0.2),
                ]}
                renderOrder={5}
              >
                <planeGeometry args={[0.12, 0.12]} />
                <meshBasicMaterial
                  color="#ff6b9d"
                  transparent
                  opacity={0.4 + charge * 0.5}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </>
      ) : null}
    </group>
  );
}
