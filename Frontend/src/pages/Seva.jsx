import React, { useState } from 'react';
import '../styles/Seva.css';

const Seva = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const sevaCategories = [
    {
      id: 'mahila',
      name: 'Mahila Association',
      icon: '👩‍👩‍👧',
      description: 'Mahila (Women) Association',
      color: '#FF6B9D'
    },
    {
      id: 'youth',
      name: 'Youth Association',
      icon: '👦👧',
      description: 'Youth Association',
      color: '#4ECDC4'
    },
    {
      id: 'bag',
      name: 'Bag Unit',
      icon: '🎒',
      description: 'Bag Unit',
      color: '#45B7D1'
    },
    {
      id: 'copy',
      name: 'Copy Unit',
      icon: '📋',
      description: 'Copy Unit',
      color: '#F7DC6F'
    }
  ];

  const getSelectedDetails = () => {
    return sevaCategories.find(cat => cat.id === selectedCategory);
  };

  return (
    <div className="seva-container">
      <div className="seva-header">
        <h1>Seva Services</h1>
        <p>Choose a service category to get started</p>
      </div>

      <div className="seva-grid">
        {sevaCategories.map((category) => (
          <div
            key={category.id}
            className={`seva-card ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              borderTop: `4px solid ${category.color}`
            }}
          >
            <div className="card-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            {selectedCategory === category.id && (
              <div className="checkmark">✓</div>
            )}
          </div>
        ))}
      </div>

      {selectedCategory && getSelectedDetails() && (
        <div className="seva-details">
          <div className="details-header">
            <h2>{getSelectedDetails()?.name || "Seva"}</h2>
            <button 
              className="close-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ✕
            </button>
          </div>
          <div className="details-content">
            <p>Selected: <strong>{getSelectedDetails()?.name || "Seva"}</strong></p>
            <div className="details-actions">
              <button className="btn btn-primary">View Members</button>
              <button className="btn btn-secondary">Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seva;
