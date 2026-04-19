import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SKILL_ICONS = {
  JavaScript: '🟨',
  Python: '🐍',
  React: '⚛️',
  Cybersecurity: '🔐'
};

export default function SkillPaths() {
  const { user, fetchProfile } = useAuth();
  const [paths, setPaths] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [generatedPath, setGeneratedPath] = useState(null);
  const [expandedPath, setExpandedPath] = useState(null);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pathsRes, skillsRes] = await Promise.all([
        axios.get('/api/skillpaths'),
        axios.get('/api/skills/available')
      ]);
      setPaths(pathsRes.data);
      setAvailable(skillsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const generatePath = async () => {
    if (!selectedSkill) return;
    setGenerating(true);
    try {
      const res = await axios.post('/api/skillpath/generate', { skill: selectedSkill });
      setGeneratedPath(res.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Error generating path');
    }
    setGenerating(false);
  };

  const generateCustomPath = async (level) => {
    setGenerating(true);
    try {
      const res = await axios.post('/api/skillpath/generate-custom', {
        skill: selectedSkill,
        level
      });
      setGeneratedPath(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error generating path');
    }
    setGenerating(false);
  };

  const acceptPath = async () => {
    await fetchData();
    if (fetchProfile) await fetchProfile();
    setShowGenModal(false);
    setGeneratedPath(null);
    setSelectedSkill('');
    if (generatedPath) setExpandedPath(generatedPath.id || generatedPath._id);
  };

  const closeModal = () => {
    setShowGenModal(false);
    setGeneratedPath(null);
    setSelectedSkill('');
  };

  const deletePath = async (pathId) => {
    if (!window.confirm('Remove this skill path?')) return;
    try {
      await axios.delete(`/api/skillpath/${pathId}`);
      setPaths(prev => prev.filter(p => (p.id || p._id) !== pathId));
    } catch (err) {
      alert('Failed to delete path');
    }
  };

  const completeTask = async (pathId, taskId) => {
    setCompleting(taskId);
    try {
      const res = await axios.post(`/api/skillpath/${pathId}/task/${taskId}/complete`);
      const updatedPath = res.data.path;
      setPaths(prev => prev.map(p => (p.id || p._id) === pathId ? updatedPath : p));
      if (fetchProfile) await fetchProfile();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
    setCompleting(null);
  };

  const getPathId = (path) => path.id || path._id;
  const getTaskId = (task) => task.id || task._id;

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text2)', marginTop: 12 }}>Loading skill paths...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Skill Paths 🗺️</h1>
        <p className="page-sub">
          AI-generated learning paths tailored to your level
        </p>
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {paths.length} active path{paths.length !== 1 ? 's' : ''}
        </div>
        <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
          ⚡ Generate New Path
        </button>
      </div>

      {/* Empty state */}
      {paths.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <div className="empty-text">No skill paths yet</div>
            <div className="empty-sub" style={{ marginBottom: 20 }}>
              Generate your first AI-powered learning path to get started
            </div>
            <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
              ⚡ Generate Your First Path
            </button>
          </div>
        </div>
      ) : (
        paths.map(path => {
          const pathId = getPathId(path);
          const done = path.tasks.filter(t => t.completed).length;
          const pct = Math.round((done / path.tasks.length) * 100);
          const isExpanded = expandedPath === pathId;

          return (
            <div key={pathId} className="path-card">
              {/* Path Header */}
              <div className="path-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 24 }}>
                      {SKILL_ICONS[path.skill] || '📘'}
                    </span>
                    <span className="path-skill">{path.skill}</span>
                    <span className={`level-badge level-${path.level}`}>
                      {path.level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)' }}>
                    <span>📅 {path.tasks.length} days</span>
                    <span>⭐ {path.earnedPoints}/{path.totalPoints} pts</span>
                    <span>✅ {done}/{path.tasks.length} tasks done</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExpandedPath(isExpanded ? null : pathId)}
                  >
                    {isExpanded ? '↑ Collapse' : '↓ Expand'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deletePath(pathId)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="path-progress-text">{pct}% complete</div>
              <div className="progress-bar" style={{ marginBottom: isExpanded ? 20 : 0 }}>
                <div className="progress-fill purple" style={{ width: `${pct}%` }} />
              </div>

              {/* Task List */}
              {isExpanded && (
                <div>
                  {path.tasks.map(task => {
                    const taskId = getTaskId(task);
                    return (
                      <div
                        key={taskId}
                        className={`task-card ${task.completed ? 'completed' : ''}`}
                      >
                        <div className="task-day">D{task.day}</div>
                        <div className="task-info">
                          <div
                            className="task-title"
                            style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                          >
                            {task.title}
                          </div>
                          <div className="task-desc">{task.description}</div>
                          <div className="task-points">
                            ⭐ {task.points} pts
                            {task.completed ? ' — earned!' : ''}
                          </div>
                          {task.resources && task.resources.length > 0 && (
                            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {task.resources.map((r, i) => (
                                <span key={i} style={{
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  background: 'rgba(108,99,255,0.08)',
                                  border: '1px solid rgba(108,99,255,0.15)',
                                  borderRadius: 20,
                                  color: 'var(--text3)'
                                }}>
                                  📖 {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          className={`task-check ${task.completed ? 'done' : ''}`}
                          onClick={() => !task.completed && completeTask(pathId, taskId)}
                          disabled={task.completed || completing === taskId}
                          title={task.completed ? 'Completed!' : 'Mark as complete'}
                        >
                          {completing === taskId ? '⏳' : task.completed ? '✓' : ''}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">⚡ Generate Skill Path</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {!generatedPath ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                  Choose a skill and we'll generate a personalized learning path based
                  on your existing knowledge ({user?.existingSkills?.length || 0} skills detected).
                </p>

                <div className="form-group">
                  <label className="form-label">Select Skill</label>
                  <div className="skills-wrapper">
                    {available.map(skill => (
                      <span
                        key={skill}
                        className={`skill-tag ${selectedSkill === skill ? 'selected' : ''}`}
                        onClick={() => setSelectedSkill(skill)}
                        style={{ fontSize: 14, padding: '8px 16px' }}
                      >
                        {SKILL_ICONS[skill] || '📘'} {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedSkill && (
                  <div style={{
                    padding: 14,
                    background: 'rgba(108,99,255,0.05)',
                    border: '1px solid rgba(108,99,255,0.15)',
                    borderRadius: 10,
                    marginBottom: 20,
                    fontSize: 13
                  }}>
                    <strong>Detected level:</strong>{' '}
                    <span style={{ color: 'var(--accent)' }}>
                      {(user?.existingSkills?.length || 0) >= 5
                        ? 'Advanced'
                        : (user?.existingSkills?.length || 0) >= 2
                        ? 'Intermediate'
                        : 'Beginner'}
                    </span>
                    {' '}— based on {user?.existingSkills?.length || 0} known skills.
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full"
                  onClick={generatePath}
                  disabled={!selectedSkill || generating}
                >
                  {generating
                    ? '⏳ Generating...'
                    : `⚡ Generate ${selectedSkill || 'Skill'} Path`}
                </button>
              </>
            ) : (
              <>
                {/* Preview generated path */}
                <div style={{
                  padding: 16,
                  background: 'rgba(67,233,123,0.05)',
                  border: '1px solid rgba(67,233,123,0.2)',
                  borderRadius: 12,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>
                      {SKILL_ICONS[generatedPath.skill] || '📘'}
                    </span>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {generatedPath.skill} Path
                      </div>
                      <span className={`level-badge level-${generatedPath.level}`}>
                        {generatedPath.level}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {generatedPath.tasks.length} days · {generatedPath.totalPoints} pts available
                  </div>
                </div>

                {/* Task preview */}
                <div style={{ marginBottom: 16, maxHeight: 220, overflowY: 'auto' }}>
                  {generatedPath.tasks.slice(0, 4).map(t => (
                    <div key={getTaskId(t)} style={{
                      display: 'flex', gap: 10, padding: '10px 0',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span style={{
                        fontSize: 12, color: 'var(--accent)',
                        fontWeight: 700, minWidth: 32
                      }}>
                        D{t.day}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.description}</div>
                      </div>
                    </div>
                  ))}
                  {generatedPath.tasks.length > 4 && (
                    <div style={{
                      fontSize: 12, color: 'var(--text3)',
                      padding: '10px 0', textAlign: 'center'
                    }}>
                      +{generatedPath.tasks.length - 4} more days...
                    </div>
                  )}
                </div>

                {/* Difficulty adjustment */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
                    Not the right level? Adjust difficulty:
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => generateCustomPath('beginner')}
                      disabled={generating}
                    >
                      🌱 Easier
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => generateCustomPath('intermediate')}
                      disabled={generating}
                    >
                      ⚡ Standard
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => generateCustomPath('advanced')}
                      disabled={generating}
                    >
                      🔥 Advanced
                    </button>
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={acceptPath}>
                  ✅ Accept This Path
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}