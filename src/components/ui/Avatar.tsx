import React from 'react';

interface AvatarProps {
  mood?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ mood = '😊', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div
      className={`rounded-full bg-amber-100 border-2 border-gray-900 flex items-center justify-center select-none flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: '#fef3c7' }}
    >
      <span>{mood}</span>
    </div>
  );
};
