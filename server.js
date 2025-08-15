// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const speechRoutes = require('./routes/speechtotext');

// const app = express();
// app.use(cors());             // CORSを有効化（フロントからのアクセス許可）
// app.use(express.json());     // JSON形式のリクエストをパース

// // APIルートを登録
// app.use('/api/speech', speechRoutes);

// // サーバー起動
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const multer = require('multer'); // ← 追加：ファイルアップロード用
require('dotenv').config();

const speechRoutes = require('./routes/speechtotext');

const app = express();
app.use(cors());
app.use(express.json());

// アップロード用ミドルウェア
const upload = multer({ dest: 'uploads/' });

// ルートに multer を追加
// → ここでフロントからの音声ファイルを req.file で受け取れるようにする
app.use('/api/speech', upload.single('audio'), speechRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

