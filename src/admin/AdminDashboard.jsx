import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from "lucide-react";
import Navigation from './Navigation';
import UploadSection from './UploadSection';
import AnnouncementsSection from './AnnouncementsSection';
import MeetingsSection from './MeetingsSection';
import RoleSelector from './RoleSelector';
import "./AdminDashboard.css";
import { auth } from "../firebase";  // Add this import
import { signOut } from "firebase/auth"; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Upload");
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();
  const location = useLocation();

  // Check for authentication on mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Prevent back button
  useEffect(() => {
    window.history.pushState(null, '', location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

  // Warn before closing/refreshing
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave?';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Session timeout
  useEffect(() => {
    let sessionTimeout;
    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeout);
      sessionTimeout = setTimeout(() => {
        handleLogout();
        alert('Your session has expired. Please login again.');
      }, 3600000); // 1 hour
    };

    // Reset timeout on user activity
    const handleUserActivity = () => {
      resetSessionTimeout();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    
    resetSessionTimeout();

    return () => {
      clearTimeout(sessionTimeout);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Use window.location.href for a complete page refresh and redirect
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  return (
    <div className="admin-layout"> {/* Add this wrapper class */}
      <div className="app-container">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />

        <main className="main-content">
          {(activeTab === "Upload" || activeTab === "Announcements") && (
            <RoleSelector 
              selectedRole={selectedRole} 
              onChange={handleRoleChange} 
            />
          )}
          
          <div className="content-area">
            {activeTab === "Upload" && (
              <UploadSection selectedRole={selectedRole} />
            )}
            
            {activeTab === "Announcements" && (
              <AnnouncementsSection selectedRole={selectedRole} />
            )}
    
            {activeTab === "Meetings" && <MeetingsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}