'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Color Palette ---
const PALETTE = {
  snow: '#f4f8ff',
  snowShadow: '#d8e6f8',
  ice: '#7dd3fc',
  earth: '#3b2818',
  stone: '#525b6c',
  sleighRed: '#b91c1c',
  sleighDarkRed: '#7f1d1d',
  gold: '#fbbf24',
  brass: '#d97706',
  wood: '#78350f',
  woodLight: '#b45309',
  pineDark: '#064e3b',
  pineMid: '#047857',
  pineLight: '#10b981',
  santaRed: '#dc2626',
  furWhite: '#ffffff',
  skin: '#fed7aa',
  skinRosy: '#f87171',
  beltBlack: '#18181b',
  sackBurlap: '#a16207',
  reindeerFur: '#854d0e',
  reindeerBelly: '#ca8a04',
  reindeerDark: '#422006',
  antler: '#fde68a',
  rudolphNose: '#ff1111',
  elfGreen: '#15803d',
  elfGreenLight: '#22c55e',
  elfBlue: '#1d4ed8',
  presentColors: ['#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
  ribbonColors: ['#fde047', '#ffffff', '#fbbf24', '#67e8f9'],
};

// --- Helper Components ---

function GiftBox({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  colorIndex = 0,
  ribbonIndex = 0,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  colorIndex?: number;
  ribbonIndex?: number;
}) {
  const boxColor = PALETTE.presentColors[colorIndex % PALETTE.presentColors.length];
  const ribbonColor = PALETTE.ribbonColors[ribbonIndex % PALETTE.ribbonColors.length];
  const s: [number, number, number] = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <group position={position} rotation={rotation} scale={s}>
      {/* Main Box */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={boxColor} roughness={0.4} />
      </mesh>
      {/* Lid */}
      <mesh castShadow position={[0, 0.39, 0]}>
        <boxGeometry args={[0.43, 0.08, 0.43]} />
        <meshStandardMaterial color={boxColor} roughness={0.35} />
      </mesh>
      {/* Ribbon Cross 1 */}
      <mesh castShadow position={[0, 0.21, 0]}>
        <boxGeometry args={[0.44, 0.43, 0.08]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Ribbon Cross 2 */}
      <mesh castShadow position={[0, 0.21, 0]}>
        <boxGeometry args={[0.08, 0.43, 0.44]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Bow Loops */}
      <mesh castShadow position={[-0.07, 0.46, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.06, 0.02, 8, 16]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0.07, 0.46, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[0.06, 0.02, 8, 16]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.3} roughness={0.2} />
      </mesh>
    </group>
  );
}

// --- Diorama Base & Terrain ---
function DioramaIsland() {
  return (
    <group position={[0, 0, 0]}>
      {/* Wooden Display Pedestal Rim */}
      <mesh position={[0, -1.65, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.5, 9.8, 0.5, 64]} />
        <meshStandardMaterial color="#27170c" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <cylinderGeometry args={[9.3, 9.5, 0.15, 64]} />
        <meshStandardMaterial color={PALETTE.gold} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Rocky Ice Under-crust */}
      <mesh position={[0, -0.75, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.1, 8.6, 1.1, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>

      {/* Main Snow Cap Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.25, 9.15, 0.4, 64]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.7} />
      </mesh>

      {/* Rolling Snow Hills in Background */}
      <mesh position={[-3.8, -0.2, -3.5]} scale={[1.4, 0.55, 1.2]} receiveShadow castShadow>
        <sphereGeometry args={[3.2, 32, 24]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.75} />
      </mesh>
      <mesh position={[3.5, -0.3, -4.0]} scale={[1.5, 0.48, 1.1]} receiveShadow castShadow>
        <sphereGeometry args={[2.8, 32, 24]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.75} />
      </mesh>
      <mesh position={[-5.2, -0.35, 2.0]} scale={[1.1, 0.4, 1.3]} receiveShadow castShadow>
        <sphereGeometry args={[2.2, 24, 18]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.75} />
      </mesh>

      {/* Frozen Pond Patch */}
      <mesh position={[4.2, 0.11, 3.2]} rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow>
        <circleGeometry args={[1.8, 32]} />
        <meshStandardMaterial
          color="#bae6fd"
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Snow bank around pond */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[4.2 + Math.cos(angle) * 1.75, 0.12, 3.2 + Math.sin(angle) * 1.75]}
            scale={[1.4, 0.5, 1]}
            receiveShadow
          >
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color={PALETTE.snow} roughness={0.8} />
          </mesh>
        );
      })}

      {/* Hanging Icicles around the Diorama Rim */}
      {Array.from({ length: 28 }).map((_, idx) => {
        const angle = (idx / 28) * Math.PI * 2;
        const r = 9.18;
        const h = 0.35 + ((idx * 7) % 5) * 0.12;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * r, -0.25 - h / 2, Math.sin(angle) * r]}
            rotation={[Math.PI, 0, 0]}
            castShadow
          >
            <coneGeometry args={[0.11, h, 8]} />
            <meshStandardMaterial
              color="#e0f2fe"
              roughness={0.15}
              metalness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// --- Snow-covered Pine Tree with Optional Fairy Lights ---
function PineTree({
  position,
  scale = 1,
  decorated = false,
}: {
  position: [number, number, number];
  scale?: number;
  decorated?: boolean;
}) {
  const lightsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (decorated && lightsRef.current) {
      const t = clock.getElapsedTime();
      lightsRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = 1.0 + 0.8 * Math.sin(t * 3.5 + idx * 1.3);
        }
      });
    }
  });

  const baubleColors = ['#ef4444', '#fbbf24', '#38bdf8', '#a855f7', '#4ade80'];

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.9, 12]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
      </mesh>

      {/* 4 Foliage Tiers + Snow Caps */}
      {[
        { y: 1.1, r: 1.15, h: 1.2, snowY: 1.18, snowR: 0.98 },
        { y: 1.85, r: 0.92, h: 1.1, snowY: 1.92, snowR: 0.78 },
        { y: 2.5, r: 0.68, h: 0.95, snowY: 2.56, snowR: 0.56 },
        { y: 3.05, r: 0.42, h: 0.75, snowY: 3.1, snowR: 0.34 },
      ].map((tier, i) => (
        <group key={i}>
          <mesh position={[0, tier.y, 0]} castShadow receiveShadow>
            <coneGeometry args={[tier.r, tier.h, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? PALETTE.pineDark : PALETTE.pineMid} roughness={0.75} />
          </mesh>
          {/* Snow cap layer slightly offset */}
          <mesh position={[0, tier.snowY, 0]} receiveShadow>
            <coneGeometry args={[tier.snowR, tier.h * 0.68, 16]} />
            <meshStandardMaterial color={PALETTE.snow} roughness={0.65} />
          </mesh>
        </group>
      ))}

      {decorated && (
        <>
          {/* Glowing Star on Top */}
          <mesh position={[0, 3.52, 0]} rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#facc15"
              emissiveIntensity={2.2}
              roughness={0.2}
            />
          </mesh>
          {/* Glowing Ornaments */}
          <group ref={lightsRef}>
            {Array.from({ length: 14 }).map((_, i) => {
              const frac = i / 14;
              const y = 0.8 + frac * 2.2;
              const radius = (1 - frac * 0.72) * 0.95;
              const angle = i * 2.2;
              const c = baubleColors[i % baubleColors.length];
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
                >
                  <sphereGeometry args={[0.075, 12, 12]} />
                  <meshStandardMaterial
                    color={c}
                    emissive={c}
                    emissiveIntensity={1.4}
                    roughness={0.2}
                  />
                </mesh>
              );
            })}
          </group>
        </>
      )}
    </group>
  );
}

