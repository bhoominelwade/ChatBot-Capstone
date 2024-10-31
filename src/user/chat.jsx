// Imports and Dependencies
import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { auth, db } from '../firebase';
import {
  UserCircle, PlusCircle, Bell, Send,
  X, RefreshCw, Volume2, Download, AlertCircle, LogOut
} from 'lucide-react';
import './chat.css';
import darkblue from "../assets/darkblue.mp4";
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';


const ChatbotUI = () => {
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const [lastNMessages] = useState(50);

  // State Management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', type: 'ai' }
  ]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    photo: '',
    uid: '' // Add uid to the initial state
  });
  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const announcementsRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', location.pathname);
    });
  }, [location]);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '/login';
      }
    };
  
    checkAuth();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);



  // User Profile Management
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user && isAuthenticated) {
        try {
          const userDoc = await getDoc(doc(db, 'Users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              name: userData.name,
              email: user.email,
              role: userData.role,
              photo: userData.photo || '',
              uid: user.uid
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // Announcements Management
  useEffect(() => {
    if (showAnnouncements && userProfile.role) {
      fetchAnnouncements();
    }
  }, [showAnnouncements, userProfile.role]);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const normalizedRole = userProfile.role.toLowerCase().replace('/', '_').replace(' ', '_');
      const response = await axios.get(`http://localhost:8000/announcements/${normalizedRole}`);
      
      if (response.data && response.data.announcements) {
        setAnnouncements(response.data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
};

const toggleAnnouncement = (id) => {
  setExpandedAnnouncements(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};

const clearChat = async () => {
  const initialMessage = { text: 'Hello! How can I assist you today?', type: 'ai' };
  setMessages([initialMessage]);
  
  // Clear from Firestore too
  try {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'chatHistory', user.uid), {
        messages: [initialMessage],
        updatedAt: serverTimestamp(),
        userId: user.uid
      });
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};

  // Authentication
  

  // Modified logout handler
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear state
      setMessages([{ text: 'Hello! How can I assist you today?', type: 'ai' }]);
      setUserProfile({
        name: '',
        email: '',
        role: '',
        photo: '',
        uid: ''
      });
      setShowUserPanel(false);
      setShowAnnouncements(false);
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a complete page refresh and redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Message Handling
  const sendMessage = async () => {
    if (message.trim() && !isSending) {
      const userMessage = { text: message, type: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setMessage('');
      setIsSending(true);
  
      try {
        if (message.startsWith('doc:')) {
          const fileName = message.slice(4).trim();
          const response = await axios.post('http://localhost:8000/retrieve-document/', {
            fileName,
            userRole: userProfile.role
          });
          
          if (response.data.canAccess) {
            const botMessage = { 
              text: `Here's the document you requested: ${fileName}`, 
              type: 'ai',
              downloadUrl: response.data.downloadUrl
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
          } else {
            const botMessage = { 
              text: 'Access Denied: You don\'t have permission to access this document.',
              type: 'ai',
              isError: true
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
          }
        } 
        else if (message.toLowerCase().startsWith('book:')) {
          // Parse the booking request
          const bookingDetails = message.slice(5).trim().split(' ');
          if (bookingDetails.length < 3) {
            const helpMessage = { 
              text: 'Please use the format: book: teacher_name YYYY-MM-DD HH:MM\nFor example: book: John Doe 2024-11-05 14:00', 
              type: 'ai' 
            };
            setMessages(prevMessages => [...prevMessages, helpMessage]);
          } else {
            // Extract booking details - handle names with spaces
            const timeIndex = bookingDetails.length - 1;
            const dateIndex = bookingDetails.length - 2;
            const teacherName = bookingDetails.slice(0, dateIndex).join(' ');
            const date = bookingDetails[dateIndex];
            const time = bookingDetails[timeIndex];
        
            try {
              const formData = new FormData();
              formData.append("teacher_name", teacherName);
              formData.append("student_id", auth.currentUser.uid);
              formData.append("date", date);
              formData.append("time", time);
        
              const response = await axios.post(
                'http://localhost:8000/book-meeting/',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }
              );
        
              let botMessage;
              if (response.data.success) {
                botMessage = {
                  text: `✅ Meeting scheduled successfully with ${teacherName} on ${date} at ${time}`,
                  type: 'ai'
                };
              } else {
                let messageText = `❌ ${response.data.message}\n\nAvailable slots for ${date}:\n`;
                if (response.data.available_slots && response.data.available_slots.length > 0) {
                  messageText += response.data.available_slots.join('\n');
                } else {
                  messageText += "No available slots for this day.";
                }
                botMessage = { text: messageText, type: 'ai' };
              }
              setMessages(prevMessages => [...prevMessages, botMessage]);
            } catch (error) {
              console.error('Error booking meeting:', error);
              const errorMessage = {
                text: error.response?.data?.detail || "Failed to schedule meeting. Please try again or contact support.",
                type: 'ai',
                isError: true
              };
              setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
          }
        }
        else if (message.toLowerCase().startsWith('meetings:')) {
          // View scheduled meetings
          try {
            const response = await axios.get(`http://localhost:8000/meetings/${auth.currentUser.uid}`);
            if (response.data.meetings && response.data.meetings.length > 0) {
              let meetingsText = "Your scheduled meetings:\n\n";
              response.data.meetings.forEach((meeting, index) => {
                meetingsText += `${index + 1}. With: ${meeting.teacher_name}\n   Date: ${meeting.date}\n   Time: ${meeting.time}\n   Status: ${meeting.status}\n\n`;
              });
              const meetingsMessage = { text: meetingsText, type: 'ai' };
              setMessages(prevMessages => [...prevMessages, meetingsMessage]);
            } else {
              const noMeetingsMessage = { 
                text: "You don't have any scheduled meetings.", 
                type: 'ai' 
              };
              setMessages(prevMessages => [...prevMessages, noMeetingsMessage]);
            }
          } catch (error) {
            console.error('Error fetching meetings:', error);
            const errorMessage = {
              text: "Failed to fetch meetings. Please try again.",
              type: 'ai',
              isError: true
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
          }
        }
        else if (message.toLowerCase().startsWith('timetable:')) {
          const teacherName = message.slice(10).trim();
          try {
            // First get teacher ID
            const teacherResponse = await axios.get('http://localhost:8000/teachers/');
            const teacher = teacherResponse.data.teachers.find(t => 
              t.name.toLowerCase() === teacherName.toLowerCase()
            );
            
            if (!teacher) {
              const botMessage = { 
                text: `Teacher "${teacherName}" not found`,
                type: 'ai',
                isError: true
              };
              setMessages(prevMessages => [...prevMessages, botMessage]);
              return;
            }

            // Get timetable
            const response = await axios.get(`http://localhost:8000/timetable/${teacher.id}`);
            if (response.data.success) {
              let timetableText = `Timetable for ${teacherName}:\n\n`;
              Object.entries(response.data.timetable).forEach(([day, slots]) => {
                timetableText += `${day}:\n`;
                Object.entries(slots).forEach(([time, activity]) => {
                  timetableText += `  ${time}: ${activity}\n`;
                });
                timetableText += '\n';
              });
              const botMessage = { text: timetableText, type: 'ai' };
              setMessages(prevMessages => [...prevMessages, botMessage]);
            } else {
              const botMessage = { 
                text: response.data.message,
                type: 'ai',
                isError: true
              };
              setMessages(prevMessages => [...prevMessages, botMessage]);
            }
          } catch (error) {
            console.error('Error fetching timetable:', error);
            const errorMessage = {
              text: "Failed to fetch timetable. Please try again.",
              type: 'ai',
              isError: true
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
          }
        }
        else {
          const response = await axios.post('http://localhost:8000/chat/', {
            message,
            userRole: userProfile.role
          });
          const botMessage = { text: response.data.response, type: 'ai' };
          setMessages(prevMessages => [...prevMessages, botMessage]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { 
          text: 'Sorry, I encountered an error. Please try again.',
          type: 'ai',
          isError: true 
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const playTextToSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const regenerateResponse = async (index) => {
    if (!isSending && messages[index].type === 'ai') {
      setIsSending(true);
      try {
        const response = await axios.post('http://localhost:8000/chat/', {
          message: messages[index - 1].text,
          userRole: userProfile.role
        });
        
        const newMessages = [...messages];
        newMessages[index] = { text: response.data.response, type: 'ai' };
        setMessages(newMessages);
      } catch (error) {
        console.error('Error regenerating response:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const [date, time] = timestamp.split(' ');
      const [day, month, year] = date.split('/');
      
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const [hours, minutes] = time.split(':');
      const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      
      return `${day} ${months[parseInt(month) - 1]} ${year} • ${formattedTime}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp; // Return original if parsing fails
    }
  };

  // Panel Management
  const handlePanelClick = (panel) => {
    if (panel === 'user') {
      setShowUserPanel(true);
      setShowAnnouncements(false);
    } else if (panel === 'announcements') {
      setShowAnnouncements(true);
      setShowUserPanel(false);
    }
  };

  // UI Rendering Functions
  const renderMessage = (msg, index) => {
    // Ensure text is a string and handle undefined/null cases
    const messageText = String(msg?.text || '');
    
    return (
      <div key={index} className={`message-container ${msg.type === 'user' ? 'user-message-container' : 'ai-message-container'}`}>
        <div className={`message ${msg.type === 'user' ? 'user-message' : 'ai-message'} ${msg.isError ? 'error-message' : ''}`}>
          {messageText && messageText.toLowerCase().startsWith('doc:') ? (
            <>
              <span className="doc-highlight">doc:</span>
              {messageText.slice(4)}
            </>
          ) : (
            <pre className="message-content">{messageText}</pre>
          )}
          {msg.downloadUrl && (
            <a href={msg.downloadUrl} target="_blank" rel="noopener noreferrer" className="download-link">
              <Download size={16} /> Download
            </a>
          )}
        </div>
        {msg.type === 'ai' && !msg.isError && (
          <div className="message-actions">
            <button className="action-button" onClick={() => regenerateResponse(index)} disabled={isSending}>
              <RefreshCw size={16} className={isSending ? 'spin' : ''} />
            </button>
            <button className="action-button" onClick={() => playTextToSpeech(messageText)}>
              <Volume2 size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAnnouncements = () => (
    <div className="announcements-panel" ref={announcementsRef}>
      <div className="panel-header">
        <h2>Announcements</h2>
        <button onClick={() => setShowAnnouncements(false)}>
          <X size={20} />
        </button>
      </div>
      <div className="announcements-content">
        {loadingAnnouncements ? (
          <div className="loading-announcements">
            <RefreshCw size={24} className="spin" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="no-announcements">
            <AlertCircle size={24} />
            <span>No announcements available</span>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`announcement-item ${announcement.isImportant ? 'important' : ''}`}
              onClick={() => toggleAnnouncement(announcement.id)}
            >
              <div className="announcement-header">
                <span className={`role-badge ${announcement.role}`}>
                  {announcement.role.replace('_', '/')}
                </span>
                <span className="timestamp">
                  {announcement.timestamp}
                </span>
              </div>
              {announcement.isImportant && (
                <div className="important-badge">Important</div>
              )}
              <h4 className="announcement-title">{announcement.title}</h4>
              {expandedAnnouncements.has(announcement.id) && (
                <pre className="announcement-text">{announcement.text}</pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="chatbot-container">
      {/* Background Video */}
      <video ref={videoRef} id="background-video" loop autoPlay muted>
        <source src={darkblue} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="chatbot-window">
        {/* Sidebar */}
        <div className="sidebar">
          <button 
            className={`sidebar-button ${showUserPanel ? 'active' : ''}`}
            onClick={() => handlePanelClick('user')}
          >
            <UserCircle />
          </button>
          <button 
            className="sidebar-button"
            onClick={clearChat}
            title="Clear chat"
          >
            <PlusCircle />
          </button>
          <button 
            className={`sidebar-button ${showAnnouncements ? 'active' : ''}`}
            onClick={() => handlePanelClick('announcements')}
          >
            <Bell />
          </button>
        </div>

        {/* Main Chat Area */}
        <div className="main-content" style={{ marginRight: (showAnnouncements || showUserPanel) ? '320px' : '0' }}>
          <div className="chat-area" ref={chatContainerRef}>
            {messages.map((msg, index) => renderMessage(msg, index))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message or 'doc:' to request a document..."
              disabled={isSending}
            />
            <button 
              className="send-button" 
              onClick={sendMessage} 
              disabled={isSending}
            >
              {isSending ? <RefreshCw className="spin" /> : <Send />}
            </button>
          </div>
        </div>

        {/* Panels */}
        {showAnnouncements && renderAnnouncements()}
        {showUserPanel && (
          <div className="user-panel">
          <div className="panel-header">
            <h2>Profile</h2>
            <button onClick={() => setShowUserPanel(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="profile-content">
            <div className="profile-avatar">
              {userProfile.photo ? (
                <img src={userProfile.photo} alt="User Avatar" />
              ) : (
                <UserCircle size={64} />
              )}
            </div>
            <div className="profile-info">
              <h3>{userProfile.name}</h3>
              <p>{userProfile.email}</p>
              <p className="role-badge">{userProfile.role}</p>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotUI;