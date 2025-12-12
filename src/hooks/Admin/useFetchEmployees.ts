import {useCallback, useEffect, useState} from 'react';
import { ApiGet } from '../../config/ApiRequest.ts';

type roles = 'admin' | 'manager' | 'employee' | string;

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: roles;
}

export interface EmployeesResponse {
    employees: Employee[];
    totalCount: number;
}

export const useFetchEmployees = (
    token: string | null,
    isLoggedIn: boolean,
    page: number,
    pageSize: number,
    searchTerm: string = ''
) => {
    const [employees, setEmployees] = useState<Employee[] | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = useCallback(async () => {
        if (!token || !isLoggedIn) {
            setEmployees(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const query = `/employee?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;

            const responseData = await ApiGet<EmployeesResponse>(query, {
                Authorization: `Bearer ${token}`
            });

            if (responseData) {
                setEmployees(responseData.employees);
                setTotalCount(responseData.totalCount);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, isLoggedIn, page, pageSize, searchTerm]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return { employees, totalCount, loading, error, refetch: fetchEmployees };
};
