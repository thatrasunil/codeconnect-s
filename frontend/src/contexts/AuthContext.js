import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { getUserProfile, createUserInDB } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null
  });

  // Set persistence to LOCAL so user stays logged in
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Error setting persistence:', err);
    });
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('🔄 AuthContext: Initializing onAuthStateChanged listener...');

    // Safety timeout: if auth takes more than 10 seconds, force loading to false
    const loadingTimeout = setTimeout(() => {
      setAuthState(prev => {
        if (prev.loading) {
          console.warn('⚠️ AuthContext: Auth check timed out after 10s. Forcing loading to false.');
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      clearTimeout(loadingTimeout);
      console.log('👤 AuthContext: [onAuthStateChanged] User:', firebaseUserData ? firebaseUserData.email : 'None');

      if (firebaseUserData) {
        // Sync token to localStorage immediately so apiService can use it
        try {
          const token = await firebaseUserData.getIdToken();
          localStorage.setItem('token', token);
          console.log('🔑 AuthContext: Firebase token synced to localStorage.');
        } catch (tokenErr) {
          console.error('❌ AuthContext: Failed to sync token:', tokenErr);
        }

        // Update state with Firebase user, but keep loading: true until sync starts or resolves if preferred, 
        // but here we set loading: false to unblock UI immediately
        setAuthState(prev => ({
          ...prev,
          firebaseUser: firebaseUserData,
          loading: false,
          error: null
        }));

        // Background Sync with MongoDB
        console.log('📡 AuthContext: Syncing with backend DB...');
        createUserInDB({
          uid: firebaseUserData.uid,
          email: firebaseUserData.email,
          displayName: firebaseUserData.displayName || firebaseUserData.email.split('@')[0]
        }).then(userData => {
          if (userData) {
            console.log('✅ AuthContext: Backend sync successful.');
            setAuthState(prev => ({ ...prev, user: userData }));
          }
        }).catch(err => {
          console.error('❌ AuthContext: Background sync failed:', err);
        });

      } else {
        // User logged out
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null
        });
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Register with Firebase
  const register = async (username, email, password) => {
    try {
      setAuthState(prev => ({ ...prev, error: null, loading: true }));

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;

      // Sync token to localStorage immediately
      const token = await firebaseUserData.getIdToken();
      localStorage.setItem('token', token);

      // Create user in MongoDB
      const userData = await createUserInDB({
        uid: firebaseUserData.uid,
        email: email,
        displayName: username
      });

      setAuthState(prev => ({
        ...prev,
        firebaseUser: firebaseUserData,
        user: userData,
        loading: false
      }));

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, error: errorMsg, loading: false }));
      console.error('Registration error:', err);
      return { success: false, error: errorMsg };
    }
  };

  // Login with Firebase
  const login = async (email, password) => {
    try {
      setAuthState(prev => ({ ...prev, error: null, loading: true }));

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;

      // Sync token to localStorage immediately
      const token = await firebaseUserData.getIdToken();
      localStorage.setItem('token', token);

      // Get user from MongoDB
      const userData = await getUserProfile();

      setAuthState(prev => ({
        ...prev,
        firebaseUser: firebaseUserData,
        user: userData,
        loading: false
      }));

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setAuthState(prev => ({ ...prev, error: errorMsg, loading: false }));
      console.error('Login error:', err);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null, loading: true }));

      await signOut(auth);
      localStorage.removeItem('token');

      setAuthState({
        user: null,
        firebaseUser: null,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Logout failed';
      setAuthState(prev => ({ ...prev, error: errorMsg, loading: false }));
      console.error('Logout error:', err);
      return { success: false, error: errorMsg };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null, loading: true }));
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUserData = result.user;

      // Sync token to localStorage immediately
      const token = await firebaseUserData.getIdToken();
      localStorage.setItem('token', token);

      console.log('👤 AuthContext: Google Sign-in successful. Syncing with backend...');

      setAuthState(prev => ({
        ...prev,
        firebaseUser: firebaseUserData,
        loading: false
      }));

      // Sync with MongoDB in background (non-blocking)
      createUserInDB({
        uid: firebaseUserData.uid,
        email: firebaseUserData.email,
        displayName: firebaseUserData.displayName || firebaseUserData.email.split('@')[0]
      }).then(userData => {
        if (userData) {
          console.log('✅ AuthContext: Google backend sync successful.');
          setAuthState(prev => ({ ...prev, user: userData }));
        }
      }).catch(err => {
        console.error('❌ AuthContext: Google background sync failed:', err);
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Google login failed';
      setAuthState(prev => ({ ...prev, error: errorMsg, loading: false }));
      console.error('Google login error:', err);
      return { success: false, error: errorMsg };
    }
  };

  // Get Firebase ID Token
  const getIdToken = async () => {
    if (authState.firebaseUser) {
      return await authState.firebaseUser.getIdToken();
    }
    return null;
  };

  const value = {
    ...authState,
    idToken: authState.firebaseUser ? localStorage.getItem('token') : null,
    login,
    loginWithGoogle,
    register,
    logout,
    getIdToken,
    isAuthenticated: !!authState.firebaseUser,
    authMethod: 'firebase'
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
