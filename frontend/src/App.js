import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import Loading from './components/Loading';
import './App.css';

// Lazy loading components for performance optimization
const Landing = lazy(() => import('./components/Landing'));
const Editor = lazy(() => import('./components/Editor'));
const ProblemSolver = lazy(() => import('./components/ProblemSolver'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Problems = lazy(() => import('./pages/Problems'));
const Profile = lazy(() => import('./pages/Profile'));
const Debugging = lazy(() => import('./pages/Debugging'));
const Testing = lazy(() => import('./pages/Testing'));
const CodeGen = lazy(() => import('./pages/CodeGen'));
const Chatbot = lazy(() => import('./components/Chatbot'));

function App() {


  const [isChatOpen, setIsChatOpen] = React.useState(false);
  return (
    <div className="App">
      <AuthProvider>
        <ErrorBoundary>
          <ToastProvider>
            <Router>
              <Navbar />
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/problems" element={
                    <ProtectedRoute>
                      <Problems />
                    </ProtectedRoute>
                  } />
                  <Route path="/debugging" element={
                    <ProtectedRoute>
                      <Debugging />
                    </ProtectedRoute>
                  } />
                  <Route path="/testing" element={
                    <ProtectedRoute>
                      <Testing />
                    </ProtectedRoute>
                  } />
                  <Route path="/codegen" element={
                    <ProtectedRoute>
                      <CodeGen />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/room/:roomId" element={<Editor />} />
                  <Route path="/solve/:roomId" element={<ProblemSolver />} />
                </Routes>
              </Suspense>

              {/* Global Chatbot FAB & Component */}
              <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
                {!isChatOpen && (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none', color: 'white', fontSize: '24px',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FaRobot size={24} />
                  </button>
                )}
                <React.Suspense fallback={null}>
                  <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </React.Suspense>
              </div>

            </Router>
          </ToastProvider>
        </ErrorBoundary>
      </AuthProvider>
    </div>
  );
}

export default App;
