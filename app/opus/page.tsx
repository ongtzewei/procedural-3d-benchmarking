'use client';

import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode, type Ref } from 'react';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

type Vec3 = [number, number, number];

const C = {
  snow: '#f4f8ff',
  snowShade: '#dce6f4',
  ice: '#9fd3f0',
  wood: '#6b4226',
  woodDark: '#3d2414',
  brick: '#8c3b2e',
  stone: '#6f7480',
  santaRed: '#c8102e',
  fur: '#fbfbf7',
  skin: '#f2c9a0',
  black: '#1b1b1b',
  gold: '#e3b23c',
  pine: '#1f5f3a',
  pineDark: '#174a2d',
  reindeer: '#8a5a35',
  reindeerLight: '#c79a6b',
  antler: '#e8d6b0',
  elfGreen: '#2e8b3e',
  elfRed: '#d6283c',
  cabin: '#7a2f24',
  glow: '#ffcf6b',
  sack: '#8a5a2b',
  rope: '#c9a15b',
} as const;

const GIFT_COLORS = [
  '#d62839',
  '#1f7a4d',
  '#2b59c3',
  '#f2b705',
  '#8e44ad',
  '#e86a92',
  '#18a999',
];
const RIBBON_COLORS = ['#f7d774', '#ffffff', '#d62839', '#c0c0c0'];

