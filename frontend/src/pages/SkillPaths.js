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
        axios.get('/api/skills') // ✅ FIXED
      ]);

      setPaths(Array.isArray(pathsRes.data) ? pathsRes.data : []);
      setAvailable(Array.isArray(skillsRes.data) ? skillsRes.data : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setPaths([]);
      setAvailable([]);
    }
    setLoading(false);
  };

  const generatePath = async () => {
    if (!selectedSkill) return;

    setGenerating(true);
    try {
      const res = await axios.post('/api/skillpaths', { // ✅ FIXED
        skill: selectedSkill
      });
      setGeneratedPath(res.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Error generating path');
    }
    setGenerating(false);
  };

  const generateCustomPath = async (level) => {
    setGenerating(true);
    try {
      const res = await axios.post('/api/skillpaths/custom', { // ✅ FIXED
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

    if (generatedPath) {
      setExpandedPath(generatedPath.id || generatedPath._id);
    }
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
    } catch {
      alert('Failed to delete path');
    }
  };

  const completeTask = async (pathId, taskId) => {
    setCompleting(taskId);
    try {
      const res = await axios.post(`/api/skillpath/${pathId}/task/${taskId}/complete`);
      const updatedPath = res.data.path;

      setPaths(prev =>
        prev.map(p => (p.id || p._id) === pathId ? updatedPath : p)
      );

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
        <p style={{ color: 'var(--text2)', marginTop: 12 }}>
          Loading skill paths...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Skill Paths 🗺️</h1>
        <p className="page-sub">
          AI-generated learning paths tailored to your level
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {paths.length} active path{paths.length !== 1 ? 's' : ''}
        </div>

        <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
          ⚡ Generate New Path
        </button>
      </div>

      {paths.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <div className="empty-text">No skill paths yet</div>

            <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
              ⚡ Generate Your First Path
            </button>
          </div>
        </div>
      ) : (
        (paths || []).map(path => {
          const pathId = getPathId(path);
          const tasks = Array.isArray(path.tasks) ? path.tasks : [];
          const done = tasks.filter(t => t.completed).length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          const isExpanded = expandedPath === pathId;

          return (
            <div key={pathId} className="path-card">
              <div className="path-header">
                <div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span>{SKILL_ICONS[path.skill] || '📘'}</span>
                    <span className="path-skill">{path.skill}</span>
                  </div>
                </div>
              </div>

              <div className="path-progress-text">{pct}% complete</div>
              <div className="progress-bar">
                <div className="progress-fill purple" style={{ width: `${pct}%` }} />
              </div>

              {isExpanded && tasks.map(task => (
                <div key={getTaskId(task)} className="task-card">
                  {task.title}
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* MODAL */}
      {showGenModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>⚡ Generate Skill Path</h2>

            {!generatedPath ? (
              <>
                <div className="skills-wrapper">
                  {available.map(skill => (
                    <span
                      key={skill}
                      className={`skill-tag ${selectedSkill === skill ? 'selected' : ''}`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      {SKILL_ICONS[skill] || '📘'} {skill}
                    </span>
                  ))}
                </div>

                <button
                  className="btn btn-primary btn-full"
                  onClick={generatePath}
                  disabled={!selectedSkill || generating}
                >
                  {generating ? 'Generating...' : 'Generate Skill Path'}
                </button>
              </>
            ) : (
              <>
                <div>{generatedPath.skill} Path Generated ✅</div>

                <button className="btn btn-primary btn-full" onClick={acceptPath}>
                  Accept Path
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}