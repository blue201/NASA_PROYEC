const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
const elements={},document={getElementById:id=>elements[id]||(elements[id]={}),querySelector:()=>null},window={};
for(const file of ['world/surface-explorer.js','world/expedition-systems.js'])vm.runInNewContext(fs.readFileSync('js/'+file,'utf8'),{window,document,THREE});
const e={scene:new THREE.Scene(),shipGroup:new THREE.Group(),colliders:[]};
for(const [key,z,r] of [['earth',100,20],['moon',30,8]]){const mesh=new THREE.Mesh();mesh.position.z=z;e.scene.add(mesh);e.colliders.push({planetKey:key,mesh,radius:r});}e.scene.updateMatrixWorld(true);
assert.equal(window.ExpeditionSystems.nearest(e).planetKey,'moon');e.navigationTarget='earth';assert.equal(window.ExpeditionSystems.nearest(e).planetKey,'earth');e.navigationTarget='mars';assert.equal(window.ExpeditionSystems.nearest(e).planetKey,'moon');
for(const key of ['earth','moon','mercury','uranus']){const s=Object.create(window.PlanetSurfaceExplorer.prototype);s.scene=new THREE.Scene();s.planetKey=key;s.beginLanding();const p=s.landingPad.position;for(let j=0;j<8;j++){const h=window.SurfaceNavigation.heightAt(p.x+Math.cos(j*Math.PI/4)*58,p.z+Math.sin(j*Math.PI/4)*58,key);assert(p.y-12>=h-.001);if(key==='earth')assert(h>=8,'base must be on land');}}
console.log('PASS: selected planet takes priority, missing target falls back, landing foundations clear dry terrain.');