/** Deterministic PRNG so the scene is identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep01(x: number) {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

type PartProps = {
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  shadow?: boolean;
  children: ReactNode;
};

/** A single shaded mesh: pass a geometry element as the child. */
function Part({
  color,
  emissive,
  emissiveIntensity = 1,
  roughness = 0.75,
  metalness = 0,
  shadow = true,
  children,
  ...transform
}: PartProps) {
  return (
    <mesh castShadow={shadow} receiveShadow {...transform}>
      {children}
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

type GiftStyle = { color: string; ribbon: string };

type PresentProps = GiftStyle & {
  position?: Vec3;
  rotation?: Vec3;
  size?: Vec3;
};

function Present({
  position,
  rotation,
  size = [0.4, 0.4, 0.4],
  color,
  ribbon,
}: PresentProps) {
  const [w, h, d] = size;
  const band = Math.min(w, d) * 0.18;
  return (
    <group position={position} rotation={rotation}>
      <Part color={color} roughness={0.5}>
        <boxGeometry args={[w, h, d]} />
      </Part>
      <Part color={ribbon} roughness={0.3} metalness={0.3} shadow={false}>
        <boxGeometry args={[w + 0.01, h + 0.01, band]} />
      </Part>
      <Part color={ribbon} roughness={0.3} metalness={0.3} shadow={false}>
        <boxGeometry args={[band, h + 0.01, d + 0.01]} />
      </Part>
      {/* bow: two crossed loops */}
      <group position={[0, h / 2 + band * 0.6, 0]}>
        {[Math.PI / 4, -Math.PI / 4].map((ry) => (
          <Part
            key={ry}
            rotation={[0, ry, 0]}
            color={ribbon}
            roughness={0.3}
            metalness={0.3}
            shadow={false}
          >
            <torusGeometry args={[band * 0.7, band * 0.25, 8, 16]} />
          </Part>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Environment                                                               */
/* -------------------------------------------------------------------------- */

function DioramaBase() {
  const drifts = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 7.8 + rand() * 1.6;
      return {
        position: [Math.cos(a) * r, 0, Math.sin(a) * r] as Vec3,
        scale: [
          0.7 + rand() * 0.9,
          0.25 + rand() * 0.3,
          0.7 + rand() * 0.8,
        ] as Vec3,
        rotY: rand() * Math.PI,
      };
    });
  }, []);

  return (
    <group>
      {/* wooden plinth */}
      <Part position={[0, -0.77, 0]} color={C.wood} roughness={0.6}>
        <cylinderGeometry args={[11.1, 11.5, 1.3, 72]} />
      </Part>
      <Part position={[0, -1.49, 0]} color={C.woodDark}>
        <cylinderGeometry args={[11.8, 11.8, 0.14, 72]} />
      </Part>
      {/* snow surface (top at y = 0) */}
      <Part position={[0, -0.06, 0]} color={C.snow} roughness={0.95}>
        <cylinderGeometry args={[11.05, 11.15, 0.12, 72]} />
      </Part>
      {drifts.map((d, i) => (
        <Part
          key={i}
          position={d.position}
          rotation={[0, d.rotY, 0]}
          scale={d.scale}
          color={C.snow}
          roughness={1}
        >
          <sphereGeometry args={[1, 24, 16]} />
        </Part>
      ))}
      {/* frozen pond */}
      <group position={[5.6, 0, -1.6]} scale={[1, 1, 0.7]}>
        <Part
          position={[0, 0.02, 0]}
          color={C.ice}
          roughness={0.08}
          metalness={0.2}
          shadow={false}
        >
          <cylinderGeometry args={[1.8, 1.8, 0.04, 48]} />
        </Part>
        <Part rotation={[Math.PI / 2, 0, 0]} color={C.snowShade} roughness={1}>
          <torusGeometry args={[1.85, 0.12, 10, 48]} />
        </Part>
      </group>
    </group>
  );
}

/** Animated aurora borealis ribbon drawn with a small custom shader. */
function Aurora() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 13, -24]} rotation={[0.15, 0, 0]}>
      <planeGeometry args={[70, 14, 160, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin(p.x * 0.12 + uTime * 0.25) * 4.0;
            p.y += sin(p.x * 0.07 + uTime * 0.18) * 1.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float bands = 0.5 + 0.5 * sin(
              vUv.x * 42.0 + uTime * 0.8 + sin(vUv.x * 9.0 + uTime * 0.4) * 3.0
            );
            float fadeY = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y));
            float fadeX = smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x));
            vec3 green = vec3(0.1, 1.0, 0.55);
            vec3 violet = vec3(0.55, 0.25, 1.0);
            vec3 col = mix(green, violet, smoothstep(0.3, 1.0, vUv.y));
            float a = fadeY * fadeX * (0.35 + 0.65 * bands) * 0.55;
            gl_FragColor = vec4(col * a, a);
          }
        `}
      />
    </mesh>
  );
}

function Snowfall({ count = 1500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const rand = mulberry32(99);
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 13;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = rand() * 14;
      pos[i * 3 + 2] = Math.sin(a) * r;
      spd[i] = 0.4 + rand() * 0.6;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }, delta) => {
    const geom = points.current?.geometry;
    if (!geom) return;
    const attr = geom.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.8 + i) * 0.003;
      arr[i * 3 + 1] -= speeds[i] * delta;
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 14;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function TreeStar({ position }: { position: Vec3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.32 : 0.14;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    g.center();
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.8;
  });

  return (
    <mesh ref={ref} position={position} geometry={geometry}>
      <meshStandardMaterial
        color={C.gold}
        emissive={C.gold}
        emissiveIntensity={1.4}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

const TREE_TIERS = [
  { r: 1.2, y: 1.2, h: 1.6 },
  { r: 0.95, y: 1.95, h: 1.4 },
  { r: 0.68, y: 2.65, h: 1.15 },
];

function PineTree({
  position,
  scale = 1,
  decorated = false,
  seed = 1,
}: {
  position: Vec3;
  scale?: number;
  decorated?: boolean;
  seed?: number;
}) {
  const ornaments = useMemo(() => {
    if (!decorated) return [];
    const rand = mulberry32(seed);
    return TREE_TIERS.flatMap((tier) =>
      Array.from({ length: 8 }, () => {
        const a = rand() * Math.PI * 2;
        const f = 0.12 + rand() * 0.5;
        const rad = tier.r * (1 - f) + 0.03;
        return {
          position: [
            Math.cos(a) * rad,
            tier.y - tier.h / 2 + f * tier.h,
            Math.sin(a) * rad,
          ] as Vec3,
          color: GIFT_COLORS[Math.floor(rand() * GIFT_COLORS.length)],
        };
      })
    );
  }, [decorated, seed]);

  return (
    <group position={position} scale={scale}>
      <Part position={[0, 0.3, 0]} color={C.woodDark}>
        <cylinderGeometry args={[0.14, 0.18, 0.6, 10]} />
      </Part>
      {TREE_TIERS.map((tier, i) => (
        <group key={i}>
          <Part
            position={[0, tier.y, 0]}
            color={i % 2 ? C.pine : C.pineDark}
          >
            <coneGeometry args={[tier.r, tier.h, 18]} />
          </Part>
          <Part
            position={[0, tier.y + tier.h * 0.29, 0]}
            color={C.snow}
            roughness={1}
          >
            <coneGeometry args={[tier.r * 0.5, tier.h * 0.42, 18]} />
          </Part>
        </group>
      ))}
      {ornaments.map((o, i) => (
        <Part
          key={i}
          position={o.position}
          color={o.color}
          emissive={o.color}
          emissiveIntensity={0.9}
          roughness={0.3}
          shadow={false}
        >
          <sphereGeometry args={[0.07, 10, 8]} />
        </Part>
      ))}
      {decorated && <TreeStar position={[0, 3.4, 0]} />}
    </group>
  );
}

function ChimneySmoke({ position }: { position: Vec3 }) {
  const PUFFS = 6;
  const puffs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.22 + i / PUFFS) % 1;
      m.position.set(Math.sin(k * 4 + i) * 0.2 + k * 0.7, k * 2.4, 0);
      m.scale.setScalar(0.15 + k * 0.4);
      (m.material as THREE.MeshStandardMaterial).opacity = (1 - k) * 0.5;
    });
  });

  return (
    <group position={position}>
      {Array.from({ length: PUFFS }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            puffs.current[i] = m;
          }}
        >
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial
            color="#d9dee8"
            transparent
            opacity={0.4}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Workshop({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  // Pentagon-shaped gable that fills the space under the pitched roof.
  const gable = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.5, 0);
    s.lineTo(1.5, 0);
    s.lineTo(1.5, 0.2);
    s.lineTo(0, 1.25);
    s.lineTo(-1.5, 0.2);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.9, bevelEnabled: false });
    g.translate(0, 0, -1.95);
    g.rotateY(Math.PI / 2);
    return g;
  }, []);

  const pitch = 0.61;

  return (
    <group position={position} rotation={rotation}>
      {/* foundation and walls */}
      <Part position={[0, 0.1, 0]} color={C.stone}>
        <boxGeometry args={[4.3, 0.2, 3.3]} />
      </Part>
      <Part position={[0, 1.4, 0]} color={C.cabin}>
        <boxGeometry args={[4, 2.6, 3]} />
      </Part>
      {(
        [
          [-2, 1.5],
          [2, 1.5],
          [-2, -1.5],
          [2, -1.5],
        ] as const
      ).map(([x, z]) => (
        <Part key={`${x}:${z}`} position={[x, 1.4, z]} color={C.woodDark}>
          <boxGeometry args={[0.22, 2.6, 0.22]} />
        </Part>
      ))}
      <mesh geometry={gable} position={[0, 2.7, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.cabin} roughness={0.8} />
      </mesh>

      {/* snow-covered pitched roof */}
      {[1, -1].map((side) => (
        <group key={side}>
          <Part
            position={[0, 3.33, side * 0.9]}
            rotation={[side * pitch, 0, 0]}
            color={C.woodDark}
          >
            <boxGeometry args={[4.6, 0.18, 2.2]} />
          </Part>
          <Part
            position={[0, 3.436, side * 0.975]}
            rotation={[side * pitch, 0, 0]}
            color={C.snow}
            roughness={1}
          >
            <boxGeometry args={[4.5, 0.12, 2.15]} />
          </Part>
        </group>
      ))}

      {/* icicles along the front eave */}
      {Array.from({ length: 15 }, (_, i) => (
        <Part
          key={i}
          position={[-2.1 + i * 0.3, 2.52, 1.82]}
          rotation={[Math.PI, 0, 0]}
          color={C.ice}
          roughness={0.1}
          shadow={false}
        >
          <coneGeometry args={[0.04, 0.18 + (i % 3) * 0.08, 6]} />
        </Part>
      ))}

      {/* chimney */}
      <Part position={[1.2, 3.8, -0.6]} color={C.brick}>
        <boxGeometry args={[0.55, 1.4, 0.55]} />
      </Part>
      <Part position={[1.2, 4.55, -0.6]} color={C.snow} roughness={1}>
        <boxGeometry args={[0.65, 0.12, 0.65]} />
      </Part>
      <ChimneySmoke position={[1.2, 4.7, -0.6]} />

      {/* door with wreath */}
      <Part position={[0, 0.95, 1.52]} color="#4a2a17">
        <boxGeometry args={[0.85, 1.6, 0.08]} />
      </Part>
      <Part position={[0.3, 0.95, 1.58]} color={C.gold} metalness={0.8}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </Part>
      <Part position={[0, 1.45, 1.6]} color={C.pine}>
        <torusGeometry args={[0.22, 0.07, 10, 24]} />
      </Part>
      <Part position={[0, 1.24, 1.64]} color={C.santaRed}>
        <boxGeometry args={[0.14, 0.1, 0.04]} />
      </Part>

      {/* glowing windows (front and side) */}
      {[
        { p: [-1.25, 1.6, 1.52] as Vec3, r: [0, 0, 0] as Vec3 },
        { p: [1.25, 1.6, 1.52] as Vec3, r: [0, 0, 0] as Vec3 },
        { p: [2.02, 1.6, 0] as Vec3, r: [0, Math.PI / 2, 0] as Vec3 },
      ].map(({ p, r }, i) => (
        <group key={i} position={p} rotation={r}>
          <Part color={C.woodDark}>
            <boxGeometry args={[0.8, 0.7, 0.06]} />
          </Part>
          <Part
            position={[0, 0, 0.02]}
            color={C.glow}
            emissive={C.glow}
            emissiveIntensity={1.8}
            shadow={false}
          >
            <boxGeometry args={[0.66, 0.56, 0.04]} />
          </Part>
          <Part position={[0, 0, 0.05]} color={C.woodDark} shadow={false}>
            <boxGeometry args={[0.05, 0.56, 0.02]} />
          </Part>
          <Part position={[0, 0, 0.05]} color={C.woodDark} shadow={false}>
            <boxGeometry args={[0.66, 0.05, 0.02]} />
          </Part>
          <Part position={[0, -0.38, 0.06]} color={C.snow} roughness={1}>
            <boxGeometry args={[0.9, 0.08, 0.18]} />
          </Part>
        </group>
      ))}

      <pointLight
        position={[0, 1.8, 2.4]}
        color="#ffb85c"
        intensity={10}
        distance={10}
        decay={2}
      />
    </group>
  );
}

function NorthPole({ position }: { position: Vec3 }) {
  const stripes = 16;
  const segH = 0.24;
  return (
    <group position={position}>
      <Part position={[0, 0, 0]} scale={[1, 0.35, 1]} color={C.snow}>
        <sphereGeometry args={[0.7, 20, 12]} />
      </Part>
      {Array.from({ length: stripes }, (_, i) => (
        <Part
          key={i}
          position={[0, segH * i + segH / 2, 0]}
          color={i % 2 ? C.fur : C.santaRed}
          roughness={0.35}
        >
          <cylinderGeometry args={[0.13, 0.13, segH, 20]} />
        </Part>
      ))}
      <Part
        position={[0, stripes * segH + 0.18, 0]}
        color={C.gold}
        emissive={C.gold}
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.25}
      >
        <sphereGeometry args={[0.22, 24, 16]} />
      </Part>
      {/* direction signs */}
      <Part position={[0.45, 2.6, 0]} rotation={[0, 0.2, 0]} color={C.wood}>
        <boxGeometry args={[0.8, 0.22, 0.05]} />
      </Part>
      <Part position={[-0.4, 2.2, 0.1]} rotation={[0, -0.5, 0]} color={C.wood}>
        <boxGeometry args={[0.7, 0.2, 0.05]} />
      </Part>
    </group>
  );
}

function Snowman({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Part position={[0, 0.5, 0]} color={C.snow} roughness={1}>
        <sphereGeometry args={[0.6, 24, 18]} />
      </Part>
      <Part position={[0, 1.2, 0]} color={C.snow} roughness={1}>
        <sphereGeometry args={[0.42, 24, 18]} />
      </Part>
      <Part position={[0, 1.72, 0]} color={C.snow} roughness={1}>
        <sphereGeometry args={[0.3, 24, 18]} />
      </Part>
      {[-0.1, 0.1].map((x) => (
        <Part key={x} position={[x, 1.78, 0.27]} color={C.black}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </Part>
      ))}
      <Part
        position={[0, 1.72, 0.42]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#f07b1a"
      >
        <coneGeometry args={[0.05, 0.3, 10]} />
      </Part>
      {[1.32, 1.14].map((y) => (
        <Part key={y} position={[0, y, 0.41]} color={C.black}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </Part>
      ))}
      <Part position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.santaRed}>
        <torusGeometry args={[0.3, 0.07, 10, 24]} />
      </Part>
      <Part position={[0.18, 1.3, 0.28]} rotation={[0.2, 0, 0.15]} color={C.santaRed}>
        <boxGeometry args={[0.12, 0.35, 0.05]} />
      </Part>
      {[-1, 1].map((side) => (
        <Part
          key={side}
          position={[side * 0.62, 1.32, 0]}
          rotation={[0, 0, side * -1.0]}
          color={C.woodDark}
        >
          <cylinderGeometry args={[0.025, 0.02, 0.6, 6]} />
        </Part>
      ))}
      <Part position={[0, 1.94, 0]} color={C.black}>
        <cylinderGeometry args={[0.32, 0.32, 0.03, 20]} />
      </Part>
      <Part position={[0, 2.1, 0]} color={C.black}>
        <cylinderGeometry args={[0.2, 0.22, 0.32, 20]} />
      </Part>
    </group>
  );
}

function LampPost({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Part position={[0, 0.06, 0]} color={C.black} metalness={0.6} roughness={0.4}>
        <cylinderGeometry args={[0.2, 0.25, 0.12, 12]} />
      </Part>
      <Part position={[0, 1.2, 0]} color={C.black} metalness={0.6} roughness={0.4}>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 10]} />
      </Part>
      <Part
        position={[0, 2.55, 0]}
        color={C.glow}
        emissive={C.glow}
        emissiveIntensity={2.2}
        shadow={false}
      >
        <boxGeometry args={[0.26, 0.34, 0.26]} />
      </Part>
      <Part
        position={[0, 2.8, 0]}
        rotation={[0, Math.PI / 4, 0]}
        color={C.black}
        metalness={0.6}
      >
        <coneGeometry args={[0.25, 0.2, 4]} />
      </Part>
      <Part position={[0, 2.88, 0]} scale={[1, 0.5, 1]} color={C.snow} roughness={1}>
        <sphereGeometry args={[0.13, 12, 8]} />
      </Part>
      <pointLight
        position={[0, 2.5, 0]}
        color="#ffc56b"
        intensity={8}
        distance={9}
        decay={2}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Presents                                                                  */
/* -------------------------------------------------------------------------- */

function GiftPile({ position }: { position: Vec3 }) {
  const gifts = useMemo(() => {
    const rand = mulberry32(42);
    const layers = [
      { n: 9, r: 1.0, y: 0 },
      { n: 6, r: 0.6, y: 0.4 },
      { n: 3, r: 0.28, y: 0.78 },
      { n: 1, r: 0, y: 1.14 },
    ];
    return layers.flatMap((layer, li) =>
      Array.from({ length: layer.n }, (_, i) => {
        const a = (i / layer.n) * Math.PI * 2 + rand() * 0.4;
        const r = layer.r * (0.75 + rand() * 0.35);
        const size: Vec3 = [
          0.3 + rand() * 0.22,
          0.28 + rand() * 0.14,
          0.3 + rand() * 0.22,
        ];
        return {
          position: [Math.cos(a) * r, layer.y + size[1] / 2, Math.sin(a) * r] as Vec3,
          rotation: [0, rand() * Math.PI, li > 0 ? (rand() - 0.5) * 0.25 : 0] as Vec3,
          size,
          color: GIFT_COLORS[Math.floor(rand() * GIFT_COLORS.length)],
          ribbon: RIBBON_COLORS[Math.floor(rand() * RIBBON_COLORS.length)],
        };
      })
    );
  }, []);

  return (
    <group position={position}>
      {gifts.map((g, i) => (
        <Present key={i} {...g} />
      ))}
    </group>
  );
}

function SantaSack({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Part position={[0, 0.6, 0]} scale={[1, 0.95, 1]} color={C.sack} roughness={1}>
        <sphereGeometry args={[0.65, 28, 20]} />
      </Part>
      <Part position={[0, 1.2, 0]} color={C.sack} roughness={1}>
        <cylinderGeometry args={[0.45, 0.32, 0.3, 20]} />
      </Part>
      {/* dark interior suggests an open mouth */}
      <Part position={[0, 1.352, 0]} color="#2a1708" shadow={false}>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 20]} />
      </Part>
      <Part position={[0, 1.08, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.rope}>
        <torusGeometry args={[0.33, 0.04, 8, 24]} />
      </Part>
      <Present
        position={[0.1, 1.4, 0.05]}
        rotation={[0.3, 0.4, 0.2]}
        size={[0.28, 0.26, 0.28]}
        color="#2b59c3"
        ribbon="#f7d774"
      />
      <Present
        position={[-0.15, 1.44, -0.1]}
        rotation={[-0.2, 1.1, -0.3]}
        size={[0.24, 0.3, 0.24]}
        color="#d62839"
        ribbon="#ffffff"
      />
      <Present
        position={[0.12, 1.48, -0.16]}
        rotation={[0.1, 0.2, 0.5]}
        size={[0.22, 0.22, 0.22]}
        color="#18a999"
        ribbon="#d62839"
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sleigh and reindeer                                                       */
/* -------------------------------------------------------------------------- */

function Sleigh() {
  const runners = useMemo(
    () =>
      [-0.62, 0.62].map((z) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.75, 0.35, z),
          new THREE.Vector3(-1.6, 0.1, z),
          new THREE.Vector3(0, 0.08, z),
          new THREE.Vector3(1.5, 0.1, z),
          new THREE.Vector3(2.0, 0.4, z),
          new THREE.Vector3(1.95, 0.85, z),
          new THREE.Vector3(1.7, 0.95, z),
          new THREE.Vector3(1.6, 0.8, z),
        ]);
        return new THREE.TubeGeometry(curve, 80, 0.05, 10, false);
      }),
    []
  );

  return (
    <group>
      {runners.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color={C.gold} metalness={0.75} roughness={0.3} />
        </mesh>
      ))}
      {[-1.2, 0, 1.1].flatMap((x) =>
        [-0.62, 0.62].map((z) => (
          <Part
            key={`${x}:${z}`}
            position={[x, 0.27, z]}
            color={C.gold}
            metalness={0.75}
            roughness={0.3}
          >
            <cylinderGeometry args={[0.04, 0.04, 0.38, 8]} />
          </Part>
        ))
      )}
      {/* body, high seat back and curled prow */}
      <Part position={[0, 0.75, 0]} color={C.santaRed} roughness={0.4}>
        <boxGeometry args={[3.0, 0.6, 1.4]} />
      </Part>
      <Part position={[-1.3, 1.1, 0]} color={C.santaRed} roughness={0.4}>
        <boxGeometry args={[0.45, 1.3, 1.5]} />
      </Part>
      <Part
        position={[1.45, 1.05, 0]}
        rotation={[0, 0, -0.35]}
        color={C.santaRed}
        roughness={0.4}
      >
        <boxGeometry args={[0.25, 0.9, 1.45]} />
      </Part>
      <Part position={[-0.65, 1.11, 0]} color={C.elfGreen} roughness={0.9}>
        <boxGeometry args={[0.8, 0.12, 1.3]} />
      </Part>
      {/* gold trim and side scrolls */}
      {[-0.72, 0.72].map((z) => (
        <group key={z}>
          {[1.06, 0.46].map((y) => (
            <Part key={y} position={[0, y, z]} color={C.gold} metalness={0.8} roughness={0.25}>
              <boxGeometry args={[3.05, 0.06, 0.06]} />
            </Part>
          ))}
          <Part position={[0.2, 0.76, z]} color={C.gold} metalness={0.8} roughness={0.25}>
            <torusGeometry args={[0.18, 0.03, 8, 24]} />
          </Part>
          <Part position={[-1.3, 1.76, z * 1.04]} color={C.gold} metalness={0.8} roughness={0.25}>
            <sphereGeometry args={[0.07, 12, 10]} />
          </Part>
        </group>
      ))}
      {/* presents already loaded in the front bay */}
      <Present position={[0.35, 1.25, -0.3]} size={[0.4, 0.4, 0.4]} color="#1f7a4d" ribbon="#d62839" />
      <Present position={[0.85, 1.22, 0.3]} rotation={[0, 0.5, 0]} size={[0.38, 0.34, 0.38]} color="#f2b705" ribbon="#d62839" />
      <Present position={[0.3, 1.2, 0.35]} rotation={[0, 0.2, 0]} size={[0.3, 0.3, 0.3]} color="#8e44ad" ribbon="#f7d774" />
      <Present position={[0.6, 1.58, -0.05]} rotation={[0, 0.9, 0.1]} size={[0.3, 0.3, 0.3]} color="#e86a92" ribbon="#ffffff" />
    </group>
  );
}

function Antler({ side }: { side: number }) {
  return (
    <group position={[-0.08, 0.17, side * 0.08]} rotation={[side * 0.45, 0, 0.35]}>
      <Part position={[0, 0.22, 0]} color={C.antler}>
        <cylinderGeometry args={[0.022, 0.034, 0.45, 6]} />
      </Part>
      {[
        { y: 0.14, rz: -0.9, l: 0.18 },
        { y: 0.3, rz: -0.7, l: 0.16 },
        { y: 0.4, rz: 0.6, l: 0.14 },
      ].map((tine) => (
        <group key={tine.y} position={[0, tine.y, 0]} rotation={[0, 0, tine.rz]}>
          <Part position={[0, tine.l / 2, 0]} color={C.antler}>
            <cylinderGeometry args={[0.014, 0.02, tine.l, 6]} />
          </Part>
        </group>
      ))}
    </group>
  );
}

function Reindeer({
  position,
  phase = 0,
  rudolph = false,
}: {
  position: Vec3;
  phase?: number;
  rudolph?: boolean;
}) {
  const head = useRef<THREE.Group>(null);
  const pawLeg = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const noseMat = useRef<THREE.MeshStandardMaterial>(null);
  const noseLight = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase * 10;
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 1.3) * 0.12 - 0.05;
      head.current.rotation.y = Math.sin(t * 0.7) * 0.15;
    }
    // occasional eager paw at the snow
    if (pawLeg.current) {
      pawLeg.current.rotation.z = Math.max(0, Math.sin(t * 0.9)) ** 8 * 0.7;
    }
    if (tail.current) tail.current.rotation.y = Math.sin(t * 6) * 0.4;
    if (rudolph) {
      const glow = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3);
      if (noseMat.current) noseMat.current.emissiveIntensity = 1.5 + glow * 2.5;
      if (noseLight.current) noseLight.current.intensity = 2 + glow * 4;
    }
  });

  return (
    <group position={position}>
      {/* body, chest fluff, tail */}
      <Part position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} color={C.reindeer}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
      </Part>
      <Part position={[0.52, 1.08, 0]} scale={[0.8, 1, 1]} color={C.reindeerLight}>
        <sphereGeometry args={[0.24, 16, 12]} />
      </Part>
      <mesh ref={tail} position={[-0.72, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={C.fur} />
      </mesh>

      {/* legs pivot at the hip so they can be animated */}
      {(
        [
          [0.45, 0.17],
          [0.45, -0.17],
          [-0.45, 0.17],
          [-0.45, -0.17],
        ] as const
      ).map(([x, z], i) => (
        <group key={i} ref={i === 0 ? pawLeg : undefined} position={[x, 0.92, z]}>
          <Part position={[0, -0.41, 0]} color={C.reindeer}>
            <cylinderGeometry args={[0.07, 0.06, 0.82, 8]} />
          </Part>
          <Part position={[0, -0.84, 0]} color={C.woodDark}>
            <cylinderGeometry args={[0.07, 0.075, 0.1, 8]} />
          </Part>
        </group>
      ))}

      {/* harness with bells */}
      <Part position={[0.3, 1.05, 0]} rotation={[0, Math.PI / 2, 0]} color={C.santaRed}>
        <torusGeometry args={[0.31, 0.035, 8, 24]} />
      </Part>
      {(
        [
          [0.3, 0.72, 0],
          [0.3, 1.05, 0.34],
          [0.3, 1.05, -0.34],
        ] as Vec3[]
      ).map((p, i) => (
        <Part key={i} position={p} color={C.gold} metalness={0.8} roughness={0.25}>
          <sphereGeometry args={[0.05, 10, 8]} />
        </Part>
      ))}

      {/* neck and head */}
      <Part position={[0.62, 1.38, 0]} rotation={[0, 0, -0.6]} color={C.reindeer}>
        <cylinderGeometry args={[0.13, 0.17, 0.6, 12]} />
      </Part>
      <group ref={head} position={[0.82, 1.68, 0]}>
        <Part scale={[1.25, 1, 0.95]} color={C.reindeer}>
          <sphereGeometry args={[0.19, 16, 12]} />
        </Part>
        <Part position={[0.22, -0.06, 0]} color={C.reindeerLight}>
          <sphereGeometry args={[0.12, 14, 10]} />
        </Part>
        <mesh position={[0.33, -0.04, 0]} castShadow>
          <sphereGeometry args={[rudolph ? 0.075 : 0.05, 16, 12]} />
          <meshStandardMaterial
            ref={noseMat}
            color={rudolph ? '#ff2a2a' : C.black}
            emissive={rudolph ? '#ff1a1a' : '#000000'}
            emissiveIntensity={rudolph ? 2 : 0}
            roughness={0.3}
          />
        </mesh>
        {rudolph && (
          <pointLight
            ref={noseLight}
            position={[0.45, -0.04, 0]}
            color="#ff3030"
            intensity={4}
            distance={5}
            decay={2}
          />
        )}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Part position={[0.1, 0.07, side * 0.13]} color={C.black}>
              <sphereGeometry args={[0.03, 8, 8]} />
            </Part>
            <Part
              position={[-0.06, 0.12, side * 0.15]}
              rotation={[side * 1.0, 0, 0]}
              color={C.reindeer}
            >
              <coneGeometry args={[0.05, 0.16, 8]} />
            </Part>
            <Antler side={side} />
          </group>
        ))}
      </group>
    </group>
  );
}

function SleighTeam({ position }: { position: Vec3 }) {
  const pairs = [3.0, 4.8, 6.6, 8.4];
  return (
    <group position={position}>
      <Sleigh />
      {/* central trace running from the sleigh to Rudolph */}
      <Part position={[5.95, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} color={C.woodDark}>
        <cylinderGeometry args={[0.03, 0.03, 8.1, 8]} />
      </Part>
      {pairs.map((x) => (
        <Part
          key={x}
          position={[x + 0.3, 1.0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={C.woodDark}
        >
          <cylinderGeometry args={[0.025, 0.025, 1.1, 6]} />
        </Part>
      ))}
      {pairs.flatMap((x, i) =>
        [-1, 1].map((side) => (
          <Reindeer
            key={`${x}:${side}`}
            position={[x, 0, side * 0.55]}
            phase={i * 0.7 + side * 0.3}
          />
        ))
      )}
      <Reindeer position={[10.2, 0, 0]} phase={3.3} rudolph />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Characters                                                                */
/* -------------------------------------------------------------------------- */

function Santa({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  const body = useRef<THREE.Group>(null);
  const waveArm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (waveArm.current) waveArm.current.rotation.z = -2.5 + Math.sin(t * 4) * 0.35;
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.5) * 0.012;
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={body}>
        {/* boots and legs */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Part position={[side * 0.18, 0.12, 0.05]} color={C.black} roughness={0.4}>
              <boxGeometry args={[0.25, 0.24, 0.4]} />
            </Part>
            <Part position={[side * 0.18, 0.45, 0]} color={C.santaRed}>
              <cylinderGeometry args={[0.13, 0.13, 0.5, 12]} />
            </Part>
          </group>
        ))}
        {/* round belly, fur trim, belt */}
        <Part position={[0, 1.15, 0]} scale={[1, 1.1, 0.95]} color={C.santaRed}>
          <sphereGeometry args={[0.55, 28, 20]} />
        </Part>
        <Part position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.fur} roughness={1}>
          <torusGeometry args={[0.5, 0.08, 10, 28]} />
        </Part>
        <Part position={[0, 1.22, 0.5]} color={C.fur} roughness={1}>
          <boxGeometry args={[0.14, 0.9, 0.08]} />
        </Part>
        <Part position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.black} roughness={0.4}>
          <torusGeometry args={[0.56, 0.07, 10, 28]} />
        </Part>
        <Part position={[0, 1.1, 0.6]} color={C.gold} metalness={0.8} roughness={0.25}>
          <boxGeometry args={[0.22, 0.18, 0.05]} />
        </Part>

        {/* head, beard, hat */}
        <Part position={[0, 1.95, 0]} color={C.skin}>
          <sphereGeometry args={[0.3, 20, 16]} />
        </Part>
        <Part position={[0, 1.95, 0.3]} color="#e9a08a">
          <sphereGeometry args={[0.06, 10, 8]} />
        </Part>
        {[-0.1, 0.1].map((x) => (
          <Part key={x} position={[x, 2.03, 0.26]} color={C.black}>
            <sphereGeometry args={[0.03, 8, 8]} />
          </Part>
        ))}
        <Part position={[0, 1.75, 0.15]} scale={[1, 1.2, 0.8]} color={C.fur} roughness={1}>
          <sphereGeometry args={[0.3, 20, 16]} />
        </Part>
        {[-0.09, 0.09].map((x) => (
          <Part key={x} position={[x, 1.88, 0.29]} scale={[1.4, 0.7, 0.8]} color={C.fur} roughness={1}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </Part>
        ))}
        <group position={[0, 2.2, 0]} rotation={[0, 0, -0.3]}>
          <Part rotation={[Math.PI / 2, 0, 0]} color={C.fur} roughness={1}>
            <torusGeometry args={[0.28, 0.07, 10, 24]} />
          </Part>
          <Part position={[0, 0.33, 0]} color={C.santaRed}>
            <coneGeometry args={[0.27, 0.65, 20]} />
          </Part>
          <Part position={[0, 0.66, 0]} color={C.fur} roughness={1}>
            <sphereGeometry args={[0.09, 12, 10]} />
          </Part>
        </group>

        {/* one arm waving, the other holding the sack open */}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side < 0 ? waveArm : undefined}
            position={[side * 0.5, 1.55, 0]}
            rotation={side < 0 ? [0, 0, -2.5] : [-0.9, 0, 0.2]}
          >
            <Part position={[0, -0.27, 0]} color={C.santaRed}>
              <cylinderGeometry args={[0.1, 0.11, 0.55, 12]} />
            </Part>
            <Part position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.fur} roughness={1}>
              <torusGeometry args={[0.1, 0.04, 8, 16]} />
            </Part>
            <Part position={[0, -0.62, 0]} color={C.black}>
              <sphereGeometry args={[0.1, 12, 10]} />
            </Part>
          </group>
        ))}
      </group>
    </group>
  );
}

type ElfModelProps = {
  tunic: string;
  hat: string;
  armsPitch?: number;
  gift?: GiftStyle;
  holdingList?: boolean;
  bodyRef?: Ref<THREE.Group>;
  legLRef?: Ref<THREE.Group>;
  legRRef?: Ref<THREE.Group>;
  armsRef?: Ref<THREE.Group>;
  giftRef?: Ref<THREE.Group>;
};

function ElfModel({
  tunic,
  hat,
  armsPitch = -1.15,
  gift,
  holdingList = false,
  bodyRef,
  legLRef,
  legRRef,
  armsRef,
  giftRef,
}: ElfModelProps) {
  return (
    <group ref={bodyRef}>
      {/* striped legs and curly shoes, pivoting at the hip */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side < 0 ? legLRef : legRRef} position={[side * 0.09, 0.36, 0]}>
          <Part position={[0, -0.15, 0]} color={C.fur}>
            <cylinderGeometry args={[0.055, 0.05, 0.3, 10]} />
          </Part>
          {[-0.08, -0.2].map((y) => (
            <Part key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.elfRed} shadow={false}>
              <torusGeometry args={[0.055, 0.018, 6, 12]} />
            </Part>
          ))}
          <Part position={[0, -0.32, 0.05]} scale={[1, 0.6, 1.6]} color={C.woodDark}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </Part>
          <Part position={[0, -0.28, 0.17]} color={C.gold} metalness={0.7}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </Part>
        </group>
      ))}

      {/* tunic, belt, collar */}
      <Part position={[0, 0.52, 0]} color={tunic}>
        <cylinderGeometry args={[0.16, 0.27, 0.42, 16]} />
      </Part>
      <Part position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.black}>
        <torusGeometry args={[0.24, 0.03, 8, 20]} />
      </Part>
      <Part position={[0, 0.42, 0.26]} color={C.gold} metalness={0.7}>
        <boxGeometry args={[0.08, 0.07, 0.02]} />
      </Part>
      <Part position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]} color={C.elfRed}>
        <torusGeometry args={[0.15, 0.05, 8, 16]} />
      </Part>

      {/* head with pointy ears */}
      <Part position={[0, 0.9, 0]} color={C.skin}>
        <sphereGeometry args={[0.16, 18, 14]} />
      </Part>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Part position={[side * 0.055, 0.93, 0.145]} color={C.black}>
            <sphereGeometry args={[0.02, 8, 8]} />
          </Part>
          <Part position={[side * 0.17, 0.93, 0]} rotation={[0, 0, -side * 1.3]} color={C.skin}>
            <coneGeometry args={[0.04, 0.14, 8]} />
          </Part>
        </group>
      ))}
      <Part position={[0, 0.89, 0.165]} color="#e8a383">
        <sphereGeometry args={[0.03, 8, 8]} />
      </Part>

      {/* floppy hat with bell */}
      <group position={[0, 1.02, 0]} rotation={[-0.25, 0, 0.15]}>
        <Part rotation={[Math.PI / 2, 0, 0]} color={C.fur} roughness={1}>
          <torusGeometry args={[0.15, 0.04, 8, 18]} />
        </Part>
        <Part position={[0, 0.21, 0]} color={hat}>
          <coneGeometry args={[0.16, 0.42, 14]} />
        </Part>
        <Part position={[0, 0.43, 0]} color={C.gold} metalness={0.8}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </Part>
      </group>

      {/* arms */}
      <group ref={armsRef} position={[0, 0.68, 0]} rotation={[armsPitch, 0, 0]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.2, 0, 0]}>
            <Part position={[0, -0.15, 0]} color={tunic}>
              <cylinderGeometry args={[0.045, 0.045, 0.3, 8]} />
            </Part>
            <Part position={[0, -0.3, 0]} color={C.skin}>
              <sphereGeometry args={[0.05, 8, 8]} />
            </Part>
          </group>
        ))}
      </group>

      {gift && (
        <group ref={giftRef} position={[0, 0.62, 0.32]}>
          <Present size={[0.28, 0.24, 0.24]} {...gift} />
        </group>
      )}

      {holdingList && (
        <group position={[0, 0.5, 0.3]} rotation={[-0.35, 0, 0]}>
          <Part color="#fdf6e3" roughness={0.9}>
            <boxGeometry args={[0.24, 0.55, 0.01]} />
          </Part>
          {[0.28, -0.28].map((y) => (
            <Part key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} color={C.wood}>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            </Part>
          ))}
        </group>
      )}
    </group>
  );
}

// Elves shuttle presents along a path between the gift pile and Santa's sack.
const ELF_PICK: [number, number] = [0.27, -2.22];
const ELF_DROP: [number, number] = [-1.81, -0.02];
const ELF_CYCLE = 8;
const ELF_LANE = 0.28;

function WalkingElf({
  phase,
  tunic,
  hat,
  gift,
}: {
  phase: number;
  tunic: string;
  hat: string;
  gift: GiftStyle;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const giftRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.elapsedTime;
    const u = (t / ELF_CYCLE + phase) % 1;

    const dx = ELF_DROP[0] - ELF_PICK[0];
    const dz = ELF_DROP[1] - ELF_PICK[1];
    const len = Math.hypot(dx, dz);
    const perpX = dz / len;
    const perpZ = -dx / len;
    const forwardYaw = Math.atan2(dx, dz);

    let s = 0;
    let lane = ELF_LANE;
    let yaw = forwardYaw;
    let walking = false;
    let carrying = false;
    let giftVisible = false;
    let giftY = 0.62;
    let giftZ = 0.32;

    if (u < 0.42) {
      // carry a present to the sack
      s = smoothstep01(u / 0.42);
      walking = true;
      carrying = true;
      giftVisible = true;
    } else if (u < 0.5) {
      // toss it in, then turn around
      s = 1;
      const k = (u - 0.42) / 0.08;
      const toss = Math.min(1, k / 0.6);
      giftVisible = toss < 1;
      carrying = giftVisible;
      giftZ = 0.32 + toss * 0.55;
      giftY = 0.62 + Math.sin(toss * Math.PI) * 0.45;
      const turn = smoothstep01((k - 0.6) / 0.4);
      yaw = forwardYaw + Math.PI * turn;
      lane = ELF_LANE * (1 - 2 * turn);
    } else if (u < 0.92) {
      // walk back empty-handed
      s = 1 - smoothstep01((u - 0.5) / 0.42);
      walking = true;
      yaw = forwardYaw + Math.PI;
      lane = -ELF_LANE;
    } else {
      // pick up the next present, then turn toward the sack
      const k = (u - 0.92) / 0.08;
      const lift = smoothstep01((k - 0.1) / 0.4);
      giftVisible = k > 0.1;
      carrying = giftVisible;
      giftY = 0.25 + lift * 0.37;
      const turn = smoothstep01((k - 0.5) / 0.5);
      yaw = forwardYaw + Math.PI * (1 + turn);
      lane = -ELF_LANE + 2 * ELF_LANE * turn;
    }

    const x = ELF_PICK[0] + dx * s + perpX * lane;
    const z = ELF_PICK[1] + dz * s + perpZ * lane;
    root.current.position.set(x, 0, z);
    root.current.rotation.y = yaw;

    const stride = Math.sin(t * 10 + phase * 20);
    if (body.current) body.current.position.y = walking ? Math.abs(stride) * 0.05 : 0;
    if (legL.current) legL.current.rotation.x = walking ? stride * 0.55 : 0;
    if (legR.current) legR.current.rotation.x = walking ? -stride * 0.55 : 0;
    if (arms.current) arms.current.rotation.x = carrying ? -1.15 : -0.1 + stride * 0.2;
    if (giftRef.current) {
      giftRef.current.visible = giftVisible;
      giftRef.current.position.set(0, giftY, giftZ);
    }
  });

  return (
    <group ref={root}>
      <ElfModel
        tunic={tunic}
        hat={hat}
        gift={gift}
        bodyRef={body}
        legLRef={legL}
        legRRef={legR}
        armsRef={arms}
        giftRef={giftRef}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

const TREES: { position: Vec3; scale: number }[] = [
  { position: [-8.5, 0, -3], scale: 1.3 },
  { position: [-7.4, 0, -6.6], scale: 1.6 },
  { position: [-3.5, 0, -8.6], scale: 1.4 },
  { position: [0.8, 0, -8.8], scale: 1.1 },
  { position: [3.8, 0, -7.8], scale: 1.25 },
  { position: [6.6, 0, -6.2], scale: 1.5 },
  { position: [8.6, 0, -3.4], scale: 1.2 },
  { position: [-8.8, 0, 1.6], scale: 1.0 },
  { position: [-7.8, 0, 4.8], scale: 1.3 },
  { position: [2.5, 0, 7.9], scale: 0.9 },
  { position: [-4.5, 0, 7.6], scale: 0.8 },
];

const WALKING_ELVES = [
  { phase: 0, tunic: C.elfGreen, hat: C.elfRed, gift: { color: '#2b59c3', ribbon: '#f7d774' } },
  { phase: 0.25, tunic: C.elfRed, hat: C.elfGreen, gift: { color: '#f2b705', ribbon: '#d62839' } },
  { phase: 0.5, tunic: '#237a6b', hat: C.elfRed, gift: { color: '#e86a92', ribbon: '#ffffff' } },
  { phase: 0.75, tunic: C.elfGreen, hat: '#7b3fbf', gift: { color: '#1f7a4d', ribbon: '#d62839' } },
];

function NorthPoleScene() {
  return (
    <>
      <color attach="background" args={['#060a1c']} />
      <fog attach="fog" args={['#0a1230', 30, 75]} />
      <Stars radius={90} depth={40} count={3500} factor={4} saturation={0} fade speed={0.6} />
      <Aurora />

      {/* cool moonlight plus warm practical lights from the workshop and lamp */}
      <hemisphereLight args={['#a9c1ff', '#33405e', 0.7]} />
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[-9, 16, 10]}
        intensity={1.6}
        color="#d6e2ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
      />

      <DioramaBase />
      <Workshop position={[-5, 0, -4.8]} rotation={[0, 0.4, 0]} />
      {TREES.map((tree, i) => (
        <PineTree key={i} position={tree.position} scale={tree.scale} />
      ))}
      <PineTree position={[-1.2, 0, -5.6]} scale={1.5} decorated seed={3} />
      <NorthPole position={[3.6, 0, -4.2]} />
      <Snowman position={[6.8, 0, 5.2]} rotation={[0, -0.6, 0]} />
      <LampPost position={[-5.8, 0, 0.6]} />

      <SleighTeam position={[-3.8, 0, 2.6]} />
      <Santa position={[-3.3, 0, 0]} rotation={[0, 0.98, 0]} />
      <SantaSack position={[-2.4, 0, 0.6]} />
      <GiftPile position={[1.2, 0, -3.2]} />

      {/* head elf checking the naughty-or-nice list */}
      <group position={[-4.4, 0, 1.0]} rotation={[0, 0.8, 0]}>
        <ElfModel tunic={C.elfRed} hat={C.elfGreen} armsPitch={-0.9} holdingList />
      </group>
      {WALKING_ELVES.map((elf) => (
        <WalkingElf key={elf.phase} {...elf} />
      ))}

      <Snowfall />
      <OrbitControls
        target={[0, 1, 0]}
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.15}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export default function OpusPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 py-12 dark:bg-black">
      <div className="w-full max-w-5xl px-6">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Opus 5.5
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          A procedurally generated North Pole diorama: Santa gets ready for his
          Christmas Eve run while the elves load presents into his sack and the
          reindeer wait in harness. Drag to orbit, scroll to zoom.
        </p>
        <div
          className="mt-8 h-[600px] w-full overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800"
          role="img"
          aria-label="3D diorama of Santa Claus at the North Pole with his reindeer team, sleigh, and elves loading presents into his sack"
        >
          <Canvas shadows dpr={[1, 2]} camera={{ position: [13, 10, 15], fov: 42 }}>
            <NorthPoleScene />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
