import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Import the new CSS

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect on successful login
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="phone-frame">
      <div className="content">
        {/* Logo øverst til venstre */}
        <div className="top-bar">
          <div className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">StudyBuddy</span>
          </div>
        </div>

        {/* Midtinnhold */}
        <div className="main-section">
          <div className="hero-text">
            <h1>Improve your study habits</h1>
            <p>Combine all your calendars in one clear overview and stay on top of every deadline.</p>
          </div>

          {/* Innloggingsdel (sentralisert) */}
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <span className="form-label">Email</span>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  className="input-field"
                  type="email"
                  id="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Password</span>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="input-field"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>} {/* Added for error display */}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <Link to="#" className="forgot-password">Forgot password?</Link> {/* Link to # for now */}
          </form>

          <div className="helper-text">
            Your smart calendar companion for better study routines.
          </div>

          {/* Add the "Sign up" link back, styled simply for now */}
          <p className="signup-prompt">
            Don't have an account yet?{' '}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;