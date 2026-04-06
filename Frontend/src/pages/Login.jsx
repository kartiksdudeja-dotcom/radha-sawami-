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
  const [loginMode, setLoginMode] = useState("user"); // "user" or "admin"
  const [isAdminDetected, setIsAdminDetected] = useState(false);

  // Smart Role Detection - Trigger as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger check immediately if any text is entered
      if (username.trim().length >= 1) {
        checkUserRole(username.trim());
      } else {
        setIsAdminDetected(false);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [username]);

  const handleUidBlur = () => {
    if (username.trim().length >= 1) {
      checkUserRole(username.trim());
    }
  };

  const checkUserRole = async (uid) => {
    try {
      console.log("🔍 Checking role for UID:", uid);
      const response = await fetch(API_ENDPOINTS.CHECK_ROLE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uid }),
      });
      const result = await response.json();
      console.log("📝 Role Check Result:", result);

      /*
       * Tasks completed:
       * - [x] **Smart Login & Premium Branding**
       * - [x] [BACKEND] Implement `check-role` endpoint with type-safe role check
       * - [x] [FRONTEND] Implement Hindi/Pune branding in premium design
       * - [x] [FRONTEND] Logic: Trigger role toggle only after UID entry
       * - [x] [VERIFICATION] Debug logs added to ensure detection works
       */
      if (result.success && result.isAdmin) {
        console.log("✅ Admin detected for:", uid);
        setIsAdminDetected(true);
      } else {
        setIsAdminDetected(false);
        setLoginMode("user"); // Force user mode if not admin
      }
    } catch (error) {
      console.error("❌ Role detection error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { username, password };
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }

      // If in admin mode but user is not admin, deny
      if (loginMode === "admin" && !result.user.is_admin) {
         setError("You do not have administrative privileges.");
         setLoading(false);
         return;
      }

      // Important: If "user" mode is selected, we force is_admin to false 
      // even if the user is actually an admin in the database.
      const effectiveUser = {
        ...result.user,
        is_admin: loginMode === "admin" && result.user.is_admin
      };

      // Store user data
      localStorage.setItem("user", JSON.stringify(effectiveUser));
      localStorage.setItem("is_admin", effectiveUser.is_admin);

      if (onLoginSuccess) {
        onLoginSuccess(effectiveUser);
      }
    } catch (error) {
      setError("Connection failure. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Branding Section - Glassmorphic */}
        <div className="login-brand">
          <div className="brand-content">
            <img src={MGRSALogo} alt="Radha Swami" className="brand-logo" />
            <h1 className="brand-title">रा–धा / धः–स्व–आ–मी</h1>
            <p className="brand-subtitle">Pune Branch</p>
            <div className="brand-desc-container">
              <p className="brand-desc">
                "प्रेम ही प्रेम है, और प्रेम ही परमात्मा है।"
              </p>
              <p className="brand-desc" style={{marginTop: '12px', fontSize: '0.85rem', opacity: 0.7}}>
                Dedicated to the spiritual upliftment and service of humanity.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access the portal</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}

            {/* Smart Mode Toggle */}
            {isAdminDetected && (
              <div className="login-mode-toggle">
                <button 
                  type="button"
                  className={loginMode === 'user' ? 'active' : ''}
                  onClick={() => setLoginMode('user')}
                >
                  User
                </button>
                <button 
                  type="button"
                  className={loginMode === 'admin' ? 'active' : ''}
                  onClick={() => setLoginMode('admin')}
                >
                  Admin
                </button>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="username">User ID (UID)</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your UID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUidBlur}
                required
                disabled={loading}
                autoComplete="off"
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
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
