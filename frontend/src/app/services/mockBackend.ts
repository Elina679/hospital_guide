// 模拟后端服务 - 用于开发和测试
interface MockUser {
  id: number;
  username: string;
  email: string;
  password: string; // 实际项目中不应该存储明文密码
}

class MockBackend {
  private users: MockUser[] = [];
  private nextId = 1;

  // 模拟用户注册
  async register(username: string, email: string, password: string) {
    // 检查用户名是否已存在
    const existingUser = this.users.find(user => user.username === username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 创建新用户
    const newUser: MockUser = {
      id: this.nextId++,
      username,
      email: email || `${username}@example.com`,
      password, // 实际项目中应该存储哈希后的密码
    };

    this.users.push(newUser);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      message: '用户注册成功',
      username: newUser.username,
      id: newUser.id
    };
  }

  // 模拟用户登录 - 宽松模式，任何用户都可以登录
  async login(username: string, password: string) {
    // 查找用户
    let user = this.users.find(user => user.username === username);
    
    // 如果用户不存在，自动创建
    if (!user) {
      console.log('自动创建用户:', username);
      user = {
        id: this.nextId++,
        username,
        email: `${username}@example.com`,
        password,
      };
      this.users.push(user);
    }

    // 生成模拟的JWT token
    const mockToken = this.generateMockToken(user.id);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      access_token: mockToken,
      token_type: 'bearer'
    };
  }

  // 生成模拟的JWT token
  private generateMockToken(userId: number): string {
    // 模拟JWT格式：header.payload.signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: userId.toString(),
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30分钟后过期
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa('mock-signature'); // 实际项目中应该使用真实的签名
    
    return `${header}.${payload}.${signature}`;
  }

  // 获取用户信息
  async getUserInfo(userId: number) {
    const user = this.users.find(user => user.id === userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  }

  // 检查token是否有效
  validateToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // 从token中获取用户ID
  getUserIdFromToken(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return parseInt(payload.sub);
    } catch {
      return null;
    }
  }

  // 重置数据（用于测试）
  reset() {
    this.users = [];
    this.nextId = 1;
  }

  // 获取所有用户（调试用）
  getAllUsers() {
    return this.users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email
    }));
  }
}

// 创建单例实例
export const mockBackend = new MockBackend();

// 添加一些测试用户 - 同步添加
const testUsers = [
  { username: 'test', email: 'test@example.com', password: '123456' },
  { username: 'demo', email: 'demo@example.com', password: 'demo123' },
  { username: 'admin', email: 'admin@example.com', password: 'admin123' },
];

testUsers.forEach(user => {
  mockBackend['users'].push({
    id: mockBackend['nextId']++,
    username: user.username,
    email: user.email,
    password: user.password,
  });
});

console.log('Mock 后端已初始化，测试用户已添加');