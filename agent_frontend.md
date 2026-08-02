# フロントエンド実装要件定義・指示書 (React SPA)

バックエンドAPI仕様（認証・セッション機能を含む）、およびUIワイヤーフレームに従い、再利用性と保守性の高いReact (TypeScript) フロントエンドコードを生成してください。

## 1. 前提技術と環境
- フレームワーク: React (Vite環境)
- 言語: TypeScript
- ルーティング: `react-router-dom`
- 状態管理・認証: React Context API (AuthContext)
- スタイリング: Tailwind CSS
- アイコン: `lucide-react`
- ポップアップ通知: `react-hot-toast`
- API通信: `fetch` API（**必ず `credentials: 'include'` を設定し、Cookieを送信すること**）
- ベースURL: 環境変数 `VITE_API_BASE_URL` (デフォルトは `/api`)

## 2. 実装すべき画面 (Pages)
以下のページと、未認証時にリダイレクトする保護ルーティング（Protected Route）を実装してください。

1. **LoginPage (`/login`)** [新規追加]
   - パスワード不要の認証画面。
   - ログイン機能: `username` のみを入力し `POST /api/auth/login` を実行。
   - 新規登録機能: `username` と `name` を入力し `POST /api/users` を実行。
2. **TimelinePage (`/`)** [要ログイン]
   - 投稿フォームと投稿一覧（タイムライン）を表示。
3. **NotificationsPage (`/notifications`)** [要ログイン]
   - 通知一覧と既読化処理。
4. **ProfilePage (`/profile`)** [要ログイン]
   - クラウドヘッダー画像、ログイン中ユーザーのプロフィール（`name` と `@username`）、自身の投稿一覧。

## 3. ディレクトリ構成と主要コンポーネント
- `src/contexts/AuthContext.tsx`
  - アプリの初期ロード時に `GET /api/auth/me` を呼び出し、ログインユーザー情報を保持する。
  - `login`, `register`, `logout` ( `POST /api/auth/logout` ) の関数を提供する。
- `src/components/layout/`
  - `MainLayout.tsx` (保護されたルートのレイアウト)
  - `Header.tsx` (通知まとめUI、ログアウトボタンを配置)
- `src/components/features/auth/`
  - `AuthForm.tsx` (ログインと新規登録の切り替えが可能なフォームUI)
- `src/components/features/post/`
  - `PostItem.tsx` (投稿UI・ネスト対応)
  - `CreatePostForm.tsx` (新規投稿フォーム)

## 4. APIエンドポイント (バックエンド仕様)
以下のエンドポイントを使用します。
- 認証関連: `GET /auth/me`, `POST /auth/login`, `POST /auth/logout`
- ユーザー関連: `POST /users`
- 投稿関連: `GET /posts`, `POST /posts`, `POST /posts/:id/replies`
- 通知関連: `GET /notifications`, `PATCH /notifications/:id/read`

## 5. 出力のお願い
1. `src/types/index.ts` (User, Session, Post, Notification等の型定義)
2. `src/lib/apiClient.ts` (`fetch`の共通ラッパー。`credentials: 'include'` を明記)
3. `src/contexts/AuthContext.tsx` (認証状態のグローバル管理)
4. `src/components/features/auth/AuthForm.tsx` (パスワードレスログイン/登録UI)
5. `src/App.tsx` (Protected Routeを含むルーティングとプロバイダー設定)