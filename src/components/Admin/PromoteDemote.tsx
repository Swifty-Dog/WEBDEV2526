import React, { useState } from 'react';
import '../../styles/_components.css';
import { useFetchPromoteDemote } from '../../hooks/Admin/useFetchPromoteDemote';
import { useUpdatePromoteDemote } from '../../hooks/Admin/useUpdatePromoteDemote';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searched, setSearched] = useState(false);
    const settings = useSettings();
    const { t: tAdmin } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { t: tApi } = useTranslation('api');

    const { fetchPromoteDemote, loading, error, employees } = useFetchPromoteDemote();
    const { updatePromoteDemote, loading: updateLoading, error: updateError, success } = useUpdatePromoteDemote();

    const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) {
            return;
        }
        setSearched(true);
        await fetchPromoteDemote(searchQuery);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handlePromoteDemote = async (employee: Employee) => {
        const employeeId = typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id;
        if (isNaN(employeeId) || employeeId <= 0) {
            return;
        }

        await updatePromoteDemote(employeeId);
        await fetchPromoteDemote(searchQuery);
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

                {(error || updateError) && (
                    <div className={`promote-demote-error${settings.theme === 'Dark' ? ' dark' : ''}`}>{error || updateError}</div>
                )}
                {success && (
                    <div className="success-message">{tApi(success)}</div>
                )}

                {employees.length > 0 && (
                    <div className="promote-demote-employee-list">
                        {employees.map((emp) => (
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
                                    disabled={loading || updateLoading}
                                    className="promote-demote-action-btn"
                                >
                                    {(loading || updateLoading) ? tCommon('updating') :
                                        emp.role.toLowerCase() === 'employee'
                                            ? tAdmin('PromoteDemoteEmployee.promoteToManager')
                                            : tAdmin('PromoteDemoteEmployee.demoteToEmployee')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!employees.length && searchQuery && !error && !loading && (
                    <div className="promote-demote-empty">
                        {searched ? tAdmin('PromoteDemoteEmployee.employeeNotFound') : tAdmin('PromoteDemoteEmployee.clickSearch')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoteDemoteModal;