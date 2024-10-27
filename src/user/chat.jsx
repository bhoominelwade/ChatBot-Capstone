import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { auth, db, storage } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
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
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    photo: ''
  });

  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);

  



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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
              text: `Access Denied: You don't have permission to access this document. This document requires a higher role level.`, 
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
          text: error.response?.data?.detail || 'Sorry, I encountered an error. Please try again.', 
          type: 'ai',
          isError: true 
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const regenerateResponse = async (index) => {
    setIsSending(true);
    try {
      const response = await axios.post('http://localhost:8000/regenerate/', {
        message: messages[index].text,
        userRole: userProfile.role
      });
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[index] = { ...newMessages[index], text: response.data.response };
        return newMessages;
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setIsSending(false);
    }
  };



  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserProfile({ name: '', email: '', role: '', photo: '' });
      console.log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
            msg.text
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
              <RefreshCw size={16} />
            </button>
            <button className="action-button" onClick={() => playAudio(msg.text)}>
              <Volume2 size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <video ref={videoRef} id="background-video" loop autoPlay muted>
        <source src={darkblue} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="chatbot-window">
        <div className="sidebar">
          <button className="sidebar-button" onClick={() => setShowUserPanel(!showUserPanel)}>
            <UserCircle />
          </button>
          <button className="sidebar-button">
            <MessageSquare />
          </button>
          <button className="sidebar-button">
            <PlusCircle />
          </button>
          <button className="sidebar-button" onClick={() => setShowAnnouncements(!showAnnouncements)}>
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
              placeholder="Type a message or 'doc:' followed by a file name..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isSending}
            />
            <button className="send-button" onClick={sendMessage} disabled={isSending}>
              {isSending ? <RefreshCw size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>

        {showAnnouncements && renderAnnouncements()(
          <div className="announcements-panel">
            <div className="panel-header">
              <h2>Announcements</h2>
              <button onClick={() => setShowAnnouncements(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="announcements-list">
              {announcements.map((announcement, index) => (
                <div key={index} className="announcement">
                  {announcement}
                </div>
              ))}
            </div>
          </div>
        )}

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