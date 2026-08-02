import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { CreatePostModal } from '../features/post/CreatePostModal';
import { apiClient } from '../../lib/apiClient';
import { NavLink } from 'react-router-dom';
import { Home, Bell, User, PlusCircle, X } from 'lucide-react';
import { Notification } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

import { useNavigate, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
  onPostCreated?: () => void;
}

const PAGE_ORDER = ['/', '/notifications', '/profile'];

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onPostCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();

  // Coordinates for touch gesture swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 60;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    
    // Swipe Left: user swipes left (distance > minSwipeDistance)
    // Swipe Right: user swipes right (distance < -minSwipeDistance)
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // If drawer is open, right swipe closes it
    if (isDrawerOpen) {
      if (isLeftSwipe) {
        setIsDrawerOpen(false);
      }
      return;
    }

    const currentPath = location.pathname;
    const currentIndex = PAGE_ORDER.indexOf(currentPath);

    if (currentPath === '/' && isRightSwipe) {
      // If we are on Home page and swipe right (finger moves left-to-right), open the drawer menu
      setIsDrawerOpen(true);
      return;
    }

    if (currentIndex !== -1) {
      if (isLeftSwipe && currentIndex < PAGE_ORDER.length - 1) {
        // Swipe Left: Navigate to Next Page (e.g. Home -> Notifications -> Profile)
        navigate(PAGE_ORDER[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe Right: Navigate to Previous Page (e.g. Profile -> Notifications -> Home)
        navigate(PAGE_ORDER[currentIndex - 1]);
      }
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiClient<Notification[]>('/notifications');
      if (Array.isArray(data)) {
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll notifications unread count every 10 seconds for real-time feel
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async (content: string) => {
    try {
      await apiClient('/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      toast.success('投稿を公開しました！');
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      // Fallback try /messages endpoint if /posts is mapped differently
      try {
        await apiClient('/messages', {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        toast.success('投稿を公開しました！');
        if (onPostCreated) onPostCreated();
      } catch (fallbackErr: any) {
        toast.error('投稿の送信に失敗しました');
      }
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="wireframe-container flex flex-col min-h-screen pb-16 select-none bg-white transition-colors duration-300"
    >
      <Header 
        onOpenCreatePost={() => setIsModalOpen(true)} 
        onOpenMenu={() => setIsDrawerOpen(true)}
      />
      <main className="flex-1 p-4 md:p-6 pb-20 animate-page-in text-stone-900">{children}</main>

      {/* Slide-out Side Drawer Menu Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-start bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-[280px] h-full bg-white border-r border-stone-150 p-6 flex flex-col justify-between shadow-2xl animate-slide-in-left transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Title Bar */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                <span className="font-bold text-stone-850">アカウント情報</span>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-100 text-stone-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview */}
              {authUser && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-2xl">
                      {authUser.avatarMood || '😊'}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{authUser.name}</h4>
                      <p className="text-xs text-stone-400">@{authUser.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Options */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 transition font-medium text-sm text-left"
                >
                  <User className="w-5 h-5 text-stone-400" />
                  <span>プロフィール</span>
                </button>
              </div>
            </div>

            {/* Logout Action */}
            <div className="border-t border-stone-100 pt-4">
              <button
                onClick={async () => {
                  setIsDrawerOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full text-center py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition text-sm font-semibold"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (X-like) */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white/90 backdrop-blur-md border-t border-stone-150/80 z-30 px-6 py-3 flex items-center justify-around shadow-[0_-4px_24px_rgba(78,168,90,0.03)] transition-colors duration-300">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 rounded-full transition ${
              isActive ? 'text-green-600 bg-green-50' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'
            }`
          }
          title="ホーム"
        >
          <Home className="w-5.5 h-5.5 stroke-[2.2]" />
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative p-2 rounded-full transition ${
              isActive ? 'text-green-600 bg-green-50' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'
            }`
          }
          title="通知"
        >
          <Bell className="w-5.5 h-5.5 stroke-[2.2]" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </NavLink>

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full transition shadow-md shadow-green-600/25 active:scale-95"
          title="投稿する"
        >
          <PlusCircle className="w-5.5 h-5.5" />
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `p-2 rounded-full transition ${
              isActive ? 'text-green-600 bg-green-50' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'
            }`
          }
          title="プロフィール"
        >
          <User className="w-5.5 h-5.5 stroke-[2.2]" />
        </NavLink>
      </footer>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};
