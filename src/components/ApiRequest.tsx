import { API_BASE_URL } from '../config/api';
import type { ApiErrorData } from '../utils/types';

type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod,
    body?: unknown | null,
    extraHeaders?: Record<string, string>
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // If there are extra headers, include them here.
            // I.e. a translation header if we change how server-side translations work. Currently not used.
            ...extraHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);

    let data: unknown = null;
    try {
        data = await response.json();
    } catch {
        // Ignore JSON parse errors for empty responses
    }

    if (!response.ok) {
        const errorData = data as ApiErrorData;

        if (errorData?.message) {
            const structuredError = JSON.stringify({
                message: errorData.message,
                arguments: errorData.arguments
            });

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
