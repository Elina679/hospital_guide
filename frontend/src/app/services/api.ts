// API服务 - 处理与后端的所有通信
import { mockBackend } from './mockBackend';
import { USE_MOCK_BACKEND } from './apiConfig';
import { get, post } from './httpClient';

// 用户相关API
export const authAPI = {
  // 用户登录
  async login(username: string, password: string) {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.login(username, password);
    }
    
    return await post('/auth/login', { username, password });
  },

  // 用户注册
  async register(username: string, email: string, password: string) {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.register(username, email, password);
    }
    
    return await post('/auth/register', { username, password });
  },

  // 获取用户信息
  async getUserInfo(userId: number, token: string) {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.getUserInfo(userId);
    }
    
    return await get(`/auth/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // 获取当前用户信息
  async getCurrentUserInfo(token: string) {
    if (USE_MOCK_BACKEND) {
      const userId = mockBackend.getUserIdFromToken(token);
      if (!userId) throw new Error('无效的token');
      return await mockBackend.getUserInfo(userId);
    }
    
    const userId = getUserIdFromToken(token);
    if (!userId) throw new Error('无效的token');
    return await this.getUserInfo(userId, token);
  },

  // 更新用户信息
  async updateUserInfo(userId: number, data: any, token: string) {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    throw new Error('后端暂未提供用户信息更新接口');
  },

  // 删除用户
  async deleteUser(userId: number, token: string) {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    throw new Error('后端暂未提供用户删除接口');
  },
};

// Token管理
export const tokenManager = {
  setToken(token: string) {
    localStorage.setItem('access_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  removeToken() {
    localStorage.removeItem('access_token');
  },

  isAuthenticated(): boolean {
    if (USE_MOCK_BACKEND) {
      const token = this.getToken();
      return token ? mockBackend.validateToken(token) : false;
    }
    return !!this.getToken();
  },
};

// 从JWT token中解析用户ID
export function getUserIdFromToken(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return parseInt(payload.sub || payload.user_id || payload.id);
  } catch {
    return null;
  }
}

// 设置认证拦截器
export function setupAuthInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = tokenManager.getToken();
    
    if (token && init) {
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return originalFetch(input, init);
  };
}
