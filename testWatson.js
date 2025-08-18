import fs from 'fs';
import fetch from 'node-fetch';

async function callWatson() {
  const apiKey = 'SPEECH_TO_TEXT_APIKEY';
  const serviceUrl = 'SPEECH_TO_TEXT_URL';

  const response = await fetch(serviceUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('apikey:' + apiKey).toString('base64'),
      'Content-Type': 'audio/wav',
    },
    body: fs.readFileSync('ja-JP_Broadband-sample.wav') // ファイル名はローカルの存在する音声に変更
  });

  const result = await response.json();

  fs.writeFileSync('watson_result.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('✅ Watsonの結果を watson_result.json に保存しました');
}

callWatson();
