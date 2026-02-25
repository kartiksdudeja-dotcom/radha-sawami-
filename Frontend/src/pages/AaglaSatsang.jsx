import React, { useState, useEffect } from "react";
import "../styles/AaglaSatsang.css";
import { API_BASE_URL } from "../config/apiConfig";

const AaglaSatsang = ({ onNavigate, user }) => {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    thisMonth: 0,
    lastSatsang: null,
  });

  useEffect(() => {
    fetchEventsAndAnnouncements();
    fetchAttendanceStats();
  }, []);

  const fetchEventsAndAnnouncements = async () => {
    try {
      setLoading(true);
      const userId =
        user?.id || JSON.parse(localStorage.getItem("user") || "{}").id;

      // Fetch notifications - events and announcements
      const response = await fetch(
        `${API_BASE_URL}/api/notifications?user_id=${userId || ""}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const result = await response.json();
        const notificationsList = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        // Separate events and announcements by type
        const eventsList = notificationsList.filter(
          (n) => n.type === "event" || n.message_type === "event",
        );
        const announcementsList = notificationsList.filter(
          (n) =>
            n.type === "announcement" ||
            n.message_type === "announcement" ||
            n.type === "general" ||
            n.message_type === "general" ||
            (!n.type && !n.message_type),
        );

        setEvents(eventsList.slice(0, 5)); // Show latest 5 events
        setAnnouncements(announcementsList.slice(0, 5)); // Show latest 5 announcements
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const userId =
        user?.id || JSON.parse(localStorage.getItem("user") || "{}").id;
      if (!userId) return;

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/member-stats/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAttendanceStats({
            total: result.data?.total || 0,
            thisMonth: result.data?.thisMonth || 0,
            lastSatsang: result.data?.lastSatsang || null,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    }
  };

  const handleCardClick = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="satsang-page-wrapper">
      {/* Premium Header */}
      <header className="satsang-header">
        <div className="header-content">
          <h1 className="header-title">आगला सत्संग</h1>
          <p className="header-subtitle">Radhasoami Satsang Dayalbagh</p>
        </div>
        <div className="header-glow"></div>
      </header>

      <main className="satsang-main-content">


        {/* Action Banners Section */}
        <section className="action-banners">
          <div className="banner-card store-banner" onClick={() => handleCardClick("store")}>
            <div className="banner-bg"></div>
            <div className="banner-content">
              <h3>सत्संग स्टोर</h3>
              <p>आध्यात्मिक पुस्तकें, ऑडियो और अन्य प्रामाणिक सामग्री प्राप्त करें।</p>
              <button className="banner-btn">अभी देखें</button>
            </div>
            <div className="banner-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>

          <div className="banner-card attendance-banner" onClick={() => handleCardClick("attendance")}>
            <div className="banner-bg"></div>
            <div className="banner-content">
              <h3>आपकी उपस्थिति</h3>
              <p>अपनी उपस्थिति दर्ज करें और अपनी उपस्थिति का विवरण देखें।</p>
              <button className="banner-btn">उपस्थिति देखें</button>
            </div>
            <div className="banner-icon">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="section-divider">
          <div className="section-divider-line"></div>
          <span className="section-divider-label">📋 सूचनाएं एवं कार्यक्रम</span>
          <div className="section-divider-line right"></div>
        </div>

        {/* Content Split: Events & Announcements */}
        <section className="content-split-section">
          {/* Upcoming Events */}
          <div className="content-panel">
            <div className="panel-header">
              <h3 className="panel-title">आगामी कार्यक्रम <span className="title-en">(Upcoming Events)</span></h3>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loader-container"><div className="loader"></div></div>
              ) : events.length > 0 ? (
                <div className="feed-list">
                  {events.slice(0, 3).map((event, index) => (
                    <div key={event.id || index} className="feed-item event-feed">
                      <div className="feed-date-badge">
                        <span className="date-main">{new Date(event.created_at || event.sent_at).getDate()}</span>
                        <span className="date-sub">{new Date(event.created_at || event.sent_at).toLocaleDateString("hi-IN", { month: "short" })}</span>
                      </div>
                      <div className="feed-content">
                        <h4 className="feed-title">{event.title || "सत्संग कार्यक्रम"}</h4>
                        <p className="feed-desc">{event.message || "कृपया समय पर पधारें।"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <span className="empty-icon">📅</span>
                  <p>कोई आगामी कार्यक्रम नहीं</p>
                  <small>No upcoming events at the moment.</small>
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="content-panel">
            <div className="panel-header">
              <h3 className="panel-title">घोषणाएं <span className="title-en">(Announcements)</span></h3>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loader-container"><div className="loader"></div></div>
              ) : announcements.length > 0 ? (
                <div className="feed-list">
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <div key={announcement.id || index} className="feed-item announcement-feed">
                      <div className="feed-indicator"></div>
                      <div className="feed-content">
                        <h4 className="feed-title">{announcement.title || "महत्वपूर्ण सूचना"}</h4>
                        <p className="feed-desc">{announcement.body || announcement.message || ""}</p>
                        <span className="feed-timestamp">{formatDate(announcement.created_at || announcement.sent_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <span className="empty-icon">📢</span>
                  <p>कोई नई घोषणा नहीं</p>
                  <small>No recent announcements available.</small>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="satsang-footer">
        <p>🙏 राधा स्वामी दयाल की दया राधा स्वामी सहाय 🙏</p>
      </footer>
    </div>
  );
};

export default AaglaSatsang;
