import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const MASCOT_EMOTES = [
    { emoji: "🐰", quote: "Let's check your schedule!" },
    { emoji: "🐰", quote: "I can find any task for you!" },
    { emoji: "🐰", quote: "Ask me anything, I'm ready!" },
    { emoji: "🐰", quote: "Habit tracking is super fun!" }
];

export default function Chatbot() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // Non-scrolling state showing current conversation step
    const [currentQuery, setCurrentQuery] = useState("");
    const [currentResponse, setCurrentResponse] = useState(
        "Konnichiwa! I am your AI Assistant. Ask me about your tasks or schedule (e.g. 'What tasks are coming this week?')."
    );
    const [currentTasks, setCurrentTasks] = useState([]);

    // Mascot visual state
    const [mascotEmote, setMascotEmote] = useState(MASCOT_EMOTES[0]);
    const [isBouncing, setIsBouncing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const handleSend = async (userQuery) => {
        const textToSend = userQuery || query;
        if (!textToSend || !textToSend.trim()) return;

        setCurrentQuery(textToSend);
        setCurrentResponse("Analyzing scheduled tasks... 🌸");
        setCurrentTasks([]);
        if (!userQuery) setQuery("");
        setLoading(true);
        setIsBouncing(true);

        // Randomize mascot emote to add interactivity
        const randomEmote = MASCOT_EMOTES[Math.floor(Math.random() * MASCOT_EMOTES.length)];
        setMascotEmote(randomEmote);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query: textToSend.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setCurrentResponse(data.response || "No tasks found.");
                setCurrentTasks(data.tasks || []);
            } else {
                setCurrentResponse(data.msg || "Sorry, I couldn't interpret that query.");
            }
        } catch (err) {
            console.error("Chatbot API error:", err);
            setCurrentResponse("Network error connecting to AI Assistant.");
        } finally {
            setLoading(false);
            setTimeout(() => setIsBouncing(false), 800);
        }
    };

    const handleMascotClick = () => {
        setIsBouncing(true);
        const randomEmote = MASCOT_EMOTES[Math.floor(Math.random() * MASCOT_EMOTES.length)];
        setMascotEmote(randomEmote);
        setTimeout(() => setIsBouncing(false), 800);
    };

    const suggestions = [
        "What tasks are coming this week?",
        "Tasks for today",
        "Tasks for tomorrow",
        "Tasks for next week",
    ];

    return (
        <div className="hd-root chatbot-page-root">
            <Navbar />

            <div className="chatbot-viewport-body">
                <div className="chatbot-redesign-layout">

                    {/* Left Column: Fixed Input Box & Response Card */}
                    <div className="chatbot-left-panel">
                        <header className="chatbot-header">
                            <h1 className="chatbot-title">🤖 AI Task Assistant</h1>
                            <p className="chatbot-subtitle">Query your upcoming schedule in plain English.</p>
                        </header>

                        {/* Current Status/Response Card */}
                        <div className="chatbot-response-card">
                            {currentQuery && (
                                <div className="chatbot-query-preview">
                                    <span className="query-label">You asked:</span>
                                    <p className="query-text">"{currentQuery}"</p>
                                </div>
                            )}

                            <div className="chatbot-response-body">
                                <span className="response-label">AI Response:</span>
                                <div className="response-text-container">
                                    {currentResponse.split("\n").map((line, i) => (
                                        <div key={i} className="response-line">{line}</div>
                                    ))}
                                </div>

                                {currentTasks.length > 0 && (
                                    <div className="chatbot-response-tasks">
                                        {currentTasks.map((t) => (
                                            <div key={t._id} className="chatbot-task-item">
                                                <span className="task-date-pill">📅 {t.date}</span>
                                                <span className="task-desc-text">{t.task}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Suggestion Chips */}
                        <div className="chatbot-suggestions-section">
                            <span className="suggestions-title">Quick Queries</span>
                            <div className="chatbot-chips-container">
                                {suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        className="chatbot-suggestion-btn"
                                        onClick={() => handleSend(sug)}
                                        disabled={loading}
                                    >
                                        {sug}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fixed Query Input Box */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="chatbot-input-container"
                        >
                            <input
                                type="text"
                                id="chatbot-input"
                                className="chatbot-input-element"
                                placeholder="Type a query (e.g. 'What tasks do I have today?')..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                id="send-chatbot-btn"
                                className="chatbot-submit-btn"
                                disabled={loading || !query.trim()}
                            >
                                {loading ? "..." : "🚀 Send"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Visual Pointing Mascot */}
                    <div className="chatbot-right-panel">
                        <div className="chatbot-mascot-container">
                            {/* Thought Bubble */}
                            <div className="chatbot-thought-bubble">
                                <span className="bubble-text">Wanna ask me something?</span>
                            </div>

                            {/* Mascot Avatar Card */}
                            <div
                                className={`chatbot-mascot-card-redesign ${isBouncing ? "bounce-anim" : "float-anim"}`}
                                onClick={handleMascotClick}
                                title="Click me to change mood!"
                            >
                                <div className="mascot-avatar-visual-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span className="mascot-pointer-hand" style={{ fontSize: "32px" }}>👈</span>
                                    <div className="mascot-avatar-visual">
                                        <span className="mascot-emoji-visual">{mascotEmote.emoji}</span>
                                    </div>
                                </div>
                                <div className="mascot-details">
                                    <span className="mascot-name-pill">Kiko-chan 🎀</span>
                                    <span className="mascot-speech-text">"{mascotEmote.quote}"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
