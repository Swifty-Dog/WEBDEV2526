import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './components/AuthProvider';
import './utils/locales/i18n.ts';

const LoadingMarkup = (
    <div className="loading-container">
        <div className="spinner"></div>
    </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Suspense fallback={LoadingMarkup}>
            <AuthProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>
        </Suspense>
    </React.StrictMode>,
);
