import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      try {
        if (firebaseUserData) {
          // User is logged in with Firebase
          setFirebaseUser(firebaseUserData);
          
          // Get or create user in MongoDB
          const userData = await createUserInDB({
            uid: firebaseUserData.uid,
            email: firebaseUserData.email,
            displayName: firebaseUserData.displayName || firebaseUserData.email.split('@')[0]
          });
          
          if (userData) {
            setUser(userData);
          }
        } else {
          // User is logged out
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error during auth state change:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
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
