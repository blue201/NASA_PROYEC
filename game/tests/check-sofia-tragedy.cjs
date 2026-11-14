const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const els={};const document={addEventListener(){},getElementById:id=>els[id]??={textContent:''},body:{classList:{remove(){}}}};
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/cinematic/sofia-tragedy.js'),'utf8'),{window,document});
window.sofiaTragedy.play({defeat:true});assert.equal(window.sofiaTragedy.isActive,false);assert.match(els['collision-status'].textContent,/reintentar/);
const main=fs.readFileSync(path.join(__dirname,'../js/core/main.js'),'utf8');assert(!main.includes('await window.missionPreparation.open('));
console.log('PASS: failed 3D initialization returns to gameplay; mission launch no longer waits for hangar or camera confirmation.');
