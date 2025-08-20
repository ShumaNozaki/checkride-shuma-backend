const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = require('../routes/speechtotext');

const app = express();
app.use(express.json());
app.use('/', router);

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.SPEECH_TO_TEXT_APIKEY, // 環境変数からAPIキーを取得
  }),
  serviceUrl: process.env.SPEECH_TO_TEXT_URL, // 環境変数からURLを取得
});


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


    console.log('📄 Transcript:', response.body.transcript);
    console.log('🔍 Matches:', response.body.matches);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('transcript');
    expect(response.body).toHaveProperty('matches');
    expect(Array.isArray(response.body.matches)).toBe(true);

    const matchKeywords = response.body.matches.map(m => m.keyword);
    expect(matchKeywords).toEqual(expect.arrayContaining(['音声', 'ディープ']));}, 15000); // ← タイムアウトを15秒に延長
  });
// });
