import { useState } from 'react';
import { Activity, Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { t } from '@/app/utils/i18n';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-between p-6 overflow-x-hidden overflow-y-auto relative [@media(max-height:700px)]:p-4">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse"></div>
      <div className="absolute top-40 left-0 -ml-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10 [@media(max-height:700px)]:justify-start [@media(max-height:700px)]:py-2">
        {/* Logo */}
        <div className="text-center mb-14 [@media(max-height:700px)]:mb-6">
          <div className="flex justify-center mb-6 [@media(max-height:700px)]:mb-3">
            <div className="bg-white p-7 rounded-3xl shadow-2xl shadow-sky-900/10 border border-slate-100/50 animate-float [@media(max-height:700px)]:p-5">
              <Activity className="w-18 h-18 text-gradient-to-br from-sky-500 to-blue-600 [@media(max-height:700px)]:w-14 [@media(max-height:700px)]:h-14" />
            </div>
          </div>
          <h1 className="text-[2.25rem] font-bold mb-2.5 text-slate-900 tracking-tight">{t('appName', language)}</h1>
          <p className="text-slate-500 text-sm">{t('appSubtitle', language)}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-9 border border-slate-100/80 transform hover:scale-[1.01] transition-transform duration-300 [@media(max-height:700px)]:p-6">
          <h2 className="text-[1.375rem] font-bold mb-9 text-slate-900 text-center [@media(max-height:700px)]:mb-5">{t('welcome', language)}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-7 [@media(max-height:700px)]:space-y-5">
            <div className="space-y-2.5">
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
                  className="h-13 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-2xl px-5 group-hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2.5">
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
                  className="h-13 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 transition-all duration-300 rounded-2xl px-5 group-hover:shadow-md"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-13 text-base rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 transition-all duration-400 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-semibold">
              {t('login', language)}
            </Button>
          </form>

          <div className="mt-9 text-center [@media(max-height:700px)]:mt-5">
            <button
              onClick={() => onNavigate('register')}
              className="text-sky-600 font-semibold hover:text-sky-700 transition-colors text-sm hover:underline underline-offset-4"
            >
              {t('noAccount', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Demo Hint */}
      <div className="text-center mt-8 relative z-10 [@media(max-height:700px)]:mt-5">
        <p className="text-xs text-slate-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
          {t('demoHint', language)}
        </p>
      </div>
    </div>
  );
}
