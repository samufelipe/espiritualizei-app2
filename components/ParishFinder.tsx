
import React, { useState, useEffect } from 'react';
// Added RefreshCw to the imports from lucide-react
import { MapPin, Navigation, Star, ExternalLink, Map as MapIcon, ChevronRight, Compass, Clock, Info, MessageCircle, Car, Accessibility, Search, Church, Heart, ArrowRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Parish } from '../types';
import { searchCatholicChurches } from '../services/googlePlacesService';
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
        const { latitude, longitude } = position.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        try {
          const results = await searchCatholicChurches(latitude, longitude);
          
          if (results.length === 0) {
             setError("Nenhuma igreja encontrada neste raio de 15km. Tente se mover ou buscar no Maps.");
             setParishes([]);
          } else {
             const sorted = results.map(p => {
                const distStr = calculateDistance(latitude, longitude, p.location?.lat, p.location?.lng);
                return { ...p, distance: distStr || undefined }; 
             }).sort((a, b) => {
                if (!a.distance) return 1;
                if (!b.distance) return -1;
                return parseFloat(a.distance) - parseFloat(b.distance);
             });
             setParishes(sorted);
          }
          setSearched(true);
        } catch (e: any) {
          console.error("Error in ParishFinder:", e);
          setError("Ocorreu um erro na busca. Verifique se a chave API do Google Maps está ativa e correta.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let errorMessage = "Erro ao obter localização.";
        if (err.code === 1) errorMessage = "Permissão de localização negada. Ative o GPS no seu navegador.";
        if (err.code === 2) errorMessage = "Sinal de GPS indisponível.";
        setError(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleTextSearch = (e: React.FormEvent) => {
     e.preventDefault();
     if(!searchQuery.trim()) return;
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        setError("A busca por texto está em manutenção. Por favor, utilize o botão de GPS para localizar igrejas ao seu redor.");
     }, 800);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6 w-full mt-8">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] overflow-hidden shadow-sm animate-pulse border border-slate-100 dark:border-white/5">
          <div className="h-40 bg-slate-200 dark:bg-white/5" />
          <div className="p-6 space-y-4">
             <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
             <div className="flex gap-2">
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/4" />
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/4" />
             </div>
             <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-black/20 font-sans transition-colors min-h-screen">
      
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
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">Modo GPS</span>
              )}
           </div>

           <form onSubmit={handleTextSearch} className="relative group shadow-lg rounded-2xl transition-all hover:shadow-xl">
              <div className="absolute left-4 top-3.5 text-brand-violet animate-pulse-slow">
                 <MapPin size={20} />
              </div>
              <input 
                 type="text" 
                 placeholder="Digite seu endereço ou bairro..." 
                 className="w-full bg-white dark:bg-[#1A1F26] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium text-sm sm:text-base"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                 type="button" 
                 onClick={handleLocate}
                 className="absolute right-2 top-2 p-2 rounded-xl bg-brand-violet text-white hover:bg-purple-600 transition-colors shadow-md active:scale-95 flex items-center justify-center"
                 title="Usar minha localização"
              >
                 {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              </button>
           </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4 pb-32 no-scrollbar">
        <div className="max-w-2xl mx-auto">
        
        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <div className="mt-4 p-8 bg-white dark:bg-[#1A1F26] text-center border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-xl animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle size={32} />
            </div>
            <p className="font-black text-brand-dark dark:text-white mb-2 text-xl tracking-tight">Ops! Algo aconteceu</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">{error}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
               <button onClick={handleLocate} className="px-6 py-4 bg-brand-violet text-white rounded-2xl shadow-lg font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                 <RefreshCw size={16} /> Tentar GPS novamente
               </button>
               <a 
                  href={`https://www.google.com/maps/search/igreja+catolica/@${userLoc?.lat || -23.55},${userLoc?.lng || -46.63},14z`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
               >
                  <MapIcon size={16} /> Abrir Google Maps
               </a>
            </div>
          </div>
        )}

        {!searched && !loading && !error && (
           <div className="animate-slide-up space-y-8 mt-4">
              <div className="bg-gradient-to-br from-brand-violet to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-violet/20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                 <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/20">
                       <Heart size={10} fill="currentColor" /> Essência do App
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black mb-3 leading-tight tracking-tight drop-shadow-md">Onde dois ou três estiverem reunidos...</h2>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-medium">
                       Encontre a comunidade mais próxima para celebrar a Santa Missa ou buscar o Sacramento da Reconciliação.
                    </p>
                    <button onClick={handleLocate} className="bg-white text-brand-violet px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 active:scale-95">
                       <Navigation size={18} fill="currentColor" /> Localizar Agora
                    </button>
                 </div>
              </div>
           </div>
        )}

        {searched && !loading && parishes.length > 0 && (
          <div className="space-y-8 animate-fade-in mt-4">
            <div className="flex justify-between items-center px-2">
               <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={12} /> {parishes.length} Refúgios encontrados
               </span>
            </div>
            
            {parishes.map((parish, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] overflow-hidden shadow-card border border-slate-100 dark:border-white/5 hover:shadow-float transition-all animate-slide-up-content group relative"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden group-hover:h-48 transition-all duration-500">
                     {parish.photoUrl ? (
                        <img src={parish.photoUrl} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={parish.name} />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-violet/20 to-purple-900/40 relative flex items-center justify-center">
                           <Church size={48} className="text-brand-violet opacity-30" />
                        </div>
                     )}
                     
                     {parish.distance && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-white/10 uppercase tracking-widest">
                           {parish.distance} km
                        </div>
                     )}
                     
                     {parish.openNow !== undefined && (
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-[9px] font-black backdrop-blur-md border ${parish.openNow ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                            <Clock size={10} /> {parish.openNow ? 'ABERTO' : 'FECHADO'}
                        </div>
                     )}
                  </div>

                  <div className="p-7 relative z-10 bg-white dark:bg-[#1A1F26]">
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="font-black text-brand-dark dark:text-white text-xl leading-tight w-3/4 tracking-tight">
                          {parish.name}
                        </h3>
                        {parish.rating && (
                           <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 text-amber-400">
                                 <span className="text-sm font-black">{parish.rating.toFixed(1)}</span>
                                 <Star size={12} fill="currentColor" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{parish.userRatingsTotal} notas</span>
                           </div>
                        )}
                     </div>
                     
                     <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed flex items-start gap-2 italic">
                        <MapPin size={16} className="shrink-0 text-brand-violet mt-0.5 opacity-60" />
                        {parish.address}
                     </p>

                     <div className="flex gap-3">
                        <a 
                          href={parish.directionsUrl || parish.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-brand-violet text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-violet/20 hover:bg-purple-600 hover:scale-[1.02] transition-all active:scale-95 group/btn"
                        >
                          <Navigation size={18} /> Ir Agora <ArrowRight size={18} className="opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                        </a>
                        
                        <a 
                          href={getInviteLink(parish)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
                        >
                          <MessageCircle size={22} />
                        </a>
                     </div>
                  </div>
                </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ParishFinder;
