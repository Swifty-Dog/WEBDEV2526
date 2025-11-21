import {type ReactNode, useState} from "react";
import {AuthContext} from "./AuthContext.tsx";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('isLoggedIn'));
    const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
    const [employeeId, setEmployeeId] = useState<number | null>(
        localStorage.getItem('employeeId') ? Number(localStorage.getItem('employeeId')) : null
    );

    const login = (email: string, id: number) => {
        setIsAuthenticated(true);
        setUserEmail(email);
        setEmployeeId(id);

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('employeeId', id.toString());
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setEmployeeId(null);

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('employeeId');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userEmail, employeeId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
