require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');
const { User, SkillPath, Notification, QuizResult } = require('./models');
const { SKILL_TEMPLATES, QUIZZES } = require('./db');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'skillforge-secret-key';
const PORT       = process.env.PORT || 5000;
const MONGO_URI  = process.env.MONGO_URI;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ FIXED MONGODB CONNECTION
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('\n✅ MongoDB connected successfully!');
    await seedDemoData();
    console.log('\n🚀 SkillForge Backend RUNNING');
  })
  .catch(err => {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error:', err.message);
    process.exit(1);
  });

// Dummy data seed
async function seedDemoData() {
  const demoExists = await User.findOne({ email: 'demo@skillforge.com' });
  if (!demoExists) {
    const hashed = await bcrypt.hash('password', 10);
    await User.create({
      email: 'demo@skillforge.com',
      password: hashed,
      role: 'user',
      name: 'Demo User'
    });
    console.log('🌱 Demo user created');
  }
}

// 🔐 AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashed, name });

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
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧠 TEST ROUTE
app.get('/', (req, res) => {
  res.send('SkillForge Backend Running 🚀');
});

// ❤️ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});