import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Employee } from '../../hooks/Admin/useFetchEmployees.ts';

interface EmployeeCardProps {
    employee: Employee;
    onTerminate: (employee: Employee) => void;
}

export const TerminateEmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onTerminate }) => {
    const { t: tAdmin } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    const handleTerminate = (emp: Employee) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onTerminate(emp);
    };

    return (
        <div className="panel-fancy-borders auto-size">
            <p>{tCommon('form.labelId')}: {employee.id}</p>
            <p>{tCommon('form.labelName')}: {employee.firstName} {employee.lastName}</p>
            <p>{tCommon('form.labelEmail')}: {employee.email}</p>
            <p>{tCommon('form.labelRole')}: {tCommon(`roles.${employee.role}`)}</p>
            <button
                className="button-primary btn-danger"
                onClick={handleTerminate(employee)}
            >
                {tAdmin('terminateEmployee.terminate')}
            </button>
        </div>
    );
}
