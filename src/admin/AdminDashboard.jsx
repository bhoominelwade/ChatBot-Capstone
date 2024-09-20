import React, { useState } from "react";
import axios from 'axios';
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [recentUploads, setRecentUploads] = useState([
    { file: "report.pdf", size: "2.3 MB", uploaded: "2 days ago" },
    { file: "presentation.pptx", size: "5.1 MB", uploaded: "1 week ago" },
    { file: "invoice.xlsx", size: "1.2 MB", uploaded: "3 days ago" },
  ]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      const newUploads = selectedFiles.map((file) => ({
        file: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded: "Just Now",
      }));
      setRecentUploads([...newUploads, ...recentUploads]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="card">
            <h3>Upload Files</h3>
            <div className="upload-box">
              <input
                type="file"
                id="file-select"
                multiple
                onChange={handleFileSelect}
                hidden
              />
              <label htmlFor="file-select" className="upload-label">
                Drag and drop files or click to select.
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <div>
                <p>Selected files:</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <button 
              className="upload-button" 
              onClick={handleFileUpload}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {uploadError && <p className="error-message">{uploadError}</p>}
            <div className="recent-uploads-card">
              <h3>Recent Uploads</h3>
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((upload, index) => (
                    <tr key={index}>
                      <td>{upload.file}</td>
                      <td>{upload.size}</td>
                      <td>{upload.uploaded}</td>
                      <td>
                        <button className="action-btn">↔</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "announcements":
        return (
          <div className="card">
            <h3>Announcements</h3>
            <p>Announcement functionality not implemented yet.</p>
          </div>
        );
      case "stats":
        return (
          <div className="card">
            <h3>User Stats</h3>
            <p>User stats functionality not implemented yet.</p>
          </div>
        );
      case "chatbot":
        return (
          <div className="card">
            <h3>Chatbot Settings</h3>
            <p>Chatbot settings functionality not implemented yet.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
      </header>
      <div className="tabs-container">
        <div className="tabs">
          {["upload", "announcements", "stats", "chatbot"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>
      <div className="content-section">{renderContent()}</div>
    </main>
  );
};

export default AdminDashboard;