
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, Image, Send, Loader2, MoreVertical, X, Clock } from 'lucide-react';
import { createCommunityPost, fetchCommunityPosts, togglePostLike, addComment, uploadImage } from '../services/databaseService';
import CommentModal from './CommentModal';

interface CommunityFeedProps {
  user: UserProfile;
  initialContent?: string; // New Prop for Testimony Bridge
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ user, initialContent }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comment Modal State
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // Effect to pre-fill content if passed (Testimony)
  useEffect(() => {
     if (initialContent) {
        setNewContent(initialContent);
     }
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
    if (selectedImage) {
       imageUrl = await uploadImage(selectedImage, 'posts');
    }

    const newPost = await createCommunityPost(user.id, user.name, newContent, imageUrl);
    setPosts([newPost, ...posts]);
    setNewContent('');
    clearImage();
    setIsPosting(false);
  };

  const handleLike = async (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
         return {
            ...p,
            likesCount: p.isLikedByUser ? p.likesCount - 1 : p.likesCount + 1,
            isLikedByUser: !p.isLikedByUser
         };
      }
      return p;
    }));
    await togglePostLike(id);
  };

  const handleAddComment = async (text: string) => {
    if (!activePostId) return;
    
    const newComment = await addComment(activePostId, user.id, user.name, text);
    
    setPosts(prev => prev.map(p => {
      if (p.id === activePostId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return "agora";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
       {/* Create Post Box */}
       <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/10 shadow-sm transition-all focus-within:shadow-lg focus-within:border-brand-violet/20">
          <div className="flex gap-4 mb-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-dark dark:bg-white/10 text-white flex items-center justify-center font-bold shadow-md overflow-hidden shrink-0">
                {user.photoUrl ? (
                   <img src={user.photoUrl} className="w-full h-full object-cover" />
                ) : (
                   user.name.charAt(0)
                )}
             </div>
             <div className="flex-1">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Compartilhe sua caminhada hoje..."
                  className="w-full bg-transparent pt-2 text-base outline-none resize-none text-brand-dark dark:text-white placeholder:text-slate-400 min-h-[60px]"
                />
                {previewUrl && (
                   <div className="relative mt-3 w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-black/20">
                      <img src={previewUrl} className="w-full h-full object-cover" />
                      <button 
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                      >
                         <X size={16} />
                      </button>
                   </div>
                )}
             </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-white/5">
             <div className="relative">
                <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileSelect}
                   accept="image/*"
                   className="hidden" 
                />
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-2 text-slate-500 hover:text-brand-violet transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wide"
                >
                   <Image size={18} /> Adicionar Foto
                </button>
             </div>
             <button 
               onClick={handlePost}
               disabled={(!newContent.trim() && !selectedImage) || isPosting}
               className="bg-brand-violet text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-brand-violet/20"
             >
                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Publicar
             </button>
          </div>
       </div>

       {/* Feed */}
       {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
             <Loader2 size={32} className="text-brand-violet animate-spin" />
             <p className="text-sm font-medium text-slate-400">Carregando caminhada...</p>
          </div>
       ) : (
          <div className="space-y-6">
             {posts.map((post, idx) => (
                <article 
                  key={post.id} 
                  className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden animate-slide-up-content hover:shadow-md transition-all duration-300" 
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                   {/* Header */}
                   <div className="p-5 pb-2 flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden border border-slate-100 dark:border-white/5">
                            {post.userAvatar ? (
                               <img src={post.userAvatar} className="w-full h-full object-cover" />
                            ) : (
                               post.userName.charAt(0)
                            )}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-brand-dark dark:text-white leading-tight">{post.userName}</p>
                            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                               {getTimeAgo(post.timestamp)}
                            </p>
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors p-1">
                         <MoreVertical size={18} />
                      </button>
                   </div>

                   {/* Content Text */}
                   {post.content && (
                      <div className="px-5 pb-3">
                         <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed whitespace-pre-line font-normal">
                            {post.content}
                         </p>
                      </div>
                   )}

                   {/* Image (Full Bleed) */}
                   {post.imageUrl && (
                      <div className="w-full bg-slate-50 dark:bg-black/20 relative">
                         <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                      </div>
                   )}

                   {/* Footer Actions (Clean Style) */}
                   <div className="px-5 py-4 flex items-center justify-between border-t border-slate-50 dark:border-white/5 mt-1">
                      <div className="flex gap-6">
                         {/* Like Button */}
                         <button 
                           onClick={() => handleLike(post.id)}
                           className={`flex items-center gap-2 transition-all active:scale-95 group ${
                              post.isLikedByUser ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-brand-dark dark:hover:text-white'
                           }`}
                         >
                            <Heart 
                              size={20} 
                              strokeWidth={post.isLikedByUser ? 0 : 2}
                              fill={post.isLikedByUser ? "currentColor" : "none"} 
                              className={post.isLikedByUser ? "animate-pop" : "group-hover:scale-110 transition-transform"} 
                            />
                            <span className="text-sm font-bold">{post.likesCount > 0 ? post.likesCount : ''}</span>
                         </button>

                         {/* Comment Button */}
                         <button 
                           onClick={() => setActivePostId(post.id)}
                           className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-violet transition-all active:scale-95 group"
                        >
                            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                         </button>
                      </div>

                      {/* Share */}
                      <button className="text-slate-400 hover:text-brand-dark dark:hover:text-white transition-all active:scale-95">
                         <Share2 size={20} />
                      </button>
                   </div>
                </article>
             ))}
          </div>
       )}

       {/* Comment Modal */}
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
