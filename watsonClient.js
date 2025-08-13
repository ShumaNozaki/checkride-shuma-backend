const { IamAuthenticator } = require('ibm-watson/auth');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: process.env.WATSON_API_KEY }),
  serviceUrl: process.env.WATSON_URL,
});

async function transcribe(audioBuffer) {
  const response = await speechToText.recognize({
    audio: audioBuffer,
    contentType: 'audio/webm',
    model: 'ja-JP_BroadbandModel',
  });
  return response.result.results.map(r => r.alternatives[0].transcript).join('');
}

module.exports = { transcribe };
