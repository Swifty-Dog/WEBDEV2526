import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        document.body.classList.toggle('light-mode', theme === 'light');
    }, [theme]);

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            isLoggedIn={isLoggedIn}
        >
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/404" element={<NotFound />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Layout>
    );
}