// --- Cozy North Pole Toy Workshop Cottage ---
function ToyWorkshop({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const smokeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (smokeRef.current) {
      smokeRef.current.children.forEach((puff, i) => {
        const progress = ((t * 0.45 + i * 0.25) % 1);
        puff.position.y = progress * 2.2;
        puff.position.x = Math.sin(t * 1.5 + i) * 0.18 * progress;
        const s = 0.2 + progress * 0.35;
        puff.scale.set(s, s, s);
        const mat = (puff as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) mat.opacity = (1 - progress) * 0.55;
      });
    }
  });

  return (
    <group position={position} rotation={rotation as any}>
      {/* Stone Foundation */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.4, 2.6]} />
        <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
      </mesh>

      {/* Log Cabin Walls */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 1.9, 2.3]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.8} />
      </mesh>

      {/* Corner Timber Pillars */}
      {[
        [-1.55, 1.35, -1.15],
        [1.55, 1.35, -1.15],
        [-1.55, 1.35, 1.15],
        [1.55, 1.35, 1.15],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 2.0, 12]} />
          <meshStandardMaterial color="#451a03" roughness={0.85} />
        </mesh>
      ))}

      {/* Gable Roof Base */}
      <mesh position={[0, 2.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.65, 1.5, 4]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
      </mesh>

      {/* Thick Snow Blanket on Roof */}
      <mesh position={[0, 2.98, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.68, 1.42, 4]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.65} />
      </mesh>

      {/* Chimney */}
      <group position={[0.95, 2.9, -0.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 1.3, 0.5]} />
          <meshStandardMaterial color="#991b1b" roughness={0.85} />
        </mesh>
        {/* Snow Rim on Chimney */}
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[0.6, 0.14, 0.6]} />
          <meshStandardMaterial color={PALETTE.snow} roughness={0.6} />
        </mesh>
        {/* Animated Chimney Smoke */}
        <group ref={smokeRef} position={[0, 0.85, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.45, 12, 12]} />
              <meshStandardMaterial color="#e2e8f0" transparent opacity={0.4} roughness={1} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Arched Wooden Door */}
      <group position={[0, 1.0, 1.16]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 1.25, 0.08]} />
          <meshStandardMaterial color="#451a03" roughness={0.7} />
        </mesh>
        {/* Holiday Wreath on Door */}
        <mesh position={[0, 0.2, 0.06]}>
          <torusGeometry args={[0.2, 0.06, 12, 24]} />
          <meshStandardMaterial color={PALETTE.pineLight} roughness={0.6} />
        </mesh>
        {/* Wreath Red Bow */}
        <mesh position={[0, 0.38, 0.1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Brass Door Knob */}
        <mesh position={[0.24, -0.05, 0.07]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Warm Glowing Windows (Front Left, Front Right, Side) */}
      {[
        { pos: [-0.95, 1.35, 1.16], rot: [0, 0, 0] },
        { pos: [0.95, 1.35, 1.16], rot: [0, 0, 0] },
        { pos: [1.56, 1.35, 0], rot: [0, Math.PI / 2, 0] },
      ].map((win, idx) => (
        <group key={idx} position={win.pos as [number, number, number]} rotation={win.rot as any}>
          <mesh>
            <boxGeometry args={[0.62, 0.62, 0.06]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              roughness={0.2}
            />
          </mesh>
          {/* Window Frame Crossbars */}
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.68, 0.06, 0.04]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.06, 0.68, 0.04]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          {/* Snow Window Sill */}
          <mesh position={[0, -0.34, 0.08]}>
            <boxGeometry args={[0.72, 0.1, 0.16]} />
            <meshStandardMaterial color={PALETTE.snow} />
          </mesh>
        </group>
      ))}

      {/* Warm Window PointLight */}
      <pointLight position={[0, 1.4, 1.8]} color="#fb923c" intensity={3.5} distance={6} />
    </group>
  );
}

