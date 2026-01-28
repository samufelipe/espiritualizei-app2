
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Star, ExternalLink, Map as MapIcon, ChevronRight, Compass, Clock, Info, MessageCircle, Car, Accessibility, Search, Church, Heart, ArrowRight, Loader2, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
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
  
  // Verifica se a SDK do Google está disponível
  const isGoogleAvailable = typeof window !== 'undefined' && (window as any).google?.maps?.places;

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

  const handleExternalSearch = () => {
    const query = searchQuery.trim() ? `igreja+catolica+${encodeURIComponent(searchQuery)}` : 'igrejas+catolicas+perto+de+mim';
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const handleLocate = () => {
    if (!isGoogleAvailable) {
        handleExternalSearch();
        return;
    }

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
             setError("Nenhuma igreja encontrada nas proximidades.");
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
          setError("Serviço de busca interna indisponível.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Não foi possível acessar seu GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleTextSearch = (e: React.FormEvent) => {
     e.preventDefault();
     handleExternalSearch();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-black/20 font-sans transition-colors min-h-screen">
      
      <div className="flex-shrink-0 p-6 pb-4 z-10 bg-white/90 dark:bg-brand-dark/95 backdrop-blur-xl sticky top-0 shadow-sm border-b border-slate-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto w-full">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-violet/10 rounded-full flex items-center justify-center text-brand-violet">
                    <MapPin size={18} />
                 </div>
                 <h1 className="text-lg font-bold text-brand-dark dark:text-white">Localizar Igrejas</h1>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">
                {isGoogleAvailable ? 'Modo GPS' : 'Modo Direto'}
              </span>
           </div>

           <form onSubmit={handleTextSearch} className="relative group shadow-lg rounded-2xl transition-all hover:shadow-xl">
              <div className="absolute left-4 top-3.5 text-brand-violet animate-pulse-slow">
                 <Search size={20} />
              </div>
              <input 
                 type="text" 
                 placeholder="Bairro, cidade ou nome da igreja..." 
                 className="w-full bg-white dark:bg-[#1A1F26] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium text-sm sm:text-base"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                 type="submit"
                 className="absolute right-2 top-2 p-2 rounded-xl bg-brand-violet text-white hover:bg-purple-600 transition-colors shadow-md active:scale-95 flex items-center justify-center"
              >
                 <ArrowRight size={18} />
              </button>
           </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4 pb-32 no-scrollbar">
        <div className="max-w-2xl mx-auto">
        
        {loading && (
            <div className="space-y-6 w-full mt-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-[#1A1F26] h-48 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5" />
                ))}
            </div>
        )}

        {!searched && !loading && (
           <div className="animate-slide-up space-y-8 mt-4">
              {/* Se a chave estiver falhando, avisamos amigavelmente ou oferecemos a alternativa */}
              {!isGoogleAvailable && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 mb-4">
                      <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0"><Smartphone size={20} /></div>
                          <div>
                              <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm">Busca Externa Otimizada</h4>
                              <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-1 leading-relaxed">
                                Notamos que a visualização interna está limitada. Você pode usar a busca direta no Google Maps, que é sempre atualizada.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              <div className="bg-gradient-to-br from-brand-violet to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-violet/20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                 <div className="relative z-10">
                    <h2 className="text-2xl sm:text-4xl font-black mb-3 leading-tight tracking-tight">Vinde a Mim</h2>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-medium">
                       Encontre a casa de Deus mais próxima para a Santa Missa ou Confissão.
                    </p>
                    <button 
                        onClick={handleLocate} 
                        className="bg-white text-brand-violet px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 active:scale-95"
                    >
                       <MapIcon size={18} fill="currentColor" /> {isGoogleAvailable ? 'Buscar por GPS' : 'Abrir Google Maps'}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={handleExternalSearch} className="bg-white dark:bg-[#1A1F26] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center group transition-all hover:border-brand-violet/30">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-brand-violet"><Navigation size={20} /></div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Abrir Rotas</span>
                 </button>
                 <button onClick={handleExternalSearch} className="bg-white dark:bg-[#1A1F26] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center group transition-all hover:border-brand-violet/30">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-brand-violet"><Clock size={20} /></div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ver Horários</span>
                 </button>
              </div>
           </div>
        )}

        {searched && parishes.map((parish, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] overflow-hidden shadow-card border border-slate-100 dark:border-white/5 mb-6 group animate-slide-up">
                <div className="p-7">
                    <h3 className="font-black text-brand-dark dark:text-white text-xl leading-tight mb-2 tracking-tight">{parish.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic leading-relaxed">{parish.address}</p>
                    <div className="flex gap-3">
                        <a href={parish.directionsUrl || parish.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-brand-violet text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-violet/20 hover:bg-purple-600 transition-all">
                          <Navigation size={18} /> Como Chegar
                        </a>
                        <a href={getInviteLink(parish)} target="_blank" rel="noopener noreferrer" className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 rounded-2xl">
                          <MessageCircle size={22} />
                        </a>
                    </div>
                </div>
            </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default ParishFinder;
