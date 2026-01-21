// localStorage key for sessions
const SESSIONS_KEY = 'qlock-sessions';
const THEME_KEY = 'qlock-theme';

// Load sessions from localStorage
export function loadSessions() {
    try {
        const data = localStorage.getItem(SESSIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// Save sessions to localStorage
export function saveSessions(sessions) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// Load theme preference
export function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
}

// Save theme preference
export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

// Generate a unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
