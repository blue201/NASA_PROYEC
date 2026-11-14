const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
let refills=0,panel;
const parts={strong:{},output:{},button:{}};
const document={createElement(){return panel={querySelector:k=>parts[k]};},body:{append(){}}};
const window={PlanetNavigation:{pose:()=>({center:new THREE.Vector3(),r:30})},ExpeditionSystems:{state:{resupply(){refills++;}}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/flight/rescue-fleet.js'),'utf8'),{window,document,THREE});
const e={isActive:true,scene:new THREE.Scene(),colliders:[{planetKey:'earth'}],shipGroup:new THREE.Group(),camera:new THREE.PerspectiveCamera(),shipSpeed:0,keys:{}};
const api=window.RescueFleet;api.update(e,.1);assert.equal(e.scene.children.length,2);assert.equal(parts.button.disabled,true);parts.button.onclick();assert.equal(refills,0);
const port=e.scene.children[1].position;e.shipGroup.position.copy(port);e.shipSpeed=20;api.update(e,.1);parts.button.onclick();assert.equal(refills,0);
e.shipSpeed=0;api.update(e,.1);assert.equal(parts.button.disabled,false);parts.button.onclick();assert.equal(refills,0);const active=e.serviceDock;parts.button.onclick();assert.equal(e.serviceDock,active);for(let i=0;i<61;i++)api.animateDock(e,.1);assert.equal(refills,1);assert.equal(e.serviceDock,null);assert(e.colliders.some(c=>c.service));
api.update(e,.1);assert.equal(e.scene.children.length,2);assert.match(parts.output.textContent,/100%/);e.isActive=false;parts.button.onclick();assert.equal(refills,1);
console.log('PASS: persistent rescue vessel, range and speed restrictions, six-second animated refill, physical structure colliders, cooldown and inactive-scene protection.');

vm.runInNewContext(fs.readFileSync('js/flight/navigation-physics.js','utf8'),{window});e.scene.updateMatrixWorld(true);const hull=e.colliders.find(c=>c.service);const center=hull.mesh.getWorldPosition(new THREE.Vector3());const hit=window.NavigationPhysics.sweep(center.clone().add(new THREE.Vector3(0,0,100)),center,[{...hull,center}],7);assert(hit.hit?.service);assert(new THREE.Vector3(hit.position.x,hit.position.y,hit.position.z).distanceTo(center)>=hull.radius);console.log('PASS: swept ship collision stops before carrier hull.');
