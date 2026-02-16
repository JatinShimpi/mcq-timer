import { Button } from 'react-aria-components';
import PixelIcon from './PixelIcon';

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

export default function SessionCard({ session, onEdit, onDelete, onStart }) {
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
                    <Button className="btn btn-ghost btn-sm" onPress={onDelete} aria-label="Delete">
                        <PixelIcon name="IconTrash" size={20} />
                    </Button>
                    <Button className="btn btn-ghost btn-sm" onPress={onEdit}>Edit</Button>
                    <Button className="btn btn-primary btn-sm" onPress={onStart}>Start</Button>
                </div>
            </div>
            <div className="session-card-meta">
                <span className="session-card-meta-item">
                    <PixelIcon name="IconList" size={16} /> {questionCount} questions
                </span>
                <span className="session-card-meta-item">
                    <PixelIcon name="IconTarget" size={16} /> {attemptCount} attempts
                </span>
                {lastAttempt && (
                    <>
                        <span className="session-card-meta-item">
                            <PixelIcon name="IconCalendar" size={16} /> {new Date(lastAttempt.date).toLocaleDateString()}
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
