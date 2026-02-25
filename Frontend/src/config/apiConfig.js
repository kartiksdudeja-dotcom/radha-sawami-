// Automatically detect API URL based on current host
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = 5000; // Backend port

    // Always use absolute URLs with protocol
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://localhost:${port}`;
    }

    // For mobile/network access, use the detected hostname
    return `http://${hostname}:${port}`;
  }
  return "http://localhost:5000"; // Fallback
};

export const API_BASE_URL = getApiUrl();

// Pre-defined API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  MEMBERS: `${API_BASE_URL}/api/members`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  SEVA: `${API_BASE_URL}/api/seva`,
  SEVA_MASTER: `${API_BASE_URL}/api/seva-master`,
  SUPERMAN_PHASES: `${API_BASE_URL}/api/superman-phases`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

// Debug logging
if (typeof window !== "undefined") {
  console.log("API Config:", {
    hostname: window.location.hostname,
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
  });
}
