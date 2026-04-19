const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send("Backend working 🚀");
});

// ✅ PROFILE
app.get('/api/profile', (req, res) => {
  res.json({
    name: "SkillForge User",
    email: "user@gmail.com",
    points: 0,
    level: 1
  });
});

// ✅ SKILL PATHS
app.get('/api/skillpaths', (req, res) => {
  res.json([
    {
      skill: "React",
      level: "Beginner",
      tasks: [
        { title: "Learn JSX", completed: true },
        { title: "Build Components", completed: false }
      ]
    },
    {
      skill: "Node.js",
      level: "Intermediate",
      tasks: [
        { title: "Setup Express", completed: true },
        { title: "Create API", completed: false }
      ]
    }
  ]);
});

// ✅ NOTIFICATIONS
app.get('/api/notifications', (req, res) => {
  res.json([
    { message: "Welcome to SkillForge 🚀" },
    { message: "Start your first skill path!" }
  ]);
});

// ✅ AUTH (dummy working)
app.post('/api/auth/register', (req, res) => {
  res.json({
    token: "dummy_token",
    user: {
      name: req.body.name,
      email: req.body.email
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    token: "dummy_token",
    user: {
      name: "User",
      email: req.body.email
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});