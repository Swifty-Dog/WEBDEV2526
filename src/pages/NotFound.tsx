import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: FC = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page you requested could not be found.</p>
            <button
                className="button-primary" id="button-error"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </div>
    );
};