import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  UserCircle,
  MessageSquare,
  PlusCircle,
  Bell,
  Send,
  X,
  RefreshCw,
  Volume2,
  Download,
  AlertCircle,
  LogOut
} from 'lucide-react';
import './chat.css';
import darkblue from "../assets/darkblue.mp4";
import { useNavigate } from 'react-router-dom';

const ChatbotUI = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', type: 'ai' }
  ]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    photo: ''
  });

  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const announcementsRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              name: userData.name,
              email: user.email,
              role: userData.role,
              photo: userData.photo || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  

  useEffect(() => {
    if (showAnnouncements && userProfile.role) {
      fetchAnnouncements();
    }
  }, [showAnnouncements, userProfile.role]);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      // Make sure to normalize the role as the backend expects
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

  const handlePanelClick = (panel) => {
    if (panel === 'user') {
      setShowUserPanel(true);
      setShowAnnouncements(false);
    } else if (panel === 'announcements') {
      setShowAnnouncements(true);
      setShowUserPanel(false);
    }
  };
  
  // Add this useEffect to fetch announcements when component mounts and when userProfile changes
  useEffect(() => {
    if (userProfile.role) {
      fetchAnnouncements();
    }
  }, [userProfile.role]);

  useEffect(() => {
    if (announcementsRef.current && loadingAnnouncements === false) {
      announcementsRef.current.scrollTop = 0;
    }
  }, [announcements, loadingAnnouncements]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
        } else {
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

  const renderMessage = (msg, index) => {
    return (
      <div key={index} className={`message-container ${msg.type === 'user' ? 'user-message-container' : 'ai-message-container'}`}>
        <div className={`message ${msg.type === 'user' ? 'user-message' : 'ai-message'} ${msg.isError ? 'error-message' : ''}`}>
          {msg.text.startsWith('doc:') ? (
            <>
              <span className="doc-highlight">doc:</span>
              {msg.text.slice(4)}
            </>
          ) : (
            <pre className="message-content">{msg.text}</pre>
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
            <button className="action-button" onClick={() => playTextToSpeech(msg.text)}>
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
            >
              <div className="announcement-header">
                <span className={`role-badge ${announcement.role}`}>
                  {announcement.role.replace('_', '/')}
                </span>
                <span className="timestamp">
                  {new Date(announcement.timestamp).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              {announcement.isImportant && (
                <div className="important-badge">Important</div>
              )}
              <p className="announcement-text">{announcement.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="chatbot-container">
      <video ref={videoRef} id="background-video" loop autoPlay muted>
        <source src={darkblue} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="chatbot-window">
        <div className="sidebar">
          <button 
            className={`sidebar-button ${showUserPanel ? 'active' : ''}`}
            onClick={() => handlePanelClick('user')}
          >
            <UserCircle />
          </button>
          <button className="sidebar-button">
            <MessageSquare />
          </button>
          <button className="sidebar-button">
            <PlusCircle />
          </button>
          <button 
            className={`sidebar-button ${showAnnouncements ? 'active' : ''}`}
            onClick={() => handlePanelClick('announcements')}
          >
            <Bell />
          </button>
        </div>

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