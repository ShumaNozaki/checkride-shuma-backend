/**
 * TDD用: 複数キーワード抽出と前後5単語取得、昇順ソート
 */
function KeywordTest(text, keywords = [], pad = 5) {
  if (!text || !keywords.length) return [];

  const matches = [];

  keywords.forEach(keyword => {
    let index = text.indexOf(keyword);
    while (index !== -1) {
      const start = Math.max(0, index - pad);
      const end = Math.min(text.length, index + keyword.length + pad);
      matches.push({
        keyword,
        startIndex: index,
        snippet: text.slice(start, end)
      });
      index = text.indexOf(keyword, index + keyword.length);
    }
  });

  matches.sort((a, b) => a.startIndex - b.startIndex);
  return matches;
}

module.exports = { KeywordTest };
