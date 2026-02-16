import { useMemo, useState } from 'react';
import { Button } from 'react-aria-components';
import PixelIcon from './PixelIcon';
import { calculateAnalytics } from '../utils/analytics';
import { formatDuration } from '../utils/format';

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard({ sessions, onBack }) {
    const analytics = useMemo(() => calculateAnalytics(sessions), [sessions]);
    const [expandedTopic, setExpandedTopic] = useState(null);

    // Process analytics for display
    const overall = {
        totalQuestions: analytics.totalQuestions,
        accuracy: analytics.accuracy,
        avgTime: analytics.avgTimePerQuestion,
        totalTime: analytics.totalTimeSpent
    };

    // Convert topicStats object to array with calculated values
    const topicStats = Object.entries(analytics.topicStats).map(([topic, data]) => ({
        topic,
        totalQuestions: data.total,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        avgTime: 0,
        trend: 0,
        subtopics: Object.entries(data.subtopics || {}).map(([subtopic, subData]) => ({
            subtopic,
            totalQuestions: subData.total,
            accuracy: subData.total > 0 ? Math.round((subData.correct / subData.total) * 100) : 0
        }))
    }));

    const weakTopics = topicStats.filter(t => t.accuracy < 60 && t.totalQuestions >= 5);

    const handleTopicClick = (topic) => {
        setExpandedTopic(expandedTopic === topic ? null : topic);
    };

    return (
        <div className="app-container">
            <div className="dashboard-header">
                <h1 className="page-title"><PixelIcon name="IconChartBar" size={32} /> Performance Dashboard</h1>
                <p className="page-subtitle">Track your progress across all topics</p>
            </div>

            {overall.totalQuestions === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><PixelIcon name="IconChartLine" size={64} /></div>
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
                            <span className="alert-icon"><PixelIcon name="IconAlertTriangle" size={20} /></span>
                            <div>
                                <strong>Weak Areas Detected:</strong> {weakTopics.map(t => t.topic).join(', ')}
                                <p className="alert-hint">These topics have accuracy below 60%. Focus more practice here!</p>
                            </div>
                        </div>
                    )}

                    {/* Topic Performance Table */}
                    <div className="dashboard-section">
                        <h2 className="section-title">Performance by Topic</h2>
                        <p className="section-hint">Click on a topic to view subtopic breakdown</p>
                        <div className="topic-table">
                            <div className="topic-table-header">
                                <span>Topic</span>
                                <span>Questions</span>
                                <span>Accuracy</span>
                                <span>Avg Time</span>
                                <span>Trend</span>
                            </div>
                            {topicStats.map(topic => (
                                <div key={topic.topic} className="topic-group">
                                    <div
                                        className={`topic-table-row clickable ${expandedTopic === topic.topic ? 'expanded' : ''}`}
                                        onClick={() => handleTopicClick(topic.topic)}
                                    >
                                        <span className="topic-name">
                                            <span className="topic-expand-icon">
                                                {expandedTopic === topic.topic ? <PixelIcon name="IconChevronDown" size={16} /> : <PixelIcon name="IconChevronRight" size={16} />}
                                            </span>
                                            {topic.topic}
                                        </span>
                                        <span>{topic.totalQuestions}</span>
                                        <span className={topic.accuracy >= 60 ? 'text-success' : 'text-danger'}>
                                            {topic.accuracy}%
                                        </span>
                                        <span>{topic.avgTime}s</span>
                                        <span className={`trend ${topic.trend > 0 ? 'up' : topic.trend < 0 ? 'down' : ''}`}>
                                            {topic.trend > 0 ? <PixelIcon name="IconArrowUp" size={16} /> : topic.trend < 0 ? <PixelIcon name="IconArrowDown" size={16} /> : <PixelIcon name="IconArrowRight" size={16} />} {Math.abs(topic.trend)}%
                                        </span>
                                    </div>

                                    {/* Subtopic rows */}
                                    {expandedTopic === topic.topic && (
                                        <div className="subtopic-container">
                                            {topic.subtopics.length > 0 ? (
                                                topic.subtopics.map(sub => (
                                                    <div key={sub.subtopic} className="topic-table-row subtopic-row">
                                                        <span className="topic-name subtopic-name">
                                                            <PixelIcon name="IconCornerDownRight" size={16} /> {sub.subtopic}
                                                        </span>
                                                        <span>{sub.totalQuestions}</span>
                                                        <span className={sub.accuracy >= 60 ? 'text-success' : 'text-danger'}>
                                                            {sub.accuracy}%
                                                        </span>
                                                        <span>—</span>
                                                        <span>—</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="topic-table-row subtopic-row subtopic-empty">
                                                    <span className="topic-name subtopic-name">No subtopics</span>
                                                    <span>—</span>
                                                    <span>—</span>
                                                    <span>—</span>
                                                    <span>—</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                    <PixelIcon name="IconArrowLeft" size={20} /> Back to Sessions
                </Button>
            </div>
        </div>
    );
}
