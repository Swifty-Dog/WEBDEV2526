import {createContext } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userEmail: string | null;
    employeeId: number | null;
    login: (email: string, employeeId: number) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
