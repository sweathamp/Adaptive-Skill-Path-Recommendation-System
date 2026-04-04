import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) fetchNotifications();
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setDailyTasks(res.data.dailyTasks || []);
      setHasUnread(res.data.notifications?.some(n => !n.read));
    } catch {}
  };

  const openNotifs = async () => {
    setShowNotifs(true);
    try {
      await axios.post('/api/notifications/read');
      setHasUnread(false);
    } catch {}
  };

  const navItems = isAdmin ? [
    { icon: '🛡️', label: 'Admin Panel', path: '/admin' }
  ] : [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '🗺️', label: 'Skill Paths', path: '/skills' },
    { icon: '🧠', label: 'Quizzes', path: '/quiz' },
    { icon: '📚', label: 'Resources', path: '/resources' }
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">SkillForge</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" onClick={() => !isAdmin && navigate('/profile')}>
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="user-chip-info">
              <div className="user-chip-name">{user?.name || 'User'}</div>
              <div className="user-chip-role">{isAdmin ? 'Administrator' : `Level ${user?.level || 1}`}</div>
            </div>
          </div>
          <button className="nav-item" style={{marginTop: 4}} onClick={logout}>
            <span className="icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-greeting">Welcome back,</div>
              <div className="topbar-name">{user?.name} {isAdmin ? '🛡️' : '⚡'}</div>
            </div>
            {!isAdmin && user?.points !== undefined && (
              <div className="badge badge-gold">⭐ {user.points} pts</div>
            )}
          </div>
          {!isAdmin && (
            <button className="notif-btn" onClick={openNotifs}>
              🔔
              {hasUnread && <span className="notif-dot" />}
            </button>
          )}
        </div>

        <Outlet />
      </main>

      {/* Notification Panel */}
      {showNotifs && (
        <>
          <div className="modal-overlay" style={{zIndex:150}} onClick={() => setShowNotifs(false)} />
          <div className="notif-panel">
            <div className="notif-panel-header">
              <h3 style={{fontFamily:'Syne, sans-serif'}}>🔔 Notifications</h3>
              <button className="modal-close" onClick={() => setShowNotifs(false)}>×</button>
            </div>
            <div className="notif-panel-body">
              {dailyTasks.length > 0 && (
                <div style={{marginBottom: 16}}>
                  <div className="section-title" style={{fontSize:13}}>📅 Today's Tasks</div>
                  {dailyTasks.map((t, i) => (
                    <div key={i} className="notif-item" style={{borderColor:'rgba(108,99,255,0.3)', background:'rgba(108,99,255,0.05)'}}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
              <div className="section-title" style={{fontSize:13}}>Recent Activity</div>
              {notifications.length === 0 ? (
                <div className="empty-state" style={{padding:24}}>
                  <div className="empty-icon">📭</div>
                  <div className="empty-sub">No notifications yet</div>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                  {n.message}
                  <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
