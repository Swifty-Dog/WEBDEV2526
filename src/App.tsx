import React, {type Dispatch, type SetStateAction, useEffect, useState} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Register } from './components/Register';
import { Rooms } from "./pages/Rooms";
import { Events } from './pages/Events';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/Layout';
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from './config/ThemeProvider';
import { useTheme } from './config/ThemeContext';
import {type SettingsResponse, useFetchSettings} from './hooks/Settings/useFetchSettings';
import './styles/global.css';
import './styles/_layout.css';
import './styles/_components.css';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const token = localStorage.getItem('authToken');
    const { settings, loading } = useFetchSettings(token);

    if (loading && isLoggedIn) return <div>Loading user settings...</div>;
    const initialTheme = settings?.siteTheme ?? 'Light';

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <AppInner
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                userRole={userRole}
                setUserRole={setUserRole}
                settings={settings}
                loading={loading}
            />
        </ThemeProvider>
    );
}

interface AppInnerProps {
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    userRole: string | null;
    setUserRole: Dispatch<SetStateAction<string | null>>;
    settings: SettingsResponse | null;
    loading: boolean;
}

const AppInner: React.FC<AppInnerProps> = ({isLoggedIn, setIsLoggedIn, userRole, setUserRole, settings, loading}) => {
    const { setTheme } = useTheme();

    useEffect(() => {
        if (settings?.siteTheme) {
            setTheme(settings.siteTheme);
        }
    }, [settings, setTheme]);

    if (loading && isLoggedIn) return <div>Loading user settings...</div>;

    return (
        <Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userRole={userRole}>
            <Routes>
                <Route path="/about" element={<About />} />
                <Route
                    path="/login"
                    element={
                        isLoggedIn
                            ? (userRole === 'admin' || userRole === 'manager')
                                ? <Navigate to="/admin-dashboard" replace />
                                : <Navigate to="/dashboard" replace />
                            : <Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
                    }
                />


                <Route path="/404" element={<NotFound />} />

                <Route path="/admin/register" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager']}
                    >
                        <Register />
                    </ProtectedRoute>
                } />

                <Route path="/admin-dashboard" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager']}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
                />

                <Route path="/dashboard" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager', 'employee']}
                    >
                        <Dashboard />
                    </ProtectedRoute>
                }
                />

                <Route path="/kamers" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager', 'employee']}
                    >
                        <Rooms userRole={userRole ?? ''} />
                    </ProtectedRoute>
                }
                />

                <Route path="/events" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager', 'employee']}
                    >
                        <Events />
                    </ProtectedRoute>}
                />

                <Route path="/settings" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager', 'employee']}
                    >
                        <Settings />
                    </ProtectedRoute>}
                />

                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? (userRole === 'admin' || userRole === 'manager')
                                ? <Navigate to="/admin-dashboard" replace />
                                : <Navigate to="/dashboard" replace />
                            : <Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
                    }
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Layout>
    );
};
