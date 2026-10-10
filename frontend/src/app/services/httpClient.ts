/**
 * 统一的HTTP客户端
 * 封装所有API请求的通用逻辑
 */

import { 
  API_BASE_URL, 
  REQUEST_TIMEOUT, 
  MAX_RETRY_COUNT, 
  RETRY_DELAY,
  LOG_CONFIG 
} from './apiConfig';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
}

/**
 * 统一的HTTP请求函数
 */
export async function request(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<any> {
  const {
    timeout = REQUEST_TIMEOUT,
    retryCount = 0,
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // 添加默认请求头
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...fetchOptions.headers,
    },
  };

  // 记录请求日志
  if (LOG_CONFIG.logRequests) {
    console.log('🔵 API请求:', config.method || 'GET', url);
    if (config.body) {
      console.log('📤 请求体:', config.body);
    }
  }

  try {
    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    // 发送请求
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // 记录响应状态
    if (LOG_CONFIG.logResponses) {
      console.log('🟢 API响应状态:', response.status, response.statusText);
    }

    // 处理错误响应
    if (!response.ok) {
      const errorText = await response.text();
      if (LOG_CONFIG.logErrors) {
        console.error('🔴 API错误响应:', errorText || '(空响应)');
      }
      
      let errorDetail = `服务器错误 (${response.status})`;
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.detail || errorJson.message || errorText;
        } catch {
          errorDetail = errorText;
        }
      }
      throw new Error(errorDetail);
    }

    // 解析响应数据
    const data = await response.json();
    
    // 记录响应数据
    if (LOG_CONFIG.logResponses) {
      console.log('📥 API响应数据:', data);
    }

    return data;
  } catch (error: any) {
    // 记录错误
    if (LOG_CONFIG.logErrors) {
      console.error('🔴 API请求错误:', error);
    }

    // 如果是超时错误且可以重试，则重试
    if (error.name === 'AbortError' && retryCount < MAX_RETRY_COUNT) {
      console.log(`⏱️ 请求超时，正在重试 (${retryCount + 1}/${MAX_RETRY_COUNT})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return request(endpoint, { ...options, retryCount: retryCount + 1 });
    }

    throw error;
  }
}

/**
 * GET请求
 */
export async function get(endpoint: string, options?: RequestOptions): Promise<any> {
  return request(endpoint, { ...options, method: 'GET' });
}

/**
 * POST请求
 */
export async function post(endpoint: string, data?: any, options?: RequestOptions): Promise<any> {
  return request(endpoint, { 
    ...options, 
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT请求
 */
export async function put(endpoint: string, data?: any, options?: RequestOptions): Promise<any> {
  return request(endpoint, { 
    ...options, 
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE请求
 */
export async function del(endpoint: string, options?: RequestOptions): Promise<any> {
  return request(endpoint, { ...options, method: 'DELETE' });
}
