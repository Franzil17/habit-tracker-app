import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors]     = useState({});
    const [apiMsg, setApiMsg]     = useState({ type: "", text: "" });
    const [loading, setLoading]   = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // ── Client-side validation ────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!formData.email.trim())
            errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errs.email = "Enter a valid email address";
        if (!formData.password)
            errs.password = "Password is required";
        return errs;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMsg({ type: "", text: "" });

        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                setApiMsg({ type: "error", text: data.msg || "Login failed. Check your credentials." });
            } else {
                localStorage.setItem("token", data.token);
                if (data.user?.name) localStorage.setItem("userName", data.user.name);
                setApiMsg({ type: "success", text: `Welcome back! Redirecting…` });
                setTimeout(() => navigate("/dashboard"), 700);
            }
        } catch {
            setApiMsg({ type: "error", text: "Cannot connect to server. Is the backend running?" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">🎯</div>
                    <div className="auth-logo-text">Habit<span>Tracker</span></div>
                </div>

                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Sign in to continue your habit journey.</p>

                {/* API alert */}
                {apiMsg.text && (
                    <div className={`alert alert-${apiMsg.type}`} style={{ marginBottom: "16px" }}>
                        <span>{apiMsg.type === "success" ? "✅" : "⚠️"}</span>
                        {apiMsg.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate id="login-form">

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                id="login-email"
                                className={`form-input${errors.email ? " input-error" : ""}`}
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && <span className="field-error">⚠ {errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                id="login-password"
                                className={`form-input${errors.password ? " input-error" : ""}`}
                                type="password"
                                name="password"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>
                        {errors.password && <span className="field-error">⚠ {errors.password}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading && <span className="btn-loader" />}
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don&apos;t have an account?&nbsp;
                    <Link to="/signup">Sign up free</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
