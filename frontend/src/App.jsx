import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import ExpensesPage from "./pages/Expenses.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import { getCurrentUser, logoutUser } from "./services/authService.js";
import { clearStoredSession, getStoredUser, getToken } from "./services/api.js";
import "./styles/global.css";

export default function App() {
    //store current logged user from localStorage if available
    const [user, setUser] = useState(getStoredUser());
    //control which main page is displayed
    const [view, setView] = useState("expenses");
    //check session only when a token exists
    const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));

    useEffect(() => {
        async function verifySession() {
            //if there is no token, skip session verification
            if (!getToken()) {
                setCheckingSession(false);
                return;
            }
            try {
                //verify token with backend and get current user profile
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                //clear invalid or expired session
                clearStoredSession();
                setUser(null);
            } finally {
                //finish session checking
                setCheckingSession(false);
            }
        }
        //run session verification once when app starts
        verifySession();
    }, []);

    const handleLogout = async () => {
        //call backend logout and clear local session
        await logoutUser();
        setUser(null);
        setView("expenses");
    };

    //show loading state while checking existing login session
    if (checkingSession) {
        return <div className="page-shell"><div className="state-box">Checking login session...</div></div>;
    }

    //if no user is logged in, show login/register page
    if (!user) {
        return <LoginPage onAuthenticated={setUser} />;
    }

    //show Admin Panel only when current user is Admin
    if (view === "admin" && user.role === "Admin") {
        return <AdminPanel user={user} onNavigate={setView} onLogout={handleLogout} />;
    }

    return <ExpensesPage user={user} onNavigate={setView} onLogout={handleLogout} />;
}
