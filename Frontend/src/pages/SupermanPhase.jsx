import React, { useState, useEffect } from "react";
import "../styles/MemberMaster.css"; // Reuse similar styling
import { API_ENDPOINTS } from "../config/apiConfig";

const API_URL = API_ENDPOINTS.SUPERMAN_PHASES;

const SupermanPhase = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    phaseName: "",
    description: "",
    minAge: 0,
    maxAge: 150,
  });

  useEffect(() => {
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success) {
        setPhases(result.data);
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "minAge" || name === "maxAge" ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      phaseName: "",
      description: "",
      minAge: 0,
      maxAge: 150,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.phaseName) {
      alert("Phase Name is required");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert(editingId ? "Phase updated successfully" : "Phase added successfully");
        fetchPhases();
        resetForm();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error saving phase:", error);
      alert("Failed to save phase");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (phase) => {
    setFormData({
      phaseName: phase.PhaseName,
      description: phase.Description || "",
      minAge: phase.MinAge,
      maxAge: phase.MaxAge,
    });
    setEditingId(phase.ID);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this phase?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        alert("Phase deleted successfully");
        fetchPhases();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting phase:", error);
      alert("Failed to delete phase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-master-page" style={{ padding: '20px' }}>
      <div className="master-header">
        <h1>🦸 Superman Phase Master Table</h1>
        <button 
          className="add-member-btn" 
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: showForm ? 'none' : 'block' }}
        >
          Add Superman Phase
        </button>
      </div>

      {showForm && (
        <div className="master-form-card expanded" style={{ marginBottom: '30px' }}>
          <div className="master-header">
            <h2>{editingId ? "✏️ Edit Phase" : "📝 Add New Phase"}</h2>
            <button className="close-form-btn" onClick={resetForm}>✕</button>
          </div>
          <form onSubmit={handleSave} className="form-content show">
            <div className="master-form-grid">
              <div className="form-group">
                <label>Phase Name:</label>
                <input
                  type="text"
                  name="phaseName"
                  value={formData.phaseName}
                  onChange={handleInputChange}
                  placeholder="e.g. Phase 1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description/Age:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Upto 4 yrs"
                />
              </div>
              <div className="form-group">
                <label>Min Age:</label>
                <input
                  type="number"
                  name="minAge"
                  value={formData.minAge}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Max Age:</label>
                <input
                  type="number"
                  name="maxAge"
                  value={formData.maxAge}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update Phase" : "Save Phase")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="members-list-section">
        <div className="members-list-header">
          <h2>📊 Configured Phases</h2>
        </div>
        <div className="members-table-wrapper">
          <table className="master-table">
            <thead>
              <tr>
                <th>Phase Name</th>
                <th>Age Group / Description</th>
                <th>Min Age</th>
                <th>Max Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No phases configured yet.</td>
                </tr>
              ) : (
                phases.map((phase) => (
                  <tr key={phase.ID}>
                    <td style={{ fontWeight: '600' }}>{phase.PhaseName}</td>
                    <td>{phase.Description}</td>
                    <td>{phase.MinAge} yrs</td>
                    <td>{phase.MaxAge} yrs</td>
                    <td className="action-cell">
                      <button className="edit-btn-icon" onClick={() => handleEdit(phase)}>✏️</button>
                      <button className="delete-btn-icon" onClick={() => handleDelete(phase.ID)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupermanPhase;
