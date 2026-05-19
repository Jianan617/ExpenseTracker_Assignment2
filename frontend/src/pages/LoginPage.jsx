import { useState } from "react";
import { loginUser, registerUser } from "../services/authService.js";

export default function LoginPage({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [identifier, setIdentifier] = useState("admin");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isLogin = mode === "login";

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            setError("");
            const authenticatedUser = isLogin
                ? await loginUser(identifier, password)
                : await registerUser(username, email, password);
            onAuthenticated(authenticatedUser);
        } catch (e) {
            setError(e.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell auth-shell">
            <section className="header-section auth-header">
                <div>
                    <p className="page-name">Expense Tracker</p>
                </div>
            </section>

            <section className="auth-card">
                <div className="auth-tabs">
                    <button className={isLogin ? "tab-btn active" : "tab-btn"} onClick={() => setMode("login")}>Login</button>
                    <button className={!isLogin ? "tab-btn active" : "tab-btn"} onClick={() => setMode("register")}>Register</button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isLogin ? (
                        <div className="form-field">
                            <label htmlFor="identifier">Username or Email</label>
                            <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="admin" />
                        </div>
                    ) : (
                        <>
                            <div className="form-field">
                                <label htmlFor="username">Username</label>
                                <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="newuser" />
                            </div>
                            <div className="form-field">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newuser@example.com" />
                            </div>
                        </>
                    )}

                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                    </div>

                    {error && <div className="form-alert error-alert">{error}</div>}

                    <button className="submit-btn full-width-btn" type="submit" disabled={loading}>
                        {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
                    </button>
                </form>

                <div className="demo-credentials">
                    <strong>Accounts</strong>
                    <span>Admin: admin / admin123</span>
                    <span>User: user / user123</span>
                </div>
            </section>
        </div>
    );
}
