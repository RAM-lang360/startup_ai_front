import React, { useEffect, useState, useCallback } from 'react';
import { Post } from '../types';
import { apiClient, API_BASE_URL } from '../lib/apiClient';
import { MainLayout } from '../components/layout/MainLayout';
import { PostItem } from '../components/features/post/PostItem';
import { CreatePostModal } from '../components/features/post/CreatePostModal';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import toast from 'react-hot-toast';

// Mock initial wireframe posts if backend is fresh
const samplePosts: Post[] = [
  {
    id: 'p1',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: 'Sat Aug 01 2026 20:22:13',
    userId: 'u1',
    user: { id: 'u1', username: 'username', name: 'me', avatarMood: '😊' },
    redLikesCount: 100,
    orangeLikesCount: 1,
    giftsCount: 0,
  },
  {
    id: 'p2',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: 'Sat Aug 01 2026 20:22:13',
    userId: 'u2',
    user: { id: 'u2', username: 'username', name: 'user_a', avatarMood: '😊' },
    redLikesCount: 100,
    orangeLikesCount: 1,
    giftsCount: 0,
  },
  {
    id: 'p3',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: 'Sat Aug 01 2026 20:22:13',
    userId: 'u3',
    user: { id: 'u3', username: 'username', name: 'user_c', avatarMood: '😊' },
    redLikesCount: 100,
    orangeLikesCount: 1,
    giftsCount: 0,
  },
];

export const TimelinePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyTargetPost, setReplyTargetPost] = useState<Post | null>(null);


  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let data: Post[] = [];
      try {
        data = await apiClient<Post[]>('/posts');
      } catch (_) {
        data = await apiClient<Post[]>('/messages');
      }

      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(samplePosts);
      }
    } catch (err) {
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    const eventSource = new EventSource(`${API_BASE_URL}/sse`, {
      withCredentials: true,
    });

    eventSource.addEventListener('post', (event) => {
      try {
        const newPost = JSON.parse(event.data) as Post;
        setPosts((prev) => {
          if (prev.some((p) => p.id === newPost.id)) return prev;
          if (!newPost.parentId) {
            return [newPost, ...prev];
          } else {
            return prev.map((p) => {
              if (p.id === newPost.parentId) {
                const replies = p.replies || [];
                if (replies.some((r) => r.id === newPost.id)) return p;
                return {
                  ...p,
                  replies: [...replies, newPost],
                };
              }
              return p;
            });
          }
        });
      } catch (err) {
        console.error('Failed to parse real-time post:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [fetchPosts]);

  const handleReplySubmit = async (content: string) => {
    if (!replyTargetPost) return;
    try {
      await apiClient(`/posts/${replyTargetPost.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      fetchPosts();
    } catch (err) {
      try {
        await apiClient(`/messages/${replyTargetPost.id}/replies`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        fetchPosts();
      } catch (fallbackErr) {
        toast.error('返信の送信に失敗しました');
      }
    }
  };

  return (
    <AnimatedPage>
      <MainLayout onPostCreated={fetchPosts}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, idx) => (
              <PostItem
                key={post.id || idx}
                post={post}
                onReply={(targetPost) => setReplyTargetPost(targetPost)}
              />
            ))}
          </div>
        )}

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
