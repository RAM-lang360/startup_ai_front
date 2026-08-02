import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenCreatePost?: () => void;
  onOpenMenu?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreatePost, onOpenMenu, unreadCount = 0 }) => {
  const { user } = useAuth();


  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-150/80 dark:border-stone-800/80 px-4 py-3 flex items-center justify-between transition-colors duration-300">
      {/* Left: Wireframe Avatar or App Logo with Username */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 active:scale-95 transition"
        onClick={onOpenMenu}
      >
        <Avatar mood={user?.avatarMood || '😊'} size="sm" />
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
          {user?.name || user?.username || ''}
        </span>
      </div>

      {/* Center: Custom Logo from /logo.jpg */}
      <div className="flex items-center justify-center">
        <Link to="/" className="flex items-center space-x-1.5">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-lg font-bold tracking-tight text-green-700 dark:text-green-500">Echo Chamber</span>
        </Link>
      </div>

      {/* Right spacer to keep title centered */}
      <div className="w-16" />
    </header>
  );
};
