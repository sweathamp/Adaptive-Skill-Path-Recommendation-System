import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/user/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {}
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Panel 🛡️</h1>
        <p className="page-sub">Manage users and monitor platform activity</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{marginBottom:28}}>
          <div className="stat-card purple">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">🗺️</div>
            <div className="stat-value">{stats.totalPaths}</div>
            <div className="stat-label">Skill Paths</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.totalTasksCompleted}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.totalPoints}</div>
            <div className="stat-label">Total Points Awarded</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">👥 User Management</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)', color:'var(--text3)', textAlign:'left'}}>
                <th style={{padding:'8px 12px', fontWeight:600}}>User</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Email</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Level</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Points</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Skills</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Joined</th>
                <th style={{padding:'8px 12px', fontWeight:600}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'12px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{
                        width:32, height:32, borderRadius:'50%',
                        background:'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700, color:'white', flexShrink:0
                      }}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{fontWeight:600}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px', color:'var(--text2)'}}>{u.email}</td>
                  <td style={{padding:'12px'}}><span className="badge badge-purple">Lv.{u.level}</span></td>
                  <td style={{padding:'12px'}}><span className="badge badge-gold">⭐ {u.points}</span></td>
                  <td style={{padding:'12px', color:'var(--text2)'}}>{u.existingSkills?.length || 0} skills</td>
                  <td style={{padding:'12px', color:'var(--text2)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{padding:'12px'}}>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{marginTop:20, background:'rgba(255,101,132,0.03)', borderColor:'rgba(255,101,132,0.2)'}}>
        <div style={{fontSize:12, color:'var(--text2)'}}>
          ⚠️ <strong>Note:</strong> This is a demo with in-memory storage. Data resets on server restart. For production, integrate with MongoDB, PostgreSQL, or another database.
        </div>
      </div>
    </div>
  );
}
