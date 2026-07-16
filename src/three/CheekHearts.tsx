import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

/** Hearts shooting out of the bubble-butt cheek zone. */
export function CheekHeartEmitter({
  active,
  intensity,
  width,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const hearts = useRef<Heart[]>([]);
  const spawnAcc = useRef(0);
  const meshes = useMemo(() => {
    return Array.from({ length: 24 }, () => ({
      pos: new THREE.Vector3(),
      scale: 0,
      color: COLORS[0],
      visible: false,
      rot: 0,
    }));
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;

    if (active && intensity > 0.05) {
      spawnAcc.current += dt * (2 + intensity * 14);
      while (spawnAcc.current >= 1 && hearts.current.length < 24) {
        spawnAcc.current -= 1;
        const side = Math.random() > 0.5 ? 1 : -1;
        hearts.current.push({
          life: 0,
          max: 0.7 + Math.random() * 0.6,
          x: side * width * (0.12 + Math.random() * 0.1),
          y: 0.05 + Math.random() * 0.08,
          z: 0.05,
          vx: side * (0.15 + Math.random() * 0.35),
          vy: 0.6 + Math.random() * 1.1 + intensity * 0.5,
          vz: (Math.random() - 0.5) * 0.4,
          spin: (Math.random() - 0.5) * 8,
          size: 0.1 + Math.random() * 0.12 + intensity * 0.06,
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
      h.vy -= 0.4 * dt;
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
      const s = h.size * (0.6 + fade * 0.6);
      child.scale.setScalar(s);
      child.rotation.z += h.spin * dt;
      const mat = child.material as THREE.MeshBasicMaterial;
      mat.color.set(h.color);
      mat.opacity = fade * 0.95;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.04]}>
      {meshes.map((_, i) => (
        <mesh key={i} visible={false} renderOrder={6}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#FF6B9D"
            transparent
            opacity={0.9}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
