import { useState } from 'react';
import { Button } from 'react-aria-components';
import { useAuth } from '../contexts/AuthContext';

// Provider icons
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

export default function SignIn({ onBack }) {
    const { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } = useAuth();
    const [mode, setMode] = useState('select'); // 'select' | 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                await registerWithEmail(name, email, password);
            } else {
                await loginWithEmail(email, password);
            }
            onBack();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'login' || mode === 'register') {
        return (
            <div className="signin-container">
                <div className="signin-card">
                    <button className="signin-back" onClick={() => setMode('select')}>
                        ← Back
                    </button>

                    <h1 className="signin-title">
                        {mode === 'register' ? 'Create Account' : 'Sign In'}
                    </h1>

                    <form onSubmit={handleEmailSubmit} className="signin-form">
                        {mode === 'register' && (
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        {error && <div className="signin-error">{error}</div>}

                        <Button
                            type="submit"
                            className="btn btn-primary btn-lg signin-submit"
                            isDisabled={loading}
                        >
                            {loading ? 'Loading...' : (mode === 'register' ? 'Create Account' : 'Sign In')}
                        </Button>
                    </form>

                    <p className="signin-switch">
                        {mode === 'register' ? (
                            <>Already have an account? <button onClick={() => setMode('login')}>Sign In</button></>
                        ) : (
                            <>Don't have an account? <button onClick={() => setMode('register')}>Create one</button></>
                        )}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <img src="/icons/icon-readme.svg" alt="Qlock" className="signin-logo" />
                    <h1 className="signin-title">Sign in to Qlock</h1>
                    <p className="signin-subtitle">Sync your sessions across devices</p>
                </div>

                <div className="signin-options">
                    <button className="signin-btn signin-btn-google" onClick={loginWithGoogle}>
                        <GoogleIcon />
                        <span>Continue with Google</span>
                    </button>

                    <button className="signin-btn signin-btn-github" onClick={loginWithGithub}>
                        <GithubIcon />
                        <span>Continue with GitHub</span>
                    </button>

                    <div className="signin-divider">
                        <span>or</span>
                    </div>

                    <button className="signin-btn signin-btn-email" onClick={() => setMode('login')}>
                        <EmailIcon />
                        <span>Sign in with Email</span>
                    </button>
                </div>

                <Button className="btn btn-ghost signin-back-home" onPress={onBack}>
                    ← Back to Home
                </Button>
            </div>
        </div>
    );
}
