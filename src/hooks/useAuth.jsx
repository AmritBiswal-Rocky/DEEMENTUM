// ──────────────────────────────────────────────────────────
// src/hooks/useAuth.jsx
// Centralised Firebase Auth + WebSocket context
// ──────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app as firebaseApp } from '../firebaseClient'; // Firebase app
import { connectSocket, disconnectSocket } from '../socket'; // WS helpers
import PropTypes from 'prop-types';

// ───────── Firebase Auth instance (already initialised) ─────────
const auth = getAuth(firebaseApp);

// Context default shape
const AuthContext = createContext({ user: null, loading: true });

// ──────────────────────────────────────────
// <AuthProvider> — wrap your app once (see main.jsx)
// ──────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for login / logout
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);

      /* ───────── WebSocket lifecycle ───────── */
      if (firebaseUser) {
        connectSocket(firebaseUser.uid); // login → connect / reconnect
      } else {
        disconnectSocket(); // logout → disconnect
      }
    });

    // Cleanup on provider unmount
    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, []);

  const value = { user, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ──────────────────────────────────────────
// useAuth — handy hook → { user, loading }
// ──────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
