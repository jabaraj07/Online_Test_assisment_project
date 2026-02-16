import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // const res = await axios.post(
      //   "http://localhost:5000/api/admin/login",
      //   { email, password }
      // );

      const res = await api.post(
        "/admin/login",
        { email, password }
      );

      // store token
      localStorage.setItem("adminToken", res.data.token);

      navigate("/admin/attempts");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <svg className="brand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="brand-title">Assessment Portal</h1>
            <p className="brand-description">
              Secure admin access to manage candidate assessments, view results, and monitor exam integrity.
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real-time monitoring</span>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Comprehensive audit trails</span>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Detailed answer review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-side">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">Admin Sign In</h2>
              <p className="form-subtitle">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {error && (
                <div className="error-alert">
                  <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="form-footer">
              <svg className="shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="footer-text">Secure admin access only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}