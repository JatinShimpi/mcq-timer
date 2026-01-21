import { useMemo } from 'react';
import { Button } from 'react-aria-components';

// ============================================================================
// RESULTS COMPONENT - Final Results Display
// ============================================================================

export default function Results({ practiceState, onRetry, onHome }) {
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
