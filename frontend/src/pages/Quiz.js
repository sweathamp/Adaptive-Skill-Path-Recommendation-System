import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SKILLS = ['JavaScript', 'Python', 'React', 'Cybersecurity'];
const SKILL_ICONS = { JavaScript: '🟨', Python: '🐍', React: '⚛️', Cybersecurity: '🔐' };

export default function Quiz() {
  const { fetchProfile } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);

  const startQuiz = async (skill) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/quiz/${skill}`);
      setQuestions(res.data);
      setSelectedSkill(skill);
      setAnswers({});
      setResult(null);
      setCurrent(0);
    } catch {}
    setLoading(false);
  };

  const selectAnswer = (qId, optIdx) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quiz/${selectedSkill}/submit`, { answers });
      setResult(res.data);
      await fetchProfile();
    } catch {}
    setSubmitting(false);
  };

  const reset = () => {
    setSelectedSkill(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  // Skill selection
  if (!selectedSkill) return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quizzes 🧠</h1>
        <p className="page-sub">Test your knowledge and earn bonus points</p>
      </div>
      <div className="grid-2">
        {SKILLS.map(skill => (
          <div
            key={skill}
            className="card"
            style={{cursor:'pointer', transition:'all 0.2s'}}
            onClick={() => startQuiz(skill)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
              <span style={{fontSize:36}}>{SKILL_ICONS[skill]}</span>
              <div>
                <div style={{fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:800}}>{skill}</div>
                <div style={{fontSize:12, color:'var(--text2)'}}>5 questions · ~5 min</div>
              </div>
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <span className="badge badge-gold">⭐ Up to 50 pts</span>
              <span className="badge badge-purple">5 Questions</span>
            </div>
            <div style={{marginTop:14}}>
              <button className="btn btn-primary btn-sm">Start Quiz →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Results
  if (result) return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quiz Results 📊</h1>
      </div>
      <div className="card" style={{marginBottom:20, textAlign:'center', padding:40}}>
        <div style={{fontSize:64, marginBottom:12}}>
          {result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '😊' : '📚'}
        </div>
        <div style={{fontFamily:'Syne, sans-serif', fontSize:32, fontWeight:800, marginBottom:8}}>
          {result.score}/{result.total} Correct
        </div>
        <div style={{fontSize:18, color:'var(--text2)', marginBottom:16}}>{result.percentage}% Score</div>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <span className="badge badge-gold">⭐ +{result.pointsEarned} points earned</span>
          <span className={`badge ${result.percentage >= 80 ? 'badge-green' : result.percentage >= 60 ? 'badge-purple' : 'badge-pink'}`}>
            {result.percentage >= 80 ? '🏆 Excellent!' : result.percentage >= 60 ? '👍 Good job!' : '📖 Keep studying'}
          </span>
        </div>
      </div>

      <div className="section-title">Review Answers</div>
      {result.results.map((r, i) => (
        <div key={r.id} className="card" style={{marginBottom:12, borderColor: r.correct ? 'rgba(67,233,123,0.3)' : 'rgba(255,101,132,0.3)'}}>
          <div style={{fontWeight:600, marginBottom:12, fontSize:14}}>
            {r.correct ? '✅' : '❌'} Q{i+1}: {r.question}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {questions[i]?.options?.map((opt, idx) => (
              <div key={idx} style={{
                padding:'10px 14px',
                borderRadius:8,
                fontSize:13,
                background: idx === r.correctAnswer ? 'rgba(67,233,123,0.1)' : idx === r.userAnswer && !r.correct ? 'rgba(255,101,132,0.1)' : 'var(--surface2)',
                border: `1px solid ${idx === r.correctAnswer ? 'rgba(67,233,123,0.3)' : idx === r.userAnswer && !r.correct ? 'rgba(255,101,132,0.3)' : 'var(--border)'}`,
                color: idx === r.correctAnswer ? 'var(--accent3)' : idx === r.userAnswer && !r.correct ? 'var(--accent2)' : 'var(--text2)'
              }}>
                {idx === r.correctAnswer ? '✓ ' : idx === r.userAnswer && !r.correct ? '✗ ' : ''}{opt}
              </div>
            ))}
          </div>
          <div style={{marginTop:10, fontSize:12, color:'var(--text2)', background:'var(--surface2)', padding:'8px 12px', borderRadius:8}}>
            💡 {r.explanation}
          </div>
        </div>
      ))}

      <div style={{display:'flex', gap:10, marginTop:8}}>
        <button className="btn btn-primary" onClick={reset}>← Back to Quizzes</button>
        <button className="btn btn-secondary" onClick={() => startQuiz(selectedSkill)}>🔄 Retry Quiz</button>
      </div>
    </div>
  );

  // Quiz questions
  const q = questions[current];
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{fontSize:28}}>{SKILL_ICONS[selectedSkill]}</span>
          <div>
            <h1 className="page-title" style={{marginBottom:0}}>{selectedSkill} Quiz 🧠</h1>
            <p className="page-sub">Question {current + 1} of {questions.length}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{marginBottom:24}}>
        <div className="progress-bar">
          <div className="progress-fill purple" style={{width:`${((current + 1) / questions.length) * 100}%`}} />
        </div>
        <div style={{display:'flex', gap:6, marginTop:10}}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width:32, height:32, borderRadius:8,
                border: `1px solid ${i === current ? 'var(--accent)' : answers[questions[i].id] !== undefined ? 'rgba(67,233,123,0.3)' : 'var(--border)'}`,
                background: i === current ? 'rgba(108,99,255,0.15)' : answers[questions[i].id] !== undefined ? 'rgba(67,233,123,0.1)' : 'var(--surface2)',
                color: i === current ? 'var(--accent)' : answers[questions[i].id] !== undefined ? 'var(--accent3)' : 'var(--text2)',
                cursor:'pointer', fontSize:12, fontWeight:600
              }}
            >{i + 1}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div style={{fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, marginBottom:24, lineHeight:1.4}}>
          {q.question}
        </div>
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={`quiz-option ${answers[q.id] === idx ? 'selected' : ''}`}
            onClick={() => selectAnswer(q.id, idx)}
          >
            <span style={{marginRight:10, opacity:0.5}}>{String.fromCharCode(65 + idx)}.</span>
            {opt}
          </button>
        ))}
      </div>

      <div style={{display:'flex', gap:10, justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-secondary" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>← Prev</button>
          <button className="btn btn-secondary" onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))} disabled={current === questions.length - 1}>Next →</button>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-danger btn-sm" onClick={reset}>✕ Quit</button>
          <button
            className="btn btn-primary"
            onClick={submitQuiz}
            disabled={!allAnswered || submitting}
          >
            {submitting ? '⏳ Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${questions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
