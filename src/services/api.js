const API_BASE_URL = '/api';

// Generic API request handler with error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
    });

    // First check if the response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An unknown error occurred'
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return null; // Return null for empty responses
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  logout: () => request('/auth/logout', {
    method: 'POST',
  }),

  getProfile: () => request('/auth/profile'),
};

// Dreams API
export const dreamsApi = {
  getAllDreams: (params) => request('/dreams' + (params ? `?${new URLSearchParams(params)}` : '')),
  
  getDream: (id) => request(`/dreams/${id}`),
  
  createDream: (dreamData) => request('/dreams', {
    method: 'POST',
    body: JSON.stringify(dreamData),
  }),
  
  updateDream: (id, dreamData) => request(`/dreams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dreamData),
  }),
  
  deleteDream: (id) => request(`/dreams/${id}`, {
    method: 'DELETE',
  }),

  getDreamSymbols: (dreamId) => request(`/dreams/${dreamId}/symbols`),
  
  addDreamSymbol: (dreamId, symbolData) => request(`/dreams/${dreamId}/symbols`, {
    method: 'POST',
    body: JSON.stringify(symbolData),
  }),
};

// Interpretations API
export const interpretationsApi = {
  getInterpretations: (dreamId) => request(`/dreams/${dreamId}/interpretations`),
  
  createInterpretation: (dreamId, interpretationData) => request(`/dreams/${dreamId}/interpretations`, {
    method: 'POST',
    body: JSON.stringify(interpretationData),
  }),
  
  updateInterpretation: (dreamId, interpretationId, interpretationData) => 
    request(`/dreams/${dreamId}/interpretations/${interpretationId}`, {
      method: 'PUT',
      body: JSON.stringify(interpretationData),
    }),
  
  deleteInterpretation: (dreamId, interpretationId) => 
    request(`/dreams/${dreamId}/interpretations/${interpretationId}`, {
      method: 'DELETE',
    }),
};

// User API
export const userApi = {
  updateProfile: (userData) => request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  updatePreferences: (preferences) => request('/users/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }),
  
  getDreamPatterns: () => request('/users/dream-patterns'),
};
