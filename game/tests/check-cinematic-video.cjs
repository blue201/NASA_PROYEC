const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const THREE=require('../assets/vendor/three-r128.min.js');let renders=0,disposed=0;
THREE.WebGLRenderer=class{constructor(){this.domElement={remove(){}};}setPixelRatio(){}setSize(x,y){this.size={x,y};}getSize(){return this.size;}render(){renders++;}dispose(){disposed++;}};
const elements=new Map();function element(id){if(!elements.has(id))elements.set(id,{replaceChildren(){},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}
const document={hidden:false,getElementById:element,addEventListener(){},body:{classList:{add(){},remove(){}}}};
const scores=[];const window={innerWidth:1280,innerHeight:720,spaceAudio:{_scoreMode:'ambient',setScoreMode:m=>scores.push(m)},ArwingShip:class{constructor(){this.mesh=new THREE.Group();}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/cinematic/sofia-tragedy.js'),'utf8'),{window,document,THREE});
const s=window.sofiaTragedy;s.play({scene:'flight'});assert(!s.isActive);s.play({defeat:true});assert(s.isActive);assert.equal(s.videoMode,false);s.update(0);s.update(50);assert(s.group.position.z<0);assert(s.group.rotation.z>0);assert(renders>0);
const z=s.group.position.z;document.hidden=true;s.update(100);assert.equal(s.group.position.z,z);document.hidden=false;s.update(150);assert(s.group.position.z<z);
s.stop();assert(!s.isActive);assert.equal(disposed,1);assert.equal(scores.at(-1),'ambient');s.stop();assert.equal(disposed,1);
assert(!fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').includes('<video id="tragedy-video"'));
console.log('PASS: real Three.js drift scene advances position/rotation, pauses when hidden, disposes graphics, restores score, ignores old movie requests and contains no video player.');
