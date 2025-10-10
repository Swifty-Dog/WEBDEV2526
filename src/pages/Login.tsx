import { useState, type FormEvent } from 'react';
import '../styles/global.css';
import '../styles/Login.css';

export function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault(); // Prevents the default browser form submission
        // Add POST request logic here...
        console.log('Login attempt with:', email, password);
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