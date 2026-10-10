import { ArrowLeft } from 'lucide-react';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';
import { Button } from '@/app/components/ui/button';

interface LanguagePageProps {
  onNavigate: (page: string) => void;
}

export function LanguagePage({ onNavigate }: LanguagePageProps) {
  const { language, setLanguage } = useLanguage();

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'zh-MO', name: '繁体中文(澳门)', flag: '🇲🇴' },
    { code: 'zh-TW', name: '繁体中文(台湾)', flag: '🇹🇼' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'mn', name: '蒙古语', flag: '🇲🇳' },
    { code: 'ug', name: '维吾尔语', flag: '☪️' },
    { code: 'bo', name: '藏语', flag: '🏔️' },
  ];

  return (
    <div className="h-dvh w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-slate-200/80 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('profile')}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300"
          >
            <ArrowLeft className="w-5.5 h-5.5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">语言设置</h1>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-8 pb-28">
        <div className="bg-white/95 backdrop-blur-lg rounded-2.5xl shadow-lg shadow-slate-200/60 p-6 border border-slate-100/80">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">选择语言</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {languageOptions.map((lang) => (
              <Button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              variant={language === lang.code ? 'default' : 'outline'}
              className={`w-full justify-start text-left p-4 ${language === lang.code ? 'bg-gradient-to-br from-sky-500 to-blue-600' : ''}`}
            >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${language === lang.code ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <span className="text-lg">{lang.flag}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.code.toUpperCase()}</div>
                  </div>
                  {language === lang.code && (
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              提示：语言设置将应用于整个应用，包括菜单、按钮和内容。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
