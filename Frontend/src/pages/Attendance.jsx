import React, { useState, useEffect, useMemo, useRef } from "react";
import "../styles/Attendance.css";
import { API_ENDPOINTS } from "../config/apiConfig";

const MEMBERS_API = API_ENDPOINTS.MEMBERS;
const ATTENDANCE_API = API_ENDPOINTS.ATTENDANCE;
const SEVA_API = API_ENDPOINTS.SEVA;

// ✅ Bug Fix: Function moved to top (before component)
const getShiftFromHour = (hour) => {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Evening";
  return "Night";
};

const Attendance = ({ user }) => {
  // Get user from prop or localStorage
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser?.is_admin === true || currentUser?.can_manage_attendance === true;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [selectedShift, setSelectedShift] = useState(() =>
    getShiftFromHour(new Date().getHours())
  );
const [selectedMemberCost, setSelectedMemberCost] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submittedRecords, setSubmittedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("attendance"); // "attendance" or "seva"

  // ✅ Bug Fix: Replaced window.alert with inline toast messages
  const [toast, setToast] = useState({ show: false, type: "", msg: "" });
  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: "", msg: "" }), 3500);
  };

  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [filterMember, setFilterMember] = useState("all");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('satsangCategories');
    return saved ? JSON.parse(saved) : [
      "Video Satsang (DB/MPG)",
      "Branch Satsang",
      "Audio Satsang",
    ];
  });

  const [statCategories] = useState(() => {
    const saved = localStorage.getItem("statCategories");
    return saved
      ? JSON.parse(saved)
      : ["Initiated", "Jigyasu", "Children", "Phase 1", "Phase 2", "PRIMARY 1", "PRIMARY 2"];
  });

  const [selectedMemberCategory, setSelectedMemberCategory] = useState({});
  const [selectedMemberStatCategory, setSelectedMemberStatCategory] = useState({});
  const [selectedMemberSevaTask, setSelectedMemberSevaTask] = useState({});
  const [selectedMemberHours, setSelectedMemberHours] = useState({});
  const [currentCategory, setCurrentCategory] = useState("");
  const [viewType, setViewType] = useState("list"); // 'list' or 'calendar'
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const hourOptions = ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "4.0", "5.0", "6.0", "8.0", "12.0"];
  const costOptions = ["0", "10", "20", "50", "100", "200", "500", "1000"];

  const [sevaMasterData, setSevaMasterData] = useState([]);

  const sevaCategories = useMemo(() => {
    const uniqueCats = [...new Set(sevaMasterData.map(item => item.Category))];
    return uniqueCats.map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '_'),
      name: cat
    }));
  }, [sevaMasterData]);

  const sevaItemsByCategory = useMemo(() => {
    const mapping = {};
    sevaMasterData.forEach(item => {
      const catId = item.Category.toLowerCase().replace(/\s+/g, '_');
      if (!mapping[catId]) mapping[catId] = [];
      mapping[catId].push(item.SevaName);
    });
    return mapping;
  }, [sevaMasterData]);

  const [postAttendanceMembers, setPostAttendanceMembers] = useState([]);
  const [showSevaStep, setShowSevaStep] = useState(false);
  const [sevaEntries, setSevaEntries] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const searchAreaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(event.target)) {
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchAttendanceRecords();
    fetchSevaMasterData();
  }, []);

  const fetchSevaMasterData = async () => {
    if (!API_ENDPOINTS.SEVA_MASTER) return;
    try {
      const response = await fetch(API_ENDPOINTS.SEVA_MASTER);
      const result = await response.json();
      if (result.success) {
        setSevaMasterData(result.data);
      }
    } catch (err) {
      console.error("Error fetching seva master data:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (filterDate) fetchAttendanceRecordsForDate(filterDate);
  }, [filterDate, viewMode, filterMember]);

  useEffect(() => {
    setCurrentPage(1);
    // Only auto-sync filterDate when selectedDate changes from the top form
    if (selectedDate !== filterDate) {
      setFilterDate(selectedDate);
    }
  }, [filterMember, selectedDate, viewMode]);

  const fetchMonthlyRecords = async (monthDate) => {
    setLoadingMonthly(true);
    try {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const memberFilter = (filterMember && filterMember !== "all") 
        ? `&memberId=${filterMember}` 
        : (isAdmin ? "" : ""); // For non-admins, leave blank to get all (frontend will filter to family)
      
      const endpoint = viewMode === 'attendance' 
        ? `${ATTENDANCE_API}/by-date?fromDate=${firstDay}&toDate=${lastDayStr}${memberFilter}`
        : `${SEVA_API}/report?fromDate=${firstDay}&toDate=${lastDayStr}${memberFilter}`;
        
      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        // Group raw records by date for calendar display
        const grouped = {};
        
        // Scope to family for non-admins when 'all' is selected
        let dataToProcess = result.data;
        if (!isAdmin && filterMember === "all") {
          const familyIds = members.map(m => String(m.id));
          dataToProcess = result.data.filter(rec => {
            const memberId = rec.member_id || rec.UserID;
            return familyIds.includes(String(memberId));
          });
        }

        dataToProcess.forEach(rec => {
          const d = rec.date || rec.SevaDate || rec.Attendance_date;
          // Standardize date to YYYY-MM-DD for easier mapping
          let standardDate = "";
          const dateStr = String(d || "");
          
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Handle DD/MM/YYYY
              standardDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          } else if (dateStr.includes('-')) {
            standardDate = dateStr.split('T')[0];
          } else if (d instanceof Date) {
            standardDate = d.toISOString().split('T')[0];
          }
          
          if (!grouped[standardDate]) grouped[standardDate] = [];
          grouped[standardDate].push({
            ...rec,
            name: rec.name || rec.memberName || "Unknown",
            shift: rec.shift || "Day",
            category: rec.category || rec.seva_name || "Seva"
          });
        });
        setMonthlyRecords(grouped);
      }
    } catch (err) {
      console.error("Error fetching monthly records:", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    if (viewType === 'calendar') {
      fetchMonthlyRecords(calendarMonth);
    }
  }, [viewType, calendarMonth, viewMode, filterMember]);

  const monthDisplay = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Non-admin users: fetch only their family members
      // Admin users: fetch all members
      let url = MEMBERS_API;
      if (!isAdmin && currentUser?.id) {
        url = `${MEMBERS_API}/family/${currentUser.id}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      } else {
        showToast("error", "Members load karne mein error: " + (result.error || "Unknown"));
      }
    } catch {
      showToast("error", "Backend se connect nahi ho pa raha. Check karo ki server chal raha hai.");
    } finally {
      setLoading(false);
    }
  };

  const buildIndividualRecords = (data) => {
    if (!data || data.length === 0) return [];
    
    return (data || []).map((record) => {
      // Standardize date/time format for display
      const displayDate = record.date || record.Attendance_date || record.SevaDate || "";
      const displayTime = record.time || record.PresentTime || (record.hours ? `${record.hours} hrs` : "09:00:00");
      
      // Combine category and seva name
      let categoryDisplay = record.category || record.Audio_Satsang || record.SevaCategory || "Satsang";
      if (record.seva_name || record.SevaName) {
        // Only append if not already in category string
        const namePart = record.seva_name || record.SevaName;
        if (!categoryDisplay.toLowerCase().includes(namePart.toLowerCase())) {
          categoryDisplay += `: ${namePart}`;
        }
      }

      return {
        id: record.id || record.Attendance_Id || record.SevaId,
        date: displayDate,
        shift: record.shift || record.Shift || "Day", 
        category: categoryDisplay,
        time: displayTime,
        hours: record.hours || 0,
        cost: record.cost || 0,
        members: [
          {
            id: record.member_id || record.UserID,
            name: record.memberName || record.name || record.Name || "Unknown",
            gender: record.gender || record.Gender,
            status: record.status || record.Status || record.stat_category || "-",
          },
        ],
      };
    });
  };

  const fetchAttendanceRecords = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await fetchAttendanceRecordsForDate(today);
    } catch {
      console.error("Failed to fetch initial records");
    }
  };

  const fetchAttendanceRecordsForDate = async (date) => {
    setLoadingRecords(true);
    try {
      const memberIdFilterValue = (filterMember && filterMember !== "all") 
        ? filterMember 
        : (isAdmin ? "" : ""); // Let backend return all, frontend filters for family
      
      const memberFilter = memberIdFilterValue ? `&memberId=${memberIdFilterValue}` : "";
      
      const url = viewMode === "attendance"
        ? `${ATTENDANCE_API.replace("/attendance", "/attendance/by-date")}?fromDate=${date}&toDate=${date}${memberFilter}`
        : `${SEVA_API}/report?fromDate=${date}&toDate=${date}${memberFilter}`;
        
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setSubmittedRecords(buildIndividualRecords(result.data));
        setCurrentPage(1);
      } else {
        setSubmittedRecords([]);
      }
    } catch {
      setSubmittedRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredMembersForForm = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const lower = debouncedSearchTerm.toLowerCase();
    return members.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(lower)) ||
        (m.number && m.number.includes(debouncedSearchTerm)) ||
        (m.username && m.username.toLowerCase().includes(lower))
    );
  }, [members, debouncedSearchTerm]);

  const allFilteredSelected = useMemo(() => {
    if (filteredMembersForForm.length === 0) return false;
    return filteredMembersForForm.every((fm) =>
      selectedMembers.some((sm) => sm.id === fm.id)
    );
  }, [filteredMembersForForm, selectedMembers]);

  const filteredRecords = submittedRecords.filter((record) => {
    // 1. If explicit member filter is active
    if (filterMember !== "all") {
      return record.members.some((m) => String(m.id) === String(filterMember));
    }

    // 2. If 'all' (Family History) for non-admins - scope to their family
    if (!isAdmin) {
      const familyIds = members.map(m => String(m.id));
      return record.members.some(m => familyIds.includes(String(m.id)));
    }
    
    // 3. For Admins with 'all' selection
    return true;
  });

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredRecords.slice(start, start + recordsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const toggleMemberSelection = (member) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);
    if (isSelected) {
      removeMemberFromAttendance(member.id);
    } else {
      addMemberToAttendance(member);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const toAdd = filteredMembersForForm.filter(
        (fm) => !selectedMembers.some((sm) => sm.id === fm.id)
      );
      const newSelected = [...selectedMembers];
      const newCats = { ...selectedMemberCategory };
      const newStatCats = { ...selectedMemberStatCategory };
      
      toAdd.forEach((member) => {
        const defaultCat = currentCategory || (viewMode === 'attendance' ? categories[0] : (sevaCategories[0]?.name || ""));
        newSelected.push({ ...member, category: defaultCat });
        newCats[member.id] = defaultCat;
        newStatCats[member.id] = statCategories[0];
        if (viewMode === 'seva') {
          const catObj = sevaCategories.find(c => c.name === defaultCat);
          const defaultTask = catObj ? (sevaItemsByCategory[catObj.id] || [""])[0] : "";
          setSelectedMemberSevaTask(prev => ({ ...prev, [member.id]: defaultTask }));
          setSelectedMemberHours(prev => ({ ...prev, [member.id]: "1.0" }));
          setSelectedMemberCost(prev => ({ ...prev, [member.id]: "0" }));
        }
      });
      setSelectedMembers(newSelected);
      setSelectedMemberCategory(newCats);
      setSelectedMemberStatCategory(newStatCats);
    } else {
      const filteredIds = filteredMembersForForm.map((m) => m.id);
      setSelectedMembers((prev) => prev.filter((m) => !filteredIds.includes(m.id)));
      const newCats = { ...selectedMemberCategory };
      const newStatCats = { ...selectedMemberStatCategory };
      filteredIds.forEach((id) => { delete newCats[id]; delete newStatCats[id]; });
      setSelectedMemberCategory(newCats);
      setSelectedMemberStatCategory(newStatCats);
    }
  };

  const addMemberToAttendance = (member) => {
    if (!selectedMembers.some((m) => m.id === member.id)) {
      const defaultCat = currentCategory || (viewMode === 'attendance' ? categories[0] : (sevaCategories[0]?.name || ""));
      setSelectedMembers([...selectedMembers, { ...member, category: defaultCat }]);
      setSelectedMemberCategory({ ...selectedMemberCategory, [member.id]: defaultCat });
      setSelectedMemberStatCategory({ ...selectedMemberStatCategory, [member.id]: statCategories[0] });
      
      if (viewMode === 'seva') {
        const catObj = sevaCategories.find(c => c.name === defaultCat);
        const defaultTask = catObj ? (sevaItemsByCategory[catObj.id] || [""])[0] : "";
        setSelectedMemberSevaTask(prev => ({ ...prev, [member.id]: defaultTask }));
        setSelectedMemberHours(prev => ({ ...prev, [member.id]: "1.0" }));
        setSelectedMemberCost(prev => ({ ...prev, [member.id]: "0" }));
      }
    }
  };

  const removeMemberFromAttendance = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
    const newCats = { ...selectedMemberCategory };
    const newStatCats = { ...selectedMemberStatCategory };
    delete newCats[memberId];
    delete newStatCats[memberId];
    setSelectedMemberCategory(newCats);
    setSelectedMemberStatCategory(newStatCats);
  };

  const updateMemberCategory = (memberId, category) => {
    setSelectedMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, category } : m)));
    setSelectedMemberCategory((prev) => ({ ...prev, [memberId]: category }));
    setCurrentCategory(category);
  };

  const handleBulkCategoryUpdate = (category) => {
    if (!category) return;
    const newCats = {};
    const newTaskMap = {};
    const catObj = viewMode === 'seva' ? sevaCategories.find(c => c.name === category) : null;
    const firstTask = catObj ? (sevaItemsByCategory[catObj.id] || [""])[0] : "";

    selectedMembers.forEach((m) => {
      newCats[m.id] = category;
      if (viewMode === 'seva') {
        newTaskMap[m.id] = firstTask;
      }
    });

    setSelectedMembers((prev) => prev.map((m) => ({ ...m, category })));
    setSelectedMemberCategory((prev) => ({ ...prev, ...newCats }));
    setCurrentCategory(category);
    if (viewMode === 'seva') {
      setSelectedMemberSevaTask(prev => ({ ...prev, ...newTaskMap }));
    }
  };

  const handleBulkSevaTaskUpdate = (task) => {
    if (!task) return;
    const newTaskMap = {};
    selectedMembers.forEach(m => { newTaskMap[m.id] = task; });
    setSelectedMemberSevaTask(prev => ({ ...prev, ...newTaskMap }));
  };

  const handleBulkHoursUpdate = (hours) => {
    if (!hours) return;
    const newHoursMap = {};
    selectedMembers.forEach(m => { newHoursMap[m.id] = hours; });
    setSelectedMemberHours(prev => ({ ...prev, ...newHoursMap }));
  };

  const handleBulkCostUpdate = (cost) => {
    if (!cost) return;
    const newCostMap = {};
    selectedMembers.forEach(m => { newCostMap[m.id] = cost; });
    setSelectedMemberCost(prev => ({ ...prev, ...newCostMap }));
  };

  const handleSevaEntryChange = (memberId, field, value) => {
    setSevaEntries((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || { category: "", item: "", hours: "" }), [field]: value },
    }));
  };

  const submitPostAttendanceSeva = async () => {
    setLoading(true);
    try {
      const entriesToSubmit = Object.entries(sevaEntries).filter(
        ([, data]) => data.category && data.item && data.hours && parseFloat(data.hours) > 0
      );
      for (const [memberId, data] of entriesToSubmit) {
        const catObj = sevaCategories.find((c) => c.id === data.category);
        await fetch(SEVA_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member_id: memberId,
            category: catObj ? catObj.name : data.category,
            seva_name: data.item,
            hours: parseFloat(data.hours),
            cost: parseFloat(data.cost || "0"),
            date: selectedDate,
          }),
        });
      }
      setShowSevaStep(false);
      setSevaEntries({});
      setPostAttendanceMembers([]);
      showToast("success", "✅ Attendance aur Seva records save ho gaye!");
      
      // Auto-switch history to the date of submission to show results
      if (filterDate !== selectedDate) {
        setFilterDate(selectedDate);
      } else {
        fetchAttendanceRecordsForDate(selectedDate);
      }
    } catch {
      showToast("error", "⚠️ Kuch seva records save nahi hue. Attendance pehle se save hai.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      setSubmitError("Kam se kam ek member select karo.");
      return;
    }
    try {
      setLoading(true);
      setSubmitError("");
      setShowSuccess(false);

      const membersWithCategories = selectedMembers.map((member) => ({
        id: member.id,
        name: member.name,
        number: member.number,
        username: member.username,
        category: selectedMemberCategory[member.id] || categories[0],
        stat_category: selectedMemberStatCategory[member.id] || statCategories[0],
      }));

      const response = await fetch(ATTENDANCE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          shift: selectedShift,
          members: membersWithCategories,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPostAttendanceMembers([...selectedMembers]);
        setShowSuccess(true);
        setSelectedMembers([]);
        setSelectedMemberCategory({});
        setSelectedMemberStatCategory({});
        setSearchTerm("");
        
        // Auto-switch history to the date of submission to show results
        if (filterDate !== selectedDate) {
          setFilterDate(selectedDate);
        } else {
          fetchAttendanceRecordsForDate(selectedDate);
        }
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 1500);
      } else {
        setSubmitError(result.message || "Attendance submit karne mein error aaya.");
      }
    } catch {
      setSubmitError("Server error. Connection check karo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Kya aap ye record delete karna chahte hain?`)) return;
    try {
      setLoading(true);
      const endpoint = viewMode === "attendance" ? ATTENDANCE_API : SEVA_API;
      
      const recordId = record.id;
      const response = await fetch(`${endpoint}/${recordId}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        showToast("success", "Record delete ho gaya!");
        fetchAttendanceRecordsForDate(filterDate);
      } else {
        showToast("error", "Error: " + result.message);
      }
      
      fetchAttendanceRecordsForDate(filterDate);
    } catch {
      showToast("error", "Record delete nahi hua. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record) => {
    // Inline edit not implemented yet — show toast
    showToast("info", "Edit feature coming soon!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    if (dateString.includes("-")) {
      const datePart = dateString.split("T")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes("T")) return timeString.split("T")[1].substring(0, 5);
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="attendance-page">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`att-toast att-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Page Header */}
      <div className="attendance-header">
        <div className="header-main-row">
          <h1>
            उपस्थिति <span className="month">— {monthDisplay}</span>
          </h1>
          <div className="mode-switcher">
            <button 
              className={`mode-tab ${viewMode === 'attendance' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('attendance');
                setSelectedMembers([]);
                setSearchTerm("");
              }}
            >
              Satsang Attendance
            </button>
            <button 
              className={`mode-tab ${viewMode === 'seva' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('seva');
                setSelectedMembers([]);
                setSearchTerm("");
              }}
            >
              Seva Attendance
            </button>
          </div>
        </div>
        <p className="att-subtitle">
          {viewMode === 'attendance' 
            ? "Members ki satsang attendance darj karein" 
            : "Members ki seva entry darj karein"}
        </p>
      </div>

      {/* Form Card */}
      <div className="attendance-card">

        {/* Date / Time / Shift — Compact Row */}
        <div className="controls-row">
          <div className="control-group">
            <label>📅 Tarikh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="control-group">
            <label>🕐 Samay</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(e.target.value);
                setSelectedShift(getShiftFromHour(parseInt(e.target.value.split(":")[0])));
              }}
              className="input-field"
            />
          </div>
          <div className="control-group">
            <label>🌅 Shift</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="input-field select-field"
            >
              <option value="">Shift Chunein</option>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </div>
          <div className="control-group">
            <label>📂 Sabka Category</label>
            <select
              value={currentCategory}
              onChange={(e) => handleBulkCategoryUpdate(e.target.value)}
              className="input-field select-field"
            >
              <option value="" disabled>Category Chunein...</option>
              {viewMode === 'attendance' 
                ? categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)
                : sevaCategories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)
              }
            </select>
          </div>
        </div>

        {/* Search Area — compact, no empty space */}
        <div className="selection-area" ref={searchAreaRef}>
          <div className="search-box">
            <div className="search-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Sabhi members mein dhoondhein..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          {/* Dropdown results — appears only when typing */}
          {debouncedSearchTerm && (
            <div className="search-results-overlay">
              <div className="results-header">
                <span className="results-count">{filteredMembersForForm.length} results</span>
                <button
                  className="btn-tiny"
                  onClick={() => handleSelectAll(!allFilteredSelected)}
                >
                  {allFilteredSelected ? "Sab Hatao" : "Sab Chunein"}
                </button>
              </div>
              {loading ? (
                <div className="status-msg">Dhoondh raha hai...</div>
              ) : filteredMembersForForm.length > 0 ? (
                <div className="results-list">
                  {filteredMembersForForm.map((member) => {
                    const isSelected = selectedMembers.some((m) => m.id === member.id);
                    return (
                      <div
                        key={member.id}
                        className={`result-row ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleMemberSelection(member)}
                      >
                        <div className="member-details">
                          <span className="name">{member.name}</span>
                          <span className="metadata">{member.number} • {member.username}</span>
                        </div>
                        <div className={`custom-checkbox ${isSelected ? "checked" : ""}`}>
                          {isSelected && "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="status-msg">"{debouncedSearchTerm}" naam ka koi member nahi mila</div>
              )}
            </div>
          )}
        </div>

        {/* Selected Members — shown compactly right below search */}
        {selectedMembers.length > 0 && (
          <div className="selected-section">
            <div className="section-header">
              <div className="section-header-left">
                <h3>✅ Selected Members ({selectedMembers.length})</h3>
                <div className="bulk-actions">
                  <select
                    onChange={(e) => handleBulkCategoryUpdate(e.target.value)}
                    className="bulk-select"
                    defaultValue=""
                  >
                    <option value="" disabled>Sabka Category...</option>
                    {viewMode === 'attendance' 
                      ? categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)
                      : sevaCategories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)
                    }
                  </select>

                  {viewMode === 'seva' && (
                    <>
                      <select
                        onChange={(e) => handleBulkSevaTaskUpdate(e.target.value)}
                        className="bulk-select"
                        defaultValue=""
                      >
                        <option value="" disabled>Sabka Task...</option>
                        {/* Note: This bulk task list is a bit tricky if categories are different, 
                            but usually users pick one category first. 
                            We'll show items for the first member's category or just a general list if possible.
                            For simplicity, if we have a current bulk category, use it. */}
                        {selectedMembers.length > 0 && selectedMemberCategory[selectedMembers[0].id] &&
                          sevaItemsByCategory[sevaCategories.find(c => c.name === selectedMemberCategory[selectedMembers[0].id])?.id]?.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))
                        }
                      </select>
                      <select
                        onChange={(e) => handleBulkHoursUpdate(e.target.value)}
                        className="bulk-select compact"
                        defaultValue=""
                      >
                        <option value="" disabled>Hrs</option>
                        {hourOptions.map(h => <option key={h} value={h}>{h}hr</option>)}
                      </select>
                      <select
                        onChange={(e) => handleBulkCostUpdate(e.target.value)}
                        className="bulk-select compact"
                        defaultValue=""
                      >
                        <option value="" disabled>Cost</option>
                        {costOptions.map(c => <option key={c} value={c}>₹{c}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>
              <button
                className="btn-text"
                onClick={() => {
                  setSelectedMembers([]);
                  setSelectedMemberCategory({});
                  setSelectedMemberStatCategory({});
                }}
              >
                Sab Hatao
              </button>
            </div>
            <div className="selected-grid">
              {selectedMembers.map((member) => (
                <div key={member.id} className="selected-member-card">
                  <div className="member-basic">
                    <span className="name">{member.name}</span>
                    <button className="btn-remove" onClick={() => removeMemberFromAttendance(member.id)}>✕</button>
                  </div>
                  <div className="member-configs">
                    {viewMode === 'attendance' ? (
                      <>
                        <select
                          value={selectedMemberCategory[member.id] || categories[0]}
                          onChange={(e) => updateMemberCategory(member.id, e.target.value)}
                          className="mini-select"
                        >
                          {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                        </select>
                        <select
                          value={selectedMemberStatCategory[member.id] || statCategories[0]}
                          onChange={(e) =>
                            setSelectedMemberStatCategory({ ...selectedMemberStatCategory, [member.id]: e.target.value })
                          }
                          className="mini-select"
                        >
                          {statCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                        </select>
                      </>
                    ) : (
                      <div className="seva-card-options">
                        <select
                          value={selectedMemberCategory[member.id] || (sevaCategories[0]?.name || "")}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            updateMemberCategory(member.id, newCat);
                            const catObj = sevaCategories.find(c => c.name === newCat);
                            const firstTask = catObj ? (sevaItemsByCategory[catObj.id] || [""])[0] : "";
                            setSelectedMemberSevaTask(prev => ({ ...prev, [member.id]: firstTask }));
                          }}
                          className="mini-select"
                        >
                          {sevaCategories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <select
                          value={selectedMemberSevaTask[member.id] || ""}
                          onChange={(e) => setSelectedMemberSevaTask({ ...selectedMemberSevaTask, [member.id]: e.target.value })}
                          className="mini-select"
                        >
                          <option value="">-- Task --</option>
                          {selectedMemberCategory[member.id] &&
                            sevaItemsByCategory[sevaCategories.find(c => c.name === selectedMemberCategory[member.id])?.id]?.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))
                          }
                        </select>
                        <select
                          value={selectedMemberHours[member.id] || "1.0"}
                          onChange={(e) => setSelectedMemberHours({ ...selectedMemberHours, [member.id]: e.target.value })}
                          className="mini-select compact"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}hr</option>)}
                        </select>
                        <select
                          value={selectedMemberCost[member.id] || "0"}
                          onChange={(e) => setSelectedMemberCost({ ...selectedMemberCost, [member.id]: e.target.value })}
                          className="mini-select compact"
                        >
                          {costOptions.map(c => <option key={c} value={c}>₹{c}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {showSuccess && <div className="alert-success">✅ Attendance successfully submit ho gayi!</div>}
        {submitError && <div className="alert-error">⚠️ {submitError}</div>}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            className={`btn-primary${loading ? " loading" : ""}`}
            onClick={viewMode === 'attendance' ? handleSubmit : async () => {
              if (selectedMembers.length === 0) {
                setSubmitError("Kam se kam ek member select karo.");
                return;
              }
              try {
                setLoading(true);
                setSubmitError("");

                for (const member of selectedMembers) {
                  const catName = selectedMemberCategory[member.id] || (sevaCategories[0]?.name || "");
                  const taskName = selectedMemberSevaTask[member.id] || "";
                  const hours = parseFloat(selectedMemberHours[member.id] || "1.0");
                  const cost = parseFloat(selectedMemberCost[member.id] || "0");

                  await fetch(SEVA_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      member_id: member.id,
                      category: catName,
                      seva_name: taskName,
                      hours,
                      cost,
                      date: selectedDate,
                    }),
                  });
                }

                // Clear form
                setSelectedMembers([]);
                setSelectedMemberCategory({});
                setSelectedMemberStatCategory({});
                setSelectedMemberSevaTask({});
                setSelectedMemberHours({});
                setSelectedMemberCost({});
                setSearchTerm("");

                showToast("success", "✅ Seva records save ho gaye!");

                // Refresh history
                if (filterDate !== selectedDate) {
                  setFilterDate(selectedDate);
                } else {
                  fetchAttendanceRecordsForDate(selectedDate);
                }
              } catch {
                showToast("error", "⚠️ Seva records save nahi hue. Dobara try karo.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={selectedMembers.length === 0 || loading}
          >
            {loading
              ? "Submit ho raha hai..."
              : selectedMembers.length === 0
              ? "Pehle member chunein"
              : viewMode === 'attendance'
                ? `${selectedMembers.length} Members ki Attendance Submit Karo`
                : `${selectedMembers.length} Members ki Seva Darj Karo`}
          </button>
        </div>
      </div>

      {/* History Section — Visible for Everyone, but filtered */}
      <div className="history-section">
        <div className="history-header">
            <div className="history-header-left">
              <h2>📅 {viewMode === 'attendance' ? "Attendance" : "Seva"} History</h2>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                  onClick={() => setViewType('list')}
                >
                  List
                </button>
                <button 
                  className={`toggle-btn ${viewType === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewType('calendar')}
                >
                  Calendar
                </button>
              </div>
            </div>
            
            {viewType === 'list' && (
              <div className="history-filters">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="filter-input"
                />
                <select
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="filter-input"
                >
                  <option value="all">{isAdmin ? "Sabhi Members" : "Meri Family History"}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUser?.id ? "(Main)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {viewType === 'calendar' && (
              <div className="calendar-nav">
                <button 
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="nav-btn"
                >
                  &larr; Prev
                </button>
                <span className="month-year">
                  {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="nav-btn"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {viewType === 'list' ? (
            loadingRecords ? (
              <div className="loading-state">Loading history...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-history">
                <span style={{ fontSize: "2rem" }}>📭</span>
                <p>Is date ke liye koi record nahi mila.</p>
              </div>
            ) : (
              <>
                <div className="records-grid-new">
                  {paginatedRecords.map((record) => (
                    <div key={record.id} className="history-card-new">
                      <div className="card-accent-line"></div>
                      <div className="card-header-new">
                        <div className="card-time-box">
                          <span className="time-val">{formatTime(record.time)}</span>
                          <span className="date-val">&nbsp;{formatDate(record.date)}</span>
                        </div>
                        <div className={`shift-badge-fancy ${record.shift?.toLowerCase()}`}>
                          {record.shift}
                        </div>
                      </div>
                      
                      <div className="card-body-new">
                        <div className="activity-row">
                          <span className="activity-icon">{viewMode === 'attendance' ? '📺' : '🤝'}</span>
                          <span className="activity-text">
                            {record.category}
                          </span>
                          {viewMode === 'seva' && (
                            <div className="seva-meta-pills" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                              <span className="pill-small" style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #c7d2fe' }}>
                                ⏱️ {record.hours} hr
                              </span>
                              {record.cost > 0 && (
                                <span className="pill-small" style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #bbf7d0' }}>
                                  💰 ₹{record.cost}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="members-row-new">
                          {record.members?.map((m) => (
                            <div key={m.id || m.member_id} className="member-pill-new" style={{ paddingRight: '12px' }}>
                              <span className="member-avatar">{m.name?.charAt(0) || "U"}</span>
                              <div className="member-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="member-name-text" style={{ fontWeight: '700' }}>{m.name}</span>
                                <span className="member-subtext" style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="card-footer-new">
                          <button className="action-btn-new edit" onClick={() => handleEditRecord(record)}>
                            <span>✎</span> Edit
                          </button>
                          <button className="action-btn-new delete" onClick={() => handleDeleteRecord(record)}>
                            <span>🗑</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>← Pehla</button>
                    <span>{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Agla →</button>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="calendar-grid-container">
              {loadingMonthly ? (
                <div className="loading-state">Loading Calendar...</div>
              ) : (
                <div className="calendar-grid">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="calendar-day-header">{day}</div>
                  ))}
                  {(() => {
                    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                    const firstDayIdx = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
                    const days = [];
                    
                    // Add empty cells for previous month
                    for (let i = 0; i < firstDayIdx; i++) {
                      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
                    }
                    
                    // Add cells for current month
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dateKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const dayRecords = monthlyRecords[dateKey] || [];
                      const isToday = new Date().toDateString() === new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d).toDateString();
                      
                      // Build unique member names for this day
                      const dayMemberNames = [];
                      const seenNames = new Set();
                      dayRecords.forEach(r => {
                        const mName = r.name || r.memberName || (r.members?.[0]?.name) || "";
                        if (mName && !seenNames.has(mName)) {
                          seenNames.add(mName);
                          dayMemberNames.push({ name: mName, shift: r.shift });
                        }
                      });

                      // Color palette for member initials
                      const memberColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

                      days.push(
                        <div key={d} className={`calendar-day ${isToday ? 'today' : ''} ${dayRecords.length > 0 ? 'has-data' : ''}`}>
                          <span className="day-number">{d}</span>
                          
                          {/* Member initial badges instead of plain dots */}
                          <div className="day-member-badges">
                            {dayMemberNames.slice(0, 3).map((m, i) => {
                              const initials = m.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                              return (
                                <div
                                  key={i}
                                  className="member-initial-badge"
                                  style={{ background: memberColors[i % memberColors.length] }}
                                  title={`${m.name} - ${m.shift}`}
                                >
                                  {initials}
                                </div>
                              );
                            })}
                            {dayMemberNames.length > 3 && (
                              <div className="member-initial-badge member-badge-more" title={`${dayMemberNames.length - 3} more`}>
                                +{dayMemberNames.length - 3}
                              </div>
                            )}
                          </div>

                          {/* Enhanced popover with member details */}
                          {dayRecords.length > 0 && (
                            <div className="day-popover">
                              <div className="popover-title">{formatDate(dateKey)}</div>
                              {dayRecords.map((r, i) => {
                                const mName = r.name || r.memberName || (r.members?.[0]?.name) || "Unknown";
                                return (
                                  <div key={i} className="popover-member-row">
                                    <span className="popover-avatar" style={{ background: memberColors[i % memberColors.length] }}>
                                      {mName.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="popover-member-info">
                                      <span className="popover-member-name">{mName}</span>
                                      <span className="popover-member-detail">{r.category} • {r.shift}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

      {/* Seva Step Modal */}
      {showSevaStep && postAttendanceMembers.length > 0 && (
        <div className="seva-step-overlay">
          <div className="seva-step-modal">
            <div className="modal-header">
              <h2>🙏 Seva Record Darj Karein</h2>
              <p>{selectedDate} ko present members ke liye seva details bharein</p>
              <button className="btn-close-modal" onClick={() => setShowSevaStep(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="seva-entry-list">
                {postAttendanceMembers.map((member) => (
                  <div key={member.id} className="seva-entry-row">
                    <div className="member-info">
                      <span className="name">{member.name}</span>
                      <span className="uid">{member.number}</span>
                    </div>
                    <div className="entry-controls">
                      <select
                        value={sevaEntries[member.id]?.category || ""}
                        onChange={(e) => handleSevaEntryChange(member.id, "category", e.target.value)}
                        className="entry-select"
                      >
                        <option value="">-- Category --</option>
                        {sevaCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                        <select
                          value={sevaEntries[member.id]?.item || ""}
                          onChange={(e) => handleSevaEntryChange(member.id, "item", e.target.value)}
                          className="entry-select"
                          disabled={!sevaEntries[member.id]?.category}
                        >
                          <option value="">-- Seva Item --</option>
                          {sevaEntries[member.id]?.category &&
                            sevaItemsByCategory[sevaEntries[member.id].category]?.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))
                          }
                        </select>
                        <select
                          value={sevaEntries[member.id]?.hours || "1.0"}
                          onChange={(e) => handleSevaEntryChange(member.id, "hours", e.target.value)}
                          className="entry-select compact"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}hr</option>)}
                        </select>
                        <select
                          value={sevaEntries[member.id]?.cost || "0"}
                          onChange={(e) => handleSevaEntryChange(member.id, "cost", e.target.value)}
                          className="entry-select compact"
                        >
                          {costOptions.map(c => <option key={c} value={c}>₹{c}</option>)}
                        </select>
                      </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-skip" onClick={() => setShowSevaStep(false)}>Seva Skip Karo</button>
              <button className="btn-save-seva" onClick={submitPostAttendanceSeva} disabled={loading}>
                {loading ? "Save ho raha hai..." : "Sab Records Save Karo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
