// UploadSection.jsx
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, AlertCircle, Trash2, FileText, 
  FileSpreadsheet, File, FileType, Image, RefreshCw, MoreVertical
} from "lucide-react";

export default function UploadSection({ selectedRole }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRecentFiles();
  }, [selectedRole]);

  const fetchRecentFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/recent-files/${selectedRole}`);
      if (response.data && response.data.files) {
        // Only take the 8 most recent files if more are returned
        const recentFiles = response.data.files.slice(0, 8);
        setFiles(recentFiles);
      }
    } catch (error) {
      console.error("Error fetching recent files:", error);
      setUploadError("Failed to fetch recent files.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
      await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchRecentFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      const response = await axios.delete(`http://localhost:8000/delete-file/${fileName}`);
      if (response.status === 200) {
        await fetchRecentFiles(); // Refresh the list after successful deletion
      } else {
        setUploadError("Failed to delete file. Unexpected response.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setUploadError(
        error.response?.data?.detail || 
        "Failed to delete file. Please try again."
      );
    }
  };

  const getFileIcon = (type) => {
    const ext = type.split('/').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return FileText;
      case 'csv':
      case 'vnd.ms-excel':
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet': return FileSpreadsheet;
      case 'plain': return FileText;
      case 'msword':
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document': return FileType;
      case 'jpeg':
      case 'jpg':
      case 'png': return Image;
      default: return File;
    }
  };

  const toggleDropdown = (index, e) => {
    e.stopPropagation(); // Prevent event from bubbling
    setActiveDropdown(activeDropdown === index ? null : index);
  };
  
  return (
    <div className="upload-section">
      <h2>Data Upload Interface</h2>
      <div className="card">
        <div className="upload-area">
          <p>Initiate data transfer or select files for upload.</p>
          <p className="file-types">
            Supported file types: PDF, CSV, TXT, DOCX, XLSX, JPEG, JPG, PNG
          </p>
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
        <h3>Recent Files (Last 8)</h3>
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
                      {React.createElement(getFileIcon(file.type))}
                    </div>
                    <span>{file.name}</span>
                  </div>
                </td>
                <td>{Math.round(file.size / 1024)} KB</td>
                <td>{new Date(file.uploaded).toLocaleString()}</td>
                <td>{file.role}</td>
                <td>
                  <div className="action-dropdown">
                    <button 
                      className="action-button"
                      onClick={(e) => toggleDropdown(index, e)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdown === index && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item delete"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this file?')) {
                              handleDeleteFile(file.name);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}