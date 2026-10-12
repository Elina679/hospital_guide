import { useState, useEffect } from 'react';
import { Mail, Calendar, Heart, MessageCircle, Settings, Award, ChevronRight, Bell, Shield, HelpCircle, LogOut, Globe, ArrowLeft, Clock, MapPin, Search, Star, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { t } from '@/app/utils/i18n';
import { navigationAPI, Location } from '@/app/services/navigationApi';
import {
  NavigationHistoryItem,
  FavoriteDept,
  loadNavigationHistory,
  loadFavoriteDepts,
  addFavoriteDept,
  removeFavoriteDept,
} from '@/app/services/navigationStorage';

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

interface MenuItem {
  key: string;
  icon: typeof Heart;
  label: string;
  color: string;
  bgColor: string;
}

export function ProfilePage({ userName, userEmail, onLogout, onNavigate }: ProfilePageProps) {
  const { language } = useLanguage();
  const [view, setView] = useState<'main' | 'records' | 'favorites'>('main');
  const [records, setRecords] = useState<NavigationHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDept[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setRecords(loadNavigationHistory());
    setFavorites(loadFavoriteDepts());
    let cancelled = false;
    navigationAPI
      .getLocations()
      .then((data) => {
        if (!cancelled) {
          setLocations(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(t('noFavorites', language));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const stats = [
    { label: t('consultationCount', language), value: '12', icon: MessageCircle, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { label: t('healthScore', language), value: '85', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { label: t('usageDays', language), value: '30', icon: Calendar, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: t('healthBadges', language), value: '5', icon: Award, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  const menuSections: { items: MenuItem[] }[] = [
    {
      items: [
        { key: 'healthProfile', icon: Heart, label: t('healthProfile', language), color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { key: 'records', icon: MessageCircle, label: t('appointmentRecords', language), color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { key: 'consultationHistory', icon: Calendar, label: t('consultationHistory', language), color: 'text-sky-600', bgColor: 'bg-sky-50' },
      ],
    },
    {
      items: [
        { key: 'favorites', icon: Star, label: t('favoriteDepts', language), color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { key: 'notifications', icon: Bell, label: t('notifications', language), color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { key: 'privacySettings', icon: Shield, label: t('privacySettings', language), color: 'text-violet-600', bgColor: 'bg-violet-50' },
        { key: 'languageSettings', icon: Globe, label: t('languageSettings', language), color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { key: 'accountSettings', icon: Settings, label: t('accountSettings', language), color: 'text-slate-600', bgColor: 'bg-slate-50' },
      ],
    },
    {
      items: [
        { key: 'helpCenter', icon: HelpCircle, label: t('helpCenter', language), color: 'text-sky-600', bgColor: 'bg-sky-50' },
        { key: 'aboutUs', icon: Award, label: t('aboutUs', language), color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      ],
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.key === 'records') {
      setRecords(loadNavigationHistory());
      setView('records');
    } else if (item.key === 'favorites') {
      setFavorites(loadFavoriteDepts());
      setView('favorites');
    } else if (item.key === 'languageSettings' && onNavigate) {
      onNavigate('language');
    }
  };

  const handleAddFavorite = (location: Location) => {
    addFavoriteDept({ id: location.id, name: location.name, floor: location.floor });
    setFavorites(loadFavoriteDepts());
  };

  const handleRemoveFavorite = (id: number) => {
    removeFavoriteDept(id);
    setFavorites(loadFavoriteDepts());
  };

  const trimmedQuery = searchQuery.trim();
  const searchResults = trimmedQuery
    ? locations.filter((loc) => loc.name.includes(trimmedQuery)).slice(0, 20)
    : [];

  const renderRecords = () => (
    <div className="h-dvh w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="relative bg-white pt-12 pb-6 px-4 rounded-b-[2.5rem] shadow-md overflow-hidden">
        <button
          onClick={() => setView('main')}
          className="absolute left-4 top-11 p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all duration-300 shadow-sm"
          aria-label={t('back', language)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-center text-xl font-bold text-slate-900">{t('navRecords', language)}</h2>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide px-6 mt-6 space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">{t('noNavRecords', language)}</p>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-md shadow-slate-200/60 border border-slate-100/80"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{record.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <MapPin className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-800 font-semibold truncate">{record.start}</span>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-300 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <MapPin className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
                  <span className="text-slate-800 font-semibold truncate">{record.end}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFavorites = () => {
    const favoriteIds = new Set(favorites.map((fav) => fav.id));

    return (
      <div className="h-dvh w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="relative bg-white pt-12 pb-6 px-4 rounded-b-[2.5rem] shadow-md overflow-hidden">
          <button
            onClick={() => setView('main')}
            className="absolute left-4 top-11 p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all duration-300 shadow-sm"
            aria-label={t('back', language)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-center text-xl font-bold text-slate-900">{t('favoriteDepts', language)}</h2>
        </header>

        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide px-6 mt-6 space-y-6">
          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchDept', language)}
              className="w-full h-12 pl-12 pr-11 text-base bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all duration-300 rounded-2xl shadow-sm placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="clear"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* 搜索结果 */}
          {searchResults.length > 0 && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-md shadow-slate-200/60 border border-slate-100/80 overflow-hidden">
              {searchResults.map((loc, index) => (
                <button
                  key={loc.id}
                  onClick={() => handleAddFavorite(loc)}
                  disabled={favoriteIds.has(loc.id)}
                  className={`w-full flex items-center justify-between p-4 border-b border-slate-50 last:border-0 ${
                    favoriteIds.has(loc.id) ? 'opacity-55' : 'hover:bg-slate-50/50 active:bg-slate-100'
                  } transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 font-semibold truncate">{loc.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{loc.floor}F · {loc.type}</p>
                    </div>
                  </div>
                  {favoriteIds.has(loc.id) ? (
                    <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      +{t('addFavorite', language)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 已收藏科室 */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 px-1">{t('favoriteDepts', language)}</h3>
            {favorites.length === 0 ? (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-slate-100/60">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-300" />
                </div>
                <p className="text-slate-400 font-medium">
                  {loadError || t('noFavorites', language)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-md shadow-slate-200/60 border border-slate-100/80 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 font-semibold truncate">{fav.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{fav.floor}F</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors duration-300 flex-shrink-0"
                      aria-label={t('cancelFavorite', language)}
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (view === 'records') {
    return renderRecords();
  }

  if (view === 'favorites') {
    return renderFavorites();
  }

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
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
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
