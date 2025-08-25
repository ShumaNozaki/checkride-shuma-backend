// ファイル・キーワードの取得→WAVに変換→言語モデルを決定→文字起こし→全文を作成→キーワード抽出→JSONでフロントエンドに返す→アップロード＆ファイルの削除

const express = require('express');
const multer = require('multer'); // ブラウザやクライアントから送られてくるファイル付きフォームを受け取ることができる
const fs = require('fs'); // 音声ファイルの読み込みや削除に使用
const ffmpeg = require('fluent-ffmpeg'); // 音声ファイルの形式変換ができるツールでWAV形式に変換のために使用
const speechToText = require('../watsonClient'); // APIと接続するためのクライアントモジュール（APIを渡す窓口）

const router = express.Router();

// ローカルのuploadsフォルダに保存
const upload = multer({ dest: 'uploads/' });

// アップロードされた音声ファイルをWAV形式に変換
const convertToWav = (inputPath) => {
  const outputPath = inputPath + '.wav';
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-ac 1', '-ar 16000', '-f wav']) // モノラルに変換し、推奨音質にかえ、WAV形式で保存する
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};

// POST /transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '音声ファイルがアップロードされていません' });

    const keywords = (req.body.keywords || '').split(',').map(k => k.trim()).filter(k => k); // キーワードの取得、カンマ区切りで配列に変換
    const wavPath = await convertToWav(req.file.path); // WAV形式に変換
    const language = req.body.language || 'ja'; // languageが送られてくればそれを使う、デフォルトは日本語

    const params = {
      audio: fs.createReadStream(wavPath),
      contentType: 'audio/wav',
      model: language === 'ja' ? 'ja-JP_BroadbandModel' : 'en-US_BroadbandModel', // 日本語 or 英語の文字起こしモデル
      smartFormatting: true, // 日付、時刻、数値、電話番号、通貨の値、アドレスを標準的表現に変換
    };

    const response = await speechToText.recognize(params); // 文字起こし

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

          const beforeText = transcript.slice(0, match.index).replace(/\s+/g, ''); // 0からキーワードの開始位置までを切り出し空白を削除
          const afterText  = transcript.slice(match.index + keyword.length).replace(/\s+/g, ''); // キーワードの終了位置から最後までを切り出し空白を削除

          const beforeSlice = beforeText.slice(-5); // 先ほど切り出したキーワードの前5文字を取り出す
          const afterSlice  = afterText.slice(0, 5); // 先ほど切り出したキーワードの後5文字を取り出す

          matches.push({
            keyword,
            startIndex: match.index, // キーワードの開始位置の取得
            endIndex: match.index + keyword.length, // キーワードの終了位置の取得
            snippet: beforeSlice + keyword + afterSlice // 前5文字 + キーワード + 後5文字
          });
        }
      });

      // 検出位置で昇順ソート
      matches.sort((a, b) => a.startIndex - b.startIndex);
    }
    // フロントにJSONで返す
    res.json({
      transcript,
      matches
    });
    // 一時ファイルの削除
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(wavPath);

  } 
  // 文字起こしやファイル処理でエラーが起きたら500エラーを返す
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
});

module.exports = router;
