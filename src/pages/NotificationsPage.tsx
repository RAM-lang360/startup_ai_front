import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types';
import { MainLayout } from '../components/layout/MainLayout';
import { apiClient, API_BASE_URL } from '../lib/apiClient';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedPage } from '../components/layout/AnimatedPage';

const sampleNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'REPLY',
    content: 'user_a さんがあなたの投稿に返信しました',
    isRead: false,
    createdAt: new Date().toISOString(),
    actor: { id: 'u2', username: 'user_a', name: 'user_a', avatarMood: '😐' },
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'LIKE',
    content: 'user_b さんがあなたの投稿をいいねしました',
    isRead: true,
    createdAt: new Date().toISOString(),
    actor: { id: 'u3', username: 'user_b', name: 'user_b', avatarMood: '😐' },
  },
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await apiClient<Notification[]>('/notifications');
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          setNotifications(sampleNotifications);
        }
      } catch (_) {
        setNotifications(sampleNotifications);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const eventSource = new EventSource(`${API_BASE_URL}/sse`, {
      withCredentials: true,
    });

    eventSource.addEventListener('notification', (event) => {
      try {
        const newNotif = JSON.parse(event.data) as Notification;
        if (user && newNotif.userId === user.id) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        }
      } catch (err) {
        console.error('Failed to parse real-time notification:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (_) {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await handleMarkRead(n.id);
    }
    const targetId = n.parentId || n.messageId || n.postId;
    // We navigate to /post/:id with target reply identifier as state or hash parameter to highlight it
    if (targetId) {
      navigate(`/post/${targetId}`, { state: { highlightReplyId: n.messageId || n.postId } });
    }
  };

  return (
    <AnimatedPage>
      <MainLayout>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-150 dark:border-stone-800 mb-4">
          通知
        </h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-stone-400 dark:text-stone-500 font-medium">
            新しい通知はありません
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-center justify-between py-3.5 px-2 transition cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/40 rounded-xl ${
                  n.isRead ? 'bg-transparent' : 'bg-green-50/60 dark:bg-green-950/20 border-l-4 border-green-500 pl-1'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar mood={n.actor?.avatarMood || '😊'} size="sm" />
                  <div>
                    <p className={`text-sm text-stone-800 dark:text-stone-200 ${n.isRead ? 'font-normal' : 'font-semibold'}`}>
                      {n.content}
                    </p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">
                      {new Date(n.createdAt).toLocaleDateString('ja-JP')} {new Date(n.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </MainLayout>
    </AnimatedPage>
  );
};

