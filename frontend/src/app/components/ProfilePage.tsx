import { useState, Fragment } from 'react';
import { Mail, Calendar, Heart, MessageCircle, Settings, Award, ChevronRight, Bell, Shield, HelpCircle, LogOut, Globe } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { t } from '@/app/utils/i18n';

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export function ProfilePage({ userName, userEmail, onLogout, onNavigate }: ProfilePageProps) {
  const { language } = useLanguage();
  
  const stats = [
    { label: t('consultationCount', language), value: '12', icon: MessageCircle, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { label: t('healthScore', language), value: '85', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { label: t('usageDays', language), value: '30', icon: Calendar, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: t('healthBadges', language), value: '5', icon: Award, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  const menuSections = [
    {
      items: [
        { icon: Heart, label: t('healthProfile', language), color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { icon: Calendar, label: t('appointmentRecords', language), color: 'text-sky-600', bgColor: 'bg-sky-50' },
        { icon: MessageCircle, label: t('consultationHistory', language), color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
      ],
    },
    {
      items: [
        { icon: Bell, label: t('notifications', language), color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { icon: Shield, label: t('privacySettings', language), color: 'text-violet-600', bgColor: 'bg-violet-50' },
        { icon: Globe, label: t('languageSettings', language), color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { icon: Settings, label: t('accountSettings', language), color: 'text-slate-600', bgColor: 'bg-slate-50' },
      ],
    },
    {
      items: [
        { icon: HelpCircle, label: t('helpCenter', language), color: 'text-sky-600', bgColor: 'bg-sky-50' },
        { icon: Award, label: t('aboutUs', language), color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      ],
    },
  ];

  return (
    <div className="h-dvh w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Profile Header */}
        <div className="relative bg-white pt-14 pb-10 px-4 rounded-b-[3rem] shadow-md overflow-hidden min-[400px]:px-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
          <div className="absolute top-20 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

          <div className="relative flex items-center gap-3 mb-9 min-[400px]:gap-5">
            <Avatar className="w-20 h-20 border-4 border-white shadow-2xl shadow-slate-200/60 animate-float min-[400px]:w-24 min-[400px]:h-24">
              <AvatarFallback className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-[2.25rem] font-bold text-slate-900 truncate mb-1.5">{userName}</h1>
              <p className="text-sm text-slate-500 truncate font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {userEmail}
              </p>
            </div>
            
            <button className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full text-slate-600 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-md hover:shadow-lg group">
               <Settings className="w-5.5 h-5.5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 min-[400px]:gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-slate-50/90 backdrop-blur-sm rounded-2xl p-2 text-center border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group min-[400px]:p-4"
              >
                <div className={`w-9 h-9 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="px-6 mt-7 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white/95 backdrop-blur-lg rounded-2.5xl shadow-lg shadow-slate-200/60 overflow-hidden border border-slate-100/80">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => {
                    if (item.label === t('languageSettings', language) && onNavigate) {
                      onNavigate('language');
                    }
                  }}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 active:bg-slate-100 transition-all duration-300 border-b border-slate-50/80 last:border-0 group"
                >
                  <div className="flex items-center gap-4.5 flex-1 min-w-0">
                    <div className={`w-11 h-11 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-5.5 h-5.5 ${item.color}`} />
                    </div>
                    <span className="text-slate-700 font-semibold truncate">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5.5 h-5.5 text-slate-300 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              ))}
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2.5xl text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] border border-red-100"
          >
            <LogOut className="w-5.5 h-5.5 flex-shrink-0" />
            <span className="font-semibold">{t('logout', language)}</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="text-center mt-9 mb-8 flex-shrink-0">
          <p className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            {t('appName', language)} v1.0.0
          </p>
        </div>
      </div>
    </div>
  ); 
}
