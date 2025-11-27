
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Wind, ChevronDown } from 'lucide-react';

// Curated Spiritual Tracks with STABLE direct MP3 links
const TRACKS = [
  {
    id: 'gregorian',
    label: 'Canto Gregoriano',
    description: 'Salve Regina (Solenes)',
    icon: Music,
    // Direct MP3 from Wikimedia Commons (Public Domain)
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Salve_Regina.ogg' 
  },
  {
    id: 'rain',
    label: 'Chuva Suave',
    description: 'Sons da natureza',
    icon: CloudRain,
    // Stable Nature Sound
    src: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg'
  },
  {
    id: 'piano',
    label: 'Piano Contemplativo',
    description: 'Meditação instrumental',
    icon: Wind,
    // Classical Piano (Gymnopedie No 1)
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Gymnopedie_No_1.ogg'
  }
];

const AmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setError(false))
            .catch(err => {
              console.error("Playback failed:", err);
              setIsPlaying(false);
              setError(true);
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Handle Volume Change separately to avoid re-triggering play
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setError(false);
  };

  return (
    <div className={`fixed bottom-24 right-6 z-[60] transition-all duration-500 ease-out`}>
      
      {/* Main Controller */}
      <div className={`bg-white/95 dark:bg-brand-dark/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 ${isExpanded ? 'w-72' : 'w-14 h-14 rounded-full'}`}>
        
        {/* Collapsed State (Floating Button) */}
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className={`w-full h-full flex items-center justify-center text-brand-violet transition-transform hover:scale-110 bg-white dark:bg-white/10 shadow-lg ${isPlaying ? 'animate-pulse-slow ring-2 ring-brand-violet/30' : ''}`}
            aria-label="Abrir Capela Sonora"
          >
            {isPlaying ? <Volume2 size={24} /> : <Music size={24} />}
          </button>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="p-5 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span> Capela Sonora
              </div>
              <button onClick={() => setIsExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/10 text-slate-400 hover:text-brand-dark dark:hover:text-white transition-colors">
                 <ChevronDown size={16} />
              </button>
            </div>

            {/* Now Playing Hero */}
            <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0">
                     <currentTrack.icon size={24} />
                  </div>
                  <div className="min-w-0">
                     <p className="text-sm font-bold text-brand-dark dark:text-white truncate">{currentTrack.label}</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                       {error ? <span className="text-red-400">Erro ao carregar</span> : (isPlaying ? 'Tocando agora' : 'Pausado')}
                     </p>
                  </div>
               </div>
               <button 
                 onClick={togglePlay}
                 className="w-12 h-12 rounded-full bg-brand-violet text-white flex items-center justify-center shadow-lg shadow-brand-violet/30 hover:scale-105 transition-transform active:scale-95 shrink-0"
               >
                 {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
               </button>
            </div>

            {/* Volume Slider */}
            <div className="mb-6 flex items-center gap-3 px-1">
               <Volume2 size={16} className="text-slate-400" />
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.05" 
                 value={volume}
                 onChange={(e) => setVolume(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-violet"
               />
            </div>

            {/* Track List */}
            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Atmosferas</p>
               {TRACKS.map((track, idx) => (
                 <button
                   key={track.id}
                   onClick={() => changeTrack(idx)}
                   className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                     currentTrackIndex === idx 
                       ? 'bg-brand-violet/10 text-brand-violet border border-brand-violet/20' 
                       : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent'
                   }`}
                 >
                    <div className={`transition-colors ${currentTrackIndex === idx ? 'text-brand-violet' : 'text-slate-300 group-hover:text-slate-400'}`}>
                        <track.icon size={18} />
                    </div>
                    <div className="flex-1">
                        <span className="text-xs font-bold block">{track.label}</span>
                        <span className="text-[10px] opacity-70 hidden sm:block">{track.description}</span>
                    </div>
                    {currentTrackIndex === idx && isPlaying && (
                       <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.5 bg-brand-violet h-full animate-[bounce_1s_infinite]" />
                          <div className="w-0.5 bg-brand-violet h-2/3 animate-[bounce_1.2s_infinite]" />
                          <div className="w-0.5 bg-brand-violet h-full animate-[bounce_0.8s_infinite]" />
                       </div>
                    )}
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        loop 
        preload="auto"
        onError={(e) => {
          console.error("Audio load error", e);
          setError(true);
          setIsPlaying(false);
        }}
      />
    </div>
  );
};

export default AmbientPlayer;
