import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Post } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { PostItem } from '../components/features/post/PostItem';
import { apiClient, API_BASE_URL } from '../lib/apiClient';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { CreatePostModal } from '../components/features/post/CreatePostModal';
import toast from 'react-hot-toast';

// Wireframe 3 reply thread mock data
const getSampleThread = (id: string): Post => ({
  id: id || 'me_post',
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  createdAt: 'Sat Aug 01 2026 20:53:21',
  userId: 'u1',
  user: { id: 'u1', username: 'username', name: 'me', avatarMood: '😊' },
  redLikesCount: 100,
  orangeLikesCount: 0,
  giftsCount: 0,
  replies: [
    {
      id: 'r1',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      createdAt: 'Sat Aug 01 2026 20:53:21',
      userId: 'u2',
      user: { id: 'u2', username: 'username', name: 'user_a', avatarMood: '😐' },
      redLikesCount: 100,
      orangeLikesCount: 0,
      giftsCount: 0,
    },
    {
      id: 'r2',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      createdAt: 'Sat Aug 01 2026 20:53:21',
      userId: 'u3',
      user: { id: 'u3', username: 'username', name: 'user_b', avatarMood: '😐' },
      redLikesCount: 100,
      orangeLikesCount: 0,
      giftsCount: 0,
    },
  ],
});

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);

  // Retrieve reply ID to highlight from location state
  const highlightReplyId = location.state?.highlightReplyId;

  const [replyTargetPost, setReplyTargetPost] = useState<Post | null>(null);

  const fetchPostDetail = useCallback(async () => {
    if (!id) return;
    try {
      let p = await apiClient<Post>(`/posts/${id}`);
      setPost(p);
    } catch (_) {
      setPost(getSampleThread(id));
    }
  }, [id]);


  useEffect(() => {
    fetchPostDetail();

    const eventSource = new EventSource(`${API_BASE_URL}/sse`, {
      withCredentials: true,
    });

    eventSource.addEventListener('post', (event) => {
      try {
        const newPost = JSON.parse(event.data) as Post;
        if (newPost.parentId === id) {
          setPost((prev) => {
            if (!prev) return prev;
            const replies = prev.replies || [];
            if (replies.some((r) => r.id === newPost.id)) return prev;
            return {
              ...prev,
              replies: [...replies, newPost],
            };
          });
        }
      } catch (err) {
        console.error('Failed to parse real-time reply:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [id, fetchPostDetail]);

  const handleReplySubmit = async (content: string) => {
    if (!replyTargetPost) return;
    try {
      await apiClient(`/posts/${replyTargetPost.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      fetchPostDetail();
    } catch (err) {
      try {
        await apiClient(`/messages/${replyTargetPost.id}/replies`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        fetchPostDetail();
      } catch (fallbackErr) {
        toast.error('返信の送信に失敗しました');
      }
    }
  };

  if (!post) {
    return (
      <AnimatedPage>
        <MainLayout>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </MainLayout>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <MainLayout>
        <div className="space-y-6">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-stone-500 hover:text-green-600 transition font-medium text-sm py-1"
          >
            <span className="text-lg">←</span>
            <span>ホームに戻る</span>
          </Link>

          {/* Main parent post */}
          <PostItem
            post={post}
            showThreadLine={!!(post.replies && post.replies.length > 0)}
            highlight={highlightReplyId === post.id}
            onReply={(targetPost) => setReplyTargetPost(targetPost)}
          />

          {/* Thread replies matching Wireframe 3 vertical thread connector */}
          {post.replies?.map((replyPost, index) => (
            <PostItem
              key={replyPost.id}
              post={replyPost}
              showThreadLine={index < post.replies!.length - 1}
              highlight={highlightReplyId === replyPost.id}
            />
          ))}
        </div>

        {/* Reply Modal */}
        <CreatePostModal
          isOpen={!!replyTargetPost}
          onClose={() => setReplyTargetPost(null)}
          onSubmit={handleReplySubmit}
          replyToUsername={replyTargetPost?.user?.name || replyTargetPost?.user?.username}
        />
      </MainLayout>
    </AnimatedPage>
  );
};
