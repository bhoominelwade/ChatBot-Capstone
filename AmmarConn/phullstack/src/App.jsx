import React, { useState } from "react";
import "./App.css";
import AdminDashboard from "./admin/AdminDashboard";
import Chat from "./user/chat";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (username === "admin" && password === "password") {
      setRole("admin");
      setIsLoggedIn(true);
    } else if (username === "user" && password === "password") {
      setRole("user");
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  if (isLoggedIn) {
    return role === "admin" ? <AdminDashboard /> : <Chat />;
  }

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
          <div className="circle-container">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="circle circle-4"></div>
            <div className="circle circle-5"></div>
            <div className="circle circle-6"></div>
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
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <p>Username</p>
                <input type="text" name="username" placeholder="Enter your username" required />
              </div>
              <div className="input-group">
                <p>Password</p>
                <input type="password" name="password" placeholder="Enter your password" required />
              </div>
              <button className="continue-btn" type="submit">Continue</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
