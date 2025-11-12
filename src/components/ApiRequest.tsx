type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export async function ApiRequest<T>(
    url: string,
    method: HttpMethod,
    requestBody?: object | null,
    extraHeaders?: Record<string, string>
): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...extraHeaders
        },
        body: requestBody ? JSON.stringify(requestBody) : undefined,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Request failed.';
        throw new Error(errorMessage);
    }

    return await response.json() as Promise<T>;
}
