const express = require('express');
const cors = require('cors');
require('dotenv').config();

const speechRoutes = require('./routes/speechtotext');

const app = express();
app.use(cors());             // CORSを有効化（フロントからのアクセス許可）
app.use(express.json());     // JSON形式のリクエストをパース

// APIルートを登録
app.use('/api/speech', speechRoutes);

app.get('/', (req, res) => {
  res.status(200).send('OK');
});
// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// const express = require('express');
// const cors = require('cors');
// const multer = require('multer'); // ← 追加：ファイルアップロード用
// require('dotenv').config();

// // const speechRoutes = require('./routes/speechtotext');
// const transcribeRoutes = require('./api/speech/transcribe');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use('/transcribe', transcribeRoutes);

// // アップロード用ミドルウェア
// const upload = multer({ dest: 'uploads/' });

// // ルートに multer を追加
// // → ここでフロントからの音声ファイルを req.file で受け取れるようにする
// app.use('/api/speech', upload.single('audio'), speechRoutes);
// app.use('/transcribe', upload.single('audio'), transcribeRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// require('dotenv').config();

// const transcribeRoutes = require('./api/speech/transcribe');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // アップロード用ミドルウェア
// const upload = multer({ dest: 'uploads/' });

// // フロントからの POST /transcribe を受け取る
// app.use('/transcribe', upload.single('audio'), transcribeRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// require('dotenv').config();

// const transcribeRoutes = require('./routes/speechtotext'); // ← 以前動いていたルートを使う

// const app = express();
// app.use(cors());
// app.use(express.json());

// // POST /transcribe に対して Multer 経由で音声ファイルを受け取る
// app.use('/transcribe', transcribeRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

