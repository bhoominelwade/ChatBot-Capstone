import React, { useState, useEffect } from 'react';
import './chat.css';

const Chat = () => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: 'Hello! How can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRightSideOpen, setIsRightSideOpen] = useState(true);
  const [isLeftSideOpen, setIsLeftSideOpen] = useState(true);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setChatMessages([...chatMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="chatbot-container">
      {/* Left Sidebar */}
      <div className={`left-sidebar ${isLeftSideOpen ? '' : 'collapsed'}`}>
        {isLeftSideOpen && (
          <>
            <div className="user-info">
              <div className="user-avatar">JD</div>
              <div>
                <div className="user-name">Jane Doe</div>
                <div className="user-role">User</div>
              </div>
            </div>
            <div className="new-chat-button">+ New Chat</div>
            <div className="chat-history">Chat History</div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="main-chat-area">
        <div className="chat-header">
          <h1>AI Chatbot</h1>
          <div>
            <button className="toggle-button" onClick={() => setIsLeftSideOpen(!isLeftSideOpen)}>
              {isLeftSideOpen ? '◄' : '►'}
            </button>
            <button className="toggle-button" onClick={() => setIsRightSideOpen(!isRightSideOpen)}>
              {isRightSideOpen ? '►' : '◄'}
            </button>
          </div>
        </div>

        <div id="chat-container" className="chat-container">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
            >
              {message.content}
              {message.role === 'bot' && (
                <div className="message-options">
                  <button className="option-button">Regenerate</button>
                  <button className="option-button">Audio</button>
                  <button className="option-button">Read Text</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="input-box">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`right-sidebar ${isRightSideOpen ? '' : 'collapsed'}`}>
        {isRightSideOpen && (
          <div className="announcements">
            <div className="announcement">Latest Announcement</div>
            <div className="announcement-content">This is your latest announcement!</div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Chat;
