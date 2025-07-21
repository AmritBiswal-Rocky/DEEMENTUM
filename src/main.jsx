// ──────────────────────────────────────────
// src/main.jsx
// App entry point
// ──────────────────────────────────────────
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth';
import './index.css'; // ← global Tailwind / CSS reset

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider supplies { user, loading } and manages WebSocket */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
