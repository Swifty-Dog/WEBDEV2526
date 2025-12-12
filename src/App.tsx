import React, { type Dispatch, type SetStateAction, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Register } from './components/Admin/Register.tsx';
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
import { getUserRoleFromToken, isTokenValid } from './utils/auth.ts';
import {TerminateEmployee} from "./components/Admin/TerminateEmployee.tsx";

export function App() {
    const token = localStorage.getItem('authToken');
    const hasValidToken = isTokenValid(token);
    if (!hasValidToken) localStorage.removeItem('authToken');
    const derivedRole = getUserRoleFromToken(token);

    const [isLoggedIn, setIsLoggedIn] = useState(!!derivedRole);
    const [userRole, setUserRole] = useState<string | null>(derivedRole);
    const { settings, loading } = useFetchSettings(token, isLoggedIn);

    const initialSettings: Partial<UserSettings> | undefined = settings ? {
        theme: settings.siteTheme,
        fontSize: mapFontSizeToLabel(settings.fontSize),
        accentColor: (settings.accentColor) as AccentColor,
        defaultCalendarView: settings.defaultCalendarView,
        language: settings.language
    } : undefined;

    if (loading && isLoggedIn && !initialSettings) return <div>Loading user settings...</div>;

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
        <Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userRole={userRole} setUserRole={setUserRole}>
            <Routes>
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

                <Route path="/admin/terminate" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin']}
                    >
                        <TerminateEmployee isLoggedIn={isLoggedIn} />
                    </ProtectedRoute>
                } />

                <Route path="/admin-dashboard" element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        allowedRoles={['admin', 'manager']}
                    >
                        <AdminDashboard userRole={userRole} />
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
                        <Settings isLoggedIn={isLoggedIn} />
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
