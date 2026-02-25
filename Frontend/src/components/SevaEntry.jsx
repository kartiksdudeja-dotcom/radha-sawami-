import React, { useState, useEffect } from "react";
import "../styles/SevaEntry.css";
import { API_ENDPOINTS } from "../config/apiConfig";

const API_URL = API_ENDPOINTS.MEMBERS;
const SEVA_API = API_ENDPOINTS.SEVA;

const sevaTypesByCategory = {
  "seva-mahila": [
    "Knitting",
    "Food Processing",
    "Stitching",
    "Embroidery",
    "Others",
    "Purchasing",
    "Fabric Painting",
    "Art and Craft",
  ],
  "seva-youth": [
    "Cleaning",
    "Exhibition",
    "Security",
    "Others",
    "Purchasing",
    "Transportation",
  ],
  "seva-bag": [
    "Stitching",
    "Purchasing",
    "Cutting",
    "Packing",
    "Transportation",
  ],
  "seva-copy": [
    "Purchasing",
    "Printing",
    "Counting",
    "Stapling",
    "Side Pasting",
    "Centre Pasting",
    "Trimming",
  ],
};

const sevaData = {
  "seva-mahila": {
    name: "Mahila Association",
    icon: "👩‍👩‍👧",
    color: "#FF6B9D",
  },
  "seva-youth": {
    name: "Youth Association",
    icon: "👦👧",
    color: "#4ECDC4",
  },
  "seva-bag": {
    name: "Bag Unit",
    icon: "🎒",
    color: "#45B7D1",
  },
  "seva-copy": {
    name: "Copy Unit",
    icon: "📋",
    color: "#F7DC6F",
  },
};

