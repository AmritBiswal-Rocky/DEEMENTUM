// ─────────────────────────────────────────────
// src/socket.js
// Centralised (singleton) Socket.IO helper
// ─────────────────────────────────────────────
import { io } from 'socket.io-client';

let socket = null; // the single live client
let currentUid = null; // which Firebase UID the socket belongs to

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Initialise (or reuse) a Socket.IO client.
 * If the user changes (login ↔ logout), we tear down the old
 * connection and open a fresh one so the server can join the
 * correct private room.
 *
 * @param {string|null} uid Firebase UID (or null when logged‑out)
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = (uid = null) => {
  // 🔄 If we already have a socket but for a DIFFERENT uid → reset it
  if (socket && currentUid !== uid) {
    console.info('🔁 User changed — re‑creating WebSocket connection');
    socket.disconnect();
    socket = null;
  }

  // 🚀 Create a new client only if we don’t have one yet
  if (!socket) {
    currentUid = uid ?? null;

    socket = io(backendUrl, {
      // 👉 Threading mode on the Flask side needs polling as a fallback
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
      // Pass UID so backend can immediately join the right room
      query: currentUid ? { uid: currentUid } : {},
    });

    /* ────────────────
       Core connection events
       ──────────────── */
    socket.on('connect', () => {
      console.log('✅ WS connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ WS disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WS connect error:', err.message);
    });

    /* ────────────────
       Custom server events
       ──────────────── */
    socket.on('connected', (msg) => {
      console.log('🔔 Server says:', msg.message);
    });

    socket.on('task_update', (data) => {
      console.log('🔄 task_update:', data);
      // TODO: dispatch Redux/context action or emit a custom event here
    });
  }

  return socket;
};

/**
 * Cleanly close the socket – e.g. call on user logout.
 */
export const disconnectSocket = () => {
  if (socket) {
    console.info('👋 Closing WebSocket connection');
    socket.disconnect();
    socket = null;
    currentUid = null;
  }
};
