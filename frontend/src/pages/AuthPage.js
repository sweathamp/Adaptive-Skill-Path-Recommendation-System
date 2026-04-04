import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // login | register
  const [role, setRole] = useState('user'); // user | admin
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password, role);
      } else {
        await register(form.email, form.password, form.name);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fill = (f) => setForm(prev => ({ ...prev, ...f }));

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div className="auth-bg-orb" style={{width:400,height:400,background:'#6c63ff',top:-100,left:-100}} />
      <div className="auth-bg-orb" style={{width:300,height:300,background:'#ff6584',bottom:-50,right:-50}} />
      <div className="auth-bg-orb" style={{width:200,height:200,background:'#43e97b',top:'50%',left:'60%'}} />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">SkillForge</span>
          <p style={{color:'var(--text2)', fontSize:13, marginTop:4}}>Your AI-powered learning companion</p>
        </div>

        {/* Mode tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
        </div>

        {/* Role selector (login only) */}
        {tab === 'login' && (
          <div style={{display:'flex', gap:8, marginBottom:20}}>
            <button
              className={`btn ${role === 'user' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{flex:1, justifyContent:'center'}}
              onClick={() => setRole('user')}
            >👤 User</button>
            <button
              className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{flex:1, justifyContent:'center'}}
              onClick={() => setRole('admin')}
            >🛡️ Admin</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={e => fill({ name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => fill({ email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => fill({ password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div style={{padding:'10px 14px', background:'rgba(255,101,132,0.1)', border:'1px solid rgba(255,101,132,0.3)', borderRadius:8, fontSize:13, color:'var(--accent2)', marginBottom:16}}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? '⏳ Please wait...' : tab === 'login' ? '→ Sign In' : '→ Create Account'}
          </button>
        </form>

        {tab === 'login' && (
          <div style={{marginTop:20, padding:16, background:'var(--surface2)', borderRadius:10, fontSize:12, color:'var(--text2)'}}>
            <strong style={{color:'var(--text)'}}>Demo credentials:</strong><br/>
            👤 User: demo@skillforge.com / password<br/>
            🛡️ Admin: admin@skillforge.com / password
          </div>
        )}
      </div>
    </div>
  );
}
