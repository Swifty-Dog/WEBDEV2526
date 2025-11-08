import { useState, type FormEvent, type FC, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import '../styles/_components.css';
import {useAuth} from "../components/UseAuth.tsx";

interface LoginProps {
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    setUserRole: Dispatch<SetStateAction<string | null>>;
}

interface AuthResponse {
    employee: {
        employeeId: number;
        name: string;
        email: string;
        role: string;
        token: string;
    };
}

export const Login: FC<LoginProps> = ({ setIsLoggedIn, setUserRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!email || !password) {
            alert('Email and password are required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5222/api/Employee/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                setErrorMessage(errData?.message || 'Login failed.');
                return;
            }

            const data: AuthResponse = await response.json();

            const { employeeId, email: empEmail, role, token } = data.employee;

            if (!employeeId || !token) {
                throw new Error('Invalid server response.');
            }

            localStorage.setItem('authToken', token);
            login(empEmail, employeeId);

            const employeeRole = role?.trim().toLowerCase() || 'user';
            setIsLoggedIn(true);
            setUserRole(employeeRole);

            if (employeeRole === 'admin' || employeeRole === 'manager') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error('Login error:', err);
            setErrorMessage('An error occurred while trying to log in.');
        }
    };

    return (
        <form className="login" onSubmit={handleSubmit}>
            <input
                type="email"
                className="login-input"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />

            {errorMessage && <p className="error-message" id="login">{errorMessage}</p>}

            <button type="submit" className="button-primary">
                Login
            </button>
        </form>
    );
};
