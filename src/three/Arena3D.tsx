import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RING_RADIUS } from '../game/constants';

/**
 * Cute desert playground dohyo — warm sand, candy rope, flowers, mushroom stools.
 */
export function Arena3D() {
  const sand = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#F3DFB8',
        roughness: 0.95,
        metalness: 0.02,
      }),
    [],
  );
  const sandWarm = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#E8C99A',
        roughness: 0.92,
      }),
    [],
  );
  const cream = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF6E8',
        roughness: 0.7,
      }),
    [],
  );
  const blush = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FF9EB5',
        roughness: 0.65,
      }),
    [],
  );
  const mint = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8FCB9B',
        roughness: 0.85,
      }),
    [],
  );
  const coral = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFB347',
        roughness: 0.7,
      }),
    [],
  );

  const flowers = useMemo(() => {
    const items: { x: number; z: number; color: string; s: number }[] = [];
    const palette = ['#FF8FAB', '#FFB347', '#FFE08A', '#9ED9C5', '#FFC2D1'];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.2;
      const r = RING_RADIUS + 0.55 + (i % 3) * 0.22;
      items.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        color: palette[i % palette.length],
        s: 0.12 + (i % 4) * 0.03,
      });
    }
    return items;
  }, []);

  const stools = useMemo(() => {
    const spots: { x: number; z: number; h: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      const r = RING_RADIUS + 1.55;
      spots.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 0.22 + (i % 3) * 0.04,
      });
    }
    return spots;
  }, []);

  return (
    <group>
      {/* Soft sky bowl */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#FFE8D6" side={THREE.BackSide} />
      </mesh>

      {/* Far ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#D4E8C8" roughness={1} />
      </mesh>

      {/* Soft moss apron */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        material={mint}
      >
        <ringGeometry args={[RING_RADIUS + 0.05, RING_RADIUS + 1.85, 64]} />
      </mesh>

      {/* Dohyo sand disk — slightly raised */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        receiveShadow
        material={sand}
      >
        <circleGeometry args={[RING_RADIUS, 72]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.045, 0]}
        material={sandWarm}
      >
        <ringGeometry args={[RING_RADIUS * 0.55, RING_RADIUS * 0.92, 64]} />
      </mesh>

      {/* Cute chalk heart at center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color="#FF8FAB" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.1, 0.051, -0.06]}>
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial color="#FF8FAB" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.051, -0.06]}>
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial color="#FF8FAB" transparent opacity={0.4} />
      </mesh>

      {/* Candy rope rim — alternating cream / blush segments */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a0 = (i / 24) * Math.PI * 2;
        const a1 = ((i + 0.92) / 24) * Math.PI * 2;
        const mid = (a0 + a1) * 0.5;
        const x = Math.cos(mid) * RING_RADIUS;
        const z = Math.sin(mid) * RING_RADIUS;
        return (
          <mesh
            key={i}
            castShadow
            position={[x, 0.12, z]}
            rotation={[0, -mid + Math.PI / 2, Math.PI / 2]}
            material={i % 2 === 0 ? cream : blush}
          >
            <capsuleGeometry args={[0.09, 0.72, 4, 8]} />
          </mesh>
        );
      })}

      {/* Soft outer bumper ring */}
      <mesh position={[0, 0.06, 0]} material={coral}>
        <torusGeometry args={[RING_RADIUS + 0.18, 0.045, 10, 64]} />
      </mesh>

      {/* Starting cheek-lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0.58]} material={cream}>
        <planeGeometry args={[1.0, 0.07]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, -0.58]} material={cream}>
        <planeGeometry args={[1.0, 0.07]} />
      </mesh>

      {/* Flower ring */}
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.08, f.z]}>
          <mesh material={mint} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.12, 6]} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[f.s, 10, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[f.s * 0.4, 8, 8]} />
            <meshStandardMaterial color="#FFE08A" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Mushroom spectator stools */}
      {stools.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h * 0.5, 0]} material={cream}>
            <cylinderGeometry args={[0.08, 0.1, s.h, 10]} />
          </mesh>
          <mesh
            castShadow
            position={[0, s.h + 0.08, 0]}
            material={i % 2 === 0 ? blush : coral}
          >
            <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Tiny dots on cap */}
          <mesh position={[0.08, s.h + 0.14, 0.06]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#FFF6E8" />
          </mesh>
        </group>
      ))}

      {/* Soft clouds floating around */}
      {[
        [-4.5, 3.2, -3],
        [5, 2.8, -2],
        [-2, 3.6, 5],
        [3.5, 3.0, 4.5],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshBasicMaterial color="#FFF8F0" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0.45, -0.05, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshBasicMaterial color="#FFF8F0" transparent opacity={0.85} />
          </mesh>
          <mesh position={[-0.4, -0.08, 0.1]}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshBasicMaterial color="#FFF8F0" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
