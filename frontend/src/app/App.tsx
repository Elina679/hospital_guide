import { useState, useEffect } from 'react';//react框架
import { BottomNav } from '@/app/components/BottomNav';//底部导航栏
import { LoginPage } from '@/app/components/LoginPage';//登录页
import { RegisterPage } from '@/app/components/RegisterPage';//注册页
import { HomePage } from '@/app/components/HomePage';//首页
import { AIConsultPage } from '@/app/components/AIConsultPage';//AI咨询页
import { ProfilePage } from '@/app/components/ProfilePage';//个人资料页
import { RouteNavigationPageFixed } from '@/app/components/RouteNavigationPageFixed';//路线导航页
import { LanguagePage } from '@/app/components/LanguagePage';//语言设置页
import { Toaster } from '@/app/components/ui/sonner';//消息提示框组件
import { toast } from 'sonner';//弹出消息的函数
import { LanguageProvider } from '@/app/contexts/LanguageContext';//语言上下文
import { authAPI, tokenManager, setupAuthInterceptor, getUserIdFromToken } from '@/app/services/api';//API服务

type Page = 'home' | 'login' | 'register' | 'consult' | 'profile' | 'route' | 'language';

interface User {
  id?: number;
  username: string;
  email?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');// 记住当前是哪个页面
  const [isLoggedIn, setIsLoggedIn] = useState(false);// 记住用户是否登录
  const [user, setUser] = useState<User | null>(null);// 记住登录用户的信息
  const [isLoading, setIsLoading] = useState(true);// 加载状态

  // 初始化应用时检查token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 设置认证拦截器
        setupAuthInterceptor();
        
        // 检查本地存储的token
        const token = tokenManager.getToken();
        console.log('检查本地token:', token ? '存在' : '不存在');
        if (token) {
          // 如果有token，尝试获取用户信息
          try {
            const userId = getUserIdFromToken(token);
            console.log('从token解析的用户ID:', userId);
            if (userId) {
              const userInfo = await authAPI.getUserInfo(userId, token);
              console.log('获取用户信息成功:', userInfo);
              setUser({
                id: userInfo.id,
                username: userInfo.username,
                email: userInfo.email,
              });
              setIsLoggedIn(true);
              setCurrentPage('home');
            }
          } catch (error) {
            console.error('Token验证失败:', error);
            tokenManager.removeToken();
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        // 如果token无效，清除它
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('开始登录，用户名:', username);
      
      // 调用后端登录API
      const response = await authAPI.login(username, password);
      console.log('登录API响应:', response);
      
      // 保存token
      tokenManager.setToken(response.access_token);
      console.log('Token已保存');
      
      // 设置用户信息
      setUser({
        username,
        email: `${username}@example.com`, // 临时邮箱，实际应该从后端获取
      });
      
      setIsLoggedIn(true);
      setCurrentPage('home');
      toast.success('登录成功！');
    } catch (error: any) {
      console.error('登录失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      // 检查是否是用户不存在的错误
      if (error.message?.includes('用户名或密码错误') || error.message?.includes('用户名不存在')) {
        toast.info('检测到新用户，请注册账户');
        setCurrentPage('register');
      } else {
        toast.error(`登录失败: ${error.message || '请检查用户名和密码'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // 调用后端注册API
      const response = await authAPI.register(username, email, password);
      
      // 注册成功后自动登录
      await handleLogin(username, password);
      
      toast.success('注册成功！');
    } catch (error: any) {
      console.error('注册失败:', error);
      toast.error(error.message || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // 清除token
    tokenManager.removeToken();
    
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('login');
    toast.info('您已安全退出');
  };

  const handleNavigate = (page: Page) => {
    if (!isLoggedIn && page !== 'login' && page !== 'register') {
      toast.error('请先登录');
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onNavigate={handleNavigate} userName={user?.username} />;
      case 'consult':
        return <AIConsultPage />;
      case 'profile':
        return (
          <ProfilePage
            userName={user?.username || '用户'}
            userEmail={user?.email || 'user@example.com'}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        );
      case 'route':
        return <RouteNavigationPageFixed onClose={() => handleNavigate('home')} />;
      case 'language':
        return <LanguagePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} userName={user?.username} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="h-dvh w-screen overflow-hidden bg-gray-50">
        {/* Main Content */}
        <div className="h-full w-full">
          {renderPage()}
        </div>

        {/* Bottom Navigation - Only show when logged in and not on auth pages */}
        {isLoggedIn && currentPage !== 'login' && currentPage !== 'register' && (
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        )}

        {/* Toast Notifications */}
        <Toaster position="top-center" />
      </div>
    </LanguageProvider>
  );
}
