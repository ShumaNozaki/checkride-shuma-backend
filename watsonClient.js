const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth/index.js');
require('dotenv').config();

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_API_KEY, // 環境変数から APIキー を取得
  }),
  serviceUrl: process.env.WATSON_URL, // 環境変数からURLを取得
});

module.exports = speechToText;
