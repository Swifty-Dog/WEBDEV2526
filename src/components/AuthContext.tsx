import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userEmail: string | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('isLoggedIn');
    });
    const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));

    const login = (email: string) => {
        setIsAuthenticated(true);
        setUserEmail(email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};