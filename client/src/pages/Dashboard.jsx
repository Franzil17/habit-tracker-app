import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
    { id: "habits",   icon: "✅", label: "Daily Habits"    },
    { id: "monthly",  icon: "📅", label: "Monthly"         },
    { id: "reports",  icon: "📊", label: "Reports"         },
    { id: "settings", icon: "⚙️", label: "Settings"        },
];

const WIDGETS = [
    {
        id: "daily-habits",
        icon: "✅",
        iconClass: "purple",
        title: "Daily Habits",
        subtitle: "Today's progress",
        body: "Track your daily habits and build streaks. Set reminders, mark completions, and watch your consistency grow over time.",
        progress: 65,
    },
    {
        id: "monthly-tracking",
        icon: "📅",
        iconClass: "blue",
        title: "Monthly Tracking",
        subtitle: "August 2026",
        body: "View your habit performance across the entire month. Identify patterns and celebrate milestones on your journey.",
        progress: 42,
    },
    {
        id: "reports",
        icon: "📊",
        iconClass: "green",
        title: "Reports & Analytics",
        subtitle: "Insights at a glance",
        body: "Deep-dive into your habit data with weekly and monthly reports. Spot trends and optimize your routines for success.",
        progress: 0,
    },
    {
        id: "streak-tracker",
        icon: "🔥",
        iconClass: "orange",
        title: "Streak Tracker",
        subtitle: "Keep the fire alive",
        body: "Your longest current streak and best-ever records. Consistency is the key — don't break the chain!",
        progress: 80,
    },
];

function Dashboard() {
    const navigate  = useNavigate();
    const [activeNav, setActiveNav] = useState("habits");
    const [userName, setUserName]   = useState("Friend");

    // Guard: redirect to login if no token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const stored = localStorage.getItem("userName");
        if (stored) setUserName(stored);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className="dashboard-page">

            {/* ── Top Header ─────────────────────────────────────────────── */}
            <header className="dashboard-header">
                <div className="dashboard-logo">
                    <div className="logo-icon">🎯</div>
                    HabitTracker
                </div>
                <div className="dashboard-user">
                    <div className="user-avatar">{initial}</div>
                    <span className="user-name">{userName}</span>
                    <button
                        id="logout-btn"
                        className="btn-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ── Main Content ────────────────────────────────────────────── */}
            <main className="dashboard-content">

                {/* Greeting */}
                <div className="dashboard-greeting">
                    <h1>Hey, {userName} 👋</h1>
                    <p>Here's your habit dashboard. Stay consistent and keep growing!</p>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-icon">🔥</span>
                        <div className="stat-value">7</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">✅</span>
                        <div className="stat-value">4/6</div>
                        <div className="stat-label">Today's Habits</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">📈</span>
                        <div className="stat-value">78%</div>
                        <div className="stat-label">Weekly Rate</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🏆</span>
                        <div className="stat-value">21</div>
                        <div className="stat-label">Best Streak</div>
                    </div>
                </div>

                {/* Widget Cards */}
                <div className="widgets-grid">
                    {WIDGETS.map(w => (
                        <div key={w.id} id={`widget-${w.id}`} className="widget-card">
                            <div className="widget-header">
                                <div className={`widget-icon ${w.iconClass}`}>{w.icon}</div>
                                <div>
                                    <div className="widget-title">{w.title}</div>
                                    <div className="widget-subtitle">{w.subtitle}</div>
                                </div>
                            </div>
                            <div className="widget-body">{w.body}</div>
                            {w.progress > 0 ? (
                                <div className="progress-bar-track">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${w.progress}%` }}
                                    />
                                </div>
                            ) : (
                                <span className="badge-coming-soon">Coming Soon</span>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Footer Navigation ───────────────────────────────────────── */}
            <footer className="dashboard-footer">
                <nav className="footer-nav" role="navigation" aria-label="Main navigation">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`footer-nav-item${activeNav === item.id ? " active" : ""}`}
                            onClick={() => setActiveNav(item.id)}
                            aria-current={activeNav === item.id ? "page" : undefined}
                        >
                            <span className="footer-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </footer>
        </div>
    );
}

export default Dashboard;
