import React, { useState, useRef } from "react";
import axios from 'axios';
import {
  Upload,
  Bell,
  BarChart2,
  MessageSquare,
  MoreVertical,
  FileText,
  FileImage,
  FileSpreadsheet,
  Send,
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Upload");
  const [announcement, setAnnouncement] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const tabs = [
    { name: "Upload", icon: Upload },
    { name: "Announcements", icon: Bell },
    { name: "Stats", icon: BarChart2 },
    { name: "Chatbot", icon: MessageSquare },
  ];

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    console.log("Announcement submitted:", announcement);
    console.log("Uploaded files:", files);
    setAnnouncement("");
    setFiles([]);
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
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
      const newFiles = selectedFiles.map((file) => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        uploaded: new Date().toLocaleDateString(),
        icon: getFileIcon(file.name),
      }));
      setFiles((prevFiles) => [...newFiles, ...prevFiles]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".pdf")) return FileText;
    if (fileName.endsWith(".pptx")) return FileImage;
    if (fileName.endsWith(".xlsx")) return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="app-container">
      <nav>
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
      </nav>
      <main>
        {activeTab === "Upload" && (
          <>
            <h2>Data Upload Interface</h2>
            <div className="card-1 card">
              <div className="upload-area">
                <p>Initiate data transfer or select files for upload.</p>
                <button onClick={triggerFileUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
              </div>
              {uploadError && <p className="error-message">{uploadError}</p>}
            </div>
            <div className="card">
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
          </>
        )}
        {activeTab === "Announcements" && (
          <>
            <h2>Broadcast Announcements</h2>
            <div className="card">
              <form onSubmit={handleAnnouncementSubmit}>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type your announcement here..."
                />
                <div className="button-group">
                  <button type="submit" className="primary-button">
                    <Send />
                    Broadcast
                  </button>
                  <button type="button" className="secondary-button" onClick={triggerFileUpload}>
                    <Upload />
                    Upload Files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                </div>
              </form>
            </div>
          </>
        )}
        {activeTab === "Stats" && (
          <>
            <h2>User Statistics</h2>
            <div className="card">
              <p>User stats functionality not implemented yet.</p>
            </div>
          </>
        )}
        {activeTab === "Chatbot" && (
          <>
            <h2>Chatbot Interface</h2>
            <div className="card">
              <p>Chatbot settings functionality not implemented yet.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}