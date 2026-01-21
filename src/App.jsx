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
import ComingSoon from './components/ComingSoon';
import AboutUs from './components/AboutUs';

// ============================================================================
// MAIN APP CONTENT (the actual timer app at /app)
// ============================================================================

function MainApp() {
  const navigate = useNavigate();
  const { isAuthenticated, syncLocalSessions, fetchSessions, saveSession, deleteSession: deleteCloudSession, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState(() => loadSessions());
  const [currentView, setCurrentView] = useState('home');
  const [currentSession, setCurrentSession] = useState(null);
  const [practiceState, setPracticeState] = useState(null);
  const [theme, setTheme] = useState(() => loadTheme());
  const [hasSynced, setHasSynced] = useState(() => localStorage.getItem('qlock-synced') === 'true');

  // Handle sync after login and fetch on reload
  useEffect(() => {
    const performSync = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      if (!isAuthenticated) return;

      // If we have local sessions that haven't been synced, upload them first
      if (!hasSynced && sessions.length > 0) {
        console.log('Syncing local sessions to cloud...');
        const cloudSessions = await syncLocalSessions(sessions);
        if (cloudSessions && cloudSessions.length > 0) {
          const mappedSessions = cloudSessions.map(s => ({
            ...s,
            id: s.client_id,
            _id: s.id,
            timerMode: s.timer_mode,
            timePerQuestion: s.time_per_question,
            totalTime: s.total_time,
          }));
          setSessions(mappedSessions);
          saveSessions(mappedSessions);
        }
        localStorage.setItem('qlock-synced', 'true');
        setHasSynced(true);
        return;
      }

      // Fetch from cloud (both for post-sync and on reload)
      console.log('Fetching sessions from cloud...');
      const cloudSessions = await fetchSessions();
      console.log('Fetched sessions:', cloudSessions);

      if (cloudSessions && cloudSessions.length > 0) {
        const mappedSessions = cloudSessions.map(s => ({
          ...s,
          id: s.client_id,
          _id: s.id,
          timerMode: s.timer_mode,
          timePerQuestion: s.time_per_question,
          totalTime: s.total_time,
        }));
        setSessions(mappedSessions);
        saveSessions(mappedSessions);
      }

      // Mark as synced
      if (!hasSynced) {
        localStorage.setItem('qlock-synced', 'true');
        setHasSynced(true);
      }
    };
    performSync();
  }, [isAuthenticated, authLoading]);

  // Always persist sessions to localStorage as cache
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

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

  const handleSaveSession = async (session) => {
    // Transform session data for backend (camelCase to snake_case)
    const sessionData = {
      ...session,
      client_id: session.id,
      timer_mode: session.timerMode,
      time_per_question: session.timePerQuestion,
      total_time: session.totalTime,
    };

    // Update local state immediately for responsiveness
    setSessions(prev => {
      const exists = prev.find(s => s.id === session.id);
      if (exists) {
        return prev.map(s => s.id === session.id ? session : s);
      }
      return [...prev, session];
    });
    setCurrentView('home');
    setCurrentSession(null);

    // Sync to cloud if authenticated
    if (isAuthenticated) {
      const savedSession = await saveSession(sessionData);
      if (savedSession) {
        // Update with cloud ID for future updates
        setSessions(prev => prev.map(s =>
          s.id === session.id
            ? { ...s, _id: savedSession.id }
            : s
        ));
        toast.success('Session saved to cloud');
      } else {
        toast.error('Failed to sync to cloud');
      }
    }
  };

  const handleDeleteSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    const sessionName = session?.topic || 'Session';

    toast(`Delete "${sessionName}"?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          setSessions(prev => prev.filter(s => s.id !== sessionId));

          // Delete from cloud if authenticated and has cloud ID
          if (isAuthenticated && session?._id) {
            const deleted = await deleteCloudSession(session._id);
            if (deleted) {
              toast.success('Session deleted');
            } else {
              toast.error('Failed to delete from cloud');
            }
          } else {
            toast.success('Session deleted');
          }
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
            existingTopics={[...new Set(sessions.map(s => s.topic).filter(Boolean))]}
            existingSubtopics={[...new Set(sessions.map(s => s.subtopic).filter(Boolean))]}
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
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
