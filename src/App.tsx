import React, { type Dispatch, type SetStateAction, useState } from 'react';
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
import { SettingsProvider } from './config/SettingsProvider.tsx';
import { type AccentColor, mapFontSizeToLabel, type UserSettings } from './config/SettingsContext';
import { useFetchSettings } from './hooks/Settings/useFetchSettings';
import './styles/global.css';
import './styles/_layout.css';
import './styles/_components.css';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const token = localStorage.getItem('authToken');
    const { settings, loading } = useFetchSettings(token);

    const initialSettings: Partial<UserSettings> | undefined = settings ? {
        theme: settings.siteTheme,
        fontSize: mapFontSizeToLabel(settings.fontSize),
        accentColor: (settings.accentColor) as AccentColor,
        defaultCalendarView: settings.defaultCalendarView,
        language: settings.language
    } : undefined;

    if (loading && isLoggedIn) return <div>Loading user settings...</div>;

    return (
        <SettingsProvider initialSettings={initialSettings}>
            <AppInner
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                userRole={userRole}
                setUserRole={setUserRole}
            />
        </SettingsProvider>
    );
}

interface AppInnerProps {
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    userRole: string | null;
    setUserRole: Dispatch<SetStateAction<string | null>>;
}

const AppInner: React.FC<AppInnerProps> = ({isLoggedIn, setIsLoggedIn, userRole, setUserRole}) => {
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

                <Route path="/rooms" element={
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
