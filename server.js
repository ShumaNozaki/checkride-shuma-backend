const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ルーター読み込み
const speechRoutes = require('./routes/speechtotext');


const app = express();
app.use(cors());
app.use(express.json());

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