// --- Iconic North Pole Candy-Cane Signpost & Lantern ---
function NorthPoleSignpost({ position }: { position: [number, number, number] }) {
  const lanternRef = useRef<THREE.Group>(null);

  // Procedural candy cane striped texture
  const candyTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#dc2626';
      for (let i = -128; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 16, 0);
        ctx.lineTo(i + 16 + 128, 128);
        ctx.lineTo(i + 128, 128);
        ctx.closePath();
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (lanternRef.current) {
      lanternRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2.2) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Snow Mound Base */}
      <mesh position={[0, 0.12, 0]} scale={[1, 0.5, 1]} receiveShadow>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshStandardMaterial color={PALETTE.snow} />
      </mesh>

      {/* Striped Pole */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 2.2, 20]} />
        <meshStandardMaterial map={candyTexture} roughness={0.3} />
      </mesh>

      {/* Golden Finial Ball on Top */}
      <mesh position={[0, 2.32, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Wooden Directional Planks */}
      <group position={[0, 1.85, 0]} rotation={[0, 0.4, 0]}>
        <mesh position={[0.42, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.22, 0.06]} />
          <meshStandardMaterial color={PALETTE.woodLight} roughness={0.7} />
        </mesh>
        {/* Snow on sign plank */}
        <mesh position={[0.42, 0.12, 0]}>
          <boxGeometry args={[0.83, 0.04, 0.07]} />
          <meshStandardMaterial color={PALETTE.snow} />
        </mesh>
      </group>

      <group position={[0, 1.52, 0]} rotation={[0, -0.5, 0]}>
        <mesh position={[-0.38, 0, 0]} castShadow>
          <boxGeometry args={[0.75, 0.2, 0.06]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
      </group>

      {/* Lantern Arm & Swinging Warm Lantern */}
      <mesh position={[0.25, 2.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} />
      </mesh>
      <group ref={lanternRef} position={[0.46, 2.06, 0]}>
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.22, 8]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={3}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <coneGeometry args={[0.13, 0.08, 8]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} />
        </mesh>
        <pointLight position={[0, -0.2, 0]} color="#fbbf24" intensity={2.2} distance={5} />
      </group>
    </group>
  );
}

// --- Santa's Ornate Sleigh & Overflowing Toy Sack ---
function SantasSleigh({
  position,
  rotation = [0, 0, 0],
  sackScaleBonus = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  sackScaleBonus?: number;
}) {
  const sackRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (sackRef.current) {
      const t = clock.getElapsedTime();
      // Subtle jiggle as elves load presents into the sack
      const pulse = 1 + Math.sin(t * 4) * 0.025 + sackScaleBonus;
      sackRef.current.scale.set(pulse, 1 + Math.cos(t * 4) * 0.03 + sackScaleBonus, pulse);
    }
  });

  return (
    <group position={position} rotation={rotation as any}>
      {/* Golden Runners (Left & Right) */}
      {[-0.82, 0.82].map((x, idx) => (
        <group key={idx} position={[x, 0.08, 0]}>
          {/* Main Horizontal Blade */}
          <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.08, 0.07, 3.4]} />
            <meshStandardMaterial color={PALETTE.gold} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Front Curled Tip */}
          <mesh position={[0, 0.32, 1.75]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.32, 0.04, 12, 24, Math.PI * 1.15]} />
            <meshStandardMaterial color={PALETTE.gold} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Vertical Struts Connecting Runner to Body */}
          {[-0.9, 0, 0.85].map((z, sIdx) => (
            <mesh key={sIdx} position={[0, 0.25, z]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color={PALETTE.gold} metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Sleigh Floor Base */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.14, 2.6]} />
        <meshStandardMaterial color={PALETTE.sleighDarkRed} roughness={0.4} />
      </mesh>

      {/* Sleigh Side Panels with Gold Trim */}
      {[-0.8, 0.8].map((x, idx) => (
        <group key={idx} position={[x, 0.88, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.78, 2.5]} />
            <meshStandardMaterial color={PALETTE.sleighRed} roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Elevated Rear Side Sweeps */}
          <mesh position={[0, 0.25, -0.85]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.11, 0.55, 0.9]} />
            <meshStandardMaterial color={PALETTE.sleighRed} roughness={0.3} />
          </mesh>
          {/* Gold Trim Rail */}
          <mesh position={[x > 0 ? 0.05 : -0.05, 0.38, 0.1]}>
            <boxGeometry args={[0.04, 0.06, 2.45]} />
            <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Sleigh High Curved Backrest */}
      <mesh position={[0, 1.15, -1.22]} rotation={[-0.18, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 1.25, 0.14]} />
        <meshStandardMaterial color={PALETTE.sleighRed} roughness={0.3} />
      </mesh>
      {/* Backrest Gold Crest */}
      <mesh position={[0, 1.78, -1.32]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.72, 16]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.18} />
      </mesh>

      {/* Sleigh Front Curved Dashboard Shield */}
      <mesh position={[0, 0.86, 1.22]} rotation={[0.35, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.66, 0.78, 0.12]} />
        <meshStandardMaterial color={PALETTE.sleighRed} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.22, 1.35]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.7, 16]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.18} />
      </mesh>

      {/* Plush Velvet Bench Seat */}
      <mesh position={[0, 0.68, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.25, 0.75]} />
        <meshStandardMaterial color="#450a0a" roughness={0.75} />
      </mesh>

      {/* Side Sleigh Lanterns */}
      {[-0.92, 0.92].map((x, idx) => (
        <mesh key={idx} position={[x, 1.15, 1.05]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
      ))}

      {/* --- Santa's Giant Toy Sack in Rear Compartment --- */}
      <group ref={sackRef} position={[0, 1.15, -0.58]}>
        {/* Lower Sack Bulge */}
        <mesh castShadow receiveShadow scale={[1.15, 1.0, 0.95]}>
          <sphereGeometry args={[0.72, 24, 20]} />
          <meshStandardMaterial color={PALETTE.sackBurlap} roughness={0.9} />
        </mesh>
        {/* Upper Sack Shoulder */}
        <mesh position={[0, 0.45, 0.05]} castShadow receiveShadow scale={[0.95, 0.8, 0.85]}>
          <sphereGeometry args={[0.58, 20, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.88} />
        </mesh>
        {/* Golden Rope Cinch Collar */}
        <mesh position={[0, 0.82, 0.06]} rotation={[Math.PI / 2 + 0.1, 0, 0]}>
          <torusGeometry args={[0.36, 0.055, 12, 24]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Open Ruffled Sack Rim */}
        <mesh position={[0, 0.96, 0.06]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.34, 0.26, 18, 1, true]} />
          <meshStandardMaterial color={PALETTE.sackBurlap} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>

        {/* Presents & Candy Cane Peeking Out of the Top of the Sack */}
        <GiftBox position={[-0.16, 0.88, 0.1]} rotation={[0.2, 0.4, -0.15]} scale={0.75} colorIndex={0} ribbonIndex={0} />
        <GiftBox position={[0.18, 0.92, 0.02]} rotation={[-0.15, -0.3, 0.2]} scale={0.7} colorIndex={1} ribbonIndex={1} />
        <GiftBox position={[0.0, 1.02, -0.12]} rotation={[0.1, 0.8, 0.1]} scale={0.65} colorIndex={4} ribbonIndex={2} />
      </group>
    </group>
  );
}

