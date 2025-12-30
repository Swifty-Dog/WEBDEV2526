import { useState } from 'react';
import { ApiPut } from '../../config/ApiRequest';

export interface PromoteDemoteResponse {
    message: string;
}

export const useUpdatePromoteDemote = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const updatePromoteDemote = async (employeeId: number) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await ApiPut<PromoteDemoteResponse>(`/Employee/promote-demote/${employeeId}`, {});
            setSuccess(result.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    return { updatePromoteDemote, loading, error, success };
};
