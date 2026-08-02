export interface User {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarMood?: string; // e.g. '😊' | '😐'
  createdAt?: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  userId?: string | null;
  user?: User | null;
  parentId?: string | null;
  replies?: Post[];
  likeCount?: number;
  superLikeCount?: number;
  isLiked?: boolean;
  isSuperLiked?: boolean;
  orangeLikesCount?: number;
  redLikesCount?: number;
  isOrangeLiked?: boolean;
  isRedLiked?: boolean;
  giftsCount?: number;
}

export interface LikeResponse {
  messageId: string;
  type: 'LIKE' | 'SUPER_LIKE';
  action: 'liked' | 'unliked';
  isLiked: boolean;
  isSuperLiked: boolean;
  likeCount: number;
  superLikeCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string; // 'REPLY' | 'LIKE' | 'SUPER_LIKE'
  content: string;
  isRead: boolean;
  createdAt: string;
  actor?: User;
  postId?: string;
  messageId?: string;
  parentId?: string;
}

