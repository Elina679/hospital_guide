import { useState } from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { t } from '@/app/utils/i18n';

interface RegisterPageProps {
  onRegister: (username: string, email: string, password: string) => void;
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert(t('passwordMismatch', language) || '密码不匹配，请重新输入');
      return;
    }
    
    if (!username || !email || !password) {
      alert(t('fillAllFields', language) || '请填写所有必填字段');
      return;
    }
    
    if (password.length < 6) {
      alert(t('passwordTooShort', language) || '密码长度至少为6位');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onRegister(username, email, password);
    } catch (error: any) {
      console.error('注册失败:', error);
      alert(error.message || t('registrationFailed', language) || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col p-4 overflow-x-hidden overflow-y-auto relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse"></div>
      <div className="absolute top-40 left-0 -ml-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center mb-4 relative z-10">
        <button
          onClick={() => onNavigate('login')}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-medium text-slate-900 ml-3">{t('createAccount', language)}</h1>
      </div>

      {/* Logo */}
      <div className="text-center mb-4 relative z-10">
        <div className="flex justify-center mb-3">
          <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-sky-900/10 border border-slate-100/50 animate-float">
            <Activity className="w-12 h-12 text-gradient-to-br from-sky-500 to-blue-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold mb-1 text-slate-900 tracking-tight">{t('appName', language)}</h1>
        <p className="text-slate-500 text-xs">{t('startHealthJourney', language)}</p>
      </div>

      {/* Registration Form */}
      <div className="flex-1 flex flex-col justify-start max-w-md mx-auto w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-100/80 transform hover:scale-[1.01] transition-transform duration-300">
          <h2 className="text-lg font-bold mb-4 text-slate-900 text-center">{t('register', language)}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-700 font-semibold text-sm">{t('username', language)}</Label>
              <div className="relative group">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={t('usernamePlaceholder', language)}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-xl px-4 group-hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">{t('email', language) || '邮箱'}</Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder', language) || '请输入邮箱地址'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-xl px-4 group-hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">{t('password', language)}</Label>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('passwordPlaceholder', language)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-xl px-4 group-hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">{t('confirmPassword', language) || '确认密码'}</Label>
              <div className="relative group">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder', language) || '请再次输入密码'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-xl px-4 group-hover:shadow-md"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 text-sm rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 transition-all duration-400 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('registering', language) || '注册中...'}
                </div>
              ) : (
                t('register', language)
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-sky-600 font-semibold hover:text-sky-700 transition-colors text-sm hover:underline underline-offset-4"
            >
              {t('hasAccount', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Demo Hint */}
      <div className="text-center mt-4 relative z-10">
        <p className="text-xs text-slate-400 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full inline-block">
          {t('demoHint', language)}
        </p>
      </div>
    </div>
  );
}
