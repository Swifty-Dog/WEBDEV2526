import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/Layout';
import './styles/global.css';
import './styles/_layout.css';
import './styles/_components.css';

export function App() {
    // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);  // THIS IS NORMAL. CURRENTLY SET TO TRUE FOR EASE OF TESTING
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    return (
        <Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
            <Routes>

                <Route path="/about" element={<About />} />
                <Route
                    path="/login"
                    element={
                        isLoggedIn
                            ? <Navigate to="/" replace />
                            : <Login setIsLoggedIn={setIsLoggedIn} />
                    }
                />


                <Route path="/404" element={<NotFound />} />
                <Route
                    path="/dashboard"
                    element={
                        isLoggedIn
                            ? <Dashboard />
                            : <Navigate to="/" replace />
                    }
                />

                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? <Dashboard />
                            : <Login setIsLoggedIn={setIsLoggedIn} />
                    }
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Layout>
    );
}