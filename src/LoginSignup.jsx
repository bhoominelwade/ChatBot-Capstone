import React, { useState, useRef, useEffect, Suspense } from "react";
import { Github, Mail } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase"; // Ensure this imports your Firebase configuration
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play video: ", error);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      // Hardcoded Admin Login
      if (email === 'admin@test.com' && password === 'admin1234') {
        setSuccess('Admin logged in successfully!');
        setIsLoggedIn(true);
        setUserRole('admin');
        navigate('/admin'); // Redirect to Admin Dashboard
        return;
      }

      // Regular user login via Firebase
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Logged in successfully!');
        setIsLoggedIn(true);
        setUserRole('user');
        navigate('/chat'); // Redirect to Chat for users
      } catch (error) {
        setError(error.message);
      }
    } else {
      // Sign up logic for regular users
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user data to Firestore
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          name: name,
          role: role,
          photo: '' // Add a default photo URL if needed
        });

        setSuccess('Account created successfully!');
        setIsLoggedIn(true);
        setUserRole(role);
        navigate(role === 'admin' ? '/admin' : '/chat'); // Navigate based on role
      } catch (error) {
        setError(error.message);
      }
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