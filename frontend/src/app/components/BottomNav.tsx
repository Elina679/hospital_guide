import { Navigation, Home, User } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { t } from '@/app/utils/i18n';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const { language } = useLanguage();
  
  const navItems = [
    { id: 'home', label: '导航', icon: Navigation }, // 主要功能：导航
    { id: 'consult', label: t('aiConsult', language), icon: Home }, // 次要功能：AI咨询
    { id: 'profile', label: t('profile', language), icon: User }, // 个人中心
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3 gap-3 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-3.5 px-2 transition-all duration-400 ease-in-out min-w-0 ${
                isActive 
                  ? 'text-white bg-gradient-to-br from-sky-500 to-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
