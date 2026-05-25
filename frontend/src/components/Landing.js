import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaCode, FaGlobe, FaComments, FaShare, FaLock, FaMicrophone } from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles, MeshDistortMaterial, Float } from '@react-three/drei';
import FlowDiagram3D from './Three/FlowDiagram3D';

import { AIModel, CollabModel, CloudModel, SecureModel, LanguageModel, VideoModel } from './Three/Feature3DIcons';
import { createRoom as createApiRoom } from '../services/apiService';
import SecureLoading from './SecureLoading';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../logo.svg';
import Hero3DBackground from './Hero3DBackground';
import Steps3DFlow from './Steps3DFlow';
import EnhancedFeatureCard from './EnhancedFeatureCard';

function Landing() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Reset scroll position to top on component mount
    window.scrollTo(0, 0);

    // Redirect to dashboard if already logged in
    if (firebaseUser || user) {
      console.log('🚀 Landing: User is authenticated, redirecting to Dashboard...');
      navigate('/dashboard');
      return; // Stop further execution
    }
  }, [firebaseUser, user, navigate]);

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
      const newRoom = await createApiRoom({
        title: "Untitled Room",
        ownerId: "guest", // Guest user
        isPublic: true,
        language: "javascript",
        ownerName: name // Pass the name
      });

      if (newRoom.roomId) {
        navigate(`/room/${newRoom.roomId}`); // Changed from newRoom.id to newRoom.roomId based on API response structure
      } else if (newRoom.id) {
        navigate(`/room/${newRoom.id}`);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room: ' + err.message);
      setIsCreating(false);
    }
  };

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

  if (isCreating || firebaseUser || user) {
    return <SecureLoading message={isCreating ? "Initializing Secure Environment..." : "Redirecting to Dashboard..."} />;
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
        {/* Ad Unit - Top Horizontal - Disabled for testing */}
        {/* <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 2rem auto', textAlign: 'center' }}>
          <AdUnit />
        </div> */}

        {/* Hero Section with 3D Background */}
        <Hero3DBackground>
          <div className="hero-content-wrapper" style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '3rem 2rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}>
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
              }}
            >
              <div className="hero-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '1.5rem',
                background: 'rgba(56, 189, 248, 0.1)', padding: '6px 16px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', backdropFilter: 'blur(10px)'
              }}>
                <span style={{ width: '6px', height: '6px', background: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 10px #38bdf8' }}></span>
                New: High-Performance Sync Engine
              </div>

              <h1 className="main-title" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', lineHeight: '1.05', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.04em', fontFamily: '"Inter", sans-serif' }}>
                <span style={{ color: '#f8fafc' }}>Code together.</span>
                <br />
                <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero Friction.</span>
              </h1>

              <p className="subtitle" style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '520px', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: '400' }}>
                Spin up an interview-ready coding room in seconds. Share a link and collaborate in perfect sync with real-time execution.
              </p>

              <div className="action-buttons" style={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  onClick={initiateCreateRoom}
                  className="btn"
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    fontSize: '1.1rem',
                    padding: '1.2rem 2.5rem',
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaPlus size={14} /> Start Coding Now
                </motion.button>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.8rem 1rem', outline: 'none', width: '160px', fontSize: '1.05rem', fontWeight: '500' }}
                    onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                  />
                  <button
                    onClick={joinRoom}
                    style={{ background: '#334155', border: 'none', color: '#f8fafc', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.background = '#475569'}
                    onMouseOut={(e) => e.target.style.background = '#334155'}
                  >
                    Join
                  </button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'none',
                '@media (max-width: 1024px)': {
                  display: 'none'
                }
              }}
            >
            </motion.div>
          </div>
        </Hero3DBackground>

        {/* Steps 3D Flow - Enhanced Component */}
        <Steps3DFlow />






        {/* Features Section - Enhanced */}
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
              <EnhancedFeatureCard
                key={i}
                title={feature.title}
                description={feature.desc}
                model={feature.model}
                color={feature.color}
                index={i}
              />
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

        {/* AdSense Optimization Text Block */}
        <div className="seo-content-block" style={{ width: '100%', maxWidth: '900px', margin: '0 auto 8rem', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>About Our Platform</h2>
          <div style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p>
              CodeConnect represents the next evolution in remote collaboration and developer productivity. In today's distributed work environment, traditional screen sharing is no longer sufficient for rigorous software engineering tasks. True pair programming requires high-fidelity, bidirectional synchronization where both participants have equal agency over the codebase, terminal, and execution environment. Our platform solves this fundamental friction point by providing an ultra-low latency, browser-based Integrated Development Environment (IDE) that requires absolutely zero configuration or environment setup.
            </p>
            <p>
              Under the hood, CodeConnect utilizes Operational Transformation (OT) and sophisticated Conflict-free Replicated Data Types (CRDTs) to guarantee that code buffers remain in perfect lockstep, regardless of geographical distance or network jitter. This mathematical foundation allows dozens of developers to interact with the same document simultaneously without data corruption. By coupling this synchronization engine with secure, containerized cloud execution environments, teams can compile, test, and debug code in standardized runtimes (ranging from Node.js and Python to C++ and Java) without worrying about local dependency conflicts or the classic "it works on my machine" paradigm.
            </p>
            <p>
              Furthermore, acknowledging the transformative impact of machine learning on software engineering, we have deeply integrated artificial intelligence directly into the collaborative workflow. Our context-aware AI assistant acts as a silent partner, capable of analyzing written code, identifying logical flaws, suggesting optimizations, and even generating comprehensive unit tests on demand. Combined with integrated WebRTC video and audio channels, CodeConnect provides a unified, highly efficient workspace designed specifically for the unique demands of modern technical interviews, educational boot camps, and professional remote engineering teams.
            </p>
          </div>
        </div>

      </main>







      <style>{`
        /* Hero Section Responsive */
        .hero-section, .hero-text, .hero-image-container {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .hero-section {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin-bottom: 8rem;
        }

        .hero-content-wrapper {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .hero-content-wrapper {
            grid-template-columns: 1fr !important;
            padding: 2rem 1rem !important;
          }

          .hero-text {
            order: 1;
            text-align: center;
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

          .hero-content-wrapper {
            padding: 1.5rem 1rem !important;
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


// AdUnit Component for AdSense
const AdUnit = () => {
  const insRef = useRef(null);

  useEffect(() => {
    // Prevent duplicate script injection
    const SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7175260853905543";
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Only push if this specific ins element has NOT already been initialized
    if (insRef.current && insRef.current.getAttribute('data-adsbygoogle-status') === null) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  return (
    <div style={{ overflow: 'hidden', minHeight: '100px', margin: '20px 0' }}>
      {/* hori */}
      <ins ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7175260853905543"
        data-ad-slot="8804074041"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  );
};


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
