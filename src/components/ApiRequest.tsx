import { API_BASE_URL } from '../config/api';
import type { ErrorResponse } from '../utils/types';

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
        const errorData = data as ErrorResponse;
        const errorMessage = errorData?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
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
