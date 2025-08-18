const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth/index.js');
require('dotenv').config();

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.SPEECH_TO_TEXT_APIKEY, // 環境変数から APIキー を取得
  }),
  serviceUrl: process.env.SPEECH_TO_TEXT_URL, // 環境変数からURLを取得
});

module.exports = speechToText;
