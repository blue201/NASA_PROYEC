const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveAsset} = require('../serve.cjs');
const root = path.join(__dirname,'..');
for (const url of ['/','/index.html','/js/world/world-visuals.js','/assets/milky-way-eso.jpg','/css/visual-refresh.css?v=2']) {
  assert.ok(resolveAsset(root,url),url);
}
for (const url of ['/../secret.txt','/%2e%2e/secret.txt','/js/%2e%2e/main.js','/js%5cmain.js','/C:/secret.txt','/assets/foo.jpg:secret','/assets/%00.jpg','/source/game.cpp','/bin/game.exe','/serve.ps1','/js//main.js','/assets/test.ps1','/%ZZ','//index.html']) {
  assert.equal(resolveAsset(root,url),null,url);
}
console.log('PASS: Node static-server asset allowlist, traversal and malformed URL rejection.');
