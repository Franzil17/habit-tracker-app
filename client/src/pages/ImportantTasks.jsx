import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ImportantTasks() {
    const navigate = useNavigate();
    const todayStr = new Date().toISOString().split("T")[0];

    const [date, setDate] = useState(todayStr);
    const [taskContent, setTaskContent] = useState("");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Auth check & fetch saved tasks
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetchTasks(token);
    }, [navigate]);

    const fetchTasks = async (token) => {
        try {
            setLoading(true);
            const authToken = token || localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/tasks", {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks || []);
            } else if (res.status === 401) {
                navigate("/login");
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setErrorMsg("Failed to load saved tasks.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        setStatusMsg("");
        setErrorMsg("");

        if (!date || !taskContent.trim()) {
            setErrorMsg("Please select a date and enter task details.");
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date, task: taskContent.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatusMsg("✨ Task saved successfully!");
                setTaskContent("");
                // Refresh list of tasks
                fetchTasks(token);
                setTimeout(() => setStatusMsg(""), 3500);
            } else {
                setErrorMsg(data.msg || "Failed to save task.");
            }
        } catch (err) {
            console.error("Save task error:", err);
            setErrorMsg("Server error saving task.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
            }
        } catch (err) {
            console.error("Delete task error:", err);
        }
    };

    return (
        <div className="hd-root">
            <Navbar />

            <div className="hd-body tasks-page-container">
                <header className="tasks-header">
                    <h1 className="tasks-title">📌 Important Daily Tasks</h1>
                    <p className="tasks-subtitle">Record critical deadlines, events, and focus items to track and query anytime.</p>
                </header>

                <div className="tasks-grid-layout">
                    {/* Left: Task Entry Form */}
                    <div className="tasks-card form-card">
                        <h2 className="card-heading">➕ Add New Task</h2>

                        {statusMsg && <div className="alert-msg success-alert">{statusMsg}</div>}
                        {errorMsg && <div className="alert-msg error-alert">{errorMsg}</div>}

                        <form onSubmit={handleSaveTask} className="task-form">
                            <div className="form-group">
                                <label htmlFor="task-date" className="form-label">Select Date</label>
                                <input
                                    type="date"
                                    id="task-date"
                                    className="task-input date-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="task-desc" className="form-label">Task Description</label>
                                <textarea
                                    id="task-desc"
                                    className="task-input textarea-input"
                                    rows="4"
                                    placeholder="Enter your important task, meeting, or milestone..."
                                    value={taskContent}
                                    onChange={(e) => setTaskContent(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                id="save-task-btn"
                                className="save-task-btn"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "💾 Save Task"}
                            </button>
                        </form>
                    </div>

                    {/* Right: Saved Tasks List */}
                    <div className="tasks-card list-card">
                        <h2 className="card-heading">📋 Scheduled Tasks ({tasks.length})</h2>

                        {loading ? (
                            <div className="loading-spinner">Loading your tasks...</div>
                        ) : tasks.length === 0 ? (
                            <div className="empty-tasks-state">
                                <span className="empty-icon">📝</span>
                                <p>No tasks saved yet. Add your first task above!</p>
                            </div>
                        ) : (
                            <div className="tasks-list">
                                {tasks.map((t) => (
                                    <div key={t._id} className="task-item-card">
                                        <div className="task-item-header">
                                            <span className="task-date-badge">📅 {t.date}</span>
                                            <button
                                                className="task-delete-btn"
                                                onClick={() => handleDeleteTask(t._id)}
                                                title="Delete Task"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="task-item-text">{t.task}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
