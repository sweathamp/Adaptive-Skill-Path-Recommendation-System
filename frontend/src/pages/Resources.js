import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SKILLS = ['JavaScript', 'Python', 'React', 'Cybersecurity'];
const SKILL_ICONS = { JavaScript: '🟨', Python: '🐍', React: '⚛️', Cybersecurity: '🔐' };

export default function Resources() {
  const { user } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('JavaScript');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchResources(); }, [selectedSkill]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/resources/${selectedSkill}`);
      setResources(res.data);
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resources 📚</h1>
        <p className="page-sub">Unlock premium learning materials with your points</p>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap'}}>
        <div className="badge badge-gold" style={{fontSize:14, padding:'8px 16px'}}>⭐ {user?.points || 0} points available</div>
        <div style={{fontSize:13, color:'var(--text2)'}}>Earn points by completing tasks and quizzes to unlock premium content</div>
      </div>

      {/* Skill filter */}
      <div style={{display:'flex', gap:8, marginBottom:24, flexWrap:'wrap'}}>
        {SKILLS.map(s => (
          <button
            key={s}
            className={`btn ${selectedSkill === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedSkill(s)}
          >
            {SKILL_ICONS[s]} {s}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : resources && (
        <>
          <div className="section-title">🆓 Free Resources</div>
          <div className="grid-3" style={{marginBottom:24}}>
            {resources.resources.free.map((r, i) => (
              <div key={i} className="card" style={{borderColor:'rgba(67,233,123,0.2)'}}>
                <div style={{fontSize:24, marginBottom:10}}>📗</div>
                <div style={{fontFamily:'Syne, sans-serif', fontWeight:700, marginBottom:6}}>{r.name}</div>
                <div style={{fontSize:12, color:'var(--text2)', marginBottom:14, lineHeight:1.5}}>{r.description}</div>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <button className="btn btn-success btn-sm">Open Resource →</button>
                </a>
              </div>
            ))}
          </div>

          <div className="section-title">🔒 Premium Resources</div>
          <div className="grid-3">
            {resources.resources.premium.map((r, i) => (
              <div key={i} className="card" style={{borderColor: r.unlocked ? 'rgba(255,215,0,0.3)' : 'var(--border)', opacity: r.unlocked ? 1 : 0.7}}>
                <div style={{fontSize:24, marginBottom:10}}>{r.unlocked ? '📕' : '🔒'}</div>
                <div style={{fontFamily:'Syne, sans-serif', fontWeight:700, marginBottom:6}}>{r.name}</div>
                <div style={{fontSize:12, color:'var(--text2)', marginBottom:10, lineHeight:1.5}}>{r.description}</div>
                {!r.unlocked && (
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:12, color:'var(--text3)', marginBottom:6}}>Required: {r.cost} pts</div>
                    <div className="progress-bar">
                      <div className="progress-fill gold" style={{width:`${Math.min(100, ((user?.points || 0) / r.cost) * 100)}%`}} />
                    </div>
                    <div style={{fontSize:11, color:'var(--text3)', marginTop:4}}>
                      {Math.max(0, r.cost - (user?.points || 0))} more points needed
                    </div>
                  </div>
                )}
                <button
                  className={`btn btn-sm ${r.unlocked ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={!r.unlocked}
                >
                  {r.unlocked ? '🔓 Access Content →' : `🔒 Locked (${r.cost} pts)`}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card" style={{marginTop:24, background:'rgba(108,99,255,0.05)', borderColor:'rgba(108,99,255,0.2)'}}>
        <div style={{display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{fontSize:32}}>💡</div>
          <div>
            <div style={{fontFamily:'Syne, sans-serif', fontWeight:700, marginBottom:4}}>How to earn more points</div>
            <div style={{fontSize:13, color:'var(--text2)', lineHeight:1.6}}>
              ✅ Complete learning tasks (+10–50 pts each) &nbsp;·&nbsp;
              🧠 Ace quizzes (+10–50 pts) &nbsp;·&nbsp;
              🏆 Unlock achievements for bonus rewards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
