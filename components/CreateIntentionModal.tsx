
import React, { useState } from 'react';
import { X, Send, Heart, Tag } from 'lucide-react';

interface CreateIntentionModalProps {
  onClose: () => void;
  onSubmit: (content: string, category: string) => Promise<void>;
}

const CATEGORIES = [
  { id: 'health', label: 'Saúde' },
  { id: 'family', label: 'Família' },
  { id: 'vocational', label: 'Vocação' },
  { id: 'grace', label: 'Graça' },
  { id: 'other', label: 'Outros' }
];

const CreateIntentionModal: React.FC<CreateIntentionModalProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('health');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    await onSubmit(content, category);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-[2rem] shadow-2xl p-6 animate-slide-up border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-dark dark:text-white">Nova Intenção</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block">Categoria</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    category === cat.id
                      ? 'bg-brand-violet text-white border-brand-violet shadow-md'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-100 dark:border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block">Seu Pedido de Oração</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva sua intenção para que a comunidade possa interceder..."
              className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-brand-dark dark:text-white placeholder:text-slate-400 resize-none outline-none focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10 transition-all"
              maxLength={300}
            />
            <div className="text-right mt-1 text-[10px] text-slate-400">
              {content.length}/300
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Heart size={18} fill="currentColor" /> Publicar Intenção
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIntentionModal;
