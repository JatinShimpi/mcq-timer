import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import './index.css';

// Import utilities
import { loadSessions, saveSessions, loadTheme, saveTheme, generateId } from './utils/storage';
import { exportData, importData } from './utils/importExport';
import { DEFAULT_OPTIONS } from './constants';

// Import auth
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import components
import Header from './components/Header';
import Home from './components/Home';
import SessionEditor from './components/SessionEditor';
import Practice from './components/Practice';
import AnswerKeyReview from './components/AnswerKeyReview';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';
import LandingPage from './components/LandingPage';

// ============================================================================
// MAIN APP CONTENT (the actual timer app at /app)
// ============================================================================

function MainApp() {
  const navigate = useNavigate();
  const { isAuthenticated, syncLocalSessions, fetchSessions } = useAuth();
  const [sessions, setSessions] = useState(() => loadSessions());
  const [currentView, setCurrentView] = useState('home');
  const [currentSession, setCurrentSession] = useState(null);
  const [practiceState, setPracticeState] = useState(null);
  const [theme, setTheme] = useState(() => loadTheme());
  const [hasSynced, setHasSynced] = useState(() => localStorage.getItem('qlock-synced') === 'true');

  // Handle first-time sync after login
  useEffect(() => {
    const performSync = async () => {
      if (isAuthenticated && !hasSynced && sessions.length > 0) {
        const cloudSessions = await syncLocalSessions(sessions);
        if (cloudSessions && cloudSessions.length > 0) {
          setSessions(cloudSessions.map(s => ({
            ...s,
            id: s.client_id,
            _id: s.id,
            timerMode: s.timer_mode,
            timePerQuestion: s.time_per_question,
            totalTime: s.total_time,
          })));
          localStorage.removeItem('qlock-sessions');
          localStorage.setItem('qlock-synced', 'true');
          setHasSynced(true);
        }
      } else if (isAuthenticated && hasSynced) {
        const cloudSessions = await fetchSessions();
        if (cloudSessions) {
          setSessions(cloudSessions.map(s => ({
            ...s,
            id: s.client_id,
            _id: s.id,
            timerMode: s.timer_mode,
            timePerQuestion: s.time_per_question,
            totalTime: s.total_time,
          })));
        }
      }
    };
    performSync();
  }, [isAuthenticated, hasSynced]);

  // Persist sessions to localStorage
  useEffect(() => {
    if (!isAuthenticated && !hasSynced) {
      saveSessions(sessions);
    }
  }, [sessions, isAuthenticated, hasSynced]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView !== 'home') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handleCreateSession();
          break;
        case 'd':
          e.preventDefault();
          setCurrentView('dashboard');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  const handleCreateSession = (template = null) => {
    const newSession = {
      id: generateId(),
      topic: '',
      subtopic: '',
      timePerQuestion: template?.timePerQuestion || 60,
      totalTime: 3600,
      timerMode: template?.timerMode || 'uniform',
      questions: [{
        id: generateId(),
        identifier: 'Q1',
        time: template?.timePerQuestion || 60,
        type: 'mcq-single',
        options: [...DEFAULT_OPTIONS]
      }],
      attempts: [],
      createdAt: new Date().toISOString()
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
    const session = sessions.find(s => s.id === sessionId);
    const sessionName = session?.topic || 'Session';

    toast(`Delete "${sessionName}"?`, {
      action: {
        label: 'Delete',
        onClick: () => {
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          toast.success('Session deleted');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => { },
      },
    });
  };

  const handleStartPractice = (session) => {
    let questionTimes;
    if (session.timerMode === 'uniform') {
      questionTimes = session.questions.map(() => session.timePerQuestion);
    } else if (session.timerMode === 'individual') {
      questionTimes = session.questions.map(q => q.time || session.timePerQuestion);
    } else {
      const timePerQ = Math.floor(session.totalTime / session.questions.length);
      questionTimes = session.questions.map(() => timePerQ);
    }

    setPracticeState({
      session,
      currentIndex: 0,
      results: [],
      questionTimes,
      isPaused: false
    });
    setCurrentView('practice');
  };

  const handlePracticeComplete = (results) => {
    setPracticeState(prev => ({ ...prev, results }));
    setCurrentView('review');
  };

  const handleSaveReviewResults = useCallback((finalResults) => {
    const attempt = {
      id: generateId(),
      date: new Date().toISOString(),
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
  }, [practiceState]);

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentSession(null);
    setPracticeState(null);
  };

  const handleExport = () => {
    exportData(sessions);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = handleFileSelect;
    input.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file, (importedData) => {
        setSessions(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newSessions = importedData.filter(s => !existingIds.has(s.id));
          return [...prev, ...newSessions];
        });
        alert(`Imported ${importedData.length} sessions`);
      });
    }
  };

  return (
    <div className="app">
      <Header
        onHomeClick={handleBackToHome}
        onDashboardClick={() => setCurrentView('dashboard')}
        onSignInClick={() => navigate('/signin')}
        showBack={currentView !== 'home'}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
      />

      <main className="main-content">
        {currentView === 'home' && (
          <Home
            sessions={sessions}
            onCreateSession={handleCreateSession}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onStartPractice={handleStartPractice}
            onExport={handleExport}
            onImport={handleImport}
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

        {currentView === 'review' && practiceState && (
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
      </main>
    </div>
  );
}

// ============================================================================
// SIGN IN PAGE WRAPPER
// ============================================================================

function SignInPage() {
  const navigate = useNavigate();
  return <SignIn onBack={() => navigate('/app')} />;
}

// ============================================================================
// APP WITH AUTH PROVIDER AND ROUTER
// ============================================================================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<MainApp />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
