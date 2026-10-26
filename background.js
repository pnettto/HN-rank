// Fetches from the HN Search API here, because HN's page security policy blocks it in the page.
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type !== 'hnToday') return;
  const since = Math.floor(Date.now() / 1000) - msg.hours * 3600;
  const url = 'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=1000' +
              '&numericFilters=created_at_i%3E' + since;
  fetch(url)
    .then(r => r.json())
    .then(d => reply({ ok: true, hits: d.hits.map(h => ({
      id: h.objectID, title: h.title, url: h.url, author: h.author,
      points: h.points || 0, comments: h.num_comments || 0, ts: h.created_at_i
    })) }))
    .catch(e => reply({ ok: false, error: String(e) }));
  return true; // keep the channel open for the async reply
});