const SevaEntry = ({ categoryId }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState([]);
  const [memberHistory, setMemberHistory] = useState(null);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [sevaMasterData, setSevaMasterData] = useState([]);
  const [sevaEntries, setSevaEntries] = useState([]);
  const [totalMonthlyHours, setTotalMonthlyHours] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const category = sevaData[categoryId] || {};

  // Mock member history data
  const memberHistoryData = {
    "Shabd Swaroop Khanna": {
      previousEntries: 15.5,
      totalCost: 1250,
      lastEntry: "2025-12-20",
    },
    "Ramesh Kumar": {
      previousEntries: 12,
      totalCost: 950,
      lastEntry: "2025-12-19",
    },
    "Priya Singh": {
      previousEntries: 18.5,
      totalCost: 1500,
      lastEntry: "2025-12-21",
    },
    "Anita Devi": {
      previousEntries: 10,
      totalCost: 800,
      lastEntry: "2025-12-18",
    },
    "Raj Kumar": {
      previousEntries: 14,
      totalCost: 1100,
      lastEntry: "2025-12-20",
    },
    "Deepa Sharma": {
      previousEntries: 16.5,
      totalCost: 1300,
      lastEntry: "2025-12-19",
    },
    "Vikram Singh": {
      previousEntries: 11,
      totalCost: 900,
      lastEntry: "2025-12-21",
    },
    "Neha Gupta": {
      previousEntries: 13.5,
      totalCost: 1050,
      lastEntry: "2025-12-20",
    },
  };

  useEffect(() => {
    fetchMembers();
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
    // Filter seva types based on category
    const categoryName = category.name;
    const filteredSevaTypes = sevaMasterData
      .filter((item) => item.Category === categoryName)
      .map((item) => item.SevaName);

    setSevaEntries(
      filteredSevaTypes.map((type, index) => ({
        id: index + 1,
        seva: type,
        hours: "",
        cost: "",
      })),
    );
    setTotalMonthlyHours(0);
    setMemberName("");
    setDate(new Date().toISOString().split("T")[0]);
  }, [categoryId, sevaMasterData, category.name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".member-search")) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success && result.data) {
        // Store full member objects with id and name
        setMembers(result.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    }
  };

  const handleMemberSearch = (value) => {
    setMemberName(value);
    if (value.trim()) {
      const filtered = members.filter((m) =>
        m.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredMembers(filtered);
      setShowMemberDropdown(true);
    } else {
      setFilteredMembers([]);
      setShowMemberDropdown(false);
    }
  };

  const handleSelectMember = (memberId) => {
    const selectedMember = members.find((m) => m.id === parseInt(memberId));
    if (selectedMember) {
      setMemberName(selectedMember.name);
      // Load member's history
      setMemberHistory(memberHistoryData[selectedMember.name] || null);
    }
  };

  const handleAddRow = () => {
    const newId = Math.max(...sevaEntries.map((e) => e.id), 0) + 1;
    const newEntry = {
      id: newId,
      seva: "",
      hours: "",
      cost: "",
    };
    setSevaEntries([...sevaEntries, newEntry]);
  };

  const handleDeleteRow = (id) => {
    const newEntries = sevaEntries.filter((entry) => entry.id !== id);
    setSevaEntries(newEntries);
    // Recalculate total
    const total = newEntries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours) || 0;
      return sum + hours;
    }, 0);
    setTotalMonthlyHours(total);
  };

  const handleEditRow = (id, sevaName) => {
    setEditingId(id);
    setEditingValue(sevaName);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleSaveEdit = (id) => {
    // Check if this seva already exists in the table
    const isDuplicate = sevaEntries.some(
      (entry) =>
        entry.id !== id &&
        entry.seva.toLowerCase() === editingValue.toLowerCase() &&
        entry.seva !== "",
    );

    if (isDuplicate) {
      alert("This seva entry already exists! Please use a different one.");
      return;
    }

    const newEntries = sevaEntries.map((entry) =>
      entry.id === id ? { ...entry, seva: editingValue } : entry,
    );
    setSevaEntries(newEntries);
    setEditingId(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleSevaChange = (index, field, value) => {
    const newEntries = [...sevaEntries];
    newEntries[index][field] =
      value === "" ? "" : field === "seva" ? value : parseFloat(value) || "";
    setSevaEntries(newEntries);

    // Calculate total hours - only sum actual values, not empty strings
    const total = newEntries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours) || 0;
      return sum + hours;
    }, 0);
    setTotalMonthlyHours(total);
  };

  const handleSubmit = async () => {
    if (!memberName.trim()) {
      alert("Please select a member");
      return;
    }

    if (!date) {
      alert("Please select a date");
      return;
    }

    // Find the member ID from the member name
    const selectedMember = members.find((m) => m.name === memberName);
    if (!selectedMember) {
      alert("Please select a valid member");
      return;
    }

    // Filter entries that have hours or cost
    const validEntries = sevaEntries.filter(
      (entry) =>
        entry.seva &&
        ((entry.hours !== "" && parseFloat(entry.hours) > 0) ||
          (entry.cost !== "" && parseFloat(entry.cost) > 0)),
    );

    if (validEntries.length === 0) {
      alert("Please enter at least one seva with hours or cost");
      return;
    }

    try {
      console.log("📝 Submitting Seva entries:", {
        member: selectedMember.name,
        category: category.name,
        date: date,
        entries: validEntries,
      });

      // Save each seva entry to the database
      for (const entry of validEntries) {
        const response = await fetch(SEVA_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member_id: selectedMember.id,
            category: category.name,
            seva_name: entry.seva,
            hours: parseFloat(entry.hours) || 0,
            cost: parseFloat(entry.cost) || 0,
            date: date,
          }),
        });

        console.log(
          "📡 Response status:",
          response.status,
          response.statusText,
        );
        const result = await response.json();
        console.log("📦 Response data:", result);

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to save seva entry");
        }
      }

      alert(`Seva entry submitted successfully for ${memberName}!`);

      // Reset form
      setMemberName("");
      setDate(new Date().toISOString().split("T")[0]);
      setSevaEntries(
        sevaTypes.map((type, index) => ({
          id: index + 1,
          seva: type,
          hours: "",
          cost: "",
        })),
      );
      setTotalMonthlyHours(0);
    } catch (error) {
      console.error("❌ Error submitting seva entry:", error);
      alert("Failed to submit seva entry: " + error.message);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[now.getMonth()]} - ${now.getFullYear()}`;
  };

  return (
    <div className="seva-entry-container">
      {/* Header */}
      <div className="entry-header" style={{ borderTopColor: category.color }}>
        <div className="back-button">«</div>
        <h1>Seva Entry</h1>
      </div>

      {/* Content Card */}
      <div className="entry-content">
        {/* Status Info */}
        <div className="status-info">
          <p>
            <span className="label">Seva Status as on :</span>{" "}
            <span className="value">{getCurrentMonth()}</span>
          </p>
          <p>
            <span className="label">Seva Category :</span>{" "}
            <span className="value">{category.name}</span>
          </p>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group member-search">
              <label>Member Name:</label>
              <div className="search-container">
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => handleMemberSearch(e.target.value)}
                  onFocus={() => {
                    if (memberName.trim()) {
                      const filtered = members.filter((m) =>
                        m.name.toLowerCase().includes(memberName.toLowerCase()),
                      );
                      setFilteredMembers(filtered);
                      setShowMemberDropdown(true);
                    }
                  }}
                  placeholder="Type to search member..."
                  className="form-input member-input"
                  autoComplete="off"
                />
                {showMemberDropdown && filteredMembers.length > 0 && (
                  <div className="member-dropdown">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="member-dropdown-item"
                        onClick={() => {
                          setMemberName(member.name);
                          setMemberHistory(
                            memberHistoryData[member.name] || null,
                          );
                          setShowMemberDropdown(false);
                          setFilteredMembers([]);
                        }}
                      >
                        <span className="member-name">{member.name}</span>
                        {member.uid && (
                          <span className="member-uid">({member.uid})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Member History */}
        {memberHistory && memberName && (
          <div className="member-history">
            <div className="history-card">
              <p>
                <span className="label">Previous Seva Hours:</span>{" "}
                <span className="value">
                  {memberHistory.previousEntries} Hrs
                </span>
              </p>
            </div>
            <div className="history-card">
              <p>
                <span className="label">Total Cost:</span>{" "}
                <span className="value">₹{memberHistory.totalCost}</span>
              </p>
            </div>
            <div className="history-card">
              <p>
                <span className="label">Last Entry:</span>{" "}
                <span className="value">{memberHistory.lastEntry}</span>
              </p>
            </div>
          </div>
        )}

        {/* Monthly Seva Info */}
        <div className="monthly-info">
          <p>
            Monthly Seva Achieved : <strong>{totalMonthlyHours} Hrs</strong>
          </p>
        </div>

        {/* Seva Table */}
        <div className="table-container">
          <table className="seva-table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Seva</th>
                <th>Seva Hrs Today</th>
                <th>Cost</th>
                {isEditableCategory && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sevaEntries.map((entry, index) => (
                <tr key={entry.id}>
                  <td className="srno">{entry.id}</td>
                  <td
                    className={`seva-name ${
                      isEditableCategory ? "editable" : ""
                    }`}
                    onClick={() =>
                      !editingId &&
                      isEditableCategory &&
                      handleEditRow(entry.id, entry.seva)
                    }
                    style={{
                      cursor: isEditableCategory ? "pointer" : "default",
                    }}
                  >
                    {isEditableCategory && editingId === entry.id ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, entry.id)}
                        className="table-input seva-input-edit"
                        autoFocus
                      />
                    ) : (
                      entry.seva
                    )}
                  </td>
                  <td className="input-cell">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={entry.hours}
                      onChange={(e) =>
                        handleSevaChange(index, "hours", e.target.value)
                      }
                      className="table-input"
                      placeholder="0"
                      disabled={isEditableCategory && editingId === entry.id}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={entry.cost}
                      onChange={(e) =>
                        handleSevaChange(index, "cost", e.target.value)
                      }
                      className="table-input"
                      placeholder="0"
                      disabled={isEditableCategory && editingId === entry.id}
                    />
                  </td>
                  {isEditableCategory && (
                    <td className="action-cell">
                      {editingId === entry.id ? (
                        <div className="edit-actions">
                          <button
                            className="btn-save-edit"
                            onClick={() => handleSaveEdit(entry.id)}
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={handleCancelEdit}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="edit-delete-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditRow(entry.id, entry.seva)}
                            title="Edit name"
                          >
                            ✎
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteRow(entry.id)}
                            title="Delete row"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button and Submit Button */}
        <div className="submit-container">
          {isEditableCategory && (
            <button
              className="btn-add-row"
              onClick={handleAddRow}
              style={{ backgroundColor: category.color }}
            >
              + Add Row
            </button>
          )}
          <button
            className="btn-submit"
            onClick={handleSubmit}
            style={{ backgroundColor: category.color }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SevaEntry;
