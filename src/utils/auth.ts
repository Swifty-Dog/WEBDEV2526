import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    role?: string;
    Role?: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'?: string;
    exp: number;
    [key: string]: any;
}

export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

export const getUserRoleFromToken = (token: string | null): string | null => {
    if (!token) return null;

    try {
        const decoded = jwtDecode<DecodedToken>(token);

        // 1. Check Expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('authToken');
            return null;
        }

        // 2. Look for the role in common variations
        const role =
            decoded.role ||
            decoded.Role ||
            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

        return role?.toLowerCase() || null;
    } catch {
        return null;
    }
};
