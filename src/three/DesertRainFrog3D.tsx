import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createFrogCutout,
  FROG_PHOTOS,
  type FrogCutout,
  type PhotoKey,
} from './frogCutout';
import type { AccessoryId, FighterKit } from '../game/types';
import { CheekHeartEmitter } from './CheekHearts';

type Props = {
  kit?: FighterKit;
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
  cheekImpulse?: number;
};

type CheekSpring = { x: number; v: number };

function Accessory({
  kind,
  height,
  width,
}: {
  kind: AccessoryId;
  height: number;
  width: number;
}) {
  if (kind === 'none' || !kind) return null;
  if (kind === 'bow') {
    return (
      <group position={[0, height * 0.92, 0.08]}>
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.4]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#FF6B9D" roughness={0.45} />
        </mesh>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.4]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#FF6B9D" roughness={0.45} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#FFE08A" roughness={0.4} />
        </mesh>
      </group>
    );
  }
  if (kind === 'shades') {
    return (
      <group position={[0, height * 0.72, 0.06]}>
        <mesh position={[-width * 0.12, 0, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color="#1A1028" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[width * 0.12, 0, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color="#1A1028" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.03]} />
          <meshStandardMaterial color="#1A1028" roughness={0.35} />
        </mesh>
      </group>
    );
  }
  // gold chain
  return (
    <group position={[0, height * 0.38, 0.1]}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - 3) * 0.07, Math.sin(i * 0.7) * 0.04, 0]}
        >
          <torusGeometry args={[0.035, 0.012, 8, 12]} />
          <meshStandardMaterial
            color="#FFE08A"
            metalness={0.9}
            roughness={0.25}
            emissive="#FFE08A"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

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
  cheekImpulse = 0,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cheeks = useRef<THREE.Group>(null);
  const leftCheek = useRef<THREE.Mesh>(null);
  const rightCheek = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const t = useRef(0);
  const leftSpring = useRef<CheekSpring>({ x: 0, v: 0 });
  const rightSpring = useRef<CheekSpring>({ x: 0, v: 0 });
  const lastImpulse = useRef(0);
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
      cheekScale: 1.15,
      jiggle: 1.1,
      accessory: 'none',
    } as FighterKit;
  }, [kit, variant]);

  const cheekScale = resolved.cheekScale ?? 1;
  const jiggleMul = resolved.jiggle ?? 1;
  const accessory = (resolved.accessory ?? 'none') as AccessoryId;

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
  }, [resolved.photoKey, resolved.tint, resolved.cutMode]);

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

  const cheekMat = useMemo(() => {
    const color = cutout?.cheekColor ?? '#E8B4A0';
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92,
    });
  }, [cutout?.cheekColor]);

  const blushMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: superReady ? '#FF6B9D' : '#FF8FAB',
      roughness: 0.55,
      transparent: true,
      opacity: 0.35,
      emissive: superReady ? '#FF6B9D' : '#FF8FAB',
      emissiveIntensity: superReady ? 0.35 : 0.12,
    });
  }, [superReady]);

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

    const tw =
      Math.max(
        twerk,
        charging ? 0.55 + charge * 0.45 : 0,
        Math.min(0.55, speed * 0.08),
        superReady ? 0.35 : 0,
      ) * jiggleMul;

    // Impulse into opposing cheek springs
    if (cheekImpulse > lastImpulse.current + 0.05) {
      const kick = (cheekImpulse - lastImpulse.current) * 2.2;
      leftSpring.current.v -= kick * (0.8 + Math.random() * 0.4);
      rightSpring.current.v += kick * (0.8 + Math.random() * 0.4);
    }
    lastImpulse.current = cheekImpulse;

    const stiffness = 48;
    const damping = 8;
    for (const s of [leftSpring.current, rightSpring.current]) {
      const a = -stiffness * s.x - damping * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
    }

    const twerkHz = 14 + tw * 18;
    const wave = Math.sin(t.current * twerkHz);
    const wave2 = Math.sin(t.current * twerkHz * 1.15 + 1.2);
    const breathe = 1 + Math.sin(t.current * 2.2) * 0.022;
    const cheekPump = 1 + tw * 0.22 + squish * 0.14 + charge * (charging ? 0.18 : 0);
    const superPulse = superReady ? 1 + Math.sin(t.current * 8) * 0.05 : 1;

    const sx = (1 + squish * 0.4) * cheekPump * superPulse;
    const sy = (1 - squish * 0.32) * breathe * (1 + Math.abs(wave) * tw * 0.06);

    body.current.scale.set(sx, sy, 1);
    body.current.position.y = Math.abs(wave) * tw * 0.05;
    body.current.rotation.z = wave * tw * 0.06;

    cheeks.current.position.y = height * 0.22;
    cheeks.current.rotation.z = wave * tw * 0.1;

    if (leftCheek.current && rightCheek.current) {
      const base = cheekScale * (1 + tw * 0.28 + (charging ? charge * 0.2 : 0));
      const lx = base * (1 + leftSpring.current.x * 0.35 + wave * 0.12 * tw);
      const ly = base * (1 - leftSpring.current.x * 0.2 - wave * 0.08 * tw);
      const lz = base * (1.15 + tw * 0.25 + Math.abs(leftSpring.current.x) * 0.3);
      const rx = base * (1 + rightSpring.current.x * 0.35 - wave2 * 0.12 * tw);
      const ry = base * (1 - rightSpring.current.x * 0.2 + wave2 * 0.08 * tw);
      const rz = base * (1.15 + tw * 0.25 + Math.abs(rightSpring.current.x) * 0.3);

      leftCheek.current.scale.set(lx, ly, lz);
      rightCheek.current.scale.set(rx, ry, rz);
      leftCheek.current.position.y = wave * tw * 0.06 + leftSpring.current.x * 0.04;
      rightCheek.current.position.y =
        -wave2 * tw * 0.06 + rightSpring.current.x * 0.04;
    }

    blushMat.opacity =
      0.28 + (charging ? charge * 0.35 : 0) + (superReady ? 0.25 : 0) + tw * 0.12;

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
  const cheekR = Math.max(0.16, w * 0.18);
  const heartRate =
    (charging ? 0.45 + charge * 0.9 : 0) +
    (superReady ? 0.4 : 0) +
    Math.min(0.5, twerk * 0.55) +
    Math.min(0.3, speed * 0.05) +
    Math.min(0.6, cheekImpulse * 0.25);

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
        {/* 3D bubble cheeks sit slightly behind photo plane */}
        <group ref={cheeks} position={[0, height * 0.22, -0.06]}>
          <mesh
            ref={leftCheek}
            position={[-w * 0.2, 0, 0]}
            castShadow
            renderOrder={2}
          >
            <sphereGeometry args={[cheekR, 24, 20]} />
            <primitive object={cheekMat} attach="material" />
          </mesh>
          <mesh
            ref={rightCheek}
            position={[w * 0.2, 0, 0]}
            castShadow
            renderOrder={2}
          >
            <sphereGeometry args={[cheekR, 24, 20]} />
            <primitive object={cheekMat} attach="material" />
          </mesh>
          {/* Blush caps */}
          <mesh position={[-w * 0.2, -cheekR * 0.15, cheekR * 0.55]} renderOrder={3}>
            <sphereGeometry args={[cheekR * 0.55, 16, 12]} />
            <primitive object={blushMat} attach="material" />
          </mesh>
          <mesh position={[w * 0.2, -cheekR * 0.15, cheekR * 0.55]} renderOrder={3}>
            <sphereGeometry args={[cheekR * 0.55, 16, 12]} />
            <primitive object={blushMat} attach="material" />
          </mesh>
          <CheekHeartEmitter
            active={heartRate > 0.08}
            intensity={heartRate}
            width={w}
            height={height}
          />
        </group>

        <mesh position={[0, height * 0.5, 0.04]} material={material} renderOrder={4}>
          <planeGeometry args={[w, height]} />
        </mesh>

        <Accessory kind={accessory} height={height} width={w} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} renderOrder={1}>
        <circleGeometry args={[Math.max(0.22, w * 0.24), 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {charging && charge > 0.05 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[w * 0.26, w * 0.26 + 0.08 + charge * 0.18, 48]} />
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
          <ringGeometry args={[w * 0.32, w * 0.4, 48]} />
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
