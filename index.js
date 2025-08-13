import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { IamAuthenticator } from 'ibm-watson/auth';
import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';

const app = express();
const port = 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: 'APIキー' }),
  serviceUrl: 'https://api.jp-tok.speech-to-text.watson.cloud.ibm.com/instances/xxxx',
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const recognizeParams = {
      audio: fs.createReadStream(req.file.path),
      contentType: 'audio/webm',
      model: 'ja-JP_BroadbandModel',
    };

    const response = await speechToText.recognize(recognizeParams);
    const transcript = response.result.results
      .map(result => result.alternatives[0].transcript)
      .join('');

    res.json({ transcript });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '変換に失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
