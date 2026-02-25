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
          {/* Profile Completion Warning */}
          {featuresLocked && isMenuOpen && (
            <div className="profile-lock-warning">
              <span className="lock-icon">🔒</span>
              <span>Complete profile to unlock</span>
            </div>
          )}

          {/* Profile - Always accessible */}
          <a
            href="#profile"
            className={`menu-item ${activeMenu === "profile" ? "active" : ""} ${featuresLocked ? "highlighted" : ""}`}
            onClick={() => handleMenuClick("profile")}
            title="Profile"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {isMenuOpen && <span>{featuresLocked ? "👤 Complete Profile" : "Profile"}</span>}
          </a>

          {/* Home - आगला सत्संग (Default Page) */}
          <a
            href="#home"
            className={`menu-item ${
              activeMenu === "home" || activeMenu === "dashboard" ? "active" : ""
            } ${featuresLocked ? "locked" : ""}`}
            onClick={() => handleMenuClick("home")}
            title={featuresLocked ? "Complete profile first" : "आगला सत्संग"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {isMenuOpen && <span>🙏 आगला सत्संग</span>}
          </a>


          {/* Seva - Dropdown Menu */}
          <a
            href="#seva"
            className={`menu-item ${activeMenu.startsWith("seva") ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
            onClick={handleSevaClick}
            title={featuresLocked ? "Complete profile first" : "Seva"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            {isMenuOpen && <span>Seva</span>}
            {isMenuOpen && (
              <svg
                className={`dropdown-arrow ${sevaDropdownOpen ? "open" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </a>

          {sevaDropdownOpen && isMenuOpen && !featuresLocked && (
            <div className="seva-dropdown">
              <a
                href="#seva-entry-mahila"
                className={`dropdown-item ${
                  activeMenu === "seva-entry-mahila" ? "active" : ""
                }`}
                onClick={() => handleSevaItemClick("mahila")}
              >
                👩‍👩‍👧 Mahila Association
              </a>
              <a
                href="#seva-entry-youth"
                className={`dropdown-item ${
                  activeMenu === "seva-entry-youth" ? "active" : ""
                }`}
                onClick={() => handleSevaItemClick("youth")}
              >
                👦👧 Youth Association
              </a>
              <a
                href="#seva-entry-bag"
                className={`dropdown-item ${
                  activeMenu === "seva-entry-bag" ? "active" : ""
                }`}
                onClick={() => handleSevaItemClick("bag")}
              >
                🎒 Bag Unit
              </a>
              <a
                href="#seva-entry-copy"
                className={`dropdown-item ${
                  activeMenu === "seva-entry-copy" ? "active" : ""
                }`}
                onClick={() => handleSevaItemClick("copy")}
              >
                📋 Copy Unit
              </a>
            </div>
          )}

          <a
            href="#branch"
            className={`menu-item ${activeMenu === "branch" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
            onClick={() => handleMenuClick("branch")}
            title={featuresLocked ? "Complete profile first" : "Branch"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            </svg>
            {isMenuOpen && <span>Branch</span>}
          </a>

          <a
            href="#events"
            className={`menu-item ${activeMenu === "events" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
            onClick={() => handleMenuClick("events")}
            title={featuresLocked ? "Complete profile first" : "Events"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {isMenuOpen && <span>Events</span>}
          </a>

          <a
            href="#store"
            className={`menu-item ${activeMenu === "store" ? "active" : ""} ${featuresLocked ? "locked" : ""}`}
            onClick={() => handleMenuClick("store")}
            title={featuresLocked ? "Complete profile first" : "Store"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {isMenuOpen && <span>Store</span>}
          </a>

          {isAdmin && !featuresLocked && (
            <a
              href="#master-tables"
              className={`menu-item ${
                [
                  "member-master",
                  "satsang-options",
                  "seva-options",
                  "superman-phase",
                  "store-admin",
                  "admin-master",
                ].includes(activeMenu)
                  ? "active"
                  : ""
              }`}
              onClick={handleMasterTablesClick}
              title="Master Tables"
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
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              {isMenuOpen && <span>Master Tables</span>}
              {isMenuOpen && (
                <svg
                  className={`dropdown-arrow ${
                    masterTablesDropdownOpen ? "open" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </a>
          )}

          {masterTablesDropdownOpen && isMenuOpen && !featuresLocked && isAdmin && (
            <div className="seva-dropdown">
              <a
                href="#member-master"
                className={`dropdown-item ${
                  activeMenu === "member-master" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("member-master")}
              >
                👤 Add New Satsangi
              </a>
              <a
                href="#satsang-options"
                className={`dropdown-item ${
                  activeMenu === "satsang-options" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("satsang-options")}
              >
                🙏 Add Satsang Options
              </a>
              <a
                href="#seva-options"
                className={`dropdown-item ${
                  activeMenu === "seva-options" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("seva-options")}
              >
                🙌 Add Seva options
              </a>
              <a
                href="#superman-phase"
                className={`dropdown-item ${
                  activeMenu === "superman-phase" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("superman-phase")}
              >
                🦸 Add Superman Phase
              </a>
              <a
                href="#store-admin"
                className={`dropdown-item ${
                  activeMenu === "store-admin" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("store-admin")}
              >
                🛒 Add Store Items
              </a>
              <a
                href="#admin-master"
                className={`dropdown-item ${
                  activeMenu === "admin-master" ? "active" : ""
                }`}
                onClick={() => handleMasterTableItemClick("admin-master")}
              >
                🔑 Add Admins
              </a>
            </div>
          )}

          {isAdmin && !featuresLocked && (
            <a
              href="#reports"
              className={`menu-item ${
                activeMenu.startsWith("report") ? "active" : ""
              }`}
              onClick={handleReportsClick}
              title="Reports"
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
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              {isMenuOpen && <span>Reports</span>}
              {isMenuOpen && (
                <svg
                  className={`dropdown-arrow ${
                    reportsDropdownOpen ? "open" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </a>
          )}

          {reportsDropdownOpen && isMenuOpen && !featuresLocked && (
            <div className="seva-dropdown">
              <a
                href="#report-attendance"
                className={`dropdown-item ${
                  activeMenu === "report-attendance" ? "active" : ""
                }`}
                onClick={() => handleReportItemClick("attendance")}
              >
                📊 Attendance Report
              </a>
              <a
                href="#report-seva"
                className={`dropdown-item ${
                  activeMenu === "report-seva" ? "active" : ""
                }`}
                onClick={() => handleReportItemClick("seva")}
              >
                📋 Seva Entry Report
              </a>
            </div>
          )}

          {/* Login - Admin Feature */}
          {!featuresLocked && (
            <a
              href="#login"
              className={`menu-item login-as-member ${
                isAdmin ? "" : "admin-only"
              }`}
              onClick={(e) => {
                e.preventDefault();
                if (isAdmin) {
                  handleLoginAsClick();
                } else {
                  alert("⚠️ This feature is only available for admin users");
                }
              }}
              title="Login (Admin Only)"
              style={{
                opacity: isAdmin ? 1 : 0.5,
                cursor: isAdmin ? "pointer" : "not-allowed",
              }}
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
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              {isMenuOpen && <span>🔑 Login {!isAdmin && "(Admin)"}</span>}
            </a>
          )}

          {/* Notification */}
          <a
            href="#notifications"
            className={`menu-item ${
              activeMenu === "notifications" ? "active" : ""
            } ${featuresLocked ? "locked" : ""}`}
            onClick={() => handleMenuClick("notifications")}
            title={featuresLocked ? "Complete profile first" : "Notifications"}
          >
            {featuresLocked && <span className="lock-badge">🔒</span>}
            <img
              src={notificationIcon}
              alt="Notification"
              className="notification-icon"
              style={{ width: "24px", height: "24px" }}
            />
            {isMenuOpen && <span>Notifications</span>}
          </a>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isAppInstalled && (
            <div className="menu-item app-installed" title="App Installed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {isMenuOpen && <span>✅ App Installed</span>}
            </div>
          )}

          {user?.is_impersonating && isAdmin && (
            <a
              href="#stop-impersonating"
              className="menu-item stop-impersonating"
              onClick={(e) => {
                e.preventDefault();
                handleStopImpersonating();
              }}
              title="Stop Impersonating"
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
                <path d="M9 3H5a2 2 0 0 0-2 2v4m11-6h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4m11 6h4a2 2 0 0 0 2-2v-4M9 9h6m-6 6h6"></path>
              </svg>
              {isMenuOpen && <span>↩️ Stop Impersonating</span>}
            </a>
          )}

          <a
            href="#profile"
            className={`menu-item ${activeMenu === "profile" ? "active" : ""}`}
            onClick={() => handleMenuClick("profile")}
            title="Profile"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {isMenuOpen && <span>Profile</span>}
          </a>

          <a
            href="#logout"
            className="menu-item logout"
            onClick={() => handleMenuClick("logout")}
            title="Logout"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {isMenuOpen && <span>Logout</span>}
          </a>

          {isMenuOpen && <div className="footer-links"></div>}
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
