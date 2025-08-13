const express = require('express');
const cors = require('cors');
require('dotenv').config();

const speechRoutes = require('./routes/speechtotext');

const app = express();
app.use(cors());             // CORSを有効化（フロントからのアクセス許可）
app.use(express.json());     // JSON形式のリクエストをパース

// APIルートを登録
app.use('/api/speech', speechRoutes);

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
