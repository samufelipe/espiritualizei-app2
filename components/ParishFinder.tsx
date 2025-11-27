
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Star, ExternalLink, Map as MapIcon, ChevronRight, Compass, Clock, Info, MessageCircle, Car, Accessibility } from 'lucide-react';
import { Parish } from '../types';
// import { findNearbyParishes } from '../services/geminiService'; // DEPRECATED
import { searchCatholicChurches } from '../services/googlePlacesService'; // NEW

const ParishFinder: React.FC = () => {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

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
          // NEW SERVICE CALL
          const results = await searchCatholicChurches(position.coords.latitude, position.coords.longitude);
          
          // Calculate distance locally for precision
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

  // Skeleton Loading
  const LoadingSkeleton = () => (
    <div className="space-y-4 w-full mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden shadow-sm animate-pulse border border-slate-100 dark:border-white/5">
          <div className="h-24 bg-slate-200 dark:bg-white/10" />
          <div className="p-5 space-y-3">
             <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
             <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
             <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans transition-colors">
      
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-4 z-10 bg-slate-50/95 dark:bg-brand-dark/95 backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-brand-violet/10 text-brand-violet rounded-full flex items-center justify-center shadow-xl shadow-brand-violet/20 ring-4 ring-white dark:ring-white/5 backdrop-blur-md relative overflow-hidden">
             <div className="absolute inset-0 bg-brand-violet/20 rounded-full animate-pulse-slow" />
             <Compass size={28} className={loading ? "animate-spin-slow" : ""} strokeWidth={1.5} />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight mb-1">
              {searched ? "Igrejas Encontradas" : "Localizar Paróquia"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed font-medium">
              {searched 
                ? `Exibindo ${parishes.length} locais próximos a você.`
                : "Localize Paróquias e Santuários com precisão oficial."
              }
            </p>
          </div>
        </div>

        {/* Action Area */}
        {!searched && !loading && (
          <div className="flex flex-col items-center animate-slide-up mt-6">
            <button
              onClick={handleLocate}
              className="bg-brand-violet text-white w-full max-w-xs py-4 rounded-2xl font-bold text-base shadow-2xl shadow-brand-violet/30 hover:bg-purple-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <MapPin size={20} className="group-hover:animate-bounce" />
              Buscar Paróquias Próximas
            </button>
            <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 uppercase tracking-widest">
              <Navigation size={10} /> Integrado com Google Places
            </p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-0 pb-32 no-scrollbar">
        
        {loading && (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in mt-4">
            <p className="text-brand-violet font-bold text-xs animate-pulse mb-4 uppercase tracking-widest">
              Conectando ao satélite...
            </p>
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="mt-4 p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-3xl text-center border border-red-100 dark:border-red-900/30 shadow-sm animate-fade-in">
            <p className="font-bold mb-2 text-lg">Atenção</p>
            <p className="text-sm opacity-80 mb-6">{error}</p>
            <button onClick={handleLocate} className="px-6 py-3 bg-white dark:bg-red-900/40 rounded-xl shadow-sm text-red-600 dark:text-red-200 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/60 transition-colors">
              Tentar novamente
            </button>
          </div>
        )}

        {searched && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center px-2 mb-2">
               <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  Resultados Oficiais
               </span>
               <button onClick={handleLocate} className="text-brand-violet font-bold text-xs hover:bg-brand-violet/10 px-3 py-1.5 rounded-lg transition-colors">
                  Atualizar
               </button>
            </div>
            
            {parishes.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 px-6">
                <p className="text-slate-500 mb-4 font-medium">Nenhuma igreja encontrada neste raio de busca.</p>
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
                    className="bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden shadow-card dark:shadow-none border border-slate-100 dark:border-white/5 hover:shadow-float transition-all animate-slide-up-content group relative"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Header Image Area */}
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                       {parish.photoUrl ? (
                          <img src={parish.photoUrl} className="w-full h-full object-cover" alt={parish.name} />
                       ) : (
                          <>
                            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')] mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
                          </>
                       )}
                       
                       {/* Floating Badges */}
                       <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                          <div className="flex gap-2">
                             {parish.rating && parish.rating > 0 && (
                                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 text-[10px] font-bold text-brand-dark dark:text-white border border-slate-100 dark:border-white/10">
                                    <Star size={10} className="text-amber-400 fill-amber-400" /> {parish.rating.toFixed(1)} <span className="opacity-60 text-[9px]">({parish.userRatingsTotal})</span>
                                </div>
                             )}
                             {parish.openNow !== undefined && (
                                <div className={`px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 text-[10px] font-bold border backdrop-blur-md ${parish.openNow ? 'bg-green-100/90 text-green-700 border-green-200' : 'bg-red-100/90 text-red-600 border-red-200'}`}>
                                    <Clock size={10} /> {parish.openNow ? 'Aberto Agora' : 'Fechado'}
                                </div>
                             )}
                          </div>
                          
                          {parish.distance && (
                             <div className="bg-brand-violet text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
                                <Navigation size={10} /> {parish.distance} km
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 pb-5 pt-4 bg-white dark:bg-[#1A2530] relative z-10">
                       <h3 className="font-bold text-brand-dark dark:text-white text-lg leading-tight mb-2">
                         {parish.name}
                       </h3>
                       
                       <div className="bg-brand-violet/5 dark:bg-brand-violet/10 border border-brand-violet/10 rounded-xl p-2.5 flex items-start gap-2.5 mb-4">
                          <div className="w-5 h-5 bg-brand-violet/10 rounded-full flex items-center justify-center text-brand-violet shrink-0 mt-0.5">
                             <MapPin size={12} fill="currentColor" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight">
                             Esta casa de Deus está aguardando sua visita. ♥
                          </p>
                       </div>

                       <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 line-clamp-1">{parish.address}</p>

                       {/* Action Grid */}
                       <div className="flex flex-col gap-2.5">
                          <div className="grid grid-cols-2 gap-2.5">
                             <a 
                               href={getInviteLink(parish)}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
                             >
                               <MessageCircle size={14} /> Convidar
                             </a>
                             <a 
                               href={parish.url} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
                             >
                               <ExternalLink size={14} /> Ver no Google
                             </a>
                          </div>
                          
                          <a 
                            href={parish.directionsUrl || parish.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-brand-violet text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-violet/20 hover:bg-purple-500 transition-colors active:scale-95"
                          >
                            <Navigation size={16} /> Traçar Rota Agora
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
  );
};

export default ParishFinder;
