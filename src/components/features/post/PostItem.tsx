import React, { useState, useEffect } from 'react';
import { Post, LikeResponse } from '../../../types';
import { Avatar } from '../../ui/Avatar';
import { Heart, Star, Gift, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import toast from 'react-hot-toast';

interface PostItemProps {
  post: Post;
  showThreadLine?: boolean;
  onReply?: (post: Post) => void;
  highlight?: boolean;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  showThreadLine = false,
  onReply,
  highlight = false,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isHighlighted, setIsHighlighted] = useState<boolean>(highlight);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      
      // Auto-scroll to the selected post with smooth scrolling behavior
      const scrollTimer = setTimeout(() => {
        elementRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100); // Small delay to allow the DOM to fully load / transitions to settle

      const fadeTimer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2500); // Highlight fades out after 2.5 seconds
      
      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [highlight]);

  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || post.isOrangeLiked || false);
  const [likeCount, setLikeCount] = useState<number>(
    typeof post.likeCount === 'number' ? post.likeCount : (post.orangeLikesCount || 0)
  );

  const [isSuperLiked, setIsSuperLiked] = useState<boolean>(post.isSuperLiked || post.isRedLiked || false);
  const [superLikeCount, setSuperLikeCount] = useState<number>(
    typeof post.superLikeCount === 'number' ? post.superLikeCount : (post.redLikesCount || 100)
  );

  const [giftCount, setGiftCount] = useState(post.giftsCount || 0);

  // In-page Expand / Accordion for Replies (X / Twitter style inline thread view)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [replies, setReplies] = useState<Post[]>(post.replies || []);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);

  const handleToggleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded && (!replies || replies.length === 0)) {
      try {
        setLoadingReplies(true);
        let detail: Post;
        try {
          detail = await apiClient<Post>(`/posts/${post.id}`);
        } catch (_) {
          detail = await apiClient<Post>(`/messages/${post.id}`);
        }
        if (detail && Array.isArray(detail.replies)) {
          setReplies(detail.replies);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReplies(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  // 1. Standard Like (POST /api/posts/:id/like)
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      let res: LikeResponse;
      try {
        res = await apiClient<LikeResponse>(`/posts/${post.id}/like`, { method: 'POST' });
      } catch (_) {
        res = await apiClient<LikeResponse>(`/messages/${post.id}/like`, { method: 'POST' });
      }
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
      setIsSuperLiked(res.isSuperLiked);
      setSuperLikeCount(res.superLikeCount);
      if (res.isLiked) {
        toast.success('いいねしました！', { id: `like-${post.id}`, duration: 1500 });
      }
    } catch (err: any) {
      setIsLiked(!nextState);
      setLikeCount(prev => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  // 2. Super Like (POST /api/posts/:id/super-like)
  const handleSuperLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isSuperLiked;
    setIsSuperLiked(nextState);
    setSuperLikeCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      let res: LikeResponse;
      try {
        res = await apiClient<LikeResponse>(`/posts/${post.id}/super-like`, { method: 'POST' });
      } catch (_) {
        res = await apiClient<LikeResponse>(`/messages/${post.id}/super-like`, { method: 'POST' });
      }
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
      setIsSuperLiked(res.isSuperLiked);
      setSuperLikeCount(res.superLikeCount);
      if (res.isSuperLiked) {
        toast.success('⭐ スーパーいいね！を贈りました！', { id: `super-${post.id}`, duration: 2000 });
      }
    } catch (err: any) {
      setIsSuperLiked(!nextState);
      setSuperLikeCount(prev => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGiftCount(prev => prev + 1);
    toast.success('ギフトを贈りました！ 🎁', { duration: 1500 });
  };

  const username = post.user?.username || 'username';
  const name = post.user?.name || 'user';
  const avatarMood = post.user?.avatarMood || (username.includes('a') ? '😐' : username.includes('b') ? '😐' : '😊');
  const hasReplies = replies && replies.length > 0;

  return (
    <>
      <div ref={elementRef} className="relative mb-2">
        {/* Wireframe Vertical Thread Connector Line */}
        {(showThreadLine || isExpanded) && (
          <div
            className="absolute left-5 top-10 bottom-0 w-0.5 bg-green-150 z-0"
            style={{ height: 'calc(100% + 8px)', transform: 'translateX(-50%)' }}
          />
        )}

        <div className="flex items-start gap-2.5 relative z-10">
          {/* User Avatar */}
          <Link to={`/profile/${username}`}>
            <Avatar mood={avatarMood} size="sm" />
          </Link>

          <div className="flex-1 min-w-0">
            {/* Header info matching wireframe: name @username */}
            <div className="flex items-baseline space-x-1 mb-0.5">
              <Link to={`/profile/${username}`} className="font-bold text-stone-850 text-xs md:text-sm hover:underline">
                {name}
              </Link>
              <span className="text-stone-400 text-[10px] md:text-xs font-normal">@{username}</span>
            </div>

            {/* Rounded Post Bubble (Borderless / flat like X) */}
            <div
              onClick={() => {
                if (post.parentId) {
                  // If it's a reply, navigate to parent thread and highlight this reply
                  navigate(`/post/${post.parentId}`, { state: { highlightReplyId: post.id } });
                } else {
                  // If it's a root post, navigate directly to its detail view
                  navigate(`/post/${post.id}`);
                }
              }}
              className={`px-2.5 py-2 transition-all duration-500 cursor-pointer rounded-xl ${
                isHighlighted
                  ? 'border border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/10 scale-[1.005]'
                  : 'bg-transparent hover:bg-stone-50/60'
              }`}
            >
              <p className="text-stone-800 text-xs md:text-sm leading-snug whitespace-pre-wrap font-sans">
                {post.content}
              </p>

              {/* Bottom Actions Row matching exact wireframe & X-like interaction */}
              <div className="mt-2.5 flex items-center justify-end pt-1.5 border-t border-stone-50" onClick={(e) => e.stopPropagation()}>
                {/* Action Icons: Like (Heart) | Super Like (Red/Star Badge) | Gift | Reply */}
                <div className="flex items-center space-x-4">
                  {/* 1. Standard Orange Heart Like */}
                  <button
                    onClick={handleLikeToggle}
                    className="group flex items-center space-x-1 focus:outline-none transition"
                    title="いいね"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all group-hover:scale-110 ${
                        isLiked
                          ? 'fill-orange-500 text-orange-500 scale-110'
                          : 'fill-none text-orange-500 opacity-80 group-hover:opacity-100'
                      }`}
                    />
                    {currentUser && post.userId === currentUser.id && (
                      <span className={`text-xs font-bold ${isLiked ? 'text-orange-600' : 'text-gray-600'}`}>
                        {likeCount}
                      </span>
                    )}
                  </button>

                  {/* 2. Super Like Button */}
                  <button
                    onClick={handleSuperLikeToggle}
                    className="group relative flex items-center justify-center focus:outline-none transition"
                    title="スーパーいいね！"
                  >
                    <div className="relative">
                      <Heart
                        className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                          isSuperLiked ? 'fill-red-600 text-red-600' : 'fill-red-500 text-red-500'
                        }`}
                      />
                      {currentUser && post.userId === currentUser.id && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white pointer-events-none">
                          {superLikeCount}
                        </span>
                      )}
                    </div>
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 -ml-0.5 -mt-2 animate-bounce" />
                  </button>

                  {/* 3. Gift Box Button */}
                  <button
                    onClick={handleGiftClick}
                    className="group flex items-center space-x-1 focus:outline-none transition"
                    title="ギフトを贈る"
                  >
                    <Gift className="w-5.5 h-5.5 text-stone-700 fill-stone-700 transition-transform group-hover:scale-110" />
                    {currentUser && post.userId === currentUser.id && giftCount > 0 && (
                      <span className="text-xs font-bold text-stone-600">{giftCount}</span>
                    )}
                  </button>

                  {/* 4. Reply Trigger (Icon Only) */}
                  {onReply && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReply(post);
                      }}
                      className="p-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition"
                      title="返信"
                    >
                      <MessageCircle className="w-4.5 h-4.5" />
                    </button>
                  )}

                  {/* Inline Expand Toggle Arrow */}
                  <button
                    onClick={handleToggleExpand}
                    className="p-1 rounded-full text-stone-400 hover:bg-stone-100 transition"
                    title={isExpanded ? '返信を閉じる' : '返信を表示'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Expanded Thread / Replies Section (Matching Wireframe 3 thread tree without page navigation) */}
            {isExpanded && (
              <div className="mt-4 pl-4 space-y-4 border-l-2 border-gray-300">
                {loadingReplies ? (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span>返信を読み込み中...</span>
                  </div>
                ) : hasReplies ? (
                  replies.map((reply, idx) => (
                    <PostItem
                      key={reply.id || idx}
                      post={reply}
                      showThreadLine={idx < replies.length - 1}
                      onReply={onReply}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400 py-2 italic">
                    返信はまだありません。「返信」ボタンからコメントを送信できます。
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Visual divider/border below each root post item (not in thread replies) to improve readability */}
      {!showThreadLine && (
        <div className="mt-4 border-b border-stone-100" />
      )}
    </>
  );
};
