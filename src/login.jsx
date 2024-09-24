import { useState, useRef, useEffect } from 'react';
import { Github, Mail } from "lucide-react";
import './login.css';
import videoblue from './assets/videoblue.mp4';
import darkblue from './assets/darkblue.mp4';

export default function Component() {
  const [isLogin, setIsLogin] = useState(true); // Default to "Login"
  const videoRef = useRef(null);
  const containerRef = useRef(null); // Ref for scrolling

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error attempting to play video: ", error);
      });
    }
  }, []);

  // Function to handle scroll
  const handleScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="overlay">
      <div id="gradient-overlay"></div>
      <video ref={videoRef} id="background-video" loop autoPlay muted>
        <source src={darkblue} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <header className="header">
        <nav className="navbar">
            <ul className="nav-links">
              <li><button className="nav-button">Home</button></li>
              <li><button className="nav-button">About</button></li>
              <li><button className="nav-button">Blog</button></li>
              <li><button className="nav-button">Contact Us</button></li>
            </ul>
       </nav>
      </header>

      <div ref={containerRef} className="container">
        <div className="card">
          <div className="card-header">
            <h2>Welcome</h2>
            <p>Sign in to your account or create a new one</p>
          </div>

          {/* Authentication Options */}
          <div className="auth-options">
            <button className="auth-button">
              <Mail className="icon" />
              Google
            </button>
            <button className="auth-button">
              <Github className="icon" />
              Github
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Toggle between Login and Sign Up */}
          <div className="toggle-container">
            <label>Login</label>
            <input 
              type="checkbox" 
              checked={!isLogin} // Reverse the checked state for "Sign Up"
              onChange={() => setIsLogin(!isLogin)} 
              className="toggle-switch" 
            />
            <label>Sign Up</label>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="m@example.com" className="input-field" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="input-field" required />
          </div>

          {/* Conditionally show "Confirm Password" when in Sign Up mode */}
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="input-field" required />
            </div>
          )}

          {/* Submit Button */}
          <button className="submit-button">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
