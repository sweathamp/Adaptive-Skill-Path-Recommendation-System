import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await axios.get('/api/skillpaths');

      // ✅ SAFE DATA HANDLING
      const safeData = Array.isArray(res.data) ? res.data : [];

      const formatted = safeData.map(p => ({
        ...p,
        tasks: p.tasks || []
      }));

      setPaths(formatted);
    } catch (err) {
      console.log("Error fetching paths", err);
    }
    setLoading(false);
  };

  // ✅ SAFE CALCULATIONS
  const totalTasks = paths.flatMap(p => p.tasks || []).length;
  const completedTasks = paths.flatMap(p => p.tasks || []).filter(t => t.completed).length;

  const progress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  if (loading) {
    return <h2 style={{color:"white"}}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>🚀 Dashboard</h1>

      <h3>Welcome, {user?.name || "User"}</h3>

      <div style={{ marginTop: "20px" }}>
        <p>Total Tasks: {totalTasks}</p>
        <p>Completed Tasks: {completedTasks}</p>
        <p>Progress: {progress}%</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Your Skill Paths</h2>

        {paths.length === 0 ? (
          <p>No skill paths yet</p>
        ) : (
          paths.map((p, i) => (
            <div key={i} style={{
              border: "1px solid #555",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "10px"
            }}>
              <h3>{p.skill || "Skill"}</h3>
              <p>Level: {p.level || "Beginner"}</p>
              <p>Tasks: {p.tasks.length}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}