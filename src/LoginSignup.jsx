import React, { useState, useRef, useEffect, Suspense } from "react";
import { Github, Mail } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./LoginSignup.css";
import darkblue from "./assets/darkblue.mp4";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = React.lazy(() => import("./admin/AdminDashboard"));
const Chat = React.lazy(() => import("./user/chat"));

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const initializeSession = (user, userRole) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', user.uid);
    localStorage.setItem('userEmail', user.email);
    
    // Set session timeout
    const sessionTimeout = new Date().getTime() + (3600000); // 1 hour from now
    localStorage.setItem('sessionTimeout', sessionTimeout);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play video: ", error);
      });
    }
  }, []);

  const checkUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'Users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error("Error checking user role:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check user role from Firestore
        const userRole = await checkUserRole(user.uid);
        
        if (!userRole) {
          setError('User role not found');
          return;
        }

        // Initialize session
        initializeSession(user, userRole);

        setSuccess('Logged in successfully!');
        setIsLoggedIn(true);
        setUserRole(userRole);
        
        // Navigate based on role with replace
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/chat', { replace: true });
        }
      } else {
        // Sign up flow
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          name: name,
          role: role,
          photo: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        // Initialize session
        initializeSession(user, role);

        setSuccess('Account created successfully!');
        setIsLoggedIn(true);
        setUserRole(role);
        navigate(role === 'admin' ? '/admin' : '/chat', { replace: true });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const checkSession = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const sessionTimeout = localStorage.getItem('sessionTimeout');
      const currentTime = new Date().getTime();

      if (isAuthenticated && sessionTimeout) {
        if (currentTime > parseInt(sessionTimeout)) {
          // Session expired
          localStorage.clear();
          setError('Session expired. Please login again.');
        } else {
          // Valid session - redirect to appropriate page
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/chat', { replace: true });
          }
        }
      }
    };

    checkSession();
  }, [navigate]);

  // Add prevent back button effect
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      <div className="container">
        <div className={`card ${isLogin ? 'login-card' : 'signup-card'}`}>
          <div className="card-header">
            <h2>Welcome</h2>
            <p>{isLogin ? "Sign in to your account" : "Create a new account"}</p>
          </div>
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
          <div className="divider">
            <span>OR</span>
          </div>
          <div className="toggle-container">
            <label>Login</label>
            <input
              type="checkbox"
              checked={!isLogin}
              onChange={() => setIsLogin(!isLogin)}
              className="toggle-switch"
            />
            <label>Sign Up</label>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    className="input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required={!isLogin}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="hod_dean">HOD/Dean</option>
                  </select>
                </div>
              </>
            )}
            <button className="submit-button" type="submit">
              {isLogin ? "Login" : "Sign Up"}
            </button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}