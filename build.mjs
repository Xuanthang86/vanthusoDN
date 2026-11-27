import fs from 'node:fs';
import crypto from 'node:crypto';

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);

const patchHash = sha(fs.readFileSync('patch.js'));
const featuresHash = sha(fs.readFileSync('features.js'));

let html = fs.readFileSync('index.html', 'utf8');
html = html
  .replace(/src="patch\.js(?:\?v=[^"]*)?"/, `src="patch.js?v=${patchHash}"`)
  .replace(/src="features\.js(?:\?v=[^"]*)?"/, `src="features.js?v=${featuresHash}"`);

const htmlForHash = html.replace(/<meta name="app-version" content="[^"]*">/, '<meta name="app-version" content="">');
const appVersion = sha(htmlForHash + ':' + patchHash + ':' + featuresHash);

html = html.replace(
  /<meta name="app-version" content="[^"]*">/,
  `<meta name="app-version" content="${appVersion}">`
);

const prevHtml = fs.readFileSync('index.html', 'utf8');
if (html !== prevHtml) {
  fs.writeFileSync('index.html', html, 'utf8');
}

const versionPayload = JSON.stringify({ v: appVersion }) + '\n';
const prevVersion = fs.existsSync('version.json') ? fs.readFileSync('version.json', 'utf8') : '';
if (versionPayload !== prevVersion) {
  fs.writeFileSync('version.json', versionPayload, 'utf8');
}

console.log(`Build stamped: v=${appVersion} (patch=${patchHash}, features=${featuresHash})`);
