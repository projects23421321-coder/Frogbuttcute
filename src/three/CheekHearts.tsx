import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getHeartTexture } from './heartTexture';

type Heart = {
  life: number;
  max: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  spin: number;
  size: number;
  color: string;
};

type Props = {
  active: boolean;
  intensity: number;
  width: number;
  height: number;
};

const COLORS = ['#FF6B9D', '#FF8FAB', '#FFC2D1', '#FFE08A', '#FF4D8D'];

/** Heart sprites shooting from the bubble-butt cheek zone. */
export function CheekHeartEmitter({ active, intensity, width }: Props) {
  const group = useRef<THREE.Group>(null);
  const hearts = useRef<Heart[]>([]);
  const spawnAcc = useRef(0);
  const heartMap = useMemo(() => getHeartTexture(), []);
  const slots = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);

  useFrame((_, dt) => {
    if (!group.current) return;

    if (active && intensity > 0.05) {
      spawnAcc.current += dt * (2.5 + intensity * 16);
      while (spawnAcc.current >= 1 && hearts.current.length < 28) {
        spawnAcc.current -= 1;
        const side = Math.random() > 0.5 ? 1 : -1;
        hearts.current.push({
          life: 0,
          max: 0.75 + Math.random() * 0.65,
          x: side * width * (0.14 + Math.random() * 0.12),
          y: 0.02 + Math.random() * 0.1,
          z: 0.08,
          vx: side * (0.2 + Math.random() * 0.4),
          vy: 0.7 + Math.random() * 1.2 + intensity * 0.55,
          vz: (Math.random() - 0.5) * 0.45,
          spin: (Math.random() - 0.5) * 10,
          size: 0.14 + Math.random() * 0.14 + intensity * 0.08,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    } else {
      spawnAcc.current = 0;
    }

    hearts.current = hearts.current.filter((h) => {
      h.life += dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.z += h.vz * dt;
      h.vy -= 0.45 * dt;
      return h.life < h.max;
    });

    const children = group.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as THREE.Mesh;
      const h = hearts.current[i];
      if (!h) {
        child.visible = false;
        continue;
      }
      child.visible = true;
      child.position.set(h.x, h.y, h.z);
      const fade = 1 - h.life / h.max;
      child.scale.setScalar(h.size * (0.55 + fade * 0.65));
      child.rotation.z += h.spin * dt;
      const mat = child.material as THREE.MeshBasicMaterial;
      mat.color.set(h.color);
      mat.opacity = fade * 0.95;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.1]}>
      {slots.map((i) => (
        <mesh key={i} visible={false} renderOrder={8}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={heartMap}
            color="#FF6B9D"
            transparent
            opacity={0.9}
            depthWrite={false}
            side={THREE.DoubleSide}
            alphaTest={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
