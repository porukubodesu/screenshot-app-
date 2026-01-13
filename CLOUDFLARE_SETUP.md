# Cloudflare Workers セットアップガイド

このガイドでは、Claude APIを使った要約機能をCloudflare Workersにデプロイする方法を説明します。

## 前提条件

- Cloudflareアカウント（無料）
- Claude APIキー（Anthropic）
- Node.js（npmが使える環境）

## 手順

### 1. Cloudflareアカウントの作成

1. [Cloudflare](https://dash.cloudflare.com/sign-up) にアクセスして無料アカウントを作成
2. メールアドレスを認証

### 2. Wranglerのインストール

```bash
npm install -g wrangler
```

### 3. Cloudflareにログイン

```bash
wrangler login
```

ブラウザが開くので、ログインして認証します。

### 4. Claude APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. APIキーを作成
3. キーをコピーして保存

### 5. Workerにシークレットを設定

```bash
cd /home/user/screenshot-app-
npx wrangler secret put ANTHROPIC_API_KEY
```

プロンプトが表示されたら、Claude APIキーを貼り付けてEnterを押します。

### 6. Workerをデプロイ

```bash
npx wrangler deploy
```

デプロイが成功すると、URLが表示されます：
```
Published screenshot-summarizer
  https://screenshot-summarizer.your-subdomain.workers.dev
```

このURLをコピーしてください。

### 7. フロントエンドの設定

`index.html` の `SUMMARIZER_API_URL` をデプロイしたWorkerのURLに変更します：

```javascript
const SUMMARIZER_API_URL = 'https://screenshot-summarizer.your-subdomain.workers.dev';
```

## 料金について

### Cloudflare Workers
- **無料枠**: 1日あたり100,000リクエスト
- 個人利用なら完全無料で使えます

### Claude API (Haiku)
- **入力**: $0.25 / 1M tokens
- **出力**: $1.25 / 1M tokens
- 1回の要約で約1000 tokens使用 → **1回あたり約$0.001（0.1円）**
- 月1000枚処理しても約100円

## トラブルシューティング

### `wrangler`コマンドが見つからない

```bash
npm install -g wrangler
```

### デプロイエラー

```bash
# ログイン状態を確認
wrangler whoami

# 再ログイン
wrangler logout
wrangler login
```

### CORS エラー

worker.jsのcorsHeadersが正しく設定されているか確認してください。

## ローカルでテスト

デプロイ前にローカルでテストできます：

```bash
npx wrangler dev
```

これで `http://localhost:8787` でWorkerが起動します。
