import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Post, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { PostItem } from '../components/features/post/PostItem';
import { Avatar } from '../components/ui/Avatar';
import { Search } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { AnimatedPage } from '../components/layout/AnimatedPage';

export const ProfilePage: React.FC = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReplies, setUserReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  
  // Stats state only visible to own user
  const [stats, setStats] = useState<{ likeCount: number; superLikeCount: number; praiseSentCount: number; praiseReceivedCount: number } | null>(null);

  const targetUsername = paramUsername || currentUser?.username || 'username';
  const isOwnProfile = !paramUsername || paramUsername.toLowerCase() === currentUser?.username?.toLowerCase();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user info
        let fetchedUser: User;
        try {
          fetchedUser = await apiClient<User>(`/users/${targetUsername}`);
        } catch (_) {
          fetchedUser = {
            id: currentUser?.id || 'u1',
            username: targetUsername,
            name: currentUser?.name || 'me',
            bio: 'Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text Profile Text',
            avatarMood: '😊',
          };
        }
        setProfileUser(fetchedUser);

        // 2. Fetch user's own posts
        try {
          const posts = await apiClient<Post[]>(`/users/${targetUsername}/posts`);
          setUserPosts(posts.filter(p => !p.parentId));
        } catch (_) {
          // Fallback filter from main posts endpoint
          try {
            const allPosts = await apiClient<Post[]>('/posts');
            const filtered = allPosts.filter(
              (p) => (p.user?.username === targetUsername || p.userId === fetchedUser.id) && !p.parentId
            );
            setUserPosts(filtered);
          } catch (e) {
            setUserPosts([]);
          }
        }

        // 3. Fetch user's replies
        try {
          const replies = await apiClient<Post[]>(`/users/${targetUsername}/replies`);
          setUserReplies(replies);
        } catch (_) {
          // Fallback filter replies from main posts endpoint
          try {
            const allPosts = await apiClient<Post[]>('/posts');
            const filtered = allPosts.filter(
              (p) => (p.user?.username === targetUsername || p.userId === fetchedUser.id) && !!p.parentId
            );
            setUserReplies(filtered);
          } catch (e) {
            setUserReplies([]);
          }
        }

        // 4. Fetch accumulated stats if viewing own profile
        if (isOwnProfile) {
          try {
            const statsData = await apiClient<{ likeCount: number; superLikeCount: number; praiseSentCount: number; praiseReceivedCount: number }>(`/users/${targetUsername}/stats`);
            setStats(statsData);
          } catch (_) {
            setStats({ likeCount: 0, superLikeCount: 0, praiseSentCount: 0, praiseReceivedCount: 0 });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUsername, currentUser, isOwnProfile]);

  const displayedPosts = activeTab === 'posts' ? userPosts : userReplies;

  return (
    <AnimatedPage>
      <MainLayout>
        {/* Cloud Header Banner matching Wireframe 4 */}
        <div className="cloud-header rounded-2xl mb-6 relative">
          <div className="flex space-x-8 text-4xl select-none opacity-80">
            <span>☁️</span>
            <span className="text-2xl">☁️</span>
            <span>☁️</span>
            <span className="text-3xl">☁️</span>
            <span>☁️</span>
            <span className="text-2xl">☁️</span>
            <span>☁️</span>
          </div>
          <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full border border-gray-800 hover:bg-white transition">
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* User Info Header matching Wireframe 4 */}
        <div className="border-b border-stone-150 dark:border-stone-850 pb-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar mood={profileUser?.avatarMood || '😊'} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {profileUser?.name || 'me'}
                </h1>
                <p className="text-stone-500 dark:text-stone-400 text-lg font-medium">
                  @{profileUser?.username || targetUsername}
                </p>
              </div>
            </div>
          </div>

          {/* Own User Accumulated Stats Dashboard */}
          {isOwnProfile && stats && (
            <div className="mt-4 grid grid-cols-4 gap-2.5 p-3.5 bg-green-50/40 rounded-2xl border border-green-100/50">
              <div className="text-center">
                <span className="block text-[10px] md:text-xs font-semibold text-stone-400 mb-0.5">総いいね</span>
                <span className="text-sm md:text-base font-bold text-orange-600 font-mono">{stats.likeCount}</span>
              </div>
              <div className="text-center border-l border-stone-100">
                <span className="block text-[10px] md:text-xs font-semibold text-stone-400 mb-0.5">総Sいいね</span>
                <span className="text-sm md:text-base font-bold text-red-600 font-mono">{stats.superLikeCount}</span>
              </div>
              <div className="text-center border-l border-stone-100">
                <span className="block text-[10px] md:text-xs font-semibold text-stone-400 mb-0.5">褒めた数</span>
                <span className="text-sm md:text-base font-bold text-green-700 font-mono">{stats.praiseSentCount}</span>
              </div>
              <div className="text-center border-l border-stone-100">
                <span className="block text-[10px] md:text-xs font-semibold text-stone-400 mb-0.5">褒められた数</span>
                <span className="text-sm md:text-base font-bold text-emerald-800 font-mono">{stats.praiseReceivedCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Custom Tabs (Posts / Replies) like X/Twitter */}
        <div className="flex border-b border-stone-150 dark:border-stone-850 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 ${
              activeTab === 'posts'
                ? 'border-green-600 text-green-700 dark:text-green-500'
                : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            投稿
          </button>
          <button
            onClick={() => setActiveTab('replies')}
            className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 ${
              activeTab === 'replies'
                ? 'border-green-600 text-green-700 dark:text-green-500'
                : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            返信
          </button>
        </div>

        {/* User's Own Posts */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-medium">
            {activeTab === 'posts' ? 'まだ投稿がありません' : 'まだ返信がありません'}
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </MainLayout>
    </AnimatedPage>
  );
};
