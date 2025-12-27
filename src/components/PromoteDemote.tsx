

import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { useSettings } from '../config/SettingsContext';
import { useTranslation } from 'react-i18next';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface Props {
    onClose: () => void;
}


export const PromoteDemoteModal: React.FC<Props> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [foundEmployees, setFoundEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState<boolean>(false);
    const settings = useSettings();
    const { t } = useTranslation(['admin', 'common']);

    const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);
        setFoundEmployees([]);
        setSearched(true);

        try {
            const response = await fetch(`${API_BASE_URL}/Employee/search?query=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Employee not found');
            }

            const result = await response.json();

            if (result.employees && result.employees.length > 0) {
                setFoundEmployees(result.employees);
            } else {
                throw new Error('Employee not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search employee');
            setFoundEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handlePromoteDemote = async (employee: Employee) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/Employee/promote-demote/${employee.id}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message ?? 'Failed to update employee role');
            }

            const refresh = await fetch(`${API_BASE_URL}/Employee/search?query=${encodeURIComponent(searchQuery)}`, { method: 'GET' });
            if (!refresh.ok) {
                setError('Role updated, but failed to refresh employee data');
                return;
            }

            const refreshed = await refresh.json();
            if (refreshed.employees && refreshed.employees.length > 0) {
                setFoundEmployees(refreshed.employees);
            } else {
                setFoundEmployees([]);
                setError('Role updated but employee not found after refresh');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `var(--base-font-size, 16px)`
        }}>
            <div style={{
                background: settings.theme === 'Dark' ? '#23272f' : '#fff',
                color: settings.theme === 'Dark' ? '#f3f3f3' : '#222',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                maxWidth: 520,
                width: '95vw',
                minHeight: 320,
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.5rem 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        background: 'transparent',
                        border: 'none',
                        fontSize: 24,
                        color: settings.theme === 'Dark' ? '#bbb' : '#888',
                        cursor: 'pointer',
                        zIndex: 2,
                    }}
                    aria-label={t('common:close', 'Close')}
                >
                    ×
                </button>
                <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.6rem', textAlign: 'center', fontWeight: 700, letterSpacing: 0.2 }}>
                    {t('admin:promoteDemoteTitle', 'Promote / Demote Employee')}
                </h3>

                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '1rem' }}>{t('admin:searchEmployee', 'Search for Employee')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('admin:searchPlaceholder', 'Enter employee name, email, or ID')}
                            style={{
                                flex: 1,
                                padding: '0.7rem 1rem',
                                fontSize: '1rem',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'border 0.2s',
                                background: settings.theme === 'Dark' ? '#23272f' : '#fff',
                                color: settings.theme === 'Dark' ? '#f3f3f3' : '#222',
                            }}
                        />
                        <button
                            type="button"
                            className="btn-sm"
                            onClick={e => handleSearch(e)}
                            disabled={loading}
                            style={{
                                padding: '0.7rem 1.5rem',
                                fontSize: '1rem',
                                background: 'var(--color-brand-accent, #1976d2)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                transition: 'background 0.2s',
                            }}
                        >
                            {loading ? t('common:searching', 'Searching...') : t('common:search', 'Search')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#d32f2f', marginBottom: '1.5rem', padding: '1rem', backgroundColor: settings.theme === 'Dark' ? '#3a2323' : '#ffebee', borderRadius: '6px', fontSize: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {foundEmployees.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {foundEmployees.map((emp) => (
                            <div key={emp.id} style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '10px',
                                padding: '1.2rem',
                                backgroundColor: settings.theme === 'Dark' ? '#23272f' : '#fafbfc',
                                color: settings.theme === 'Dark' ? '#f3f3f3' : '#222',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                minHeight: 160,
                            }}>
                                <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>{emp.firstName} {emp.lastName}</h4>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.97rem', wordBreak: 'break-word' }}>
                                    <strong>{t('common:email', 'Email')}:</strong> {emp.email}
                                </div>
                                <div style={{ marginBottom: '0.75rem', fontSize: '0.97rem' }}>
                                    <strong>{t('common:role', 'Role')}:</strong> <span style={{ color: 'var(--color-brand-accent, #1976d2)', fontWeight: 600 }}>{emp.role}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlePromoteDemote(emp)}
                                    disabled={loading}
                                    style={{
                                        background: 'var(--color-brand-accent, #1976d2)',
                                        color: 'white',
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '1rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    {loading ? t('common:updating', 'Updating...') :
                                        emp.role.toLowerCase() === 'employee'
                                            ? t('admin:promoteToManager', 'Promote to Manager')
                                            : t('admin:demoteToEmployee', 'Demote to Employee')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!foundEmployees.length && searchQuery && !error && !loading && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '2rem', fontSize: '1.05rem' }}>
                        {searched ? t('admin:employeeNotFound', 'Employee not found') : t('admin:clickSearch', 'Click "Search" to find an employee')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoteDemoteModal;