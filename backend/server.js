const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');
const { User, SkillPath, Notification, QuizResult } = require('./models');
const { SKILL_TEMPLATES, QUIZZES } = require('./db');

const app        = express();
const JWT_SECRET = 'skillforge-secret-key-2024';
const PORT       = 5000;
const MONGO_URI  = 'mongodb://127.0.0.1:27017/skillforge';

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Connect MongoDB ──────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('\n✅ MongoDB connected successfully!');
    await seedDemoData();
    console.log('\n====================================');
    console.log('  SkillForge Backend is RUNNING ✅  ');
    console.log('====================================');
    console.log('  URL:  http://localhost:' + PORT);
    console.log('  DB:   mongodb://127.0.0.1:27017/skillforge');
    console.log('  User:  demo@skillforge.com / password');
    console.log('  Admin: admin@skillforge.com / password');
    console.log('====================================\n');
  })
  .catch(err => {
    console.error('\n❌ MongoDB connection failed!');
    console.error('   Error:', err.message);
    console.error('\n   Fix: Open services.msc → find MongoDB → click Start');
    console.error('   Then restart this server.\n');
    process.exit(1);
  });

async function seedDemoData() {
  const demoExists  = await User.findOne({ email: 'demo@skillforge.com' });
  const adminExists = await User.findOne({ email: 'admin@skillforge.com' });
  if (!demoExists) {
    const hashed = await bcrypt.hash('password', 10);
    await User.create({ email: 'demo@skillforge.com', password: hashed, role: 'user', name: 'Alex Chen', bio: 'Passionate learner.', existingSkills: ['HTML', 'CSS'], points: 150, level: 2, achievements: ['First Steps', 'Task Master'] });
    console.log('🌱 Demo user created  → demo@skillforge.com / password');
  } else {
    console.log('✔️  Demo user already exists');
  }
  if (!adminExists) {
    const hashed = await bcrypt.hash('password', 10);
    await User.create({ email: 'admin@skillforge.com', password: hashed, role: 'admin', name: 'Admin User' });
    console.log('🛡️  Admin created      → admin@skillforge.com / password');
  } else {
    console.log('✔️  Admin already exists');
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};
function sanitize(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password; delete obj.__v;
  obj.id = obj._id?.toString();
  return obj;
}
function formatPath(path) {
  const obj = path.toObject ? path.toObject() : { ...path };
  obj.id = obj._id?.toString();
  obj.tasks = (obj.tasks || []).map(t => ({ ...t, id: t._id?.toString() }));
  return obj;
}
async function buildPath(userId, skill, level) {
  const tpl = SKILL_TEMPLATES[skill][level];
  return await SkillPath.create({
    userId, skill, level,
    tasks: tpl.map(t => ({ ...t, completed: false, completedAt: null })),
    totalPoints: tpl.reduce((s, t) => s + t.points, 0),
    earnedPoints: 0
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password and name are all required' });
    const key = email.toLowerCase().trim();
    if (await User.findOne({ email: key })) return res.status(409).json({ error: 'That email is already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: key, password: hashed, role: 'user', name: name.trim() });
    const token = jwt.sign({ id: user._id, role: 'user', email: key }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Registered:', key);
    res.json({ token, user: sanitize(user) });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const key = email.toLowerCase().trim();
    const wantedRole = role || 'user';
    const user = await User.findOne({ email: key, role: wantedRole });
    if (!user) return res.status(401).json({ error: 'No account found with that email / role' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ id: user._id, role: user.role, email: key }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Login:', key, '| role:', wantedRole);
    res.json({ token, user: sanitize(user) });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ─── Profile ──────────────────────────────────────────────────────────────────
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitize(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, existingSkills, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, bio, existingSkills, avatar }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitize(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Skill Paths ──────────────────────────────────────────────────────────────
app.post('/api/skillpath/generate', authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!SKILL_TEMPLATES[skill]) return res.status(400).json({ error: 'Skill not supported yet' });
    const user = await User.findById(req.user.id);
    const n = (user.existingSkills || []).length;
    const level = n >= 5 ? 'advanced' : n >= 2 ? 'intermediate' : 'beginner';
    const path = await buildPath(req.user.id, skill, level);
    await Notification.create({ userId: req.user.id, message: `🎯 Your ${skill} path is ready! Start with Day 1: ${SKILL_TEMPLATES[skill][level][0].title}`, type: 'path_created' });
    res.json(formatPath(path));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/skillpath/generate-custom', authenticate, async (req, res) => {
  try {
    const { skill, level } = req.body;
    if (!SKILL_TEMPLATES[skill]) return res.status(400).json({ error: 'Skill not supported' });
    if (!['beginner','intermediate','advanced'].includes(level)) return res.status(400).json({ error: 'Invalid level' });
    const path = await buildPath(req.user.id, skill, level);
    res.json(formatPath(path));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/skillpaths', authenticate, async (req, res) => {
  try {
    const paths = await SkillPath.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(paths.map(formatPath));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/skillpath/:pathId', authenticate, async (req, res) => {
  try {
    await SkillPath.findOneAndDelete({ _id: req.params.pathId, userId: req.user.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/skillpath/:pathId/task/:taskId/complete', authenticate, async (req, res) => {
  try {
    const path = await SkillPath.findOne({ _id: req.params.pathId, userId: req.user.id });
    if (!path) return res.status(404).json({ error: 'Path not found' });
    const task = path.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!task.completed) {
      task.completed = true;
      task.completedAt = new Date();
      path.earnedPoints += task.points;
      await path.save();
      const user = await User.findById(req.user.id);
      user.points += task.points;
      const allPaths  = await SkillPath.find({ userId: req.user.id });
      const totalDone = allPaths.flatMap(p => p.tasks).filter(t => t.completed).length;
      const ach = user.achievements;
      if (totalDone >= 1  && !ach.includes('First Steps'))   ach.push('First Steps');
      if (totalDone >= 5  && !ach.includes('Task Master'))   ach.push('Task Master');
      if (totalDone >= 10 && !ach.includes('Streak Keeper')) ach.push('Streak Keeper');
      if (user.points >= 100 && !ach.includes('Century Club')) ach.push('Century Club');
      if (user.points >= 500 && !ach.includes('Point Legend')) ach.push('Point Legend');
      user.level = Math.floor(user.points / 100) + 1;
      await user.save();
      await Notification.create({ userId: req.user.id, message: `✅ Task completed: "${task.title}" — +${task.points} points!`, type: 'task_complete' });
      res.json({ path: formatPath(path), user: sanitize(user) });
    } else {
      res.json({ path: formatPath(path) });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    const paths  = await SkillPath.find({ userId: req.user.id });
    const daily  = paths.map(p => { const n = p.tasks.find(t => !t.completed); return n ? `📚 Today's task for ${p.skill}: "${n.title}" — ${n.description}` : null; }).filter(Boolean);
    res.json({
      notifications: notifs.map(n => ({ id: n._id, message: n.message, type: n.type, read: n.read, createdAt: n.createdAt })),
      dailyTasks: daily
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notifications/read', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Quiz ─────────────────────────────────────────────────────────────────────
app.get('/api/quiz/:skill', authenticate, (req, res) => {
  const quiz = QUIZZES[req.params.skill];
  if (!quiz) return res.status(404).json({ error: 'No quiz for this skill' });
  res.json(quiz.map(q => ({ id: q.id, question: q.question, options: q.options })));
});

app.post('/api/quiz/:skill/submit', authenticate, async (req, res) => {
  try {
    const quiz = QUIZZES[req.params.skill];
    if (!quiz) return res.status(404).json({ error: 'No quiz for this skill' });
    const { answers } = req.body;
    let score = 0;
    const results = quiz.map(q => { const ua = answers[q.id]; const c = ua === q.correct; if (c) score++; return { id: q.id, question: q.question, userAnswer: ua, correctAnswer: q.correct, correct: c, explanation: q.explanation }; });
    const pct = Math.round((score / quiz.length) * 100);
    const pts = pct >= 80 ? 50 : pct >= 60 ? 30 : 10;
    const user = await User.findById(req.user.id);
    user.points += pts;
    if (pct === 100 && !user.achievements.includes('Quiz Ace')) user.achievements.push('Quiz Ace');
    user.level = Math.floor(user.points / 100) + 1;
    await user.save();
    await QuizResult.create({ userId: req.user.id, skill: req.params.skill, score, total: quiz.length, percentage: pct });
    await Notification.create({ userId: req.user.id, message: `🧠 Quiz: ${req.params.skill} — ${score}/${quiz.length} (${pct}%) +${pts} pts!`, type: 'quiz_complete' });
    res.json({ score, total: quiz.length, percentage: pct, pointsEarned: pts, results, user: sanitize(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Resources ────────────────────────────────────────────────────────────────
app.get('/api/resources/:skill', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      resources: {
        free: [
          { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Comprehensive web documentation', unlocked: true },
          { name: 'freeCodeCamp', url: 'https://freecodecamp.org', description: 'Free interactive courses', unlocked: true },
          { name: `${req.params.skill} on YouTube`, url: 'https://youtube.com', description: 'Video tutorials', unlocked: true }
        ],
        premium: [
          { name: 'Advanced Course Pack', url: '#', description: 'Expert-level content', unlocked: user.points >= 200, cost: 200 },
          { name: 'Practice Problems Set', url: '#', description: '50+ coding challenges', unlocked: user.points >= 100, cost: 100 },
          { name: 'Project Templates', url: '#', description: 'Starter templates for projects', unlocked: user.points >= 150, cost: 150 }
        ]
      },
      userPoints: user.points
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Admin ────────────────────────────────────────────────────────────────────
app.get('/api/admin/users', authenticate, adminOnly, async (req, res) => {
  try { res.json((await User.find({ role: 'user' }).sort({ createdAt: -1 })).map(sanitize)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const totalUsers  = await User.countDocuments({ role: 'user' });
    const totalPaths  = await SkillPath.countDocuments();
    const allPaths    = await SkillPath.find({}, 'tasks');
    const totalTasks  = allPaths.flatMap(p => p.tasks).filter(t => t.completed).length;
    const agg         = await User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]);
    res.json({ totalUsers, totalPaths, totalTasksCompleted: totalTasks, totalPoints: agg[0]?.total || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/user/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await SkillPath.deleteMany({ userId: req.params.id });
    await Notification.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/skills/available', (req, res) => res.json(Object.keys(SKILL_TEMPLATES)));
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.listen(PORT, () => {
  console.log('\n⏳ Server listening on port ' + PORT + ', waiting for MongoDB...');
});
