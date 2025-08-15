// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const speechToText = require('../watsonClient');

// const router = express.Router();

// // 一時保存フォルダ "uploads/" を指定
// const upload = multer({ dest: 'uploads/' });

// // フロントから POST された音声ファイルを受け取って認識するルート
// router.post('/transcribe', upload.single('audio'), async (req, res) => {
//   try {
//     // Watson Speech to Text API のパラメータ
//     const params = {
//       audio: fs.createReadStream(req.file.path), // アップロードされた音声ファイルを読み込み
//       contentType: 'audio/wav',                  // 音声形式は WAV
//       model: 'ja-JP_BroadbandModel',             // 日本語モデル
//     };

//     // Watson API を呼び出し
//     const response = await speechToText.recognize(params);

//     // 認識結果をテキストにまとめる（不要な空白を削除）
//     let transcript = response.result.results
//     .map(r => r.alternatives[0].transcript)
//     .join('');

//     // 全角・半角スペースを削除
//     transcript = transcript.replace(/\s+/g, '');

//     // JSON形式で結果を返す
//     res.json({ transcript });

//     // 一時ファイル削除
//     fs.unlinkSync(req.file.path);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Transcription failed' });
//   }
// });

// module.exports = router;

// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg');
// const speechToText = require('../watsonClient'); // Watson SDKクライアント
// const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// // サンプルレート取得用
// const getSampleRate = (filePath) => {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) return reject(err);
//       const stream = metadata.streams.find(s => s.codec_type === 'audio');
//       resolve(stream.sample_rate ? parseInt(stream.sample_rate) : 16000);
//     });
//   });
// };


// // POST /api/speech/transcribe
// router.post('/transcribe', upload.single('audio'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: '音声ファイルがアップロードされていません' });

//     console.log('=== ファイル情報 ===');
//     console.log('ファイル名:', req.file.originalname);
//     console.log('MIMEタイプ:', req.file.mimetype);
//     console.log('サイズ:', req.file.size, 'bytes');

//     const keyword = req.body.keyword || '';
//     const sampleRate = await getSampleRate(req.file.path);

//     // モデル選択（8kHzは Narrowband、16kHz以上は Broadband）
//     const model = sampleRate <= 8000 ? 'ja-JP_NarrowbandModel' : 'ja-JP_BroadbandModel';
//     console.log(`サンプリング周波数: ${sampleRate} Hz, 使用モデル: ${model}`);

//     const params = {
//       audio: fs.createReadStream(req.file.path),
//       contentType: 'audio/wav',
//       model: model,
//       speakerLabels: true, // 話者ラベルON
//     };

//     // 音声認識
//     const response = await speechToText.recognize(params);

//     // 認識結果をテキスト化
//     const rawTranscript = response.result.results
//       .map(r => r.alternatives[0].transcript)
//       .join('')
//       .replace(/\s+/g, ''); // 空白削除

//     // 話者ラベル取得
//     const speakerLabels = response.result.speaker_labels || [];
//     const speakers = {};
//     speakerLabels.forEach(label => {
//       const seg = rawTranscript.substring(Math.floor(label.from * rawTranscript.length / sampleRate),
//                                           Math.floor(label.to * rawTranscript.length / sampleRate));
//       speakers[label.speaker] = (speakers[label.speaker] || '') + seg;
//     });

//     // キーワードハイライト＆前後5文字
//     let highlightedText = rawTranscript;
//     const matches = [];
//     if (keyword) {
//       const regex = new RegExp(keyword, 'g');
//       let match;
//       while ((match = regex.exec(rawTranscript)) !== null) {
//         const start = Math.max(0, match.index - 5);
//         const end = Math.min(rawTranscript.length, match.index + keyword.length + 5);
//         const context = rawTranscript.substring(start, end);
//         matches.push(context);
//         highlightedText =
//           highlightedText.substring(0, match.index) +
//           `<mark>${keyword}</mark>` +
//           highlightedText.substring(match.index + keyword.length);
//       }
//     }

//     res.json({
//       transcript: rawTranscript,
//       highlighted: highlightedText,
//       keyword,
//       matches,
//       speakers, // 話者別テキスト
//     });

//     fs.unlinkSync(req.file.path); // 一時ファイル削除

//   } catch (error) {
//     console.error('=== Watson API エラー ===');
//     console.error(error.message);
//     res.status(500).json({ error: 'Transcription failed', details: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const speechToText = require('../watsonClient');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// MP3などを16kHzモノラルWAVに変換する関数
const convertToWav = (inputPath) => {
  const outputPath = inputPath + '.wav';
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-ac 1', '-ar 16000', '-f wav'])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '音声ファイルがアップロードされていません' });

    console.log('=== ファイル情報 ===');
    console.log('ファイル名:', req.file.originalname);
    console.log('MIMEタイプ:', req.file.mimetype);
    console.log('サイズ:', req.file.size, 'bytes');

    const keyword = req.body.keyword || '';

    // MP3やその他形式をWAVに変換
    const wavPath = await convertToWav(req.file.path);

    // Watson Speech to Text API パラメータ
    const params = {
      audio: fs.createReadStream(wavPath),
      contentType: 'audio/wav',
      model: 'ja-JP_BroadbandModel',
      smartFormatting: true,
      speakerLabels: true, // 話者ラベルON
      smartFormatting: true      // ← 追加：句読点・日付・数字を自動整形
    };

    const response = await speechToText.recognize(params);

    // テキスト化
    const rawTranscript = response.result.results
      .map(r => r.alternatives[0].transcript)
      .join('')
      .replace(/\s+/g, '');

    // 話者ラベルを整理
    const speakerLabels = response.result.speaker_labels || [];
    const speakers = {};
    speakerLabels.forEach(label => {
      const seg = rawTranscript.slice(Math.floor(label.from * rawTranscript.length), Math.floor(label.to * rawTranscript.length));
      speakers[label.speaker] = (speakers[label.speaker] || '') + seg;
    });

    // キーワードハイライト & 前後5文字抽出
    let highlightedText = rawTranscript;
    const matches = [];
    if (keyword) {
      const regex = new RegExp(keyword, 'g');
      let match;
      while ((match = regex.exec(rawTranscript)) !== null) {
        const start = Math.max(0, match.index - 5);
        const end = Math.min(rawTranscript.length, match.index + keyword.length + 5);
        matches.push(rawTranscript.substring(start, end));

        highlightedText =
          highlightedText.substring(0, match.index) +
          `<mark>${keyword}</mark>` +
          highlightedText.substring(match.index + keyword.length);
      }
    }

    res.json({
      transcript: rawTranscript,
      highlighted: highlightedText,
      keyword,
      matches,
      speakers,
    });

    // 一時ファイル削除
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(wavPath);

  } catch (error) {
    console.error('=== Watson API エラー ===');
    if (error.response) {
      console.error('ステータスコード:', error.response.status);
      console.error('レスポンス:', error.response.result);
    } else {
      console.error(error.message);
    }
    res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
});

module.exports = router;
