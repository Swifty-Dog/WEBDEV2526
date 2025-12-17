import React from 'react';
import { useTranslation } from 'react-i18next';
import { TerminateEmployeeCard } from './TerminateEmployeeCard';
import { type Employee } from '../../hooks/Admin/useFetchEmployees';

interface EmployeeListProps {
    employees: Employee[] | null;
    onTerminate: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onTerminate }) => {
    const { t: tAdmin } = useTranslation('admin');

    if (!employees || employees.length === 0) {
        return <p>{tAdmin('terminateEmployee.noEmployees')}</p>;
    }

    return (
        <div className="section-card employee-container">
            {employees.map((employee) => (
                <TerminateEmployeeCard
                    key={employee.id}
                    employee={employee}
                    onTerminate={onTerminate}
                />
            ))}
        </div>
    );
};
