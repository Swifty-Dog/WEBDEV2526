import { API_BASE_URL } from './api.ts';
import type { ApiErrorData } from '../utils/types.ts';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import i18n from "../utils/locales/i18n.ts";

type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

interface RefreshResponse {
    token: string;
    refreshToken: string;
}

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

let failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    originalRequest: () => Promise<unknown>;
}[] = [];

let isRefreshing = false;

const processQueue = (error: Error | null, newToken: string | null = null) => {
    failedQueue.forEach(queueItem => {
        if (error) {
            queueItem.reject(error);
        } else {
            queueItem.resolve(newToken);
        }
    });
    failedQueue = [];
};

const refreshAccessToken = async (): Promise<RefreshResponse> => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new AuthError('No refresh token available.');
    }

    const url = `${API_BASE_URL}/Employee/refresh`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.status === 401 || response.status === 400) {
            throw new AuthError('Refresh token invalid or expired.');
        }

        if (!response.ok) {
            throw new Error(`Server error during refresh: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof AuthError) throw error;
        throw new Error('Network error during token refresh');
    }
};

const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: JwtPayload = jwtDecode(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime + 10;
    } catch {
        return true;
    }
};

export const getValidToken = async (): Promise<string> => {
    const token = localStorage.getItem('authToken');

    if (!token || isTokenExpired(token)) {
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({
                    resolve: (t) => resolve(t as string),
                    reject,
                    originalRequest: async () => {}
                });
            });
        }

        isRefreshing = true;
        try {
            const refreshData = await refreshAccessToken();

            localStorage.setItem('authToken', refreshData.token);
            sessionStorage.setItem('refreshToken', refreshData.refreshToken);

            processQueue(null, refreshData.token);
            return refreshData.token;
        } catch (error) {
            processQueue(error as Error);

            if (error instanceof AuthError) {
                console.warn("Fatal auth error, logging out:", error.message);
                handleLogout();
            } else {
                console.error("Token refresh failed (Network/Server), keeping session:", error);
            }

            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return token;
};

export const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
};

const translateError = (translator: typeof i18n) => (namespace: string) => (error: ApiErrorData) => {
    return translator.t(error.message ?? 'error.unknown', {
        ...error.arguments,
        ns: namespace
    });
};

async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod,
    body?: unknown | null,
    extraHeaders?: Record<string, string>,
    isRetry = false
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const createOptions = (currentHeaders: Record<string, string> | undefined): RequestInit => {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...currentHeaders,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return {
            method,
            headers: headers,
            body: body ? JSON.stringify(body) : undefined,
        };
    };

    const retryRequest = (newToken: string): Promise<T> => {
        const retryHeaders = { ...extraHeaders, 'Authorization': `Bearer ${newToken}` };
        return apiRequest<T>(endpoint, method, body, retryHeaders, true);
    };

    const options = createOptions(extraHeaders);
    const response = await fetch(url, options);

    if (response.status === 401 && !isRetry) {

        return new Promise<T>((resolve, reject) => {
            (async () => {

                if (isRefreshing) {
                    failedQueue.push({
                        resolve: (newToken) => {
                            retryRequest(newToken as string).then(resolve).catch(reject);
                        },
                        reject,
                        originalRequest: () => Promise.resolve()
                    });
                    return;
                }

                isRefreshing = true;

                try {
                    const refreshData = await refreshAccessToken();

                    localStorage.setItem('authToken', refreshData.token);
                    sessionStorage.setItem('refreshToken', refreshData.refreshToken);

                    processQueue(null, refreshData.token);
                    const retryResponse = await retryRequest(refreshData.token);
                    resolve(retryResponse);
                    console.log('Access token refreshed successfully.');

                } catch (refreshError) {
                    processQueue(refreshError as Error);

                    // 4. Same logic here: Only logout on actual Auth failures
                    if (refreshError instanceof AuthError) {
                        handleLogout();
                    }
                    reject(refreshError);

                } finally {
                    isRefreshing = false;
                }
            })();
        });
    }

    let data: unknown = null;
    try {
        data = await response.json();
    } catch {
        // Ignore JSON parse errors for empty responses
    }

    if (!response.ok) {
        const errorData = data as ApiErrorData;

        if (errorData?.message) {
            const formatApiError = translateError(i18n)('api');
            const structuredError = formatApiError(errorData);

            throw new Error(structuredError);
        }

        throw new Error(`Request failed with status ${response.status}`);
    }

    return data as T;
}

export function ApiGet<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, 'GET', null, headers);
}

export function ApiPost<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, 'POST', body, headers);
}

export function ApiPut<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, 'PUT', body, headers);
}

export function ApiDelete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, 'DELETE', null, headers);
}
