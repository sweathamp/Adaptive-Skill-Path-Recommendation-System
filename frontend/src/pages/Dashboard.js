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
      
      // ✅ SAFE FIX
      const safeData = res.data.map(p => ({
        ...p,
        tasks: p.tasks || []
      }));

      setPaths(safeData);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // ✅ SAFE CALCULATIONS
  const totalTasks = paths.flatMap(p => p.tasks || []).length;
  const completedTasks = paths.flatMap(p => p.tasks || []).filter(t => t.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <h1 style={{color:"white"}}>Dashboard Loaded 🚀</h1>

      <p style={{color:"white"}}>
        Welcome {user?.name || "User"}
      </p>

      <p style={{color:"white"}}>
        Total Tasks: {totalTasks}
      </p>

      <p style={{color:"white"}}>
        Completed: {completedTasks}
      </p>

      <p style={{color:"white"}}>
        Progress: {overallProgress}%
      </p>

      <button onClick={() => navigate('/skills')}>
        Go to Skills
      </button>
    </div>
  );
}