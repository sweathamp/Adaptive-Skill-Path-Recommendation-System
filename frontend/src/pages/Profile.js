import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ALL_SKILLS = ['JavaScript', 'Python', 'React', 'Cybersecurity', 'HTML', 'CSS', 'Node.js', 'SQL', 'Java', 'C++', 'TypeScript', 'Docker', 'AWS', 'Git', 'Linux'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', existingSkills: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', existingSkills: user.existingSkills || [] });
    }
  }, [user]);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      existingSkills: prev.existingSkills.includes(skill)
        ? prev.existingSkills.filter(s => s !== skill)
        : [...prev.existingSkills, skill]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/profile', form);
      updateUser(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Profile 👤</h1>
        <p className="page-sub">Manage your information and known skills</p>
      </div>

      {saved && (
        <div style={{padding:'12px 16px', background:'rgba(67,233,123,0.1)', border:'1px solid rgba(67,233,123,0.3)', borderRadius:10, marginBottom:20, fontSize:13, color:'var(--accent3)'}}>
          ✅ Profile saved successfully!
        </div>
      )}

      <div className="grid-2">
        {/* Profile card */}
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:24}}>
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--accent), var(--accent2))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, fontWeight:700, color:'white', flexShrink:0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800}}>{user?.name}</div>
              <div style={{fontSize:13, color:'var(--text2)', marginTop:2}}>{user?.email}</div>
              <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
                <span className="badge badge-purple">⚡ Level {user?.level || 1}</span>
                <span className="badge badge-gold">⭐ {user?.points || 0} pts</span>
              </div>
            </div>
          </div>

          {!editing ? (
            <>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12, color:'var(--text3)', fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Bio</div>
                <div style={{fontSize:14, color: user?.bio ? 'var(--text)' : 'var(--text3)', fontStyle: user?.bio ? 'normal' : 'italic'}}>
                  {user?.bio || 'No bio yet. Add one to tell the world about yourself!'}
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12, color:'var(--text3)', fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px'}}>Known Skills</div>
                <div className="skills-wrapper">
                  {user?.existingSkills?.length > 0
                    ? user.existingSkills.map(s => <span key={s} className="skill-tag">{s}</span>)
                    : <span style={{fontSize:13, color:'var(--text3)', fontStyle:'italic'}}>No skills added yet</span>}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Skills You Already Know</label>
                <div className="skills-wrapper" style={{marginTop:8}}>
                  {ALL_SKILLS.map(skill => (
                    <span
                      key={skill}
                      className={`skill-tag ${form.existingSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {form.existingSkills.includes(skill) ? '✓ ' : ''}{skill}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{display:'flex', gap:10}}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Profile'}
                </button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="card">
            <div className="section-title">📊 Learning Stats</div>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {[
                {label:'Points Earned', value: user?.points || 0, icon:'⭐'},
                {label:'Current Level', value: `Level ${user?.level || 1}`, icon:'⚡'},
                {label:'Achievements', value: user?.achievements?.length || 0, icon:'🏆'},
                {label:'Known Skills', value: user?.existingSkills?.length || 0, icon:'🧠'},
              ].map(stat => (
                <div key={stat.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'var(--surface2)', borderRadius:10}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{fontSize:18}}>{stat.icon}</span>
                    <span style={{fontSize:13, color:'var(--text2)'}}>{stat.label}</span>
                  </div>
                  <span style={{fontFamily:'Syne, sans-serif', fontWeight:700}}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {user?.achievements?.length > 0 && (
            <div className="card">
              <div className="section-title">🏆 Your Achievements</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {user.achievements.map(a => (
                  <span key={a} className="badge badge-gold">🏅 {a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{background:'rgba(108,99,255,0.05)', borderColor:'rgba(108,99,255,0.2)'}}>
            <div style={{fontSize:13, color:'var(--accent)', fontWeight:600, marginBottom:8}}>💡 Tip</div>
            <p style={{fontSize:13, color:'var(--text2)', lineHeight:1.6}}>
              The more skills you add to your profile, the better SkillForge can recommend an appropriate difficulty level for your learning paths!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
