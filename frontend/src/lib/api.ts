const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');


    // We set up default headers. If the request isn't sending FormData (like files), we default to JSON.
    const headers: Record<string, string> = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string>),
    };

    if(token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        cache: 'no-store',
        ...options,
        headers,
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.error || 'API Request Failed');
    }

    return data;
}
