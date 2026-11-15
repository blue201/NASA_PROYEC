const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
const window={addEventListener(){}};
vm.runInNewContext(fs.readFileSync('js/audio/fx-audio.js','utf8'),{window,setInterval(){},setTimeout(){},performance:{now:()=>100},document:{hidden:false,querySelector:()=>null}});
vm.runInNewContext(fs.readFileSync('js/audio/entry-fx.js','utf8'),{window,THREE,document:{body:{append(){}},getElementById:()=>null,createElement:()=>({setAttribute(){},querySelector:()=>({style:{}}),querySelectorAll:()=>[]})}});
vm.runInNewContext(fs.readFileSync('js/flight/ship-controller.js','utf8'),{window,THREE});

// 1. EntryFX profile & scene lifecycle
assert(window.EntryFX.profile(0.3,false,true).heat>0.8,'entry heat peaks near t=0.3 on clouded worlds');
assert.equal(window.EntryFX.profile(0.3,false,false).heat,0,'no atmospheric plasma heat on airless worlds');
assert(window.EntryFX.profile(0.8,false,false).retro>0,'airless descent fires retro-thruster profile');
const engine={scene:new THREE.Scene(),shipGroup:new THREE.Group(),camera:new THREE.PerspectiveCamera(60,1.7,0.1,5000)};
for(let i=0;i<=20;i++)window.EntryFX.update(engine,i/20,1/60,{departure:false,clouded:true});
assert(engine.shipGroup.children.some(c=>c.name==='Efectos de entrada atmosférica'),'entry fx attached');
const entryEffects=engine.shipGroup.children.find(c=>c.name==='Efectos de entrada atmosférica');
assert(!entryEffects.children.some(c=>c.isPointLight),'entry effects do not introduce a light into every world material');
assert.equal(entryEffects.children.find(c=>c.isLineSegments).geometry.attributes.position.count,48,'entry streaks have a bounded vertex budget');
assert.equal(entryEffects.children.find(c=>c.isPoints).geometry.attributes.position.count,48,'embers have a bounded vertex budget');
window.EntryFX.clear(engine);
assert(!engine.shipGroup.children.some(c=>c.name==='Efectos de entrada atmosférica'),'entry fx cleaned up');
assert.equal(engine.camera.fov,60,'camera FOV restored');

// 2. FxAudio layer clamping
window.FxAudio.set('wind',2.5,0.8);
assert.equal(window.FxAudio.levels.wind.level,1);
window.FxAudio.set('spray',-1,0.2);
assert.equal(window.FxAudio.levels.spray.level,0);

// 3. ArwingShip articulated control surfaces, airbrakes and landing gear
const ship=new window.ArwingShip();
assert(ship.controlSurfaces,'controlSurfaces initialized');
assert.equal(ship.controlSurfaces.gears.length,3,'tricycle landing gear');
for(let i=0;i<30;i++)ship.update(1/30,140,{roll:1,pitch:-0.5,brake:true,boost:true,gear:true,rcs:true});
assert(ship.controlSurfaces.gearDeploy>0.85,'landing gear deploys smoothly');
assert(ship.controlSurfaces.gears.every(g=>g.visible),'gears visible when deployed');
assert(Math.abs(ship.controlSurfaces.ailerons[0].group.rotation.x)>0.1,'ailerons deflect');
assert(ship.controlSurfaces.airbrakes[0].group.rotation.x>0.4,'airbrakes open');

console.log('PASS: EntryFX plasma/retro profiles and cleanup, FxAudio bounds, and articulated ship surfaces/gear.');

