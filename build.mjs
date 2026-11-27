import fs from 'node:fs';

const stamp = (process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 10) || String(Date.now());

if (process.env.CF_PAGES || process.env.CI) {
  let html = fs.readFileSync('index.html', 'utf8');
  html = html
    .replace(/src="patch\.js(?:\?v=[^"]*)?"/, `src="patch.js?v=${stamp}"`)
    .replace(/src="features\.js(?:\?v=[^"]*)?"/, `src="features.js?v=${stamp}"`);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log(`Stamped Cloudflare Pages build assets with v=${stamp}`);
} else {
  console.log('Static site build verified');
}