// --- Jolly Santa Claus ---
function SantaClaus({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const santaRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (santaRef.current) {
      // Jolly belly breathing bounce
      santaRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.03;
    }
    if (rightArmRef.current) {
      // Friendly wave / cheering gesture toward the elves & reindeer
      rightArmRef.current.rotation.z = -2.35 + Math.sin(t * 4.5) * 0.22;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.2) * 0.25;
      headRef.current.rotation.z = Math.sin(t * 2.5) * 0.04;
    }
  });

  return (
    <group ref={santaRef} position={position} rotation={rotation as any}>
      {/* Boots */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i} position={[x, 0.16, 0]}>
          <mesh castShadow position={[0, 0, 0.05]}>
            <boxGeometry args={[0.22, 0.28, 0.34]} />
            <meshStandardMaterial color={PALETTE.beltBlack} roughness={0.4} />
          </mesh>
          {/* Red Pants Leg */}
          <mesh castShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.13, 0.12, 0.4, 12]} />
            <meshStandardMaterial color={PALETTE.santaRed} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Jolly Round Belly / Coat Torso */}
      <mesh position={[0, 0.92, 0]} scale={[1.08, 1.15, 1.02]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color={PALETTE.santaRed} roughness={0.55} />
      </mesh>

      {/* White Fur Bottom Coat Trim */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.54, 0.16, 24]} />
        <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
      </mesh>

      {/* Vertical White Fur Coat Trim */}
      <mesh position={[0, 0.95, 0.47]} castShadow>
        <boxGeometry args={[0.14, 0.85, 0.1]} />
        <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
      </mesh>

      {/* Black Leather Belt */}
      <mesh position={[0, 0.84, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.51, 0.065, 12, 32]} />
        <meshStandardMaterial color={PALETTE.beltBlack} roughness={0.35} />
      </mesh>
      {/* Golden Belt Buckle */}
      <mesh position={[0, 0.84, 0.54]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.05]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Left Arm (holding Golden Naughty & Nice Scroll) */}
      <group position={[-0.48, 1.22, 0.1]} rotation={[0.4, 0, 0.45]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.45, 12]} />
          <meshStandardMaterial color={PALETTE.santaRed} roughness={0.55} />
        </mesh>
        {/* White Fur Cuff */}
        <mesh position={[0, -0.44, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 12]} />
          <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
        </mesh>
        {/* Green Mitten */}
        <mesh position={[0, -0.54, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={PALETTE.elfGreen} roughness={0.6} />
        </mesh>
        {/* Golden Scroll in Hand */}
        <mesh position={[0.05, -0.56, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.36, 12]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Right Arm (Waving Cheerfully) */}
      <group ref={rightArmRef} position={[0.48, 1.25, 0.05]} rotation={[0, 0, -2.3]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.46, 12]} />
          <meshStandardMaterial color={PALETTE.santaRed} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 12]} />
          <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.54, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={PALETTE.elfGreen} roughness={0.6} />
        </mesh>
      </group>

      {/* Head & Beard & Hat Group */}
      <group ref={headRef} position={[0, 1.54, 0]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.31, 24, 24]} />
          <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
        </mesh>

        {/* Rosy Cheeks & Nose */}
        <mesh position={[0, 0.0, 0.31]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={PALETTE.skinRosy} roughness={0.4} />
        </mesh>
        <mesh position={[-0.16, -0.02, 0.26]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={PALETTE.skinRosy} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0.16, -0.02, 0.26]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={PALETTE.skinRosy} transparent opacity={0.65} />
        </mesh>

        {/* Eyes & Bushy White Eyebrows */}
        {[-0.1, 0.1].map((x, idx) => (
          <group key={idx}>
            <mesh position={[x, 0.08, 0.28]}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial color="#111827" roughness={0.2} />
            </mesh>
            <mesh position={[x, 0.15, 0.27]} rotation={[0, 0, x < 0 ? 0.15 : -0.15]}>
              <boxGeometry args={[0.09, 0.035, 0.04]} />
              <meshStandardMaterial color={PALETTE.furWhite} />
            </mesh>
          </group>
        ))}

        {/* Lush Multi-Sphere White Beard & Mustache */}
        <group position={[0, -0.12, 0.18]}>
          <mesh position={[0, -0.08, 0.04]} scale={[1.15, 1.2, 0.85]} castShadow>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
          </mesh>
          <mesh position={[-0.16, 0.02, 0.0]} castShadow>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
          </mesh>
          <mesh position={[0.16, 0.02, 0.0]} castShadow>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]} castShadow>
            <sphereGeometry args={[0.17, 14, 14]} />
            <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
          </mesh>
          {/* Mustache */}
          <mesh position={[-0.08, 0.07, 0.13]} rotation={[0, 0, 0.25]} scale={[1.3, 0.6, 0.7]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={PALETTE.furWhite} />
          </mesh>
          <mesh position={[0.08, 0.07, 0.13]} rotation={[0, 0, -0.25]} scale={[1.3, 0.6, 0.7]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={PALETTE.furWhite} />
          </mesh>
        </group>

        {/* Santa Hat Brim */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} castShadow>
          <torusGeometry args={[0.29, 0.085, 14, 28]} />
          <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
        </mesh>
        {/* Santa Hat Cone */}
        <mesh position={[-0.04, 0.5, -0.05]} rotation={[-0.25, 0, 0.22]} castShadow>
          <coneGeometry args={[0.28, 0.62, 20]} />
          <meshStandardMaterial color={PALETTE.santaRed} roughness={0.55} />
        </mesh>
        {/* Hat Pom-Pom */}
        <mesh position={[-0.14, 0.78, -0.14]} castShadow>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color={PALETTE.furWhite} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// --- Harnessed Reindeer ---
function Reindeer({
  position,
  rotation = [0, 0, 0],
  isRudolph = false,
  phaseOffset = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  isRudolph?: boolean;
  phaseOffset?: number;
}) {
  const headGroupRef = useRef<THREE.Group>(null);
  const frontRightLegRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phaseOffset;
    if (headGroupRef.current) {
      // Gentle head bobbing and alert ear/antler sway
      headGroupRef.current.rotation.x = Math.sin(t * 2.4) * 0.08;
      headGroupRef.current.rotation.y = Math.cos(t * 1.6) * 0.08;
    }
    if (frontRightLegRef.current) {
      // Eager pawing at the snow
      frontRightLegRef.current.rotation.x = Math.max(0, Math.sin(t * 3.8)) * 0.45;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 6) * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation as any}>
      {/* Torso */}
      <mesh position={[0, 0.78, 0]} scale={[0.72, 0.78, 1.35]} castShadow receiveShadow>
        <sphereGeometry args={[0.38, 20, 18]} />
        <meshStandardMaterial color={PALETTE.reindeerFur} roughness={0.75} />
      </mesh>

      {/* Lighter Chest Patch */}
      <mesh position={[0, 0.76, 0.36]} scale={[0.55, 0.65, 0.5]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={PALETTE.reindeerBelly} roughness={0.8} />
      </mesh>

      {/* Red & Gold Festive Saddle Harness Strap */}
      <mesh position={[0, 0.8, 0.08]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.29, 0.04, 10, 24]} />
        <meshStandardMaterial color={PALETTE.santaRed} roughness={0.4} />
      </mesh>
      {/* Golden Jingle Bells on Harness */}
      {[-0.28, 0.28].map((x, idx) => (
        <mesh key={idx} position={[x, 0.82, 0.08]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Fluffy Tail */}
      <mesh ref={tailRef} position={[0, 0.92, -0.52]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.22, 10]} />
        <meshStandardMaterial color={PALETTE.reindeerBelly} roughness={0.8} />
      </mesh>

      {/* 4 Legs + Dark Hooves */}
      {[
        { pos: [-0.16, 0.55, 0.3], pawing: false },
        { pos: [0.16, 0.55, 0.3], pawing: true },
        { pos: [-0.16, 0.55, -0.32], pawing: false },
        { pos: [0.16, 0.55, -0.32], pawing: false },
      ].map((leg, i) => (
        <group
          key={i}
          ref={leg.pawing ? frontRightLegRef : undefined}
          position={leg.pos as [number, number, number]}
        >
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.05, 0.48, 10]} />
            <meshStandardMaterial color={PALETTE.reindeerFur} roughness={0.75} />
          </mesh>
          {/* Hoof */}
          <mesh position={[0, -0.49, 0.01]} castShadow>
            <cylinderGeometry args={[0.055, 0.065, 0.09, 10]} />
            <meshStandardMaterial color={PALETTE.reindeerDark} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Neck & Animated Head Group */}
      <group ref={headGroupRef} position={[0, 1.0, 0.38]}>
        {/* Neck */}
        <mesh position={[0, 0.14, 0.05]} rotation={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.18, 0.38, 12]} />
          <meshStandardMaterial color={PALETTE.reindeerFur} roughness={0.75} />
        </mesh>

        {/* Collar with Gold Bell */}
        <mesh position={[0, 0.14, 0.06]} rotation={[Math.PI / 2 + 0.35, 0, 0]}>
          <torusGeometry args={[0.155, 0.03, 10, 20]} />
          <meshStandardMaterial color={PALETTE.santaRed} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.06, 0.21]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.35, 0.18]} scale={[0.85, 0.85, 1.15]} castShadow>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color={PALETTE.reindeerFur} roughness={0.7} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 0.31, 0.38]} scale={[0.75, 0.68, 1.0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={PALETTE.reindeerBelly} roughness={0.75} />
        </mesh>

        {/* Nose (Glowing Red for Rudolph, Dark Brown for others) */}
        <mesh position={[0, 0.34, 0.5]}>
          <sphereGeometry args={[isRudolph ? 0.068 : 0.048, 14, 14]} />
          <meshStandardMaterial
            color={isRudolph ? PALETTE.rudolphNose : PALETTE.reindeerDark}
            emissive={isRudolph ? '#ff0000' : '#000000'}
            emissiveIntensity={isRudolph ? 3.5 : 0}
            roughness={0.2}
          />
        </mesh>
        {isRudolph && (
          <pointLight position={[0, 0.35, 0.6]} color="#ff2222" intensity={2.2} distance={3.5} />
        )}

        {/* Eyes */}
        {[-0.12, 0.12].map((x, idx) => (
          <mesh key={idx} position={[x, 0.39, 0.31]}>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshStandardMaterial color="#111827" roughness={0.15} />
          </mesh>
        ))}

        {/* Ears */}
        {[-0.18, 0.18].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0.45, 0.1]}
            rotation={[0, 0, x < 0 ? 0.6 : -0.6]}
            scale={[0.6, 1.2, 0.4]}
          >
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color={PALETTE.reindeerFur} />
          </mesh>
        ))}

        {/* Branched Antlers */}
        {[-1, 1].map((dir) => (
          <group key={dir} position={[dir * 0.11, 0.52, 0.12]} rotation={[0, 0, dir * -0.35]}>
            {/* Main Antler Beam */}
            <mesh position={[0, 0.18, -0.04]} rotation={[-0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.032, 0.42, 8]} />
              <meshStandardMaterial color={PALETTE.antler} roughness={0.6} />
            </mesh>
            {/* Branch 1 */}
            <mesh position={[dir * 0.06, 0.18, 0.04]} rotation={[0.4, 0, dir * -0.6]} castShadow>
              <cylinderGeometry args={[0.016, 0.022, 0.2, 8]} />
              <meshStandardMaterial color={PALETTE.antler} roughness={0.6} />
            </mesh>
            {/* Branch 2 */}
            <mesh position={[dir * -0.05, 0.28, -0.05]} rotation={[-0.3, 0, dir * 0.55]} castShadow>
              <cylinderGeometry args={[0.015, 0.02, 0.18, 8]} />
              <meshStandardMaterial color={PALETTE.antler} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// --- Golden Reins Connecting Sleigh & Reindeer Team ---
function GoldenReins() {
  const reinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.gold,
        metalness: 0.75,
        roughness: 0.25,
      }),
    []
  );

  // Create draped curves along left & right reindeer lines up to Rudolph
  const curves = useMemo(() => {
    const leftPoints = [
      new THREE.Vector3(-0.62, 1.15, -0.35), // Sleigh front
      new THREE.Vector3(-0.62, 0.92, 0.65),
      new THREE.Vector3(-0.62, 1.08, 1.55), // Row 1
      new THREE.Vector3(-0.62, 0.92, 2.5),
      new THREE.Vector3(-0.62, 1.08, 3.35), // Row 2
      new THREE.Vector3(-0.32, 0.96, 4.25),
      new THREE.Vector3(0.0, 1.08, 5.05), // Rudolph
    ];
    const rightPoints = [
      new THREE.Vector3(0.62, 1.15, -0.35),
      new THREE.Vector3(0.62, 0.92, 0.65),
      new THREE.Vector3(0.62, 1.08, 1.55),
      new THREE.Vector3(0.62, 0.92, 2.5),
      new THREE.Vector3(0.62, 1.08, 3.35),
      new THREE.Vector3(0.32, 0.96, 4.25),
      new THREE.Vector3(0.0, 1.08, 5.05),
    ];
    return [
      new THREE.CatmullRomCurve3(leftPoints),
      new THREE.CatmullRomCurve3(rightPoints),
    ];
  }, []);

  return (
    <group>
      {curves.map((curve, idx) => (
        <mesh key={idx} material={reinMaterial} castShadow>
          <tubeGeometry args={[curve, 48, 0.018, 8, false]} />
        </mesh>
      ))}
    </group>
  );
}

