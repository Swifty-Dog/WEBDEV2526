import { useState } from 'react';
import { type Employee } from './useFetchEmployees';
import { useTerminateEmployee } from './useTerminateEmployee';

export const useTerminationManager = (token: string | null, onSuccess: () => void) => {
    const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);

    const { terminateEmployee, loading, error, success } = useTerminateEmployee(token);

    const openConfirmation = (employee: Employee) => {
        if (!loading) setEmployeeToTerminate(employee);
    };

    const cancelTermination = () => {
        if (!loading) setEmployeeToTerminate(null);
    };

    const confirmTermination = async () => {
        if (employeeToTerminate) {
            const isSuccessful = await terminateEmployee(employeeToTerminate.id);
            if (isSuccessful) {
                setEmployeeToTerminate(null);
                onSuccess();
            }
        }
    };

    return { employeeToTerminate, openConfirmation, cancelTermination, confirmTermination, loading, error, success };
};
