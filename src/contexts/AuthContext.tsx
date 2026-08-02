import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { apiClient, API_BASE_URL } from '../lib/apiClient';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiClient<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`${API_BASE_URL}/sse`, {
      withCredentials: true,
    });

    eventSource.addEventListener('notification', (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        if (newNotif.userId === user.id) {
          const targetId = newNotif.parentId || newNotif.messageId || newNotif.postId;
          if (targetId) {
            toast(
              (t) => (
                <div
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate(`/post/${targetId}`, { state: { highlightReplyId: newNotif.messageId || newNotif.postId } });
                  }}
                  className="cursor-pointer hover:underline flex items-center space-x-2"
                >
                  <span>🔔</span>
                  <span>{newNotif.content}</span>
                </div>
              ),
              {
                duration: 6000,
              }
            );
          } else {
            toast(newNotif.content, {
              icon: '🔔',
              duration: 6000,
            });
          }
        }
      } catch (err) {
        console.error('Failed to parse global real-time notification:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [user, navigate]);

  const login = async (username: string) => {
    const res = await apiClient<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    if (res.user) {
      setUser(res.user);
    } else {
      await fetchCurrentUser();
    }
  };

  const register = async (username: string, name: string) => {
    const res = await apiClient<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify({ username, name }),
    });
    if (res.user) {
      setUser(res.user);
    } else {
      await fetchCurrentUser();
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (_) {
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
