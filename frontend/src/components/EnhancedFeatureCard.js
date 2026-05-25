import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion } from 'framer-motion';

// Enhanced 3D model wrapper with interactivity
function Interactive3DModel({ model, color }) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Enhanced rotation based on hover state
      const speed = isHovered ? 0.015 : 0.008;
      groupRef.current.rotation.x += speed;
      groupRef.current.rotation.y += speed * 1.5;

      // Scale pulse on hover
      if (isHovered) {
        groupRef.current.scale.lerp(
          { x: 1.1, y: 1.1, z: 1.1 },
          0.1
        );
      } else {
        groupRef.current.scale.lerp(
          { x: 1, y: 1, z: 1 },
          0.1
        );
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {model}
    </group>
  );
}

// Enhanced feature card with 3D preview
export function EnhancedFeatureCard({ title, description, model, color, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: `0 30px 60px -15px ${color}40` }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
      style={{
        padding: '2.5rem',
        borderRadius: '24px',
        background: isHovered
          ? `linear-gradient(145deg, rgba(${color === '#8b5cf6' ? '139, 92, 246' : color === '#ec4899' ? '236, 72, 153' : color === '#eab308' ? '234, 179, 8' : color === '#ef4444' ? '239, 68, 68' : color === '#06b6d4' ? '6, 182, 212' : '34, 197, 85'}, 0.15), rgba(30, 41, 59, 0.5))`
          : 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        border: `1px solid ${isHovered ? `${color}50` : 'rgba(255,255,255,0.05)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top gradient line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 0.8, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          transformOrigin: 'left',
        }}
      />

      {/* 3D Canvas Container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '16px',
          background: 'rgba(0,0,0,0.3)',
          position: 'relative',
          marginBottom: '0.5rem',
          overflow: 'hidden',
          border: `1px solid ${color}20`,
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.8} color={color} />

          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Interactive3DModel model={model} color={color} />
          </Float>
        </Canvas>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: 'white',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </h3>
        <p style={{
          color: '#cbd5e1',
          lineHeight: '1.6',
          fontSize: '0.95rem',
        }}>
          {description}
        </p>
      </motion.div>

      {/* Interactive icon indicator */}
      <motion.div
        animate={isHovered ? { x: 5 } : { x: 0 }}
        style={{
          color: color,
          fontSize: '1.2rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: 'auto',
        }}
      >
        Learn More →
      </motion.div>
    </motion.div>
  );
}

export default EnhancedFeatureCard;
