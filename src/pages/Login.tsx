import { useState, type FormEvent, type FC, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import '../styles/_components.css';

interface LoginProps {
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

export const Login: FC<LoginProps> = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (email === '') {
            if (password === '') {
                alert('Email and Password are required');
                return;
            }
            alert('Email is required');
            return;
        }
        else if (password === '') {
            alert('Password is required');
            return;
        }

        try {
            const response = await fetch('http://localhost:5222/api/Employee/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                setIsLoggedIn(true);
                navigate('/dashboard');
            } else {
                const errorData = await response.json().catch(() => null);
                setErrorMessage(errorData?.message || 'Login failed.');
            }
        } catch {
            setErrorMessage('An error occurred while trying to log in.');
        }

    };

    return (
        <form className="login" onSubmit={handleSubmit}>
            <input
                type="email"
                className="login-input"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onInvalid={(e) => e.currentTarget.setCustomValidity('')}
                onInput={(e) => e.currentTarget.setCustomValidity('')}
                required
            />
            <input
                type="password"
                className="login-input"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />

            {errorMessage && <p className="login-error">{errorMessage}</p>}

            <button type="submit" className="button-primary">
                Login
            </button>
        </form>
    );
}