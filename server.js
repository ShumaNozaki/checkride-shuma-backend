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


// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const speechRoutes = require('./routes/speechtotext');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use('/api/speech', speechRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';

const app = express();
const port = 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Watson Speech to Text 初期化
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: 'YOUR_API_KEY' }),
  serviceUrl: 'YOUR_SERVICE_URL',
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const recognizeParams = {
      audio: fs.createReadStream(req.file.path),
      contentType: 'audio/webm', // フロントで送る音声の形式に合わせて変更
      model: 'ja-JP_BroadbandModel',
      speakerLabels: true,
      smartFormatting: true,
    };

    const response = await speechToText.recognize(recognizeParams);
    const transcript = response.result.results
      .map(result => result.alternatives[0].transcript)
      .join('');

    res.json({ transcript });

    // アップロードファイルは削除しておく
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '音声の文字起こしに失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

