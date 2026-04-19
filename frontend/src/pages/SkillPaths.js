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

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FIXED FETCH
  const fetchData = async () => {
    try {
      const [pathsRes, skillsRes] = await Promise.all([
        axios.get('/api/skillpaths'),
        axios.get('/api/skills') // ✅ FIXED
      ]);

      setPaths(Array.isArray(pathsRes.data) ? pathsRes.data : []);
      setAvailable(Array.isArray(skillsRes.data) ? skillsRes.data : []);

    } catch (err) {
      console.log("Fetch error", err);
    }
    setLoading(false);
  };

  // ✅ FIXED GENERATE
  const generatePath = async () => {
    if (!selectedSkill) return;

    setGenerating(true);
    try {
      const res = await axios.post('/api/skillpaths', { // ✅ FIXED
        skill: selectedSkill
      });

      setGeneratedPath(res.data);

    } catch (err) {
      console.log(err);
      alert("Error generating path");
    }
    setGenerating(false);
  };

  const acceptPath = async () => {
    await fetchData();
    await fetchProfile();
    setShowGenModal(false);
    setGeneratedPath(null);
    setSelectedSkill('');
  };

  if (loading) return <div style={{color:"white"}}>Loading...</div>;

  return (
    <div>
      <h1 style={{color:"white"}}>Skill Paths 🗺️</h1>

      <button onClick={() => setShowGenModal(true)}>
        ⚡ Generate New Path
      </button>

      {paths.length === 0 ? (
        <p style={{color:"white"}}>No paths yet</p>
      ) : (
        paths.map((p, i) => (
          <div key={i} style={{color:"white", marginTop:10}}>
            {p.skill} - {p.level}
          </div>
        ))
      )}

      {/* MODAL */}
      {showGenModal && (
        <div style={{marginTop:20, padding:20, border:"1px solid white"}}>
          
          <h2 style={{color:"white"}}>Generate Skill Path</h2>

          {/* SKILLS */}
          <div>
            {available.length === 0 ? (
              <p style={{color:"red"}}>No skills available ❌</p>
            ) : (
              available.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    margin: 5,
                    background: selectedSkill === skill ? "purple" : "gray",
                    color: "white"
                  }}
                >
                  {SKILL_ICONS[skill] || '📘'} {skill}
                </button>
              ))
            )}
          </div>

          <br />

          <button
            onClick={generatePath}
            disabled={!selectedSkill || generating}
          >
            {generating ? "Generating..." : "🚀 Generate"}
          </button>

          {/* RESULT */}
          {generatedPath && (
            <div style={{marginTop:20, color:"white"}}>
              <h3>{generatedPath.skill}</h3>
              <p>{generatedPath.level}</p>

              <ul>
                {generatedPath.tasks.map((t, i) => (
                  <li key={i}>{t.title}</li>
                ))}
              </ul>

              <button onClick={acceptPath}>
                ✅ Accept Path
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}