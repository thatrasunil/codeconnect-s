import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroBackground3D } from './Three/HeroBackground3D';

export function Hero3DBackground({ children }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '400px',
      borderRadius: '24px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.5))',
      border: '1px solid rgba(148, 163, 184, 0.1)',
    }}>
      {/* 3D Canvas Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <Canvas
          camera={{
            position: [0, 0, 8],
            fov: 45,
            near: 0.1,
            far: 1000,
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <HeroBackground3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

export default Hero3DBackground;
