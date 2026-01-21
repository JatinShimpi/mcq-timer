import { useState, useEffect } from 'react';
import { Button } from 'react-aria-components';
import { toast } from 'sonner';
import { playSound } from '../utils/sound';

// ============================================================================
// ANSWER KEY REVIEW COMPONENT - Mark Correct/Incorrect after all questions
// ============================================================================

export default function AnswerKeyReview({ practiceState, onSaveResults, onHome }) {
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

        const submitResults = () => {
            // Convert results to final format
            const finalResults = reviewResults.map(r => ({
                ...r,
                status: r.finalStatus === 'pending' ? 'skipped' : r.finalStatus
            }));
            onSaveResults(finalResults);
        };

        if (pendingCount > 0) {
            toast(`${pendingCount} question(s) not marked`, {
                description: 'Unmarked questions will be counted as skipped',
                action: {
                    label: 'Continue',
                    onClick: submitResults,
                },
                cancel: {
                    label: 'Go Back',
                    onClick: () => { },
                },
            });
            return;
        }

        submitResults();
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
