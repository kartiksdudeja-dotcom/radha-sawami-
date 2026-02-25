import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import MGRSALogo from "../assests/WhatsApp Image 2025-12-20 at 16.55.36.jpeg";
import { API_ENDPOINTS } from "../config/apiConfig";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-clear credentials on page load - BUT only if not already logged in
  useEffect(() => {
    // Check if user is already logged in (don't clear in that case)
    const existingUser = localStorage.getItem("user");
    if (existingUser) {
      console.log("User already logged in, not clearing localStorage");
      return; // Don't clear if user exists
    }

    // Clear localStorage only for fresh login attempts
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem("uid");
    localStorage.removeItem("userCredentials");

    // Clear sessionStorage
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
    sessionStorage.removeItem("uid");
    sessionStorage.removeItem("userCredentials");

    // Disable browser autocomplete
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="password"]'
    );
    inputs.forEach((input) => {
      input.setAttribute("autocomplete", "off");
    });

    console.log("Credentials cleared (no existing user)");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { username, password };
      console.log("Attempting login with:", {
        username,
        passwordLength: password.length,
      });

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Login response status:", response.status);
      const result = await response.json();
      console.log("Login response:", result);

      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login successful! User:", result.user);
      console.log("User is_admin:", result.user.is_admin);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("is_admin", result.user.is_admin);

      console.log("User stored in localStorage");

      // Call success callback with user role
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Failed to login. Make sure backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Branding Section */}
        <div className="login-brand">
          <div className="brand-overlay"></div>
          <div className="brand-content">
            <img src={MGRSALogo} alt="Radha Swami" className="brand-logo" />
            <h1 className="brand-title">Ra-Dha-Sva-Aa-Mi</h1>
            <p className="brand-subtitle">Radhasoami Satsang Dayalbagh</p>
            <p className="brand-desc">
              With respect and devotion, we welcome you to join our spiritual community.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-container">
          <div className="form-header">
            <img src={MGRSALogo} alt="Logo Mobile" className="mobile-logo" />
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to login to your account</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label htmlFor="username">User ID (UID)</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="btn-loader"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
