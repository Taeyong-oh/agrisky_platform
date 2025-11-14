// API 클라이언트 - 백엔드 API와 통신
const API_URL = import.meta.env.VITE_API_URL || 'http://3.25.181.229/api';

// 토큰 관리
const getToken = () => {
  return localStorage.getItem('auth_token');
};

const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// API 요청 헬퍼
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API 요청 실패');
  }

  return response.json();
};

// 인증 API
export const authApi = {
  signUp: async (email: string, password: string, userData: {
    user_type: string;
    full_name: string;
    phone?: string;
    address?: string;
  }) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        ...userData,
      }),
    });
    
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  signIn: async (email: string, password: string) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  signOut: () => {
    removeToken();
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// 대시보드 API
export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats'),
  getRecentRequests: () => apiRequest('/dashboard/recent-requests'),
};

// 농지 API
export const farmlandApi = {
  getAll: () => apiRequest('/farmlands'),
  create: (data: any) => apiRequest('/farmlands', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/farmlands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/farmlands/${id}`, {
    method: 'DELETE',
  }),
};

// 드론 API
export const droneApi = {
  getAll: () => apiRequest('/drones'),
  create: (data: any) => apiRequest('/drones', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/drones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/drones/${id}`, {
    method: 'DELETE',
  }),
};

// 작업 요청 API
export const workRequestApi = {
  getAll: () => apiRequest('/work-requests'),
  create: (data: any) => apiRequest('/work-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// 작업 매칭 API
export const workMatchApi = {
  getAll: () => apiRequest('/work-matches'),
  create: (data: any) => apiRequest('/work-matches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  accept: (id: string) => apiRequest(`/work-matches/${id}/accept`, {
    method: 'PATCH',
  }),
};

// 비행 경로 API
export const flightPathApi = {
  getAll: () => apiRequest('/flight-paths'),
  getWorkLogs: () => apiRequest('/flight-paths/work-logs'),
};

