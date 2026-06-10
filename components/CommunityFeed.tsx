
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { Heart, MessageCircle, Image, Send, Loader2, X, Clock } from 'lucide-react';
import { createCommunityPost, fetchCommunityPosts, togglePostLike, addComment, uploadImage } from '../services/databaseService';
import CommentModal from './CommentModal';

interface CommunityFeedProps {
  user: UserProfile;
  initialContent?: string;
}

const PAGE_SIZE = 10;

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const CommunityFeed: React.FC<CommunityFeedProps> = ({ user, initialContent }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'testimony' | 'inspiration'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialContent) setNewContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    setLoading(true);
    const data = await fetchCommunityPosts(0, PAGE_SIZE);
    setPosts(data);
    setHasMore(data.length === PAGE_SIZE);
    setPage(0);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    let imageUrl: string | undefined;
    if (selectedImage) {
      try {
        imageUrl = await uploadImage(selectedImage, 'posts');
      } catch (e) {
        console.error('Erro no upload da imagem:', e);
      }
    }
    const newPost = await createCommunityPost(user.id, user.name, user.photoUrl, newContent, imageUrl);
    setPosts(prev => [newPost, ...prev]);
    setNewContent('');
    clearImage();
    setIsPosting(false);
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const liked = post.isLikedByUser;
      return { ...post, isLikedByUser: !liked, likesCount: liked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1 };
    }));
    try {
      await togglePostLike(postId);
    } catch (e) {
      console.error('Erro ao processar like:', e);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!activePostId) return;
    const newComment = await addComment(activePostId, user.id, user.name, text);
    setPosts(prev => prev.map(p =>
      p.id === activePostId
        ? { ...p, commentsCount: p.commentsCount + 1, comments: [...(p.comments || []), newComment] }
        : p
    ));
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  return (
    <div className="space-y-5 pb-8 relative">

      {/* ── Post Composer ── */}
      <div className="bg-white dark:bg-[#1A1F26] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm transition-all focus-within:shadow-md focus-within:border-brand-violet/20">
        <div className="p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden shrink-0">
              {user.photoUrl
                ? <img src={user.photoUrl} className="w-full h-full object-cover" alt={user.name} />
                : user.name.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Partilhe sua graça, testemunho ou inspiração..."
                rows={3}
                className="w-full bg-transparent text-sm sm:text-base outline-none resize-none text-brand-dark dark:text-white placeholder:text-slate-400 font-medium leading-relaxed"
              />
              {previewUrl && (
                <div className="relative mt-3 w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/20 ring-1 ring-white/10">
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    onClick={clearImage}
                    className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-50 dark:border-white/5">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-slate-400 hover:text-brand-violet transition-colors px-3 py-2 rounded-xl hover:bg-brand-violet/5 font-bold text-xs"
            >
              <Image size={16} strokeWidth={1.5} />
              <span className="hidden sm:inline">Foto</span>
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={(!newContent.trim() && !selectedImage) || isPosting}
            className="bg-brand-violet text-white px-5 sm:px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-brand-violet/20"
          >
            {isPosting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Publicar</span>
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {([
          { id: 'all', label: 'Todos' },
          { id: 'testimony', label: 'Testemunhos' },
          { id: 'inspiration', label: 'Imagens' },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              filter === opt.id
                ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/20'
                : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5 hover:border-brand-violet/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Posts List ── */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-[#1A1F26] h-48 rounded-3xl animate-pulse border border-slate-100 dark:border-white/5" />
          ))
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">Nenhuma partilha ainda.</p>
            <p className="text-xs mt-1">Seja o primeiro a partilhar!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-white dark:bg-[#1A1F26] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all animate-fade-in"
            >
              {/* Post header */}
              <div className="flex items-center gap-3 p-4 sm:p-5 pb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-violet/10 flex items-center justify-center font-bold text-sm text-brand-violet overflow-hidden shrink-0">
                  {post.userAvatar
                    ? <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
                    : post.userName.charAt(0)
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brand-dark dark:text-white text-sm truncate">{post.userName}</p>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={9} /> {getTimeAgo(post.timestamp)}
                  </p>
                </div>
              </div>

              {/* Post content */}
              {post.content && (
                <p className="px-4 sm:px-5 pb-4 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                  {post.content}
                </p>
              )}

              {/* Post image */}
              {post.imageUrl && (
                <div className="mx-4 sm:mx-5 mb-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/20">
                  <img
                    src={post.imageUrl}
                    className="w-full h-auto max-h-[420px] object-contain"
                    alt="Imagem do post"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-slate-50 dark:border-white/5">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-2 rounded-xl active:scale-110 min-h-[40px] ${
                    post.isLikedByUser
                      ? 'text-rose-500 bg-rose-500/10'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/5'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={post.isLikedByUser ? 'currentColor' : 'none'}
                    strokeWidth={post.isLikedByUser ? 0 : 2}
                    className={`transition-transform duration-200 ${post.isLikedByUser ? 'scale-110' : ''}`}
                  />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  onClick={() => setActivePostId(post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-violet hover:bg-brand-violet/5 px-3 py-2 rounded-xl transition-all min-h-[40px]"
                >
                  <MessageCircle size={18} strokeWidth={2} />
                  <span>{post.commentsCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Load More ── */}
      {hasMore && posts.length > 0 && !loading && (
        <button
          onClick={loadMorePosts}
          disabled={loadingMore}
          className="w-full py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-400 font-bold text-sm hover:text-brand-violet transition-all"
        >
          {loadingMore ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Ver mais partilhas'}
        </button>
      )}

      {/* ── Comment Modal ── */}
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
