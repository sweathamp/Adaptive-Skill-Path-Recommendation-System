const mongoose = require('mongoose');

// ─── User Schema ──────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['user', 'admin'], default: 'user' },
  name:           { type: String, required: true, trim: true },
  bio:            { type: String, default: '' },
  avatar:         { type: String, default: null },
  existingSkills: { type: [String], default: [] },
  points:         { type: Number, default: 0 },
  level:          { type: Number, default: 1 },
  achievements:   { type: [String], default: [] },
}, { timestamps: true });

// ─── Skill Path Schema ────────────────────────────────────────────────────────
const TaskSchema = new mongoose.Schema({
  day:         { type: Number, required: true },
  title:       { type: String, required: true },
  description: { type: String },
  points:      { type: Number, default: 10 },
  resources:   { type: [String], default: [] },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { _id: true });

const SkillPathSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill:       { type: String, required: true },
  level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  tasks:       { type: [TaskSchema], default: [] },
  totalPoints: { type: Number, default: 0 },
  earnedPoints:{ type: Number, default: 0 },
}, { timestamps: true });

// ─── Notification Schema ──────────────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    { type: String, default: 'info' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

// ─── Quiz Result Schema ───────────────────────────────────────────────────────
const QuizResultSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill:      { type: String, required: true },
  score:      { type: Number, required: true },
  total:      { type: Number, required: true },
  percentage: { type: Number, required: true },
}, { timestamps: true });

module.exports = {
  User:         mongoose.model('User', UserSchema),
  SkillPath:    mongoose.model('SkillPath', SkillPathSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  QuizResult:   mongoose.model('QuizResult', QuizResultSchema),
};
