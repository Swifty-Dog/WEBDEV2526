import {useState, type Dispatch, type FC, type FormEvent, type SetStateAction, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ApiPost } from '../config/ApiRequest.ts';
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
        refreshToken: string;
    };
}

export const Login: FC<LoginProps> = ({ setIsLoggedIn, setUserRole }) => {
    const { t: tCommon } = useTranslation('common');
    const { t: tApi } = useTranslation('api');

    useEffect(() => {
        document.title = tCommon('general.buttonLogin') + " | " + import.meta.env.VITE_APP_NAME;
    }, [tCommon]);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (email === '' || password === '') {
            const fields = [];
            if (email === '') fields.push(tCommon('register.labelEmail'));
            if (password === '') fields.push(tCommon('register.labelPassword'));

            alert(tCommon('register.alertRequired', { fields: fields.join(tCommon('general.listSeparator')) }));
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const data: LoginResponse = await ApiPost<LoginResponse>(
                '/Employee/login',
                { email, password },
                token ? { Authorization: `Bearer ${token}` } : undefined
            );

            localStorage.setItem('authToken', data.employee.token);
            sessionStorage.setItem('refreshToken', data.employee.refreshToken);

            const employeeRole: string = data.employee.role.trim().toLowerCase();

            setIsLoggedIn(true);
            setUserRole(employeeRole);

            navigate(employeeRole === 'admin' || employeeRole === 'manager' ? '/admin-dashboard' : '/dashboard');

        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(tApi(error.message));
            } else {
                setErrorMessage(tApi('general.API_ErrorUnexpected'));
            }
        }
    };

    return (
        <form className="login" onSubmit={handleSubmit}>
            <input
                type="email"
                className="login-input"
                id="email"
                placeholder={tCommon('form.placeholderEmail')}
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
                placeholder={tCommon('form.placeholderPassword')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="button-primary">
                {tCommon('general.buttonLogin')}
            </button>
        </form>
    );
}
