import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Interactive3DFlow } from './Three/Interactive3DFlow';

export function Steps3DFlow() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto 6rem',
      padding: '0 2rem',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Three Steps to Get Started
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '1.1rem',
        }}>
          Set up collaborative coding in seconds
        </p>
      </div>

      {/* 3D Flow Diagram */}
      <div style={{
        width: '100%',
        height: '300px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        overflow: 'hidden',
        marginBottom: '3rem',
        boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.1)',
      }}>
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: 50,
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <Interactive3DFlow />
          </Suspense>
        </Canvas>
      </div>

      {/* Text descriptions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
      }}>
        {[
          {
            num: '1',
            title: 'Create Room',
            desc: 'Start a session instantly with one click.',
            color: '#8b5cf6',
          },
          {
            num: '2',
            title: 'Share Link',
            desc: 'Invite friends or colleagues via URL.',
            color: '#06b6d4',
          },
          {
            num: '3',
            title: 'Code Together',
            desc: 'Real-time sync with < 50ms latency.',
            color: '#22c55e',
          },
        ].map((step, i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.3)',
              border: `1px solid ${step.color}20`,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${step.color}15`;
              e.currentTarget.style.borderColor = `${step.color}40`;
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
              e.currentTarget.style.borderColor = `${step.color}20`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              margin: '0 auto 1rem',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${step.color}, ${step.color}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
            }}>
              {step.num}
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: 'white',
            }}>
              {step.title}
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Steps3DFlow;
