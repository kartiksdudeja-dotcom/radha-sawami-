import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import Navbar from '../components/Navbar';
import AaglaSatsang from './AaglaSatsang';
import Attendance from './Attendance';
import Members from './Members';
import Branch from './Branch';
import Seva from './Seva';
import Reports from './Reports';
import MemberMaster from './MemberMaster';
import Store from './Store';
import StoreAdmin from './StoreAdmin';
import Profile from './Profile';
import Notification from './Notification';
import SatsangOptions from './SatsangOptions';
import SevaOptions from './SevaOptions';
import SupermanPhase from './SupermanPhase';
import AdminMaster from './AdminMaster';
import SevaCategory from '../components/SevaCategory';
import SevaEntry from '../components/SevaEntry';
import { API_BASE_URL } from '../config/apiConfig';

const Dashboard = ({ onLogout, user }) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);

  console.log('Dashboard user:', user);
  console.log('User is_admin:', user?.is_admin);

  // Check profile completion status on mount
  useEffect(() => {
    checkProfileStatus();
  }, [user]);

  const checkProfileStatus = async () => {
    try {
      setCheckingProfile(true);
      const response = await fetch(`${API_BASE_URL}/api/profile/${user?.id}/status`);
      const result = await response.json();
      
      if (result.success) {
        setIsProfileComplete(result.is_profile_complete);
        // If profile is not complete, force user to profile page
        if (!result.is_profile_complete) {
          setActiveMenu('profile');
        }
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.is_profile_complete = result.is_profile_complete;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      // If check fails, assume profile is complete to not block user
      setIsProfileComplete(true);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleProfileComplete = (complete) => {
    setIsProfileComplete(complete);
    if (complete) {
      setActiveMenu('home');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleMenuClick = (menu) => {
    // If profile is not complete, only allow profile page
    if (!isProfileComplete && menu !== 'profile' && menu !== 'logout') {
      alert('⚠️ Please complete your profile first to access other features.');
      setActiveMenu('profile');
      return;
    }
    setActiveMenu(menu);
  };

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  const handleNavigateToEntry = (categoryId) => {
    setActiveMenu(`seva-entry-${categoryId}`);
  };

  // Handle navigation from AaglaSatsang cards
  const handleNavigate = (page) => {
    setActiveMenu(page);
  };

  // Render different content based on active menu
  const renderContent = () => {
    // Show Home page (Aagla Satsang) - Default page
    if (activeMenu === 'home' || activeMenu === 'dashboard') {
      return <AaglaSatsang onNavigate={handleNavigate} user={user} />;
    }

    // Show Store page
    if (activeMenu === 'store') {
      return <Store />;
    }

    // Show Store Admin page (admin or store power)
    if (activeMenu === 'store-admin') {
      if (!user?.is_admin && !user?.can_manage_store) {
        setActiveMenu('home');
        return null;
      }
      return <StoreAdmin />;
    }

    // Show Attendance page
    if (activeMenu === 'attendance') {
      return <Attendance user={user} />;
    }

    // Show Branch page
    if (activeMenu === 'branch') {
      return <Branch />;
    }

    // Show Members page
    if (activeMenu === 'members') {
      return <Members />;
    }

    // Show Member Master page (admin only)
    if (activeMenu === 'member-master') {
      if (!user?.is_admin) {
        setActiveMenu('home');
        return null;
      }
      try {
        return <MemberMaster />;
      } catch (error) {
        console.error('Error loading Member Master:', error);
        return <div className="error-message">Error loading Member Master: {error.message}</div>;
      }
    }

    // Show Satsang Options page (admin only)
    if (activeMenu === 'satsang-options') {
      if (!user?.is_admin) {
        setActiveMenu('home');
        return null;
      }
      return <SatsangOptions />;
    }

    // Show Seva Options page (admin only)
    if (activeMenu === 'seva-options') {
      if (!user?.is_admin) {
        setActiveMenu('home');
        return null;
      }
      return <SevaOptions />;
    }

    // Show Superman Phase page (admin only)
    if (activeMenu === 'superman-phase') {
      if (!user?.is_admin) {
        setActiveMenu('home');
        return null;
      }
      return <SupermanPhase />;
    }

    // Show Admin Master page (admin only)
    if (activeMenu === 'admin-master') {
      if (!user?.is_admin) {
        setActiveMenu('home');
        return null;
      }
      return <AdminMaster user={user} />;
    }

    // Show Reports page
    if (activeMenu === 'reports') {
      return <Reports />;
    }

    // Show Attendance Report page
    if (activeMenu === 'report-attendance') {
      return <Reports initialReport="attendance" />;
    }

    // Show Seva Report page
    if (activeMenu === 'report-seva') {
      return <Reports initialReport="seva" />;
    }

    // Show Seva page (accessible from home cards, not navbar)
    if (activeMenu === 'seva') {
      return <Seva />;
    }

    // Show Profile page
    if (activeMenu === 'profile') {
      return <Profile user={user} onProfileComplete={handleProfileComplete} />;
    }

    // Show Notifications page
    if (activeMenu === 'notifications') {
      return <Notification onNavigate={handleNavigate} />;
    }

    // Show Seva Category pages
    if (activeMenu.startsWith('seva-') && !activeMenu.startsWith('seva-entry-')) {
      return <SevaCategory categoryId={activeMenu} onNavigateToEntry={handleNavigateToEntry} />;
    }

    // Show Seva Entry pages
    if (activeMenu.startsWith('seva-entry-')) {
      const categoryId = 'seva-' + activeMenu.replace('seva-entry-', '');
      return <SevaEntry categoryId={categoryId} />;
    }

    // Default - show home page
    return <AaglaSatsang onNavigate={handleNavigate} user={user} />;
  };

  return (
    <div className="dashboard-wrapper">
      {/* Navbar always visible with sidebar */}
      <Navbar 
        onLogout={handleLogout} 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick} 
        user={user} 
        onSidebarToggle={handleSidebarToggle}
        isProfileComplete={isProfileComplete}
      />
      
      <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${activeMenu === 'home' || activeMenu === 'dashboard' ? 'aagla-satsang-active' : ''}`}>
        {checkingProfile ? (
          <div className="profile-checking">
            <div className="loading-spinner"></div>
            <p>Checking profile status...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
