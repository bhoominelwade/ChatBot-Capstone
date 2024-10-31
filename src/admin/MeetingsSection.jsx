import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RefreshCw, AlertCircle, CalendarDays, 
  Upload
} from "lucide-react";

export default function MeetingsSection() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/teachers/");
      if (response.data && response.data.teachers) {
        setTeachers(response.data.teachers);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setUploadError("Failed to fetch teachers list");
    }
  };

  const handleTimetableUpload = async (e) => {
    if (!selectedTeacher) {
      setUploadError("Please select a teacher first");
      return;
    }
  
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.name.endsWith('.xlsx')) {
      setUploadError("Please upload only Excel (.xlsx) files");
      return;
    }
  
    setUploading(true);
    setUploadError(null);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teacherId", selectedTeacher);
  
    try {
      const response = await axios.post(
        "http://localhost:8000/upload-timetable/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data && response.data.message) {
        setUploadError(null);
        await fetchMeetings(selectedTeacher);
      }
    } catch (error) {
      console.error("Error uploading timetable:", error);
      setUploadError(
        error.response?.data?.detail || 
        "Failed to upload timetable. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchMeetings = async (teacherId) => {
    setLoadingMeetings(true);
    try {
      const response = await axios.get(`http://localhost:8000/meetings/${teacherId}`);
      if (response.data && response.data.meetings) {
        // Sort meetings by date and time and take only the first 3
        const sortedMeetings = response.data.meetings
          .sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
          })
          .slice(0, 3);
        setMeetings(sortedMeetings);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setUploadError("Failed to fetch meetings");
      setMeetings([]);
    } finally {
      setLoadingMeetings(false);
    }
  };

  return (
    <div className="meetings-section">
      <h2>Teacher Timetable Management</h2>
      <div className="card">
        <div className="teacher-selector">
          <label htmlFor="teacherSelect">Select Teacher/HOD:</label>
          <select
            id="teacherSelect"
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              if (e.target.value) {
                fetchMeetings(e.target.value);
              }
            }}
            className="teacher-dropdown"
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.role})
              </option>
            ))}
          </select>
        </div>

        <div className="upload-timetable">
          <p>Upload Timetable (Excel format only)</p>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleTimetableUpload}
            disabled={!selectedTeacher || uploading}
            id="timetable-input"
            className="hidden"
          />
          <label 
            htmlFor="timetable-input" 
            className={`upload-button ${(!selectedTeacher || uploading) ? 'disabled' : ''}`}
          >
            {uploading ? (
              <>
                <RefreshCw className="spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload size={16} /> Choose Timetable File
              </>
            )}
          </label>
        </div>

        {uploadError && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {selectedTeacher && (
        <div className="card meetings-list">
          <h3>Upcoming Meetings (Next 3)</h3>
          {loadingMeetings ? (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>Loading meetings...</p>
            </div>
          ) : meetings.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>With</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td>{new Date(meeting.date).toLocaleDateString('en-IN')}</td>
                    <td>{meeting.time}</td>
                    <td>{meeting.student_id}</td>
                    <td>
                      <span className={`meeting-status ${meeting.status}`}>
                        {meeting.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <CalendarDays size={24} />
              <p>No meetings scheduled yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}