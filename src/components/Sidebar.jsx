// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * 📚 Sidebar – vertical navigation
 * • Active link is highlighted
 * • Tailwind for styling
 */
const base = 'flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 transition';
const active = 'bg-gray-700 font-semibold';

const Sidebar = () => (
  <aside className="w-64 min-h-screen bg-gray-800 text-white p-5 space-y-4">
    <h2 className="text-xl font-semibold">Navigation</h2>

    <nav className="flex flex-col space-y-2">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        🏠 Home
      </NavLink>

      <NavLink to="/calendar" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        📅 Calendar View
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        👤 Profile
      </NavLink>

      <NavLink to="/predict" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        🤖 Predict
      </NavLink>
    </nav>
  </aside>
);

export default Sidebar;
