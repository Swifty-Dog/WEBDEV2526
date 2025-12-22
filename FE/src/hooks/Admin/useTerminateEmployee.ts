import { useState } from 'react';
import { ApiPut } from "../../config/ApiRequest.ts";


export const useTerminateEmployee = (token: string | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const terminateEmployee = async (employeeId: number): Promise<boolean> => {
        if (!token) {
            setError('No authentication token provided.');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await ApiPut(`/employee/terminate/${employeeId}`, null, {
                Authorization: `Bearer ${token}`,
            });
            setSuccess(true);
            return true;
        }
        catch (err) {
            console.warn('Error terminating employee:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
            return false;
        }
        finally {
            setLoading(false);
        }
    };

    return { terminateEmployee, loading, error, success };
};
