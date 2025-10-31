import { Navigate } from 'react-router-dom';
import type {JSX} from "react";

interface ProtectedRouteProps {
    isLoggedIn: boolean;
    userRole: string | null;
    allowedRoles: string[];
    children: JSX.Element;
}

export const ProtectedRoute = ({ isLoggedIn, userRole, allowedRoles, children }: ProtectedRouteProps) => {
    if (!isLoggedIn || !userRole || !allowedRoles.includes(userRole.toLowerCase())) {
        // TODO: Add logout logic here, like clearing backend session if needed.
        localStorage.removeItem('authToken');
        return <Navigate to="/login" replace />;
        }

    return children;
};
