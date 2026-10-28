'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, RoundedBox, Stars } from '@react-three/drei';
import * as THREE from 'three';

type V3 = [number, number, number];
const C = {
  snow: '#eef6ff',
  red: '#bd3041',
  green: '#267566',
  gold: '#e9bc69',
  wood: '#66423c',
  skin: '#f4c5a3',
};

function Ball({
  p,
  s = [1, 1, 1],
  r = 0.2,
  color,
  glow = false,
}: {
  p: V3;
  s?: V3;
  r?: number;
  color: string;
  glow?: boolean;
}) {
  return (
    <mesh position={p} scale={s} castShadow receiveShadow>
      <sphereGeometry args={[r, 16, 12]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        emissive={glow ? color : '#000000'}
        emissiveIntensity={glow ? 2 : 0}
      />
    </mesh>
  );
}
function Box({
  p,
  s,
  color,
  radius = 0.04,
}: {
  p: V3;
  s: V3;
  color: string;
  radius?: number;
}) {
  return (
    <RoundedBox
      position={p}
      args={s}
      radius={radius}
      smoothness={2}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.8} />
    </RoundedBox>
  );
}
function Rod({
  a,
  b,
  color,
  radius = 0.035,
}: {
  a: V3;
  b: V3;
  color: string;
  radius?: number;
}) {
  const start = new THREE.Vector3(...a),
    end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  return (
    <mesh
      position={start.add(end).multiplyScalar(0.5)}
      quaternion={quaternion}
      castShadow
    >
      <cylinderGeometry args={[radius, radius, direction.length(), 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Gift({
  p,
  color = C.red,
  size = 0.4,
}: {
  p: V3;
  color?: string;
  size?: number;
}) {
  return (
    <group position={p}>
      <Box p={[0, size / 2, 0]} s={[size, size, size]} color={color} />
      <Box
        p={[0, size / 2, 0]}
        s={[size + 0.012, size + 0.014, size * 0.13]}
        color={C.gold}
        radius={0.005}
      />
      <Box
        p={[0, size / 2, 0]}
        s={[size * 0.13, size + 0.018, size + 0.012]}
        color={C.gold}
        radius={0.005}
      />
      {[-1, 1].map((d) => (
        <mesh
          key={d}
          position={[d * size * 0.13, size + 0.035, 0]}
          rotation={[Math.PI / 2, 0, d * 0.5]}
          scale={[1, 0.65, 1]}
        >
          <torusGeometry args={[size * 0.14, 0.025, 6, 14]} />
          <meshStandardMaterial color={C.gold} />
        </mesh>
      ))}
    </group>
  );
}
function Pine({
  p,
  size = 1,
  decorated = false,
}: {
  p: V3;
  size?: number;
  decorated?: boolean;
}) {
  return (
    <group position={p} scale={size}>
      <Rod a={[0, 0, 0]} b={[0, 0.9, 0]} color={C.wood} radius={0.12} />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.75 + i * 0.57, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.9 - i * 0.22, 1.3 - i * 0.1, 9]} />
            <meshStandardMaterial color={i % 2 ? '#275d58' : '#1e4e4a'} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <coneGeometry args={[0.76 - i * 0.2, 1.03 - i * 0.08, 9]} />
            <meshStandardMaterial color={C.snow} />
          </mesh>
        </group>
      ))}
      {decorated &&
        Array.from({ length: 22 }, (_, i) => {
          const y = 0.6 + i * 0.075,
            r = 0.88 * (1 - y / 2.9);
          return (
            <Ball
              key={i}
              p={[Math.sin(i * 2.4) * r, y, Math.cos(i * 2.4) * r]}
              r={0.065}
              color={i % 3 ? C.gold : C.red}
              glow
            />
          );
        })}
      {decorated && <Ball p={[0, 2.6, 0]} r={0.14} color={C.gold} glow />}
    </group>
  );
}
function Person({
  p,
  santa = false,
  phase = 0,
  carrying = false,
  animated,
}: {
  p: V3;
  santa?: boolean;
  phase?: number;
  carrying?: boolean;
  animated: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!animated) return;
    const t = clock.elapsedTime + phase;
    if (ref.current) {
      ref.current.position.y = p[1] + Math.sin(t * 2.5) * 0.025;
      if (carrying) ref.current.position.x = p[0] + Math.sin(t * 0.65) * 0.45;
    }
    if (arm.current) arm.current.rotation.z = Math.sin(t * 2) * 0.16;
  });
  const coat = santa ? C.red : C.green;
  return (
    <group ref={ref} position={p} scale={santa ? 1.1 : 0.72}>
      {[-1, 1].map((d) => (
        <group key={d}>
          <Box
            p={[d * 0.17, 0.16, 0.09]}
            s={[0.24, 0.24, 0.4]}
            color="#23333e"
          />
          <Rod
            a={[d * 0.16, 0.2, 0]}
            b={[d * 0.16, 0.55, 0]}
            color={santa ? C.red : '#a63b3e'}
            radius={0.1}
          />
        </group>
      ))}
      <Ball p={[0, 0.78, 0]} r={0.43} s={[1, 1.14, 0.8]} color={coat} />
      <Box p={[0, 0.64, 0]} s={[0.84, 0.11, 0.64]} color="#293038" />
      <Box p={[0, 0.64, 0.33]} s={[0.18, 0.16, 0.04]} color={C.gold} />
      {santa && (
        <Ball p={[0, 0.45, 0]} r={0.34} s={[1.2, 0.18, 0.85]} color={C.snow} />
      )}
      <Ball p={[0, 1.36, 0]} r={0.29} color={C.skin} />
      {[-1, 1].map((d) => (
        <group key={d}>
          <Ball p={[d * 0.12, 1.4, 0.265]} r={0.026} color="#253340" />
          <Ball p={[d * 0.2, 1.31, 0.23]} r={0.065} color="#e99b8d" />
          {!santa && (
            <Ball
              p={[d * 0.31, 1.38, 0]}
              s={[1.4, 0.7, 0.5]}
              r={0.1}
              color={C.skin}
            />
          )}
          <group ref={d === 1 ? arm : undefined} position={[d * 0.35, 0.99, 0]}>
            <Rod
              a={[0, 0, 0]}
              b={[d * 0.18, carrying ? -0.02 : -0.22, carrying ? 0.4 : 0.09]}
              color={coat}
              radius={0.12}
            />
            <Ball
              p={[d * 0.18, carrying ? -0.02 : -0.22, carrying ? 0.4 : 0.09]}
              r={0.12}
              color={santa ? C.snow : C.skin}
            />
          </group>
        </group>
      ))}
      {santa && (
        <>
          <Ball
            p={[0, 1.16, 0.21]}
            r={0.27}
            s={[1, 1.15, 0.55]}
            color={C.snow}
          />
          {[-1, 1].map((d) => (
            <Ball
              key={d}
              p={[d * 0.085, 1.32, 0.29]}
              r={0.11}
              s={[1.1, 0.5, 0.6]}
              color={C.snow}
            />
          ))}
        </>
      )}
      <Ball p={[0, 1.35, 0.31]} r={0.075} color={C.skin} />
      <mesh position={[0.04, 1.77, 0]} rotation={[0, 0, -0.22]} castShadow>
        <coneGeometry args={[0.3, 0.65, 16]} />
        <meshStandardMaterial color={santa ? C.red : '#d54b49'} />
      </mesh>
      <Ball p={[0.11, 2.08, 0]} r={0.09} color={santa ? C.snow : C.gold} />
      <Ball p={[0, 1.53, 0]} r={0.3} s={[1, 0.2, 1]} color={C.snow} />
      {carrying && (
        <Gift
          p={[0, 0.83, 0.43]}
          color={phase % 2 ? '#d295b7' : '#529aaf'}
          size={0.43}
        />
      )}
    </group>
  );
}
function Reindeer({
  p,
  index,
  animated,
}: {
  p: V3;
  index: number;
  animated: boolean;
}) {
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (head.current && animated)
      head.current.rotation.z =
        Math.sin(clock.elapsedTime * 1.8 + index) * 0.065;
  });
  return (
    <group position={p} rotation={[0, -Math.PI / 2, 0]}>
      <Ball p={[0, 0.77, 0]} r={0.4} s={[0.73, 0.88, 1.5]} color="#a77a55" />
      <Ball p={[0, 0.91, -0.6]} r={0.12} s={[0.6, 0.8, 1.7]} color="#eee0c4" />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}${z}`}>
            <Rod
              a={[x * 0.19, 0.68, z * 0.32]}
              b={[x * 0.2, 0.13, z * 0.37]}
              radius={0.06}
              color="#996947"
            />
            <Box
              p={[x * 0.2, 0.09, z * 0.37]}
              s={[0.14, 0.16, 0.19]}
              color="#3c3436"
            />
          </group>
        ))
      )}
      <group ref={head} position={[0, 1.02, 0.4]}>
        <Ball p={[0, 0.05, 0]} r={0.22} s={[0.8, 1.6, 0.8]} color="#a77a55" />
        <Ball p={[0, 0.36, 0.12]} r={0.23} s={[0.85, 1, 1.2]} color="#b58b66" />
        <Ball
          p={[0, 0.27, 0.33]}
          r={0.15}
          s={[0.9, 0.75, 1.1]}
          color="#e4c9a1"
        />
        <Ball
          p={[0, 0.29, 0.48]}
          r={0.067}
          color={index === 0 ? '#ff514a' : '#453431'}
          glow={index === 0}
        />
        {[-1, 1].map((d) => (
          <group key={d}>
            <Ball p={[d * 0.18, 0.41, 0.22]} r={0.027} color="#202c33" />
            <Ball
              p={[d * 0.25, 0.48, 0.05]}
              r={0.12}
              s={[1.6, 0.55, 0.55]}
              color="#a77a55"
            />
            <Rod
              a={[d * 0.11, 0.5, 0]}
              b={[d * 0.3, 1.08, -0.1]}
              color="#e4c9a1"
              radius={0.035}
            />
            {[0, 1, 2].map((i) => (
              <Rod
                key={i}
                a={[d * (0.17 + i * 0.045), 0.66 + i * 0.13, -0.03]}
                b={[d * (0.32 + i * 0.055), 0.83 + i * 0.13, 0.03]}
                color="#e4c9a1"
                radius={0.023}
              />
            ))}
          </group>
        ))}
        <mesh position={[0, -0.06, 0]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.19, 0.035, 8, 20]} />
          <meshStandardMaterial color={C.red} />
        </mesh>
        <Ball p={[0, -0.12, 0.2]} r={0.065} color={C.gold} />
      </group>
      <mesh
        position={[0, 0.8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.8, 1, 1]}
      >
        <torusGeometry args={[0.39, 0.035, 8, 20]} />
        <meshStandardMaterial color={C.red} />
      </mesh>
    </group>
  );
}
function Workshop() {
  return (
    <group position={[-2.7, 0, -3.1]} rotation={[0, 0.12, 0]}>
      <Box p={[0, 1.3, 0]} s={[3.5, 2.6, 2.5]} color="#954d43" />
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          p={[0, 0.22 + i * 0.3, 1.27]}
          s={[3.6, 0.055, 0.08]}
          color="#b47059"
          radius={0.01}
        />
      ))}
      {[-1, 1].map((d) => (
        <group key={d}>
          <mesh
            position={[d * 0.96, 3, 0]}
            rotation={[0, 0, (d * Math.PI) / 4]}
            castShadow
          >
            <boxGeometry args={[2.8, 0.24, 3.2]} />
            <meshStandardMaterial color={C.snow} />
          </mesh>
          <Box
            p={[d * 1.15, 1.55, 1.31]}
            s={[0.72, 0.85, 0.1]}
            color={C.gold}
          />
          <Box
            p={[d * 1.15, 1.55, 1.38]}
            s={[0.055, 0.94, 0.09]}
            color={C.wood}
          />
          <Box
            p={[d * 1.15, 1.55, 1.38]}
            s={[0.8, 0.055, 0.09]}
            color={C.wood}
          />
        </group>
      ))}
      <Box p={[0, 0.89, 1.32]} s={[0.8, 1.78, 0.14]} color="#305c58" />
      <Ball p={[0.25, 0.85, 1.44]} r={0.045} color={C.gold} />
      <Box p={[0, 0.08, 1.7]} s={[1.2, 0.16, 0.7]} color={C.snow} />
      <Box p={[1, 3.12, -0.5]} s={[0.46, 1.35, 0.5]} color={C.wood} />
      <Box p={[1, 3.83, -0.5]} s={[0.62, 0.17, 0.66]} color={C.snow} />
      <mesh position={[0, 1.74, 1.44]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.075, 8, 20]} />
        <meshStandardMaterial color={C.green} />
      </mesh>
      <Ball p={[0, 1.53, 1.49]} r={0.08} color={C.red} />
      {Array.from({ length: 13 }, (_, i) => (
        <Ball
          key={i}
          p={[-1.8 + i * 0.3, 2.43 - Math.sin((i / 12) * Math.PI) * 0.15, 1.48]}
          r={0.055}
          color={i % 2 ? C.gold : '#e76d56'}
          glow
        />
      ))}
      <pointLight
        position={[0, 1.5, 2]}
        color="#ffbc76"
        intensity={5}
        distance={6}
      />
    </group>
  );
}
function Sleigh() {
  return (
    <group position={[1.7, 0, 1.25]} rotation={[0, Math.PI / 2, 0]}>
      {[-1, 1].map((d) => (
        <group key={d}>
          <Line
            points={[
              [d * 0.65, 0.2, -1.25],
              [d * 0.65, 0.12, 0.8],
              [d * 0.65, 0.2, 1.25],
              [d * 0.65, 0.48, 1.5],
              [d * 0.65, 0.65, 1.32],
            ]}
            color={C.gold}
            lineWidth={5}
          />
          <Rod
            a={[d * 0.65, 0.2, -0.6]}
            b={[d * 0.55, 0.7, -0.6]}
            color={C.gold}
          />
          <Rod
            a={[d * 0.65, 0.2, 0.7]}
            b={[d * 0.55, 0.7, 0.7]}
            color={C.gold}
          />
          <Box p={[d * 0.62, 0.95, 0]} s={[0.14, 0.67, 2.15]} color={C.red} />
          <Rod
            a={[d * 0.64, 1.3, -1]}
            b={[d * 0.64, 1.3, 1]}
            color={C.gold}
            radius={0.045}
          />
        </group>
      ))}
      <Box p={[0, 0.65, 0]} s={[1.3, 0.2, 2.1]} color={C.red} />
      <Box p={[0, 1.03, -0.98]} s={[1.3, 0.95, 0.18]} color={C.red} />
      <Box p={[0, 0.9, 0.55]} s={[1, 0.22, 0.5]} color="#6b2936" />
      <Ball p={[0, 1.27, -0.38]} r={0.62} s={[0.9, 1.1, 0.9]} color="#b48c59" />
      <mesh position={[0, 1.82, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.09, 8, 20]} />
        <meshStandardMaterial color="#8f6c44" />
      </mesh>
      <Gift p={[-0.15, 1.65, -0.4]} color={C.green} size={0.45} />
      <Gift p={[0.28, 1.55, -0.2]} color={C.red} size={0.35} />
    </group>
  );
}

// Deterministic particles avoid server/client random-number differences.
const fraction = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
function Snow({ animated }: { animated: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(
    () =>
      Float32Array.from(
        Array.from(
          { length: 1500 },
          (_, i) => (fraction(i) - 0.5) * (i % 3 === 1 ? 15 : 24)
        )
      ),
    []
  );
  useFrame((_, dt) => {
    if (!ref.current || !animated) return;
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < attr.count; i++) {
      let y = attr.getY(i) - Math.min(dt, 0.05) * (0.4 + fraction(i) * 0.5);
      if (y < -0.5) y = 10;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.045}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}
function Scene({ animated, rotate }: { animated: boolean; rotate: boolean }) {
  return (
    <>
      <color attach="background" args={['#101f2b']} />
      <fog attach="fog" args={['#101f2b', 27, 65]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#c0e1ff', '#596274', 1.5]} />
      <directionalLight
        position={[-4, 12, 8]}
        intensity={2.5}
        color="#fff0db"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-normalBias={0.03}
      />
      <Stars radius={55} depth={25} count={1100} factor={2} fade />
      <mesh position={[0, -0.52, 0]} receiveShadow>
        <cylinderGeometry args={[8, 7.6, 0.85, 64]} />
        <meshStandardMaterial color="#9bb9c4" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[8.05, 8, 0.16, 64]} />
        <meshStandardMaterial color={C.snow} />
      </mesh>
      <mesh position={[0, -1.04, 0]}>
        <cylinderGeometry args={[7.65, 7.65, 0.18, 64]} />
        <meshStandardMaterial color={C.gold} metalness={0.55} roughness={0.4} />
      </mesh>
      <Workshop />
      <Sleigh />
      <Person p={[0.5, 0, 2.3]} santa animated={animated} />
      <Person p={[-0.8, 0, 1.3]} phase={0} carrying animated={animated} />
      <Person p={[0.1, 0, -0.1]} phase={3} carrying animated={animated} />
      <Person p={[-2.7, 0, 0.2]} phase={1} carrying animated={animated} />
      <Person p={[2.7, 0.5, 2.1]} phase={2} carrying animated={animated} />
      <Box p={[2.7, 0.2, 2.2]} s={[0.8, 0.4, 0.65]} color={C.wood} />
      {[0, 1, 2].flatMap((row) =>
        [-1, 1].map((side, j) => (
          <Reindeer
            key={`${row}${side}`}
            p={[-1.1 - row * 1.75, 0, 3.65 + side * 0.65]}
            index={row === 2 ? j : row + 2}
            animated={animated}
          />
        ))
      )}
      {[-1, 1].map((side) => (
        <Line
          key={side}
          points={[
            [1.8, 0.9, 1.4],
            [0.3, 0.7, 3.65 + side * 0.65],
            [-1.1, 0.9, 3.65 + side * 0.65],
            [-2.85, 0.9, 3.65 + side * 0.65],
            [-4.6, 0.9, 3.65 + side * 0.65],
          ]}
          color="#b78b4e"
          lineWidth={1.5}
        />
      ))}
      {(
        [
          [-5.9, 0, -2],
          [-4.8, 0, -5],
          [-0.3, 0, -5.5],
          [3.8, 0, -4.3],
          [6, 0, -1.2],
          [5.8, 0, 2.6],
          [-6.7, 0, 0.7],
        ] as V3[]
      ).map((p, i) => (
        <Pine key={i} p={p} size={i % 2 ? 1.25 : 0.9} decorated={i === 3} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Gift
          key={i}
          p={[-1.9 + (i % 3) * 0.5, Math.floor(i / 3) * 0.36, -0.7]}
          size={0.35 + (i % 2) * 0.07}
          color={['#a84b64', '#498a8a', '#d69c4e'][i % 3]}
        />
      ))}
      <group position={[4.5, 0, 0]}>
        <Rod a={[0, 0, 0]} b={[0, 2.6, 0]} color={C.snow} radius={0.09} />
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, 0.2 + i * 0.3, 0]}>
            <cylinderGeometry args={[0.096, 0.096, 0.13, 12]} />
            <meshStandardMaterial color={C.red} />
          </mesh>
        ))}
        <Box p={[0, 2.25, 0]} s={[1.55, 0.42, 0.16]} color={C.green} />
        <Ball p={[0, 2.75, 0]} r={0.17} color={C.gold} glow />
      </group>
      <group position={[4.5, 0, 3.8]}>
        <Ball p={[0, 0.45, 0]} r={0.48} color={C.snow} />
        <Ball p={[0, 1.05, 0]} r={0.33} color={C.snow} />
        <Box p={[0, 1.32, 0]} s={[0.8, 0.09, 0.7]} color="#2b414b" />
        <Box p={[0, 1.53, 0]} s={[0.44, 0.4, 0.4]} color="#2b414b" />
        <Box p={[0, 0.85, 0]} s={[0.59, 0.13, 0.56]} color={C.red} />
        {[-1, 1].map((d) => (
          <Ball key={d} p={[d * 0.11, 1.12, 0.29]} r={0.025} color="#26313a" />
        ))}
        <mesh position={[0, 1.02, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.055, 0.26, 8]} />
          <meshStandardMaterial color="#ed9854" />
        </mesh>
      </group>
      <Snow animated={animated} />
      <OrbitControls
        makeDefault
        target={[0, 0.7, 0]}
        enablePan={false}
        minDistance={12}
        maxDistance={31}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={rotate}
        autoRotateSpeed={0.35}
      />
    </>
  );
}
export default function SolPage() {
  const [animated, setAnimated] = useState(true);
  const [rotate, setRotate] = useState(false);
  return (
    <section className="relative isolate h-[calc(100svh-48px)] min-h-[600px] overflow-hidden bg-[#101f2b] text-[#edf3ed]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#101f2b]/90 to-transparent px-6 pt-8 pb-16 sm:px-12">
        <div className="mb-3 flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-[#d9bd87]">
          <span className="h-px w-8 bg-[#d9bd87]" /> A LITTLE CHRISTMAS MAGIC
        </div>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          The night before Christmas
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#b0c4cc]">
          One last present. Six eager reindeer.
          <br />
          And a whole world waiting for a little joy.
        </p>
      </div>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [13, 12, 19], fov: 40 }}
        gl={{ antialias: true }}
        fallback={
          <div className="p-12 pt-64">
            This diorama needs a browser with WebGL support.
          </div>
        }
      >
        <Suspense fallback={null}>
          <Scene animated={animated} rotate={rotate} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-[#101f2b] to-transparent px-6 pt-16 pb-7 sm:flex-row sm:items-end sm:justify-between sm:px-12">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-[#d9bd87]">
            NORTH POLE · CHRISTMAS EVE
          </div>
          <p className="mt-2 text-xs text-[#9eb4bf]">
            Drag to explore · Scroll to get closer
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            aria-pressed={rotate}
            onClick={() => setRotate((v) => !v)}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs backdrop-blur-md transition hover:bg-white/15"
          >
            {rotate ? 'Stop orbit' : 'Orbit scene'} ↻
          </button>
          <button
            type="button"
            aria-pressed={!animated}
            onClick={() => setAnimated((v) => !v)}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs backdrop-blur-md transition hover:bg-white/15"
          >
            {animated ? 'Pause magic' : 'Resume magic'} {animated ? 'Ⅱ' : '▷'}
          </button>
        </div>
      </div>
    </section>
  );
}
