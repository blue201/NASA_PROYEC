const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert(!html.includes('src="js/cinematic-library.js"'));assert(!html.includes('data-cinema-film='));assert(!html.includes('<video id="tragedy-video"'));assert(html.includes('id="drift-canvas"'));
console.log('PASS: obsolete film gallery and video playback disconnected; native 3D animation container present.');
