const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= ROOT =================
app.get('/', (req, res) => {
  res.send("Backend working 🚀");
});

// ================= PROFILE =================
app.get('/api/profile', (req, res) => {
  res.json({
    name: "SkillForge User",
    email: "user@gmail.com",
    points: 0,
    level: 1
  });
});

// ================= SKILLS LIST =================
app.get('/api/skills', (req, res) => {
  res.json([
    "React",
    "Node.js",
    "MongoDB",
    "Java",
    "Python",
    "Machine Learning"
  ]);
});

// ================= SKILL PATHS (GET) =================
app.get('/api/skillpaths', (req, res) => {
  res.json([]);
});

// ================= GENERATE SKILL PATH =================
app.post('/api/skillpaths', (req, res) => {
  const { skill } = req.body;

  res.json({
    skill,
    level: "Beginner",
    tasks: [
      { title: "Learn Basics", completed: false },
      { title: "Build Mini Project", completed: false },
      { title: "Build Full Project", completed: false }
    ]
  });
});

// ================= AUTH =================
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