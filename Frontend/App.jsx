import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="header">
        <nav className="navbar">
          
            <ul className="nav-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          
          <div className="nav-right">
            {/* <button className="login-btn">Login</button>
            <button className="signup-btn">Sign Up</button> */}
          </div>
        </nav>
      </header>
      <main className="main-content">
        <div className="left-section">
          <div class="circle-container">
           <div class="circle circle-1"></div>
           <div class="circle circle-2"></div>
           <div class="circle circle-3"></div>
           <div class="circle circle-4"></div>
           <div class="circle circle-5"></div>
           <div class="circle circle-6"></div>
          </div>
          <h1>Welcome to our Chatbot</h1>
          <p>
            Engage with our AI-powered chatbot and get personalized assistance
            for all your needs.
          </p>
          <div className="action-buttons">
            <button className="get-started-btn">Get Started</button>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
        <div className="right-section">
          <div className="auth-form">
            <h2>Login or Sign Up</h2>
            <p>Access your account or create a new one</p>
            <div className="social-login">
              <button className="github-btn">Github</button>
              <button className="google-btn">Google</button>
            </div>
            <p className="divider"><div class="line"></div>OR CONTINUE WITH<div class="line"></div></p>
            <div className="input-group">
              <p>Email</p>
              <input type="email" placeholder="m@example.com" />
            </div>
            <div className="input-group">
              <p>Password</p>
              <input type="password" placeholder="Enter your password" />
            </div>
            <button className="continue-btn">Continue</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
