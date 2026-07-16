import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RING_RADIUS } from '../game/constants';
import type { ArenaId } from '../game/types';

type Props = { arenaId?: ArenaId };

/**
 * Five cute / unhinged dohyo skins — candy, bath, disco, snack bar, gravel glam.
 */
export function Arena3D({ arenaId = 'candyDohyo' }: Props) {
  switch (arenaId) {
    case 'bubbleBath':
      return <BubbleBathArena />;
    case 'discoPond':
      return <DiscoPondArena />;
    case 'snackCounter':
      return <SnackCounterArena />;
    case 'gravelGlam':
      return <GravelGlamArena />;
    default:
      return <CandyDohyoArena />;
  }
}

function CandyDohyoArena() {
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
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#FFE8D6" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#D4E8C8" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        material={mint}
      >
        <ringGeometry args={[RING_RADIUS + 0.05, RING_RADIUS + 1.85, 64]} />
      </mesh>
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
      <CenterHeart />
      <CandyRope cream={cream} blush={blush} />
      <mesh position={[0, 0.06, 0]} material={coral}>
        <torusGeometry args={[RING_RADIUS + 0.18, 0.045, 10, 64]} />
      </mesh>
      <StartLines color="#FFF6E8" />
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.08, f.z]}>
          <mesh material={mint} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.12, 6]} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[f.s, 10, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.6} />
          </mesh>
        </group>
      ))}
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
        </group>
      ))}
      <SoftClouds color="#FFF8F0" />
    </group>
  );
}

function BubbleBathArena() {
  const bubbles = useMemo(() => {
    const items: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const r = RING_RADIUS + 0.4 + (i % 4) * 0.35;
      items.push({
        x: Math.cos(a) * r,
        y: 0.15 + (i % 5) * 0.12,
        z: Math.sin(a) * r,
        s: 0.12 + (i % 3) * 0.06,
      });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#D8F0FF" side={THREE.BackSide} />
      </mesh>
      {/* Tub walls */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[RING_RADIUS + 1.1, RING_RADIUS + 1.2, 1.1, 48, 1, true]} />
        <meshStandardMaterial color="#F5FBFF" roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[RING_RADIUS + 1.15, 64]} />
        <meshStandardMaterial color="#E8F6FF" roughness={0.4} />
      </mesh>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
        <circleGeometry args={[RING_RADIUS, 72]} />
        <meshStandardMaterial
          color="#7EC8E3"
          roughness={0.25}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
        <ringGeometry args={[RING_RADIUS * 0.5, RING_RADIUS * 0.95, 48]} />
        <meshBasicMaterial color="#A8E0F0" transparent opacity={0.35} />
      </mesh>
      <CenterHeart color="#FF8FAB" />
      {/* Rubber duckies */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.5;
        const r = RING_RADIUS + 0.85;
        return (
          <group key={i} position={[Math.cos(a) * r, 0.35, Math.sin(a) * r]}>
            <mesh>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#FFD24A" roughness={0.45} />
            </mesh>
            <mesh position={[0.18, 0.08, 0]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshStandardMaterial color="#FFD24A" roughness={0.45} />
            </mesh>
            <mesh position={[0.26, 0.1, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#FF7A3D" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {bubbles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[b.s, 10, 10]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={0.55}
            roughness={0.2}
          />
        </mesh>
      ))}
      <StartLines color="#FFFFFF" />
      {/* Porcelain rim candy */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * RING_RADIUS, 0.14, Math.sin(a) * RING_RADIUS]}
          >
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#FFFFFF' : '#FFB4D0'}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function DiscoPondArena() {
  const disco = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (disco.current) disco.current.rotation.y += dt * 1.4;
  });

  const tiles = useMemo(() => {
    const items: { x: number; z: number; color: string }[] = [];
    const colors = ['#FF5C8A', '#5CE1E6', '#FFE66D', '#C77DFF', '#7CF29C'];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = RING_RADIUS + 1.2;
      items.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#1A1028" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#12081C" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[RING_RADIUS, 72]} />
        <meshStandardMaterial color="#2A1840" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[RING_RADIUS * 0.4, RING_RADIUS * 0.95, 48]} />
        <meshBasicMaterial color="#FF4D8D" transparent opacity={0.25} />
      </mesh>
      <CenterHeart color="#FF4D8D" />
      {/* Neon rope */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a0 = (i / 24) * Math.PI * 2;
        const a1 = ((i + 0.9) / 24) * Math.PI * 2;
        const mid = (a0 + a1) * 0.5;
        const neon = i % 3 === 0 ? '#FF4D8D' : i % 3 === 1 ? '#5CE1E6' : '#FFE66D';
        return (
          <mesh
            key={i}
            position={[Math.cos(mid) * RING_RADIUS, 0.12, Math.sin(mid) * RING_RADIUS]}
            rotation={[0, -mid + Math.PI / 2, Math.PI / 2]}
          >
            <capsuleGeometry args={[0.08, 0.7, 4, 8]} />
            <meshStandardMaterial
              color={neon}
              emissive={neon}
              emissiveIntensity={0.85}
              roughness={0.35}
            />
          </mesh>
        );
      })}
      {/* Disco ball */}
      <mesh ref={disco} position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color="#E8E8F0"
          metalness={0.95}
          roughness={0.15}
          emissive="#FFFFFF"
          emissiveIntensity={0.2}
        />
      </mesh>
      {tiles.map((t, i) => (
        <mesh key={i} position={[t.x, 0.2, t.z]}>
          <boxGeometry args={[0.35, 0.08, 0.35]} />
          <meshStandardMaterial
            color={t.color}
            emissive={t.color}
            emissiveIntensity={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}
      <pointLight position={[0, 3, 0]} intensity={1.2} color="#FF6BB5" distance={14} />
      <pointLight position={[2, 2, 2]} intensity={0.7} color="#5CE1E6" distance={10} />
      <StartLines color="#FFE66D" />
    </group>
  );
}

function SnackCounterArena() {
  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#FFF0D6" side={THREE.BackSide} />
      </mesh>
      {/* Countertop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#C4A484" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[RING_RADIUS, 72]} />
        <meshStandardMaterial color="#F5E6C8" roughness={0.75} />
      </mesh>
      {/* Crumb ring */}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const r = RING_RADIUS * (0.55 + (i % 5) * 0.08);
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.06, Math.sin(a) * r]}
            rotation={[0, a, 0.3]}
          >
            <boxGeometry args={[0.08, 0.04, 0.06]} />
            <meshStandardMaterial color="#E8C89A" roughness={0.9} />
          </mesh>
        );
      })}
      {/* Toast spectators */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.2;
        const r = RING_RADIUS + 1.4;
        return (
          <group key={i} position={[Math.cos(a) * r, 0.25, Math.sin(a) * r]} rotation={[0, -a, 0]}>
            <mesh>
              <boxGeometry args={[0.45, 0.5, 0.08]} />
              <meshStandardMaterial color="#E8B86D" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[0.32, 0.35, 0.02]} />
              <meshStandardMaterial color="#F5D9A0" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
      {/* Jam jar rim */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * RING_RADIUS, 0.12, Math.sin(a) * RING_RADIUS]}
          >
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#C23B22' : '#FFB347'}
              roughness={0.55}
            />
          </mesh>
        );
      })}
      <CenterHeart color="#C23B22" />
      <StartLines color="#FFF6E8" />
      <SoftClouds color="#FFE8C8" />
    </group>
  );
}

