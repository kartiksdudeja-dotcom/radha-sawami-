import React, { useState, useEffect } from "react";
import "../styles/MemberMaster.css";
import { API_ENDPOINTS } from "../config/apiConfig";

const API_URL = API_ENDPOINTS.MEMBERS;

// Helper function to convert various date formats to yyyy-mm-dd for input[type="date"]
const formatDateForInput = (dateStr) => {
  if (!dateStr || dateStr === "-" || dateStr === "NULL") return "";
  
  // Try to parse the date string
  const str = dateStr.trim();
  
  // Already in yyyy-mm-dd format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // Format: dd/mm/yy or dd/mm/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) {
    const parts = str.split('/');
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];
    
    // Convert 2-digit year to 4-digit
    if (year.length === 2) {
      const yearNum = parseInt(year);
      year = yearNum > 50 ? `19${year}` : `20${year}`;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Try native Date parsing as fallback
  try {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // ignore
  }
  
  return "";
};

const MemberMaster = () => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [phases, setPhases] = useState([]);
  const [formData, setFormData] = useState({
    branch: "",
    region: "",
    uid: "",
    initial: "",
    name: "",
    gender: "Male",
    dob: "",
    first_initiation: "",
    second_initiation: "",
    jigyasu_registration: "",
    blood_group: "",
    father_name: "",
    mother_name: "",
    husband_name: "",
    wife_name: "",
    office_bearer: "",
    username: "",
    password: "",
    association_member: "",
    unit_member: "",
    status: "Initiated",
    is_member: true,
    is_admin: false,
    email: "",
    number: "",
    address: "",
    office_address: "",
  });

  useEffect(() => {
    fetchMembers();
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SUPERMAN_PHASES);
      const result = await response.json();
      if (result.success) {
        setPhases(result.data);
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
    }
  };

  // Auto-calculate status based on age whenever DOB changes
  useEffect(() => {
    if (formData.dob && phases.length > 0) {
      const birthDate = new Date(formData.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        // Find matching phase
        const matchingPhase = phases.find(p => age >= p.MinAge && age <= p.MaxAge);
        if (matchingPhase) {
          setFormData(prev => ({ ...prev, status: matchingPhase.PhaseName }));
        }
      }
    }
  }, [formData.dob, phases]);

  const fetchMembers = async () => {
    try {
      console.log("Fetching members from:", API_URL);
      setLoading(true);
      const response = await fetch(API_URL);
      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Fetch result:", result);
      if (result.success) {
        // Filter duplicates based on UID and name (frontend safety check)
        const uniqueMembers = [];
        const seen = new Set();

        for (const member of result.data) {
          const key = `${(member.uid || "NO_UID").toUpperCase()}|${(
            member.name || "NO_NAME"
          ).toUpperCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueMembers.push(member);
          }
        }

        console.log(
          `Members loaded: ${result.data.length}, unique: ${uniqueMembers.length}`
        );
        setMembers(uniqueMembers);
      } else {
        console.error("API returned error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      alert("Failed to load members: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      region: "",
      uid: "",
      initial: "",
      name: "",
      gender: "Male",
      dob: "",
      first_initiation: "",
      second_initiation: "",
      jigyasu_registration: "",
      blood_group: "",
      father_name: "",
      mother_name: "",
      husband_name: "",
      wife_name: "",
      office_bearer: "",
      username: "",
      password: "",
      association_member: "",
      unit_member: "",
      status: "Initiated",
      is_member: true,
      is_admin: false,
      email: "",
      number: "",
      address: "",
      office_address: "",
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.username || !formData.password) {
      alert("Name, Username and Password are required");
      return;
    }

    try {
      setLoading(true);
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "Operation failed");
        return;
      }

      await fetchMembers();
      resetForm();
      setEditingId(null);
      setIsFormExpanded(false); // Close form after successful save
      // Smooth scroll to members list
      setTimeout(() => {
        document.querySelector('.members-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Failed to save member");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      branch: member.branch || "",
      region: member.region || "",
      uid: member.uid || "",
      initial: member.initial || "",
      name: member.name || "",
      gender: member.gender === "M" ? "Male" : member.gender === "F" ? "Female" : member.gender || "Male",
      dob: formatDateForInput(member.dob),
      first_initiation: formatDateForInput(member.first_initiation),
      second_initiation: formatDateForInput(member.second_initiation),
      jigyasu_registration: formatDateForInput(member.jigyasu_registration),
      blood_group: member.blood_group === "-" ? "" : member.blood_group || "",
      father_name: member.father_name === "-" ? "" : member.father_name || "",
      mother_name: member.mother_name === "-" ? "" : member.mother_name || "",
      husband_name: member.husband_name === "-" ? "" : member.husband_name || "",
      wife_name: member.wife_name === "-" ? "" : member.wife_name || "",
      office_bearer: member.office_bearer === "-" ? "" : member.office_bearer || "",
      username: member.username || "",
      password: member.password || "",
      association_member: member.association_member || "",
      unit_member: member.unit_member || "",
      status: member.status || "Initiated",
      is_member: member.is_member === 1,
      is_admin: member.is_admin === 1,
      email: member.email || "",
      number: member.number || "",
      address: member.address || "",
      office_address: member.office_address || "",
    });
    setEditingId(member.id);
    setIsFormExpanded(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.querySelector('.master-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddNew = () => {
    resetForm();
    setEditingId(null);
    setIsFormExpanded(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.querySelector('.master-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCloseForm = () => {
    setIsFormExpanded(false);
    resetForm();
    setEditingId(null);
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${memberId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        await fetchMembers();
        resetForm();
        setEditingId(null);
      } else {
        alert(result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-master-page">
      {/* Header */}
      <div className="master-header">
        <div className="back-btn">«</div>
        <h1>Member Master</h1>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <p>Loading members...</p>
        </div>
      )}

      {/* Form Card */}
      <div className={`master-form-card ${isFormExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="master-header" onClick={() => !isFormExpanded && setIsFormExpanded(true)}>
          <h2
            style={{
              margin: 0,
              color: "#1F2937",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            {editingId ? '✏️ Edit Member' : '📝 Member Details'}
          </h2>
          <div className="header-actions">
            {isFormExpanded && (
              <button className="close-form-btn" onClick={handleCloseForm} title="Close Form">
                ✕
              </button>
            )}
            <button className="add-member-btn" onClick={handleAddNew}>
              + Add New Member
            </button>
          </div>
        </div>

        <div className={`form-content ${isFormExpanded ? 'show' : 'hide'}`}>
          <div className="master-form-grid">
          {/* Row 1 */}
          <div className="form-group">
            <label>Branch :</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Region :</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>UID :</label>
            <input
              type="text"
              name="uid"
              value={formData.uid}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Initial :</label>
            <input
              type="text"
              name="initial"
              value={formData.initial}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Name :</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Gender :</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label>DOB :</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>FirstInitiation :</label>
            <input
              type="date"
              name="first_initiation"
              value={formData.first_initiation}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>SecondInitiation :</label>
            <input
              type="date"
              name="second_initiation"
              value={formData.second_initiation}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Jigyasu_Registration :</label>
            <input
              type="date"
              name="jigyasu_registration"
              value={formData.jigyasu_registration}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Blood_Group :</label>
            <input
              type="text"
              name="blood_group"
              value={formData.blood_group}
              onChange={handleInputChange}
              placeholder="-"
            />
          </div>
          <div className="form-group">
            <label>Father_Name :</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleInputChange}
            />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label>Mother_Name :</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleInputChange}
              placeholder="-"
            />
          </div>
          <div className="form-group">
            <label>Husband_Name :</label>
            <input
              type="text"
              name="husband_name"
              value={formData.husband_name}
              onChange={handleInputChange}
              placeholder="-"
            />
          </div>
          <div className="form-group">
            <label>Wife_Name :</label>
            <input
              type="text"
              name="wife_name"
              value={formData.wife_name}
              onChange={handleInputChange}
              placeholder="-"
            />
          </div>
          <div className="form-group">
            <label>Office_Bearer :</label>
            <input
              type="text"
              name="office_bearer"
              value={formData.office_bearer}
              onChange={handleInputChange}
              placeholder="-"
            />
          </div>
          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label>Phone Number :</label>
            <input
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Home Address :</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter home address"
            />
          </div>
          <div className="form-group">
            <label>Office Address :</label>
            <input
              type="text"
              name="office_address"
              value={formData.office_address}
              onChange={handleInputChange}
              placeholder="Enter office address"
            />
          </div>
          <div className="form-group">
            <label>UserName :</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Password :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label>Association_member :</label>
            <input
              type="text"
              name="association_member"
              value={formData.association_member}
              onChange={handleInputChange}
              placeholder="Youth Association"
            />
          </div>
          <div className="form-group">
            <label>Unit_Member :</label>
            <input
              type="text"
              name="unit_member"
              value={formData.unit_member}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Status :</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {phases.length > 0 ? (
                phases.map(p => (
                  <option key={p.ID} value={p.PhaseName}>{p.PhaseName}</option>
                ))
              ) : (
                <>
                  <option value="Initiated">Initiated</option>
                  <option value="Primary">Primary</option>
                  <option value="PRIMARY 1">PRIMARY 1</option>
                  <option value="Phase 1">Phase 1</option>
                  <option value="Children">Children</option>
                  <option value="Jigyasu">Jigyasu</option>
                </>
              )}
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_member"
                checked={formData.is_member}
                onChange={handleInputChange}
              />
              Make Member
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleInputChange}
              />
              Make Admin
            </label>
          </div>
          <div className="form-group">
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Members List Section - Always Visible Below Form */}
      <div className="members-list-section">
        <div className="members-list-header">
          <h2>📋 Members List</h2>
          <span className="member-count">{members.length} members</span>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by name, UID, branch, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm("")} title="Clear search">
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="members-table-wrapper members-table-desktop">
          <table className="master-table">
            <thead>
              <tr>
                <th>#</th>
                <th>UID</th>
                <th>Member Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.filter(member => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  member?.name?.toLowerCase().includes(searchLower) ||
                  member?.uid?.toLowerCase().includes(searchLower) ||
                  member?.branch?.toLowerCase().includes(searchLower) ||
                  member?.region?.toLowerCase().includes(searchLower) ||
                  member?.username?.toLowerCase().includes(searchLower) ||
                  member?.gender?.toLowerCase().includes(searchLower) ||
                  member?.email?.toLowerCase().includes(searchLower) ||
                  member?.number?.toLowerCase().includes(searchLower)
                );
              }).length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? "No members match your search" : "No members found"}
                  </td>
                </tr>
              ) : (
                members.filter(member => {
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    member?.name?.toLowerCase().includes(searchLower) ||
                    member?.uid?.toLowerCase().includes(searchLower) ||
                    member?.branch?.toLowerCase().includes(searchLower) ||
                    member?.region?.toLowerCase().includes(searchLower) ||
                    member?.username?.toLowerCase().includes(searchLower) ||
                    member?.gender?.toLowerCase().includes(searchLower) ||
                    member?.email?.toLowerCase().includes(searchLower) ||
                    member?.number?.toLowerCase().includes(searchLower)
                  );
                }).map((member, index) => (
                  <tr key={member?.id || index}>
                    <td>{index + 1}</td>
                    <td>{member?.uid || "-"}</td>
                    <td>{member?.name || "-"}</td>
                    <td>{member?.email || "-"}</td>
                    <td>{member?.number || "-"}</td>
                    <td>{member?.branch || "-"}</td>
                    <td>
                      <span className={`gender-badge ${member?.gender?.toLowerCase()}`}>
                        {member?.gender || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${member?.status?.toLowerCase().replace(' ', '-')}`}>
                        {member?.status || "-"}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="edit-btn-icon"
                        onClick={() => handleEdit(member)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn-icon"
                        onClick={() => handleDeleteMember(member?.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="members-cards-container members-table-mobile">
          {members.length === 0 ? (
            <div className="no-members-card">No members found</div>
          ) : (
            members.map((member, index) => (
              <div className="member-card" key={member?.id || index}>
                <div className="member-card-header">
                  <div className="member-header-info">
                    <h3>{member?.name || "-"}</h3>
                    <span className="member-uid">ID: {member?.uid || "-"}</span>
                  </div>
                  <span className={`member-status-badge ${member?.status?.toLowerCase().replace(' ', '-')}`}>
                    {member?.status || "-"}
                  </span>
                </div>

                <div className="member-card-body">
                  <div className="member-field">
                    <label>🏢 Branch</label>
                    <span>{member?.branch || "-"}</span>
                  </div>
                  <div className="member-field">
                    <label>👤 Gender</label>
                    <span className={`gender-badge ${member?.gender?.toLowerCase()}`}>
                      {member?.gender || "-"}
                    </span>
                  </div>
                  <div className="member-field">
                    <label>📍 Region</label>
                    <span>{member?.region || "-"}</span>
                  </div>
                  <div className="member-field">
                    <label>🎯 Initial</label>
                    <span>{member?.initial || "-"}</span>
                  </div>
                </div>

                <div className="member-card-actions">
                  <button
                    className="edit-btn-card"
                    onClick={() => handleEdit(member)}
                    title="Edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn-card"
                    onClick={() => handleDeleteMember(member?.id)}
                    disabled={loading}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberMaster;
