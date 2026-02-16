import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from 'react-aria-components';
import PixelIcon from './PixelIcon';
import { toast } from 'sonner';
import { DEFAULT_OPTIONS } from '../constants';
import { playSound } from '../utils/sound';
import { formatTime } from '../utils/format';

// ============================================================================
// PRACTICE COMPONENT - With MCQ Options and Numerical Input
// ============================================================================

export default function Practice({ practiceState, setPracticeState, onComplete, onQuit }) {
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
                    toast('End session early?', {
                        action: {
                            label: 'End Now',
                            onClick: () => onQuit(),
                        },
                        cancel: {
                            label: 'Continue',
                            onClick: () => { },
                        },
                    });
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
    const circumference = 2 * Math.PI * 90;
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
                <svg className="timer-svg" viewBox="0 0 200 200">
                    <circle className="timer-circle-bg" cx="100" cy="100" r="90" />
                    <circle
                        className={`timer-circle-progress ${timerClass}`}
                        cx="100"
                        cy="100"
                        r="90"
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
                    <span className="answer-btn-icon"><PixelIcon name="IconCheck" size={20} /></span>
                    <span>Done</span>
                    <kbd>Enter</kbd>
                </Button>
                <Button
                    className="btn answer-btn answer-btn-skip"
                    onPress={() => handleAction('skipped')}
                    isDisabled={isPaused}
                >
                    <span className="answer-btn-icon"><PixelIcon name="IconForward" size={20} /></span>
                    <span>Skip</span>
                    <kbd>S</kbd>
                </Button>
                <Button
                    className="btn answer-btn answer-btn-pause"
                    onPress={handlePause}
                >
                    {isPaused ? (
                        <>
                            <span className="answer-btn-icon-resume"><PixelIcon name="IconPlayerPlay" size={20} /></span>
                            <span>Resume</span>
                            <kbd>Space</kbd>
                        </>
                    ) : (
                        <>
                            <span className="answer-btn-icon"><PixelIcon name="IconPlayerPause" size={20} /></span>
                            <span>Pause</span>
                            <kbd>Space</kbd>
                        </>
                    )}
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
