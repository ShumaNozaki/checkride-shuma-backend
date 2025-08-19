/**
 * TDD用: 複数キーワード抽出と前後5単語取得、昇順ソート
 */
function KeywordsrTest(text, keywords = [], pad = 5) {
  if (!text || !keywords.length) return [];

  const words = text.split(/\s+/).filter(Boolean);
  const matches = [];

  keywords.forEach(keyword => {
    let index = words.findIndex((w, i) => w.includes(keyword));
    while (index !== -1 && index < words.length) {
      const start = Math.max(0, index - pad);
      const end = Math.min(words.length, index + 1 + pad);
      matches.push({
        keyword,
        startIndex: start,
        endIndex: end,
        snippet: words.slice(start, end).join(' ')
      });
      index = words.findIndex((w, i) => i > index && w.includes(keyword));
      if (index === -1) break;
    }
  });

  matches.sort((a, b) => a.startIndex - b.startIndex);
  return matches;
}

module.exports = { KeywordsrTest };
