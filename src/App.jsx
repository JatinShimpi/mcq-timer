import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button, TextField, Input, Label } from 'react-aria-components';
import './index.css';

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const STORAGE_KEY = 'mcq-timer-sessions';
const THEME_KEY = 'mcq-timer-theme';

// Session Templates
const SESSION_TEMPLATES = [
  { name: 'GATE Quick (30s)', timePerQuestion: 30, timerMode: 'uniform' },
  { name: 'GATE Standard (60s)', timePerQuestion: 60, timerMode: 'uniform' },
  { name: 'GATE Extended (90s)', timePerQuestion: 90, timerMode: 'uniform' },
  { name: 'JEE Pattern (2min)', timePerQuestion: 120, timerMode: 'uniform' },
  { name: 'Custom Individual', timePerQuestion: 60, timerMode: 'individual' },
];

// Storage utilities
function loadSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sound utility
function playSound(type = 'timeout') {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'timeout') {
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
    } else if (type === 'warning') {
      oscillator.frequency.value = 330;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.2;
    } else if (type === 'complete') {
      oscillator.frequency.value = 660;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not available');
  }
}

// Format time as MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format duration for display
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// Export sessions to JSON
function exportData(sessions) {
  const data = JSON.stringify(sessions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mcq-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import sessions from JSON
function importData(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        callback(data);
      } else {
        alert('Invalid file format');
      }
    } catch {
      alert('Failed to parse file');
    }
  };
  reader.readAsText(file);
}

// Convert seconds to HH:MM:SS object
function secondsToHMS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

// Convert HH:MM:SS object to seconds
function hmsToSeconds({ hours, minutes, seconds }) {
  return (hours * 3600) + (minutes * 60) + seconds;
}

// ============================================================================
// TIME PICKER COMPONENT - Scrollable wheels (alarm-style)
// ============================================================================

