import React, { useState, useEffect } from 'react';
import '../styles/SevaCategory.css';

const sevaData = {
  'seva-mahila': {
    name: 'Mahila Association',
    icon: '👩‍👩‍👧',
    color: '#FF6B9D',
    description: 'Mahila (Women) Association - Dedicated to women\'s welfare and community service'
  },
  'seva-youth': {
    name: 'Youth Association',
    icon: '👦👧',
    color: '#4ECDC4',
    description: 'Youth Association - Empowering young members of the community'
  },
  'seva-bag': {
    name: 'Bag Unit',
    icon: '🎒',
    color: '#45B7D1',
    description: 'Bag Unit - Service through crafts and bag manufacturing'
  },
  'seva-copy': {
    name: 'Copy Unit',
    icon: '📋',
    color: '#F7DC6F',
    description: 'Copy Unit - Documentation and administrative services'
  }
};

const SevaCategory = ({ categoryId, onNavigateToEntry }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const category = sevaData[categoryId] || {};

  useEffect(() => {
    // Simulate loading members - replace with API call later
    setMembers([
      { id: 1, name: 'Member 1', role: 'Coordinator', joinDate: '2023-01-15' },
      { id: 2, name: 'Member 2', role: 'Volunteer', joinDate: '2023-03-20' }
    ]);
  }, [categoryId]);

  return (
    <div className="seva-category-container">
      <div className="category-header" style={{ borderTopColor: category.color }}>
        <div className="header-content">
          <span className="category-icon">{category.icon}</span>
          <div>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>
      </div>

      <div className="category-content">
        <div className="section-header">
          <h2>Members</h2>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => onNavigateToEntry && onNavigateToEntry(categoryId)}
              style={{ backgroundColor: category.color }}
            >
              📝 Seva Entry
            </button>
          </div>
        </div>

        <div className="members-grid">
          {members.length > 0 ? (
            members.map(member => (
              <div key={member.id} className="member-card" style={{ borderLeftColor: category.color }}>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <p className="date">Joined: {new Date(member.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-members">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SevaCategory;
