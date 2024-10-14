import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Add axios for backend calls
import './chat.css';
import darkblue from "./assets/darkblue.mp4";
import { UserCircle, MessageSquare, PlusCircle, Bell, Send, X, RefreshCw, Volume2 } from 'lucide-react';

const ChatbotUI = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', type: 'ai' }
  ]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isSending, setIsSending] = useState(false); // For managing the send button state

  const videoRef = useRef(null);

  const announcements = [
    "New feature: Video calls now available!",
    "Maintenance scheduled for tonight at 2 AM UTC",
    "Check out our new dark mode in settings!"
  ];

  const sendMessage = async () => {
    if (message.trim() && !isSending) {
      // Add the user's message to the chat
      const userMessage = { text: message, type: 'user' };
      setMessages([...messages, userMessage]);
      setMessage('');
      setIsSending(true);

      // Send the message to the backend and get AI response
      try {
        const response = await axios.post('http://localhost:8000/chat/', {
          message
        });
        // Add the AI response to the chat
        const botMessage = { text: response.data.response, type: 'ai' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', type: 'ai' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Function to regenerate AI response for a specific message
  const regenerateResponse = async (index) => {
    setIsSending(true);
    try {
      const response = await axios.post('http://localhost:8000/regenerate/', {
        message: messages[index].text
      });
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[index] = { ...newMessages[index], text: response.data.response };
        return newMessages;
      });
    } catch (error) {
      console.error('Error regenerating message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const toggleUserPanel = () => {
    setShowUserPanel(prev => !prev);
    setShowAnnouncements(false); // Close announcements when user panel opens
  };

  useEffect(() => {
    const chatContainer = document.querySelector('.chat-area');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom on new messages
    }
  }, [messages]);

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
                    <button className="action-button" onClick={() => regenerateResponse(index)} disabled={isSending}>
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
              disabled={isSending}
            />
            <button className="send-button" onClick={sendMessage} disabled={isSending}>
              {isSending ? 'Sending...' : <Send size={20} />}
            </button>
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
