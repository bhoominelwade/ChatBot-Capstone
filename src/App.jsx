import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import LoginSignup from './LoginSignup'; // Import the LoginSignup component

// Dynamically import AdminDashboard and Chat components
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const Chat = lazy(() => import('./user/chat')); 

export default function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Define routes */}
          <Route path="/" element={<LoginSignup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<LoginSignup />} />
          {/* Add more routes as necessary */}
        </Routes>
      </Suspense>
    </div>
  );
}
