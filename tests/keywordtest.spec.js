const { KeywordTest } = require('../utils/keywordtest');

test('TDD用: 複数キーワード抽出と昇順ソート', () => {
  const transcript = '音声認識の現状について教えてください。ディープラーニングも使用されています。';
  const keywords = ['音声', 'ディープ'];

  const matches = KeywordTest(transcript, keywords, 5);

  expect(matches.length).toBe(2);
  expect(matches[0].keyword).toBe('音声');
  expect(matches[1].keyword).toBe('ディープ');
  expect(matches[0].startIndex).toBeLessThan(matches[1].startIndex);
});


