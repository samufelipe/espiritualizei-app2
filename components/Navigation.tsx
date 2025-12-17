
import React from 'react';
import { Home, CheckCircle2, Book, MapPin, Heart, User } from 'lucide-react';
import { Tab } from '../types';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { tab: Tab.DASHBOARD, icon: Home, label: 'Início' },
    { tab: Tab.ROUTINE, icon: CheckCircle2, label: 'Rotina' },
    { tab: Tab.KNOWLEDGE, icon: Book, label: 'Aprender' },
    { tab: Tab.COMMUNITY, icon: Heart, label: 'Comunidade' },
    { tab: Tab.MAPS, icon: MapPin, label: 'Igrejas' },
    { tab: Tab.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none md:hidden">
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90 pointer-events-none" />

      <nav 
        role="navigation"
        aria-label="Navegação principal"
        className="w-full bg-white/90 dark:bg-[#15191E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe pt-1 px-1 pointer-events-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
      >
        <div className="grid grid-cols-6 items-end w-full max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex flex-col items-center justify-center gap-1 py-3 px-0 w-full transition-all duration-300 active:scale-90 ${
                  isActive 
                    ? 'text-brand-violet' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                   <item.icon
                     size={20} 
                     strokeWidth={isActive ? 2.5 : 2}
                     fill={isActive && (item.tab === Tab.COMMUNITY || item.tab === Tab.MAPS || item.tab === Tab.PROFILE) ? "currentColor" : "none"} 
                     className="transition-transform duration-300"
                   />
                   {isActive && (
                     <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-violet rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                   )}
                </div>
                
                <span className={`text-[9px] font-bold tracking-tight transition-all duration-300 truncate max-w-full ${
                  isActive ? 'opacity-100 font-extrabold' : 'opacity-100 font-medium'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
