import React, { useState } from "react";
import Announcements from "./Announcements";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [recentUploads, setRecentUploads] = useState([
    { file: "report.pdf", size: "2.3 MB", uploaded: "2 days ago" },
    { file: "presentation.pptx", size: "5.1 MB", uploaded: "1 week ago" },
    { file: "invoice.xlsx", size: "1.2 MB", uploaded: "3 days ago" },
  ]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFileUpload = () => {
    const newUploads = selectedFiles.map((file) => ({
      file: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploaded: "Just Now",
    }));
    setRecentUploads([...newUploads, ...recentUploads]);
    setSelectedFiles([]); // Clear selected files after upload
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="card">
            <h3>Upload Files</h3>
            <p></p>
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
            <button 
              className="upload-button" 
              onClick={handleFileUpload}
              disabled={selectedFiles.length === 0}
            >
              Upload
            </button>
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
            <Announcements />
          </div>
        );
      case "stats":
        return (
          <div className="card">
            <div>User Stats Content</div>
          </div>
        );
      case "chatbot":
        return (
          <div className="card">
            <div>Chatbot Content</div>
          </div>
        );
      default:
        return (
          <div className="card">
            <h3>Upload Files</h3>
            <p>Drag and drop files or click to select.</p>
            <div className="upload-box">
              <input
                type="file"
                id="file-select"
                multiple
                onChange={handleFileSelect}
                hidden
              />
              <label htmlFor="file-select" className="upload-label">
                Select Files
              </label>
            </div>
            <button 
              className="upload-button" 
              onClick={handleFileUpload}
              disabled={selectedFiles.length === 0}
            >
              Upload
            </button>
          </div>
        );
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
