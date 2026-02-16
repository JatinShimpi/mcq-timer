import { useState } from "react";
import { Button } from "react-aria-components";
import { useAuth } from "../contexts/AuthContext";
import PixelIcon from "./PixelIcon";

// Provider icons
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export default function Sidebar({
    onHomeClick,
    onDashboardClick,
    onSignInClick,
    theme,
    onToggleTheme,
    currentView,
    isOpen,
    onToggle,
}) {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };

    const handleNavClick = (action) => {
        action();
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            onToggle();
        }
    };

    const getProviderIcon = () => {
        if (!user) return null;
        switch (user.provider) {
            case "google":
                return <GoogleIcon />;
            case "github":
                return <GithubIcon />;
            default:
                return (
                    <span className="user-avatar-initial">
                        {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                );
        }
    };

    return (
        <>
            {/* Hamburger toggle — mobile only, hidden when sidebar is open */}
            {!isOpen && (
                <button
                    className="sidebar-toggle"
                    onClick={onToggle}
                    aria-label="Toggle menu"
                >
                    <PixelIcon name="IconMenu" size={24} />
                </button>
            )}

            {/* Backdrop — mobile only */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={onToggle} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                {/* Top: Logo */}
                <div className="sidebar-top">
                    <h1 className="logo" onClick={() => handleNavClick(onHomeClick)}>
                        <img src="/icons/icon-readme.svg" alt="Qlock" className="logo-icon" />
                        <span className="logo-text">Qlock</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-nav-item ${currentView === 'home' ? 'active' : ''}`}
                        onClick={() => handleNavClick(onHomeClick)}
                    >
                        <span className="sidebar-nav-icon">
                            <PixelIcon name="IconHome" size={24} />
                        </span>
                        <span>Home</span>
                    </button>
                    <button
                        className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavClick(onDashboardClick)}
                    >
                        <span className="sidebar-nav-icon">
                            <PixelIcon name="IconChartBar" size={24} />
                        </span>
                        <span>Dashboard</span>
                    </button>
                </nav>

                {/* Bottom: divider + auth + theme */}
                <div className="sidebar-bottom">
                    <div className="sidebar-divider" />

                    {/* Auth section */}
                    {isAuthenticated ? (
                        <div className="sidebar-user">
                            <button
                                className="sidebar-user-btn"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="user-avatar-img"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        {getProviderIcon()}
                                    </div>
                                )}
                                <span className="sidebar-user-name">{user?.name}</span>
                            </button>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="user-menu-backdrop"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="sidebar-user-dropdown">
                                        <div className="user-dropdown-header">
                                            <span className="user-dropdown-name">{user?.name}</span>
                                            <span className="user-dropdown-email">{user?.email}</span>
                                            <span className="user-dropdown-provider">
                                                {getProviderIcon()}
                                                <span>{user?.provider}</span>
                                            </span>
                                        </div>
                                        <div className="user-dropdown-divider" />
                                        <button className="user-dropdown-item" onClick={handleLogout}>
                                            <PixelIcon name="IconLogout" size={20} />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            className="sidebar-nav-item"
                            onClick={() => handleNavClick(onSignInClick)}
                        >
                            <span className="sidebar-nav-icon">
                                <PixelIcon name="IconLogin" size={24} />
                            </span>
                            <span>Sign In</span>
                        </button>
                    )}

                    <button
                        className="sidebar-nav-item"
                        onClick={onToggleTheme}
                    >
                        <span className="sidebar-nav-icon">
                            {theme === "dark" ? <PixelIcon name="IconSun" size={24} /> : <PixelIcon name="IconMoon" size={24} />}
                        </span>
                        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
