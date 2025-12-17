
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Star, ExternalLink, Map as MapIcon, ChevronRight, Compass, Clock, Info, MessageCircle, Car, Accessibility, Search, Church, Heart, ArrowRight } from 'lucide-react';
import { Parish } from '../types';
// import { findNearbyParishes } from '../services/geminiService'; // DEPRECATED
import { searchCatholicChurches } from '../services/googlePlacesService'; // NEW
import BrandLogo from './BrandLogo';

const ParishFinder: React.FC = () => {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const calculateDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number) => {
    if (!lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1); 
  };

  const getInviteLink = (parish: Parish) => {
    const text = encodeURIComponent(`Olá! Vamos à missa na ${parish.name}? Encontrei no app Espiritualizei. 🙏`);
    return `https://wa.me/?text=${text}`;
  };

  const handleLocate = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não suportada neste dispositivo.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setUserLoc({ lat: position.coords.latitude, lng: position.coords.longitude });
        try {
          const results = await searchCatholicChurches(position.coords.latitude, position.coords.longitude);
          
          const sorted = results.map(p => {
             const distStr = calculateDistance(position.coords.latitude, position.coords.longitude, p.location?.lat, p.location?.lng);
             return { ...p, distance: distStr || undefined }; 
          }).sort((a, b) => {
             if (!a.distance) return 1;
             if (!b.distance) return -1;
             return parseFloat(a.distance) - parseFloat(b.distance);
          });

          setParishes(sorted);
          setSearched(true);
        } catch (e) {
          setError("Não foi possível buscar as paróquias. Verifique se sua chave API está configurada.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let errorMessage = "Erro ao obter localização.";
        if (err.code === 1) errorMessage = "Permissão de localização negada.";
        if (err.code === 2) errorMessage = "Sinal de GPS indisponível.";
        setError(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleTextSearch = (e: React.FormEvent) => {
     e.preventDefault();
     if(!searchQuery.trim()) return;
     // Fallback simulation text
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        setError("Para buscar por endereço escrito, utilize o botão de GPS para maior precisão neste momento.");
     }, 1000);
  };

  // Skeleton Loading
  const LoadingSkeleton = () => (
    <div className="space-y-6 w-full mt-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden shadow-sm animate-pulse border border-slate-100 dark:border-white/5">
          <div className="h-40 bg-slate-200 dark:bg-white/10" />
          <div className="p-6 space-y-4">
             <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
             <div className="flex gap-2">
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/4" />
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/4" />
             </div>
             <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-black/20 font-sans transition-colors min-h-screen">
      
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-4 z-10 bg-white/90 dark:bg-brand-dark/95 backdrop-blur-xl sticky top-0 shadow-sm border-b border-slate-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto w-full">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-violet/10 rounded-full flex items-center justify-center text-brand-violet">
                    <Compass size={18} />
                 </div>
                 <h1 className="text-lg font-bold text-brand-dark dark:text-white">Encontrar Igreja</h1>
              </div>
              {!searched && (
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">Modo Explorar</span>
              )}
           </div>

           {/* Hybrid Search Bar */}
           <form onSubmit={handleTextSearch} className="relative group shadow-lg rounded-2xl transition-all hover:shadow-xl">
              <div className="absolute left-4 top-3.5 text-brand-violet animate-pulse-slow">
                 <MapPin size={20} />
              </div>
              <input 
                 type="text" 
                 placeholder="Onde você está agora?" 
                 className="w-full bg-white dark:bg-[#1A1F26] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium text-sm sm:text-base"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                 type="button" 
                 onClick={handleLocate}
                 className="absolute right-2 top-2 p-2 rounded-xl bg-brand-violet text-white hover:bg-purple-600 transition-colors shadow-md active:scale-95"
                 title="Usar GPS"
              >
                 <Navigation size={18} />
              </button>
           </form>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 pb-32 no-scrollbar">
        <div className="max-w-2xl mx-auto">
        
        {loading && (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in mt-8 text-center">
            <div className="w-16 h-16 bg-brand-violet/10 rounded-full flex items-center justify-center mb-4">
               <Compass size={32} className="text-brand-violet animate-spin" />
            </div>
            <p className="text-brand-dark dark:text-white font-bold text-lg mb-1">Buscando refúgios...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">Localizando as casas de Deus mais próximas ao seu coração.</p>
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300 rounded-[2rem] text-center border border-red-100 dark:border-red-900/30 shadow-sm animate-fade-in flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
               <Info size={24} />
            </div>
            <p className="font-bold mb-2 text-lg">Precisamos de sua localização</p>
            <p className="text-sm opacity-80 mb-6 max-w-xs">{error}</p>
            <button onClick={handleLocate} className="px-6 py-3 bg-white dark:bg-red-900/40 rounded-xl shadow-sm text-red-600 dark:text-red-200 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/60 transition-colors flex items-center gap-2">
              <Navigation size={16} /> Tentar novamente com GPS
            </button>
          </div>
        )}

        {/* WELCOME STATE (Didático & Acolhedor) */}
        {!searched && !loading && !error && (
           <div className="animate-slide-up space-y-8">
              
              {/* Educational Banner */}
              <div className="bg-gradient-to-br from-brand-violet to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-violet/20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                 <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/20">
                       <Heart size={10} fill="currentColor" /> Essência do App
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">A Igreja não é um prédio,<br/> é um Encontro.</h2>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed mb-6 max-w-md font-medium">
                       Mas precisamos saber onde o encontro acontece. Use esta ferramenta para encontrar o sacrário mais próximo, horários de missa e a comunidade que te espera.
                    </p>
                    <button onClick={handleLocate} className="bg-white text-brand-violet px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                       <Navigation size={16} fill="currentColor" /> Localizar Igrejas Agora
                    </button>
                 </div>
              </div>

              {/* Quick Categories (Educational) */}
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">O que você busca hoje?</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleLocate} className="bg-white dark:bg-[#1A1F26] p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-brand-violet/30 transition-all text-left group shadow-sm hover:shadow-md">
                       <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Church size={20} />
                       </div>
                       <p className="font-bold text-brand-dark dark:text-white text-sm">Santa Missa</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">O Sacrifício do Altar</p>
                    </button>
                    <button onClick={handleLocate} className="bg-white dark:bg-[#1A1F26] p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-brand-violet/30 transition-all text-left group shadow-sm hover:shadow-md">
                       <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <MessageCircle size={20} />
                       </div>
                       <p className="font-bold text-brand-dark dark:text-white text-sm">Confissão</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">O Abraço do Pai</p>
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* RESULTS LIST */}
        {searched && !loading && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center px-2">
               <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> {parishes.length} Locais Encontrados
               </span>
            </div>
            
            {parishes.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 px-6">
                <p className="text-slate-500 mb-4 font-medium">Nenhuma igreja encontrada neste raio.</p>
                <a 
                  href={`https://www.google.com/maps/search/igreja+catolica/@${userLoc?.lat},${userLoc?.lng},14z`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-brand-dark px-6 py-3 rounded-xl shadow-md font-bold text-sm"
                >
                   <ExternalLink size={16} /> Abrir no Google Maps
                </a>
              </div>
            ) : (
              parishes.map((parish, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] overflow-hidden shadow-card border border-slate-100 dark:border-white/5 hover:shadow-float transition-all animate-slide-up-content group relative"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* 1. Header Image (Hero) */}
                    <div className="h-40 bg-slate-200 dark:bg-slate-800 relative overflow-hidden group-hover:h-44 transition-all duration-500">
                       {parish.photoUrl ? (
                          <img src={parish.photoUrl} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={parish.name} />
                       ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-violet/20 to-purple-900/40 relative">
                             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/church.png')]" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Church size={48} className="text-brand-violet opacity-30" />
                             </div>
                          </div>
                       )}
                       
                       {/* Floating Distance Badge */}
                       {parish.distance && (
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-white/10">
                             <Navigation size={10} /> {parish.distance} km
                          </div>
                       )}
                       
                       {/* Status Badge */}
                       {parish.openNow !== undefined && (
                          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-[10px] font-bold backdrop-blur-md border ${parish.openNow ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                              <Clock size={10} /> {parish.openNow ? 'ABERTO AGORA' : 'FECHADO'}
                          </div>
                       )}
                    </div>

                    {/* 2. Content Body */}
                    <div className="p-6 relative z-10 bg-white dark:bg-[#1A1F26]">
                       
                       {/* Title & Rating */}
                       <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-brand-dark dark:text-white text-xl leading-tight w-3/4">
                            {parish.name}
                          </h3>
                          {parish.rating && parish.rating > 0 && (
                             <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-400">
                                   <span className="text-sm font-black">{parish.rating.toFixed(1)}</span>
                                   <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-[9px] text-slate-400">{parish.userRatingsTotal} avaliações</span>
                             </div>
                          )}
                       </div>
                       
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed flex items-start gap-2">
                          <MapPin size={16} className="shrink-0 text-brand-violet mt-0.5" />
                          {parish.address}
                       </p>

                       {/* 3. MAP PREVIEW (The Innovation) */}
                       <div className="relative w-full h-32 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-white/5 group-hover:border-brand-violet/30 transition-colors">
                          {/* Simulated Map Layer */}
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')] opacity-40 dark:opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             {/* Pulsing Pin */}
                             <div className="relative">
                                <div className="absolute -inset-4 bg-brand-violet/30 rounded-full animate-ping" />
                                <div className="relative z-10 bg-brand-violet text-white p-2 rounded-full shadow-xl border-2 border-white dark:border-brand-dark">
                                   <Church size={20} fill="currentColor" />
                                </div>
                                {/* Pin Stem */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3 bg-brand-violet"></div>
                                <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 blur-[2px] rounded-[100%]"></div>
                             </div>
                          </div>
                          
                          {/* Map Overlay Text */}
                          <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                             Prévia do Local
                          </div>
                       </div>

                       {/* 4. Action Grid */}
                       <div className="flex gap-3">
                          <a 
                            href={parish.directionsUrl || parish.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-brand-violet text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-violet/20 hover:bg-purple-600 hover:scale-[1.02] transition-all active:scale-95 group/btn"
                          >
                            <Navigation size={18} /> Ir Agora <ArrowRight size={16} className="opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                          </a>
                          
                          <a 
                            href={getInviteLink(parish)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
                            title="Convidar amigo"
                          >
                            <MessageCircle size={20} />
                          </a>
                          
                          <a 
                            href={parish.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
                            title="Ver no Google"
                          >
                            <ExternalLink size={20} />
                          </a>
                       </div>
                    </div>
                  </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ParishFinder;
