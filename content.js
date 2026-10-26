(async () => {
  // ---- settings ----
  const HOURS = 24;        // what counts as "today"
  const MIN_POINTS = 5;    // hide stories below this (most new posts sit at 1-3 points)
  const CACHE_MIN = 5;     // reuse results for this many minutes on reload

  const url = new URL(location.href);
  if (url.searchParams.has('orig')) return;                 // ?orig=1 shows HN's normal order
  if ((url.searchParams.get('p') || '1') !== '1') return;   // only act on page 1

  const firstRow = document.querySelector('tr.athing');
  if (!firstRow) return;
  const tbody = firstRow.parentElement;

  const banner = document.createElement('tr');
  banner.innerHTML = '<td colspan="3" style="padding:6px 0;color:#828282;font-size:9pt"></td>';
  const note = banner.firstChild;
  tbody.prepend(banner);
  note.textContent = 'Loading last ' + HOURS + 'h by points…';

  let hits = null;
  const cacheKey = 'hnPointsTodayV2';
  try {
    const c = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (c && Date.now() - c.at < CACHE_MIN * 60000) hits = c.hits;
  } catch (e) {}

  if (!hits) {
    const res = await chrome.runtime.sendMessage({ type: 'hnToday', hours: HOURS }).catch(e => ({ ok: false, error: String(e) }));
    if (!res || !res.ok) {
      note.innerHTML = 'Could not load stories (' + esc(res && res.error) + '). Showing HN\'s normal order.';
      return;
    }
    hits = res.hits;
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), hits })); } catch (e) {}
  }

  const list = hits.filter(h => h.points >= MIN_POINTS).sort((a, b) => b.points - a.points);

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function ago(ts) {
    const m = Math.max(1, Math.round((Date.now() / 1000 - ts) / 60));
    if (m < 60) return m + (m === 1 ? ' minute' : ' minutes') + ' ago';
    const h = Math.round(m / 60);
    return h + (h === 1 ? ' hour' : ' hours') + ' ago';
  }
  function row(h, i) {
    const item = 'item?id=' + h.id;
    const link = h.url || item;
    let site = '';
    if (h.url) {
      try {
        const host = new URL(h.url).hostname.replace(/^www\./, '');
        site = ' <span class="sitebit comhead">(<a href="from?site=' + esc(host) + '"><span class="sitestr">' + esc(host) + '</span></a>)</span>';
      } catch (e) {}
    }
    const com = h.comments ? h.comments + '&nbsp;comment' + (h.comments === 1 ? '' : 's') : 'discuss';
    return '<tr class="athing submission" id="' + esc(h.id) + '">' +
        '<td align="right" valign="top" class="title"><span class="rank">' + (i + 1) + '.</span></td>' +
        '<td valign="top" class="votelinks"></td>' +
        '<td class="title"><span class="titleline"><a href="' + esc(link) + '">' + esc(h.title) + '</a>' + site + '</span></td></tr>' +
      '<tr><td colspan="2"></td><td class="subtext"><span class="subline">' +
        '<span class="score">' + h.points + ' points</span> by <a href="user?id=' + esc(h.author) + '" class="hnuser">' + esc(h.author) + '</a> ' +
        '<span class="age"><a href="' + item + '">' + ago(h.ts) + '</a></span> | ' +
        '<a href="' + item + '">' + com + '</a></span></td></tr>' +
      '<tr class="spacer" style="height:5px"></tr>';
  }

  [...tbody.children].forEach(tr => { if (tr !== banner) tr.remove(); });
  const tmp = document.createElement('tbody');
  tmp.innerHTML = list.map(row).join('');
  [...tmp.children].forEach(tr => tbody.appendChild(tr));

  note.innerHTML = 'Last ' + HOURS + 'h by points · ' + list.length + ' stories with ' + MIN_POINTS +
                   '+ points (of ' + hits.length + ' posted) · <a href="/news?orig=1">original order</a>';
})();