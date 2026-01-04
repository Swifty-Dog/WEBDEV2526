import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFetchEmployees } from '../../hooks/Admin/useFetchEmployees';
import { useTerminationManager } from '../../hooks/Admin/useTerminationManager';
import { useDebounce } from '../../hooks/useDebounce';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmployeeControls } from './EmployeeControls';
import { EmployeeList } from './EmployeeList';
import { PaginationFooter } from './PaginationFooter';

interface TerminateEmployeeProps {
    isLoggedIn: boolean;
}

export const TerminateEmployee: React.FC<TerminateEmployeeProps> = ({ isLoggedIn }) => {
    const { t: tAdmin } = useTranslation('admin');
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useEffect(() => {
        document.title = tAdmin('terminateEmployee.title') + " | " + import.meta.env.VITE_APP_NAME;
    }, [tAdmin]);

    const debouncedSearchTerm = useDebounce(searchTerm, 250);

    useEffect(() => { setPage(1); }, [debouncedSearchTerm, pageSize]);

    const { employees, totalCount, loading, error: fetchError, refetch } = useFetchEmployees(
        token, isLoggedIn, page, pageSize, debouncedSearchTerm
    );

    const termination = useTerminationManager(token, refetch);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const isInitialLoad = loading && (!employees || employees.length === 0);

    return (
        <div className="panel-fancy-borders">
            <button className="back-link extra-spacing" onClick={() => navigate('/admin-dashboard')}>
                ❮ {tAdmin('button.backToAdminDashboard')}
            </button>

            <h1 className="extra-spacing">{tAdmin('terminateEmployee.title')}</h1>

            {termination.success && <p className="success-message">{tAdmin('terminateEmployee.success')}</p>}
            {termination.error && <p className="error-message">{termination.error}</p>}
            {fetchError && <p className="error-message">{fetchError}</p>}

            <EmployeeControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            {isInitialLoad ? (
                <p>{tAdmin('terminateEmployee.loading')}</p>
            ) : (
                <div className={loading ? "refreshing-data" : ""}>
                    <EmployeeList
                        employees={employees}
                        onTerminate={termination.openConfirmation}
                    />
                    <PaginationFooter
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {termination.employeeToTerminate && (
                <ConfirmDialog
                    title={tAdmin('terminateEmployee.confirmTitle')}
                    message={tAdmin('terminateEmployee.confirmMessage', {
                        name: termination.employeeToTerminate.firstName,
                        email: termination.employeeToTerminate.email
                    })}
                    onConfirm={termination.confirmTermination}
                    onCancel={termination.cancelTermination}
                />
            )}
        </div>
    );
};
