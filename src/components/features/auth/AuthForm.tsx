import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setLoading(true);
      if (isRegister) {
        if (!name.trim()) {
          toast.error('名前を入力してください');
          return;
        }
        await register(username, name);
        toast.success('新規登録に成功しました！');
      } else {
        await login(username);
        toast.success('ログインしました！');
      }
    } catch (err: any) {
      toast.error(err.message || '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-gray-900 rounded-3xl p-8 shadow-xl mx-auto">
      {/* Wireframe Header Emoji */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-gray-900 flex items-center justify-center text-3xl">
          😊
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        {isRegister ? 'アカウントを作成' : 'ログイン'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ユーザー名 (@username)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ram_dev"
            required
            className="w-full border-2 border-gray-800 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {isRegister && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ラム"
              required
              className="w-full border-2 border-gray-800 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-md disabled:opacity-50 mt-4"
        >
          {loading ? '処理中...' : isRegister ? '登録して開始' : 'ログイン'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm font-medium text-amber-600 hover:underline"
        >
          {isRegister ? '既存のアカウントでログイン' : '新規アカウントを作成する'}
        </button>
      </div>
    </div>
  );
};
