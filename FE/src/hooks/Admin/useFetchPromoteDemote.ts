import { useState } from 'react';
import { ApiGet } from '../../config/ApiRequest';
import { useTranslation } from 'react-i18next';

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export const useFetchPromoteDemote = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { t: tAdmin } = useTranslation('admin');

    const fetchPromoteDemote = async (searchQuery: string) => {
        setLoading(true);
        setError(null);
        setEmployees([]);

        try {
            const token = localStorage.getItem('authToken');

            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            const result = await ApiGet<{ employees: Employee[] }>(`/Employee/search?query=${encodeURIComponent(searchQuery)}`, headers);
            if (result.employees && result.employees.length > 0) {
                setEmployees(result.employees);
                setError(null);
            } else {
                setEmployees([]);
                tAdmin('admin.API_ErrorNoEmployeesFound');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    return { fetchPromoteDemote, loading, error, employees };
};