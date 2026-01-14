
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, Image, Send, Loader2, MoreVertical, X, Clock, Filter, Quote, ArrowUp, Bookmark } from 'lucide-react';
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
          setNewPostsAvailable(prev => prev + 1);
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

  const handleLike = async (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.isLikedByUser ? p.likesCount - 1 : p.likesCount + 1, isLikedByUser: !p.isLikedByUser } : p));
    await togglePostLike(id);
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
          <div className="sticky top-20 z-40 flex justify-center w-full pointer-events-none">
             <button 
                onClick={handleRefresh}
                className="pointer-events-auto bg-brand-violet text-white px-6 py-3 rounded-full shadow-2xl animate-bounce-in flex items-center gap-2 text-sm font-black ring-4 ring-brand-dark/20 border border-white/10 transition-transform active:scale-95"
             >
                <ArrowUp size={16} strokeWidth={3} /> {newPostsAvailable} novas luzes no caminho
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
                   <div className="relative mt-4 w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-black/20 ring-1 ring-white/10">
                      <img src={previewUrl} className="w-full h-full object-cover" />
                      <button onClick={clearImage} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors"><X size={18} /></button>
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
             <button onClick={handlePost} disabled={(!newContent.trim() && !selectedImage) || isPosting} className="bg-brand-violet text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-brand-violet/20">
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
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border ${filter === opt.id ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-lg scale-105' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-brand-violet/30'}`}
            >
              {opt.label}
            </button>
          ))}
       </div>

       {/* Feed Content */}
       {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
             <div className="w-12 h-12 bg-brand-violet/10 rounded-full flex items-center justify-center">
                <Loader2 size={24} className="text-brand-violet animate-spin" />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Buscando testemunhos...</p>
          </div>
       ) : (
          <div className="space-y-12 px-2 sm:px-0">
             {filteredPosts.map((post, idx) => (
                <article key={post.id} className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden animate-slide-up-content transition-all duration-500 hover:shadow-float group" style={{ animationDelay: `${idx * 100}ms` }}>
                   
                   {/* Post Header */}
                   <div className="p-7 pb-5 flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="text-base font-black text-brand-dark dark:text-white leading-tight tracking-tight">{post.userName}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                               <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Clock size={10} /> {getTimeAgo(post.timestamp)}
                               </div>
                               {post.contextTag && <span className="text-[9px] bg-brand-violet/10 text-brand-violet px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">{post.contextTag}</span>}
                            </div>
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-brand-violet dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5"><MoreVertical size={20} /></button>
                   </div>

                   {/* Content */}
                   {post.content && (
                      <div className="px-7 pb-6">
                         <div className="relative">
                            {post.type === 'testimony' && <Quote size={40} className="text-brand-violet/10 absolute -top-4 -left-4 pointer-events-none" fill="currentColor" />}
                            <p className={`text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium relative z-10 ${post.type === 'testimony' ? 'text-xl italic font-serif' : 'text-base'}`}>
                              {post.content}
                            </p>
                         </div>
                      </div>
                   )}

                   {/* Main Image Layer (Visual Centerpiece) */}
                   {post.imageUrl && (
                      <div className="w-full aspect-[4/5] sm:aspect-video md:aspect-[16/10] bg-slate-100 dark:bg-black/20 relative overflow-hidden group/image">
                         <img 
                           src={post.imageUrl} 
                           alt="Conteúdo da comunidade" 
                           className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
                         />
                         {/* Subtle Overlay on Hover */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                         
                         {/* Quick Image Action (Save/Favorite) */}
                         <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-violet">
                            <Bookmark size={20} />
                         </button>
                      </div>
                   )}

                   {/* Interactions Bar */}
                   <div className="px-7 py-6 flex items-center justify-between bg-slate-50/30 dark:bg-black/10 border-t border-slate-50 dark:border-white/5">
                      <div className="flex gap-8">
                         <button 
                            onClick={() => handleLike(post.id)} 
                            className={`flex items-center gap-2.5 transition-all active:scale-90 group ${post.isLikedByUser ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-brand-violet'}`}
                         >
                            <div className={`p-2.5 rounded-2xl transition-colors ${post.isLikedByUser ? 'bg-red-500/10' : 'group-hover:bg-brand-violet/5'}`}>
                               <Heart size={22} strokeWidth={post.isLikedByUser ? 0 : 2} fill={post.isLikedByUser ? "currentColor" : "none"} className={post.isLikedByUser ? "animate-pop" : "group-hover:scale-110 transition-transform"} />
                            </div>
                            <span className="text-sm font-black tracking-tight">{post.likesCount > 0 ? post.likesCount : ''}</span>
                         </button>

                         <button 
                            onClick={() => setActivePostId(post.id)} 
                            className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-brand-violet transition-all active:scale-90 group"
                         >
                            <div className="p-2.5 rounded-2xl transition-colors group-hover:bg-brand-violet/5">
                               <MessageCircle size={22} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-sm font-black tracking-tight">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                         </button>
                      </div>

                      <div className="flex gap-2">
                         <button className="p-2.5 rounded-2xl text-slate-400 hover:text-brand-violet hover:bg-brand-violet/5 transition-all active:scale-90">
                            <Share2 size={22} strokeWidth={2} />
                         </button>
                      </div>
                   </div>
                </article>
             ))}

             {/* Load More Action */}
             {hasMore && (
                <div className="flex justify-center pt-8">
                   <button 
                      onClick={loadMorePosts}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-4 py-8 px-12 transition-all active:scale-95"
                   >
                      <div className={`w-14 h-14 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:border-brand-violet group-hover:bg-brand-violet group-hover:text-white shadow-lg ${loadingMore ? 'animate-spin' : ''}`}>
                         {loadingMore ? <Loader2 size={24} /> : <ArrowUp size={24} className="rotate-180" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand-violet transition-colors">
                        {loadingMore ? 'Lendo o caminho...' : 'Ver mais da caminhada'}
                      </span>
                   </button>
                </div>
             )}

             {!hasMore && posts.length > 0 && (
                <div className="text-center py-16 space-y-4">
                   <div className="w-12 h-1 bg-brand-violet/20 rounded-full mx-auto" />
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-serif italic max-w-xs mx-auto">
                      "Onde dois ou três estiverem reunidos em meu nome, eu estarei ali." (Mt 18, 20)
                   </p>
                </div>
             )}
          </div>
       )}
       {activePostId && <CommentModal comments={posts.find(p => p.id === activePostId)?.comments || []} onClose={() => setActivePostId(null)} onSubmit={handleAddComment} />}
    </div>
  );
};

export default CommunityFeed;
