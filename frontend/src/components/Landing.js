import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaCode, FaGlobe, FaComments, FaShare, FaLock, FaMicrophone } from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sparkles, MeshDistortMaterial, Float } from '@react-three/drei';
import FlowDiagram3D from './Three/FlowDiagram3D';


import { AIModel, CollabModel, CloudModel, SecureModel, LanguageModel, VideoModel } from './Three/Feature3DIcons'; import { createRoom as createFirestoreRoom } from '../services/firestoreService';
import SecureLoading from './SecureLoading';

function Landing() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState('');

  const initiateCreateRoom = () => {
    const storedName = localStorage.getItem('codeconnect_guest_name');
    if (storedName) {
      createRoom(storedName);
    } else {
      setShowNameModal(true);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    localStorage.setItem('codeconnect_guest_name', guestName);
    setShowNameModal(false);
    createRoom(guestName);
  };

  const createRoom = async (name) => {
    setIsCreating(true);
    try {
      const newRoom = await createFirestoreRoom({
        title: "Untitled Room",
        ownerId: "guest", // Guest user
        isPublic: true,
        language: "javascript",
        ownerName: name // Pass the name
      });

      if (newRoom.id) {
        navigate(`/room/${newRoom.id}`);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room: ' + err.message);
      setIsCreating(false);
    }
  };

  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const joinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  const steps = [
    { num: '1', title: 'Create Room', desc: 'Start a session instantly with one click.' },
    { num: '2', title: 'Share Link', desc: 'Invite friends or colleagues via URL.' },
    { num: '3', title: 'Code Together', desc: 'Real-time sync with < 50ms latency.' }
  ];

  if (isCreating) {
    return <SecureLoading message="Initializing Secure Environment..." />;
  }

  return (
    <div className="landing-page">

      {/* Name Modal */}
      {showNameModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              padding: '2rem', width: '90%', maxWidth: '400px',
              background: '#1e293b', border: '1px solid #334155'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Enter your name</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Please enter a display name to join the room.</p>
            <form onSubmit={handleNameSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="Your Name (e.g. Alex)"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: '#0f172a', border: '1px solid #334155',
                  color: 'white', marginBottom: '1.5rem', outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!guestName.trim()}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer',
                    fontWeight: '600', opacity: !guestName.trim() ? 0.5 : 1
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dynamic Background Accents */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--accent-primary)', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '20%', right: '-5%', width: '400px', height: '400px', background: 'var(--accent-secondary)', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

      <main className="landing-main">

        {/* Hero Section */}
        <div className="hero-section">

          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: '#22d3ee', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '1.5rem', textTransform: 'uppercase',
              background: 'rgba(34, 211, 238, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(34, 211, 238, 0.2)'
            }}>
              <span style={{ width: '8px', height: '8px', background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 10px #22d3ee' }}></span>
              Real-time collaboration
            </div>

            <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: '1.1', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.03em', fontFamily: '"Inter", sans-serif' }}>
              <span style={{ background: 'linear-gradient(to right, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Code together</span>
              <br />
              <span style={{ color: '#3b82f6', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in perfect sync.</span>
            </h1>

            <p className="subtitle" style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.7' }}>
              Spin up an interview-ready coding room, share a link, and watch every keystroke live. No setup required.
            </p>

            <div className="action-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <motion.button
                onClick={initiateCreateRoom}
                className="btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontSize: '1.1rem',
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <FaPlus size={14} /> Start Coding Now
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid #475569', backdropFilter: 'blur(10px)' }}>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 1rem', outline: 'none', width: '150px', fontSize: '1rem' }}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button
                  onClick={joinRoom}
                  style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#2563eb'}
                  onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>


          <motion.div
            className="hero-image-container"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px', position: 'relative' }}
          >
            {/* Glow Effect - Stronger */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '140%',
              height: '140%',
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: -1
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.5) 0%, transparent 60%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: -1,
              mixBlendMode: 'screen'
            }} />

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              style={{
                background: '#1e1e1e',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '600px',
                overflow: 'hidden',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-5deg) rotateX(2deg)'
              }}
            >
              {/* Window Header */}
              <div style={{
                background: '#252526',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #333'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <div style={{ color: '#858585', fontSize: '0.9rem', fontFamily: 'monospace' }}>main.js</div>
                <div style={{ width: '50px' }} /> {/* Spacer */}
              </div>

              {/* Code Content */}
              <div style={{ position: 'relative', display: 'flex' }}>
                {/* Line Numbers */}
                <div style={{
                  padding: '24px 0 24px 20px',
                  textAlign: 'right',
                  color: '#6e7681',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  userSelect: 'none',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  marginRight: '16px',
                  paddingRight: '16px'
                }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Code Area */}
                <div style={{ padding: '24px 20px 24px 0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', flex: 1 }}>
                  <TypewriterCode />
                </div>
              </div>

              {/* Floating Badge */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '25px',
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <span className="live-dot" style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}></span>
                Live Connection
              </div>
            </motion.div>
          </motion.div>

        </div>

        {/* How It Works */}
        <div className="how-it-works" style={{ width: '100%', maxWidth: '1200px', marginBottom: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Get started in seconds. No account needed.</p>
          </div>

          {/* 3D Flow Diagram */}
          <div style={{ width: '100%', height: '400px', marginBottom: '2rem' }}>
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <FlowDiagram3D />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
              </Canvas>
            </Suspense>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="step-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                style={{
                  padding: '2.5rem',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{
                  position: 'absolute', top: '0', right: '0',
                  fontSize: '8rem', fontWeight: '900', color: 'rgba(255,255,255,0.02)',
                  lineHeight: '0.8', pointerEvents: 'none'
                }}>{step.num}</div>

                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : '#ec4899'}, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                  fontSize: '1.5rem', color: 'white', opacity: 0.9
                }}>
                  {i === 0 ? <FaPlus /> : i === 1 ? <FaShare /> : <FaCode />}
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>






        {/* Features Section */}
        <div className="features-section" style={{ width: '100%', maxWidth: '1200px', marginBottom: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Powerful tools for interviews, education, and pair programming.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {[
              { title: "AI Assistant", model: <AIModel />, color: "#8b5cf6", desc: "Get real-time code explanations, debugging help, and suggestions from Gemini AI." },
              { title: "Collaborative Coding", model: <CollabModel />, color: "#ec4899", desc: "Work together in the same editor with presence indicators and live cursors." },
              { title: "Cloud Execution", model: <CloudModel />, color: "#eab308", desc: "Run code instantly in the cloud. Support for multiple languages with fast output." },
              { title: "Secure Rooms", model: <SecureModel />, color: "#ef4444", desc: "Ephemeral, password-protected rooms ensuring your code stays private and temporary." },
              { title: "Multi-Language", model: <LanguageModel />, color: "#06b6d4", desc: "Support for JavaScript, Python, Java, C++, and more with intelligent syntax highlighting." },
              { title: "Video Chat", model: <VideoModel />, color: "#22c55e", desc: "Built-in video and voice chat integration for seamless team communication." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: `0 20px 40px -10px ${feature.color}30` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  padding: '2.5rem',
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                  opacity: 0.5
                }} />

                <div style={{
                  width: '100%', height: '160px', borderRadius: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  position: 'relative',
                  marginBottom: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', inset: -20 }}>
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[5, 5, 5]} intensity={1.5} />
                      <pointLight position={[-5, -5, -5]} intensity={0.5} color={feature.color} />
                      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        {feature.model}
                      </Float>
                      <Environment preset="city" />
                    </Canvas>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>{feature.title}</h3>
                  <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '10rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { q: "Is CodeConnect free?", a: "Yes, our Hobby plan is completely free for personal use and quick coding sessions. You get access to all core features including real-time collaboration and basic AI assistance." },
              { q: "Do I need to create an account?", a: "No! You can create and join rooms instantly as a guest without signing up. However, creating an account allows you to save your room history, track your coding stats, and customize your profile." },
              { q: "Is my code secure?", a: "Absolutely. Guest rooms are ephemeral and memory-only. Once all participants leave, the code is permanently wiped from our servers. For registered users, we use industry-standard encryption for data at rest and in transit." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FAQItem question={faq.q} answer={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>

      </main>


      <footer className="landing-footer" style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '6rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        background: 'linear-gradient(to bottom, #0b1120, #020617)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '60%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FaCode size={32} color="#3b82f6" />
          <span style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CodeConnect</span>
        </div>

        <p style={{ marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', fontSize: '1.1rem', color: '#64748b' }}>
          Built for developers, by developers. <br />Simplifying real-time collaboration one line at a time.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', fontWeight: '500', marginBottom: '4rem' }}>
          {['Twitter', 'GitHub', 'Status', 'Privacy'].map((link) => (
            <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '1rem' }}
              onMouseOver={(e) => e.target.style.color = '#3b82f6'}
              onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
              {link}
            </a>
          ))}
        </div>

        <div style={{ fontSize: '0.9rem', color: '#475569' }}>
          © 2026 CodeConnect. All rights reserved.
        </div>
      </footer>




      <style>{`
        /* Hero Section Responsive */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin-bottom: 8rem;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .hero-text {
            order: 1;
          }

          .hero-image-container {
            order: 2;
          }

          .action-buttons {
            flex-direction: column !important;
            align-items: center !important;
            gap: 1rem !important;
          }

          .action-buttons > * {
            width: 100%;
            max-width: 350px;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem !important;
          }

          .subtitle {
            font-size: 1.1rem !important;
          }

          .hero-badge {
            font-size: 0.75rem !important;
          }
        }

        /* Features Grid Responsive */
        @media (max-width: 768px) {
          .features-section h2 {
            font-size: 2rem !important;
          }

          .features-section p {
            font-size: 1rem !important;
          }
        }

        /* How It Works Responsive */
        @media (max-width: 768px) {
          .how-it-works h2 {
            font-size: 2rem !important;
          }

          .how-it-works p {
            font-size: 1rem !important;
          }

          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* FAQ Responsive */
        @media (max-width: 768px) {
          .faq-section h2 {
            font-size: 2rem !important;
          }

          .faq-section p {
            font-size: 1rem !important;
          }
        }

        /* Footer Responsive */
        @media (max-width: 768px) {
          .landing-footer {
            padding: 4rem 1rem !important;
          }

          .landing-footer > div:nth-child(4) {
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
        }

        /* 3D Canvas Responsive */
        @media (max-width: 768px) {
          .how-it-works > div:nth-child(2) {
            height: 300px !important;
          }
        }

        /* Code Editor Window Responsive */
        @media (max-width: 768px) {
          .hero-image-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
}


function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      style={{
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
    >
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0 }}>{question}</h3>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          <FaArrowRight size={14} color="#94a3b8" />
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: '#94a3b8', lineHeight: '1.6' }}>
          {answer}
        </div>
      </motion.div>
    </div>
  );
}


function TypewriterCode() {
  const codeLines = [
    { text: '// Two Sum Problem', color: '#6a9955' },
    { text: 'function twoSum(nums, target) {', indent: 0, html: true },
    { text: 'const map = new Map();', indent: 20, html: true },
    { text: 'for (let i = 0; i < nums.length; i++) {', indent: 20, html: true },
    { text: 'const diff = target - nums[i];', indent: 40, html: true },
    { text: 'if (map.has(diff)) return [map.get(diff), i];', indent: 40, html: true },
    { text: 'map.set(nums[i], i);', indent: 40, html: true },
    { text: '}', indent: 20, html: true },
    { text: 'return [];', indent: 20, html: true },
    { text: '}', indent: 0, html: true }
  ];

  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return;

    const timeout = setTimeout(() => {
      const currentLine = codeLines[currentLineIndex];
      const fullText = currentLine.text;

      if (currentCharIndex < fullText.length) {
        // Typing current line
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Line finished, move to next
        setDisplayedLines(prev => [...prev, currentLine]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 30); // Typing speed

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex]);

  // Render static lines + currently typing line
  return (
    <>
      {displayedLines.map((line, i) => (
        <CodeLine key={i} line={line} />
      ))}
      {currentLineIndex < codeLines.length && (
        <div style={{ paddingLeft: codeLines[currentLineIndex].indent || 0, display: 'flex', alignItems: 'center' }}>
          <SyntaxHighlight text={codeLines[currentLineIndex].text.substring(0, currentCharIndex)} />
          <span style={{
            display: 'inline-block', width: '8px', height: '16px',
            background: '#3b82f6', marginLeft: '2px', animation: 'blink 1s step-end infinite'
          }} />
        </div>
      )}
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </>
  );
}

const CodeLine = ({ line }) => (
  <div style={{ paddingLeft: line.indent || 0, whiteSpace: 'pre-wrap' }}>
    {line.html ? <SyntaxHighlight text={line.text} /> : <span style={{ color: line.color }}>{line.text}</span>}
  </div>
);

const SyntaxHighlight = ({ text }) => {
  // Simple naive highlighter for the typing effect
  // In a real app, use prismjs or similar, but for this specific snippet, manual is cleaner for animation
  const words = text.split(/(\s+|[(){}[\].,;])/);
  return (
    <span>
      {words.map((word, i) => {
        let color = '#e2e8f0';
        if (['function', 'const', 'let', 'return', 'new', 'if', 'for'].includes(word)) color = '#c586c0';
        else if (['twoSum', 'has', 'get', 'set'].includes(word)) color = '#dcdcaa';
        else if (['nums', 'target', 'map', 'diff', 'i', 'length'].includes(word)) color = '#9cdcfe';
        else if (['Map'].includes(word)) color = '#4ec9b0';
        else if (!isNaN(word)) color = '#b5cea8';

        return <span key={i} style={{ color }}>{word}</span>;
      })}
    </span>
  );
};

export default Landing;
