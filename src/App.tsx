import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/Layout';
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import './styles/global.css';
import './styles/_layout.css';
import './styles/_components.css';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);

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
}