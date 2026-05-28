import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaCode, FaUsers, FaLock, FaBolt } from 'react-icons/fa';
import { createRoom as createApiRoom } from '../services/apiService';
import SecureLoading from './SecureLoading';
import { useAuth } from '../contexts/AuthContext';

const STORY_SECTIONS = [
  {
    title: "Code is more than just syntax.",
    subtitle: "It's the art of digital expression.",
    description: "CodeConnect removes all friction between your mind and the canvas. Experience a collaborative workspace designed with flawless aesthetics and elite performance.",
    icon: <FaCode size={20} />,
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-code-lines-on-a-computer-screen-8650-large.mp4",
    accent: { r: 168, g: 85, b: 247 },   // violet
    accentHex: '#a855f7',
    accentLight: 'rgba(168,85,247,',
  },
  {
    title: "It's the ideas we build together.",
    subtitle: "High-fidelity real-time pair programming.",
    description: "Write, review, and debug code collaboratively in real-time with Monaco Editor integration. Track active typing indicators and follow user cursors instantly.",
    icon: <FaUsers size={20} />,
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-41584-large.mp4",
    accent: { r: 56, g: 189, b: 248 },   // cyan
    accentHex: '#38bdf8',
    accentLight: 'rgba(56,189,248,',
  },
  {
    title: "Zero setup. Zero friction.",
    subtitle: "Spin up secure sessions in 2 seconds.",
    description: "Launch instant, secure rooms without configuration. Simply share a 6-digit room code with your peers and start coding instantly with auto-saved persistence.",
    icon: <FaLock size={20} />,
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-flowing-lines-of-code-31868-large.mp4",
    accent: { r: 52, g: 211, b: 153 },   // emerald
    accentHex: '#34d399',
    accentLight: 'rgba(52,211,153,',
  },
  {
    title: "Just you, your team, and the canvas.",
    subtitle: "A fully stacked developer engine.",
    description: "Accelerate your coding velocity with an integrated real-time collaborative Whiteboard, high-fidelity Voice Chat, Gemini AI debugging, and sandbox execution.",
    icon: <FaBolt size={20} />,
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-hud-interface-31845-large.mp4",
    accent: { r: 251, g: 146, b: 60 },   // orange
    accentHex: '#fb923c',
    accentLight: 'rgba(251,146,60,',
  }
];

