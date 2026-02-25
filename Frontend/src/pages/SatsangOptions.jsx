import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const SatsangOptions = () => {
  const defaultOptions = [
    "Video Satsang (DB/MPG)",
    "Branch Satsang",
    "Audio Satsang"
  ];

  const [options, setOptions] = useState(() => {
    const saved = localStorage.getItem('satsangCategories');
    return saved ? JSON.parse(saved) : defaultOptions;
  });

  const [newOption, setNewOption] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState({ show: false, type: "", msg: "" });

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: "", msg: "" }), 3000);
  };

  const handleAdd = () => {
    if (!newOption.trim()) return;
    if (options.includes(newOption.trim())) {
      showToast('error', 'Option already exists!');
      return;
    }
    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  const handleDelete = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const startEdit = (index, value) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const saveEdit = (index) => {
    if (!editValue.trim()) return;
    if (options.includes(editValue.trim()) && editValue.trim() !== options[index]) {
        showToast('error', 'Option already exists!');
        return;
    }
    const updated = [...options];
    updated[index] = editValue.trim();
    setOptions(updated);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSaveAll = () => {
    localStorage.setItem('satsangCategories', JSON.stringify(options));
    showToast('success', 'Satsang options saved successfully!');
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '700px', 
      margin: '0 auto',
      minHeight: '100vh',
      fontFamily: '"Inter", "Segoe UI", sans-serif'
    }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', 
          padding: '16px 24px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideInRight 0.3s ease-out forwards'
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f05a28 0%, #d94a1b 100%)', 
        color: 'white', 
        padding: '24px 30px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(240, 90, 40, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '12px', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '0.5px' }}>Add Satsang Options</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Manage the types of satsang for attendance and reporting.</p>
        </div>
      </div>

      {/* Main List Container */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        border: '1px solid #f0f0f0',
        overflow: 'hidden' 
      }}>
        {/* List Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 200px', 
          background: '#f8fafc', 
          borderBottom: '2px solid #e2e8f0',
          fontWeight: '600',
          color: '#475569',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div style={{ padding: '16px 24px' }}>Category Name</div>
          <div style={{ padding: '16px 24px', textAlign: 'center' }}>Actions</div>
        </div>

        {/* List Items */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {options.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>No options found. Add one below!</p>
            </div>
          ) : (
            options.map((opt, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 200px',
                borderBottom: '1px solid #f1f5f9', 
                transition: 'background-color 0.2s ease',
                background: index % 2 === 0 ? 'white' : '#fcfcfc'
              }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
                  {editingIndex === index ? (
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(index);
                          if (e.key === 'Escape') { setEditingIndex(null); setEditValue(''); }
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        border: '2px solid #3b82f6', 
                        borderRadius: '6px',
                        fontSize: '15px',
                        outline: 'none',
                        color: '#334155',
                        background: 'white'
                      }}
                      autoFocus
                    />
                  ) : (
                    <span style={{ fontSize: '16px', color: '#334155', fontWeight: '500' }}>{opt}</span>
                  )}
                </div>
                
                <div style={{ 
                  padding: '16px 24px', 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderLeft: '1px solid #f1f5f9'
                }}>
                  {editingIndex === index ? (
                    <button 
                      onClick={() => saveEdit(index)} 
                      style={{ 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#059669'}
                      onMouseOut={(e) => e.target.style.background = '#10b981'}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEdit(index, opt)} 
                        title="Edit Option"
                        style={{ 
                          background: '#f1f5f9', 
                          border: '1px solid #cbd5e1', 
                          color: '#475569', 
                          cursor: 'pointer',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '500',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#e2e8f0';
                            e.target.style.borderColor = '#94a3b8';
                            e.target.style.color = '#0f172a';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = '#f1f5f9';
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.color = '#475569';
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(index)} 
                        title="Delete Option"
                        style={{ 
                          background: '#fee2e2', 
                          border: '1px solid #fca5a5', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '500',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#fecaca';
                            e.target.style.borderColor = '#f87171';
                            e.target.style.color = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = '#fee2e2';
                            e.target.style.borderColor = '#fca5a5';
                            e.target.style.color = '#ef4444';
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Add New Row */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 200px',
            background: '#f8fafc', 
            borderTop: '2px solid #e2e8f0' 
          }}>
            <div style={{ padding: '20px 24px' }}>
              <input 
                type="text" 
                placeholder="Type new option here..." 
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '8px', 
                  background: 'white',
                  fontSize: '15px',
                  color: '#334155',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.05)';
                }}
              />
            </div>
            <div style={{ 
              padding: '20px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderLeft: '1px solid #e2e8f0'
            }}>
              <button 
                onClick={handleAdd} 
                style={{ 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '15px',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              >
                + Add Option
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={handleSaveAll}
          style={{
            background: 'linear-gradient(135deg, #f05a28 0%, #d94a1b 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 48px',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(240, 90, 40, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(240, 90, 40, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(240, 90, 40, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(240, 90, 40, 0.3)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save All Changes
        </button>
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default SatsangOptions;
