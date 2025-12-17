
import React from 'react';
import { Home, CheckCircle2, Book, User, Heart, LogOut, MapPin } from 'lucide-react';
import { Tab, UserProfile } from '../types';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, user, onLogout }) => {
  const navItems = [
    { tab: Tab.DASHBOARD, icon: Home, label: 'Início' },
    { tab: Tab.ROUTINE, icon: CheckCircle2, label: 'Minha Rotina' },
    { tab: Tab.COMMUNITY, icon: Heart, label: 'Comunidade' },
    { tab: Tab.KNOWLEDGE, icon: Book, label: 'Biblioteca' },
    { tab: Tab.MAPS, icon: MapPin, label: 'Igrejas' },
    { tab: Tab.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 bg-[#15191E] border-r border-white/5 p-6 z-50">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <BrandLogo size={32} variant="fill" className="text-brand-violet" />
        <div>
           <h1 className="font-bold text-xl text-white tracking-tight">Espiritualizei</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/25 font-bold' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                fill={isActive && (item.tab === Tab.COMMUNITY || item.tab === Tab.MAPS) ? "currentColor" : "none"}
              />
              <span className="text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-auto pt-6 border-t border-white/5">
         
         {/* Settings Row */}
         <div className="flex gap-2 mb-4">
            <button 
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-2 bg-red-900/10 p-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-900/20 transition-colors"
            >
               <LogOut size={16} /> Sair do app
            </button>
         </div>

         <div onClick={() => onTabChange(Tab.PROFILE)} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center overflow-hidden border-2 border-brand-dark shadow-sm">
               {user.photoUrl ? (
                  <img src={user.photoUrl} className="w-full h-full object-cover" />
               ) : (
                  <span className="text-brand-violet font-bold text-sm">{user.name.charAt(0)}</span>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white truncate">{user.name}</p>
               <p className="text-[10px] text-slate-400 truncate">Nível {user.level} • {user.currentXP} XP</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
