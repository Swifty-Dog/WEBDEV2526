import React, { useState } from 'react';
import '../../styles/_components.css';
import { API_BASE_URL } from '../../config/api';
import { useSettings } from '../../config/SettingsContext';
import { useTranslation } from 'react-i18next';

interface Employee {
    id: number;
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
    const { t: tAdmin } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        
        if (!searchQuery.trim()) {
            setError(tCommon('form:alertRequired_one', { fields: tCommon('search') }));
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
                throw new Error(tAdmin('PromoteDemoteEmployee.employeeNotFound'));
            }

            const result = await response.json();

            if (result.employees && result.employees.length > 0) {
                setFoundEmployees(result.employees);
            } else {
                throw new Error(tAdmin('PromoteDemoteEmployee.employeeNotFound'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : tCommon('networkError'));
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
            // Debug log for employee id
            console.log('Promote/Demote employee.id:', employee.id, typeof employee.id);
            const employeeId = typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id;
            if (isNaN(employeeId) || employeeId <= 0) {
                setError(tCommon('form:failDefault', 'Invalid employee ID.'));
                setLoading(false);
                return;
            }
            const response = await fetch(`${API_BASE_URL}/Employee/promote-demote/${employeeId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message ?? tCommon('form:failDefault', 'Promotion/Demotion failed. Please try again.'));
            }

            const refresh = await fetch(`${API_BASE_URL}/Employee/search?query=${encodeURIComponent(searchQuery)}`, { method: 'GET' });
            if (!refresh.ok) {
                setError(tCommon('form:failDefault', 'Search refresh failed. Please try again.'));
                return;
            }

            const refreshed = await refresh.json();
            if (refreshed.employees && refreshed.employees.length > 0) {
                setFoundEmployees(refreshed.employees);
            } else {
                setFoundEmployees([]);
                setError(tAdmin('PromoteDemoteEmployee.employeeNotFound'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : tCommon('form:failDefault', 'Promotion/Demotion failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="promote-demote-modal-overlay">
            <div className={`promote-demote-modal${settings.theme === 'Dark' ? ' dark' : ''}`}>
                <button
                    onClick={onClose}
                    className={`promote-demote-close${settings.theme === 'Dark' ? ' dark' : ''}`}
                    aria-label={tCommon('buttonClose')}
                >
                    ×
                </button>
                <h3 className="promote-demote-title">
                    {tAdmin('PromoteDemoteEmployee.promoteDemoteTitle')}
                </h3>

                <div className="promote-demote-search-row">
                    <label className="promote-demote-search-label">{tAdmin('PromoteDemoteEmployee.searchEmployee')}</label>
                    <div className="promote-demote-search-input-row">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={tAdmin('PromoteDemoteEmployee.searchPlaceholder')}
                            className={`promote-demote-search-input${settings.theme === 'Dark' ? ' dark' : ''}`}
                        />
                        <button
                            type="button"
                            className="btn-sm promote-demote-search-btn"
                            onClick={e => handleSearch(e)}
                            disabled={loading}
                        >
                            {loading ? tCommon('searching') : tCommon('search')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={`promote-demote-error${settings.theme === 'Dark' ? ' dark' : ''}`}>{error}</div>
                )}

                {foundEmployees.length > 0 && (
                    <div className="promote-demote-employee-list">
                        {foundEmployees.map((emp) => (
                            <div key={emp.id} className={`promote-demote-employee-card${settings.theme === 'Dark' ? ' dark' : ''}`}> 
                                <h4 className="promote-demote-employee-name">{emp.firstName} {emp.lastName}</h4>
                                <div className="promote-demote-employee-email">
                                    <strong>{tCommon('form.labelEmail')}:</strong> {emp.email}
                                </div>
                                <div className="promote-demote-employee-role">
                                    <strong>{tCommon('form.labelRole')}:</strong> <span className="promote-demote-role-span">{tCommon(`roles.${emp.role}`, emp.role)}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlePromoteDemote(emp)}
                                    disabled={loading}
                                    className="promote-demote-action-btn"
                                >
                                    {loading ? tCommon('updating') :
                                        emp.role.toLowerCase() === 'employee'
                                            ? tAdmin('PromoteDemoteEmployee.promoteToManager')
                                            : tAdmin('PromoteDemoteEmployee.demoteToEmployee')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!foundEmployees.length && searchQuery && !error && !loading && (
                    <div className="promote-demote-empty">
                        {searched ? tAdmin('PromoteDemoteEmployee.employeeNotFound') : tAdmin('PromoteDemoteEmployee.clickSearch')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoteDemoteModal;