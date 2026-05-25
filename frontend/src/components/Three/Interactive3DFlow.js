import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Stage node for the flow
function FlowStage({ position, index, title, color }) {
  const mesh = useRef();
  const line = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.3;
      mesh.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      mesh.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[0.4, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow sphere */}
      <mesh scale={1.3}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Connection line between stages
function ConnectionLine({ start, end, color }) {
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints([start, end]);

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
      </line>

      {/* Animated particle along the line */}
      <mesh position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

// Main flow diagram
export function Interactive3DFlow() {
  const stages = [
    { position: [-4, 0, 0], title: 'Create', color: '#8b5cf6', index: 0 },
    { position: [0, 0, 0], title: 'Share', color: '#06b6d4', index: 1 },
    { position: [4, 0, 0], title: 'Code', color: '#22c55e', index: 2 },
  ];

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#8b5cf6" />

      <fog attach="fog" args={['#0f172a', 2, 20]} />

      {/* Flow stages */}
      {stages.map((stage, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <FlowStage {...stage} />
        </Float>
      ))}

      {/* Connection lines */}
      <ConnectionLine
        start={stages[0].position}
        end={stages[1].position}
        color="#06b6d4"
      />
      <ConnectionLine
        start={stages[1].position}
        end={stages[2].position}
        color="#22c55e"
      />

      {/* Sparkles */}
      <Sparkles count={30} scale={15} size={2} speed={0.4} noise={[1, 1, 1]} color="#a78bfa" />
    </>
  );
}

export default Interactive3DFlow;
