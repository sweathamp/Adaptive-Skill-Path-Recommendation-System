require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');

const { User, SkillPath, Notification, QuizResult } = require('./models');
const { SKILL_TEMPLATES, QUIZZES } = require('./db');

const app = express();

// ✅ ENV VARIABLES
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const PORT       = process.env.PORT || 5000;
const MONGO_URI  = process.env.MONGO_URI;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.send('SkillForge Backend Running 🚀');
});

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ─── MongoDB CONNECT ─────────────────────────────
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  await seedDemoData();
})
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// ─── SEED DATA ───────────────────────────────────
async function seedDemoData() {
  const exists = await User.findOne({ email: 'demo@skillforge.com' });
  if (!exists) {
    const hash = await bcrypt.hash('password', 10);
    await User.create({
      email: 'demo@skillforge.com',
      password: hash,
      role: 'user',
      name: 'Demo User',
      points: 0,
      level: 1,
      achievements: []
    });
    console.log('🌱 Demo user created');
  }
}

// ─── AUTH MIDDLEWARE ─────────────────────────────
const authenticate = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── AUTH ROUTES ─────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hash, name });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROFILE ─────────────────────────────────────
app.get('/api/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

// ─── SKILLS (IMPORTANT FOR FRONTEND) ─────────────
app.get('/api/skills', (req, res) => {
  res.json(Object.keys(SKILL_TEMPLATES));
});

// ─── SKILL PATHS ────────────────────────────────
app.get('/api/skillpaths', authenticate, async (req, res) => {
  const paths = await SkillPath.find({ userId: req.user.id });
  res.json(paths);
});

app.post('/api/skillpaths', authenticate, async (req, res) => {
  const { skill } = req.body;

  if (!SKILL_TEMPLATES[skill]) {
    return res.status(400).json({ error: 'Skill not found' });
  }

  const tasks = SKILL_TEMPLATES[skill].beginner;

  const path = await SkillPath.create({
    userId: req.user.id,
    skill,
    level: 'beginner',
    tasks
  });

  res.json(path);
});

// ─── SERVER START ───────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});