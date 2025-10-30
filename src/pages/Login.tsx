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
    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault(); // Prevents the default browser form submission

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

        // **MOCK SUCCESS**
        setIsLoggedIn(true);
        navigate('/dashboard');
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

            <button type="submit" className="button-primary">
                Login
            </button>
        </form>
    );
}