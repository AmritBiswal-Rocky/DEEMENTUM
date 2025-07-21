// src/App.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import CalendarTasks from './CalendarTasks';
import CalendarView from './components/CalendarView';
import PredictionComponent from './components/PredictionComponent';
import ProfileCard from './components/ProfileCard';
import ProfileTab from './components/ProfileTab';
import ProfileSection from './components/ProfileSection';
import FirebaseTokenTool from './components/FirebaseTokenTool';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';
import Sidebar from './components/Sidebar';

import { useAuth } from './hooks/useAuth';
import { supabase } from './supabaseClient';
import { connectSocket } from './socket';

import './App.css';

/* ─────────────────────────────
   Error Boundary
   ──────────────────────────── */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('❌ ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Something went wrong: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

/* ─────────────────────────────
   Main App
   ──────────────────────────── */
export default function App() {
  const { user } = useAuth(); // { user, loading } if you need loading
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch tasks from Supabase */
  const fetchUserTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.uid);
      if (error) console.error('❌ Supabase fetch error:', error.message);
      else setTasks(data);
    } catch (err) {
      console.error('❌ Unexpected fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  /* WebSocket: reconnect when user changes, listen for task_update */
  useEffect(() => {
    const socket = connectSocket(user?.uid); // ← send UID
    const handleUpdate = () => {
      console.log('📬 task_update → refreshing tasks');
      fetchUserTasks();
    };
    socket.on('task_update', handleUpdate);
    return () => socket.off('task_update', handleUpdate);
  }, [user]);

  /* Initial fetch after login */
  useEffect(() => {
    fetchUserTasks();
  }, [user]);

  /* ─────────── UI ─────────── */
  return (
    <ErrorBoundary>
      <ThemeToggle />
      <Toaster position="top-right" />

      {/* Layout: sidebar + main content */}
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6">
          <Routes>
            {/* 🌐 Public */}
            <Route path="/profile" element={<ProfileCard />} />
            <Route path="/predict" element={<PredictionComponent />} />

            {/* 🔐 Protected */}
            <Route
              path="/"
              element={
                <PrivateRoute user={user}>
                  <CalendarTasks tasks={tasks} loading={loading} fetchTasks={fetchUserTasks} />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute user={user}>
                  <CalendarView />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile-section"
              element={
                <PrivateRoute user={user}>
                  <ProfileSection />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile-tab"
              element={
                <PrivateRoute user={user}>
                  <ProfileTab />
                </PrivateRoute>
              }
            />

            {/* 🔧 Firebase helper */}
            <Route path="/get-id-token" element={<FirebaseTokenTool />} />

            {/* 🐞 Debug */}
            <Route
              path="/debug"
              element={
                <div className="p-4">
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
              }
            />

            {/* 🛑 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}
