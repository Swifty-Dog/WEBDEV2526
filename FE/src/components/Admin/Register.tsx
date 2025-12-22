import React, {useEffect} from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/locales/i18n.ts';
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from 'react';
import { ApiPost } from '../../config/ApiRequest.ts';
import type {ApiErrorData} from "../../utils/types.ts";

const translateApiError = (data: ApiErrorData, fallbackT: typeof i18n.t): string => {
    if (data?.message) {
        const [namespace, key] = data.message.split('.');
        const fullKey = `${namespace}:${key}`;
        const interpolationData = data.arguments as Record<string, string>;

        return i18n.t(fullKey, interpolationData);
    }

    return fallbackT('general.networkError');
};

export const Register: React.FC = () => {
    const { t } = useTranslation('common');

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = t('general.buttonRegister') + " | " + import.meta.env.VITE_APP_NAME;
    }, [t]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const requiredFields: { field: string, value: string, labelKey: string }[] = [
            { field: 'FirstName', value: firstName, labelKey: 'form.labelFirstName' },
            { field: 'LastName', value: lastName, labelKey: 'form.labelLastName' },
            { field: 'Email', value: email, labelKey: 'form.labelEmail' },
            { field: 'Password', value: password, labelKey: 'form.labelPassword' },
        ];

        const missing = requiredFields.filter(f => f.value === '');
        if (missing.length > 0) {
            const missingLabels = missing.map(f => t(f.labelKey).toLowerCase());

            const listSeparator = t('general.listSeparator').toLowerCase().trim();

            let formattedList: string;

            if (missingLabels.length === 1) {
                formattedList = missingLabels[0];
            } else {
                const last = missingLabels.pop();
                formattedList = missingLabels.join(', ') + ' ' + listSeparator + ' ' + last;
            }

            const alertMessage = t('form.alertRequired', {
                fields: formattedList,
                count: missing.length
            });

            const capitalized = alertMessage.charAt(0).toUpperCase() + alertMessage.slice(1);
            alert(capitalized);
            return;
        }

        if (password !== passwordConfirm)
        {
            alert(t('form.alertPasswordMismatch'));
            return;
        }

        setIsLoading(true);
        try {
            await ApiPost(
                'Employee/register',
                { FirstName: firstName, LastName: lastName, Email: email, Password: password }
            );

            setSuccessMessage(t('form.success'));

            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPasswordConfirm('');
        } catch (err) {
            const errorObject = err as Error;
            let errorMessage: string;

            try {
                const structuredData = JSON.parse(errorObject.message);

                if (structuredData?.message) {
                    errorMessage = translateApiError(structuredData as ApiErrorData, i18n.t);
                } else {
                    errorMessage = t('general.networkError');
                }
            } catch {
                errorMessage = t('general.networkError');
            }

            setErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login">
                <input id="firstName" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)}
                className="login-input" placeholder={t('form.labelFirstName')} />

                <input id="lastName" name="lastName" value={lastName} onChange={e => setLastName(e.target.value)}
                className="login-input" placeholder={t('form.labelLastName')} />

                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="login-input" placeholder={t('form.labelEmail')} />

                <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="login-input" placeholder={t('form.labelPassword')} />

                <input id="password-confirm" name="password-confirm" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                className="login-input" placeholder={t('form.labelPasswordConfirm')} />

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="button-primary" disabled={isLoading}>{isLoading ? t('form.labelRegistering') : t('general.buttonRegister')}</button>
                    <button type="button" className="button-primary" onClick={() => navigate(-1)}>{t('general.buttonCancel')}</button>
                </div>
        </form>
    );
};