// ─── Particle Canvas ────────────────────────────────────────────────────────
function ParticleCanvas({ accentRgb }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const accentRef = useRef(accentRgb);

  useEffect(() => { accentRef.current = accentRgb; }, [accentRgb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 90);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1.2,
        opacity: Math.random() * 0.5 + 0.2,
      }));
    };

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { r, g, b } = accentRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const CONNECTION_DIST = 140;
      const MOUSE_ATTRACT_DIST = 180;

      particles.forEach(p => {
        // Light repulsion from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_ATTRACT_DIST) {
          const force = (1 - dist / MOUSE_ATTRACT_DIST) * 0.5;
          p.vx += (dx / dist) * force * 0.06;
          p.vy += (dy / dist) * force * 0.06;
        }

        // Dampen velocity
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity * 0.7})`;
        ctx.fill();
      });

      // Draw connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw connection to mouse cursor
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MOUSE_ATTRACT_DIST) {
          const alpha = (1 - md / MOUSE_ATTRACT_DIST) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    draw();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Spotlight Card ─────────────────────────────────────────────────────────
function SpotlightCard({ children, className, accentRgb, style }) {
  const cardRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--mx', '-9999px');
    card.style.setProperty('--my', '-9999px');
  }, []);

  const { r, g, b } = accentRgb;

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className || ''}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        '--accent-r': r,
        '--accent-g': g,
        '--accent-b': b,
        '--mx': '-9999px',
        '--my': '-9999px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Floating Symbols ────────────────────────────────────────────────────────
const SYMBOLS = ['{ }', '</>', '=>', '[ ]', '( )', '&&', '||', '/**'];
function FloatingSymbols({ accentHex }) {
  return (
    <div className="floating-symbols-layer" aria-hidden="true">
      {SYMBOLS.map((sym, i) => (
        <span
          key={i}
          className="float-symbol"
          style={{
            left: `${8 + i * 12}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${18 + i * 3}s`,
            color: accentHex,
          }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function Landing() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();

  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Smooth accent color interpolation between sections
  const [displayAccent, setDisplayAccent] = useState(STORY_SECTIONS[0].accent);
  const accentAnimRef = useRef(null);
  const currentAccentRef = useRef(STORY_SECTIONS[0].accent);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (firebaseUser || user) navigate('/dashboard');
  }, [firebaseUser, user, navigate]);

  // Animate accent color transition
  useEffect(() => {
    const target = activeSection < STORY_SECTIONS.length
      ? STORY_SECTIONS[activeSection].accent
      : { r: 255, g: 255, b: 255 };

    let start = null;
    const from = { ...currentAccentRef.current };
    const duration = 700;

    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const r = Math.round(from.r + (target.r - from.r) * ease);
      const g = Math.round(from.g + (target.g - from.g) * ease);
      const b = Math.round(from.b + (target.b - from.b) * ease);
      setDisplayAccent({ r, g, b });
      if (p < 1) {
        accentAnimRef.current = requestAnimationFrame(animate);
      } else {
        currentAccentRef.current = target;
      }
    };

    if (accentAnimRef.current) cancelAnimationFrame(accentAnimRef.current);
    accentAnimRef.current = requestAnimationFrame(animate);
    return () => { if (accentAnimRef.current) cancelAnimationFrame(accentAnimRef.current); };
  }, [activeSection]);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index'), 10);
            if (!isNaN(index)) setActiveSection(index);
          }
        });
      },
      { root: null, rootMargin: '-20% 0px -20% 0px', threshold: 0.2 }
    );
    const sections = document.querySelectorAll('.story-section');
    sections.forEach(s => observer.observe(s));
    return () => sections.forEach(s => observer.unobserve(s));
  }, []);

  const scrollToSection = (index) => {
    const sections = document.querySelectorAll('.story-section');
    if (sections[index]) sections[index].scrollIntoView({ behavior: 'smooth' });
  };

  const initiateCreateRoom = () => {
    const storedName = localStorage.getItem('codeconnect_guest_name');
    if (storedName) createRoom(storedName);
    else setShowNameModal(true);
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
      const newRoom = await createApiRoom({
        title: 'Untitled Session', ownerId: 'guest',
        isPublic: true, language: 'javascript', ownerName: name
      });
      if (newRoom.roomId) navigate(`/room/${newRoom.roomId}`);
      else if (newRoom.id) navigate(`/room/${newRoom.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room: ' + err.message);
      setIsCreating(false);
    }
  };

  const joinRoom = () => { if (roomId) navigate(`/room/${roomId}`); };

  if (isCreating || firebaseUser || user) {
    return <SecureLoading message={isCreating ? 'Initializing Canvas...' : 'Redirecting to Dashboard...'} />;
  }

  const { r, g, b } = displayAccent;
  const accentCss = `rgb(${r},${g},${b})`;
  const accentGlow = `rgba(${r},${g},${b},0.35)`;
  const accentSoft = `rgba(${r},${g},${b},0.12)`;
  const accentBorder = `rgba(${r},${g},${b},0.35)`;

  const currentSection = STORY_SECTIONS[activeSection];
  const currentAccentHex = currentSection?.accentHex || '#a855f7';

  const getBgStyle = () => ({
    transform: `scale(${1 + activeSection * 0.015}) translate3d(0,0,0)`,
    filter: `blur(${activeSection === 4 ? 0 : 2}px)`,
    opacity: 0.3 + activeSection * 0.035,
  });

  return (
    <div className="landing-scroll-container">
      {/* ── Parallax BG ── */}
      <div className="parallax-background" style={getBgStyle()} />

      {/* ── Ambient vignette ── */}
      <div className="ambient-vignette" />

      {/* ── Interactive Particle Network ── */}
      <ParticleCanvas accentRgb={displayAccent} />

      {/* ── Floating Dev Symbols ── */}
      <FloatingSymbols accentHex={currentAccentHex} />

      {/* ── Theme color glow orb follows active section ── */}
      <div
        className="theme-orb"
        style={{
          background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        }}
      />

      {/* ── Header ── */}
      <header className="sticky-header">
        <div className="header-logo">
          <FaCode className="logo-icon" style={{ color: accentCss, filter: `drop-shadow(0 0 8px ${accentGlow})` }} />
          <span>CodeConnect</span>
        </div>
        <button onClick={() => scrollToSection(4)} className="skip-btn">
          Skip to Code <FaArrowRight size={12} />
        </button>
      </header>

      {/* ── Right Nav Dots ── */}
      <div className="floating-dots-nav">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`nav-dot ${activeSection === index ? 'active' : ''}`}
            title={index === 4 ? 'Workspace' : `Slide ${index + 1}`}
            style={activeSection === index ? {
              background: accentCss,
              boxShadow: `0 0 10px ${accentGlow}`,
            } : {}}
          />
        ))}
      </div>

      {/* ── Story Sections ── */}
      {STORY_SECTIONS.map((section, index) => (
        <section key={index} className="story-section" data-index={index}>
          <div className="story-content story-content-split">

            {/* Text column with spotlight card */}
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, maxWidth: '520px' }}
            >
              <SpotlightCard className="glass-card text-column" accentRgb={section.accent}>
                <div
                  className="card-badge"
                  style={{
                    background: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.15)`,
                    borderColor: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.4)`,
                    color: section.accentHex,
                  }}
                >
                  <span className="badge-icon">{section.icon}</span>
                  <span className="badge-text">Narrative {index + 1} of 4</span>
                </div>

                <h1 className="story-title gradient-text neon-text-glow">
                  {section.title}
                </h1>
                <h3 className="story-subtitle">{section.subtitle}</h3>
                <p className="story-desc">{section.description}</p>

                {/* Mobile mockups */}
                <div className="mobile-mockup-container">
                  {index === 0 && (
                    <div className="card-mockup flex-center">
                      <div className="visual-code-line"><span className="color-purple">const</span> codeConnect = <span className="color-yellow">new</span> <span className="color-blue">CollaboratorEngine</span>();</div>
                      <div className="visual-code-line second-line">codeConnect.<span className="color-green">ignite</span>(); <span className="cursor-pulse">|</span></div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="card-mockup collab-mockup">
                      <div className="collab-user user-alex"><div className="user-dot bg-purple" /> Alex (typing...)</div>
                      <div className="collab-user user-sarah"><div className="user-dot bg-blue" /> Sarah (following)</div>
                      <div className="visual-code-line"><span className="color-blue">function</span> <span className="color-yellow">syncCode</span>() &#123; <span className="visual-cursor" style={{ borderColor: '#8b5cf6' }}></span>&#125;</div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="card-mockup passcode-mockup">
                      {[5,9,2,8,1,4].map((d,i) => <div key={i} className="passcode-digit">{d}</div>)}
                    </div>
                  )}
                  {index === 3 && (
                    <div className="badges-grid">
                      <span className="visual-badge">🤖 Gemini AI Assist</span>
                      <span className="visual-badge">🎨 Realtime Whiteboard</span>
                      <span className="visual-badge">🎙️ Voice Channels</span>
                      <span className="visual-badge">⚡ Sandboxed Run</span>
                    </div>
                  )}
                </div>

                <button
                  className="next-slide-btn"
                  onClick={() => scrollToSection(index + 1)}
                  style={{ '--dot-color': section.accentHex }}
                >
                  Scroll down or Click to continue <FaArrowRight className="bounce-arrow" />
                </button>
              </SpotlightCard>
            </motion.div>

            {/* Desktop Visual Column */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="visual-column"
            >
              <div
                className="video-glow-frame"
                style={{
                  borderColor: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.2)`,
                  boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 60px rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.12)`,
                }}
              >
                <video
                  autoPlay loop muted playsInline preload="metadata"
                  src={section.videoSrc}
                  className="showcase-video"
                />
                {index === 0 && (
                  <div className="video-visual-overlay visual-editor-overlay">
                    <div className="visual-code-line"><span className="color-purple">const</span> platform = <span className="color-yellow">new</span> <span className="color-blue">CodeConnect</span>();</div>
                    <div className="visual-code-line second-line">platform.<span className="color-green">ignite</span>(); <span className="cursor-pulse">|</span></div>
                  </div>
                )}
                {index === 1 && (
                  <div className="video-visual-overlay visual-collab-overlay">
                    <div className="live-bubble bubble-alex"><div className="user-dot bg-purple" /> Alex writing</div>
                    <div className="live-bubble bubble-sarah"><div className="user-dot bg-blue" /> Sarah viewing</div>
                  </div>
                )}
                {index === 2 && (
                  <div className="video-visual-overlay visual-passcode-overlay">
                    <div className="visual-passcode-container">
                      {[5,9,2,8,1,4].map((d,i) => (
                        <div key={i} className="passcode-digit-neon" style={{
                          borderColor: section.accentHex,
                          color: section.accentHex,
                          boxShadow: `0 0 15px rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.3)`,
                        }}>{d}</div>
                      ))}
                    </div>
                  </div>
                )}
                {index === 3 && (
                  <div className="video-visual-overlay visual-features-overlay">
                    <div className="feature-neon-badge" style={{ background: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.15)`, borderColor: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.5)`, color: section.accentHex }}>🔥 Engine Compiled</div>
                    <div className="feature-neon-badge" style={{ background: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.15)`, borderColor: `rgba(${section.accent.r},${section.accent.g},${section.accent.b},0.5)`, color: section.accentHex }}>🚀 Low Latency</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* ── Final Action Section ── */}
      <section className="story-section final-action-section" data-index={4}>
        <div className="story-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <SpotlightCard className="glass-card terminal-card" accentRgb={{ r: 255, g: 255, b: 255 }}>
              <div className="terminal-header">
                <span className="terminal-dot bg-red" />
                <span className="terminal-dot bg-yellow" />
                <span className="terminal-dot bg-green" />
                <span className="terminal-title">CodeConnect Engine v3.2.0</span>
              </div>
              <div className="logo-container">
                <div className="logo-glow-ring" style={{ boxShadow: `0 0 30px ${accentGlow}`, borderColor: accentBorder }}>
                  <FaCode size={32} color="#fff" />
                </div>
                <h1 className="final-title gradient-text">Code Connect</h1>
                <p className="final-desc">Your sandbox is hot and compiled. Start pair programming instantly.</p>
              </div>
              <div className="actions-layout">
                <button onClick={initiateCreateRoom} className="action-btn-primary" style={{ '--btn-accent': accentCss, '--btn-glow': accentGlow }}>
                  <FaPlus size={16} /> Start a Session
                </button>
                <div className="join-room-wrapper" style={{ '--focus-border': accentBorder }}>
                  <input
                    type="text"
                    placeholder="Enter 6-Digit Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="room-input"
                    onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                    maxLength={12}
                  />
                  <button
                    onClick={joinRoom}
                    disabled={!roomId.trim()}
                    className={`room-submit-btn ${roomId.trim() ? 'active' : ''}`}
                  >
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      {/* ── Name Modal ── */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <SpotlightCard className="modal-box glass-card" accentRgb={displayAccent}>
                <h3 className="modal-title">Who's joining?</h3>
                <p className="modal-desc">Enter a display name to enter the room.</p>
                <form onSubmit={handleNameSubmit}>
                  <input
                    autoFocus type="text"
                    placeholder="Your Name (e.g. Alex)"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="modal-input"
                    style={{ '--focus-color': accentBorder }}
                  />
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowNameModal(false)} className="modal-btn-cancel">Cancel</button>
                    <button type="submit" disabled={!guestName.trim()} className="modal-btn-submit" style={{ background: accentCss }}>Continue</button>
                  </div>
                </form>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════ STYLES ═══════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .landing-scroll-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          background-color: #020205;
          color: #fff;
          font-family: 'Inter', sans-serif;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .landing-scroll-container::-webkit-scrollbar { display: none; }

        /* ── Parallax BG ── */
        .parallax-background {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("/assets/story_bg.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.4;
          z-index: 0;
          will-change: transform, opacity, filter;
          transition: transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease, filter 0.9s ease;
        }

        .ambient-vignette {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(2,2,5,0.9) 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* ── Pulsing theme orb ── */
        .theme-orb {
          position: fixed;
          width: 800px; height: 800px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          transition: background 0.8s ease;
          animation: orbPulse 4s ease-in-out infinite alternate;
        }
        @keyframes orbPulse {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }

        /* ── Floating dev symbols ── */
        .floating-symbols-layer {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 3;
          pointer-events: none;
          overflow: hidden;
        }
        .float-symbol {
          position: absolute;
          bottom: -80px;
          font-family: 'Fira Code', monospace;
          font-size: clamp(0.7rem, 1.2vw, 1.1rem);
          font-weight: 500;
          opacity: 0;
          animation: floatUp linear infinite;
          text-shadow: 0 0 12px currentColor;
          will-change: transform, opacity;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(-8deg); opacity: 0; }
          8%   { opacity: 0.18; }
          92%  { opacity: 0.10; }
          100% { transform: translateY(-110vh) rotate(8deg); opacity: 0; }
        }

        /* ── Header ── */
        .sticky-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 72px;
          padding: 0 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(2,2,5,0.72), transparent);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .header-logo {
          display: flex; align-items: center; gap: 12px;
          font-size: 1.2rem; font-weight: 700; letter-spacing: -0.03em;
        }
        .skip-btn {
          padding: 0.55rem 1.15rem; font-size: 0.85rem; font-weight: 500;
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.25s ease;
        }
        .skip-btn:hover {
          color: #fff; background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.22); transform: translateY(-1px);
        }

        /* ── Nav Dots ── */
        .floating-dots-nav {
          position: fixed; right: 2.5rem; top: 50%;
          transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 1rem; z-index: 100;
        }
        .nav-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.18); border: none;
          cursor: pointer; padding: 0;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-dot.active { transform: scale(1.7); }

        /* ── Story Sections ── */
        .story-section {
          position: relative;
          width: 100%; height: 100vh;
          scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .story-content {
          width: 90%; max-width: 1240px;
          padding: 2rem;
          display: flex; justify-content: center;
        }
        .story-content-split {
          display: flex; flex-direction: row;
          align-items: center; justify-content: space-between;
          gap: 3.5rem;
        }

        /* ── Spotlight Card ── */
        .spotlight-card {
          position: relative;
          overflow: hidden;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            600px circle at var(--mx, -9999px) var(--my, -9999px),
            rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.13) 0%,
            transparent 60%
          );
          pointer-events: none;
          transition: none;
          z-index: 0;
        }
        .spotlight-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid transparent;
          background: radial-gradient(
            350px circle at var(--mx, -9999px) var(--my, -9999px),
            rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.55) 0%,
            transparent 60%
          ) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 0;
        }
        .spotlight-card > * {
          position: relative;
          z-index: 1;
        }

        /* ── Glass Card ── */
        .glass-card {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 3rem;
          width: 100%;
          box-shadow: 0 32px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09);
          text-align: left;
        }

        .text-column { flex: 1; max-width: 520px; }

        /* ── Visual Column ── */
        .visual-column {
          flex: 1; max-width: 600px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .video-glow-frame {
          position: relative; width: 100%;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(10,10,15,0.4);
          backdrop-filter: blur(10px);
          padding: 8px;
          overflow: hidden;
          transition: border-color 0.6s ease, box-shadow 0.6s ease, transform 0.4s ease;
        }
        .video-glow-frame:hover { transform: translateY(-3px) scale(1.005); }
        .showcase-video {
          width: 100%; height: 340px;
          object-fit: cover; border-radius: 20px;
          opacity: 0.88; display: block;
        }
        .mobile-mockup-container { display: none; }

        /* ── Video Overlays ── */
        .video-visual-overlay {
          position: absolute; inset: 8px;
          background: rgba(2,2,5,0.25);
          border-radius: 20px;
          display: flex; flex-direction: column;
          justify-content: center; padding: 2.5rem;
          pointer-events: none;
        }
        .visual-editor-overlay {
          background: linear-gradient(to right, rgba(2,2,5,0.68) 40%, transparent 100%);
          font-family: 'Fira Code', monospace; font-size: 0.95rem; color: #e2e8f0;
        }
        .visual-collab-overlay { justify-content: flex-end; align-items: flex-end; background: transparent; }
        .visual-passcode-overlay { background: rgba(2,2,5,0.62); align-items: center; }
        .visual-features-overlay { background: transparent; align-items: flex-start; justify-content: flex-start; gap: 8px; }

        .live-bubble {
          background: rgba(10,10,15,0.88); border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 12px; border-radius: 10px;
          font-size: 0.75rem; font-weight: 500;
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .bubble-alex { border-color: rgba(168,85,247,0.4); animation: slideInBubble 1s ease forwards; opacity: 0; }
        .bubble-sarah { border-color: rgba(96,165,250,0.4); animation: slideInBubble 1.4s ease forwards; opacity: 0; }
        @keyframes slideInBubble {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .visual-passcode-container { display: flex; gap: 0.75rem; }
        .passcode-digit-neon {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(2,2,5,0.7); border: 1px solid;
          font-weight: 700; font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          animation: digitGlow 1.5s infinite alternate;
        }
        @keyframes digitGlow {
          0% { filter: brightness(0.9); }
          100% { filter: brightness(1.3); }
        }
        .feature-neon-badge {
          font-size: 0.75rem; font-weight: 600;
          padding: 5px 12px; border-radius: 8px; border: 1px solid;
        }

        /* ── Typography ── */
        .card-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 12px;
          font-size: 0.8rem; font-weight: 500;
          border: 1px solid; margin-bottom: 1.5rem;
          transition: all 0.5s ease;
        }
        .story-title {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 800; letter-spacing: -0.04em;
          margin: 0 0 0.5rem 0; line-height: 1.15;
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .neon-text-glow { filter: drop-shadow(0 0 18px rgba(255,255,255,0.12)); }
        .story-subtitle {
          font-size: 1.15rem; font-weight: 400;
          color: rgba(255,255,255,0.78); margin: 0 0 1.25rem 0;
        }
        .story-desc {
          font-size: 0.98rem; line-height: 1.65;
          color: rgba(255,255,255,0.5); margin: 0 0 2rem 0;
        }

        /* ── Code Mockup Colors ── */
        .card-mockup {
          background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1.25rem; margin-bottom: 2rem;
          font-family: 'Fira Code', monospace; font-size: 0.9rem; color: #e2e8f0;
          min-height: 80px;
        }
        .flex-center { display: flex; flex-direction: column; justify-content: center; }
        .visual-code-line { line-height: 1.5; }
        .second-line { margin-top: 4px; }
        .color-purple { color: #c084fc; }
        .color-yellow { color: #fde047; }
        .color-blue   { color: #60a5fa; }
        .color-green  { color: #4ade80; }
        .cursor-pulse { animation: pulse 1s infinite alternate; color: #a855f7; font-weight: bold; }
        .collab-mockup { position: relative; overflow: hidden; }
        .collab-user {
          position: absolute;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 4px 10px; border-radius: 8px;
          font-size: 0.75rem;
          display: flex; align-items: center; gap: 6px;
        }
        .user-alex { top: 10px; right: 15px; border-color: rgba(168,85,247,0.3); }
        .user-sarah { bottom: 10px; right: 15px; border-color: rgba(96,165,250,0.3); }
        .user-dot { width: 6px; height: 6px; border-radius: 50%; }
        .bg-purple { background-color: #a855f7; }
        .bg-blue   { background-color: #3b82f6; }
        .visual-cursor {
          display: inline-block; height: 16px; border-left: 2px solid;
          animation: pulse 1s infinite alternate;
          margin-left: 2px; vertical-align: middle;
        }
        .passcode-mockup {
          display: flex; justify-content: center; gap: 0.75rem;
          background: transparent; border: none; padding: 0;
        }
        .passcode-digit {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; font-weight: 700; color: #a855f7;
          box-shadow: 0 8px 24px rgba(168,85,247,0.15);
        }
        .badges-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem; margin-bottom: 2rem;
        }
        .visual-badge {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          padding: 10px 14px; border-radius: 12px;
          font-size: 0.85rem; font-weight: 500;
          color: rgba(255,255,255,0.8);
          display: flex; align-items: center; gap: 8px;
        }

        /* ── Next Button ── */
        .next-slide-btn {
          background: transparent; border: none;
          color: rgba(255,255,255,0.35); cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          font-size: 0.85rem; padding: 0;
          transition: color 0.3s;
        }
        .next-slide-btn:hover { color: rgba(255,255,255,0.7); }
        .bounce-arrow { animation: bounceX 1.2s infinite alternate ease-in-out; }

        /* ── Final / Terminal Card ── */
        .terminal-card { padding: 0; overflow: hidden; background: rgba(10,10,15,0.48); }
        .terminal-header {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 12px 20px;
          display: flex; align-items: center; gap: 6px;
        }
        .terminal-dot { width: 8px; height: 8px; border-radius: 50%; }
        .bg-red { background-color: #ef4444; }
        .bg-yellow { background-color: #eab308; }
        .bg-green { background-color: #22c55e; }
        .terminal-title {
          font-size: 0.75rem; font-family: 'Fira Code', monospace;
          color: rgba(255,255,255,0.35); margin-left: 10px;
        }
        .logo-container {
          padding: 3rem 3rem 1.5rem 3rem;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .logo-glow-ring {
          width: 66px; height: 66px; border-radius: 50%;
          background: rgba(255,255,255,0.04); border: 1px solid;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          transition: box-shadow 0.8s ease, border-color 0.8s ease;
        }
        .final-title {
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 800; letter-spacing: -0.04em; margin: 0;
        }
        .final-desc { color: rgba(255,255,255,0.48); font-size: 1rem; margin: 8px 0 0 0; }

        /* ── Action Buttons ── */
        .actions-layout {
          padding: 0 3rem 3.5rem 3rem;
          display: flex; flex-direction: column;
          gap: 1.25rem; max-width: 420px; margin: 0 auto;
        }
        .action-btn-primary {
          padding: 1.1rem 2rem; font-size: 1.05rem; font-weight: 600;
          color: #fff; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        .action-btn-primary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-2px);
          box-shadow: 0 14px 40px var(--btn-glow, rgba(168,85,247,0.2));
        }
        .join-room-wrapper {
          display: flex; align-items: center;
          background: rgba(0,0,0,0.3);
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);
          padding: 6px; transition: border-color 0.3s;
        }
        .join-room-wrapper:focus-within { border-color: var(--focus-border, rgba(168,85,247,0.4)); }
        .room-input {
          flex: 1; background: transparent; border: none;
          color: #fff; padding: 0.8rem 1.2rem; outline: none;
          font-size: 1.05rem; font-weight: 500;
        }
        .room-input::placeholder { color: rgba(255,255,255,0.28); }
        .room-submit-btn {
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3);
          border: none; padding: 0.85rem; border-radius: 12px;
          cursor: default;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .room-submit-btn.active { background: #fff; color: #000; cursor: pointer; }
        .room-submit-btn.active:hover { transform: translateX(2px); }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .modal-box { width: 90%; max-width: 420px; }
        .modal-title { font-size: 1.5rem; font-weight: 600; color: #fff; margin: 0 0 0.5rem 0; }
        .modal-desc { color: rgba(255,255,255,0.5); margin: 0 0 2rem 0; font-size: 0.95rem; }
        .modal-input {
          width: 100%; padding: 1.1rem 1.25rem; border-radius: 14px;
          background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.12);
          color: #fff; margin-bottom: 1.75rem; outline: none;
          font-size: 1rem; transition: border-color 0.3s; box-sizing: border-box;
        }
        .modal-input:focus { border-color: var(--focus-color, rgba(168,85,247,0.4)); }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .modal-btn-cancel {
          padding: 0.8rem 1.5rem; border-radius: 12px;
          background: transparent; color: rgba(255,255,255,0.55);
          border: none; cursor: pointer; font-size: 0.95rem; font-weight: 500;
          transition: color 0.3s;
        }
        .modal-btn-cancel:hover { color: #fff; }
        .modal-btn-submit {
          padding: 0.8rem 1.5rem; border-radius: 12px;
          color: #000; border: none; cursor: pointer;
          font-weight: 600; font-size: 0.95rem;
          transition: opacity 0.3s, transform 0.2s;
        }
        .modal-btn-submit:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
        .modal-btn-submit:disabled { opacity: 0.35; cursor: default; }

        /* ── Keyframes ── */
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes bounceX {
          0% { transform: translateX(0); }
          100% { transform: translateX(5px); }
        }

        /* ── Responsive ── */
        @media (max-width: 992px) {
          .sticky-header { padding: 0 1.5rem; }
          .floating-dots-nav { display: none; }
          .story-content-split { flex-direction: column; gap: 2rem; }
          .text-column { max-width: 100% !important; }
          .visual-column { display: none; }
          .mobile-mockup-container { display: block; }
          .glass-card { padding: 2rem; }
          .logo-container { padding: 2rem 1.5rem 1rem 1.5rem; }
          .actions-layout { padding: 0 1.5rem 2.5rem 1.5rem; }
          .landing-scroll-container { scroll-snap-type: none; }
          .story-section {
            height: auto; min-height: 100vh;
            padding: 7rem 0 3rem 0;
            scroll-snap-align: none;
          }
          .floating-symbols-layer { display: none; }
          .theme-orb { width: 400px; height: 400px; }
        }
      `}</style>
    </div>
  );
}

export default Landing;
