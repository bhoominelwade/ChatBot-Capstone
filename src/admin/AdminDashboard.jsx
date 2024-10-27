import React, { useState, useRef } from "react";
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
  LogOut
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Upload");
  const [announcement, setAnnouncement] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Students");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { name: "Upload", icon: Upload },
    { name: "Announcements", icon: Bell },
    { name: "Stats", icon: BarChart2 },
    { name: "Chatbot", icon: MessageSquare },
  ];

  const resetState = () => {
    setActiveTab("Upload");
    setAnnouncement("");
    setFiles([]);
    setUploading(false);
    setUploadError(null);
    setSelectedRole("Students");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');

    // Add a delay before refreshing the page to prevent immediate visual feedback
    setTimeout(() => {
        window.location.reload();
    }, 100); // 100 milliseconds delay
};


const handleFileUpload = async (e) => {
  const selectedFiles = Array.from(e.target.files);
  setUploading(true);
  setUploadError(null);
  
  const formData = new FormData();
  selectedFiles.forEach((file) => {
    formData.append("files", file);
  });
  
  // Ensure role is properly formatted for metadata
  const normalizedRole = selectedRole.toLowerCase().replace('/', '_').replace(' ', '_');
  formData.append("role", normalizedRole);
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
      const formData = new FormData();
      
      // Add announcement text as a file
      const announcementBlob = new Blob([announcement], { type: 'text/plain' });
      const textFile = new File([announcementBlob], 'announcement.txt', { type: 'text/plain' });
      formData.append('files', textFile);
      formData.append('role', selectedRole.toLowerCase());
      formData.append('isAnnouncement', 'true');

      const response = await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newFile = {
        name: 'announcement.txt',
        size: (announcement.length / 1024).toFixed(2) + " KB",
        uploaded: new Date().toLocaleDateString(),
        icon: FileText,
        role: selectedRole,
        isAnnouncement: true,
        content: announcement,
      };

      setFiles(prevFiles => [newFile, ...prevFiles]);
      setAnnouncement("");
      console.log("Announcement submitted successfully:", response.data);

    } catch (error) {
      console.error("Error uploading announcement:", error);
      setUploadError("Failed to upload announcement. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return FileText;
      case 'csv':
      case 'xlsx':
        return FileSpreadsheet;
      case 'txt':
        return FileText;
      case 'docx':
        return FileType;
      case 'jpeg':
      case 'jpg':
      case 'png':
        return Image;
      default:
        return File;
    }
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
          <div className="dropdown-container">
            <select
              id="userType"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="user-type-dropdown"
            >
              <option value="Students">Students</option>
              <option value="Teachers">Teachers</option>
              <option value="HOD/Dean">HOD/Dean</option>
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
                  <button onClick={triggerFileUpload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Files"}
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
                  <p className="error-message">{uploadError}</p>
                )}
              </div>
              <div className="card">
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
                  <button 
                    type="submit" 
                    className="submit-announcement-button"
                    disabled={uploading}
                  >
                    {uploading ? "Submitting..." : "Submit Announcement"}
                  </button>
                  {uploadError && (
                    <p className="error-message">{uploadError}</p>
                  )}
                </form>
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