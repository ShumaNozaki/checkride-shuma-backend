const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const speechToText = require('../watsonClient');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

    const keywords = (req.body.keywords || '').split(',').map(k => k.trim()).filter(k => k);
    const wavPath = await convertToWav(req.file.path);
    const language = req.body.language || 'ja';

    const params = {
      audio: fs.createReadStream(wavPath),
      contentType: 'audio/wav',
      model: language === 'ja' ? 'ja-JP_BroadbandModel' : 'en-US_BroadbandModel',
      smartFormatting: true,
    };

    const response = await speechToText.recognize(params);

    // 空白を残して全文を作成
    const transcript = response.result.results
      .map(r => r.alternatives[0].transcript)
      .join(' ')
      .trim();

    // キーワード抽出（前後5文字、空白を無視）
    const matches = [];
    if (keywords.length) {
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'g');
        let match;
        while ((match = regex.exec(transcript)) !== null) {
          // 前後5文字を空白除去で計算
          const beforeText = transcript.slice(0, match.index).replace(/\s+/g, '');
          const afterText  = transcript.slice(match.index + keyword.length).replace(/\s+/g, '');

          const beforeSlice = beforeText.slice(-5); // 前5文字
          const afterSlice  = afterText.slice(0, 5); // 後5文字

          matches.push({
            keyword,
            startIndex: match.index,
            endIndex: match.index + keyword.length,
            snippet: beforeSlice + keyword + afterSlice
          });
        }
      });

      // 検出位置で昇順ソート
      matches.sort((a, b) => a.startIndex - b.startIndex);
    }

    res.json({
      transcript,
      matches
    });

    fs.unlinkSync(req.file.path);
    fs.unlinkSync(wavPath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
});

module.exports = router;