function GravelGlamArena() {
  const rocks = useMemo(() => {
    const items: { x: number; z: number; s: number; c: string }[] = [];
    const palette = ['#9A8B7A', '#B8A99A', '#7A6E62', '#C9B8A8', '#FFB4D0'];
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = RING_RADIUS + 0.5 + Math.random() * 2.2;
      items.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.08 + Math.random() * 0.18,
        c: palette[i % palette.length],
      });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#E8DCC8" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#C8B8A0" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[RING_RADIUS, 72]} />
        <meshStandardMaterial color="#D4C4A8" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[RING_RADIUS * 0.5, RING_RADIUS * 0.92, 48]} />
        <meshBasicMaterial color="#B8A890" transparent opacity={0.4} />
      </mesh>
      {/* Glam sequin rim */}
      {Array.from({ length: 32 }).map((_, i) => {
        const a = (i / 32) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * RING_RADIUS, 0.1, Math.sin(a) * RING_RADIUS]}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#FF8FAB' : '#FFE08A'}
              metalness={0.7}
              roughness={0.25}
              emissive={i % 2 === 0 ? '#FF8FAB' : '#FFE08A'}
              emissiveIntensity={0.25}
            />
          </mesh>
        );
      })}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s * 0.4, r.z]} castShadow>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={r.c} roughness={0.9} />
        </mesh>
      ))}
      <CenterHeart color="#FF8FAB" />
      <StartLines color="#FFF6E8" />
    </group>
  );
}

function CenterHeart({ color = '#FF8FAB' }: { color?: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.1, 0.051, -0.06]}>
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.051, -0.06]}>
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function CandyRope({
  cream,
  blush,
}: {
  cream: THREE.MeshStandardMaterial;
  blush: THREE.MeshStandardMaterial;
}) {
  return (
    <>
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
    </>
  );
}

function StartLines({ color }: { color: string }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0.58]}>
        <planeGeometry args={[1.0, 0.07]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, -0.58]}>
        <planeGeometry args={[1.0, 0.07]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
    </>
  );
}

function SoftClouds({ color }: { color: string }) {
  return (
    <>
      {[
        [-4.5, 3.2, -3],
        [5, 2.8, -2],
        [-2, 3.6, 5],
        [3.5, 3.0, 4.5],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0.45, -0.05, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-0.4, -0.08, 0.1]}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}
