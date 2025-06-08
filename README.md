# 🚀 Modern Task Manager

モダンで高機能なタスク管理アプリケーション。リアルタイム同期、スマート通知、カレンダー統合を備えた、生産性向上のための究極のツールです。

![Modern Task Manager](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Supabase](https://img.shields.io/badge/Supabase-green)

## 🌟 ライブデモ

### 🚀 ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYersiniaPestis899%2Fmodern-task-manager-app&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20configuration%20keys&envLink=https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fgetting-started%2Fsetting-up-your-project&project-name=modern-task-manager&repository-name=modern-task-manager)

## ✨ 主な機能

### 📋 タスク管理
- **直感的なタスク作成・編集**: ドラッグ&ドロップ、キーボードショートカット対応
- **優先度管理**: 緊急、高、中、低の4段階で優先度設定
- **ステータス追跡**: 未着手、進行中、完了、キャンセルのステータス管理
- **カテゴリー・タグ**: 柔軟なタスク分類システム
- **期限・時間設定**: 日付と時間を含む詳細な期限設定

### 📅 カレンダー統合
- **月間ビュー**: Googleカレンダー風の見やすい月間表示
- **日間詳細**: 選択した日のタスク詳細表示
- **色分け表示**: 優先度による色分け表示

### 🔔 スマート通知
- **デスクトップ通知**: ブラウザネイティブ通知
- **リマインダー**: 5分前〜1日前まで柔軟な通知設定
- **PWA対応**: アプリライクな通知体験

### 📊 統計・分析
- **パフォーマンス追跡**: 完了率、効率性の可視化
- **週次・月次レポート**: 生産性トレンドの分析
- **カテゴリ別分析**: 分野別の時間配分分析

### 🔄 リアルタイム同期
- **複数デバイス対応**: スマホ、PC、タブレット間で同期
- **リアルタイム更新**: 変更の即座な反映
- **オフライン対応**: ネットワーク復旧時の自動同期

### 🎨 モダンUI/UX
- **ダークモード**: 目に優しいダークテーマ
- **レスポンシブデザイン**: 全デバイス対応
- **アニメーション**: 滑らかな操作体験
- **アクセシビリティ**: WCAG準拠のアクセシブルデザイン

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15**: React 19ベースのフルスタックフレームワーク
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS**: ユーティリティファーストCSS
- **shadcn/ui**: モダンUIコンポーネント
- **Lucide React**: 美しいアイコンライブラリ

### バックエンド
- **Supabase**: PostgreSQL + リアルタイム + 認証
- **Next.js API Routes**: サーバーレス API
- **Row Level Security**: データベースレベルのセキュリティ

### 開発・デプロイ
- **Vercel**: 最適化されたデプロイメント
- **ESLint + TypeScript**: コード品質管理
- **PWA**: プログレッシブWebアプリ対応

## 🚀 クイックスタート

### 前提条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### 1. プロジェクトのクローン
```bash
git clone https://github.com/YersiniaPestis899/modern-task-manager-app.git
cd modern-task-manager-app
```

### 2. 依存関係のインストール
```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定
```bash
cp .env.example .env.local
```

`.env.local` を編集し、Supabaseの情報を入力：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabaseデータベースのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで `database/fix_database_error.sql` を実行
3. Authentication設定でGoogle OAuth (オプション) を有効化

### 5. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

アプリケーションは http://localhost:3000 で起動します。

## 🌐 Vercelデプロイ

### 自動デプロイ（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYersiniaPestis899%2Fmodern-task-manager-app&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20configuration%20keys&envLink=https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fgetting-started%2Fsetting-up-your-project&project-name=modern-task-manager&repository-name=modern-task-manager)

### 手動デプロイ

1. [Vercel Dashboard](https://vercel.com) でアカウント作成
2. GitHubリポジトリと連携
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. デプロイ実行

## 📱 PWAとしてのインストール

### デスクトップ
1. ブラウザでアプリを開く
2. アドレスバーの「インストール」アイコンをクリック
3. 「インストール」を確認

### モバイル
1. SafariまたはChromeでアプリを開く
2. 「ホーム画面に追加」を選択
3. アプリ名を確認して追加

## 📊 データベーススキーマ

### Tasks テーブル
```sql
- id: UUID (Primary Key)
- title: VARCHAR(500) - タスクタイトル
- description: TEXT - 詳細説明
- due_date: DATE - 期限日
- due_time: TIME - 期限時刻
- priority: ENUM - 優先度 (low, medium, high, urgent)
- status: ENUM - ステータス (pending, in_progress, completed, cancelled)
- category: VARCHAR(255) - カテゴリ
- tags: TEXT[] - タグ配列
- reminder_minutes: INTEGER - リマインダー時間
- user_id: UUID - ユーザーID (外部キー)
- created_at: TIMESTAMP - 作成日時
- updated_at: TIMESTAMP - 更新日時
```

### Categories テーブル
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) - カテゴリ名
- color: VARCHAR(7) - カラーコード
- user_id: UUID - ユーザーID (外部キー)
```

### User Preferences テーブル
```sql
- id: UUID (Primary Key)
- user_id: UUID - ユーザーID (外部キー)
- theme: ENUM - テーマ設定
- notifications_enabled: BOOLEAN - 通知有効フラグ
- default_reminder_minutes: INTEGER - デフォルトリマインダー
- work_hours_start/end: TIME - 勤務時間
- timezone: VARCHAR(100) - タイムゾーン
```

### Profiles テーブル
```sql
- id: UUID (Primary Key) - auth.users外部キー
- email: TEXT - メールアドレス
- full_name: TEXT - フルネーム
- avatar_url: TEXT - アバター画像URL
- updated_at: TIMESTAMP - 更新日時
```

## 🔐 セキュリティ機能

- **Row Level Security (RLS)**: 全テーブルでユーザー別データアクセス制御
- **JWT認証**: Supabase JWTトークンベース認証
- **HTTPS強制**: 本番環境でのHTTPS通信
- **XSS保護**: Next.jsビルトインセキュリティ機能
- **CSRF保護**: サーバーサイドでの検証

## 🎯 使用方法

### 基本的なタスク管理
1. **新規タスク作成**: 「新規タスク」ボタンまたは `Ctrl+N`
2. **タスク編集**: タスクをクリックして詳細編集
3. **ステータス変更**: チェックボックスで完了/未完了を切り替え
4. **優先度設定**: カラーコードで優先度を視覚的に管理

### カレンダービュー
1. **月間表示**: カレンダータブで月間ビューに切り替え
2. **日付クリック**: 特定の日付をクリックしてタスク表示/作成
3. **ナビゲーション**: 矢印ボタンで月の移動

### 通知設定
1. **ブラウザ許可**: 初回ログイン時に通知許可を有効化
2. **リマインダー設定**: タスク作成時にリマインダー時間を設定
3. **通知音**: ブラウザ設定で通知音をカスタマイズ

## 🐛 トラブルシューティング

### よくある問題

#### 🔐 Google認証エラー
**症状**: "Database error saving new user"
**解決**: `database/fix_database_error.sql` をSupabase SQL Editorで実行

#### 📡 リアルタイム同期が働かない
**症状**: 他のデバイスで変更が反映されない
**解決**: 
1. ブラウザのキャッシュクリア
2. ネットワーク接続確認
3. Supabase Realtimeの有効化確認

#### 🔔 通知が表示されない
**症状**: タスクのリマインダー通知が来ない
**解決**:
1. ブラウザの通知許可を確認
2. Windows通知設定を確認
3. PWAとしてインストールして使用

## 🤝 コントリビューション

1. Forkを作成
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙋‍♂️ サポート

- 🐛 Issues: [GitHub Issues](https://github.com/YersiniaPestis899/modern-task-manager-app/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YersiniaPestis899/modern-task-manager-app/discussions)

## 🎯 ロードマップ

### v1.1 (近日公開)
- [ ] 繰り返しタスク機能
- [ ] チーム共有機能
- [ ] データエクスポート/インポート
- [ ] モバイルアプリ（React Native）

### v1.2 (今後)
- [ ] AI搭載スマート提案
- [ ] 時間追跡機能
- [ ] プロジェクトテンプレート
- [ ] 第三者サービス連携 (Google Calendar, Slack)

### v2.0 (将来)
- [ ] チャット機能
- [ ] 音声入力
- [ ] 高度な分析・レポート
- [ ] エンタープライズ機能

---

**Modern Task Manager**で生産性を最大化しましょう！ 🚀

Made with ❤️ using Next.js and Supabase
