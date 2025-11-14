import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent, type FC, type Dispatch, type SetStateAction } from 'react';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
            
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (email === '') {
            let message = 'Email';
            if (password === '') { message += ', Password';}
            if (firstName === '') { message += ', First Name';}
            if (lastName === '') { message += ', Last Name';}

            if (message.includes(',')) {message += ' are required';}
            else {message += ' is required';}
            alert(message);
            return;
        }

        else if (password === '') {
            let message = 'Password';
            if (firstName === '') { message += ', First Name';}
            if (lastName === '') { message += ', Last Name';}

            if (message.includes(',')) {message += ' are required';}
            else {message += ' is required';}
            alert(message);
            return;
        }

        else if (firstName === '') {
            if (lastName === '') 
                { 
                    alert('First Name and Last Name are required');
                    return;
                }
            alert('First Name is required');
            return;
        }

        else if (lastName === '') {
            alert('Last Name is required');
            return;
        }

        setIsLoading(true);
        try {
            const resp = await fetch('http://localhost:5222/api/Employee/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ FirstName: firstName, LastName: lastName, Email: email, Password: password })
            });

            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                console.error('Registration error response:', { status: resp.status, data });
                setErrorMessage(data?.message ?? 'Registration failed');
                setIsLoading(false);
                return;
            }
            
            setSuccessMessage('Registration successful!');

            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
        } catch (err) {
            console.error('Fetch error:', err);
            setErrorMessage((err as Error).message ?? 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login">
                <input id="firstName" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)}
                className="login-input" placeholder="First Name" />

                <input id="lastName" name="lastName" value={lastName} onChange={e => setLastName(e.target.value)}
                className="login-input" placeholder="Last name" />

                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} 
                className="login-input" placeholder="Email"/>

                <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="login-input" placeholder="Password" />

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="header-button" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
                    <button type="button" className="header-button" onClick={() => navigate(-1)}>Cancel</button>
                </div>
        </form>
    );
};