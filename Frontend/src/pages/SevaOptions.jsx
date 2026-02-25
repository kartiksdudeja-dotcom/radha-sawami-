import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { API_ENDPOINTS } from '../config/apiConfig';

const SevaOptions = () => {
  const [sevaOptions, setSevaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [newCategory, setNewCategory] = useState('');
  const [newSevaName, setNewSevaName] = useState('');

  const SEVA_MASTER_API = API_ENDPOINTS.SEVA_MASTER || `${API_ENDPOINTS.SEVA}-master`;

  useEffect(() => {
    fetchSevaOptions();
  }, []);

  const fetchSevaOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(SEVA_MASTER_API);
      const result = await response.json();
      if (result.success) {
        setSevaOptions(result.data);
      } else {
        setError('Failed to load seva options');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSevaOption = async (e) => {
    e.preventDefault();
    if (!newCategory || !newSevaName) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(SEVA_MASTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory, sevaName: newSevaName }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Seva option added successfully!');
        setNewSevaName('');
        fetchSevaOptions();
      } else {
        setError(result.error || 'Failed to add seva option');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSevaOption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seva option?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${SEVA_MASTER_API}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Seva option deleted successfully!');
        fetchSevaOptions();
      } else {
        setError(result.error || 'Failed to delete seva option');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="members-container" style={{ padding: '20px' }}>
      <div className="members-header">
        <h1>Seva Options Management</h1>
        <p className="subtitle">Add or remove options that appear in the Seva attendance system.</p>
      </div>

      <div className="members-content">
        {/* Add New Option Form */}
        <div className="add-member-form" style={{ marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>Add New Seva Option</h3>
          <form onSubmit={handleAddSevaOption} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label>Category (Assocation/Unit)</label>
              <input 
                type="text" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Mahila Association"
                className="input-field"
                required
              />
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label>Seva Name</label>
              <input 
                type="text" 
                value={newSevaName} 
                onChange={(e) => setNewSevaName(e.target.value)}
                placeholder="e.g. Cleaning"
                className="input-field"
                required
              />
            </div>
            <div className="form-actions" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ height: '45px' }}>
                {loading ? 'Adding...' : 'Add Option'}
              </button>
            </div>
          </form>
          {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>{success}</div>}
        </div>

        {/* Existing Options Table */}
        <div className="members-list-container">
          <h3>Current Seva Options</h3>
          {loading && sevaOptions.length === 0 ? (
            <div className="loading">Loading seva options...</div>
          ) : (
            <table className="members-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Seva Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sevaOptions.map((option) => (
                  <tr key={option.ID}>
                    <td>{option.Category}</td>
                    <td>{option.SevaName}</td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteSevaOption(option.ID)}
                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sevaOptions.length === 0 && !loading && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No seva options found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SevaOptions;
