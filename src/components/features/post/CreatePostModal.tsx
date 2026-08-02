import React, { useState } from 'react';
import { Avatar } from '../../ui/Avatar';
import { useAuth } from '../../../contexts/AuthContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  replyToUsername?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  replyToUsername,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      await onSubmit(content);
      setContent('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container simulating image wireframe 2 */}
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg min-h-[420px] p-6 flex flex-col justify-between shadow-2xl">
        {/* Top bar matching wireframe: キャンセル | 下書き | アウトプット */}
        <div>
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <button
              onClick={onClose}
              className="text-stone-500 font-medium hover:text-stone-800 transition"
            >
              キャンセル
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-stone-400 text-sm font-medium cursor-pointer hover:underline">
                下書き
              </span>
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="bg-green-600 text-white rounded-full px-5 py-1.5 font-medium hover:bg-green-700 transition disabled:opacity-40 shadow-sm"
              >
                {loading ? '送信中...' : 'アウトプット'}
              </button>
            </div>
          </div>

          {/* Reply Context */}
          {replyToUsername && (
            <div className="text-sm text-gray-500 mb-3 pl-14">
              @{replyToUsername} への返信
            </div>
          )}

          {/* Input Row: Avatar + Dynamic Placeholder */}
          <div className="flex items-start space-x-4">
            <Avatar mood={user?.avatarMood || '😊'} size="md" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyToUsername ? 'なんて返信する？' : 'いまにしてる？'}
              rows={6}
              autoFocus
              className="w-full text-lg font-bold text-stone-850 placeholder-stone-400 border-none outline-none focus:ring-0 resize-none bg-transparent pt-2"
            />
          </div>
        </div>

        <div className="text-right text-xs text-stone-400">
          {content.length} / 280
        </div>
      </div>
    </div>
  );
};