function TimePicker({ value, onChange, showHours = true }) {
  const hms = secondsToHMS(value);

  const handleChange = (field, newValue) => {
    const updated = { ...hms, [field]: parseInt(newValue) || 0 };
    onChange(hmsToSeconds(updated));
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutesSeconds = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="time-picker">
      {showHours && (
        <>
          <div className="time-picker-wheel">
            <label className="time-picker-label">H</label>
            <select
              className="time-picker-select"
              value={hms.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
            >
              {hours.map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <span className="time-picker-separator">:</span>
        </>
      )}
      <div className="time-picker-wheel">
        <label className="time-picker-label">M</label>
        <select
          className="time-picker-select"
          value={hms.minutes}
          onChange={(e) => handleChange('minutes', e.target.value)}
        >
          {minutesSeconds.map(m => (
            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
          ))}
        </select>
      </div>
      <span className="time-picker-separator">:</span>
      <div className="time-picker-wheel">
        <label className="time-picker-label">S</label>
        <select
          className="time-picker-select"
          value={hms.seconds}
          onChange={(e) => handleChange('seconds', e.target.value)}
        >
          {minutesSeconds.map(s => (
            <option key={s} value={s}>{s.toString().padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Question type constants
const QUESTION_TYPES = [
  { value: 'mcq-single', label: 'MCQ Single', desc: 'Select one option' },
  { value: 'mcq-multi', label: 'MCQ Multi', desc: 'Select multiple options' },
  { value: 'numerical', label: 'Numerical', desc: 'Enter a number/text' }
];

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D'];

// Calculate analytics from sessions
function calculateAnalytics(sessions) {
  const topicStats = {};
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalTime = 0;

  sessions.forEach(session => {
    const topic = session.topic || 'Uncategorized';
    if (!topicStats[topic]) {
      topicStats[topic] = {
        topic,
        totalQuestions: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        timeout: 0,
        totalTime: 0,
        attempts: 0,
        recentAccuracy: []
      };
    }

    (session.attempts || []).forEach(attempt => {
      topicStats[topic].attempts++;
      (attempt.results || []).forEach(result => {
        topicStats[topic].totalQuestions++;
        totalQuestions++;
        topicStats[topic].totalTime += result.timeTaken || 0;
        totalTime += result.timeTaken || 0;

        if (result.status === 'correct') {
          topicStats[topic].correct++;
          totalCorrect++;
        } else if (result.status === 'incorrect') {
          topicStats[topic].incorrect++;
        } else if (result.status === 'skipped') {
          topicStats[topic].skipped++;
        } else if (result.status === 'timeout') {
          topicStats[topic].timeout++;
        }
      });

      // Track recent accuracy for trend
      const attemptCorrect = (attempt.results || []).filter(r => r.status === 'correct').length;
      const attemptTotal = (attempt.results || []).length;
      if (attemptTotal > 0) {
        topicStats[topic].recentAccuracy.push(attemptCorrect / attemptTotal);
      }
    });
  });

  // Calculate trends
  Object.values(topicStats).forEach(stats => {
    const recent = stats.recentAccuracy.slice(-5);
    const older = stats.recentAccuracy.slice(-10, -5);

    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      stats.trend = Math.round((recentAvg - olderAvg) * 100);
    } else {
      stats.trend = 0;
    }

    stats.accuracy = stats.totalQuestions > 0
      ? Math.round((stats.correct / stats.totalQuestions) * 100)
      : 0;
    stats.avgTime = stats.totalQuestions > 0
      ? Math.round(stats.totalTime / stats.totalQuestions)
      : 0;
  });

  return {
    topicStats: Object.values(topicStats).sort((a, b) => b.totalQuestions - a.totalQuestions),
    overall: {
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      avgTime: totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0,
      totalTime
    }
  };
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [currentView, setCurrentView] = useState('home');
  const [currentSession, setCurrentSession] = useState(null);
  const [practiceState, setPracticeState] = useState(null);
  const [theme, setTheme] = useState(() => loadTheme());
  const fileInputRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Save sessions
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (currentView === 'home') {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleCreateSession();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setCurrentView('dashboard');
        }
      } else if (currentView !== 'practice') {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleBackToHome();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCreateSession = (template = null) => {
    const newSession = {
      id: generateId(),
      topic: '',
      subtopic: '',
      questions: [{ id: generateId(), identifier: 'Q1', time: template?.timePerQuestion || 60 }],
      timerMode: template?.timerMode || 'uniform',
      timePerQuestion: template?.timePerQuestion || 60,
      totalTime: 600,
      createdAt: Date.now(),
      attempts: []
    };
    setCurrentSession(newSession);
    setCurrentView('editor');
  };

  const handleEditSession = (session) => {
    setCurrentSession({ ...session });
    setCurrentView('editor');
  };

  const handleSaveSession = (session) => {
    setSessions(prev => {
      const exists = prev.find(s => s.id === session.id);
      if (exists) {
        return prev.map(s => s.id === session.id ? session : s);
      }
      return [...prev, session];
    });
    setCurrentView('home');
    setCurrentSession(null);
  };

  const handleDeleteSession = (sessionId) => {
    if (confirm('Delete this session and all its attempts?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleStartPractice = (session) => {
    let questionTimes = session.questions.map(q => {
      if (session.timerMode === 'individual') {
        return q.time || 60;
      } else if (session.timerMode === 'total') {
        return Math.floor(session.totalTime / session.questions.length);
      }
      return session.timePerQuestion;
    });

    setPracticeState({
      session,
      currentIndex: 0,
      results: [],
      questionTimes,
      isPaused: false
    });
    setCurrentView('practice');
  };

  // After all timed questions are done, go to answer key review
  const handlePracticeComplete = (results) => {
    setPracticeState(prev => ({ ...prev, results }));
    setCurrentView('answerReview');
  };

  // After user marks correct/incorrect in review, save and show results
  const handleSaveReviewResults = (finalResults) => {
    const attempt = {
      id: generateId(),
      date: Date.now(),
      results: finalResults
    };

    setSessions(prev => prev.map(s => {
      if (s.id === practiceState.session.id) {
        return {
          ...s,
          attempts: [...(s.attempts || []), attempt]
        };
      }
      return s;
    }));

    setPracticeState(prev => ({ ...prev, results: finalResults, completed: true }));
    setCurrentView('results');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentSession(null);
    setPracticeState(null);
  };

  const handleExport = () => {
    exportData(sessions);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file, (importedSessions) => {
        // Merge with existing, avoiding duplicates by ID
        setSessions(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newSessions = importedSessions.filter(s => !existingIds.has(s.id));
          return [...prev, ...newSessions];
        });
        alert(`Imported ${importedSessions.length} sessions`);
      });
    }
    e.target.value = '';
  };

  return (
    <div className={`app theme-${theme}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        style={{ display: 'none' }}
      />

      <Header
        onHomeClick={handleBackToHome}
        onDashboardClick={() => setCurrentView('dashboard')}
        showBack={currentView !== 'home'}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
      />

      {currentView === 'home' && (
        <Home
          sessions={sessions}
          onCreateSession={handleCreateSession}
          onEditSession={handleEditSession}
          onDeleteSession={handleDeleteSession}
          onStartPractice={handleStartPractice}
          onExport={handleExport}
          onImport={handleImport}
          onDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'editor' && currentSession && (
        <SessionEditor
          session={currentSession}
          onSave={handleSaveSession}
          onCancel={handleBackToHome}
          onStart={handleStartPractice}
        />
      )}

      {currentView === 'practice' && practiceState && (
        <Practice
          practiceState={practiceState}
          setPracticeState={setPracticeState}
          onComplete={handlePracticeComplete}
          onQuit={handleBackToHome}
        />
      )}

      {currentView === 'answerReview' && practiceState && (
        <AnswerKeyReview
          practiceState={practiceState}
          onSaveResults={handleSaveReviewResults}
          onHome={handleBackToHome}
        />
      )}

      {currentView === 'results' && practiceState && (
        <Results
          practiceState={practiceState}
          onRetry={() => handleStartPractice(practiceState.session)}
          onHome={handleBackToHome}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          sessions={sessions}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({ onHomeClick, onDashboardClick, showBack, theme, onToggleTheme, currentView }) {
  return (
    <header className="header">
      <div className="header-title" onClick={onHomeClick} role="button" tabIndex={0}>
        <span className="header-title-icon">⏱️</span>
        <span>MCQ Timer</span>
      </div>
      <nav className="header-nav">
        {currentView === 'home' && (
          <Button className="btn btn-ghost" onPress={onDashboardClick} aria-label="Dashboard">
            📊 Dashboard
          </Button>
        )}
        <Button className="btn btn-ghost btn-icon" onPress={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
        {showBack && (
          <Button className="btn btn-ghost" onPress={onHomeClick}>
            ← Back
          </Button>
        )}
      </nav>
    </header>
  );
}

// ============================================================================
// HOME COMPONENT
// ============================================================================

function Home({ sessions, onCreateSession, onEditSession, onDeleteSession, onStartPractice, onExport, onImport, onDashboard }) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="app-container">
      <div className="home-header">
        <div>
          <h1 className="home-title">Your Sessions</h1>
          <p className="home-subtitle">
            Practice time-critical MCQ questions • Press <kbd>N</kbd> for new session
          </p>
        </div>
        <div className="home-actions">
          <Button className="btn btn-secondary btn-sm" onPress={onImport}>
            📥 Import
          </Button>
          <Button className="btn btn-secondary btn-sm" onPress={onExport} isDisabled={sessions.length === 0}>
            📤 Export
          </Button>
          <div className="dropdown">
            <Button className="btn btn-primary btn-lg" onPress={() => setShowTemplates(!showTemplates)}>
              + New Session
            </Button>
            {showTemplates && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { onCreateSession(); setShowTemplates(false); }}>
                  🆕 Blank Session
                </button>
                <div className="dropdown-divider"></div>
                {SESSION_TEMPLATES.map(template => (
                  <button
                    key={template.name}
                    className="dropdown-item"
                    onClick={() => { onCreateSession(template); setShowTemplates(false); }}
                  >
                    ⏱️ {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h2 className="empty-state-title">No sessions yet</h2>
          <p className="empty-state-text">Create your first session or import existing data</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button className="btn btn-primary" onPress={() => onCreateSession()}>
              Create Session
            </Button>
            <Button className="btn btn-secondary" onPress={onImport}>
              Import Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={() => onEditSession(session)}
              onDelete={() => onDeleteSession(session.id)}
              onStart={() => onStartPractice(session)}
            />
          ))}
        </div>
      )}

      <div className="keyboard-hints">
        <span><kbd>N</kbd> New</span>
        <span><kbd>D</kbd> Dashboard</span>
      </div>
    </div>
  );
}

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

function SessionCard({ session, onEdit, onDelete, onStart }) {
  const questionCount = session.questions?.length || 0;
  const attemptCount = session.attempts?.length || 0;
  const lastAttempt = session.attempts?.[session.attempts.length - 1];

  // Calculate last attempt accuracy
  let lastAccuracy = null;
  if (lastAttempt?.results) {
    const correct = lastAttempt.results.filter(r => r.status === 'correct').length;
    lastAccuracy = Math.round((correct / lastAttempt.results.length) * 100);
  }

  return (
    <div className="card session-card">
      <div className="session-card-header">
        <div className="session-card-info">
          <h3 className="card-title">{session.topic || 'Untitled Session'}</h3>
          {session.subtopic && <p className="card-subtitle">{session.subtopic}</p>}
        </div>
        <div className="session-card-actions">
          <Button className="btn btn-ghost btn-sm" onPress={onDelete} aria-label="Delete">🗑️</Button>
          <Button className="btn btn-ghost btn-sm" onPress={onEdit}>Edit</Button>
          <Button className="btn btn-primary btn-sm" onPress={onStart}>Start</Button>
        </div>
      </div>
      <div className="session-card-meta">
        <span className="session-card-meta-item">📝 {questionCount} questions</span>
        <span className="session-card-meta-item">🎯 {attemptCount} attempts</span>
        {lastAttempt && (
          <>
            <span className="session-card-meta-item">
              📅 {new Date(lastAttempt.date).toLocaleDateString()}
            </span>
            {lastAccuracy !== null && (
              <span className={`session-card-meta-item ${lastAccuracy >= 60 ? 'text-success' : 'text-danger'}`}>
                {lastAccuracy}% last
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SESSION EDITOR COMPONENT
// ============================================================================

function SessionEditor({ session, onSave, onCancel, onStart }) {
  const [editSession, setEditSession] = useState(session);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: generateId(),
      identifier: `Q${editSession.questions.length + 1}`,
      time: editSession.timePerQuestion,
      type: 'mcq-single', // default type
      options: [...DEFAULT_OPTIONS]
    };
    setEditSession(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleBulkAdd = () => {
    const input = prompt('How many questions to add?', '10');
    const count = parseInt(input);
    if (!isNaN(count) && count > 0 && count <= 100) {
      const currentLength = editSession.questions.length;
      const newQuestions = Array.from({ length: count }, (_, i) => ({
        id: generateId(),
        identifier: `Q${currentLength + i + 1}`,
        time: editSession.timePerQuestion,
        type: 'mcq-single',
        options: [...DEFAULT_OPTIONS]
      }));
      setEditSession(prev => ({
        ...prev,
        questions: [...prev.questions, ...newQuestions]
      }));
    }
  };

  const handleUpdateQuestion = (id, field, value) => {
    setEditSession(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleDeleteQuestion = (id) => {
    setEditSession(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setEditSession(prev => {
      const questions = [...prev.questions];
      const [removed] = questions.splice(draggedIndex, 1);
      questions.splice(index, 0, removed);
      return { ...prev, questions };
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!editSession.topic.trim()) {
      alert('Please enter a topic name');
      return;
    }
    if (editSession.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(editSession);
  };

  const handleStartPractice = () => {
    if (!editSession.topic.trim()) {
      alert('Please enter a topic name');
      return;
    }
    if (editSession.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(editSession);
    onStart(editSession);
  };

  return (
    <div className="app-container">
      <h1 className="page-title">
        {session.topic ? 'Edit Session' : 'New Session'}
      </h1>

      <div className="form-group">
        <TextField>
          <Label className="form-label">Topic / Subject *</Label>
          <Input
            className="form-input"
            placeholder="e.g., Data Structures - Trees"
            value={editSession.topic}
            onChange={(e) => setEditSession(prev => ({ ...prev, topic: e.target.value }))}
            autoFocus
          />
        </TextField>
      </div>

      <div className="form-group">
        <TextField>
          <Label className="form-label">Subtopic (Optional)</Label>
          <Input
            className="form-input"
            placeholder="e.g., Binary Search Trees"
            value={editSession.subtopic}
            onChange={(e) => setEditSession(prev => ({ ...prev, subtopic: e.target.value }))}
          />
        </TextField>
      </div>

      <div className="form-group">
        <label className="form-label">Timer Mode</label>
        <div className="tabs">
          {[
            { value: 'uniform', label: '⏱️ Uniform', desc: 'Same time for all' },
            { value: 'individual', label: '⚙️ Individual', desc: 'Set per question' },
            { value: 'total', label: '⏳ Total', desc: 'Divide total time' }
          ].map(mode => (
            <button
              key={mode.value}
              className={`tab ${editSession.timerMode === mode.value ? 'active' : ''}`}
              onClick={() => setEditSession(prev => ({ ...prev, timerMode: mode.value }))}
              title={mode.desc}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {editSession.timerMode === 'uniform' && (
        <div className="form-group">
          <label className="form-label">Time per Question</label>
          <TimePicker
            value={editSession.timePerQuestion}
            onChange={(seconds) => setEditSession(prev => ({
              ...prev,
              timePerQuestion: Math.max(10, seconds)
            }))}
            showHours={false}
          />
          <p className="form-hint">{formatDuration(editSession.timePerQuestion)}</p>
        </div>
      )}

      {editSession.timerMode === 'total' && (
        <div className="form-group">
          <label className="form-label">Total Time</label>
          <TimePicker
            value={editSession.totalTime}
            onChange={(seconds) => setEditSession(prev => ({
              ...prev,
              totalTime: Math.max(60, seconds)
            }))}
            showHours={true}
          />
          <p className="form-hint">
            {formatDuration(editSession.totalTime)} total • ≈ {formatDuration(Math.floor(editSession.totalTime / Math.max(1, editSession.questions.length)))} per question
          </p>
        </div>
      )}

      <div className="form-group">
        <div className="question-list-header">
          <label className="form-label">Questions ({editSession.questions.length})</label>
          <div className="question-list-actions">
            <Button className="btn btn-secondary btn-sm" onPress={handleBulkAdd}>
              + Bulk Add
            </Button>
            <Button className="btn btn-secondary btn-sm" onPress={handleAddQuestion}>
              + Add
            </Button>
          </div>
        </div>

        <div className="question-list">
          {editSession.questions.map((question, index) => (
            <div
              key={question.id}
              className={`question-item ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <span className="question-drag-handle">⋮⋮</span>
              <span className="question-number">{index + 1}</span>
              <input
                type="text"
                className="question-input"
                placeholder="Question identifier"
                value={question.identifier}
                onChange={(e) => handleUpdateQuestion(question.id, 'identifier', e.target.value)}
              />
              <select
                className="question-type-select"
                value={question.type || 'mcq-single'}
                onChange={(e) => handleUpdateQuestion(question.id, 'type', e.target.value)}
                title="Question type"
              >
                {QUESTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {editSession.timerMode === 'individual' && (
                <input
                  type="number"
                  className="question-time"
                  min="10"
                  max="3600"
                  value={question.time}
                  onChange={(e) => handleUpdateQuestion(question.id, 'time', parseInt(e.target.value) || 60)}
                  title="Time in seconds"
                />
              )}
              <Button
                className="btn btn-ghost btn-icon question-delete"
                onPress={() => handleDeleteQuestion(question.id)}
                aria-label="Delete question"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="editor-actions">
        <Button className="btn btn-ghost" onPress={onCancel}>Cancel</Button>
        <Button className="btn btn-secondary" onPress={handleSave}>💾 Save</Button>
        <Button className="btn btn-primary btn-lg" onPress={handleStartPractice}>
          🎯 Start Practice
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PRACTICE COMPONENT - With MCQ Options and Numerical Input
// ============================================================================

function Practice({ practiceState, setPracticeState, onComplete, onQuit }) {
  const { session, currentIndex, results, questionTimes, isPaused } = practiceState;
  const currentQuestion = session.questions[currentIndex];
  const questionType = currentQuestion.type || 'mcq-single';
  const options = currentQuestion.options || DEFAULT_OPTIONS;

  const totalTime = questionTimes[currentIndex];
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [warningPlayed, setWarningPlayed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(questionType === 'mcq-multi' ? [] : '');
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Reset answer when question changes
  useEffect(() => {
    setTimeLeft(questionTimes[currentIndex]);
    setWarningPlayed(false);
    const qType = session.questions[currentIndex]?.type || 'mcq-single';
    setSelectedAnswer(qType === 'mcq-multi' ? [] : '');
    // Focus input for numerical questions
    if (qType === 'numerical' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, questionTimes, session.questions]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playSound('timeout');
          handleAction('timeout');
          return 0;
        }

        if (prev === 11 && !warningPlayed) {
          playSound('warning');
          setWarningPlayed(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPaused, currentIndex, warningPlayed]);

  // Keyboard shortcuts for practice mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in numerical input
      if (questionType === 'numerical' && e.target.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAction('done');
        }
        return;
      }

      if (isPaused && e.key !== 'p' && e.key !== 'P' && e.key !== ' ') return;

      const key = e.key.toUpperCase();

      // MCQ option selection via A, B, C, D keys
      if (options.includes(key) && questionType !== 'numerical') {
        e.preventDefault();
        handleOptionSelect(key);
        return;
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleAction('done');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleAction('skipped');
          break;
        case 'p':
        case 'P':
        case ' ':
          e.preventDefault();
          handlePause();
          break;
        case 'Escape':
        case 'q':
        case 'Q':
          e.preventDefault();
          if (confirm('End session early?')) {
            onQuit();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, currentIndex, timeLeft, questionType, options, selectedAnswer]);

  const handleOptionSelect = (option) => {
    if (isPaused) return;

    if (questionType === 'mcq-multi') {
      // Toggle option in array
      setSelectedAnswer(prev => {
        if (prev.includes(option)) {
          return prev.filter(o => o !== option);
        } else {
          return [...prev, option].sort();
        }
      });
    } else {
      // Single select
      setSelectedAnswer(option);
    }
  };

  const handleAction = useCallback((status) => {
    clearInterval(timerRef.current);

    // Determine user answer based on question type
    let userAnswer = null;
    if (status === 'done') {
      if (questionType === 'mcq-multi') {
        userAnswer = selectedAnswer.length > 0 ? selectedAnswer : null;
      } else if (questionType === 'numerical') {
        userAnswer = selectedAnswer.trim() || null;
      } else {
        userAnswer = selectedAnswer || null;
      }
    }

    const result = {
      questionId: currentQuestion.id,
      identifier: currentQuestion.identifier,
      status,
      timeTaken: totalTime - timeLeft,
      totalTime,
      userAnswer,
      questionType
    };

    const newResults = [...results, result];

    if (currentIndex + 1 >= session.questions.length) {
      onComplete(newResults);
    } else {
      setPracticeState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        results: newResults
      }));
    }
  }, [currentIndex, currentQuestion, results, session.questions.length, timeLeft, totalTime, selectedAnswer, questionType, onComplete, setPracticeState]);

  const handlePause = () => {
    setPracticeState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const progress = timeLeft / totalTime;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  let timerClass = '';
  if (progress <= 0.1) timerClass = 'critical';
  else if (progress <= 0.3) timerClass = 'warning';

  // Check if answer is selected
  const hasAnswer = questionType === 'mcq-multi'
    ? selectedAnswer.length > 0
    : selectedAnswer !== '';

  return (
    <div className="timer-container">
      <div className="timer-question">{currentQuestion.identifier}</div>
      <div className="timer-progress-text">
        Question {currentIndex + 1} of {session.questions.length}
        {questionType === 'mcq-multi' && <span className="type-badge">Select Multiple</span>}
        {questionType === 'numerical' && <span className="type-badge">Numerical</span>}
      </div>

      <div className="timer-progress">
        <svg className="timer-svg" viewBox="0 0 260 260">
          <circle className="timer-circle-bg" cx="130" cy="130" r="120" />
          <circle
            className={`timer-circle-progress ${timerClass}`}
            cx="130"
            cy="130"
            r="120"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="timer-content">
          <div className={`timer-time ${timerClass === 'critical' ? 'pulse' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="timer-label">
            {isPaused ? 'PAUSED' : 'remaining'}
          </div>
        </div>
      </div>

      {/* Answer Input Section */}
      <div className="answer-input-section">
        {questionType !== 'numerical' ? (
          // MCQ Options
          <div className="mcq-options">
            {options.map(option => {
              const isSelected = questionType === 'mcq-multi'
                ? selectedAnswer.includes(option)
                : selectedAnswer === option;
              return (
                <button
                  key={option}
                  className={`mcq-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isPaused}
                >
                  <span className="mcq-option-letter">{option}</span>
                  <kbd>{option}</kbd>
                </button>
              );
            })}
          </div>
        ) : (
          // Numerical Input
          <div className="numerical-input-container">
            <input
              ref={inputRef}
              type="text"
              className="numerical-input"
              placeholder="Enter your answer..."
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={isPaused}
              autoComplete="off"
            />
            <p className="numerical-hint">Press Enter to submit</p>
          </div>
        )}

        {/* Selected Answer Display */}
        {hasAnswer && (
          <div className="selected-answer-display">
            Your answer: <strong>
              {questionType === 'mcq-multi' ? selectedAnswer.join(', ') : selectedAnswer}
            </strong>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="answer-buttons answer-buttons-simple">
        <Button
          className={`btn answer-btn answer-btn-done ${hasAnswer ? 'has-answer' : ''}`}
          onPress={() => handleAction('done')}
          isDisabled={isPaused}
        >
          <span className="answer-btn-icon">✓</span>
          <span>Done</span>
          <kbd>Enter</kbd>
        </Button>
        <Button
          className="btn answer-btn answer-btn-skip"
          onPress={() => handleAction('skipped')}
          isDisabled={isPaused}
        >
          <span className="answer-btn-icon">⏭</span>
          <span>Skip</span>
          <kbd>S</kbd>
        </Button>
        <Button
          className="btn answer-btn answer-btn-pause"
          onPress={handlePause}
        >
          <span className="answer-btn-icon">{isPaused ? '▶' : '⏸'}</span>
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
          <kbd>Space</kbd>
        </Button>
      </div>

      <div className="timer-controls">
        <Button className="btn btn-ghost" onPress={onQuit}>
          End Session <kbd>Q</kbd>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// ANSWER KEY REVIEW COMPONENT - Mark Correct/Incorrect after all questions
// ============================================================================

function AnswerKeyReview({ practiceState, onSaveResults, onHome }) {
  const { session, results: initialResults } = practiceState;
  const [reviewResults, setReviewResults] = useState(
    initialResults.map(r => ({
      ...r,
      // Convert 'done' to 'pending' for review, keep 'skipped' and 'timeout'
      finalStatus: r.status === 'done' ? 'pending' : r.status
    }))
  );

  const handleMarkResult = (index, status) => {
    setReviewResults(prev => prev.map((r, i) =>
      i === index ? { ...r, finalStatus: status } : r
    ));
  };

  const handleSubmit = () => {
    // Check if all 'done' questions have been marked
    const pendingCount = reviewResults.filter(r => r.finalStatus === 'pending').length;
    if (pendingCount > 0) {
      if (!confirm(`${pendingCount} question(s) not marked. Continue anyway?`)) {
        return;
      }
    }

    // Convert results to final format
    const finalResults = reviewResults.map(r => ({
      ...r,
      status: r.finalStatus === 'pending' ? 'skipped' : r.finalStatus
    }));

    onSaveResults(finalResults);
  };

  const stats = {
    correct: reviewResults.filter(r => r.finalStatus === 'correct').length,
    incorrect: reviewResults.filter(r => r.finalStatus === 'incorrect').length,
    pending: reviewResults.filter(r => r.finalStatus === 'pending').length,
    skipped: reviewResults.filter(r => r.finalStatus === 'skipped').length,
    timeout: reviewResults.filter(r => r.finalStatus === 'timeout').length
  };

  useEffect(() => {
    playSound('complete');
  }, []);

  return (
    <div className="review-container">
      <div className="review-header">
        <h1 className="review-heading">📝 Answer Key Review</h1>
        <p className="review-subheading">{session.topic}</p>
        <p className="review-hint">Compare with answer key and mark each question</p>
      </div>

      <div className="review-stats-bar">
        <span className="stat-pill correct">✓ {stats.correct}</span>
        <span className="stat-pill incorrect">✗ {stats.incorrect}</span>
        <span className="stat-pill pending">? {stats.pending}</span>
        <span className="stat-pill skipped">⏭ {stats.skipped}</span>
        <span className="stat-pill timeout">⏱ {stats.timeout}</span>
      </div>

      <div className="review-questions">
        {reviewResults.map((result, index) => (
          <div key={index} className={`review-question-card ${result.finalStatus}`}>
            <div className="review-question-info">
              <span className="review-question-number">{result.identifier}</span>
              <span className="review-question-time">
                {result.timeTaken}s / {result.totalTime}s
              </span>
              {result.userAnswer && (
                <span className="review-user-answer">
                  Your answer: <strong>
                    {Array.isArray(result.userAnswer)
                      ? result.userAnswer.join(', ')
                      : result.userAnswer}
                  </strong>
                </span>
              )}
              {result.status === 'timeout' && (
                <span className="review-question-badge timeout">Timed out</span>
              )}
              {result.status === 'skipped' && (
                <span className="review-question-badge skipped">Skipped</span>
              )}
            </div>

            {result.status === 'done' && (
              <div className="review-question-actions">
                <button
                  className={`review-btn correct ${result.finalStatus === 'correct' ? 'active' : ''}`}
                  onClick={() => handleMarkResult(index, 'correct')}
                >
                  ✓ Correct
                </button>
                <button
                  className={`review-btn incorrect ${result.finalStatus === 'incorrect' ? 'active' : ''}`}
                  onClick={() => handleMarkResult(index, 'incorrect')}
                >
                  ✗ Wrong
                </button>
              </div>
            )}

            {result.status !== 'done' && (
              <div className="review-question-status">
                {result.status === 'timeout' && <span className="status-icon">⏱</span>}
                {result.status === 'skipped' && <span className="status-icon">⏭</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="review-actions">
        <Button className="btn btn-primary btn-lg" onPress={handleSubmit}>
          ✅ Submit Results
        </Button>
        <Button className="btn btn-ghost" onPress={onHome}>
          ← Cancel
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// RESULTS COMPONENT - Final Results Display
// ============================================================================

function Results({ practiceState, onRetry, onHome }) {
  const { session, results } = practiceState;

  const stats = useMemo(() => ({
    correct: results.filter(r => r.status === 'correct').length,
    incorrect: results.filter(r => r.status === 'incorrect').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    timeout: results.filter(r => r.status === 'timeout').length
  }), [results]);

  const accuracy = results.length > 0
    ? Math.round((stats.correct / results.length) * 100)
    : 0;

  const avgTime = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length)
    : 0;

  return (
    <div className="results-container">
      <div className="results-header">
        <h1 className="results-title">Session Complete! 🎉</h1>
        <p className="results-subtitle">{session.topic}</p>
      </div>

      <div className="results-stats">
        <div className="results-stat correct">
          <div className="results-stat-value">{stats.correct}</div>
          <div className="results-stat-label">Correct</div>
        </div>
        <div className="results-stat incorrect">
          <div className="results-stat-value">{stats.incorrect}</div>
          <div className="results-stat-label">Incorrect</div>
        </div>
        <div className="results-stat skipped">
          <div className="results-stat-value">{stats.skipped}</div>
          <div className="results-stat-label">Skipped</div>
        </div>
        <div className="results-stat timeout">
          <div className="results-stat-value">{stats.timeout}</div>
          <div className="results-stat-label">Timeout</div>
        </div>
      </div>

      <div className="card results-accuracy-card">
        <div className={`results-accuracy ${accuracy >= 60 ? 'good' : 'bad'}`}>
          {accuracy}%
        </div>
        <div className="results-accuracy-label">Accuracy</div>
        <div className="results-avg-time">
          Avg. time per question: {avgTime}s
        </div>
      </div>

      <div className="review-list">
        <h3 className="review-title">Question Review</h3>
        {results.map((result, index) => (
          <div key={index} className="review-item">
            <div className={`review-item-status ${result.status}`}>
              {result.status === 'correct' && '✓'}
              {result.status === 'incorrect' && '✗'}
              {result.status === 'skipped' && '⏭'}
              {result.status === 'timeout' && '⏱'}
            </div>
            <div className="review-item-info">
              <div className="review-item-question">{result.identifier}</div>
              <div className="review-item-time">
                {result.timeTaken}s / {result.totalTime}s
              </div>
            </div>
            <div className="review-item-bar">
              <div
                className={`review-item-bar-fill ${result.status}`}
                style={{ width: `${(result.timeTaken / result.totalTime) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <Button className="btn btn-primary btn-lg" onPress={onRetry}>
          🔄 Try Again
        </Button>
        <Button className="btn btn-secondary" onPress={onHome}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================

function Dashboard({ sessions, onBack }) {
  const analytics = useMemo(() => calculateAnalytics(sessions), [sessions]);
  const { topicStats, overall } = analytics;

  const weakTopics = topicStats.filter(t => t.accuracy < 60 && t.totalQuestions >= 5);

  return (
    <div className="app-container">
      <div className="dashboard-header">
        <h1 className="page-title">📊 Performance Dashboard</h1>
        <p className="page-subtitle">Track your progress across all topics</p>
      </div>

      {overall.totalQuestions === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📈</div>
          <h2 className="empty-state-title">No data yet</h2>
          <p className="empty-state-text">Complete some practice sessions to see your analytics</p>
          <Button className="btn btn-primary" onPress={onBack}>
            Start Practicing
          </Button>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="dashboard-overall">
            <div className="stat-card">
              <div className="stat-value">{overall.totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-card highlight">
              <div className={`stat-value ${overall.accuracy >= 60 ? 'text-success' : 'text-danger'}`}>
                {overall.accuracy}%
              </div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{overall.avgTime}s</div>
              <div className="stat-label">Avg Time/Question</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatDuration(overall.totalTime)}</div>
              <div className="stat-label">Total Practice Time</div>
            </div>
          </div>

          {/* Weak Areas Alert */}
          {weakTopics.length > 0 && (
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>Weak Areas Detected:</strong> {weakTopics.map(t => t.topic).join(', ')}
                <p className="alert-hint">These topics have accuracy below 60%. Focus more practice here!</p>
              </div>
            </div>
          )}

          {/* Topic Performance Table */}
          <div className="dashboard-section">
            <h2 className="section-title">Performance by Topic</h2>
            <div className="topic-table">
              <div className="topic-table-header">
                <span>Topic</span>
                <span>Questions</span>
                <span>Accuracy</span>
                <span>Avg Time</span>
                <span>Trend</span>
              </div>
              {topicStats.map(topic => (
                <div key={topic.topic} className="topic-table-row">
                  <span className="topic-name">{topic.topic}</span>
                  <span>{topic.totalQuestions}</span>
                  <span className={topic.accuracy >= 60 ? 'text-success' : 'text-danger'}>
                    {topic.accuracy}%
                  </span>
                  <span>{topic.avgTime}s</span>
                  <span className={`trend ${topic.trend > 0 ? 'up' : topic.trend < 0 ? 'down' : ''}`}>
                    {topic.trend > 0 ? '↑' : topic.trend < 0 ? '↓' : '→'} {Math.abs(topic.trend)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy Bar Chart */}
          <div className="dashboard-section">
            <h2 className="section-title">Accuracy Overview</h2>
            <div className="bar-chart">
              {topicStats.slice(0, 8).map(topic => (
                <div key={topic.topic} className="bar-chart-item">
                  <div className="bar-chart-label">{topic.topic}</div>
                  <div className="bar-chart-bar-container">
                    <div
                      className={`bar-chart-bar ${topic.accuracy >= 60 ? 'good' : 'bad'}`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                    <span className="bar-chart-value">{topic.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="dashboard-actions">
        <Button className="btn btn-secondary" onPress={onBack}>
          ← Back to Sessions
        </Button>
      </div>
    </div>
  );
}
