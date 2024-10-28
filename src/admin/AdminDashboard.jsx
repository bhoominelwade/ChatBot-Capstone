import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Bell,
  BarChart2,
  MessageSquare,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  File,
  FileType,
  Image,
  LogOut,
  Trash2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Upload");
  const [announcement, setAnnouncement] = useState("");
  const [files, setFiles] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("student");
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  

  const tabs = [
    { name: "Upload", icon: Upload },
    { name: "Announcements", icon: Bell },
    { name: "Stats", icon: BarChart2 },
    { name: "Chatbot", icon: MessageSquare },
  ];

  useEffect(() => {
    if (activeTab === "Announcements") {
      fetchAnnouncements();
    }
  }, [activeTab, selectedRole]);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    setUploadError(null);
    try {
      const response = await axios.get(`http://localhost:8000/announcements/${selectedRole}`);
      
      if (response.data && response.data.announcements) {
        setAnnouncements(response.data.announcements);
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    if (activeTab === "Announcements") {
      fetchAnnouncements();
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploading(true);
    setUploadError(null);
    
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    
    formData.append("role", selectedRole);
    formData.append('isAnnouncement', 'false');

    try {
      const response = await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newFiles = selectedFiles.map((file) => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        uploaded: new Date().toLocaleDateString(),
        icon: getFileIcon(file.name),
        role: selectedRole,
        isAnnouncement: false,
      }));

      setFiles((prevFiles) => [...newFiles, ...prevFiles]);
      console.log("Files uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
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
          text: announcement,
          role: selectedRole,
          isImportant: isImportant
        }
      );

      if (response.data && response.data.status === "success") {
        setAnnouncement("");
        setIsImportant(false); // Reset importance after successful submission
        // Wait a moment before fetching to allow Firebase to update
        setTimeout(() => {
          fetchAnnouncements();
        }, 1000);
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

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return FileText;
      case 'csv':
      case 'xlsx': return FileSpreadsheet;
      case 'txt': return FileText;
      case 'docx': return FileType;
      case 'jpeg':
      case 'jpg':
      case 'png': return Image;
      default: return File;
    }
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

    if (announcements.length === 0) {
      return (
        <div className="empty-state">
          <Bell size={24} />
          <p>No announcements yet</p>
        </div>
      );
    }

    return (
      <>
        {announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`announcement-item ${announcement.isImportant ? 'important' : ''}`}
          >
            <div className="announcement-header">
              <span className={`role-badge ${announcement.role}`}>
                {announcement.role.replace('_', '/')}
              </span>
              <span className="timestamp">
                {new Date(announcement.timestamp).toLocaleString()}
              </span>
            </div>
            {announcement.isImportant && (
              <span className="important-badge">Important</span>
            )}
            <p className="announcement-text">{announcement.text}</p>
            <button 
              className="delete-button"
              onClick={() => deleteAnnouncement(announcement.id)}
              title="Delete announcement"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="app-container">
      <nav>
        <div className="nav-content">
          <div className="nav-top">
            <h1>Nexus Control</h1>
            <ul>
              {tabs.map((tab) => (
                <li key={tab.name}>
                  <button
                    className={activeTab === tab.name ? "active" : ""}
                    onClick={() => setActiveTab(tab.name)}
                  >
                    <tab.icon />
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut />
            Logout
          </button>
        </div>
      </nav>

      <main className="main-layout">
        {(activeTab === "Upload" || activeTab === "Announcements") && (
          <div className="role-selector-container">
            <label htmlFor="userType" className="role-label">Select Role:</label>
            <select
              id="userType"
              value={selectedRole}
              onChange={handleRoleChange}
              className="role-dropdown"
            >
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="hod_dean">HOD/Dean</option>
            </select>
          </div>
        )}
        
        <div className="content-area">
          {activeTab === "Upload" && (
            <div className="upload-section">
              <h2>Data Upload Interface</h2>
              <div className="card">
                <div className="upload-area">
                  <p>Initiate data transfer or select files for upload.</p>
                  <p className="file-types">Supported file types: PDF, CSV, TXT, DOCX, XLSX, JPEG, JPG, PNG</p>
                  <button onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    {uploading ? (
                      <>
                        <RefreshCw className="spin" /> Uploading...
                      </>
                    ) : (
                      "Upload Files"
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.csv,.txt,.docx,.xlsx,.jpeg,.jpg,.png"
                  />
                </div>
                {uploadError && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div className="card files-list">
                <h3>Uploaded Files</h3>
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file, index) => (
                      <tr key={index}>
                        <td>
                          <div className="file-info">
                            <div className="file-icon">
                              {file.icon && <file.icon />}
                            </div>
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td>{file.size}</td>
                        <td>{file.uploaded}</td>
                        <td>{file.role}</td>
                        <td>
                          <button className="action-button">
                            <MoreVertical />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === "Announcements" && (
            <div className="announcements-section">
              <h2>Broadcast Announcements</h2>
              <div className="card">
                <form onSubmit={handleAnnouncementSubmit}>
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
          )}
          
          {activeTab === "Stats" && (
            <div className="stats-section">
              <h2>Statistics</h2>
              <div className="card">
                <p>Statistics content goes here.</p>
              </div>
            </div>
          )}
          
          {activeTab === "Chatbot" && (
            <div className="chatbot-section">
              <h2>Chatbot Interface</h2>
              <div className="card">
                <p>Chatbot interface goes here.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}