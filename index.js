// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import fs from 'fs';
// import { IamAuthenticator } from 'ibm-watson/auth/index.js';
// import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';

// const app = express();
// const port = 3001;
// const upload = multer({ dest: 'uploads/' });

// app.use(cors());

// const speechToText = new SpeechToTextV1({
//   authenticator: new IamAuthenticator({ apikey: 'SPEECH_TO_TEXT_APIKEY' }),
//   serviceUrl: 'SPEECH_TO_TEXT_URLR',
// });

// app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
//   try {
//     const recognizeParams = {
//       audio: fs.createReadStream(req.file.path),
//       contentType: 'audio/webm',
//       model: 'ja-JP_BroadbandModel',
//       speakerLabels: true,
//       smartFormatting: true,
//     };

//     const response = await speechToText.recognize(recognizeParams);
//     const transcript = response.result.results
//       .map(result => result.alternatives[0].transcript)
//       .join('');

//     res.json({ transcript });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: '変換に失敗しました' });
//   }
// });

// app.listen(port, () => {
//   console.log(`API server listening at http://localhost:${port}`);
// });

// import fetch from 'node-fetch';

// async function callWatson() {
//   const response = await fetch('https://api.jp-tok.speech-to-text.watson.cloud.ibm.com/v1/recognize', {
//     method: 'POST',
//     headers: {
//       'Authorization': 'Basic ' + Buffer.from('apikey:YOUR_API_KEY').toString('base64'),
//       'Content-Type': 'audio/wav'
//     },
//     body: fs.readFileSync('ja-JP_Broadband-sample.wav')
//   });

//   const result = await response.json();

//   // Watsonの結果を保存
//   fs.writeFileSync('watson_result.json', JSON.stringify(result, null, 2), 'utf8');
//   console.log('✅ Watsonの結果を watson_result.json に保存しました');
// }

// callWatson();
// index.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';

// .env を読み込む
dotenv.config();

const app = express();
const port = 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Watson Speech to Text SDK 初期化
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: process.env.SPEECH_TO_TEXT_APIKEY }),
  serviceUrl: process.env.SPEECH_TO_TEXT_URL,
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const recognizeParams = {
      audio: fs.createReadStream(req.file.path),
      contentType: 'audio/webm', // アップロードファイル形式に合わせる
      model: 'ja-JP_BroadbandModel',
      speakerLabels: true,
      smartFormatting: true,
    };

    const response = await speechToText.recognize(recognizeParams);
    const transcript = response.result.results
      .map(result => result.alternatives[0].transcript)
      .join('');

    res.json({ transcript });

    // アップロードファイルを削除
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '変換に失敗しました', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