// --- Christmas Elf Helper ---
type ElfRole = 'carrier' | 'tosser' | 'supervisor' | 'stacker';

function ElfHelper({
  basePosition,
  baseRotation = [0, 0, 0],
  tunicColor = PALETTE.elfGreen,
  role = 'stacker',
  phaseOffset = 0,
  giftColorIndex = 0,
}: {
  basePosition: [number, number, number];
  baseRotation?: [number, number, number];
  tunicColor?: string;
  role?: ElfRole;
  phaseOffset?: number;
  giftColorIndex?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const thrownGiftRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phaseOffset;
    if (!groupRef.current) return;

    if (role === 'carrier') {
      // Elf walking back and forth between gift pile and sleigh sack
      const cycle = (t * 0.45) % 1; // 0..1 loop
      const walkProgress = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2; // 0->1->0
      const startPos = new THREE.Vector3(basePosition[0], basePosition[1], basePosition[2]);
      const targetPos = new THREE.Vector3(-1.35, 0.1, -2.0); // Near the sleigh sack
      groupRef.current.position.lerpVectors(startPos, targetPos, walkProgress);
      // Waddle bounce
      groupRef.current.position.y += Math.abs(Math.sin(t * 9)) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 9) * 0.06;

      // Face direction of movement
      const angleToTarget = Math.atan2(targetPos.x - startPos.x, targetPos.z - startPos.z);
      groupRef.current.rotation.y = cycle < 0.5 ? angleToTarget : angleToTarget + Math.PI;

      // Show gift only on the way TO the sleigh
      if (thrownGiftRef.current) {
        thrownGiftRef.current.visible = cycle < 0.5;
      }
    } else if (role === 'tosser') {
      // Elf standing by the sleigh hoisting presents up into Santa's sack!
      const cycle = (t * 0.65) % 1;
      groupRef.current.position.y = basePosition[1] + Math.abs(Math.sin(cycle * Math.PI * 2)) * 0.06;

      if (armsRef.current) {
        // Lift arms upward as present is tossed
        const lift = Math.sin(cycle * Math.PI);
        armsRef.current.rotation.x = -0.3 - lift * 1.1;
      }

      if (thrownGiftRef.current) {
        // Parabolic arc from elf's hands into Santa's sack at [0, 1.9, -2.15] in world space
        // In local space of tosser elf:
        const p = Math.min(1, cycle * 1.25);
        thrownGiftRef.current.position.set(
          0,
          0.65 + Math.sin(p * Math.PI) * 1.15 + p * 0.45,
          0.38 + p * 0.85
        );
        thrownGiftRef.current.rotation.x = p * Math.PI * 2;
        const scale = p > 0.85 ? (1 - p) * 6.6 : 0.72;
        thrownGiftRef.current.scale.setScalar(Math.max(0.01, scale));
      }
    } else {
      // Supervisor / Stacker idle cheerful animation
      groupRef.current.position.y = basePosition[1] + Math.abs(Math.sin(t * 4)) * 0.05;
      if (armsRef.current) {
        armsRef.current.rotation.x = -0.5 + Math.sin(t * 5) * 0.25;
      }
    }
  });

  const holdingGift = role === 'carrier' || role === 'stacker';

  return (
    <group ref={groupRef} position={basePosition} rotation={baseRotation as any}>
      {/* Curled Elf Shoes */}
      {[-0.12, 0.12].map((x, idx) => (
        <group key={idx} position={[x, 0.08, 0]}>
          <mesh castShadow position={[0, 0.04, 0.03]}>
            <boxGeometry args={[0.11, 0.12, 0.2]} />
            <meshStandardMaterial color={PALETTE.beltBlack} />
          </mesh>
          {/* Curled Tip */}
          <mesh position={[0, 0.1, 0.14]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={PALETTE.gold} metalness={0.8} />
          </mesh>
          {/* Striped Tights Leg */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.26, 10]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      ))}

      {/* Elf Tunic Body */}
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.28, 0.58, 16]} />
        <meshStandardMaterial color={tunicColor} roughness={0.6} />
      </mesh>

      {/* Zig-zag Red Collar */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.16, 0.21, 0.08, 12]} />
        <meshStandardMaterial color={PALETTE.santaRed} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.03, 8, 20]} />
        <meshStandardMaterial color={PALETTE.beltBlack} />
      </mesh>

      {/* Head */}
      <group position={[0, 1.0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
        </mesh>

        {/* Pointy Elf Ears */}
        {[-0.2, 0.2].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0.02, 0]}
            rotation={[0, 0, x < 0 ? 1.1 : -1.1]}
            castShadow
          >
            <coneGeometry args={[0.055, 0.16, 8]} />
            <meshStandardMaterial color={PALETTE.skin} />
          </mesh>
        ))}

        {/* Eyes & Rosy Nose */}
        {[-0.07, 0.07].map((x, idx) => (
          <mesh key={idx} position={[x, 0.04, 0.18]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
        <mesh position={[0, 0.0, 0.2]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={PALETTE.skinRosy} />
        </mesh>

        {/* Hat Brim */}
        <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.19, 0.045, 10, 20]} />
          <meshStandardMaterial color={PALETTE.furWhite} />
        </mesh>
        {/* Pointy Elf Hat */}
        <mesh position={[0, 0.35, -0.03]} rotation={[-0.2, 0, 0]} castShadow>
          <coneGeometry args={[0.19, 0.46, 16]} />
          <meshStandardMaterial color={tunicColor} roughness={0.6} />
        </mesh>
        {/* White Pom-Pom */}
        <mesh position={[0, 0.56, -0.08]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={PALETTE.furWhite} />
        </mesh>
      </group>

      {/* Arms Group */}
      <group ref={armsRef} position={[0, 0.72, 0]}>
        {[-0.22, 0.22].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, -0.05, 0.15]}
            rotation={[Math.PI / 2.5, 0, x < 0 ? -0.2 : 0.2]}
            castShadow
          >
            <cylinderGeometry args={[0.048, 0.042, 0.34, 10]} />
            <meshStandardMaterial color={tunicColor} />
          </mesh>
        ))}

        {/* Present Held by Carrier / Stacker Elf */}
        {holdingGift && (
          <group ref={thrownGiftRef} position={[0, -0.18, 0.34]}>
            <GiftBox scale={0.72} colorIndex={giftColorIndex} ribbonIndex={giftColorIndex + 1} />
          </group>
        )}
      </group>

      {/* Parabolic Thrown Present for Tosser Elf */}
      {role === 'tosser' && (
        <group ref={thrownGiftRef} position={[0, 0.65, 0.38]}>
          <GiftBox scale={0.72} colorIndex={giftColorIndex} ribbonIndex={0} />
        </group>
      )}
    </group>
  );
}

