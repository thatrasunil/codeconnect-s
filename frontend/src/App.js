import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/LoadingSpinner';
import PaperPlaneSpinner from './components/PaperPlaneSpinner';
import './App.css';


// Lazy loading components for performance optimization
import Landing from './components/Landing';
// Lazy loading components for performance optimization
// const Landing = lazy(() => import('./components/Landing'));
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
const ChatWidget = lazy(() => import('./components/ChatWidget'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));

// Compliance Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// Team Pages
const Teams = lazy(() => import('./pages/Teams'));
const TeamDashboard = lazy(() => import('./pages/TeamDashboard'));
const ChallengeView = lazy(() => import('./pages/ChallengeView'));

function App() {


  const [isChatOpen, setIsChatOpen] = React.useState(false);
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <ToastProvider>
              <Router>
                <Navbar />
                <Suspense fallback={<PaperPlaneSpinner fullScreen={true} text="Loading..." />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/teams" element={
                      <ProtectedRoute>
                        <Teams />
                      </ProtectedRoute>
                    } />
                    <Route path="/teams/:teamId" element={
                      <ProtectedRoute>
                        <TeamDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/teams/:teamId/challenge/:challengeId" element={
                      <ProtectedRoute>
                        <ChallengeView />
                      </ProtectedRoute>
                    } />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/test-spinner" element={
                      <PaperPlaneSpinner fullScreen={true} text="Loading..." />
                    } />
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
                    <Route path="/chat" element={<AIChatPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                  </Routes>
                </Suspense>

                {/* Global Footer */}
                <Footer />

                {/* Global Chatbot Dispatcher */}
                <ChatbotDispatcher setIsChatOpen={setIsChatOpen} isChatOpen={isChatOpen} />
              </Router>
            </ToastProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

// Dispatcher to control which chatbot to show
const ChatbotDispatcher = ({ isChatOpen, setIsChatOpen }) => {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/signup', '/privacy', '/terms', '/contact', '/about', '/cookie-policy', '/disclaimer', '/blog'];
  const isPublic = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/blog/');
  const [context, setContext] = React.useState('');
  const [initialMessage, setInitialMessage] = React.useState(null);

  React.useEffect(() => {
    if (location.pathname === '/problems') {
      import('./services/problemService').then(({ default: ProblemService }) => {
        ProblemService.fetchAllProblems().then(questions => {
          const questionTitles = questions.map(q => q.title).join(', ');
          setContext(`User is viewing the Problems page. They can choose from these questions: ${questionTitles}. Guide them in choosing a problem based on their skill level.`);
          setInitialMessage("👋 Hi! I can help you find a coding problem to solve. What kind of challenge are you looking for?");
        }).catch(err => {
          console.error("Failed to fetch problems for chatbot context", err);
          // Fallback generic message
          setContext("User is viewing the Problems page. Guide them in choosing a problem based on their skill level.");
          setInitialMessage("👋 Hi! I can help you find a coding problem to solve. What kind of challenge are you looking for?");
        });
      });
    } else {
      setContext('');
      setInitialMessage(null);
    }
  }, [location.pathname]);

  // If public route, show ChatWidget (always visible button/widget)
  if (isPublic) {
    return (
      <React.Fragment>
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </React.Fragment>
    );
  }

  // Hide chatbot on room pages
  if (location.pathname.startsWith('/room/')) {
    return null;
  }

  // Otherwise (App/Dashboard), show the main Chatbot
  return (
    <React.Fragment>
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999,
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: 'white', fontSize: '24px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="AI Assistant"
        >
          <FaRobot size={24} />
        </button>
      )}
      <Suspense fallback={null}>
        <Chatbot
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          context={context}
          initialMessage={initialMessage}
        />
      </Suspense>
    </React.Fragment>
  );
};


export default App;
