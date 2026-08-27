import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors]     = useState({});
    const [apiMsg, setApiMsg]     = useState({ type: "", text: "" });
    const [loading, setLoading]   = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // ── Client-side validation ────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!formData.name.trim())
            errs.name = "Full name is required";
        if (!formData.email.trim())
            errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errs.email = "Enter a valid email address";
        if (!formData.password)
            errs.password = "Password is required";
        else if (formData.password.length < 8)
            errs.password = "Password must be at least 8 characters";
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
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                setApiMsg({ type: "error", text: data.msg || "Signup failed. Try again." });
            } else {
                localStorage.setItem("token", data.token);
                if (data.user?.name) localStorage.setItem("userName", data.user.name);
                if (data.user?.signupDate) localStorage.setItem("signupDate", data.user.signupDate);
                setApiMsg({ type: "success", text: "Account created! Redirecting…" });
                setTimeout(() => navigate("/dashboard"), 800);
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

                <h2 className="auth-title">Create your account</h2>
                <p className="auth-subtitle">Start building better habits today.</p>

                {/* API alert */}
                {apiMsg.text && (
                    <div className={`alert alert-${apiMsg.type}`}>
                        <span>{apiMsg.type === "success" ? "✅" : "⚠️"}</span>
                        {apiMsg.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate id="signup-form">

                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-name">Full Name</label>
                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                id="signup-name"
                                className={`form-input${errors.name ? " input-error" : ""}`}
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                        {errors.name && <span className="field-error">⚠ {errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                id="signup-email"
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
                        <label className="form-label" htmlFor="signup-password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                id="signup-password"
                                className={`form-input${errors.password ? " input-error" : ""}`}
                                type="password"
                                name="password"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password && <span className="field-error">⚠ {errors.password}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        id="signup-submit"
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading && <span className="btn-loader" />}
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?&nbsp;
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
