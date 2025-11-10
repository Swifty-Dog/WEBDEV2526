import { useState, type Dispatch, type FC, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiRequest } from '../components/ApiRequest';
import '../styles/_components.css';
import '../styles/global.css';

interface LoginProps {
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    setUserRole: Dispatch<SetStateAction<string | null>>;
}

interface LoginResponse {
    employee: {
        employeeId: number;
        name: string;
        email: string;
        role: string;
        token: string;
    };
}

export const Login: FC<LoginProps> = ({ setIsLoggedIn, setUserRole }) => {
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
            const token = localStorage.getItem('authToken');
            const data: LoginResponse = await ApiRequest<LoginResponse>(
                'http://localhost:5222/api/Employee/login',
                'POST',
                { email, password },
                token ? { Authorization: `Bearer ${token}` } : undefined
            );

            localStorage.setItem('authToken', data.employee.token);
            const employeeRole: string = data.employee.role.trim().toLowerCase();

            setIsLoggedIn(true);
            setUserRole(employeeRole);

            navigate(employeeRole === 'admin' || employeeRole === 'manager' ? '/admin-dashboard' : '/dashboard');

        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred.');
            }
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
