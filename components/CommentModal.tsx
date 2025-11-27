
import React, { useState } from 'react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { Comment } from '../types';

interface CommentModalProps {
  comments: Comment[];
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ comments, onClose, onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl animate-slide-up border-t border-white/10 sm:border h-[85vh] flex flex-col z-[201]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-brand-dark rounded-t-[2.5rem] z-20">
          <div>
             <h2 className="text-lg font-bold text-brand-dark dark:text-white leading-tight">Comentários</h2>
             <p className="text-xs text-slate-400">Apoie seus irmãos na fé</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32"> {/* Added extra padding-bottom to scrollable area */}
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-60">
               <MessageCircle size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
               <p className="font-medium">Nenhum comentário ainda.</p>
               <p className="text-xs">Seja o primeiro a deixar uma palavra de ânimo.</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3 animate-fade-in group">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-white/5 mt-1">
                    {comment.userName.charAt(0)}
                 </div>
                 <div className="flex-1">
                    <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5 group-hover:border-slate-200 dark:group-hover:border-white/10 transition-colors">
                       <p className="text-xs font-bold text-brand-dark dark:text-white mb-1">{comment.userName}</p>
                       <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-2">Há instantes</p>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area - Fixed Bottom with MASSIVE padding for mobile Nav overlap protection */}
        <div className="p-4 pb-32 sm:pb-6 bg-white dark:bg-brand-dark border-t border-slate-100 dark:border-white/5 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-[202]">
           <form onSubmit={handleSubmit} className="relative">
              <input 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva uma mensagem de apoio..."
                className="w-full bg-slate-100 dark:bg-black/30 border border-transparent focus:border-brand-violet dark:focus:border-brand-violet rounded-3xl py-4 pl-5 pr-14 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="absolute right-2 top-2 w-10 h-10 bg-brand-violet text-white rounded-full flex items-center justify-center hover:bg-purple-600 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md active:scale-90"
              >
                <Send size={18} className="ml-0.5" />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
