import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ACHIEVEMENTS_MAP = {
  'First Steps': { icon: '🌱', desc: 'Complete your first task' },
  'Task Master': { icon: '⚡', desc: 'Complete 5 tasks' },
  'Streak Keeper': { icon: '🔥', desc: 'Complete 10 tasks' },
  'Century Club': { icon: '💯', desc: 'Earn 100 points' },
  'Point Legend': { icon: '👑', desc: 'Earn 500 points' },
  'Quiz Ace': { icon: '🧠', desc: 'Score 100% on a quiz' }
};

const ALL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS_MAP);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await axios.get('/api/skillpaths');
      setPaths(res.data);
    } catch {}
    setLoading(false);
  };

  const totalTasks = paths.flatMap(p => p.tasks).length;
  const completedTasks = paths.flatMap(p => p.tasks).filter(t => t.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const earnedPoints = paths.reduce((s, p) => s + p.earnedPoints, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard 📊</h1>
        <p className="page-sub">Track your learning progress and achievements</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">🗺️</div>
          <div className="stat-value">{paths.length}</div>
          <div className="stat-label">Active Skill Paths</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{user?.points || 0}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{user?.achievements?.length || 0}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:24}}>
        {/* Overall Progress */}
        <div className="card">
          <div className="section-title">📈 Overall Progress</div>
          <div style={{marginBottom:20}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span style={{fontSize:13, color:'var(--text2)'}}>Learning Journey</span>
              <span style={{fontSize:13, fontWeight:700, color:'var(--accent)'}}>{overallProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill purple" style={{width:`${overallProgress}%`}} />
            </div>
          </div>

          <div style={{display:'flex', gap:16}}>
            <div style={{flex:1, textAlign:'center', padding:12, background:'var(--surface2)', borderRadius:10}}>
              <div style={{fontSize:20, fontWeight:800, fontFamily:'Syne, sans-serif'}}>{completedTasks}</div>
              <div style={{fontSize:11, color:'var(--text2)'}}>Done</div>
            </div>
            <div style={{flex:1, textAlign:'center', padding:12, background:'var(--surface2)', borderRadius:10}}>
              <div style={{fontSize:20, fontWeight:800, fontFamily:'Syne, sans-serif'}}>{totalTasks - completedTasks}</div>
              <div style={{fontSize:11, color:'var(--text2)'}}>Remaining</div>
            </div>
            <div style={{flex:1, textAlign:'center', padding:12, background:'var(--surface2)', borderRadius:10}}>
              <div style={{fontSize:20, fontWeight:800, fontFamily:'Syne, sans-serif'}}>Lv.{user?.level || 1}</div>
              <div style={{fontSize:11, color:'var(--text2)'}}>Level</div>
            </div>
          </div>
        </div>

        {/* Skills in progress */}
        <div className="card">
          <div className="section-title">🗺️ Skills in Progress</div>
          {loading ? <div className="spinner" /> : paths.length === 0 ? (
            <div style={{textAlign:'center', padding:'24px 0'}}>
              <div style={{fontSize:32, marginBottom:8}}>🌱</div>
              <div style={{fontSize:13, color:'var(--text2)', marginBottom:12}}>No skill paths yet</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/skills')}>
                Start Learning →
              </button>
            </div>
          ) : paths.slice(0,3).map(path => {
            const done = path.tasks.filter(t => t.completed).length;
            const pct = Math.round((done / path.tasks.length) * 100);
            return (
              <div key={path.id} style={{marginBottom:14}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:6, alignItems:'center'}}>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span style={{fontWeight:600, fontSize:13}}>{path.skill}</span>
                    <span className={`level-badge level-${path.level}`}>{path.level}</span>
                  </div>
                  <span style={{fontSize:12, color:'var(--text2)'}}>{done}/{path.tasks.length}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill purple" style={{width:`${pct}%`}} />
                </div>
              </div>
            );
          })}
          {paths.length > 0 && (
            <button className="btn btn-secondary btn-sm" style={{marginTop:8}} onClick={() => navigate('/skills')}>
              View All Paths →
            </button>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="section-title">🏆 Achievements</div>
        <div className="achievement-grid">
          {ALL_ACHIEVEMENTS.map(name => {
            const earned = user?.achievements?.includes(name);
            const info = ACHIEVEMENTS_MAP[name];
            return (
              <div key={name} className={`achievement-item ${earned ? 'earned' : ''}`}>
                <div className="achievement-icon" style={{filter: earned ? 'none' : 'grayscale(1) opacity(0.4)'}}>{info.icon}</div>
                <div className="achievement-name" style={{color: earned ? 'var(--gold)' : 'var(--text3)'}}>{name}</div>
                <div style={{fontSize:10, color:'var(--text3)', marginTop:4}}>{info.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{display:'flex', gap:12, marginTop:24, flexWrap:'wrap'}}>
        <button className="btn btn-primary" onClick={() => navigate('/skills')}>🗺️ Explore Skills</button>
        <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>🧠 Take a Quiz</button>
        <button className="btn btn-secondary" onClick={() => navigate('/resources')}>📚 Resources</button>
        <button className="btn btn-secondary" onClick={() => navigate('/profile')}>👤 Edit Profile</button>
      </div>
    </div>
  );
}
