// import { SpeechToTextV1 } from 'ibm-watson/speech-to-text/v1.js';
// import { IamAuthenticator } from 'ibm-watson/auth/index.js';

// const speechToText = new SpeechToTextV1({
//   authenticator: new IamAuthenticator({ apikey: process.env.SPEECH_TO_TEXT_APIKEY }),
//   serviceUrl: process.env.SPEECH_TO_TEXT_URL,
// });

// export async function transcribeAudio(audioBuffer) {
//   const response = await speechToText.recognize({
//     audio: audioBuffer,
//     contentType: 'audio/wav',  // 実際のファイル形式に合わせる
//     model: 'ja-JP_BroadbandModel', // 日本語モデル
//     speakerLabels: true,           // 話者分離
//   });

//   const transcript = response.result.results
//     .map(r => r.alternatives[0].transcript)
//     .join(' ');

//   // 整形は必要に応じて
//   return {
//     transcript,
//     formatted: transcript,  // ここで addJapanesePunctuation などを使ってもOK
//     speakers: {}            // 話者情報を整理して返すならここで加工
//   };
// }

const express = require('express');
const fs = require('fs');
const path = require('path');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const router = express.Router();

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: process.env.SPEECH_TO_TEXT_APIKEY }),
  serviceUrl: process.env.SPEECH_TO_TEXT_URL,
});

router.post('/', async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'No audio file' });

    const audioBuffer = fs.readFileSync(audioFile.path);

    const response = await speechToText.recognize({
      audio: audioBuffer,
      contentType: 'audio/wav',
      model: 'ja-JP_BroadbandModel',
      speakerLabels: true
    });

    const transcript = response.result.results
      .map(r => r.alternatives[0].transcript)
      .join(' ');

    res.json({
      transcript,
      formatted: transcript,
      speakers: {} // 必要なら加工
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
