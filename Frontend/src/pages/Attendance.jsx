import React, { useState, useEffect, useMemo } from "react";
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

const Attendance = () => {
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

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submittedRecords, setSubmittedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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
  }, [filterDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMember, filterDate]);

  const monthDisplay = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(MEMBERS_API);
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

  const buildIndividualRecords = (data) =>
    data.map((record) => ({
      id: record.id,
      date: record.date,
      shift: record.shift,
      category: record.category,
      time: record.time,
      members: [
        {
          id: record.member_id,
          name: record.name,
          gender: record.gender,
          status: record.status,
          category: record.category,
        },
      ],
    }));

  const fetchAttendanceRecords = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const url = `${ATTENDANCE_API.replace("/attendance", "/attendance/by-date")}?fromDate=${today}&toDate=${today}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setSubmittedRecords(buildIndividualRecords(result.data));
      } else {
        setSubmittedRecords([]);
      }
    } catch {
      setSubmittedRecords([]);
    }
  };

  const fetchAttendanceRecordsForDate = async (date) => {
    try {
      const url = `${ATTENDANCE_API.replace("/attendance", "/attendance/by-date")}?fromDate=${date}&toDate=${date}`;
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
    if (filterDate) {
      let recordDateStr = record.date || "";
      if (recordDateStr.includes("/")) {
        const parts = recordDateStr.split("/");
        if (parts.length === 3)
          recordDateStr = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else {
        recordDateStr = recordDateStr.split("T")[0];
      }
      if (recordDateStr !== filterDate) return false;
    }
    if (filterMember === "all") return true;
    return record.members.some((m) => m.id === parseInt(filterMember));
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
        newSelected.push({ ...member, category: categories[0] });
        newCats[member.id] = categories[0];
        newStatCats[member.id] = statCategories[0];
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
      setSelectedMembers([...selectedMembers, { ...member, category: categories[0] }]);
      setSelectedMemberCategory({ ...selectedMemberCategory, [member.id]: categories[0] });
      setSelectedMemberStatCategory({ ...selectedMemberStatCategory, [member.id]: statCategories[0] });
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
    setSelectedMembers(selectedMembers.map((m) => (m.id === memberId ? { ...m, category } : m)));
    setSelectedMemberCategory({ ...selectedMemberCategory, [memberId]: category });
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
            cost: 0,
            date: selectedDate,
          }),
        });
      }
      setShowSevaStep(false);
      setSevaEntries({});
      setPostAttendanceMembers([]);
      showToast("success", "✅ Attendance aur Seva records save ho gaye!");
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
        fetchAttendanceRecords();
        setTimeout(() => {
          setShowSuccess(false);
          setShowSevaStep(true);
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

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Kya aap ye attendance record delete karna chahte hain?")) return;
    try {
      setLoading(true);
      const response = await fetch(`${ATTENDANCE_API}/${recordId}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        showToast("success", "Record delete ho gaya!");
        fetchAttendanceRecords();
      } else {
        showToast("error", "Error: " + result.message);
      }
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
        <h1>
          उपस्थिति <span className="month">— {monthDisplay}</span>
        </h1>
        <p className="att-subtitle">Members ki attendance darj karein</p>
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
        </div>

        {/* Search Area — compact, no empty space */}
        <div className="selection-area">
          <div className="search-bar-container">
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Member ka naam ya number likho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>
              )}
            </div>
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
              <h3>✅ Selected Members ({selectedMembers.length})</h3>
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
            onClick={handleSubmit}
            disabled={selectedMembers.length === 0 || loading}
          >
            {loading
              ? "Submit ho raha hai..."
              : selectedMembers.length === 0
              ? "Pehle member chunein"
              : `${selectedMembers.length} Members ki Attendance Submit Karo`}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="history-section">
        <div className="history-header">
          <h2>📋 Attendance History</h2>
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
              <option value="all">Sabhi Members</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="empty-history">
            <span style={{ fontSize: "2rem" }}>📭</span>
            <p>Is date ke liye koi record nahi mila.</p>
          </div>
        ) : (
          <>
            <div className="records-table">
              {paginatedRecords.map((record) => (
                <div key={record.id} className="record-row-entry">
                  <div className="record-meta">
                    <span className="date">{formatDate(record.date)}</span>
                    <span className="time">{formatTime(record.time)}</span>
                    <span className={`shift-tag ${record.shift?.toLowerCase()}`}>{record.shift}</span>
                  </div>
                  <div className="record-names">
                    {record.members?.map((m) => (
                      <span key={m.id} className="member-name-tag">{m.name}</span>
                    ))}
                  </div>
                  <div className="record-actions-small">
                    <button className="btn-icon" onClick={() => handleEditRecord(record)} title="Edit">✎</button>
                    <button className="btn-icon delete" onClick={() => handleDeleteRecord(record.id)} title="Delete">🗑</button>
                  </div>
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
                          ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Ghante"
                        value={sevaEntries[member.id]?.hours || ""}
                        onChange={(e) => handleSevaEntryChange(member.id, "hours", e.target.value)}
                        className="entry-input-hrs"
                        min="0"
                        step="0.5"
                      />
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
