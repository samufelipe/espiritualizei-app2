
import React, { useState } from 'react';
import { X, PenLine, Save, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types';
import { sendMessageToSpiritualDirector } from '../services/geminiService';
import BrandLogo from './BrandLogo';

interface JournalModalProps {
  mood: 'peace' | 'struggle';
  onClose: () => void;
  onSave: (content: string, aiReflection?: string, verse?: string) => void;
}

const JournalModal: React.FC<JournalModalProps> = ({ mood, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simple Analysis for Reflection
    let reflection = undefined;
    let verse = undefined;

    try {
        // We reuse the chat service but frame it as a reflection request
        const prompt = `
          O usuário está sentindo: ${mood === 'peace' ? 'Paz/Consolação' : 'Desolação/Luta'}.
          Relato dele: "${content}".
          
          Responda em formato JSON:
          {
             "reflection": "Uma frase curta de conselho espiritual (max 15 palavras).",
             "verse": "Uma referência bíblica (ex: Salmo 23, 1) que conforte ou ilumine."
          }
        `;
        const response = await sendMessageToSpiritualDirector(prompt);
        
        const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
           const parsed = JSON.parse(jsonStr);
           reflection = parsed.reflection;
           verse = parsed.verse;
        } catch (e) {
           reflection = "Entregue este momento a Deus. Ele te ouve.";
        }

    } catch (e) {
        console.error("Journal Error", e);
    }

    onSave(content, reflection, verse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-brand-dark rounded-[2rem] shadow-2xl p-6 animate-slide-up border border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mood === 'peace' ? 'bg-brand-violet/10 text-brand-violet' : 'bg-amber-100 text-amber-600'}`}>
               <PenLine size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-brand-dark dark:text-white">Diário da Alma</h2>
               <p className="text-xs text-slate-400">Registre os movimentos do seu coração</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
            <X size={18} />
          </button>
        </div>

        <textarea
           value={content}
           onChange={(e) => setContent(e.target.value)}
           placeholder="O que Deus está falando com você hoje? Escreva sem filtros..."
           className="flex-1 min-h-[200px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-brand-dark dark:text-white placeholder:text-slate-400 resize-none outline-none focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10 transition-all leading-relaxed font-medium text-base"
           autoFocus
        />

        <div className="mt-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs text-slate-400">
              <BrandLogo size={14} variant="fill" className="text-brand-violet" />
              <span>Receber conselho espiritual</span>
           </div>
           <button
             onClick={handleSave}
             disabled={!content.trim() || isAnalyzing}
             className="bg-brand-violet text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-all"
           >
             {isAnalyzing ? (
                <span className="animate-pulse">Refletindo...</span>
             ) : (
                <><Save size={18} /> Salvar Registro</>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default JournalModal;
