const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_APIKEY, // 環境変数から APIキー を取得
  }),
  serviceUrl: process.env.WATSON_URL, // 環境変数からURLを取得
});

module.exports = speechToText;
