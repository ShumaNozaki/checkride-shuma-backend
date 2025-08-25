// アプリケーションのエントリーポイント


const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 環境変数を.envから読み込む

// ルーター読み込み
const speechRoutes = require('./routes/speechtotext');

// expressアプリの初期化
const app = express();

// ミドルウェア設定
// cors対応（他のオリジン（ドメイン・ポート）からのアクセスを許可）
app.use(cors());
// app.use(express.json());

// /api/speech にルーターを登録
app.use('/api/speech', speechRoutes);

// 動作確認用ルート
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// サーバー起動
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
