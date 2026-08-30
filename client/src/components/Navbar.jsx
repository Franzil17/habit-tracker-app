import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ userName }) {
    const location = useLocation();
    const navigate = useNavigate();

    const name = userName || localStorage.getItem("userName") || "Friend";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    return (
        <header className="hd-topbar">
            <div className="hd-topbar-left">
                <Link to="/dashboard" className="hd-topbar-logo" style={{ textDecoration: "none" }}>
                    <span className="hd-logo-icon">🌸</span>
                    HabitTracker
                </Link>

                <nav className="hd-nav-links">
                    <Link
                        to="/dashboard"
                        className={`hd-nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        to="/important-tasks"
                        className={`hd-nav-link ${location.pathname === "/important-tasks" ? "active" : ""}`}
                    >
                        📌 Important Tasks
                    </Link>
                    <Link
                        to="/chatbot"
                        className={`hd-nav-link ${location.pathname === "/chatbot" ? "active" : ""}`}
                    >
                        🤖 AI Assistant
                    </Link>
                </nav>
            </div>

            <div className="hd-topbar-right">
                <div className="hd-avatar">{name.charAt(0).toUpperCase()}</div>
                <span className="hd-uname">{name}</span>
                <button id="logout-btn" className="hd-btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}
