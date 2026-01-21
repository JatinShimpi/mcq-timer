import { useState } from 'react';
import { Button, TextField, Input, Label } from 'react-aria-components';
import { toast } from 'sonner';
import { QUESTION_TYPES, DEFAULT_OPTIONS } from '../constants';
import { generateId } from '../utils/storage';
import { formatDuration } from '../utils/format';
import TimePicker from './TimePicker';

// ============================================================================
// SESSION EDITOR COMPONENT
// ============================================================================

export default function SessionEditor({ session, onSave, onCancel, onStart }) {
    const [editSession, setEditSession] = useState(session);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleAddQuestion = () => {
        const newQuestion = {
            id: generateId(),
            identifier: `Q${editSession.questions.length + 1}`,
            time: editSession.timePerQuestion,
            type: 'mcq-single',
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
            toast.error('Please enter a topic name');
            return;
        }
        if (editSession.questions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }
        onSave(editSession);
    };

    const handleStartPractice = () => {
        if (!editSession.topic.trim()) {
            toast.error('Please enter a topic name');
            return;
        }
        if (editSession.questions.length === 0) {
            toast.error('Please add at least one question');
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
                                <div className="question-time-picker">
                                    <TimePicker
                                        value={question.time}
                                        onChange={(seconds) => handleUpdateQuestion(question.id, 'time', Math.max(10, seconds))}
                                        showHours={false}
                                        compact={true}
                                    />
                                </div>
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
