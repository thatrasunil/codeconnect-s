import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Minimal Particle Starfield
export function ParticleCloud() {
  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.rotation) {
      pointsRef.current.rotation.x += 0.00005;
      pointsRef.current.rotation.y += 0.0001;
    }
  });

  // Generate particle positions
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  return (
    <group ref={pointsRef}>
      <points geometry={particlesGeometry}>
        <pointsMaterial size={0.08} color="#94a3b8" sizeAttenuation transparent opacity={0.4} />
      </points>
    </group>
  );
}

// Main hero background component
export function HeroBackground3D() {
  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Fog for depth to fade out particles in the distance */}
      <fog attach="fog" args={['#0f172a', 5, 25]} />

      {/* 3D Elements - Minimal Starfield */}
      <ParticleCloud />

      {/* Sparkles effect for subtle glowing motes */}
      <Sparkles
        count={80}
        scale={20}
        size={1.5}
        speed={0.2}
        noise={[1, 1, 1]}
        color="#3b82f6"
        opacity={0.5}
      />
      <Sparkles
        count={50}
        scale={15}
        size={2}
        speed={0.1}
        noise={[0.5, 0.5, 0.5]}
        color="#a78bfa"
        opacity={0.3}
      />
    </>
  );
}

export default HeroBackground3D;
