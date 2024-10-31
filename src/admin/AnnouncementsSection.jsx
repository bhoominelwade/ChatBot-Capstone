import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import "./AdminDashboard.css";

export default function AnnouncementsSection({ selectedRole }) {
  const [title, setTitle] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedRole]);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    setUploadError(null);
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `http://localhost:8000/announcements/${selectedRole}?limit=5&t=${timestamp}`
      );
      
      if (response.data && Array.isArray(response.data.announcements)) {
        const sortedAnnouncements = response.data.announcements.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        setAnnouncements(sortedAnnouncements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setUploadError(
        error.response?.data?.detail || 
        "Failed to fetch announcements. Please try again."
      );
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError("Please enter a title.");
      return;
    }
    if (!announcement.trim()) {
      setUploadError("Please enter an announcement.");
      return;
    }
  
    setUploading(true);
    setUploadError(null);
  
    try {
      const response = await axios.post(
        "http://localhost:8000/announcement/",
        {
          title: title,
          text: announcement,
          role: selectedRole,
          isImportant: isImportant
        }
      );
  
      if (response.data && response.data.status === "success") {
        setTitle("");
        setAnnouncement("");
        setIsImportant(false);
        setTimeout(fetchAnnouncements, 500);
      } else {
        throw new Error("Failed to create announcement");
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
      setUploadError(
        error.response?.data?.detail || 
        "Failed to post announcement. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/announcement/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      setUploadError("Failed to delete announcement. Please try again.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const [date, time] = timestamp.split(' ');
    const [day, month, year] = date.split('/');
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const [hours, minutes] = time.split(':');
    const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    
    return `${day} ${months[parseInt(month) - 1]} ${year} • ${formattedTime}`;
  };

  const renderAnnouncementsContent = () => {
    if (loadingAnnouncements) {
      return (
        <div className="loading-state">
          <RefreshCw className="spin" />
          <p>Loading announcements...</p>
        </div>
      );
    }
  
    if (!announcements || announcements.length === 0) {
      return (
        <div className="empty-state">
          <Bell size={24} />
          <p>No announcements yet</p>
        </div>
      );
    }
  
    return announcements.map((announcement) => (
      <div 
        key={announcement.id} 
        className={`announcement-item ${announcement.isImportant ? 'important' : ''}`}
      >
        <div className="announcement-header">
          <span className={`role-badge ${announcement.role}`}>
            {announcement.role.replace('_', '/')}
          </span>
          <span className="timestamp">
            {formatTimestamp(announcement.timestamp)}
          </span>
        </div>
        {announcement.isImportant && (
          <span className="important-badge">Important</span>
        )}
        <h4 className="announcement-title">{announcement.title}</h4>
        <pre className="announcement-text">{announcement.text}</pre>
        <button 
          className="delete-button"
          onClick={() => deleteAnnouncement(announcement.id)}
          title="Delete announcement"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ));
  };

  return (
    <div className="announcements-section">
      <h2>Broadcast Announcements</h2>
      <div className="card">
        <form onSubmit={handleAnnouncementSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title..."
            className="announcement-title-input"
          />
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Type your announcement here..."
            className="announcement-textarea"
          />
          <div className="announcement-controls">
            <div className="importance-toggle">
              <label className="toggle-label">
                Mark as Important
                <div className="toggle-slider">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
              </label>
            </div>
            <button 
              type="submit" 
              className="submit-announcement-button"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw className="spin" />
                  Submitting...
                </>
              ) : (
                "Submit Announcement"
              )}
            </button>
          </div>
          {uploadError && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}
        </form>
      </div>

      <div className="card announcements-list">
        <h3>Recent Announcements</h3>
        {renderAnnouncementsContent()}
      </div>
    </div>
  );
}