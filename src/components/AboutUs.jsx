import { useNavigate } from 'react-router-dom';
import { Button } from 'react-aria-components';

export default function AboutUs() {
    const navigate = useNavigate();

    const creators = [
        {
            name: 'Jatin Shimpi',
            role: 'Developer',
            description: 'I built all the features for this project.',
            photo: null, // Placeholder - add actual photo path
            github: 'https://github.com/',
            linkedin: 'https://linkedin.com/'
        },
        {
            name: 'Rishikesh Astarkar',
            role: 'User 0, Tester and Angel Investor',
            description: 'I tested the features and provided feedback.',
            photo: null, // Placeholder - add actual photo path
            github: 'https://github.com/',
            linkedin: 'https://linkedin.com/'
        }
    ];

    const technologies = [
        {
            name: 'React',
            url: 'https://react.dev',
            description: 'Frontend UI library',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#61DAFB"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" /></svg>
        },
        {
            name: 'Vite',
            url: 'https://vitejs.dev',
            description: 'Build tool & dev server',
            icon: <svg viewBox="0 0 24 24" width="32" height="32"><path fill="#646CFF" d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z" /></svg>
        },
        {
            name: 'React Router',
            url: 'https://reactrouter.com',
            description: 'Client-side routing',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#CA4245"><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M8.5 10.5L15.5 7M8.5 13.5L15.5 17" stroke="#CA4245" strokeWidth="2" fill="none" /></svg>
        },
        {
            name: 'React Aria',
            url: 'https://react-spectrum.adobe.com/react-aria/',
            description: 'Accessible UI components',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#E34F26"><path d="M12 2L2 7l1.5 11L12 22l8.5-4L22 7z" /></svg>
        },
        {
            name: 'Sonner',
            url: 'https://sonner.emilkowal.ski',
            description: 'Toast notifications',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#8B5CF6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        },
        {
            name: 'Rust',
            url: 'https://www.rust-lang.org',
            description: 'Backend language',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#DEA584"><circle cx="12" cy="12" r="9" fill="none" stroke="#DEA584" strokeWidth="2" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="#DEA584" strokeWidth="2" /></svg>
        },
        {
            name: 'Axum',
            url: 'https://github.com/tokio-rs/axum',
            description: 'Web framework',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#FF6B35"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" /></svg>
        },
        {
            name: 'MongoDB',
            url: 'https://www.mongodb.com',
            description: 'Database',
            icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#47A248"><path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" /></svg>
        },
        {
            name: 'Koyeb',
            url: 'https://www.koyeb.com',
            description: 'Backend hosting',
            icon: <svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="4" fill="#00D4AA" /><path d="M9 7v10l8-5-8-5z" fill="#1a1a2e" /></svg>
        },
        {
            name: 'Netlify',
            url: 'https://www.netlify.com',
            description: 'Frontend hosting',
            icon: <svg viewBox="0 0 24 24" width="32" height="32"><path d="M12 2L2 19.5h20L12 2z" fill="#00C7B7" /><path d="M12 8l-5 8.5h10L12 8z" fill="#014847" /></svg>
        },
    ];

    return (
        <div className="about-page">
            <nav className="landing-nav">
                <div className="landing-nav-left">
                    <img src="/icons/icon-readme.svg" alt="Qlock" className="landing-nav-logo" />
                    <span className="landing-nav-title">Qlock</span>
                </div>
                <div className="landing-nav-right">
                    <Button className="btn btn-secondary btn-sm" onPress={() => navigate('/')}>
                        ← Back
                    </Button>
                </div>
            </nav>

            <main className="about-content">
                {/* Meet the Team */}
                <section className="about-section">
                    <h1 className="about-title">Meet the Team</h1>
                    <p className="about-subtitle">The people behind Qlock</p>

                    <div className="creators-grid">
                        {creators.map((creator, index) => (
                            <div key={index} className="creator-card">
                                <div className="creator-photo">
                                    {creator.photo ? (
                                        <img src={creator.photo} alt={creator.name} />
                                    ) : (
                                        <div className="creator-photo-placeholder">
                                            👤
                                        </div>
                                    )}
                                </div>
                                <h3 className="creator-name">{creator.name}</h3>
                                <p className="creator-role">{creator.role}</p>
                                <p className="creator-description">{creator.description}</p>
                                <div className="creator-links">
                                    <a href={creator.github} target="_blank" rel="noopener noreferrer" className="creator-link">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                    </a>
                                    <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="creator-link">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="about-section">
                    <h2 className="about-section-title">Built With</h2>
                    <p className="about-subtitle">Technologies that power Qlock</p>

                    <div className="tech-grid">
                        {technologies.map((tech, index) => (
                            <a
                                key={index}
                                href={tech.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tech-card"
                            >
                                <span className="tech-icon">{tech.icon}</span>
                                <span className="tech-name">{tech.name}</span>
                                <span className="tech-description">{tech.description}</span>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Mission */}
                <section className="about-section about-mission">
                    <h2 className="about-section-title">Our Story</h2>
                    <p className="about-mission-text">
                        One day Rishi and I were siting in our room and brainstorming business ideas. it was a fun thing we both liked to think about. He would always think about ideas which are larger than life and i was the one who always grounded him "i love your idea but we need to start small buddy" and he would go like "boooooo youre a buzzkill bro" "nah i am just a realist" i said. after that i casually asked him about his GATE preparation and is there any problem that i can solve with my skills he thought about it and told me about this project. Rishi is the first tester for this project and i developed it
                    </p>
                </section>

                {/* Open Source */}
                <section className="about-section about-opensource">
                    <div className="opensource-badge">🌟 Open Source</div>
                    <p className="about-opensource-text">
                        Qlock is open source and free to use. Contributions are welcome!
                    </p>
                    <a
                        href="https://github.com/JatinShimpi/mcq-timer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        View on GitHub
                    </a>
                </section>
            </main>

            <footer className="landing-footer">
                <p>Made with ❤️ for students everywhere</p>
            </footer>
        </div>
    );
}
