import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import ExpensesPage from "./pages/Expenses.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import { getCurrentUser, logoutUser } from "./services/authService.js";
import { clearStoredSession, getStoredUser, getToken } from "./services/api.js";
import "./styles/global.css";

export default function App() {
    const [user, setUser] = useState(getStoredUser());
    const [view, setView] = useState("expenses");
    const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));

    useEffect(() => {
        async function verifySession() {
            if (!getToken()) {
                setCheckingSession(false);
                return;
            }
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                clearStoredSession();
                setUser(null);
            } finally {
                setCheckingSession(false);
            }
        }
        verifySession();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
        setView("expenses");
    };

    if (checkingSession) {
        return <div className="page-shell"><div className="state-box">Checking login session...</div></div>;
    }

    if (!user) {
        return <LoginPage onAuthenticated={setUser} />;
    }

    if (view === "admin" && user.role === "Admin") {
        return <AdminPanel user={user} onNavigate={setView} onLogout={handleLogout} />;
    }

    return <ExpensesPage user={user} onNavigate={setView} onLogout={handleLogout} />;
}
