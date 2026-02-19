import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = 'https://qlock-api-jatin123-53a75330.koyeb.app';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check auth status on mount (cookie is sent automatically)
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include',
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const loginWithGithub = () => {
        window.location.href = `${API_URL}/api/auth/github`;
    };

    const loginWithEmail = async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await res.json();
        setUser(data.user || data);
        setIsAuthenticated(true);
        return data;
    };

    const registerWithEmail = async (name, email, password) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await res.json();
        setUser(data.user || data);
        setIsAuthenticated(true);
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Ignore logout errors
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    // Sync local sessions to cloud on first login
    const syncLocalSessions = useCallback(async (localSessions) => {
        if (!isAuthenticated || localSessions.length === 0) return [];

        try {
            const res = await fetch(`${API_URL}/api/sessions/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ sessions: localSessions }),
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.error('Sync failed:', e);
        }
        return [];
    }, [isAuthenticated]);

    // Fetch sessions from cloud
    const fetchSessions = useCallback(async () => {
        if (!isAuthenticated) return null;

        try {
            const res = await fetch(`${API_URL}/api/sessions`, {
                credentials: 'include',
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.error('Fetch sessions failed:', e);
        }
        return null;
    }, [isAuthenticated]);

    // Save session to cloud
    const saveSession = useCallback(async (session) => {
        if (!isAuthenticated) return null;

        const method = session._id ? 'PUT' : 'POST';
        const url = session._id
            ? `${API_URL}/api/sessions/${session._id}`
            : `${API_URL}/api/sessions`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(session),
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.error('Save session failed:', e);
        }
        return null;
    }, [isAuthenticated]);

    // Delete session from cloud
    const deleteSession = useCallback(async (sessionId) => {
        if (!isAuthenticated) return false;

        try {
            const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            return res.ok;
        } catch (e) {
            console.error('Delete session failed:', e);
        }
        return false;
    }, [isAuthenticated]);

    const value = {
        user,
        loading,
        isAuthenticated,
        loginWithGoogle,
        loginWithGithub,
        loginWithEmail,
        registerWithEmail,
        logout,
        syncLocalSessions,
        fetchSessions,
        saveSession,
        deleteSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
