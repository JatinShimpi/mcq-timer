import { useState } from 'react';
import { Button } from 'react-aria-components';
import { SESSION_PATTERNS } from '../constants';
import SessionCard from './SessionCard';
import PixelIcon from './PixelIcon';

// ============================================================================
// HOME COMPONENT
// ============================================================================

export default function Home({ sessions, onCreateSession, onEditSession, onDeleteSession, onStartPractice, onExport, onImport }) {
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
            </div>
            <div className="home-actions">
                <Button className="btn btn-secondary btn-sm" onPress={onImport}>
                    <PixelIcon name="IconDownload" size={20} /> Import
                </Button>
                <Button className="btn btn-secondary btn-sm" onPress={onExport} isDisabled={sessions.length === 0}>
                    <PixelIcon name="IconUpload" size={20} /> Export
                </Button>
                {sessions.length > 0 && (
                    <div className="dropdown">
                        <Button className="btn btn-primary btn-sm" onPress={() => setShowTemplates(!showTemplates)}>
                            + New Session
                        </Button>
                        {showTemplates && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => { onCreateSession(); setShowTemplates(false); }}>
                                    <PixelIcon name="IconPlus" size={20} /> Blank Session
                                </button>
                                <div className="dropdown-divider"></div>
                                {SESSION_PATTERNS.slice(1).map(template => (
                                    <button
                                        key={template.name}
                                        className="dropdown-item"
                                        onClick={() => { onCreateSession(template); setShowTemplates(false); }}
                                    >
                                        <PixelIcon name="IconClock" size={20} /> {template.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <PixelIcon name="IconBookOpen" size={64} />
                    </div>
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
