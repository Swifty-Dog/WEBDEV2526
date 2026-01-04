import { Navigate } from 'react-router-dom';
import type {JSX} from "react";

interface ProtectedRouteProps {
    isLoggedIn: boolean;
    userRole: string | null;
    allowedRoles: string[];
    children: JSX.Element;
}

export const ProtectedRoute = ({ isLoggedIn, userRole, allowedRoles, children }: ProtectedRouteProps) => {
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (userRole === null) {
        return children;
    }

    if (!allowedRoles.includes(userRole.toLowerCase())) {
        const unauthorizedRedirectPath =
            (userRole === 'admin' || userRole === 'manager') ? '/admin-dashboard' : '/dashboard';

        return <Navigate to={unauthorizedRedirectPath} replace />;
    }

    return children;
};
