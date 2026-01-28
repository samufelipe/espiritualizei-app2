
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, Image, Send, Loader2, MoreVertical, X, Clock, Filter, Quote, ArrowUp, Bookmark, Sparkles } from 'lucide-react';
import { createCommunityPost, fetchCommunityPosts, togglePostLike, addComment, uploadImage } from '../services/databaseService';
import CommentModal from './CommentModal';

interface CommunityFeedProps {
  user: UserProfile;
  initialContent?: string;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ user, initialContent }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'testimony' | 'inspiration'>('all');
  
  const PAGE_SIZE = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  useEffect(() => {
     if (initialContent) setNewContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    loadInitialPosts();
    
    const interval = setInterval(() => {
       if (!loading && posts.length > 0 && Math.random() > 0.8) {
          setNewPostsAvailable(prev => prev + (Math.random() > 0.5 ? 1 : -1));
       }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialPosts = async () => {
    setLoading(true);
    const data = await fetchCommunityPosts(0, PAGE_SIZE);
    setPosts(data);
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchCommunityPosts(nextPage, PAGE_SIZE);
    if (data.length > 0) {
       setPosts(prev => [...prev, ...data]);
       setPage(nextPage);
       setHasMore(data.length === PAGE_SIZE);
    } else {
       setHasMore(false);
    }
    setLoadingMore(false);
  };

  const handleRefresh = () => {
     setNewPostsAvailable(0);
     setPage(0);
     loadInitialPosts();
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!newContent.trim() && !selectedImage) return;
    setIsPosting(true);
    let imageUrl = undefined;
    if (selectedImage) {
       try {
          imageUrl = await uploadImage(selectedImage, 'posts');
       } catch (e) {
          console.error("Erro no upload", e);
       }
    }

    const newPost = await createCommunityPost(user.id, user.name, user.photoUrl, newContent, imageUrl);
    setPosts([newPost, ...posts]);
    setNewContent('');
    clearImage();
    setIsPosting(false);
  };

  // Lógica de Like Otimizada e Persistente
  const handleLike = async (postId: string) => {
    // Atualização Otimista da UI
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const currentlyLiked = post.isLikedByUser;
        return {
          ...post,
          isLikedByUser: !currentlyLiked,
          likesCount: currentlyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1
        };
      }
      return post;
    }));

    try {
      // Persistência real no Supabase
      await togglePostLike(postId);
    } catch (e) {
      console.error("Erro ao processar like:", e);
      // Rollback opcional em caso de erro crítico (não implementado para não quebrar o fluxo UX)
    }
  };

  const handleAddComment = async (text: string) => {
    if (!activePostId) return;
    const newComment = await addComment(activePostId, user.id, user.name, text);
    setPosts(prev => prev.map(p => p.id === activePostId ? { ...p, commentsCount: p.commentsCount + 1, comments: [...(p.comments || []), newComment] } : p));
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return Math.floor(hours / 24) + "d";
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  return (
    <div className="space-y-10 pb-24 relative max-w-2xl mx-auto">
       
       {/* New Posts Indicator */}
       {newPostsAvailable > 0 && (
          <div className="sticky top-24 z-40 flex justify-center w-full pointer-events-none">
             <button 
                onClick={handleRefresh}
                className="pointer-events-auto bg-brand-violet text-white px-6 py-3 rounded-full shadow-2xl animate-bounce-in flex items-center gap-2 text-sm font-black ring-4 ring-brand-dark/20 border border-white/10 transition-transform active:scale-95"
             >
                <ArrowUp size={16} strokeWidth={3} /> {newPostsAvailable} novas interações
             </button>
          </div>
       )}

       {/* Create Post Box */}
       <div className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-7 border border-slate-100 dark:border-white/5 shadow-card transition-all focus-within:shadow-float group">
          <div className="flex gap-5 mb-5">
             <div className="w-12 h-12 rounded-2xl bg-brand-dark dark:bg-white/10 text-white flex items-center justify-center font-bold shadow-lg overflow-hidden shrink-0 border border-white/10">
                {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : user.name.charAt(0)}
             </div>
             <div className="flex-1">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Partilhe sua graça, testemunho ou inspiração..."
                  className="w-full bg-transparent pt-2 text-lg outline-none resize-none text-brand-dark dark:text-white placeholder:text-slate-400 min-h-[100px] font-medium leading-relaxed"
                />
                {previewUrl && (
                   <div className="relative mt-4 w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-black/20 ring-1 ring-white/10 group/preview">
                      <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105" />
                      <button onClick={clearImage} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-all"><X size={18} /></button>
                   </div>
                )}
             </div>
          </div>
          <div className="flex justify-between items-center pt-5 border-t border-slate-50 dark:border-white/5">
             <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-slate-500 hover:text-brand-violet transition-all px-4 py-2.5 rounded-2xl hover:bg-brand-violet/5 font-bold text-xs uppercase tracking-widest">
                   <Image size={20} strokeWidth={1.5} /> Foto
                </button>
             </div>
             <button onClick={handlePost} disabled={(!newContent.trim() && !selectedImage) || isPosting} className="bg-brand-violet text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-brand-violet/20">
                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Publicar
             </button>
          </div>
       </div>

       {/* Filters */}
       <div className="flex justify-center gap-3 mb-2 px-4">
          {[
            {id: 'all', label: 'Todos'},
            {id: 'testimony', label: 'Testemunhos'},
            {id: 'inspiration', label: 'Imagens'}
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={() => setFilter(opt.id as any)} 
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${filter === opt.id ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark' : 'bg-white dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-white/5'}`}
            >
              {opt.label}
            </button>
          ))}
       </div>

       {/* Posts List */}
       <div className="space-y-8">
          {loading ? (
             <div className="space-y-8">
                {[1,2,3].map(i => (
                   <div key={i} className="bg-white dark:bg-[#1A1F26] h-64 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5" />
                ))}
             </div>
          ) : (
             filteredPosts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-7 border border-slate-100 dark:border-white/5 shadow-card hover:shadow-float transition-all animate-slide-up group">
                   <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 rounded-2xl bg-brand-violet/10 flex items-center justify-center font-bold text-sm text-brand-violet shadow-sm overflow-hidden">
                            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-brand-dark dark:text-white text-sm">{post.userName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                               <Clock size={10} /> {getTimeAgo(post.timestamp)}
                            </p>
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={20} /></button>
                   </div>

                   <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed mb-6 font-medium whitespace-pre-line">
                      {post.content}
                   </p>

                   {post.imageUrl && (
                      <div className="rounded-3xl overflow-hidden mb-6 bg-slate-100 dark:bg-black/20 ring-1 ring-white/5 group/img">
                         <img src={post.imageUrl} className="w-full h-auto max-h-[500px] object-contain transition-transform duration-700 group-hover/img:scale-[1.02]" alt="Post" />
                      </div>
                   )}

                   <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                      {/* Botão de Like com Contador e Ícone de Coração */}
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-black transition-all px-4 py-2.5 rounded-2xl active:scale-125 ${
                          post.isLikedByUser 
                            ? 'text-rose-500 bg-rose-500/10 shadow-inner ring-1 ring-rose-500/20' 
                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/5'
                        }`}
                      >
                         <Heart 
                           size={22} 
                           fill={post.isLikedByUser ? "currentColor" : "none"} 
                           strokeWidth={post.isLikedByUser ? 0 : 2.5}
                           className={`transition-all duration-300 ${post.isLikedByUser ? 'scale-110 drop-shadow-sm' : ''}`} 
                         />
                         <span>{post.likesCount}</span>
                      </button>

                      <button 
                         onClick={() => setActivePostId(post.id)}
                         className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-brand-violet hover:bg-brand-violet/5 px-4 py-2.5 rounded-2xl transition-all"
                      >
                         <MessageCircle size={22} strokeWidth={2.5} />
                         <span>{post.commentsCount}</span>
                      </button>

                      <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-500 hover:bg-blue-500/5 px-4 py-2.5 rounded-2xl transition-all ml-auto">
                         <Share2 size={20} strokeWidth={2.5} />
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>

       {hasMore && posts.length > 0 && !loading && (
          <button 
             onClick={loadMorePosts}
             disabled={loadingMore}
             className="w-full py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-400 font-bold text-sm hover:text-brand-violet transition-all shadow-sm"
          >
             {loadingMore ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Ver mais testemunhos"}
          </button>
       )}

       {activePostId && (
          <CommentModal 
             comments={posts.find(p => p.id === activePostId)?.comments || []}
             onClose={() => setActivePostId(null)}
             onSubmit={handleAddComment}
          />
       )}
    </div>
  );
};

export default CommunityFeed;
