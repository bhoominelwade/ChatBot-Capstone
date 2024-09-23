import React, { useState, useRef } from 'react';
import './float.css';
import darkblue from 'C:/Users/bhoom/Desktop/frontend/client/src/assets/darkblue.mp4';
import { UserCircle, MessageSquare, PlusCircle, Bell, Send, X, RefreshCw, Volume2 } from 'lucide-react';

const ChatbotUI = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', type: 'ai' }
  ]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);

  const videoRef = useRef(null);

  const announcements = [
    "New feature: Video calls now available!",
    "Maintenance scheduled for tonight at 2 AM UTC",
    "Check out our new dark mode in settings!"
  ];

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, type: 'user' }]);
      setMessage('');
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "I'm here to help! What do you need assistance with?", type: 'ai' }
        ]);
      }, 1000);
    }
  };

  const regenerateResponse = (index) => {
    setTimeout(() => {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[index] = { ...newMessages[index], text: "Here's an updated response!" };
        return newMessages;
      });
    }, 1000);
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const toggleUserPanel = () => {
    setShowUserPanel(prev => !prev);
    setShowAnnouncements(false); // Close announcements when user panel opens
  };

  return (
    <div className="chatbot-container">
      <video ref={videoRef} id="background-video" loop autoPlay muted>
        <source src={darkblue} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="chatbot-window">
        <div className="sidebar">
          <button className="sidebar-button" onClick={toggleUserPanel}>
            <UserCircle />
          </button>
          <button className="sidebar-button"><MessageSquare /></button>
          <button className="sidebar-button"><PlusCircle /></button>
          <button className="sidebar-button" onClick={() => setShowAnnouncements(!showAnnouncements)}>
            <Bell />
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content" style={{ marginRight: (showAnnouncements || showUserPanel) ? '320px' : '0' }}>
          <div className="chat-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message-container ${msg.type === 'user' ? 'user-message-container' : 'ai-message-container'}`}>
                <div className={`message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
                  {msg.text}
                </div>
                {msg.type === 'ai' && (
                  <div className="message-actions" style={{ marginTop: '10px' }}>
                    <button className="action-button" onClick={() => regenerateResponse(index)}>
                      <RefreshCw size={16} />
                    </button>
                    <button className="action-button" onClick={() => playAudio(msg.text)}>
                      <Volume2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="send-button" onClick={sendMessage}><Send size={20} /></button>
          </div>
        </div>

        {/* Announcements Panel */}
        {showAnnouncements && (
          <div className="announcements-panel">
            <div className="announcements-header">
              <h2>Announcements</h2>
              <button onClick={() => setShowAnnouncements(false)}><X size={20} /></button>
            </div>
            <div className="announcements-list">
              {announcements.map((announcement, index) => (
                <div key={index} className="announcement">{announcement}</div>
              ))}
            </div>
          </div>
        )}

        {/* User Info Panel */}
        {showUserPanel && (
          <div className="user-panel">
            <div className="profile-header">
              <div className="profile-avatar">
                <img src="avatar.png" alt="User Avatar" />
              </div>
              <div className="profile-name">John Doe</div>
              <div className="profile-email">john.doe@example.com</div>
            </div>
            <div className="profile-actions">
              <button className="logout-button" onClick={() => alert('Logged out!')}>Log Out</button>
              <button className="close-button" onClick={toggleUserPanel}><X size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotUI;
