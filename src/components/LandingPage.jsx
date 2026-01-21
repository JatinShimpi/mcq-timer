import { useNavigate } from 'react-router-dom';
import { Button } from 'react-aria-components';

// Icons
const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const DocsIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
);

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navbar - scrolls with page */}
            <nav className="landing-nav">
                <div className="landing-nav-left">
                    <img src="/icons/icon.svg" alt="Qlock" className="landing-nav-logo" />
                    <span className="landing-nav-title">Qlock</span>
                </div>
                <div className="landing-nav-right">
                    <a href="https://github.com/JatinShimpi/mcq-timer" target="_blank" rel="noopener noreferrer" className="landing-nav-link">
                        <GithubIcon />
                    </a>
                    <a href="#" className="landing-nav-link">
                        <DocsIcon />
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <p className="hero-tagline">
                        Master time-critical questions for JEE, GATE, NEET and other competitive exams
                    </p>
                    <p className="hero-description">
                        Practice MCQs, MSQs, and Numerical questions with realistic time pressure.
                        Track your progress and improve your speed.
                    </p>

                    <div className="hero-cta-card">
                        <Button className="btn btn-primary btn-md hero-cta-btn" onPress={() => navigate('/app')}>
                            Go to the WebApp
                        </Button>

                        <div className="hero-or-divider">
                            <span>OR</span>
                        </div>

                        <a href="#" className="hero-playstore-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                            </svg>
                            <span>Download on Play Store</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="features-title">Why Qlock?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">⏱️</span>
                        <h3 className="feature-title">Timed Practice</h3>
                        <p className="feature-desc">Simulate exam conditions with customizable timers per question</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📊</span>
                        <h3 className="feature-title">Track Progress</h3>
                        <p className="feature-desc">View detailed analytics and identify areas for improvement</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🎯</span>
                        <h3 className="feature-title">Multiple Question Types</h3>
                        <p className="feature-desc">MCQ, MSQ, and Numerical - just like GATE</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">☁️</span>
                        <h3 className="feature-title">Cloud Sync</h3>
                        <p className="feature-desc">Sign in to sync your sessions across devices</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Built for serious exam preparation</p>
            </footer>
        </div>
    );
}
