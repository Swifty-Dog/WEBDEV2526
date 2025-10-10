import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: FC = () => {
    const navigate = useNavigate();

    return (
        <div className="login">
            <h1>404 - Page Not Found</h1>
            <p>The page you requested could not be found.</p>
                <button
                    className="header-button"
                    onClick={() => navigate('/')}
                >
                    Login
                </button>
        </div>
    );
};