// --- Gentle Falling Snowflakes & Aurora Ribbon ---
function WinterAtmosphere({ snowSpeed = 1 }: { snowSpeed?: number }) {
  const snowCount = 260;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const auroraRef = useRef<THREE.Mesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: snowCount }, (_, i) => ({
      x: (Math.sin(i * 12.9898) * 43758.5453 % 1) * 18 - 9,
      y: ((i / snowCount) * 11) + 0.5,
      z: (Math.cos(i * 78.233) * 43758.5453 % 1) * 18 - 9,
      speed: 0.65 + (i % 7) * 0.14,
      sway: 0.4 + (i % 5) * 0.2,
      scale: 0.03 + (i % 4) * 0.015,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      particles.forEach((p, idx) => {
        p.y -= p.speed * delta * snowSpeed;
        if (p.y < 0.05) p.y = 11.5;

        const x = p.x + Math.sin(t * p.sway + idx) * 0.35;
        const z = p.z + Math.cos(t * p.sway + idx) * 0.35;
        dummy.position.set(x, p.y, z);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (auroraRef.current) {
      auroraRef.current.rotation.y = Math.sin(t * 0.2) * 0.12;
      const mat = auroraRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.18 + Math.sin(t * 1.1) * 0.06;
      }
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, snowCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </instancedMesh>

      {/* Subtle Northern Lights (Aurora Borealis) Ribbon in the Sky */}
      <mesh ref={auroraRef} position={[0, 7.8, -8.5]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[11, 13, 3.8, 48, 1, true, -Math.PI * 0.38, Math.PI * 0.76]} />
        <meshBasicMaterial
          color="#34d399"
          side={THREE.DoubleSide}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// --- Complete North Pole Diorama Scene ---
function NorthPoleDioramaScene({
  autoRotate,
  extraPresents,
}: {
  autoRotate: boolean;
  extraPresents: number;
}) {
  // Position of sleigh & reindeer caravan along a diagonal launch path
  const reindeerPairs = [
    { z: 1.55, phaseL: 0.0, phaseR: 1.2 },
    { z: 3.35, phaseL: 2.1, phaseR: 0.7 },
  ];

  return (
    <>
      <color attach="background" args={['#070d19']} />
      <fog attach="fog" args={['#070d19', 18, 38]} />

      {/* --- Multi-Point Studio & Arctic Night Lighting --- */}
      <ambientLight intensity={0.55} color="#bfdbfe" />
      <hemisphereLight args={['#93c5fd', '#1e293b', 0.65]} />

      {/* Cool Arctic Moonlight with Crisp Shadows */}
      <directionalLight
        castShadow
        position={[9, 14, 8]}
        intensity={1.75}
        color="#f8fafc"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0005}
      />

      {/* Warm Golden Rim Light from Sleigh & Workshop */}
      <pointLight position={[0, 2.5, -1.2]} color="#fbbf24" intensity={2.6} distance={8} />

      {/* Starry Night Sky & Magical Sparkles around Sleigh */}
      <Stars radius={45} depth={30} count={1800} factor={3} saturation={0.5} fade speed={1} />
      <Sparkles
        count={65}
        scale={[6, 3.5, 9]}
        position={[0, 1.8, 1.2]}
        size={2.5}
        speed={0.4}
        color="#fde047"
      />

      {/* --- Circular Snow Island Base --- */}
      <DioramaIsland />

      {/* --- Toy Workshop Cottage in Background Left --- */}
      <ToyWorkshop position={[-4.5, 0.1, -3.5]} rotation={[0, 0.52, 0]} />

      {/* --- North Pole Candy Cane Signpost --- */}
      <NorthPoleSignpost position={[2.6, 0.1, 0.8]} />

      {/* --- Snow-Covered Pine Forest & Decorated Christmas Tree --- */}
      <PineTree position={[3.2, 0.1, -3.6]} scale={1.15} decorated={true} />
      <PineTree position={[5.6, 0.1, -2.0]} scale={0.92} />
      <PineTree position={[1.2, 0.1, -5.6]} scale={1.05} />
      <PineTree position={[-6.4, 0.1, -0.4]} scale={0.95} />
      <PineTree position={[-2.2, 0.1, -6.2]} scale={0.85} />
      <PineTree position={[-5.2, 0.1, 3.4]} scale={0.78} decorated={true} />

      {/* --- Central Caravan: Sleigh, Santa, Reindeer Team & Reins --- */}
      <group position={[0, 0.1, 0]} rotation={[0, 0.22, 0]}>
        {/* Ornate Sleigh at Rear */}
        <SantasSleigh
          position={[0, 0, -1.65]}
          sackScaleBonus={extraPresents * 0.025}
        />

        {/* Santa Claus Standing Next to Sleigh Directing Loading */}
        <SantaClaus position={[1.45, 0, -1.35]} rotation={[0, -0.55, 0]} />

        {/* Reindeer Pairs Lined Up in Formation */}
        {reindeerPairs.map((row, idx) => (
          <React.Fragment key={idx}>
            <Reindeer position={[-0.65, 0, row.z]} phaseOffset={row.phaseL} />
            <Reindeer position={[0.65, 0, row.z]} phaseOffset={row.phaseR} />
          </React.Fragment>
        ))}

        {/* Rudolph Leading at the Front with Glowing Red Nose */}
        <Reindeer position={[0, 0, 5.05]} isRudolph={true} phaseOffset={1.5} />

        {/* Draped Golden Reins Connecting Sleigh & Reindeer */}
        <GoldenReins />
      </group>

      {/* --- Elves Actively Loading Presents into Santa's Sack --- */}
      {/* 1. Left Tosser Elf hoisting presents directly into the sleigh sack */}
      <ElfHelper
        basePosition={[-1.35, 0.1, -2.25]}
        baseRotation={[0, 1.35, 0]}
        tunicColor={PALETTE.elfGreen}
        role="tosser"
        phaseOffset={0}
        giftColorIndex={0}
      />

      {/* 2. Rear Tosser Elf tossing gifts into the back of the sack */}
      <ElfHelper
        basePosition={[-0.35, 0.1, -3.45]}
        baseRotation={[0, 0.15, 0]}
        tunicColor={PALETTE.elfBlue}
        role="tosser"
        phaseOffset={0.75}
        giftColorIndex={2}
      />

      {/* 3. Carrier Elf walking gifts from the workshop gift pile to the sleigh */}
      <ElfHelper
        basePosition={[-3.2, 0.1, -1.1]}
        tunicColor={PALETTE.elfGreenLight}
        role="carrier"
        phaseOffset={0.3}
        giftColorIndex={4}
      />

      {/* 4. Stacker Elf organizing the gift pile */}
      <ElfHelper
        basePosition={[-2.45, 0.1, 0.35]}
        baseRotation={[0, 2.2, 0]}
        tunicColor={PALETTE.elfGreen}
        role="stacker"
        phaseOffset={1.4}
        giftColorIndex={1}
      />

      {/* 5. Elf by the reindeer team checking harnesses */}
      <ElfHelper
        basePosition={[-1.55, 0.1, 2.2]}
        baseRotation={[0, 1.4, 0]}
        tunicColor={PALETTE.santaRed}
        role="supervisor"
        phaseOffset={2.1}
      />

      {/* --- Staging Gift Piles Ready to Load --- */}
      <group position={[-2.4, 0.1, -0.6]}>
        <GiftBox position={[0, 0, 0]} scale={0.95} colorIndex={0} ribbonIndex={0} />
        <GiftBox position={[0.48, 0, 0.12]} rotation={[0, 0.4, 0]} scale={0.85} colorIndex={1} ribbonIndex={1} />
        <GiftBox position={[0.22, 0.38, 0.05]} rotation={[0, -0.3, 0]} scale={0.75} colorIndex={2} ribbonIndex={2} />
        <GiftBox position={[-0.45, 0, 0.28]} rotation={[0, 0.8, 0]} scale={0.8} colorIndex={3} ribbonIndex={0} />
        <GiftBox position={[0.1, 0, -0.48]} rotation={[0, 1.1, 0]} scale={0.9} colorIndex={5} ribbonIndex={3} />
      </group>

      {/* Extra gifts spawned when user clicks "Load More Presents" */}
      {Array.from({ length: extraPresents }).map((_, i) => {
        const angle = i * 1.1;
        const r = 0.55 + (i % 3) * 0.25;
        return (
          <GiftBox
            key={i}
            position={[
              1.6 + Math.cos(angle) * r,
              0.1 + Math.floor(i / 5) * 0.36,
              -2.2 + Math.sin(angle) * r,
            ]}
            rotation={[0, angle, 0]}
            scale={0.8}
            colorIndex={i}
            ribbonIndex={i + 1}
          />
        );
      })}

      {/* --- Animated Falling Snow & Aurora --- */}
      <WinterAtmosphere />

      {/* --- Interactive Orbit Controls --- */}
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enablePan={false}
        minPolarAngle={Math.PI * 0.14}
        maxPolarAngle={Math.PI * 0.46}
        minDistance={7}
        maxDistance={21}
        target={[0, 1.2, 0.2]}
      />
    </>
  );
}

// --- Main Page Component ---
export default function GeminiPage() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [extraPresents, setExtraPresents] = useState(2);

  return (
    <div className="relative flex flex-col flex-1 w-full min-h-[calc(100vh-58px)] bg-[#070d19] text-white overflow-hidden select-none">
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[calc(100vh-58px)]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [9.5, 6.8, 10.5], fov: 42 }}
        >
          <NorthPoleDioramaScene autoRotate={autoRotate} extraPresents={extraPresents} />
        </Canvas>

        {/* Top-Left Title & Scene Legend Overlay */}
        <div className="pointer-events-none absolute top-5 left-5 max-w-md rounded-2xl border border-white/15 bg-slate-950/65 p-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              North Pole Procedural 3D Diorama
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Christmas Eve Launch Prep
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Santa Claus inspects the final loading at the North Pole workshop while elves hoist wrapped presents into his overflowing sack and Rudolph leads the harnessed reindeer team.
          </p>
        </div>

        {/* Bottom Interactive Controls Pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-3 rounded-full border border-white/15 bg-slate-950/75 px-5 py-2.5 backdrop-blur-md shadow-xl">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              autoRotate
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {autoRotate ? 'Pause Turntable' : 'Rotate Turntable'}
          </button>

          <button
            onClick={() => setExtraPresents((c) => Math.min(15, c + 1))}
            className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 cursor-pointer"
          >
            + Load More Presents ({extraPresents})
          </button>

          {extraPresents > 0 && (
            <button
              onClick={() => setExtraPresents(0)}
              className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 cursor-pointer"
            >
              Reset Pile
            </button>
          )}

          <span className="hidden sm:inline text-[11px] text-slate-400 pl-1">
            Drag to orbit • Scroll to zoom
          </span>
        </div>
      </div>
    </div>
  );
}
