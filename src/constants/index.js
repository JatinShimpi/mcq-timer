// Session template patterns for quick creation
export const SESSION_PATTERNS = [
    { name: 'Blank Session', timePerQuestion: 60, timerMode: 'uniform' },
    { name: 'GATE Quick (30s)', timePerQuestion: 30, timerMode: 'uniform' },
    { name: 'GATE Standard (60s)', timePerQuestion: 60, timerMode: 'uniform' },
    { name: 'GATE Extended (90s)', timePerQuestion: 90, timerMode: 'uniform' },
    { name: 'JEE Pattern (2min)', timePerQuestion: 120, timerMode: 'uniform' },
    { name: 'Custom Individual', timePerQuestion: 60, timerMode: 'individual' },
];

// Question type options
export const QUESTION_TYPES = [
    { value: 'mcq-single', label: 'MCQ Single', desc: 'Select one option' },
    { value: 'mcq-multi', label: 'MSQ', desc: 'Select multiple options' },
    { value: 'numerical', label: 'Numerical', desc: 'Enter a number/text' }
];

// Default MCQ options
export const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
