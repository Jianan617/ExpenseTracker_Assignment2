import { useState } from "react";
import { loginUser, registerUser } from "../services/authService.js";

export default function LoginPage({ onAuthenticated }) {
    const [mode, setMode] = useState("login");

    //login form fields, identifier contains username or email
    const [identifier, setIdentifier] = useState("");

    //register form fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    //password field used for both login and register
    const [password, setPassword] = useState("");

    //store application state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    //check current form mode
    const isLogin = mode === "login";

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            //start loading and clear previous errors
            setLoading(true);
            setError("");
            //call login API or register API based on current mode
            const authenticatedUser = isLogin
                ? await loginUser(identifier, password)
                : await registerUser(username, email, password);
            //notify parent component that authentication succeeded
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
                            <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)}/>
                        </div>
                    ) : (
                        <>
                            <div className="form-field">
                                <label htmlFor="username">Username</label>
                                <input id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
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
