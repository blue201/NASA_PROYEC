const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
const events={},s={operational:true,hull:100,oxygen:100,fuel:100,water:100,food:100,repair:()=>false};let landed=0;
const e={isActive:true,keys:{},cameraYaw:0,cameraPitch:0,shipGroup:new THREE.Group(),landingPad:{position:new THREE.Vector3(0,0,-400)},canLandAtBase(){return this.shipGroup.position.distanceTo(new THREE.Vector3(0,80,-400))<90;},authorizeLanding(){landed++;}};e.shipGroup.position.set(0,80,0);
const window={surfaceExplorer:e,ExpeditionSystems:{state:s},SurfaceNavigation:{heightAt:()=>0},addEventListener:(name,fn)=>events[name]=fn};const context={window};vm.createContext(context);vm.runInContext(fs.readFileSync('js/jarvis/jarvis-copilot.js','utf8'),context);const c=window.JarvisCopilot;
assert.equal(c.command('viaja a la Luna'),null);assert.match(c.command('cómo reparar'),/10 repuestos/);assert.match(c.command('llévame a la base'),/guiar/);assert.equal(c.active,true);c.update(e,.1);assert.equal(e.keys.KeyW,true);assert.equal(e.shipGroup.position.z,0,'guidance must not teleport');
for(let i=0;i<300&&c.active;i++){c.update(e,.1);if(e.keys.KeyW)e.shipGroup.position.z-=3.5;}
assert.equal(landed,1);assert.equal(c.active,false);e.shipGroup.position.set(0,80,0);c.navigate(e.landingPad.position);events.keydown({code:'KeyW'});assert.equal(c.active,false);s.fuel=5;assert.match(c.command('diagnostico'),/Combustible bajo/);s.operational=false;assert.equal(c.navigate(e.landingPad.position),false);
console.log('PASS: JARVIS guides with normal input, never teleports, initiates landing only near base, yields to manual control and diagnoses low reserves.');

// Integrate the production propulsion model on flat terrain from a low, misaligned start.
vm.runInContext(fs.readFileSync('js/flight/navigation-physics.js','utf8'),context);
s.operational=true;s.fuel=100;e.shipGroup.position.set(200,20,0);e.cameraYaw=1.5;let velocity={x:0,y:0,z:0};const before=landed;c.command('llevame a la base');
for(let i=0;i<3600&&c.active;i++){const dt=1/60;c.update(e,dt);const k=e.keys,f={x:-Math.sin(e.cameraYaw)*(k.KeyW?95:0),y:(k.KeyQ?80:0)-(k.KeyE?80:0)-2.943,z:-Math.cos(e.cameraYaw)*(k.KeyW?95:0)};velocity=window.NavigationPhysics.forceStep(velocity,f,dt,{drag:.65,maxSpeed:35,brake:!!k.Space});e.shipGroup.position.addScaledVector(new THREE.Vector3(velocity.x,velocity.y,velocity.z),dt);}
assert.equal(landed,before+1,'normal propulsion must reach and authorize the base');
console.log('PASS: copilot reaches the base with production force integration from low altitude and a misaligned heading.');
