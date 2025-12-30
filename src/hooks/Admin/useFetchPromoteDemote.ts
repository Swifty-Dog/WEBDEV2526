import { useState } from 'react';
import { ApiGet } from '../../config/ApiRequest';

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
                setError('No employees found.');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    return { fetchPromoteDemote, loading, error, employees };
};