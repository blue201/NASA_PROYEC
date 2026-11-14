const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const window={},classes=new Set(),elements={};
const document={addEventListener(){},body:{classList:{toggle(k,on){if(on)classes.add(k);else classes.delete(k);}}},getElementById:id=>elements[id]||(elements[id]={})};
const context={window,document};vm.createContext(context);
for(const file of ['world/surface-explorer.js','cinematic/immersion-view.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context);
const {heightAt,constrain}=window.SurfaceNavigation;
for(const key of ['earth','mars','moon','venus','mercury']){
 assert.equal(heightAt(100,200,key),heightAt(100,200,key));assert.ok(Number.isFinite(heightAt(-6000,2000,key)));
 const ground=heightAt(0,0,key),hit=constrain({x:0,y:ground-100,z:0},key);
 assert.equal(hit.contact,true);assert.equal(hit.y,ground+5);
 const high=constrain({x:8000,y:1e6,z:-8000},key);assert.ok(high.x<=7200&&high.z>=-7200);assert.ok(high.y<=(key==='earth'?Math.max(0,heightAt(high.x,high.z,key)):heightAt(high.x,high.z,key))+2400);
}
const engine={currentCameraMode:'cockpit',shipSpeed:40,ship:{mesh:{visible:true}}};
window.ImmersionView.sync(engine);assert.equal(classes.has('cockpit-view'),true);assert.equal(engine.ship.mesh.visible,false);assert.match(elements['cockpit-speed'].textContent,/40 km/);
engine.planetKey='mars';window.ImmersionView.sync(engine);assert.match(elements['cockpit-speed'].textContent,/m\/s/);
engine.cinemaShot={};window.ImmersionView.sync(engine);assert.equal(classes.has('cockpit-view'),false);assert.equal(engine.ship.mesh.visible,true);
delete engine.cinemaShot;engine.currentCameraMode='chase';window.ImmersionView.sync(engine);assert.equal(engine.ship.mesh.visible,true);
console.log('PASS: deterministic surface terrain, ground protection, altitude/area bounds, cockpit model hiding, exterior restoration and surface units.');
