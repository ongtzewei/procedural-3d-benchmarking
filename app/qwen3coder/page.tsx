"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Helper function to create a sphere
function Sphere({ position, color, radius, ...props }: any) {
  return (
    <mesh position={position} {...props}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Helper function to create a cylinder (for Santa's body)
function Cylinder({ position, color, radiusTop, radiusBottom, height, ...props }: any) {
  return (
    <mesh position={position} {...props}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Helper function to create a cone (for Santa's hat)
function Cone({ position, color, radius, height, ...props }: any) {
  return (
    <mesh position={position} {...props}>
      <coneGeometry args={[radius, height, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Helper function to create a box (for presents and sled)
function Box({ position, color, size, ...props }: any) {
  return (
    <mesh position={position} {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Reindeer component
function Reindeer({ position, rotation }: any) {
  const bodyColor = '#8B4513';
  const antlerColor = '#CD853F';
  
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <Cylinder position={[0, 1, 0]} color={bodyColor} radiusTop={0.4} radiusBottom={0.5} height={1.2} />
      {/* Head */}
      <Sphere position={[0, 1.6, 0.8]} color={bodyColor} radius={0.4} />
      {/* Legs */}
      <Cylinder position={[-0.3, 0.5, 0.5]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.8} />
      <Cylinder position={[0.3, 0.5, 0.5]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.8} />
      <Cylinder position={[-0.3, 0.5, -0.5]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.8} />
      <Cylinder position={[0.3, 0.5, -0.5]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.8} />
      {/* Antlers */}
      <Cone position={[-0.2, 2.1, 0]} color={antlerColor} radius={0.1} height={0.5} rotation={[0, 0, -0.3]} />
      <Cone position={[0.2, 2.1, 0]} color={antlerColor} radius={0.1} height={0.5} rotation={[0, 0, 0.3]} />
      <Cone position={[-0.25, 2.3, 0]} color={antlerColor} radius={0.08} height={0.4} rotation={[0, -0.3, -0.3]} />
      <Cone position={[0.25, 2.3, 0]} color={antlerColor} radius={0.08} height={0.4} rotation={[0, 0.3, 0.3]} />
      {/* Nose */}
      <Sphere position={[0, 1.65, 1.1]} color="red" radius={0.1} />
    </group>
  );
}

// Elf component
function Elf({ position, rotation, isLoading }: any) {
  const bodyColor = '#DC143C';
  const skinColor = '#FFDAB9';
  const hatColor = '#FFFFFF';
  
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <Cylinder position={[0, 0.8, 0]} color={bodyColor} radiusTop={0.3} radiusBottom={0.35} height={1.2} />
      {/* Head */}
      <Sphere position={[0, 1.6, 0]} color={skinColor} radius={0.35} />
      {/* Hat */}
      <Cone position={[0, 2.1, 0]} color={hatColor} radius={0.35} height={0.8} />
      {/* Legs */}
      <Cylinder position={[-0.15, 0.4, 0]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.7} />
      <Cylinder position={[0.15, 0.4, 0]} color={bodyColor} radiusTop={0.1} radiusBottom={0.15} height={0.7} />
      {/* Arms */}
      <Cylinder position={[-0.45, 1.0, 0]} color={skinColor} radiusTop={0.08} radiusBottom={0.08} height={0.4} rotation={[0, 0, -0.3]} />
      <Cylinder position={[0.45, 1.0, 0]} color={skinColor} radiusTop={0.08} radiusBottom={0.08} height={0.4} rotation={[0, 0, 0.3]} />
      {/* Present if loading */}
      {isLoading && (
        <Box position={[0, 1.2, 0.4]} color="#4169E1" size={[0.3, 0.3, 0.3]} />
      )}
    </group>
  );
}

// Santa component
function Santa({ position, rotation }: any) {
  const bodyColor = '#DC143C';
  const furColor = '#F5F5F5';
  const skinColor = '#FFDAB9';
  
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <Cylinder position={[0, 1.1, 0]} color={bodyColor} radiusTop={0.4} radiusBottom={0.45} height={1.6} />
      {/* Head */}
      <Sphere position={[0, 2.2, 0]} color={skinColor} radius={0.4} />
      {/* Hat */}
      <Cone position={[0, 2.8, 0]} color={bodyColor} radius={0.45} height={1.0} />
      <Sphere position={[0, 3.1, 0]} color={furColor} radius={0.15} />
      {/* Beard */}
      <Cone position={[0, 2.0, 0.2]} color={furColor} radius={0.3} height={0.6} rotation={[-0.2, 0, 0]} />
      {/* Arms */}
      <Cylinder position={[-0.5, 1.8, 0]} color={skinColor} radiusTop={0.08} radiusBottom={0.08} height={0.6} rotation={[0, 0, -0.5]} />
      <Cylinder position={[0.5, 1.8, 0]} color={skinColor} radiusTop={0.08} radiusBottom={0.08} height={0.6} rotation={[0, 0, 0.5]} />
      {/* Sack */}
      <Cylinder position={[0.6, 1.5, 0]} color="#8B4513" radiusTop={0.25} radiusBottom={0.15} height={0.8} rotation={[0, 0, 0.3]} />
      {/* Legs */}
      <Cylinder position={[-0.2, 0.5, 0.2]} color="#333333" radiusTop={0.1} radiusBottom={0.15} height={0.9} />
      <Cylinder position={[0.2, 0.5, -0.2]} color="#333333" radiusTop={0.1} radiusBottom={0.15} height={0.9} />
      {/* Boots */}
      <Box position={[-0.2, 0.1, 0.2]} color="#1a1a1a" size={[0.25, 0.2, 0.4]} />
      <Box position={[0.2, 0.1, -0.2]} color="#1a1a1a" size={[0.25, 0.2, 0.4]} />
    </group>
  );
}

// Snow pile component
function SnowPile({ position, radius }: any) {
  return (
    <mesh position={position}>
      <circleGeometry args={[radius, 32]} />
      <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
    </mesh>
  );
}

// Snowflake component
function Snowflake({ position }: any) {
  return (
    <mesh position={position}>
      <circleGeometry args={[0.05, 8]} />
      <meshStandardMaterial color="#E0F7FA" transparent opacity={0.8} />
    </mesh>
  );
}

export default function Qwen3CoderPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 py-12 dark:bg-black">
      <div className="w-full max-w-3xl px-6">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Qwen3 Coder
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          3D Diorama: Santa at the North Pole
        </p>
        
        <div className="mt-8 h-[500px] w-full rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
            {/* Ambient light */}
            <ambientLight intensity={0.5} color="#E0F7FA" />
            
            {/* Directional light (sun) */}
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1} 
              color="#FFFFFF"
            />
            
            {/* Bottom light for under-snow visibility */}
            <pointLight position={[0, -5, 0]} intensity={0.3} color="#E0F7FA" />
            
            {/* Ground/Snow */}
            <SnowPile position={[0, -0.1, 0]} radius={12} />
            
            {/* Santa and sled */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <Santa position={[0, 0, 2]} rotation={[0, 0, 0]} />
            </Float>
            
            {/* Reindeer lined up */}
            <Reindeer position={[-3, 0, -2]} rotation={[0, Math.PI / 4, 0]} />
            <Reindeer position={[-1, 0, -3]} rotation={[0, 0, 0]} />
            <Reindeer position={[1, 0, -3]} rotation={[0, 0, 0]} />
            <Reindeer position={[3, 0, -2]} rotation={[0, -Math.PI / 4, 0]} />
            
            {/* Elves helping with presents */}
            <Elf position={[-2.5, 0, 2.5]} rotation={[0, Math.PI / 4, 0]} isLoading={true} />
            <Elf position={[2.5, 0, 2.5]} rotation={[0, -Math.PI / 4, 0]} isLoading={true} />
            <Elf position={[0, 0, 3]} rotation={[0, Math.PI, 0]} />
            
            {/* Presents on snow */}
            <Box position={[-2, 0.2, 1]} color="#4169E1" size={[0.4, 0.4, 0.4]} />
            <Box position={[-2.5, 0.2, 2]} color="#DC143C" size={[0.35, 0.35, 0.35]} />
            <Box position={[2, 0.2, 1]} color="#228B22" size={[0.4, 0.4, 0.4]} />
            <Box position={[2.5, 0.2, 2]} color="#FFD700" size={[0.35, 0.35, 0.35]} />
            <Box position={[0, 0.2, 4]} color="#9400D3" size={[0.4, 0.4, 0.4]} />
            
            {/* Random snowflakes */}
            <Snowflake position={[2, 3, -2]} />
            <Snowflake position={[-3, 4, 1]} />
            <Snowflake position={[1, 5, -3]} />
            <Snowflake position={[-2, 2, 3]} />
            <Snowflake position={[3, 6, 2]} />
            
            {/* OrbitControls for user interaction */}
            <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={20} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
