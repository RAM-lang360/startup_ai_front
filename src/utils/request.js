/**
 * API Request Utility Method
 * @param {string} path - API endpoint path or full URL
 * @param {Object} [options] - Request configuration options
 * @returns {Promise<any>} Response JSON data
 */
export async function request(path, options = {}) {
  const method = options.method || 'GET';
  const baseUrl = options.baseUrl || process.env.REACT_APP_API_BASE_URL || '/api';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${baseUrl}${cleanPath}`;

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

request.get = (path, headers) => request(path, { method: 'GET', headers });
request.post = (path, body, headers) => request(path, { method: 'POST', body, headers });
request.patch = (path, body, headers) => request(path, { method: 'PATCH', body, headers });
request.delete = (path, headers) => request(path, { method: 'DELETE', headers });
