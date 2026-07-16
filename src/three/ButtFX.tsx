import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ImpactBurst } from '../game/types';

const CLASH_LABELS = [
  'cheek boop!!',
  'TWERK IMPACT',
  'bubble WHAM!',
  'boingus maximus',
  'cute aggression',
  'BUTT FRIENDSHIP',
  'thicc with love',
  'peachy smash',
  'jiggle joust!',
  'no fists only cheeks',
  'CLAP CLAP CLAP',
  'illegal levels of cute',
  'hearts from the cheeks',
  'sumo but make it unhinged',
  'certified dump truck',
];

export function pickClashLabel() {
  return CLASH_LABELS[Math.floor(Math.random() * CLASH_LABELS.length)];
}

type Props = {
  bursts: ImpactBurst[];
};

/** Ring shockwaves + floating hearts on every butt clash. */
export function ButtClashFX({ bursts }: Props) {
  return (
    <group>
      {bursts.map((b) => (
        <ClashBurst key={b.id} burst={b} />
      ))}
    </group>
  );
}

function ClashBurst({ burst }: { burst: ImpactBurst }) {
  const ring = useRef<THREE.Mesh>(null);
  const hearts = useRef<THREE.Group>(null);
  const age = useRef(0);
  const power = Math.min(1.6, 0.55 + burst.power * 0.12);

  const heartOffsets = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
        return {
          x: Math.cos(a) * (0.4 + Math.random() * 0.35),
          z: Math.sin(a) * (0.4 + Math.random() * 0.35),
          speed: 0.9 + Math.random() * 0.8,
          spin: (Math.random() - 0.5) * 4,
        };
      }),
    [],
  );

  useFrame((_, dt) => {
    age.current += dt;
    const t = age.current;
    if (ring.current) {
      const s = 0.3 + t * 4.5 * power;
      ring.current.scale.set(s, s, s);
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.75 - t * 1.6);
    }
    if (hearts.current) {
      hearts.current.children.forEach((child, i) => {
        const o = heartOffsets[i];
        child.position.y = 0.4 + t * o.speed * 1.4;
        child.position.x = burst.x + o.x * (1 + t);
        child.position.z = burst.y + o.z * (1 + t);
        child.rotation.z += o.spin * dt;
        child.scale.setScalar(Math.max(0, 0.9 - t * 0.9));
      });
    }
  });

  return (
    <group>
      <mesh
        ref={ring}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[burst.x, 0.06, burst.y]}
      >
        <ringGeometry args={[0.35, 0.55, 40]} />
        <meshBasicMaterial
          color="#ffb4d0"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[burst.x, 0.05, burst.y]}
        scale={[power, power, power]}
      >
        <ringGeometry args={[0.15, 0.28, 32]} />
        <meshBasicMaterial
          color="#ffe08a"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={hearts}>
        {heartOffsets.map((_, i) => (
          <mesh key={i} position={[burst.x, 0.5, burst.y]}>
            <planeGeometry args={[0.28, 0.28]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#ff7aa8' : '#ffd0e0'}
              transparent
              opacity={0.9}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Cute aim arrow: shows where the butt will slam. */
export function ButtAimArrow({
  x,
  y,
  dirX,
  dirY,
  charge,
  visible,
}: {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  charge: number;
  visible: boolean;
}) {
  if (!visible || charge < 0.05) return null;
  const len = Math.hypot(dirX, dirY) || 1;
  const nx = dirX / len;
  const nz = dirY / len;
  const dist = 0.7 + charge * 1.4;
  const angle = Math.atan2(nx, nz);

  return (
    <group position={[x, 0.08, y]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0, dist * 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14 + charge * 0.08, dist]} />
        <meshBasicMaterial
          color="#ff9ec0"
          transparent
          opacity={0.35 + charge * 0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, dist]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <circleGeometry args={[0.18 + charge * 0.1, 3]} />
        <meshBasicMaterial
          color="#ff6b9d"
          transparent
          opacity={0.55 + charge * 0.4}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
