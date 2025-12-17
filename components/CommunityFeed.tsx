
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, Image, Send, Loader2, MoreVertical, X, Clock, Filter, Quote } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'testimony' | 'inspiration'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  useEffect(() => {
     if (initialContent) setNewContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await fetchCommunityPosts();
    setPosts(data);
    setLoading(false);
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
    if (selectedImage) imageUrl = await uploadImage(selectedImage, 'posts');

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
    <div className="space-y-8 pb-24">
       
       {/* Create Post Box (Improved) */}
       <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm transition-all focus-within:shadow-lg focus-within:border-brand-violet/20">
          <div className="flex gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-brand-dark dark:bg-white/10 text-white flex items-center justify-center font-bold shadow-md overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : user.name.charAt(0)}
             </div>
             <div className="flex-1">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Partilhe sua graça, testemunho ou inspiração..."
                  className="w-full bg-transparent pt-3 text-base outline-none resize-none text-brand-dark dark:text-white placeholder:text-slate-400 min-h-[80px]"
                />
                {previewUrl && (
                   <div className="relative mt-3 w-full h-64 rounded-2xl overflow-hidden shadow-md bg-slate-100 dark:bg-black/20">
                      <img src={previewUrl} className="w-full h-full object-cover" />
                      <button onClick={clearImage} className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"><X size={16} /></button>
                   </div>
                )}
             </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-white/5">
             <div className="relative">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-slate-500 hover:text-brand-violet transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wide">
                   <Image size={18} /> Foto
                </button>
             </div>
             <button onClick={handlePost} disabled={(!newContent.trim() && !selectedImage) || isPosting} className="bg-brand-violet text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-brand-violet/20">
                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Publicar
             </button>
          </div>
       </div>

       {/* Filters */}
       <div className="flex justify-center gap-2 mb-2">
          <button onClick={() => setFilter('all')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'all' ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-md' : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>Tudo</button>
          <button onClick={() => setFilter('testimony')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'testimony' ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-md' : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>Testemunhos</button>
          <button onClick={() => setFilter('inspiration')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'inspiration' ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-md' : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>Fotos</button>
       </div>

       {/* Feed Content */}
       {loading ? (
          <div className="flex flex-col items-center py-12 gap-3"><Loader2 size={32} className="text-brand-violet animate-spin" /><p className="text-sm font-medium text-slate-400">Carregando a caminhada...</p></div>
       ) : (
          <div className="space-y-8">
             {filteredPosts.map((post, idx) => (
                <article key={post.id} className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-card border border-slate-100 dark:border-white/5 overflow-hidden animate-slide-up-content transition-all duration-300 hover:shadow-float" style={{ animationDelay: `${idx * 100}ms` }}>
                   
                   {/* Post Header */}
                   <div className="p-6 pb-4 flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden border border-slate-100 dark:border-white/5">
                            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="text-base font-bold text-brand-dark dark:text-white leading-tight">{post.userName}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-[11px] font-medium text-slate-400">{getTimeAgo(post.timestamp)}</p>
                               {post.contextTag && <span className="text-[9px] bg-brand-violet/10 text-brand-violet px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{post.contextTag}</span>}
                            </div>
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-50 dark:hover:bg-white/5"><MoreVertical size={20} /></button>
                   </div>

                   {/* Content */}
                   {post.content && (
                      <div className="px-6 pb-4">
                         <div className="relative">
                            {post.type === 'testimony' && <Quote size={24} className="text-brand-violet/20 absolute -top-2 -left-2" fill="currentColor" />}
                            <p className={`text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium ${post.type === 'testimony' ? 'text-lg italic pl-6' : 'text-base'}`}>{post.content}</p>
                         </div>
                      </div>
                   )}

                   {/* Image */}
                   {post.imageUrl && (
                      <div className="w-full bg-slate-50 dark:bg-black/20 relative">
                         <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[600px] object-cover" />
                      </div>
                   )}

                   {/* Interactions */}
                   <div className="px-6 py-5 flex items-center justify-between border-t border-slate-50 dark:border-white/5">
                      <div className="flex gap-6">
                         <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition-all active:scale-95 group ${post.isLikedByUser ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-brand-dark dark:hover:text-white'}`}>
                            <Heart size={22} strokeWidth={post.isLikedByUser ? 0 : 2} fill={post.isLikedByUser ? "currentColor" : "none"} className={post.isLikedByUser ? "animate-pop" : "group-hover:scale-110 transition-transform"} />
                            <span className="text-sm font-bold">{post.likesCount > 0 ? post.likesCount : ''}</span>
                         </button>
                         <button onClick={() => setActivePostId(post.id)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-violet transition-all active:scale-95 group">
                            <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                         </button>
                      </div>
                      <button className="text-slate-400 hover:text-brand-dark dark:hover:text-white transition-all active:scale-95"><Share2 size={22} /></button>
                   </div>
                </article>
             ))}
          </div>
       )}
       {activePostId && <CommentModal comments={posts.find(p => p.id === activePostId)?.comments || []} onClose={() => setActivePostId(null)} onSubmit={handleAddComment} />}
    </div>
  );
};

export default CommunityFeed;
