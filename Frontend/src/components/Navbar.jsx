import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import notificationIcon from "../assests/notification.png";

const Navbar = ({
  onLogout,
  activeMenu,
  onMenuClick,
  user,
  onSidebarToggle,
  isProfileComplete = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sevaDropdownOpen, setSevaDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [masterTablesDropdownOpen, setMasterTablesDropdownOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showLoginAsModal, setShowLoginAsModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isAdmin = user?.is_admin === true;
  const hasAnyAdminPower = isAdmin || user?.can_manage_attendance === true || user?.can_manage_store === true;
  const featuresLocked = !isProfileComplete;

  console.log("Navbar user:", user);
  console.log("Is admin:", isAdmin);

  // PWA Install prompt handler
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("PWA install prompt ready");
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("PWA installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User response:", outcome);
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual instructions
      setShowQRModal(true);
    }
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
  };

  // Notify parent of initial state
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isMenuOpen);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMenuClick = (menu) => {
    if (onMenuClick) {
      onMenuClick(menu);
    }

    if (menu === "logout" && onLogout) {
      onLogout();
    }

    closeMobileMenu();
  };

  const handleSevaClick = (e) => {
    e.preventDefault();
    setSevaDropdownOpen(!sevaDropdownOpen);
    setReportsDropdownOpen(false);
  };

  const handleSevaItemClick = (item) => {
    // Extract the category ID and navigate directly to seva entry
    const sevaEntryItem = `seva-entry-${item}`;
    handleMenuClick(sevaEntryItem);
    setSevaDropdownOpen(false);
  };

  const handleReportsClick = (e) => {
    e.preventDefault();
    setReportsDropdownOpen(!reportsDropdownOpen);
    setSevaDropdownOpen(false);
    setMasterTablesDropdownOpen(false);
  };

  const handleReportItemClick = (reportType) => {
    handleMenuClick(`report-${reportType}`);
    setReportsDropdownOpen(false);
  };

  const handleMasterTablesClick = (e) => {
    e.preventDefault();
    setMasterTablesDropdownOpen(!masterTablesDropdownOpen);
    setSevaDropdownOpen(false);
    setReportsDropdownOpen(false);
  };

  const handleMasterTableItemClick = (tableType) => {
    handleMenuClick(tableType);
    setMasterTablesDropdownOpen(false);
  };

  // Load members for login-as feature
  const handleLoginAsClick = async () => {
    if (!isAdmin) return;
    setShowLoginAsModal(true);
    setMemberSearch("");
    setMembers([]);
    setFilteredMembers([]);
    setLoadingMembers(true);
    await loadMembers();
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      console.log("📥 Loading members from:", `${API_BASE_URL}/api/members`);

      const response = await fetch(`${API_BASE_URL}/api/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("📊 Response received, status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Response parsed successfully");
      console.log(
        "📋 Response type:",
        typeof result,
        "is array:",
        Array.isArray(result)
      );

      let membersData = [];

      // Handle different response formats
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log("✅ Format 1: success + data array");
        membersData = result.data;
      } else if (Array.isArray(result)) {
        console.log("✅ Format 2: direct array");
        membersData = result;
      } else if (result.data) {
        console.log("✅ Format 3: has data field");
        membersData = Array.isArray(result.data) ? result.data : [result.data];
      }

      console.log(`✅ Parsed ${membersData.length} members from response`);

      if (membersData.length === 0) {
        console.warn("⚠️ WARNING: Members array is empty!");
        console.log("Full response:", result);
      } else {
        console.log("✅ First member sample:", membersData[0]);
      }

      setMembers(membersData);
      setFilteredMembers(membersData);
      console.log(`📊 State updated: ${membersData.length} members in state`);
    } catch (error) {
      console.error("❌ Error loading members:", error);
      console.error("Error stack:", error.stack);
      alert("⚠️ Failed to load members: " + error.message);
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoadingMembers(false);
      console.log("✅ Loading complete, loadingMembers = false");
    }
  };

  const handleMemberSearchChange = (e) => {
    const value = e.target.value;
    setMemberSearch(value);

    if (!value.trim()) {
      setFilteredMembers(members);
      console.log("🔍 Search cleared - showing all members");
      return;
    }

    // Don't search if still loading or if members is empty
    if (loadingMembers) {
      console.warn("⏳ Still loading members, please wait...");
      setFilteredMembers([]);
      return;
    }

    if (members.length === 0) {
      console.warn("⚠️ No members loaded. Please refresh and try again.");
      setFilteredMembers([]);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = members.filter((m) => {
      const searchFields = [
        m.name,
        m.Name,
        m.username,
        m.UserName,
        m.number,
        m.Number,
        m.uid,
        m.UID,
        m.email,
        m.Email,
        m.memberid,
        m.MemberID,
        m.initial,
        m.Initital,
        m.branch,
        m.Branch,
        m.region,
        m.Region,
        m.gender,
        m.Gender,
        m.status,
        m.Status,
      ];

      return searchFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      );
    });

    console.log(
      `🔍 Search "${value}": found ${filtered.length} of ${members.length} members`
    );
    setFilteredMembers(filtered);
  };

  const handleLoginAsMember = async (memberId, memberName) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      console.log("🔑 Logging in as member:", memberId, memberName);

      const response = await fetch(`${API_BASE_URL}/api/auth/login-as-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          admin_id: user.id,
        }),
      });

      const result = await response.json();
      console.log("🔑 Login response:", result);

      if (result.success && result.user) {
        // Store the original admin info before switching
        const originalAdmin = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("original_admin", JSON.stringify(originalAdmin));

        // Update localStorage with impersonated user info
        const impersonatedUser = {
          ...result.user,
          is_impersonating: true,
          original_user_id: originalAdmin.id,
          original_admin_name: originalAdmin.name,
        };

        console.log("🔑 Storing impersonated user:", impersonatedUser);
        localStorage.setItem("user", JSON.stringify(impersonatedUser));
        localStorage.setItem("is_impersonating", "true");

        alert(`✅ Logged in as ${memberName}`);
        window.location.reload();
      } else {
        alert(
          "❌ Failed to login as member: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error logging in as member:", error);
      alert("❌ Error: " + error.message);
    }
    setShowLoginAsModal(false);
  };

  const handleStopImpersonating = async () => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(
        `${API_BASE_URL}/api/auth/stop-impersonating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_user_id: user.original_user_id,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        // Update localStorage with original admin info
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.removeItem("is_impersonating");
        alert(`✅ Returned to admin session`);
        window.location.reload();
      } else {
        alert("❌ Failed to stop impersonating: " + result.error);
      }
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <div className="mobile-hamburger">
        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          title="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="mobile-logo">Radha Swami</div>
      </div>

      {/* Mobile Menu Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu}></div>
      )}

      <aside
        className={`sidebar ${isMenuOpen ? "open" : "closed"} ${
          isMobileMenuOpen ? "mobile-open" : "mobile-closed"
        }`}
      >
        {/* Sidebar Logo */}
        <div className="sidebar-header" onClick={toggleMenu}>
          <div className="logo-container">
            <div className="logo-circle">RS</div>
            {isMenuOpen && <h2 className="logo-text">Radha Swami</h2>}
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="sidebar-menu">
          {featuresLocked && isMenuOpen && (
            <div className="profile-lock-warning">
              <span className="lock-icon">🔒</span>
              <span>Complete profile to unlock</span>
            </div>
          )}

          {/* 1. Main Features */}
          <div className="menu-group">
            <a
              href="#home"
              className={`menu-item ${activeMenu === "home" || activeMenu === "dashboard" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
              onClick={() => handleMenuClick("home")}
              title="Home"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isMenuOpen && <span>🙏 आगला सत्संग</span>}
              {featuresLocked && <span className="lock-badge">🔒</span>}
            </a>

            <a
              href="#store"
              className={`menu-item ${activeMenu === "store" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
              onClick={() => handleMenuClick("store")}
              title="Store"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isMenuOpen && <span>🛒 Canteen Store</span>}
              {featuresLocked && <span className="lock-badge">🔒</span>}
            </a>

            <a
              href="#notifications"
              className={`menu-item ${activeMenu === "notifications" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
              onClick={() => handleMenuClick("notifications")}
              title="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isMenuOpen && <span>Notifications</span>}
              {featuresLocked && <span className="lock-badge">🔒</span>}
            </a>
          </div>


          <div className="menu-divider" style={{height: '1px', background: 'var(--sidebar-border)', margin: '8px 16px', opacity: 0.5}}></div>

          {/* 2. Admin Features - Shown if user has any admin power */}
          {hasAnyAdminPower && (
            <div className="menu-group admin-group">
              <a
                href="#branch"
                className={`menu-item ${activeMenu === "branch" ? "active" : ""}`}
                onClick={() => handleMenuClick("branch")}
                title="Branch Info"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4 0v-3a1 1 0 011-1h2a1 1 0 011 1v3m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isMenuOpen && <span>Branch Info</span>}
              </a>

              <a
                href="#master-tables"
                className={`menu-item ${["member-master", "satsang-options", "seva-options", "superman-phase", "store-admin", "admin-master"].includes(activeMenu) ? "active" : ""}`}
                onClick={handleMasterTablesClick}
                title="Master Settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isMenuOpen && <span>Master Settings</span>}
                {isMenuOpen && <svg className={`dropdown-arrow ${masterTablesDropdownOpen ? "open" : ""}`} viewBox="0 0 24 24" style={{width: '16px', height: '16px'}}><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </a>

              {masterTablesDropdownOpen && isMenuOpen && (
                <div className="seva-dropdown">
                  {(isAdmin || user?.can_manage_attendance) && <a href="#member-master" className={`dropdown-item ${activeMenu === "member-master" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("member-master")}>👤 Members Database</a>}
                  {(isAdmin || user?.can_manage_attendance) && <a href="#satsang-options" className={`dropdown-item ${activeMenu === "satsang-options" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("satsang-options")}>🙏 Satsang Setup</a>}
                  {(isAdmin || user?.can_manage_attendance) && <a href="#seva-options" className={`dropdown-item ${activeMenu === "seva-options" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("seva-options")}>🙌 Seva Setup</a>}
                  {isAdmin && <a href="#superman-phase" className={`dropdown-item ${activeMenu === "superman-phase" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("superman-phase")}>🦸 Superman Setup</a>}
                  {(isAdmin || user?.can_manage_store) && <a href="#store-admin" className={`dropdown-item ${activeMenu === "store-admin" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("store-admin")}>🛒 Canteen Setup</a>}
                  {isAdmin && <a href="#admin-master" className={`dropdown-item ${activeMenu === "admin-master" ? "active" : ""}`} onClick={() => handleMasterTableItemClick("admin-master")}>🔑 Admin Roles</a>}
                </div>
              )}

              <a
                href="#reports"
                className={`menu-item ${activeMenu.startsWith("report") ? "active" : ""}`}
                onClick={handleReportsClick}
                title="Reports & Analytics"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isMenuOpen && <span>All Reports</span>}
                {isMenuOpen && <svg className={`dropdown-arrow ${reportsDropdownOpen ? "open" : ""}`} viewBox="0 0 24 24" style={{width: '16px', height: '16px'}}><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </a>

              {reportsDropdownOpen && isMenuOpen && (
                <div className="seva-dropdown">
                  <a href="#report-attendance" className={`dropdown-item ${activeMenu === "report-attendance" ? "active" : ""}`} onClick={() => handleReportItemClick("attendance")}>📊 Attendance Analytics</a>
                  <a href="#report-seva" className={`dropdown-item ${activeMenu === "report-seva" ? "active" : ""}`} onClick={() => handleReportItemClick("seva")}>📋 Seva Logs</a>
                </div>
              )}

              {isAdmin && !featuresLocked && (
                <a
                  href="#login"
                  className="menu-item login-as-member"
                  onClick={(e) => { e.preventDefault(); handleLoginAsClick(); }}
                  title="Switch User (Admin Only)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="admin-login-svg">
                    <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isMenuOpen && <span className="admin-login-text">Login as Member</span>}

                </a>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isAppInstalled && (
            <div className="menu-item app-installed" title="App Ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isMenuOpen && <span>App Installed</span>}
            </div>
          )}

          {user?.is_impersonating && isAdmin && (
            <a
              href="#stop-impersonating"
              className="menu-item stop-impersonating"
              onClick={(e) => { e.preventDefault(); handleStopImpersonating(); }}
              title="Stop Access"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isMenuOpen && <span>Stop Access</span>}
            </a>
          )}

          <a
            href="#profile"
            className={`menu-item ${activeMenu === "profile" ? "active" : ""}`}
            onClick={() => handleMenuClick("profile")}
            title="Profile"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isMenuOpen && <span>{featuresLocked ? "Complete Profile" : "Profile Settings"}</span>}
          </a>

          <a
            href="#logout"
            className="menu-item logout"
            onClick={() => handleMenuClick("logout")}
            title="Sign Out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isMenuOpen && <span>Sign Out</span>}
          </a>
          
          {isMenuOpen && <div className="footer-links" style={{fontSize: '0.7rem', color: 'var(--sidebar-text)', opacity: 0.5, textAlign: 'center', marginTop: '4px'}}>RS Portal v1.2</div>}
        </div>
      </aside>

      {/* QR Code Modal for App Download */}
      {showQRModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="qr-modal-close"
              onClick={() => setShowQRModal(false)}
            >
              ✕
            </button>
            <div className="qr-modal-header">
              <div className="qr-app-icon">📱</div>
              <h2>Install RS Portal App</h2>
              <p>Install this app on your device - No app store needed!</p>
            </div>

            {/* Install Button for PWA */}
            {isInstallable && (
              <div className="pwa-install-section">
                <button
                  className="pwa-install-btn"
                  onClick={handleInstallClick}
                >
                  <span className="install-icon">📲</span>
                  Install App Now
                </button>
                <p className="install-hint">
                  Click to install directly on your device
                </p>
              </div>
            )}

            {/* QR Code for sharing */}
            <div className="qr-code-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  "http://192.168.1.107:3000/download.html"
                )}&color=3b82f6&bgcolor=ffffff`}
                alt="Scan to download RS Portal App"
                className="qr-code-image"
              />
              <p className="qr-url-hint">Scan QR to open on another device</p>
            </div>

            {/* Installation Instructions */}
            <div className="install-instructions">
              <h3>📱 How to Install:</h3>
              <div className="instruction-tabs">
                <div className="instruction-item">
                  <strong>Android (Chrome):</strong>
                  <ol>
                    <li>Open site in Chrome</li>
                    <li>Tap menu (⋮) → "Install app"</li>
                    <li>Tap "Install"</li>
                  </ol>
                </div>
                <div className="instruction-item">
                  <strong>iPhone (Safari):</strong>
                  <ol>
                    <li>Open site in Safari</li>
                    <li>Tap Share (↑) button</li>
                    <li>Tap "Add to Home Screen"</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="qr-modal-info">
              <div className="app-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Works Offline</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Native App Feel</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>No Download Size</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Always Updated</span>
                </div>
              </div>
              <div className="manual-download-section">
                <button
                  className="manual-download-btn"
                  onClick={() => {
                    const link = "http://192.168.1.107:3000/";
                    navigator.clipboard.writeText(link);
                    alert("Link copied! Share: " + link);
                  }}
                >
                  <span className="copy-icon">📋</span>
                  Copy Link to Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginAsModal && (
        <div
          className="qr-modal-overlay"
          onClick={() => setShowLoginAsModal(false)}
        >
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="qr-modal-close"
              onClick={() => setShowLoginAsModal(false)}
            >
              ✕
            </button>

            <div className="qr-modal-header">
              <div className="qr-app-icon">🔑</div>
              <h2>Login</h2>
              <p>Search and select a member to login as</p>
            </div>

            <div className="login-modal-content">
              <input
                type="text"
                placeholder="🔍 Search by name, ID, or UID..."
                value={memberSearch}
                onChange={handleMemberSearchChange}
                className="login-search-input"
                autoFocus
                disabled={loadingMembers}
              />

              {loadingMembers ? (
                <div className="login-loading">
                  <div className="loading-spinner">⏳</div>
                  <div className="loading-text">Loading members...</div>
                  <div className="loading-subtext">Fetching 709 members</div>
                </div>
              ) : filteredMembers && filteredMembers.length > 0 ? (
                <div className="login-members-list">
                  {filteredMembers.slice(0, 50).map((member) => {
                    const displayName = member.name || member.Name || "Unknown";
                    const displayNumber =
                      member.number || member.Number || member.id;
                    const displayGender = member.gender || member.Gender || "—";
                    return (
                      <div
                        key={member.id || member.UserID}
                        className="login-member-item"
                        onClick={() =>
                          handleLoginAsMember(
                            member.id || member.UserID,
                            displayName
                          )
                        }
                      >
                        <div className="login-member-avatar">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="login-member-info">
                          <div className="login-member-name">
                            {displayName.trim()}
                          </div>
                          <div className="login-member-meta">
                            <span className="login-member-id">
                              #{displayNumber}
                            </span>
                            <span className="login-member-gender">
                              {displayGender}
                            </span>
                          </div>
                        </div>
                        <div className="login-member-arrow">→</div>
                      </div>
                    );
                  })}
                </div>
              ) : members.length === 0 && !loadingMembers ? (
                <div className="login-empty">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">No members loaded</div>
                  <div className="empty-subtext">Try refreshing the page</div>
                </div>
              ) : (
                <div className="login-empty">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-text">No members found</div>
                  <div className="empty-subtext">Try a different search</div>
                </div>
              )}
            </div>

            <div className="login-modal-footer">
              <button
                className="login-cancel-btn"
                onClick={() => setShowLoginAsModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
