
import React from 'react';
import { Home, CheckCircle2, Book, User, Heart } from 'lucide-react';
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
    { tab: Tab.COMMUNITY, icon: Heart, label: 'Comunidade' }, // Updated to Heart
    { tab: Tab.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-brand-dark dark:via-brand-dark/80 pointer-events-none" />

      <nav 
        role="navigation"
        aria-label="Navegação principal"
        className="w-full bg-white/90 dark:bg-brand-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe pt-2 px-2 pointer-events-auto shadow-2xl"
      >
        <div className="flex justify-around items-end max-w-lg mx-auto w-full">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex flex-col items-center justify-center gap-1 py-2 px-1 w-full rounded-xl transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? 'text-brand-violet' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                   <item.icon
                     size={24}
                     strokeWidth={isActive ? 2.5 : 2}
                     fill={isActive && item.tab === Tab.COMMUNITY ? "currentColor" : "none"} 
                     className="transition-transform duration-300"
                   />
                   {isActive && (
                     <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-violet rounded-full" />
                   )}
                </div>
                
                <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
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
