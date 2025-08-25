// 音声認識の単体テスト
// POST /transcribe が正しく文字起こし・キーワード抽出を行うかをテスト

const express = require('express');
require('dotenv').config();

// API接続
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const request = require('supertest');

const path = require('path');
const router = require('../routes/speechtotext');

// テストようにサーバーを作成
const app = express();
app.use(express.json());
app.use('/', router);

describe('POST /transcribe', () => {
  it('APIがキーワードを受け取り、抽出結果を返すこと', async () => {
    const audioPath = path.join(__dirname, 'ja-JP_Broadband-sample.wav'); // テスト用の音声ファイル
    const keywords = '音声,ディープ';

    console.log()

    const response = await request(app)
      .post('/transcribe')
      .field('keywords', keywords)
      .field('language', 'ja')
      .attach('audio', audioPath);

    // デバック出力
    console.log('📄 Transcript:', response.body.transcript);
    console.log('🔍 Matches:', response.body.matches);

    // レスポンス検証
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('transcript');
    expect(response.body).toHaveProperty('matches');
    expect(Array.isArray(response.body.matches)).toBe(true);

    // キーワードが正しく抽出されているか
    const matchKeywords = response.body.matches.map(m => m.keyword);
    expect(matchKeywords).toEqual(expect.arrayContaining(['音声', 'ディープ']));}, 15000); // タイムアウト15秒
  });
