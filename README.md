# HN: Today by Points

A small Chrome extension that replaces the Hacker News front page with every story posted in the last 24 hours, ranked by points.

Stories come from the [HN Search API](https://hn.algolia.com/api). Stories under 5 points are hidden. Results are cached for 5 minutes.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Go to https://news.ycombinator.com/

## Usage

- Only page 1 of the front page is changed.
- Add `?orig=1` to the URL (or click **original order** in the banner) to see HN's normal ranking.
- To change the time window, the minimum points or the cache time, edit the settings at the top of `content.js`.
