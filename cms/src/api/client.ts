export const API_URL = '/api/v1';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('peblo_cms_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    customHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // For file uploads (FormData), we should not set Content-Type manually
  // so fetch can set the boundary correctly.
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Ignored
    }
    
    if (response.status === 401 || response.status === 403) {
      if (endpoint !== '/auth/login' && endpoint !== '/auth/me') {
        localStorage.removeItem('peblo_cms_token');
        window.location.href = '/login';
      }
    }
    
    throw new Error(message);
  }
  
  // 204 No Content won't have JSON body
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}
