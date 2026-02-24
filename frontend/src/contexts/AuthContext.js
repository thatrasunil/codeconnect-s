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
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      if (loading) {
        console.warn('⚠️ AuthContext: Auth check timed out after 10s. Forcing loading to false.');
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      clearTimeout(loadingTimeout);
      console.log('👤 AuthContext: Auth state changed. User:', firebaseUserData ? firebaseUserData.email : 'None');

      try {
        if (firebaseUserData) {
          // User is logged in with Firebase
          setFirebaseUser(firebaseUserData);

          // RESOLVE LOADING IMMEDIATELY - Don't wait for backend sync to render the app
          setLoading(false);

          // Get or create user in MongoDB (Background Sync)
          console.log('📡 AuthContext: Syncing user with backend DB in background...');
          createUserInDB({
            uid: firebaseUserData.uid,
            email: firebaseUserData.email,
            displayName: firebaseUserData.displayName || firebaseUserData.email.split('@')[0]
          }).then(userData => {
            if (userData) {
              console.log('✅ AuthContext: Backend sync successful.');
              setUser(userData);
            } else {
              console.warn('⚠️ AuthContext: Backend sync returned no data.');
            }
          }).catch(err => {
            console.error('❌ AuthContext: Background sync failed:', err);
          });

        } else {
          // User is logged out
          setFirebaseUser(null);
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ AuthContext: Error during auth state change:', err);
        setError(err.message);
        setLoading(false);
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
      setError(null);
      setLoading(true);

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;

      // Create user in MongoDB
      const userData = await createUserInDB({
        uid: firebaseUserData.uid,
        email: email,
        displayName: username
      });

      setFirebaseUser(firebaseUserData);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      console.error('Registration error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login with Firebase
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;

      // Get user from MongoDB
      const userData = await getUserProfile();

      setFirebaseUser(firebaseUserData);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      console.error('Login error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);

      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Logout failed';
      setError(errorMsg);
      console.error('Logout error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUserData = result.user;

      console.log('👤 AuthContext: Google Sign-in successful. Syncing with backend...');

      // Sync with MongoDB in background (non-blocking)
      createUserInDB({
        uid: firebaseUserData.uid,
        email: firebaseUserData.email,
        displayName: firebaseUserData.displayName || firebaseUserData.email.split('@')[0]
      }).then(userData => {
        if (userData) {
          console.log('✅ AuthContext: Google backend sync successful.');
          setUser(userData);
        }
      }).catch(err => {
        console.error('❌ AuthContext: Google background sync failed:', err);
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Google login failed';
      setError(errorMsg);
      console.error('Google login error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get Firebase ID Token
  const getIdToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    getIdToken,
    isAuthenticated: !!firebaseUser,
    authMethod: 'firebase'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
