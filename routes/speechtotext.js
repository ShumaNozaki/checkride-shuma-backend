const express = require('express');
const multer = require('multer');
const fs = require('fs');
const speechToText = require('../watsonClient');

const router = express.Router();

// 一時保存フォルダ "uploads/" を指定
const upload = multer({ dest: 'uploads/' });

// フロントから POST された音声ファイルを受け取って認識するルート
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Watson Speech to Text API のパラメータ
    const params = {
      audio: fs.createReadStream(req.file.path), // アップロードされた音声ファイルを読み込み
      contentType: 'audio/wav',                  // 音声形式は WAV
      model: 'ja-JP_BroadbandModel',             // 日本語モデル
    };

    // Watson API を呼び出し
    const response = await speechToText.recognize(params);

    // 認識結果をテキストにまとめる
    const transcript = response.result.results
      .map(r => r.alternatives[0].transcript)
      .join('\n');

    // JSON形式で結果を返す
    res.json({ transcript });

    // 一時ファイル削除
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
